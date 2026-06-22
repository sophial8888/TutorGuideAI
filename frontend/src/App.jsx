import { useState } from "react";

const SUBJECTS = ["Algebra", "Geometry", "Algebra II", "Pre-Calculus", "Calculus AB", "Calculus BC"];
const FEELINGS = ["Engaged", "Confused", "Frustrated", "Disengaged", "Breakthrough"];
const ACTIONS = ["Hint", "Practice Problem", "Misconception", "Next Step"];

export default function App() {
  const [subject, setSubject] = useState(null);
  const [feeling, setFeeling] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const reply = data.reply || "Error: " + (data.error || "something went wrong");
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Could not reach the server. Is app.py running?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.app}>
      <header style={s.topbar}>
        <h1 style={s.brand}>📘 TutorGuide AI</h1>
        <div style={s.topRight}>
          <span style={s.timer}>⏱ 00:00</span>
          <button style={s.stopBtn} disabled title="Coming in a later step">Stop session</button>
          <div style={s.avatar} title="Sign in — coming later">S</div>
        </div>
      </header>

      <div style={s.main}>
        <aside style={s.rail}>
          <Section title="Subject">
            {SUBJECTS.map((sub) => (
              <Pill key={sub} label={sub} active={subject === sub} onClick={() => setSubject(sub)} />
            ))}
          </Section>
          <Section title="Student is feeling…">
            {FEELINGS.map((f) => (
              <Pill key={f} label={f} active={feeling === f} onClick={() => setFeeling(f)} />
            ))}
          </Section>
          <p style={s.note}>These don't affect the AI yet — that's Step 2.</p>
        </aside>

        <section style={s.transcript}>
          <h2 style={s.panelTitle}>Transcript</h2>
          <div style={s.transcriptBody}>
            <p style={s.placeholder}>
              The live transcript of the tutoring session will appear here.
              We'll build this in a later step.
            </p>
          </div>
        </section>

        <section style={s.coach}>
          <h2 style={s.panelTitle}>AI Coach</h2>
          <div style={s.chatBox}>
            {messages.length === 0 && (
              <p style={s.placeholder}>Ask the coach anything — e.g. "How can I explain slope a different way?"</p>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ ...s.bubble, ...(m.role === "user" ? s.userBubble : s.aiBubble) }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={s.thinking}>Coach is thinking…</div>}
          </div>

          <div style={s.actions}>
            {ACTIONS.map((a) => (
              <button key={a} style={s.actionBtn} disabled title="Coming in a later step">{a}</button>
            ))}
          </div>

          <div style={s.inputRow}>
            <input
              style={s.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a coaching question…"
            />
            <button style={s.sendBtn} onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <h3 style={s.sectionTitle}>{title}</h3>
      <div style={s.pillWrap}>{children}</div>
    </div>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...s.pill, ...(active ? s.pillActive : {}) }}>
      {label}
    </button>
  );
}

const s = {
  app: { display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif", color: "#1f2937", background: "#f3f4f6" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "white", borderBottom: "1px solid #e5e7eb" },
  brand: { margin: 0, fontSize: 20 },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  timer: { fontVariantNumeric: "tabular-nums", color: "#6b7280" },
  stopBtn: { padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#4f46e5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  main: { display: "flex", flex: 1, gap: 12, padding: 12, overflow: "hidden" },
  rail: { width: 220, background: "white", borderRadius: 12, padding: 16, overflowY: "auto" },
  section: { marginBottom: 20 },
  sectionTitle: { margin: "0 0 8px", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280" },
  pillWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  pill: { padding: "6px 10px", borderRadius: 999, border: "1px solid #e5e7eb", background: "white", fontSize: 13, cursor: "pointer" },
  pillActive: { background: "#4f46e5", color: "white", borderColor: "#4f46e5" },
  note: { fontSize: 12, color: "#9ca3af", fontStyle: "italic" },
  transcript: { flex: 1, background: "white", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column" },
  panelTitle: { margin: "0 0 12px", fontSize: 16 },
  transcriptBody: { flex: 1, overflowY: "auto" },
  coach: { flex: 1.3, background: "white", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column" },
  chatBox: { flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", padding: 8, marginBottom: 10 },
  bubble: { maxWidth: "85%", padding: "10px 14px", borderRadius: 14, whiteSpace: "pre-wrap", lineHeight: 1.45 },
  userBubble: { alignSelf: "flex-end", background: "#4f46e5", color: "white" },
  aiBubble: { alignSelf: "flex-start", background: "#f3f4f6" },
  thinking: { color: "#9ca3af", fontStyle: "italic" },
  placeholder: { color: "#9ca3af", textAlign: "center", marginTop: 40 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  actionBtn: { padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#9ca3af", fontSize: 13, cursor: "not-allowed" },
  inputRow: { display: "flex", gap: 8 },
  input: { flex: 1, padding: 12, borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15 },
  sendBtn: { padding: "12px 18px", borderRadius: 8, border: "none", background: "#4f46e5", color: "white", fontSize: 15, cursor: "pointer" },
};