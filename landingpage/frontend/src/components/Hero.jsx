import { useState } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");

  // Carry the email into the full signup form (CTASection) and scroll to it,
  // where the visitor finishes creating their tutor account.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) sessionStorage.setItem("signup_email", email);
    document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-20 px-6"
    >
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#5BC0EB]/20 blur-3xl -z-10" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#FF8FAB]/20 blur-3xl -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#FFD93D]/15 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="flex flex-col gap-6">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-[#6EE7B7]/20 border border-[#6EE7B7] rounded-full px-4 py-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
            <span className="text-sm font-semibold text-dark/80">Now available for Math tutoring</span>
          </div>

          <h1 className="font-heading text-5xl md:text-6xl font-semibold text-dark leading-tight tracking-tight">
            Math Tutoring,{" "}
            <span className="text-[#5BC0EB] cursor-default hover:scale-105 inline-block transition-transform duration-300">
              Made
            </span>{" "}
            <span className="text-[#FF8FAB] cursor-default hover:scale-105 inline-block transition-transform duration-300">
              Smarter
            </span>
          </h1>

          <p className="text-lg text-dark/70 leading-relaxed max-w-md">
            Built for peer tutors, TutorGuide AI walks through math problems
            step by step — with clear explanations and real-time AI guidance
            for every session.
          </p>

          {/* Quick signup */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 bg-white text-dark placeholder-dark/40 focus:outline-none focus:border-[#5BC0EB] transition-colors duration-200 text-sm"
            />
            <button
              type="submit"
              className="bg-[#5BC0EB] text-white font-semibold text-sm px-6 py-3 rounded-full shadow-lg shadow-blue-200 hover:scale-105 transition-transform duration-300 whitespace-nowrap"
            >
              Get Started Free
            </button>
          </form>

          {/* Social proof */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex -space-x-2">
              {["women/44", "men/32", "women/68", "men/15"].map((id) => (
                <img
                  key={id}
                  src={`https://randomuser.me/api/portraits/${id}.jpg`}
                  alt="user"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <p className="text-sm text-dark/60">
              <span className="font-bold text-dark">500+</span> peer tutors already using TutorGuide AI
            </p>
          </div>
        </div>

        {/* Right: visual */}
        <div className="relative flex justify-center items-center">
          {/* Decorative rotated backgrounds */}
          <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-card bg-[#FFD93D]/30 rotate-3" />
          <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-card bg-[#5BC0EB]/20 -rotate-2" />

          {/* AI Coach mock card — mirrors the actual chatbot session view */}
          <div className="relative z-10 animate-float w-72 md:w-80 bg-white rounded-card border-4 border-white shadow-2xl shadow-blue-100 p-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm font-semibold text-dark">AI Coach</span>
                <span className="text-[#7C3AED] text-xs">✦</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-[#7C3AED] bg-[#7C3AED]/10 rounded-full px-2 py-0.5">
                <span>⚡</span> AI Assisted
              </div>
            </div>

            {/* Coaching guidance bubble */}
            <div className="bg-gray-50 rounded-2xl p-3 text-xs text-dark/70 leading-relaxed">
              <span className="font-bold text-[#7C3AED]">Suggested next step:</span> Ask the student what undoes the{" "}
              <span className="font-semibold text-dark">+5</span> before dividing — guide, don't tell.
            </div>

            {/* Coach action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border-2 border-[#F5C84B] bg-[#FFF7E0] py-2.5 flex flex-col items-center gap-0.5">
                <span className="text-base">💡</span>
                <span className="text-[10px] font-bold text-[#B7791F]">Hint</span>
              </div>
              <div className="rounded-xl border-2 border-[#C4B5FD] bg-[#F1ECFE] py-2.5 flex flex-col items-center gap-0.5">
                <span className="text-base">📝</span>
                <span className="text-[10px] font-bold text-[#7C3AED]">Practice Problem</span>
              </div>
              <div className="rounded-xl border-2 border-[#93C5FD] bg-[#E6F1FE] py-2.5 flex flex-col items-center gap-0.5">
                <span className="text-base">🔍</span>
                <span className="text-[10px] font-bold text-[#2563EB]">Misconception</span>
              </div>
              <div className="rounded-xl border-2 border-[#86EFAC] bg-[#E6F9EE] py-2.5 flex flex-col items-center gap-0.5">
                <span className="text-base">➡️</span>
                <span className="text-[10px] font-bold text-[#059669]">Next Step</span>
              </div>
            </div>

            {/* Coaching input */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-2 mt-0.5">
              <span className="text-[10px] text-dark/40 flex-1">Type a coaching question…</span>
              <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-4 -left-4 z-20 bg-white rounded-2xl px-3 py-2 shadow-lg shadow-pink-100 animate-bounce flex items-center gap-2">
            <span className="text-lg">🎙️</span>
            <div>
              <p className="text-[10px] font-bold text-dark">Live transcript</p>
              <p className="text-[10px] text-dark/60">Real-time coaching</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
