import { useState, useEffect, useRef } from "react";

// ============================================================
// CURRICULUM DATA
// ============================================================
const CURRICULUM = {
  "Algebra": {
    "Unit 1 — Linear Functions": ["Slope & linear equations", "Graphing lines", "Writing equations from points", "Parallel & perpendicular lines"],
    "Unit 2 — Systems": ["Substitution method", "Elimination method", "Graphing systems", "Word problems"],
    "Unit 3 — Quadratics": ["Factoring", "Quadratic formula", "Completing the square", "Graphing parabolas"],
    "Unit 4 — Inequalities": ["Solving inequalities", "Graphing inequalities", "Compound inequalities"],
  },
  "Geometry": {
    "Unit 1 — Foundations": ["Points, lines & planes", "Angle relationships", "Proofs & logic"],
    "Unit 2 — Triangles": ["Triangle congruence", "Triangle similarity", "Pythagorean theorem", "Special right triangles"],
    "Unit 3 — Circles": ["Circle theorems", "Arc length & sector area", "Tangent lines"],
    "Unit 4 — Area & Volume": ["Polygon area", "Surface area", "Volume of solids"],
  },
  "Algebra II": {
    "Unit 1 — Functions": ["Function notation", "Domain & range", "Transformations", "Inverse functions"],
    "Unit 2 — Polynomials": ["Polynomial division", "Remainder theorem", "Rational roots"],
    "Unit 3 — Exponentials & Logs": ["Exponential growth & decay", "Logarithm properties", "Solving log equations"],
    "Unit 4 — Complex Numbers": ["Imaginary numbers", "Operations with complex numbers"],
  },
  "Pre-Calculus": {
    "Unit 1 — Trigonometry": ["Unit circle", "Trig functions", "Trig identities", "Inverse trig"],
    "Unit 2 — Vectors & Matrices": ["Vector operations", "Matrix multiplication", "Determinants"],
    "Unit 3 — Sequences & Series": ["Arithmetic sequences", "Geometric sequences", "Sigma notation"],
    "Unit 4 — Limits (intro)": ["Concept of a limit", "One-sided limits", "Continuity"],
  },
  "Calculus AB": {
    "Unit 1 — Limits": ["Evaluating limits", "L'Hôpital's rule", "Continuity & discontinuity"],
    "Unit 2 — Derivatives": ["Definition of derivative", "Power rule", "Chain rule", "Product & quotient rule"],
    "Unit 3 — Applications": ["Related rates", "Optimization", "Mean value theorem"],
    "Unit 4 — Integrals": ["Riemann sums", "Fundamental theorem", "U-substitution"],
  },
  "Calculus BC": {
    "Unit 1 — Advanced Integration": ["Integration by parts", "Partial fractions", "Improper integrals"],
    "Unit 2 — Series": ["Taylor series", "Maclaurin series", "Convergence tests"],
    "Unit 3 — Parametric & Polar": ["Parametric equations", "Polar coordinates", "Area in polar form"],
  },
};

const FEELINGS = ["Engaged", "Confused", "Frustrated", "Disengaged", "Breakthrough"];
const FEELING_EMOJI = {
  Engaged: "⚡",
  Confused: "😕",
  Frustrated: "😤",
  Disengaged: "😶",
  Breakthrough: "🌟",
};

// ============================================================
// UTILITY — format seconds into MM:SS display
// ============================================================
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ============================================================
// DESMOS GRAPH COMPONENT
// ============================================================
function DesmosGraph({ expressions, title }) {
  const containerRef = useRef(null);
  const calculatorRef = useRef(null);

  useEffect(() => {
    if (!window.Desmos) {
      const script = document.createElement("script");
      script.src = "https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fae6";
      script.onload = () => initDesmos();
      document.head.appendChild(script);
    } else {
      initDesmos();
    }

    function initDesmos() {
      if (!containerRef.current) return;
      if (calculatorRef.current) calculatorRef.current.destroy();
      const calc = window.Desmos.GraphingCalculator(containerRef.current, {
        expressions: false,
        settingsMenu: false,
        zoomButtons: true,
        border: false,
        lockViewport: false,
        autosize: true,
      });
      expressions.forEach((expr, i) => {
        calc.setExpression({
          id: `expr${i}`,
          latex: expr,
          color: i === 0 ? "#4f46e5" : i === 1 ? "#e11d48" : "#059669",
        });
      });
      calculatorRef.current = calc;
    }

    return () => {
      if (calculatorRef.current) calculatorRef.current.destroy();
    };
  }, [expressions]);

  return (
    <div style={s.graphWrapper}>
      {title && <div style={s.graphTitle}>📈 {title}</div>}
      <div ref={containerRef} style={s.graphContainer} />
    </div>
  );
}

// ============================================================
// PARSE MESSAGE
// ============================================================
function parseMessage(content) {
  const visualMatch = content.match(/VISUAL:(\{.*?\})/s);
  if (!visualMatch) return { text: content, visual: null };
  try {
    const visual = JSON.parse(visualMatch[1]);
    const text = content.replace(/VISUAL:\{.*?\}/s, "").trim();
    return { text, visual };
  } catch {
    return { text: content, visual: null };
  }
}

// ============================================================
// CHAT BUBBLE
// ============================================================
function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const { text, visual } = parseMessage(message.content);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
      <div style={{ ...s.bubble, ...(isUser ? s.userBubble : s.aiBubble) }}>
        {text}
      </div>
      {!isUser && visual && visual.type === "graph" && (
        <DesmosGraph expressions={visual.expressions || []} title={visual.title || ""} />
      )}
    </div>
  );
}

// ============================================================
// WELCOME SCREEN
// ============================================================
function WelcomeScreen({ onStart }) {
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    setFading(true);
    // Wait for fade animation to finish before showing main app
    setTimeout(() => onStart(), 600);
  };

  return (
    <div style={{
      ...s.welcome,
      opacity: fading ? 0 : 1,
      transition: "opacity 0.6s ease",
    }}>
      <p style={s.welcomeLogo}>📘 TutorGuide AI</p>
      <h1 style={s.welcomeTitle}>Welcome to<br />TutorGuide AI</h1>
      <p style={s.welcomeSub}>Your real-time instructional coaching assistant</p>
      <button style={s.startBtn} onClick={handleStart}>Start session</button>
    </div>
  );
}

// ============================================================
// POST-SESSION REPORT SCREEN
// ============================================================
function ReportScreen({ report, duration, subject, topic, toolsUsed, messageCount, onNewSession, onGoHome }) {
  return (
    <div style={s.reportScreen}>
      <div style={s.reportCard}>

        {/* Header */}
        <div style={s.reportHeader}>
          <div style={s.reportIcon}>📋</div>
          <div>
            <h2 style={s.reportTitle}>Post-session reflection report</h2>
            <p style={s.reportMeta}>
              {subject && topic ? `${subject} · ${topic} · ` : ""}
              {formatTime(duration)}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          <StatCard label="Duration" value={formatTime(duration)} />
          <StatCard label="Messages" value={messageCount} />
          <StatCard label="Hints used" value={toolsUsed.hints} />
          <StatCard label="Problems" value={toolsUsed.problems} />
        </div>

        {/* AI-generated report sections */}
        {report ? (
          <div style={s.reportBody}>
            <p style={s.reportText}>{report}</p>
          </div>
        ) : (
          <div style={s.reportBody}>
            <p style={{ color: "#94a3b8", fontStyle: "italic" }}>Generating your report…</p>
          </div>
        )}

        {/* Start new session */}
        <button style={s.newSessionBtn} onClick={onNewSession}>
          Start new session
        </button>
        <button style={s.homeBtn} onClick={onGoHome}>
          Back to home screen
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={s.statCard}>
      <p style={s.statLabel}>{label}</p>
      <p style={s.statValue}>{value}</p>
    </div>
  );
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {

  // --- Screen state ---
  // "welcome" | "session" | "report"
  const [screen, setScreen] = useState("welcome");

  // --- Timer state ---
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // --- Left rail state ---
  const [openSubject, setOpenSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [sessionPlan, setSessionPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [feelings, setFeelings] = useState([]);

  // --- Chat state ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  // --- Tools used tracking (for report) ---
  const [toolsUsed, setToolsUsed] = useState({ hints: 0, problems: 0, misconceptions: 0, nextSteps: 0, graphs: 0 });

  // --- Report state ---
  const [report, setReport] = useState(null);

  // --- Resize state ---
  const [railWidth, setRailWidth] = useState(240);
  const [transcriptWidth, setTranscriptWidth] = useState(300);
  const isDraggingRail = useRef(false);
  const isDraggingTranscript = useRef(false);

  // Auto-scroll chat
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ----------------------------------------------------------
  // START SESSION — begins timer, shows main app
  // ----------------------------------------------------------
  const startSession = () => {
    setScreen("session");
    setElapsed(0);
    // Start the timer — increments every second
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  // ----------------------------------------------------------
  // END SESSION — stops timer, generates report, shows report
  // ----------------------------------------------------------
  const endSession = async () => {
    // Stop the timer
    clearInterval(timerRef.current);
    setScreen("report");
    setReport(null);

    // Build a summary of the session to send to Gemini
    const sessionSummary = `
Subject: ${selectedSubject || "Not specified"}
Topic: ${selectedTopic || "Not specified"}
Duration: ${formatTime(elapsed)}
Number of messages: ${messages.length}
Tools used: ${toolsUsed.hints} hints, ${toolsUsed.problems} practice problems, ${toolsUsed.misconceptions} misconception analyses, ${toolsUsed.nextSteps} next step recommendations
Student feelings during session: ${feelings.length > 0 ? feelings.join(", ") : "Not tracked"}
Session plan used: ${sessionPlan ? "Yes" : "No"}

Chat transcript:
${messages.map((m) => `${m.role === "user" ? "Tutor" : "Coach"}: ${m.content}`).join("\n")}
    `.trim();

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Generate a post-session reflection report for this tutoring session. Structure it with these four clearly labeled sections:

1. SESSION SUMMARY — What was covered, how the session progressed, overall flow.
2. STUDENT LEARNING INSIGHTS — What the student understood, where they struggled, breakthroughs observed.
3. COACHING FEEDBACK — What the tutor did well, specific areas for improvement, actionable suggestions.
4. TOOLS USED — Brief note on how the AI coaching tools were used and their impact.

Keep each section to 2-4 sentences. Be specific, encouraging, and actionable.

Session data:
${sessionSummary}`
          }],
        }),
      });
      const data = await res.json();
      setReport(data.reply || "Could not generate report.");
    } catch {
      setReport("Could not reach the server to generate report.");
    }
  };

  // ----------------------------------------------------------
  // NEW SESSION — resets everything back to welcome screen
  // ----------------------------------------------------------
  const newSession = () => {
    clearInterval(timerRef.current);
    setElapsed(0);
    setMessages([]);
    setSelectedTopic(null);
    setSelectedSubject(null);
    setOpenSubject(null);
    setSessionPlan(null);
    setFeelings([]);
    setToolsUsed({ hints: 0, problems: 0, misconceptions: 0, nextSteps: 0, graphs: 0 });
    setReport(null);
    setInput("");
    setActiveButton(null);
    setScreen("session"); // ← changed from "welcome" to "session"
    // Restart the timer immediately
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };
  const goHome = () => {
    clearInterval(timerRef.current);
    setScreen("welcome");
    setElapsed(0);
    setMessages([]);
    setSelectedTopic(null);
    setSelectedSubject(null);
    setOpenSubject(null);
    setSessionPlan(null);
    setFeelings([]);
    setToolsUsed({ hints: 0, problems: 0, misconceptions: 0, nextSteps: 0, graphs: 0 });
    setReport(null);
    setInput("");
    setActiveButton(null);
  };

  // ----------------------------------------------------------
  // TOGGLE FEELING
  // ----------------------------------------------------------
  const toggleFeeling = (feeling) => {
    setFeelings((prev) =>
      prev.includes(feeling) ? prev.filter((f) => f !== feeling) : [...prev, feeling]
    );
  };

  // ----------------------------------------------------------
  // GENERATE SESSION PLAN
  // ----------------------------------------------------------
  const generatePlan = async () => {
    if (!selectedSubject || !selectedTopic) return;
    setPlanLoading(true);
    setSessionPlan(null);
    try {
      const res = await fetch("/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: selectedSubject, topic: selectedTopic }),
      });
      const data = await res.json();
      setSessionPlan(data.plan || "Could not generate plan.");
    } catch {
      setSessionPlan("Could not reach the server.");
    } finally {
      setPlanLoading(false);
    }
  };

  // ----------------------------------------------------------
  // SESSION CONTEXT — injected into every AI request
  // ----------------------------------------------------------
  const getSessionContext = () => ({
    subject: selectedSubject || "",
    topic: selectedTopic || "",
    sessionPlan: sessionPlan || "",
    feelings,
  });

  // ----------------------------------------------------------
  // RESIZE HANDLERS
  // ----------------------------------------------------------
  const startRailResize = (e) => {
    e.preventDefault();
    isDraggingRail.current = true;
    const onMove = (e) => {
      if (!isDraggingRail.current) return;
      setRailWidth(Math.min(400, Math.max(160, e.clientX - 12)));
    };
    const onUp = () => {
      isDraggingRail.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startTranscriptResize = (e) => {
    e.preventDefault();
    isDraggingTranscript.current = true;
    const onMove = (e) => {
      if (!isDraggingTranscript.current) return;
      setTranscriptWidth(Math.min(600, Math.max(150, e.clientX - railWidth - 24)));
    };
    const onUp = () => {
      isDraggingTranscript.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ----------------------------------------------------------
  // callAI — sends button prompt into chat + tracks tool usage
  // ----------------------------------------------------------
  const callAI = async (prompt, label, toolType) => {
    setLoading(true);
    const newMessages = [...messages, { role: "user", content: label }];
    setMessages(newMessages);

    // Track which tool was used for the report
    if (toolType) {
      setToolsUsed((prev) => ({ ...prev, [toolType]: prev[toolType] + 1 }));
    }

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          ...getSessionContext(),
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Error: " + (data.error || "something went wrong");

      // Check if response contains a graph — track it
      if (reply.includes("VISUAL:")) {
        setToolsUsed((prev) => ({ ...prev, graphs: prev.graphs + 1 }));
      }

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Could not reach the server." }]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // BUTTON HANDLERS
  // ----------------------------------------------------------
  const handleHint = (level) => {
    const prompts = {
      Clue: "Give the tutor a subtle Socratic nudge — a guiding question that helps the student think in the right direction without giving anything away. 1-2 sentences.",
      Partial: "Give the tutor a partial hint — reveal the key insight or strategy but not the full solution. 2-3 sentences.",
      Full: "Give the tutor a full step-by-step explanation they can use to walk the student through the complete solution.",
    };
    callAI(`[Hint — ${level} level]\n${prompts[level]}`, `💡 Hint — ${level} level`, "hints");
    setActiveButton(null);
  };

  const handlePractice = (difficulty) => {
    const prompts = {
      Easy: "Generate an easy practice problem on the current topic. Include a solution key for the tutor.",
      Medium: "Generate a medium difficulty practice problem. Include a solution key for the tutor.",
      Hard: "Generate a challenging multi-step practice problem. Include a solution key for the tutor.",
    };
    callAI(`[Practice Problem — ${difficulty}]\n${prompts[difficulty]}`, `📝 Practice Problem — ${difficulty}`, "problems");
    setActiveButton(null);
  };

  const handleMisconception = () => {
    callAI(
      `[Misconception analysis]\nIdentify the likely misconception. Include: (1) what it is, (2) why students make this error, (3) a corrective explanation, (4) a follow-up question to check understanding.`,
      `🔍 Misconception analysis`,
      "misconceptions"
    );
  };

  const handleNextStep = () => {
    callAI(
      `[Next step recommendation]\nWhat should the tutor do next? Give 2-3 concrete ranked options. Be brief and actionable.`,
      `➡️ Next Step recommendation`,
      "nextSteps"
    );
  };

  // ----------------------------------------------------------
  // SEND MESSAGE
  // ----------------------------------------------------------
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
        body: JSON.stringify({ messages: newMessages, ...getSessionContext() }),
      });
      const data = await res.json();
      const reply = data.reply || "Error: " + (data.error || "something went wrong");
      if (reply.includes("VISUAL:")) {
        setToolsUsed((prev) => ({ ...prev, graphs: prev.graphs + 1 }));
      }
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Could not reach the server." }]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // RENDER — switch between screens
  // ----------------------------------------------------------
  if (screen === "welcome") {
    return <WelcomeScreen onStart={startSession} />;
  }

  if (screen === "report") {
    return (
      <ReportScreen
        report={report}
        duration={elapsed}
        subject={selectedSubject}
        topic={selectedTopic}
        toolsUsed={toolsUsed}
        messageCount={messages.length}
        onNewSession={newSession}
        onGoHome={goHome}
      />
    );
  }

  // --- MAIN SESSION SCREEN ---
  return (
    <div style={s.app}>

      {/* TOP BAR */}
      <header style={s.topbar}>
        <h1 style={s.brand}>📘 TutorGuide AI</h1>
        <div style={s.topRight}>
          {/* Live timer — counts up from 00:00 */}
          <span style={s.timer}>⏱ {formatTime(elapsed)}</span>
          <button style={s.endBtn} onClick={endSession}>End session</button>
          <div style={s.avatar}>S</div>
        </div>
      </header>

      {/* THREE COLUMN LAYOUT */}
      <div style={s.main}>

        {/* ---- LEFT RAIL ---- */}
        <aside style={{ ...s.rail, width: railWidth, minWidth: railWidth, maxWidth: railWidth }}>

          <div style={s.section}>
            <h3 style={s.sectionTitle}>Subject</h3>
            {Object.keys(CURRICULUM).map((subject) => (
              <div key={subject}>
                <button
                  style={{ ...s.subjectPill, ...(openSubject === subject ? s.subjectPillOpen : {}) }}
                  onClick={() => setOpenSubject(openSubject === subject ? null : subject)}
                >
                  <span>{subject}</span>
                  <span style={s.chevron}>{openSubject === subject ? "▲" : "▼"}</span>
                </button>
                {openSubject === subject && (
                  <div style={s.dropdown}>
                    {Object.entries(CURRICULUM[subject]).map(([unit, topics]) => (
                      <div key={unit} style={s.unit}>
                        <p style={s.unitLabel}>{unit}</p>
                        {topics.map((topic) => (
                          <button
                            key={topic}
                            style={{ ...s.topicItem, ...(selectedTopic === topic ? s.topicItemActive : {}) }}
                            onClick={() => { setSelectedTopic(topic); setSelectedSubject(subject); setSessionPlan(null); }}
                          >
                            {selectedTopic === topic && <span style={s.checkmark}>✓ </span>}
                            {topic}
                          </button>
                        ))}
                      </div>
                    ))}
                    {selectedSubject === subject && selectedTopic && (
                      <button style={s.generateBtn} onClick={generatePlan} disabled={planLoading}>
                        {planLoading ? "Generating…" : "✨ Generate Session Plan"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {sessionPlan && (
            <div style={s.planBox}>
              <p style={s.planTitle}>📋 Session Plan — {selectedTopic}</p>
              <p style={s.planText}>{sessionPlan}</p>
            </div>
          )}

          <div style={s.section}>
            <h3 style={s.sectionTitle}>Student is feeling…</h3>
            <div style={s.pillWrap}>
              {FEELINGS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFeeling(f)}
                  style={{ ...s.feelingPill, ...(feelings.includes(f) ? s.feelingPillActive : {}) }}
                >
                  {FEELING_EMOJI[f]} {f}
                </button>
              ))}
            </div>
            {feelings.length > 0 && (
              <p style={s.feelingNote}>AI is adapting to: {feelings.join(", ")}</p>
            )}
          </div>

        </aside>

        {/* ---- DIVIDER 1 ---- */}
        <div style={s.divider} onMouseDown={startRailResize} title="Drag to resize" />

        {/* ---- TRANSCRIPT ---- */}
        <section style={{ ...s.transcript, width: transcriptWidth, minWidth: transcriptWidth, maxWidth: transcriptWidth }}>
          <h2 style={s.panelTitle}>Transcript</h2>
          <div style={s.transcriptBody}>
            <p style={s.placeholder}>The live transcript will appear here in a later step.</p>
          </div>
        </section>

        {/* ---- DIVIDER 2 ---- */}
        <div style={s.divider} onMouseDown={startTranscriptResize} title="Drag to resize" />

        {/* ---- AI COACH ---- */}
        <section style={{ ...s.coach, flex: 1, minWidth: 280 }}>
          <h2 style={s.panelTitle}>AI Coach</h2>

          {(selectedTopic || feelings.length > 0) && (
            <div style={s.contextBadge}>
              {selectedTopic && <span style={s.badge}>📚 {selectedTopic}</span>}
              {feelings.map((f) => (
                <span key={f} style={{ ...s.badge, ...s.feelingBadge }}>{FEELING_EMOJI[f]} {f}</span>
              ))}
            </div>
          )}

          <div style={s.chatBox}>
            {messages.length === 0 && (
              <p style={s.placeholder}>
                {selectedTopic
                  ? `Ready to coach on ${selectedTopic}. Ask anything or press a button below.`
                  : "Select a subject and topic on the left to get started."}
              </p>
            )}
            {messages.map((m, i) => <ChatBubble key={i} message={m} />)}
            {loading && <div style={s.thinking}>Coach is thinking…</div>}
            <div ref={chatEndRef} />
          </div>

          <div style={s.actions}>
            {activeButton === "hint" ? (
              <div style={s.levelGroup}>
                <span style={s.levelLabel}>Hint level:</span>
                {["Clue", "Partial", "Full"].map((level) => (
                  <button key={level} style={s.levelBtn} onClick={() => handleHint(level)}>{level}</button>
                ))}
                <button style={s.cancelBtn} onClick={() => setActiveButton(null)}>✕</button>
              </div>
            ) : (
              <button style={s.actionBtn} onClick={() => setActiveButton("hint")}>💡 Hint</button>
            )}

            {activeButton === "practice" ? (
              <div style={s.levelGroup}>
                <span style={s.levelLabel}>Difficulty:</span>
                {["Easy", "Medium", "Hard"].map((level) => (
                  <button key={level} style={s.levelBtn} onClick={() => handlePractice(level)}>{level}</button>
                ))}
                <button style={s.cancelBtn} onClick={() => setActiveButton(null)}>✕</button>
              </div>
            ) : (
              <button style={s.actionBtn} onClick={() => setActiveButton("practice")}>📝 Practice Problem</button>
            )}

            <button style={s.actionBtn} onClick={handleMisconception}>🔍 Misconception</button>
            <button style={s.actionBtn} onClick={handleNextStep}>➡️ Next Step</button>
          </div>

          <div style={s.inputRow}>
            <input
              style={s.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={selectedTopic ? `Ask about ${selectedTopic}…` : "Type a coaching question…"}
            />
            <button style={s.sendBtn} onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </section>

      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================
const s = {
  // Welcome screen
  welcome: {
    position: "fixed", inset: 0,
    background: "#0f172a",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 20, fontFamily: "system-ui, sans-serif",
  },
  welcomeLogo: { fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "#94a3b8", margin: 0 },
  welcomeTitle: { fontSize: 36, fontWeight: 500, color: "white", margin: 0, textAlign: "center", lineHeight: 1.3 },
  welcomeSub: { fontSize: 16, color: "#64748b", margin: 0 },
  startBtn: { marginTop: 8, padding: "14px 48px", borderRadius: 10, background: "white", color: "#0f172a", border: "none", fontSize: 16, fontWeight: 500, cursor: "pointer" },

  // Report screen
  reportScreen: { minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", fontFamily: "system-ui, sans-serif" },
  reportCard: { background: "white", borderRadius: 16, padding: 32, width: "100%", maxWidth: 720 },
  reportHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #e5e7eb" },
  reportIcon: { width: 48, height: 48, borderRadius: 12, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  reportTitle: { margin: 0, fontSize: 20, fontWeight: 500, color: "#111827" },
  reportMeta: { margin: "4px 0 0", fontSize: 13, color: "#6b7280" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 },
  statCard: { background: "#f9fafb", borderRadius: 10, padding: "12px 16px" },
  statLabel: { margin: "0 0 4px", fontSize: 12, color: "#6b7280" },
  statValue: { margin: 0, fontSize: 22, fontWeight: 500, color: "#111827" },
  reportBody: { marginBottom: 24 },
  reportText: { margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" },
  newSessionBtn: { width: "100%", padding: 14, borderRadius: 10, background: "#4f46e5", color: "white", border: "none", fontSize: 15, fontWeight: 500, cursor: "pointer" },

  // Main app
  app: { display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif", color: "#1f2937", background: "#f3f4f6" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "white", borderBottom: "1px solid #e5e7eb" },
  brand: { margin: 0, fontSize: 20 },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  timer: { fontVariantNumeric: "tabular-nums", color: "#6b7280", fontSize: 15 },
  endBtn: { padding: "6px 14px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#4f46e5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  main: { display: "flex", flex: 1, padding: 12, overflow: "hidden", gap: 0 },

  // Left rail
  rail: { background: "white", borderRadius: 12, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 },
  section: { marginBottom: 12 },
  sectionTitle: { margin: "0 0 8px", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280" },
  subjectPill: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", fontSize: 13, cursor: "pointer", marginBottom: 4, textAlign: "left", fontFamily: "inherit" },
  subjectPillOpen: { background: "#4f46e5", color: "white", borderColor: "#4f46e5" },
  chevron: { fontSize: 10 },
  dropdown: { background: "#f9fafb", borderRadius: 8, padding: 8, marginBottom: 6, border: "1px solid #e5e7eb" },
  unit: { marginBottom: 8 },
  unitLabel: { margin: "4px 0 4px 4px", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "#9ca3af" },
  topicItem: { width: "100%", textAlign: "left", padding: "5px 8px", borderRadius: 6, border: "none", background: "transparent", fontSize: 12, color: "#374151", cursor: "pointer", fontFamily: "inherit", display: "block" },
  topicItemActive: { background: "#ede9fe", color: "#4f46e5", fontWeight: 500 },
  checkmark: { color: "#4f46e5" },
  generateBtn: { width: "100%", marginTop: 8, padding: "8px 0", borderRadius: 8, border: "none", background: "#4f46e5", color: "white", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  planBox: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 10, marginBottom: 8 },
  planTitle: { margin: "0 0 6px", fontSize: 12, fontWeight: 500, color: "#1d4ed8" },
  planText: { margin: 0, fontSize: 12, color: "#1e40af", lineHeight: 1.6, whiteSpace: "pre-wrap" },
  pillWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  feelingPill: { padding: "5px 10px", borderRadius: 999, border: "1px solid #e5e7eb", background: "white", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  feelingPillActive: { background: "#4f46e5", color: "white", borderColor: "#4f46e5" },
  feelingNote: { margin: "6px 0 0", fontSize: 11, color: "#6b7280", fontStyle: "italic" },

  // Divider
  divider: { width: 6, cursor: "col-resize", flexShrink: 0, borderLeft: "2px solid #e5e7eb", margin: "0 2px", borderRadius: 4 },

  // Transcript
  transcript: { background: "white", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", flexShrink: 0 },
  panelTitle: { margin: "0 0 12px", fontSize: 16, fontWeight: 500 },
  transcriptBody: { flex: 1, overflowY: "auto" },

  // Coach panel
  coach: { background: "white", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" },
  contextBadge: { display: "flex", flexWrap: "wrap", gap: 6 },
  badge: { fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#ede9fe", color: "#4f46e5" },
  feelingBadge: { background: "#fef3c7", color: "#92400e" },

  // Chat
  chatBox: { flex: 1, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", padding: "4px 0" },
  bubble: { maxWidth: "85%", padding: "10px 14px", borderRadius: 14, whiteSpace: "pre-wrap", lineHeight: 1.5, fontSize: 14 },
  userBubble: { alignSelf: "flex-end", background: "#4f46e5", color: "white" },
  aiBubble: { alignSelf: "flex-start", background: "#f3f4f6" },
  thinking: { color: "#9ca3af", fontStyle: "italic", fontSize: 14 },
  placeholder: { color: "#9ca3af", textAlign: "center", marginTop: 40, fontSize: 14 },

  // Action buttons
  actions: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  actionBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  levelGroup: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  levelLabel: { fontSize: 13, color: "#6b7280" },
  levelBtn: { padding: "6px 12px", borderRadius: 999, border: "1px solid #4f46e5", background: "#eef2ff", color: "#4f46e5", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  cancelBtn: { padding: "4px 8px", borderRadius: 6, border: "none", background: "transparent", color: "#9ca3af", fontSize: 13, cursor: "pointer" },

  // Input
  inputRow: { display: "flex", gap: 8 },
  input: { flex: 1, padding: 12, borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15, fontFamily: "inherit" },
  sendBtn: { padding: "12px 18px", borderRadius: 8, border: "none", background: "#4f46e5", color: "white", fontSize: 15, cursor: "pointer" },

  // Desmos graph
  graphWrapper: { marginTop: 8, borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", background: "white", width: "100%", maxWidth: 400 },
  graphTitle: { padding: "6px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 12, color: "#6b7280" },
  graphContainer: { width: "100%", height: 280 },
  homeBtn: { width: "100%", padding: 14, borderRadius: 10, background: "white", color: "#4f46e5", border: "1px solid #4f46e5", fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 10 },
};