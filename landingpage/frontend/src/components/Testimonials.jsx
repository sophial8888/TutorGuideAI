import { useId } from "react";

const TESTIMONIALS = [
  {
    quote:
      "I used to spend 30 minutes prepping for each session. Now I open the live transcript and tap Hint or Next Step whenever I get stuck, and my students actually get it the first time.",
    name: "Marcus T.",
    role: "Peer Tutor, 11th grade",
    stars: 5,
    accent: "border-[#5BC0EB]/30",
    badge: "bg-[#5BC0EB]/10 text-[#5BC0EB]",
  },
  {
    quote:
      "My tutor used to just re-explain the whole problem when I got stuck. Now he asks what I already tried first and builds from there — it actually clicks instead of going in one ear and out the other.",
    name: "Priya S.",
    role: "Tutee, 9th grade",
    stars: 4.5,
    accent: "border-[#FF8FAB]/30",
    badge: "bg-[#FF8FAB]/10 text-[#FF8FAB]",
  },
  {
    quote:
      "The Misconception button is what sold me. It catches exactly where a student's thinking went sideways on limits and derivatives, so I can address that instead of re-teaching the whole lesson.",
    name: "Jordan L.",
    role: "College Peer Tutor",
    stars: 5,
    accent: "border-[#FFD93D]/40",
    badge: "bg-[#FFD93D]/15 text-amber-600",
  },
  {
    quote:
      "My tutor doesn't just hand me the answer anymore. She asks what I already know first and walks me there step by step. Feels like real tutoring, not just answer-checking.",
    name: "Aaliya R.",
    role: "Tutee, 10th grade",
    stars: 4.5,
    accent: "border-[#6EE7B7]/40",
    badge: "bg-[#6EE7B7]/15 text-emerald-600",
  },
  {
    quote:
      "Great for breaking word problems into steps I can actually walk my tutee through. Took a session or two to get used to switching between Hint and Practice Problem mid-conversation, but now it's second nature.",
    name: "Ethan K.",
    role: "Peer Tutor, 12th grade",
    stars: 4,
    accent: "border-[#C4B5FD]/40",
    badge: "bg-[#C4B5FD]/15 text-[#7C3AED]",
  },
  {
    quote:
      "My tutor started asking which step I'm actually stuck on instead of redoing the whole proof for me. Geometry feels a lot less intimidating now that I'm working through it instead of just watching.",
    name: "Sofia M.",
    role: "Tutee, 8th grade",
    stars: 4,
    accent: "border-[#93C5FD]/40",
    badge: "bg-[#93C5FD]/15 text-[#2563EB]",
  },
];

function Star({ fill, gradientId }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      {fill === 0.5 && (
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="#FFD93D" />
            <stop offset="50%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={fill === 1 ? "#FFD93D" : fill === 0.5 ? `url(#${gradientId})` : "#E5E7EB"}
      />
    </svg>
  );
}

function StarRating({ rating }) {
  const id = useId();
  const full = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = i < full ? 1 : i === full && hasHalf ? 0.5 : 0;
        return <Star key={i} fill={fill} gradientId={`${id}-star-${i}`} />;
      })}
    </div>
  );
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-gradient-to-r from-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-bold text-[#5BC0EB] uppercase tracking-widest mb-3">
            What People Say
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-dark tracking-tight">
            Tutors and students love it
          </h2>
        </div>

        <div className="flex gap-5 overflow-x-auto snap-x no-scrollbar pb-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className={`min-w-[300px] md:min-w-[380px] snap-center bg-white rounded-card p-7 border-2 ${t.accent} flex flex-col gap-4 shadow-sm`}
            >
              <StarRating rating={t.stars} />
              <p className="text-dark/70 text-sm leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.badge}`}
                >
                  {initials(t.name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">{t.name}</p>
                  <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${t.badge}`}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
