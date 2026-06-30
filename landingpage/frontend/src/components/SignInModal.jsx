import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabase";

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "http://localhost:5173/";

export default function SignInModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleGoogleSignIn = async () => {
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
    setStatus("loading");
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Couldn't sign you in. Check your details and try again.");
      return;
    }

    setStatus("success");
    setMessage("Signed in! Taking you to TutorGuide AI…");

    // Hand the session off to the chatbot (different origin) via the URL hash,
    // so the visitor lands already signed in instead of logging in twice.
    const { access_token, refresh_token } = data.session;
    const base = CHATBOT_URL.endsWith("/") ? CHATBOT_URL : CHATBOT_URL + "/";
    setTimeout(() => {
      window.location.href = `${base}#access_token=${access_token}&refresh_token=${refresh_token}`;
    }, 800);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-card shadow-2xl p-8 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-dark/40 hover:text-dark hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold text-dark tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-dark/60">
            Sign in to jump back into TutorGuide AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 rounded-full border-2 border-gray-200 bg-white text-dark placeholder-dark/40 focus:outline-none focus:border-[#5BC0EB] transition-colors duration-200 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-full border-2 border-gray-200 bg-white text-dark placeholder-dark/40 focus:outline-none focus:border-[#5BC0EB] transition-colors duration-200 text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full bg-[#5BC0EB] text-white font-bold py-3.5 rounded-full shadow-lg shadow-blue-200 hover:scale-105 transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {status === "loading"
              ? "Signing you in…"
              : status === "success"
              ? "Redirecting…"
              : "Sign In"}
          </button>
        </form>

        {status === "error" && (
          <p className="text-sm text-red-500 -mt-1 text-center">{message}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-[#059669] font-medium -mt-1 text-center">{message}</p>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-dark/40">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={status === "loading" || status === "success"}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-full py-3 text-sm font-semibold text-dark hover:border-[#5BC0EB] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-dark/50 text-center">
          New here?{" "}
          <a href="#signup" onClick={onClose} className="font-semibold text-[#5BC0EB] hover:underline">
            Create a free account
          </a>
        </p>
      </div>
    </div>,
    document.body
  );
}
