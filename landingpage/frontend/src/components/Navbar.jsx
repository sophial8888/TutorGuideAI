import { useState, useEffect } from "react";
import SignInModal from "./SignInModal";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Who It's For", href: "#who" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 group">
          <img src="/src/assets/tutorguidelogo.png" alt="TutorGuide AI" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
          <span className="font-heading text-xl font-semibold text-dark tracking-tight">
            TutorGuide <span className="text-[#5BC0EB]">AI</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-dark/70 hover:text-dark transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setSignInOpen(true)}
            className="text-sm font-semibold text-dark/70 hover:text-dark transition-colors duration-200"
          >
            Sign In
          </button>
          <a
            href="#signup"
            className="flex items-center gap-2 bg-[#FF8FAB] text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-pink-200 hover:scale-105 transition-transform duration-300"
          >
            Sign Up Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <path d="M18 6L6 18M6 6l12 12"/>
              </>
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-dark/80 hover:text-dark"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button
            className="mt-2 border-2 border-gray-200 text-dark font-semibold text-sm px-5 py-2.5 rounded-full text-center"
            onClick={() => {
              setMenuOpen(false);
              setSignInOpen(true);
            }}
          >
            Sign In
          </button>
          <a
            href="#signup"
            className="bg-[#FF8FAB] text-white font-semibold text-sm px-5 py-2.5 rounded-full text-center"
            onClick={() => setMenuOpen(false)}
          >
            Sign Up Free
          </a>
        </div>
      )}

      {signInOpen && <SignInModal onClose={() => setSignInOpen(false)} />}
    </header>
  );
}
