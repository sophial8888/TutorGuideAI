const TESTIMONIALS = [
  {
    quote:
      "I used to spend 30 minutes prepping for each tutoring session. With TutorGuide AI I just paste the problem and it breaks it down perfectly. My students finally get it.",
    name: "Marcus T.",
    role: "Peer Tutor, 11th grade",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    stars: 5,
    accent: "border-[#5BC0EB]/30",
    badge: "bg-[#5BC0EB]/10 text-[#5BC0EB]",
  },
  {
    quote:
      "Algebra used to make me want to cry. Now I just ask TutorGuide AI and it walks me through every step. I went from a C to a B+ in one month.",
    name: "Priya S.",
    role: "Student, 9th grade",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    stars: 5,
    accent: "border-[#FF8FAB]/30",
    badge: "bg-[#FF8FAB]/10 text-[#FF8FAB]",
  },
  {
    quote:
      "As a college tutor helping high schoolers with calculus, this tool is a lifesaver. It explains limits and derivatives in plain language way better than I can sometimes.",
    name: "Jordan L.",
    role: "College Peer Tutor",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    stars: 5,
    accent: "border-[#FFD93D]/40",
    badge: "bg-[#FFD93D]/15 text-amber-600",
  },
  {
    quote:
      "I love that it doesn't just give me the answer. It asks me what I know first and builds from there. Feels like an actual tutor, not just a calculator.",
    name: "Aaliya R.",
    role: "Student, 10th grade",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    stars: 5,
    accent: "border-[#6EE7B7]/40",
    badge: "bg-[#6EE7B7]/15 text-emerald-600",
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFD93D">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
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
              <StarRating count={t.stars} />
              <p className="text-dark/70 text-sm leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                />
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
