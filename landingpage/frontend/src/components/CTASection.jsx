import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "http://localhost:5173/";

export default function CTASection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  // Prefill the email if the visitor entered one in the hero form.
  useEffect(() => {
    const prefill = sessionStorage.getItem("signup_email");
    if (prefill) {
      setEmail(prefill);
      sessionStorage.removeItem("signup_email");
    }
  }, []);

  const handleGoogleSignUp = async () => {
    setStatus("loading");
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: CHATBOT_URL },
    });
    if (error) { setStatus("error"); setMessage(error.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setStatus("loading");
    setMessage("");

    // Create the account in the same Supabase project the chatbot uses, so this
    // person can sign straight into the chatbot with these credentials.
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim(), role: "tutor" } },
    });

    if (error) {
      setStatus("error");
      setMessage(
        error.message?.toLowerCase().includes("already")
          ? "This email is already registered. Head to the app to sign in."
          : error.message || "Something went wrong. Please try again."
      );
      return;
    }

    // If email confirmation is disabled, signUp returns a session and we can
    // create the linked profiles row right away. If it's enabled, there's no
    // session yet (RLS would block the insert) — the chatbot creates the
    // profile row on first sign-in instead.
    if (data.session && data.user) {
      await supabase
        .from("profiles")
        .upsert({ id: data.user.id, full_name: name.trim() });
      setStatus("success");
      setMessage("Welcome to TutorGuide AI!");
      // Hand the new session off to the chatbot so they land already signed in.
      const { access_token, refresh_token } = data.session;
      const base = CHATBOT_URL.endsWith("/") ? CHATBOT_URL : CHATBOT_URL + "/";
      setTimeout(() => {
        window.location.href = `${base}#access_token=${access_token}&refresh_token=${refresh_token}`;
      }, 1500);
    } else {
      // Email confirmation required before the account is active.
      setStatus("success");
      setMessage("Check your email to confirm your account, then sign in.");
    }
  };

  return (
    <section id="signup" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-[#5BC0EB] rounded-blob p-10 md:p-14 overflow-hidden text-white text-center">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#FF8FAB]/30 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#FFD93D]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>

            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight">
                Ready to tutor smarter?
              </h2>
              <p className="mt-3 text-white/80 text-lg max-w-md mx-auto">
                Join hundreds of peer tutors already using TutorGuide AI to make math click.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors duration-200 text-sm"
              />
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors duration-200 text-sm"
              />
              <input
                type="password"
                required
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors duration-200 text-sm"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="w-full bg-[#FF8FAB] text-white font-bold py-4 rounded-full shadow-xl shadow-pink-900/20 hover:scale-105 transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {status === "loading"
                  ? "Creating your account…"
                  : status === "success"
                  ? "Redirecting to TutorGuide AI…"
                  : "Create Free Account"}
              </button>
            </form>

            {status === "error" && (
              <p className="text-sm text-red-200 -mt-2">{message}</p>
            )}
            {status === "success" && (
              <p className="text-sm text-white/90 font-medium -mt-2">{message}</p>
            )}

            <div className="flex items-center gap-3 w-full max-w-md">
              <div className="flex-1 h-px bg-white/30" />
              <span className="text-xs text-white/60">or</span>
              <div className="flex-1 h-px bg-white/30" />
            </div>

            <button
              onClick={handleGoogleSignUp}
              disabled={status === "loading" || status === "success"}
              className="w-full max-w-md flex items-center justify-center gap-3 bg-white rounded-full py-3.5 text-sm font-semibold text-dark shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign up with Google
            </button>

            <p className="text-white/60 text-xs">
              For peer tutors · No credit card needed · Free to start
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
