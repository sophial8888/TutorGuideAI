import tutorGuideLogo from "../assets/tutorguidelogo.png";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Who It's For", href: "#who" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white/80 py-14 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <a href="#home" className="flex items-center gap-2 w-fit">
            <img src={tutorGuideLogo} alt="TutorGuide AI" className="h-9 w-auto" />
            <span className="font-heading text-lg font-semibold text-white">
              TutorGuide <span className="text-[#5BC0EB]">AI</span>
            </span>
          </a>
          <p className="text-sm leading-relaxed text-white/60 max-w-xs">
            AI-powered math tutoring for peer tutors and students. Step-by-step, 24/7, free to start.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-3 mt-1">
            {[
              { label: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
              { label: "GitHub", path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
              { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#5BC0EB]/30 flex items-center justify-center transition-colors duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.path}/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-semibold text-white mb-4 text-base">Quick Links</h4>
          <ul className="flex flex-col gap-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + CTA */}
        <div>
          <h4 className="font-heading font-semibold text-white mb-4 text-base">Get Started</h4>
          <p className="text-sm text-white/60 mb-5 leading-relaxed">
            Questions? Feedback? We'd love to hear from you.
          </p>
          <a
            href="mailto:tutorguideai@gmail.com"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors duration-200 mb-5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            tutorguideai@gmail.com
          </a>
          <a
            href="#signup"
            className="inline-flex items-center gap-2 bg-[#FF8FAB] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:scale-105 transition-transform duration-300"
          >
            Sign Up Free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} TutorGuide AI. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200">Privacy Policy & Terms</a>
          <p className="text-xs text-white/40">Built with React + Flask · Math tutoring, made smarter.</p>
        </div>
      </div>
    </footer>
  );
}
