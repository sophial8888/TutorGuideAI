const TUTOR_BULLETS = [
  "Get unstuck on tough problems instantly",
  "Let AI generate step-by-step solution walkthroughs",
  "Spend less time prepping, more time teaching",
  "Explain concepts more clearly with AI support",
];

function AudienceCard({ role, emoji, color, border, badgeBg, bullets, cta }) {
  return (
    <div className={`bg-white rounded-card p-8 md:p-10 border-2 ${border} relative overflow-hidden flex flex-col gap-6 shadow-sm`}>
      {/* Decorative background blob */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${color} blur-2xl opacity-50`} />

      <div className="relative z-10 flex flex-col gap-5">
        <div className={`inline-flex items-center gap-2 ${badgeBg} rounded-full px-4 py-1.5 w-fit`}>
          <span className="text-lg">{emoji}</span>
          <span className="text-sm font-bold text-dark">{role}</span>
        </div>

        <ul className="flex flex-col gap-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-dark/70 leading-relaxed">
              <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#6EE7B7]/30 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
              {b}
            </li>
          ))}
        </ul>

        <a
          href="#signup"
          className="inline-flex items-center gap-2 bg-[#5BC0EB] text-white font-semibold text-sm px-6 py-3 rounded-full shadow-lg shadow-blue-100 hover:scale-105 transition-transform duration-300 w-fit"
        >
          {cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function WhoItsFor() {
  return (
    <section id="who" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-bold text-[#FF8FAB] uppercase tracking-widest mb-3">
            Who It's For
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-dark tracking-tight">
            Built for peer tutors
          </h2>
          <p className="mt-4 text-dark/60 max-w-md mx-auto text-lg">
            TutorGuide AI gives you an AI co-pilot for every session.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <AudienceCard
            role="Peer Tutors"
            emoji="🎓"
            color="bg-[#5BC0EB]/30"
            border="border-[#5BC0EB]/25"
            badgeBg="bg-[#5BC0EB]/15"
            bullets={TUTOR_BULLETS}
            cta="Start tutoring smarter"
          />
        </div>
      </div>
    </section>
  );
}
