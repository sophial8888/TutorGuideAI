const STEPS = [
  {
    number: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    color: "bg-[#5BC0EB]/15 text-[#5BC0EB]",
    border: "border-[#5BC0EB]/30",
    title: "Create your account",
    description:
      "Sign up in seconds. Just your name and email — no credit card, no friction. Free to start.",
  },
  {
    number: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: "bg-[#FF8FAB]/15 text-[#FF8FAB]",
    border: "border-[#FF8FAB]/30",
    title: "Start a tutoring session",
    description:
      "Type in any math problem — algebra, geometry, calculus, you name it. TutorGuide AI is ready.",
  },
  {
    number: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    color: "bg-[#6EE7B7]/20 text-emerald-600",
    border: "border-[#6EE7B7]/40",
    title: "Get step-by-step AI guidance",
    description:
      "The AI breaks every problem into clear, understandable steps — so students don't just get answers, they learn the process.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-bold text-[#5BC0EB] uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-dark tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-dark/60 max-w-md mx-auto text-lg">
            From signup to your first solved problem in under two minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-[#5BC0EB]/40 via-[#FF8FAB]/40 to-[#6EE7B7]/40" />

          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`relative bg-white rounded-card p-8 border-2 ${step.border} hover:-translate-y-2 transition-transform duration-300 shadow-sm`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center shrink-0`}>
                  {step.icon}
                </div>
                <span className="font-heading text-5xl font-semibold text-dark/10 leading-none mt-1">
                  {step.number}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-dark mb-2">
                {step.title}
              </h3>
              <p className="text-dark/60 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
