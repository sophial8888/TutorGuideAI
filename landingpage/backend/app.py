import sqlite3
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5174", "http://localhost:3000"])

DB_PATH = os.path.join(os.path.dirname(__file__), "signups.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS signups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                role TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
        conn.commit()


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    role = (data.get("role") or "tutor").strip()

    if not name or not email:
        return jsonify({"error": "Name and email are required."}), 400

    if "@" not in email:
        return jsonify({"error": "Please enter a valid email address."}), 400

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO signups (name, email, role) VALUES (?, ?, ?)",
                (name, email, role),
            )
            conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "This email is already registered."}), 409

    return jsonify({"message": "Welcome to TutorGuide AI!", "redirect": "http://localhost:5173/"}), 201


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=8000)
