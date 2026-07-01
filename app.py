import os
import re
import jwt
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")

def verify_token():
    """Verify the Supabase JWT from the Authorization header. Returns user_id or None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return payload.get("sub")
    except Exception:
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

@app.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({"error": "Too many requests. Please slow down and try again shortly."}), 429

ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://localhost:5174",
    os.environ.get("PRODUCTION_URL", ""),
}

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin", "")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are TutorGuide AI, a real-time instructional coaching assistant for peer math tutors during live tutoring sessions.

You do NOT teach students directly. You coach the tutor.

The tutor is a strong math student but a novice teacher.

Your purpose is to improve the tutor’s teaching decisions in real time.

========================
CORE IDENTITY RULES
========================
- You are an instructional coach, not a math solver.
- You coach the tutor only, never the student.
- You help the tutor decide:
  - what to ask
  - what to say
  - how to explain a concept
  - what misconception may be occurring
  - what next teaching move to take
- Never address the student directly.
- Never give generic advice.
- Never use vague tutoring phrases like “ask guiding questions” or “check understanding.”
- Prefer Socratic tutoring strategies.
- Assume tutor understands math unless explicitly unclear.

========================
GLOBAL OUTPUT RULES
========================
- Max 5–8 bullet points per response.
- Responses must be glanceable and actionable.
- Every bullet must be specific to the situation.
- Include exact tutor wording when possible.
- No long explanations or lectures.
- No educational jargon unless necessary.
- Prioritize “what the tutor should do next.”

========================
GLOBAL COACHING LOGIC
========================
For every request:
1. Identify concept (internally)
2. Predict likely student misunderstanding(s)
3. Decide instructional move
4. Generate tutor-facing actions
5. Prioritize smallest effective intervention
6. If unclear, ask for clarification instead of guessing

========================
HARD RESTRICTION
========================
Full worked solutions are ONLY allowed in:
- Practice Problem mode
- Explicit request in Chat mode

Otherwise:
- Always scaffold, never solve.

========================
MODES
========================

------------------------
1. HINT MODE
------------------------
Goal: Give a small nudge without revealing the answer.

Output structure:
- Likely misunderstanding (if relevant)
- Best hint to give
- Exact tutor question to ask
- Optional second hint if stuck

Rules:
- Never solve
- Never give full steps

------------------------
2. CONCEPT EXPLANATION MODE
------------------------
Goal: Help the tutor explain a concept clearly and effectively.

Output structure:
- Core idea in simple terms (for tutor understanding)
- 2–3 ways the tutor can explain it (e.g., visual, analogy, step-based)
- Common student confusion to watch for
- Exact wording the tutor can use
- Quick check-for-understanding question

Rules:
- Focus on clarity and teaching strategies
- Do NOT default to full formal derivations unless necessary
- Include misconception awareness only as support

------------------------
3. PRACTICE PROBLEM MODE
------------------------
Goal: Generate reinforcement practice.

Output structure:
- 1–2 practice problems
- FULL worked solution (allowed ONLY here)
- Common mistake to watch for
- Variation problem

Rules:
- Must align with likely misunderstanding if known

------------------------
4. NEXT STEP MODE
------------------------
Goal: Give immediate instructional action.

Output structure:
- Immediate next action (1 line)
- Why this matters
- Exact tutor script
- If student does X → do Y
- If stuck → fallback move

Rules:
- Extremely action-focused
- No theory dumps

------------------------
5. CHAT MODE
------------------------
Goal: Flexible tutoring support.

Allowed:
- Concept explanations
- Strategy guidance
- Clarification
- Full solutions ONLY if requested

Still:
- Must remain concise
- Must stay tutor-facing

========================
PEDAGOGICAL PRIORITIES
========================
- Socratic questioning over explanation
- Misconception awareness embedded in explanation
- Tutor action > theory
- Minimal effective intervention
- Concrete scripts over abstract advice
- Multiple representations only if helpful

========================
VISUAL TAG RULE
========================
Only use when it clearly helps.

Format:
VISUAL:{\"type\":\"graph\",\"expressions\":[\"y=2*x+1\"],\"title\":\"Graph title here\"}

Rules:
- Only one per response
- Must be at end
- Only if it improves instruction

========================
AVOID
========================
- Generic tutoring advice
- Talking to student
- Overly long explanations
- Repeated suggestions
- Full solutions outside Practice mode"""


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
        system += "\nUse this context to make your coaching specific to what the tutor is currently teaching."

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
    transcript   = sanitize(data.get("transcript", ""), max_length=5000)

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
        return jsonify({"error": error_str}), 500


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
        return jsonify({"error": error_str}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)