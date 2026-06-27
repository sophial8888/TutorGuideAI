import os
from flask import Flask, request, jsonify
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response

@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    data = request.get_json()
    messages = data.get("messages", [])
    transcript = data.get("transcript", "").strip()

    # --- Context from the left rail ---
    # These are sent from the frontend whenever the tutor
    # selects a subject, topic, session plan, or feeling pills
    subject = data.get("subject", "")
    topic = data.get("topic", "")
    session_plan = data.get("sessionPlan", "")
    feelings = data.get("feelings", [])  # list of active feelings

    # --- Base system prompt ---
    system = """You are TutorGuide AI, a real-time instructional coach for a peer math tutor during a live tutoring session.

IMPORTANT: You are coaching the TUTOR, not the student. The tutor is a high school or college student with strong math knowledge but limited teaching experience. They are sitting beside their student and will read your advice, then teach the student themselves. Never address the student directly.

Your job:
- Help the tutor teach effectively: suggest questions to ask, clearer ways to explain a concept, how to spot and fix misconceptions, and what to do next.
- Favor guiding the student to discover answers (Socratic approach) over handing over final answers. When the tutor needs the full worked solution for their own reference, give it clearly.
- Be concise and practical. The tutor is mid-session and needs to glance and act.
- Use plain, encouraging language."""

    # --- Inject subject + topic context if selected ---
    if subject or topic:
        system += "\n\n--- SESSION CONTEXT ---"
        if subject:
            system += f"\nSubject: {subject}"
        if topic:
            system += f"\nCurrent topic: {topic}"
        if session_plan:
            system += f"\nSession plan:\n{session_plan}"
        system += "\nUse this context to make your coaching specific to what the tutor is currently teaching."

    # --- Inject feeling context if any pills are active ---
    # Each feeling shifts the AI's tone and coaching approach
    if feelings:
        feeling_str = ", ".join(feelings)
        system += f"\n\n--- STUDENT STATE ---\nThe tutor has indicated the student is currently feeling: {feeling_str}."

        # Add specific instructions for each active feeling
        feeling_instructions = {
            "Engaged": "The student is engaged and following along. You can suggest pushing slightly further or introducing a connected concept.",
            "Confused": "The student is confused. Simplify your language, slow down, use more analogies and concrete examples. Suggest the tutor check for understanding before moving on.",
            "Frustrated": "The student is frustrated. Prioritize encouragement strategies. Suggest breaking the problem into smaller steps and celebrating small wins. Avoid overwhelming them with too much at once.",
            "Disengaged": "The student is disengaged. Suggest ways to re-connect them — real-world examples, asking their opinion, or switching to a more interactive approach.",
            "Breakthrough": "The student just had a breakthrough moment. Suggest the tutor capitalize on this momentum — ask a slightly harder follow-up, connect to the bigger picture, or let the student explain it back.",
        }

        for feeling in feelings:
            if feeling in feeling_instructions:
                system += f"\n- {feeling_instructions[feeling]}"

    # --- Inject transcript if available ---
    if transcript:
        system += f"\n\n--- LIVE TRANSCRIPT ---\n{transcript}"

    # --- Visual generation instructions ---
    system += """

GENERATING MATH VISUALS:
When a visual would genuinely help the tutor explain a concept, include a special tag in your response.
Use this exact format on its own line:
VISUAL:{"type":"graph","expressions":["y=2*x+1"],"title":"Graph title here"}

Rules for visuals:
- Only include a VISUAL tag when it genuinely adds value
- Use Desmos expression syntax: * for multiply, ^ for exponent, sqrt(x) for square root
- Put the VISUAL tag at the END of your text response, on its own line
- Never include more than one VISUAL tag per response
- Do NOT include a VISUAL tag for every response"""

    # --- Build conversation history ---
    conversation = system + "\n\n"
    for m in messages[:-1]:
        role = "Tutor" if m["role"] == "user" else "Coach"
        conversation += f"{role}: {m['content']}\n\n"

    latest = messages[-1]["content"] if messages else ""
    conversation += f"Tutor: {latest}\n\nCoach:"

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=conversation,
        )
        return jsonify({"reply": response.text})
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            return jsonify({"error": "Quota reached. Please wait a minute and try again."}), 429
        return jsonify({"error": error_str}), 500

@app.route("/generate-plan", methods=["POST", "OPTIONS"])
def generate_plan():
    """
    Separate endpoint just for generating session plans.
    Called when the tutor clicks 'Generate Plan' in the left rail.
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    data = request.get_json()
    subject = data.get("subject", "")
    topic = data.get("topic", "")

    prompt = f"""You are an expert math tutoring coach. Generate a concise session plan for a peer tutor who is about to teach the following:

Subject: {subject}
Topic: {topic}

The session plan should:
- Have 4-6 numbered steps
- Be practical and specific to this topic
- Progress from warm-up/review to practice to checking understanding
- Be written for the tutor (not the student)
- Be brief — each step is one short sentence

Format it as a numbered list only. No intro sentence, no conclusion."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return jsonify({"plan": response.text})
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            return jsonify({"error": "Quota reached. Please wait a minute and try again."}), 429
        return jsonify({"error": error_str}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)