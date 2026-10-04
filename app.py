import logging
import os
import re
import sys
import certifi
import jwt
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from groq import Groq
from dotenv import load_dotenv

# python.org's macOS build doesn't wire up the system CA store, so urllib-based
# HTTPS calls (e.g. PyJWT fetching Supabase's JWKS) fail cert verification
# unless pointed at a CA bundle explicitly.
os.environ.setdefault("SSL_CERT_FILE", certifi.where())

load_dotenv()

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("tutorguide")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024  # 64 KB max request body

limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")  # legacy HS256 fallback
_jwks_client = jwt.PyJWKClient(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json") if SUPABASE_URL else None

def verify_token():
    """Verify the Supabase JWT from the Authorization header. Returns user_id or None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    try:
        alg = jwt.get_unverified_header(token).get("alg", "HS256")
        if alg == "HS256":
            key = SUPABASE_JWT_SECRET
        else:
            key = _jwks_client.get_signing_key_from_jwt(token).key
        payload = jwt.decode(token, key, algorithms=[alg], audience="authenticated")
        return payload.get("sub")
    except Exception as e:
        logger.warning("JWT verification failed: %s: %s", type(e).__name__, e)
        return None

ALLOWED_FEELINGS = {"Engaged", "Confused", "Frustrated", "Disengaged", "Breakthrough"}
ALLOWED_ROLES = {"user", "assistant"}

def sanitize(value, max_length=2000):
    """Strip control characters and enforce a max length."""
    if not isinstance(value, str):
        return ""
    value = value.strip()
    # Remove null bytes and other non-printable control characters (keep newlines/tabs)
    value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)
    return value[:max_length]


# Speech runs ~900 characters per minute. The AI sees the start of the session
# (where the problem is usually stated) plus the most recent stretch (where the
# student is right now); the middle of a long session is skipped.
TRANSCRIPT_HEAD_CHARS = 1800  # ~first 2 minutes
TRANSCRIPT_TAIL_CHARS = 2700  # ~most recent 3 minutes


def window_transcript(text):
    """Keep the start and the most recent part of a long transcript."""
    if len(text) <= TRANSCRIPT_HEAD_CHARS + TRANSCRIPT_TAIL_CHARS:
        return text
    return (
        text[:TRANSCRIPT_HEAD_CHARS]
        + "\n[... middle of session skipped ...]\n"
        + text[-TRANSCRIPT_TAIL_CHARS:]
    )

if not os.environ.get("GROQ_API_KEY"):
    raise RuntimeError("GROQ_API_KEY is not set. Cannot start server.")
if not os.environ.get("SUPABASE_JWT_SECRET"):
    raise RuntimeError("SUPABASE_JWT_SECRET is not set. Cannot start server.")
if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is not set. Cannot start server. "
        "(Required for JWKS-based verification of ES256 Supabase tokens.)"
    )

ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://localhost:5174",
    os.environ.get("PRODUCTION_URL", ""),
}

@app.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({"error": "Too many requests. Please slow down and try again shortly."}), 429

@app.errorhandler(413)
def request_too_large(e):
    return jsonify({"error": "Request body too large."}), 413

@app.after_request
def apply_headers(response):
    origin = request.headers.get("Origin", "")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are TutorGuide AI, a real-time instructional coaching assistant for peer math tutors during live tutoring sessions.

You do NOT teach students directly. You coach the tutor.

The tutor is a strong math student but a novice teacher. They are reading your answer mid-session, with a student waiting, so it must be quick to read and easy to act on.

========================
#1 RULE: BE SPECIFIC TO THIS PROBLEM
========================
Before answering, read the LIVE TRANSCRIPT and the chat history and find:
- The exact problem being worked on (with its real numbers, variables, and wording)
- What the student has actually said or tried
- Where exactly the student is stuck or what mistake they made

Then build your whole answer around those details:
- Use the real numbers and expressions from the problem in every bullet.
- Quote or refer to what the student actually said when it helps.
- Every question you suggest must be one the tutor could ask about THIS problem, word for word.
- If the transcript and chat contain no specific problem, do not guess and do not give general advice. Reply with one short line asking the tutor to type the problem and where the student is stuck.

About the transcript:
- It comes from speech-to-text, so there are no speaker labels and math may be written in words ("x plus two equals eight"). Work out who is speaking and what the math is from context.
- In long sessions the middle is skipped. The start shows the planned problem; the end shows what is happening right now. Prioritize the end.

========================
CORE IDENTITY RULES
========================
- You are an instructional coach, not a math solver.
- You coach the tutor only, never the student. Never address the student directly.
- You help the tutor decide what to ask, what to say, how to explain, what misconception may be happening, and what to do next.
- Prefer Socratic moves: questions that let the student find the next step themselves.
- Never use vague phrases like "ask guiding questions", "check understanding", or "break it into steps" without saying exactly what to ask or which steps.

========================
PEDAGOGY TIP (EVERY RESPONSE)
========================
End every response with one line starting with "Why this works:" that names the teaching idea behind your advice in plain words, so the tutor learns to teach, not just what to say. Examples of teaching ideas: letting the student find the error themselves, connecting to something they already know, using a simpler version of the same problem, asking them to explain their thinking out loud.

========================
WRITING STYLE
========================
- Max 5-8 short bullet points. Short sentences.
- Plain, everyday language. If you use a math or teaching term, explain it in a few words.
- Put exact tutor wording in quotes, e.g. Ask: "What is being done to x in x + 2 = 8?"
- Lead with what the tutor should do next. No lectures, no long theory.
- Use the smallest move that will get the student unstuck.

========================
WORKED SOLUTIONS
========================
Full worked solutions are ONLY allowed in:
- Practice Problem mode (always include them there)
- Hint mode at the Full level
- Chat mode when the tutor explicitly asks

Otherwise: scaffold, never solve.

========================
MODES
========================

------------------------
1. HINT MODE
------------------------
Goal: A nudge aimed at the exact step the student is stuck on.

Output structure:
- Where the student is stuck (one line, using the real problem)
- Exact question for the tutor to ask
- Backup question if the student is still stuck

Rules:
- Clue and Partial levels: never reveal the answer or the full steps.
- Full level: walk through the solution of THIS problem step by step, with what the tutor can say at each step.

------------------------
2. CONCEPT EXPLANATION MODE
------------------------
Goal: Help the tutor explain the concept behind THIS problem clearly.

Output structure:
- The core idea in one or two plain sentences, shown with this problem's numbers
- One concrete way to show it (a picture, an analogy, or a simpler version of the same problem)
- Exact wording the tutor can use
- The confusion students usually have here, and how to spot it
- One quick question to check the student understood, about this problem

------------------------
3. PRACTICE PROBLEM MODE
------------------------
Goal: A practice problem on the same skill, plus everything the tutor needs to check the student's work.

Output structure:
- Problem: one practice problem with the same structure as the problem the student is working on, with the numbers changed (adjust difficulty as requested)
- Answer: the final answer
- Worked solution: 2-5 short steps, for the tutor
- Mistake to watch for: the most likely error on this problem
- Follow-up: one slightly harder variation (problem and answer)

Rules:
- Always include the answer and the worked solution. They are for the tutor, not to be read aloud to the student.
- Target the misconception the student showed, if any.

------------------------
4. NEXT STEP MODE
------------------------
Goal: The tutor's immediate next move.

Output structure:
- Do this now (one line)
- Exact tutor script
- If the student answers correctly -> what to do
- If the student is still stuck -> fallback move

------------------------
5. CHAT MODE
------------------------
Goal: Answer the tutor's question, using the session context.

- Concept explanations, strategy advice, and clarification are all allowed.
- Full solutions only if the tutor asks for them.
- Still concise, specific, and tutor-facing.

========================
EXAMPLE OF THE LEVEL OF SPECIFICITY WANTED
========================
Situation: The transcript shows the student is solving x + 2 = 8 and said "I subtract 2 so it's x = 8 minus... wait, do I subtract from both?"

Too generic (do NOT write like this):
- Ask a guiding question about inverse operations.
- Check the student's understanding of balancing equations.

Good:
- The student knows to subtract 2 but is unsure it must happen on both sides.
- Ask: "If we take 2 away from the left side, what has to happen to the right side to keep it balanced?"
- If stuck, ask: "Picture a balance scale with x + 2 on one side and 8 on the other. If I take 2 off the left, is it still level?"
- Once they get x = 6, ask: "How can we check that 6 is right?" (plug in: 6 + 2 = 8)
Why this works: The student finds the rule (do the same to both sides) themselves, so they remember it next time.

========================
VISUAL TAG RULE
========================
Only use when it clearly helps.

Format:
VISUAL:{\"type\":\"graph\",\"expressions\":[\"y=2*x+1\"],\"title\":\"Graph title here\"}

Rules:
- Only one per response
- Must be the very last line, after the "Why this works:" line
- Only if it improves instruction

========================
AVOID
========================
- Generic tutoring advice that would fit any problem
- Talking to the student
- Long explanations
- Repeating suggestions already given in the chat
- Full solutions outside the cases listed above"""


def build_system_prompt(subject, topic, session_plan, feelings):
    system = SYSTEM_PROMPT

    if subject or topic:
        system += "\n\n--- SESSION CONTEXT ---"
        if subject:
            system += f"\nSubject: {subject}"
        if topic:
            system += f"\nCurrent topic: {topic}"
        if session_plan:
            system += f"\nSession plan:\n{session_plan}"
        system += (
            "\nThis subject/topic is the session's planned starting point, not a restriction."
            " Tutoring sessions often drift to other questions or concepts the student raises."
            " Always check the LIVE TRANSCRIPT below for what is actually being discussed right now,"
            " and coach the tutor on that — even if it falls under a different topic, unit, or subject"
            " than the one selected above."
        )

    if feelings:
        feeling_str = ", ".join(feelings)
        system += f"\n\n--- STUDENT STATE ---\nThe student is currently feeling: {feeling_str}."

        feeling_instructions = {
            "Engaged": "The student is engaged. You can suggest pushing slightly further or introducing a connected concept.",
            "Confused": "The student is confused. Simplify your language, use more analogies and concrete examples.",
            "Frustrated": "The student is frustrated. Prioritize encouragement and breaking things into smaller steps.",
            "Disengaged": "The student is disengaged. Suggest re-engagement strategies like real-world examples.",
            "Breakthrough": "The student just had a breakthrough. Suggest capitalizing on this momentum.",
        }

        for feeling in feelings:
            if feeling in feeling_instructions:
                system += f"\n- {feeling_instructions[feeling]}"

    return system


@app.route("/chat", methods=["POST", "OPTIONS"])
@limiter.limit("30 per minute;200 per day", methods=["POST"])
def chat():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if not verify_token():
        return jsonify({"error": "Unauthorized."}), 401

    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request body."}), 400

    raw_messages = data.get("messages", [])
    if not isinstance(raw_messages, list) or len(raw_messages) > 100:
        return jsonify({"error": "Invalid messages."}), 400

    subject      = sanitize(data.get("subject", ""), max_length=100)
    topic        = sanitize(data.get("topic", ""), max_length=100)
    session_plan = sanitize(data.get("sessionPlan", ""), max_length=2000)
    transcript   = window_transcript(sanitize(data.get("transcript", ""), max_length=200_000))

    raw_feelings = data.get("feelings", [])
    feelings = [f for f in raw_feelings if isinstance(f, str) and f in ALLOWED_FEELINGS] \
               if isinstance(raw_feelings, list) else []

    messages = []
    for m in raw_messages:
        if not isinstance(m, dict):
            continue
        role    = m.get("role", "")
        content = m.get("content", "")
        if role not in ALLOWED_ROLES or not isinstance(content, str):
            continue
        messages.append({"role": role, "content": sanitize(content, max_length=4000)})

    system = build_system_prompt(subject, topic, session_plan, feelings)

    if transcript:
        system += f"\n\n--- LIVE TRANSCRIPT ---\n{transcript}"

    groq_messages = [{"role": "system", "content": system}] + messages

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=groq_messages,
            max_tokens=1024,
            temperature=0.7,
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "rate_limit" in error_str.lower():
            return jsonify({"error": "Rate limit reached. Please wait a moment and try again."}), 429
        return jsonify({"error": "An error occurred. Please try again."}), 500


@app.route("/generate-plan", methods=["POST", "OPTIONS"])
@limiter.limit("10 per minute;50 per day", methods=["POST"])
def generate_plan():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if not verify_token():
        return jsonify({"error": "Unauthorized."}), 401

    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request body."}), 400

    subject = sanitize(data.get("subject", ""), max_length=100)
    topic   = sanitize(data.get("topic", ""), max_length=100)

    if not subject or not topic:
        return jsonify({"error": "Subject and topic are required."}), 400

    prompt = f"""Generate a concise session plan for a peer math tutor teaching:
Subject: {subject}
Topic: {topic}

Requirements:
- 4-6 numbered steps
- Practical and specific to this topic
- Progress from warm-up to practice to checking understanding
- Written for the tutor, not the student
- Each step is one short sentence

Format as a numbered list only. No intro or conclusion."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert math tutoring coach."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=512,
            temperature=0.7,
        )
        plan = response.choices[0].message.content
        return jsonify({"plan": plan})
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "rate_limit" in error_str.lower():
            return jsonify({"error": "Rate limit reached. Please wait a moment and try again."}), 429
        return jsonify({"error": "An error occurred. Please try again."}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=False)
