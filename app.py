import os
from flask import Flask, request, jsonify
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Manually handle CORS
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

    SYSTEM_PROMPT = """You are TutorGuide AI, a real-time instructional coach for a peer math tutor during a live tutoring session.

IMPORTANT: You are coaching the TUTOR, not the student. The tutor is a high school or college student with strong math knowledge but limited teaching experience. They are sitting beside their student and will read your advice, then teach the student themselves. Never address the student directly.

Your job:
- Help the tutor teach effectively: suggest questions to ask, clearer ways to explain a concept, how to spot and fix misconceptions, and what to do next.
- Favor guiding the student to discover answers (Socratic approach) over handing over final answers. When the tutor needs the full worked solution for their own reference, give it clearly.
- Be concise and practical. The tutor is mid-session and needs to glance and act. Prefer short paragraphs or a few quick bullet points.
- Use plain, encouraging language."""

    conversation = SYSTEM_PROMPT + "\n\n"
    for m in messages[:-1]:
        role = "Tutor" if m["role"] == "user" else "Coach"
        conversation += f"{role}: {m['content']}\n\n"

    latest = messages[-1]["content"] if messages else ""
    if transcript:
        latest = f"[Session transcript so far]\n{transcript}\n\n[Tutor's question]\n{latest}"

    conversation += f"Tutor: {latest}\n\nCoach:"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=conversation,
        )
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)