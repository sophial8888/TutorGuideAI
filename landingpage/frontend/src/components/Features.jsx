const FEATURES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    bg: "bg-[#5BC0EB]/10",
    iconColor: "text-[#5BC0EB]",
    accent: "border-[#5BC0EB]/20",
    label: "Build Real Teaching Skills",
    description:
      "TutorGuide AI coaches you — the tutor — in real time. Get specific feedback on how to explain concepts, ask better questions, and guide students to discover answers themselves.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h1m5 0h1M9 15h6"/>
        <circle cx="9" cy="9" r="0.5" fill="currentColor"/>
        <circle cx="15" cy="9" r="0.5" fill="currentColor"/>
      </svg>
    ),
    bg: "bg-[#FF8FAB]/10",
    iconColor: "text-[#FF8FAB]",
    accent: "border-[#FF8FAB]/20",
    label: "Live Session Tools",
    description:
      "Use the live transcript to capture what's said, then tap Hint, Concept Explanation, Practice Problem, or Next Step to get instant AI coaching tailored to that exact moment in your session.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    bg: "bg-[#FFD93D]/15",
    iconColor: "text-amber-500",
    accent: "border-[#FFD93D]/30",
    label: "Math-Focused AI",
    description:
      "Trained specifically on math concepts from arithmetic to calculus. The AI understands notation, equations, and problem types.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    bg: "bg-[#6EE7B7]/15",
    iconColor: "text-emerald-600",
    accent: "border-[#6EE7B7]/30",
    label: "Built for Peer Tutors",
    description:
      "Peer tutors can use TutorGuide AI as a co-pilot — get unstuck on tough problems, suggest better explanations, and save prep time.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-[#F0F9FF]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-bold text-[#5BC0EB] uppercase tracking-widest mb-3">
            What We Offer
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-dark tracking-tight">
            Everything you need to tutor smarter
          </h2>
          <p className="mt-4 text-dark/60 max-w-lg mx-auto text-lg">
            Designed for the way math is actually taught and learned — one step at a time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat) => (
            <div
              key={feat.label}
              className={`bg-white rounded-card p-7 border-2 ${feat.accent} hover:-translate-y-2 transition-transform duration-300 shadow-sm flex flex-col gap-4`}
            >
              <div className={`w-12 h-12 rounded-2xl ${feat.bg} ${feat.iconColor} flex items-center justify-center`}>
                {feat.icon}
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-dark mb-1">
                  {feat.label}
                </h3>
                <p className="text-dark/60 text-sm leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
