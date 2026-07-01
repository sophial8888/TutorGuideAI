import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, ResponsiveContainer, CartesianGrid } from "recharts";
import tutorGuideLogo from "./assets/tutorguidelogo.png";

// ============================================================
// CONSTANTS
// ============================================================
const CURRICULUM = {
  "Algebra": {
    "Unit 1 — Linear Functions": ["Slope & linear equations", "Graphing lines", "Writing equations from points", "Parallel & perpendicular lines"],
    "Unit 2 — Systems": ["Substitution method", "Elimination method", "Graphing systems", "Word problems"],
    "Unit 3 — Quadratics": ["Factoring", "Quadratic formula", "Completing the square", "Graphing parabolas"],
    "Unit 4 — Inequalities": ["Solving inequalities", "Graphing inequalities", "Compound inequalities"],
  },
  "Geometry": {
    "Unit 1 — Foundations": ["Points, lines & planes", "Angle relationships", "Proofs & logic"],
    "Unit 2 — Triangles": ["Triangle congruence", "Triangle similarity", "Pythagorean theorem", "Special right triangles"],
    "Unit 3 — Circles": ["Circle theorems", "Arc length & sector area", "Tangent lines"],
    "Unit 4 — Area & Volume": ["Polygon area", "Surface area", "Volume of solids"],
  },
  "Trigonometry": {
    "Unit 1 — Foundations": ["Angle measurement", "Right triangle trig", "SOH-CAH-TOA", "Inverse trig functions"],
    "Unit 2 — Unit Circle": ["Unit circle", "Trig functions on unit circle", "Reference angles", "Coterminal angles"],
    "Unit 3 — Graphs": ["Graphing sine & cosine", "Amplitude & period", "Phase shifts", "Graphing tangent"],
    "Unit 4 — Identities": ["Pythagorean identities", "Sum & difference formulas", "Double angle formulas", "Solving trig equations"],
  },
  "Algebra II": {
    "Unit 1 — Functions": ["Function notation", "Domain & range", "Transformations", "Inverse functions"],
    "Unit 2 — Polynomials": ["Polynomial division", "Remainder theorem", "Rational roots"],
    "Unit 3 — Exponentials & Logs": ["Exponential growth & decay", "Logarithm properties", "Solving log equations"],
    "Unit 4 — Complex Numbers": ["Imaginary numbers", "Operations with complex numbers"],
  },
  "Pre-Calculus": {
    "Unit 1 — Trigonometry": ["Unit circle", "Trig functions", "Trig identities", "Inverse trig"],
    "Unit 2 — Vectors & Matrices": ["Vector operations", "Matrix multiplication", "Determinants"],
    "Unit 3 — Sequences & Series": ["Arithmetic sequences", "Geometric sequences", "Sigma notation"],
    "Unit 4 — Limits (intro)": ["Concept of a limit", "One-sided limits", "Continuity"],
  },
  "Calculus AB": {
    "Unit 1 — Limits": ["Evaluating limits", "L'Hôpital's rule", "Continuity & discontinuity"],
    "Unit 2 — Derivatives": ["Definition of derivative", "Power rule", "Chain rule", "Product & quotient rule"],
    "Unit 3 — Applications": ["Related rates", "Optimization", "Mean value theorem"],
    "Unit 4 — Integrals": ["Riemann sums", "Fundamental theorem", "U-substitution"],
  },
  "Calculus BC": {
    "Unit 1 — Advanced Integration": ["Integration by parts", "Partial fractions", "Improper integrals"],
    "Unit 2 — Series": ["Taylor series", "Maclaurin series", "Convergence tests"],
    "Unit 3 — Parametric & Polar": ["Parametric equations", "Polar coordinates", "Area in polar form"],
  },
};

const RESOURCES = {
  "Algebra": [
    { name: "Khan Academy — Algebra 1", source: "Khan Academy", desc: "Full course with videos and practice problems covering linear equations, systems, and quadratics.", type: "Practice", url: "https://www.khanacademy.org/math/algebra" },
    { name: "Khan Academy — Algebra 2", source: "Khan Academy", desc: "Videos and exercises on polynomials, exponentials, logarithms, and complex numbers.", type: "Practice", url: "https://www.khanacademy.org/math/algebra2" },
    { name: "OpenStax Elementary Algebra", source: "OpenStax", desc: "Free peer-reviewed textbook covering foundational algebra topics from basics to quadratics.", type: "Textbook", url: "https://openstax.org/details/books/elementary-algebra-2e" },
    { name: "OpenStax Intermediate Algebra", source: "OpenStax", desc: "Free textbook bridging elementary algebra and college-level topics including rational expressions.", type: "Textbook", url: "https://openstax.org/details/books/intermediate-algebra-2e" },
    { name: "Paul's Notes — Algebra", source: "Paul's Online Math Notes", desc: "Comprehensive algebra notes with worked examples and practice problems with full solutions.", type: "Textbook", url: "https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx" },
  ],
  "Geometry": [
    { name: "Khan Academy — Geometry", source: "Khan Academy", desc: "Full geometry course covering proofs, triangles, circles, and transformations with practice.", type: "Practice", url: "https://www.khanacademy.org/math/geometry" },
    { name: "Khan Academy — High School Geometry", source: "Khan Academy", desc: "Aligned to high school standards with congruence, similarity, and coordinate geometry.", type: "Practice", url: "https://www.khanacademy.org/math/geometry-home" },
    { name: "GeoGebra Geometry", source: "GeoGebra", desc: "Interactive geometry tool for constructing and exploring shapes, proofs, and transformations.", type: "Tool", url: "https://www.geogebra.org/geometry" },
    { name: "GeoGebra Graphing Calculator", source: "GeoGebra", desc: "Free graphing tool useful for visualizing geometric relationships and coordinate geometry.", type: "Tool", url: "https://www.geogebra.org/graphing" },
  ],
  "Trigonometry": [
    { name: "Khan Academy — Trigonometry", source: "Khan Academy", desc: "Full trig course covering unit circle, trig functions, identities, and inverse functions.", type: "Practice", url: "https://www.khanacademy.org/math/trigonometry" },
    { name: "Paul's Notes — Algebra/Trig Review", source: "Paul's Online Math Notes", desc: "Comprehensive review of trig fundamentals including the unit circle and all trig identities.", type: "Textbook", url: "https://tutorial.math.lamar.edu/Extras/AlgebraTrigReview/AlgebraIntro.aspx" },
    { name: "GeoGebra — Unit Circle", source: "GeoGebra", desc: "Interactive unit circle tool — great for visualizing angles, reference angles, and trig values.", type: "Tool", url: "https://www.geogebra.org/m/ZPaPHzCi" },
    { name: "OpenStax Algebra & Trigonometry", source: "OpenStax", desc: "Free textbook covering trigonometry in depth alongside algebra review, with 5,900+ exercises.", type: "Textbook", url: "https://openstax.org/details/books/algebra-and-trigonometry-2e" },
  ],
  "Algebra II": [
    { name: "Khan Academy — Algebra 2", source: "Khan Academy", desc: "Full Algebra 2 course with videos and practice covering polynomials, logs, and conics.", type: "Practice", url: "https://www.khanacademy.org/math/algebra2" },
    { name: "OpenStax College Algebra", source: "OpenStax", desc: "Free textbook covering Algebra II topics at a college level — excellent explanations and exercises.", type: "Textbook", url: "https://openstax.org/details/books/college-algebra-2e" },
    { name: "Paul's Notes — Algebra", source: "Paul's Online Math Notes", desc: "Thorough algebra notes including exponential and logarithmic functions with worked examples.", type: "Textbook", url: "https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx" },
    { name: "GeoGebra Graphing Calculator", source: "GeoGebra", desc: "Visualize polynomial functions, exponential curves, and logarithms interactively.", type: "Tool", url: "https://www.geogebra.org/graphing" },
  ],
  "Pre-Calculus": [
    { name: "Khan Academy — Precalculus", source: "Khan Academy", desc: "Full precalculus course covering functions, trigonometry, vectors, and intro to limits.", type: "Practice", url: "https://www.khanacademy.org/math/precalculus" },
    { name: "OpenStax Precalculus 2e", source: "OpenStax", desc: "Free peer-reviewed textbook with 5,900+ exercises across 12 chapters from functions to limits.", type: "Textbook", url: "https://openstax.org/details/books/precalculus-2e" },
    { name: "Paul's Notes — Algebra/Trig Review", source: "Paul's Online Math Notes", desc: "Essential review of algebra and trig topics needed before calculus — great for bridging gaps.", type: "Textbook", url: "https://tutorial.math.lamar.edu/Extras/AlgebraTrigReview/AlgebraIntro.aspx" },
    { name: "MyOpenMath", source: "MyOpenMath", desc: "Free online homework system with randomized practice problems for precalculus topics.", type: "Practice", url: "https://www.myopenmath.com" },
  ],
  "Calculus AB": [
    { name: "Khan Academy — AP Calculus AB", source: "Khan Academy", desc: "Full AP Calculus AB course with videos, practice, and exam prep covering limits, derivatives, and integrals.", type: "Practice", url: "https://www.khanacademy.org/math/ap-calculus-ab" },
    { name: "OpenStax Calculus Volume 1", source: "OpenStax", desc: "Free peer-reviewed calculus textbook covering limits, derivatives, and integration thoroughly.", type: "Textbook", url: "https://openstax.org/details/books/calculus-volume-1" },
    { name: "Paul's Notes — Calculus I", source: "Paul's Online Math Notes", desc: "Comprehensive Calculus I notes with worked examples, practice problems, and full solutions.", type: "Textbook", url: "https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx" },
    { name: "Paul's Calculus Cheat Sheet", source: "Paul's Online Math Notes", desc: "Printable reference sheet covering limits, derivatives, and integrals — perfect for quick review.", type: "Tool", url: "https://tutorial.math.lamar.edu/getfile.aspx?file=B,40,N" },
    { name: "MIT OpenCourseWare — Calculus", source: "MIT OCW", desc: "Full MIT calculus course materials including lecture notes, exams, and problem sets.", type: "Textbook", url: "https://ocw.mit.edu/courses/mathematics/" },
  ],
  "Calculus BC": [
    { name: "Khan Academy — AP Calculus BC", source: "Khan Academy", desc: "Full AP Calculus BC course with videos and practice including series, parametric, and polar.", type: "Practice", url: "https://www.khanacademy.org/math/ap-calculus-bc" },
    { name: "OpenStax Calculus Volume 2", source: "OpenStax", desc: "Free textbook covering integration techniques, sequences, series, and parametric equations.", type: "Textbook", url: "https://openstax.org/details/books/calculus-volume-2" },
    { name: "Paul's Notes — Calculus II", source: "Paul's Online Math Notes", desc: "Calculus II notes covering integration techniques, series, and parametric/polar coordinates.", type: "Textbook", url: "https://tutorial.math.lamar.edu/Classes/CalcII/CalcII.aspx" },
    { name: "Paul's Calculus Cheat Sheet", source: "Paul's Online Math Notes", desc: "Comprehensive printable cheat sheet covering all major calculus formulas and theorems.", type: "Tool", url: "https://tutorial.math.lamar.edu/getfile.aspx?file=B,40,N" },
    { name: "MIT OpenCourseWare — Calculus", source: "MIT OCW", desc: "Full MIT calculus course with lecture notes, assignments, and exams freely available.", type: "Textbook", url: "https://ocw.mit.edu/courses/mathematics/" },
  ],
};

const TYPE_COLORS = {
  "Textbook": { bg: "#ede9fe", color: "#5b21b6", icon: "book" },
  "Practice": { bg: "#dcfce7", color: "#15803d", icon: "target" },
  "Tool": { bg: "#e0f2fe", color: "#0369a1", icon: "wrench" },
};

const SOURCE_COLORS = {
  "Khan Academy": "#22c55e",
  "OpenStax": "#3b82f6",
  "Paul's Online Math Notes": "#a855f7",
  "GeoGebra": "#f97316",
  "MIT OCW": "#ef4444",
  "MyOpenMath": "#eab308",
};

const FEELINGS = ["Engaged", "Confused", "Frustrated", "Disengaged", "Breakthrough"];
const FEELING_ICON = { Engaged: "lightning", Confused: "confused", Frustrated: "frustrated", Disengaged: "muted", Breakthrough: "star" };
const FEELING_COLORS = { Engaged: "#22c55e", Confused: "#f59e0b", Frustrated: "#ef4444", Disengaged: "#94a3b8", Breakthrough: "#a855f7" };

const GRADES = ["9th grade", "10th grade", "11th grade", "12th grade", "College"];
const ALL_GRADES = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
const SUBJECTS = ["Algebra", "Geometry", "Trigonometry", "Algebra II", "Pre-Calculus", "Calculus AB", "Calculus BC"];
const SUBJECT_COLORS = {
  "Algebra": "#7c3aed", "Geometry": "#0284c7", "Trigonometry": "#0d9488",
  "Algebra II": "#16a34a", "Pre-Calculus": "#d97706", "Calculus AB": "#db2777", "Calculus BC": "#ea580c",
};
const GRADE_COLORS = {
  "K": "#0d9488", "1st": "#16a34a", "2nd": "#0284c7", "3rd": "#4338ca",
  "4th": "#7c3aed", "5th": "#db2777", "6th": "#dc2626", "7th": "#ea580c", "8th": "#d97706", "9th": "#0891b2",
};

const NAV_ITEMS = [
  { icon: "grid", label: "Dashboard" },
  { icon: "play", label: "Live Sessions" },
  { icon: "chart", label: "Student Progress" },
  { icon: "book", label: "Resources" },
  { icon: "gear", label: "Settings" },
];

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#a78bfa";
const SIDEBAR_BG = "#1e1b2e";
const FONT = "'Fredoka', system-ui, sans-serif";

// Duotone icons (outline + soft fill) replacing emoji glyphs throughout the app.
const ICON_PATHS = {
  hint: (
    <>
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.45 1.1 1.2 1.1 2.2h5c0-1 .5-1.75 1.1-2.2A6 6 0 0 0 12 3z" strokeLinejoin="round" />
      <path d="M9.5 18h5M10.3 21h3.4" strokeLinecap="round" />
    </>
  ),
  practice: (
    <>
      <path d="M4 20l1-4L15.5 5.5l3 3L8 19l-4 1z" strokeLinejoin="round" strokeLinecap="round" fill="none" />
      <path d="M15.5 5.5l3 3-2 2-3-3 2-2z" strokeLinejoin="round" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5c-1.5-1-3.7-1.5-6-1.5-.6 0-1 .4-1 1v11c0 .6.4 1 1 1 2.3 0 4.5.5 6 1.5 1.5-1 3.7-1.5 6-1.5.6 0 1-.4 1-1V6c0-.6-.4-1-1-1-2.3 0-4.5.5-6 1.5z" strokeLinejoin="round" />
      <path d="M12 6.5V19" strokeLinecap="round" fill="none" />
    </>
  ),
  arrow: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="6" />
      <path d="M8 12h8M13 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  lightning: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" />,
  confused: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.8a2.4 2.4 0 0 1 4.5-1.2c.5.9.2 1.6-.6 2.2-.7.5-1.3.9-1.3 2" strokeLinecap="round" fill="none" />
      <path d="M12 15.8v.01" strokeLinecap="round" strokeWidth="2.6" />
    </>
  ),
  frustrated: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 10.3l2.2-1.3M16 10.3l-2.2-1.3" strokeLinecap="round" fill="none" />
      <path d="M8.5 16c1-1.2 2.2-1.8 3.5-1.8s2.5.6 3.5 1.8" strokeLinecap="round" fill="none" />
    </>
  ),
  muted: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.7 10.2v.01M15.3 10.2v.01" strokeLinecap="round" strokeWidth="2.6" />
      <path d="M8.5 15.3h7" strokeLinecap="round" fill="none" />
    </>
  ),
  star: <path d="M12 3l2.1 5.6L20 11l-5.9 2.1L12 19l-2.1-5.9L4 11l5.9-2.4L12 3z" strokeLinejoin="round" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" fill="none" />
      <path d="M12 12v.01" strokeLinecap="round" strokeWidth="2.6" />
    </>
  ),
  wrench: <path d="M20.5 6.5a4.2 4.2 0 0 1-5.6 5.6L7 20 4 17l7.9-7.9A4.2 4.2 0 0 1 17.5 3.5l-3 3 2 2 3-2z" strokeLinejoin="round" />,
  chart: (
    <>
      <path d="M4 20V4.8" strokeLinecap="round" fill="none" />
      <path d="M4 20h16.2" strokeLinecap="round" fill="none" />
      <rect x="7" y="13" width="2.6" height="7" rx="1" />
      <rect x="12.2" y="8" width="2.6" height="12" rx="1" />
      <rect x="17.4" y="10.5" width="2.6" height="9.5" rx="1" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1M18.5 18.5l-2.1-2.1M7.6 7.6 5.5 5.5" strokeLinecap="round" fill="none" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3a2.5 2.5 0 0 1 4.6-1.3c.6.9.3 1.7-.5 2.3-.8.6-1.4 1-1.4 2.2" strokeLinecap="round" fill="none" />
      <path d="M12 16.6v.01" strokeLinecap="round" strokeWidth="2.6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.3" fill="none" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" fill="none" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="2.6" fill="none" />
      <path d="M6.5 18.5c1.3-2.6 3.4-3.5 5.5-3.5s4.2.9 5.5 3.5" strokeLinecap="round" fill="none" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" strokeLinecap="round" fill="none" />
      <path d="M12 13v.01" strokeLinecap="round" strokeWidth="2.6" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4.5" width="14" height="17" rx="2.5" />
      <rect x="9" y="3" width="6" height="3" rx="1" fill="none" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5" strokeLinecap="round" fill="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3.2 2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  chat: <path d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4.5 4V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />,
  snowflake: (
    <path d="M12 3v18M4.6 7.5l14.8 9M19.4 7.5 4.6 16.5" strokeLinecap="round" fill="none" />
  ),
  warning: (
    <>
      <path d="M12 3.5 21 19H3L12 3.5z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" fill="none" />
      <path d="M12 16.7v.01" strokeLinecap="round" strokeWidth="2.6" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9 20.5h6" strokeLinecap="round" fill="none" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" fill="none" />
    </>
  ),
  eyeOff: (
    <path d="M3.5 3.5l17 17M9.9 5.6A10.4 10.4 0 0 1 12 5.5c6.5 0 10 6.5 10 6.5a15.7 15.7 0 0 1-3.3 4.1M6.5 7.3A15.6 15.6 0 0 0 2 12s3.5 6.5 10 6.5c1.2 0 2.3-.2 3.3-.5M14.1 14.1a2.6 2.6 0 0 1-3.7-3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  play: <path d="M7 4.5v15l13-7.5-13-7.5z" strokeLinejoin="round" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="3" />,
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10.2v.01M15.5 10.2v.01" strokeLinecap="round" strokeWidth="2.6" />
      <path d="M8 14.3c1 1.4 2.4 2.1 4 2.1s3-.7 4-2.1" strokeLinecap="round" fill="none" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" />
    </>
  ),
};

function Icon({ type, stroke, fill = "none", size = 20, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.8" style={style}>
      {ICON_PATHS[type]}
    </svg>
  );
}

// Where the landing page (landingpage/frontend) is served.
// Local dev falls back to localhost; set VITE_LANDING_URL to the deployed URL for production.
const LANDING_URL = import.meta.env.VITE_LANDING_URL || "http://localhost:5174";

// Base URL for the Flask API (app.py). Empty string in local dev relies on the
// Vite proxy in vite.config.js; set VITE_API_URL to the deployed backend's URL
// in production, since frontend and backend won't share an origin there.
const API_URL = import.meta.env.VITE_API_URL || "";

const PRIVACY_POLICY = `TUTORGUIDE AI — PRIVACY POLICY & TERMS OF SERVICE

Last updated: July 2026

1. DATA WE COLLECT
When you use TutorGuide AI, we collect and store:
- Session metadata (date, time, duration, subject, topic)
- Student names and profiles (optional, entered by you)
- AI coaching chat logs
- Live session speech transcripts
- Student emotional state indicators
- Post-session reflection reports
- Your name and email address (used for your account)

2. HOW WE USE YOUR DATA
Your data is used solely to display your past sessions and student progress within the app. We do not sell, share, or use your data for advertising or any third-party purpose.

3. DATA STORAGE & SECURITY
All data is stored in Supabase with Row Level Security (RLS) enforced at the database level. This means your data is cryptographically isolated — no other user can access it, even if they are authenticated. Access controls are enforced server-side, not just in the app.

4. AUTHENTICATION
You may sign in using email/password or Google OAuth. When you use Google Sign-In, authentication is handled by Google and subject to Google's Privacy Policy (policies.google.com/privacy). We receive only your name and email address from Google — we do not receive your Google password or any other Google account data.

5. USE OF ARTIFICIAL INTELLIGENCE
TutorGuide AI uses third-party AI services to generate coaching responses:
- Coaching advice, hints, session plans, and reflection reports are generated by Groq's API using the Llama large language model.
- Your session content (subject, topic, transcript excerpts, and chat messages) is sent to Groq's servers solely to generate your response. This data is not used to train AI models.
- AI-generated responses may not always be accurate. You are responsible for verifying any advice before applying it in a session.
- Do not enter sensitive personal information (e.g. student last names, school names, addresses) into the AI chat.

6. STUDENT PRIVACY
You are responsible for obtaining appropriate consent from students and parents/guardians before entering student names or recording session transcripts. Do not enter personally identifiable information beyond what is necessary.

7. FERPA NOTICE
If TutorGuide AI is used in a school or institutional setting, you (the tutor) are responsible for ensuring compliance with FERPA and any applicable state laws. TutorGuide AI is a tool for individual tutors and is not a FERPA-compliant service provider.

8. DATA RETENTION & DELETION
Your data is retained until you delete it. You may delete any session, student record, or your entire account at any time from within the app. Deleted data is permanently removed and cannot be recovered.

9. DISPUTE RESOLUTION & ARBITRATION
PLEASE READ THIS SECTION CAREFULLY — IT AFFECTS YOUR LEGAL RIGHTS.

Any dispute, claim, or controversy arising out of or relating to these Terms or your use of TutorGuide AI shall be resolved by binding individual arbitration, not in court. You waive your right to a jury trial and your right to participate in a class action lawsuit or class-wide arbitration.

Arbitration shall be conducted under the rules of the American Arbitration Association (AAA). The arbitration will take place in the United States. Nothing in this clause prevents either party from seeking emergency injunctive relief in court to prevent irreparable harm.

If you do not agree to arbitration, you must notify us in writing at tutorguideai@gmail.com within 30 days of first using the service.

10. CONTACT
Questions or concerns? Contact us at tutorguideai@gmail.com.

By creating an account, you agree to these terms.`;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ============================================================
// AVATAR
// ============================================================
function Avatar({ avatarUrl, name, size = 36, onClick }) {
  return (
    <div onClick={onClick} style={{ width: size, height: size, borderRadius: "50%", background: PURPLE, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 600, flexShrink: 0, cursor: onClick ? "pointer" : "default", overflow: "hidden", padding: 0 }}>
      {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
const SIDEBAR_ARROW_BTN = { position: "absolute", top: "50%", right: -12, transform: "translateY(-50%)", width: 24, height: 40, borderRadius: "0 6px 6px 0", border: "none", background: SIDEBAR_BG, color: "#94a3b8", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, padding: 0, fontFamily: FONT };

function Sidebar({ activeLabel, onNavigate, onSignOut, collapsed, onToggle }) {
  if (collapsed) {
    return (
      <aside style={{ ...s.sidebar, width: 20, minWidth: 20, overflow: "visible", position: "relative", flexShrink: 0, transition: "width 0.25s ease, min-width 0.25s ease" }}>
        <button onClick={onToggle} style={SIDEBAR_ARROW_BTN}>›</button>
      </aside>
    );
  }
  return (
    <aside style={{ ...s.sidebar, position: "relative", overflow: "visible", transition: "width 0.25s ease, min-width 0.25s ease" }}>
      <button onClick={onToggle} style={SIDEBAR_ARROW_BTN}>‹</button>
      <div style={{ ...s.sidebarLogo, cursor: "pointer" }} onClick={() => { window.location.href = LANDING_URL; }} title="Go to landing page"><img src={tutorGuideLogo} alt="TutorGuide AI" style={{ height: 28, width: "auto" }} /><span style={s.logoText}>TutorGuide AI</span></div>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <nav style={s.nav}>
          {NAV_ITEMS.map((item) => (
            <button key={item.label} style={{ ...s.navItem, ...(activeLabel === item.label ? s.navItemActive : {}) }}
              onClick={() => {
                if (item.label === "Dashboard") onNavigate("dashboard");
                else if (item.label === "Live Sessions") onNavigate("session");
                else if (item.label === "Student Progress") onNavigate("progress");
                else if (item.label === "Resources") onNavigate("resources");
                else if (item.label === "Settings") onNavigate("settings");
              }}>
              <Icon type={item.icon} stroke="currentColor" fill="none" size={16} style={s.navIcon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div style={s.sidebarBottom}>
        <button style={s.newSessionSideBtn} onClick={() => onNavigate("newSession")}>+ Start New Session</button>
        <button style={{ ...s.sideBottomLink, display: "flex", alignItems: "center", gap: 6 }}><Icon type="help" stroke="currentColor" fill="none" size={14} />Help Center</button>
        <button style={s.sideBottomLink} onClick={onSignOut}>→ Sign Out</button>
      </div>
    </aside>
  );
}

// ============================================================
// AUTH SCREEN
// ============================================================
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingSignup, setPendingSignup] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) return setError("Please enter your email and password.");
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onAuth(data.user, data.user.user_metadata?.full_name || data.user.email.split("@")[0]);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  };

  const handleSignupIntent = () => {
    if (!email || !password || !name) return setError("Please fill in all fields.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setPendingSignup({ email, password, name }); setMode("privacy"); setError("");
  };

  const handleSignupConfirm = async () => {
    if (!agreed) return setError("Please agree to the privacy policy.");
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signUp({ email: pendingSignup.email, password: pendingSignup.password, options: { data: { full_name: pendingSignup.name } } });
    if (error) setError(error.message);
    else onAuth(data.user, pendingSignup.name);
    setLoading(false);
  };

  if (mode === "privacy") {
    return (
      <div style={s.authWrap}>
        <div style={{ ...s.authCard, maxWidth: 600 }}>
          <h2 style={s.authTitle}>Privacy Policy & Terms</h2>
          <p style={s.authSub}>Please read and agree before creating your account.</p>
          <div style={s.privacyBox}><pre style={s.privacyText}>{PRIVACY_POLICY}</pre></div>
          <label style={s.agreeRow}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer" }} />
            <span style={s.agreeLabel}>I have read and agree to the Privacy Policy and Terms of Service</span>
          </label>
          {error && <p style={s.authError}>{error}</p>}
          <button style={{ ...s.authBtn, opacity: agreed ? 1 : 0.5 }} onClick={handleSignupConfirm} disabled={!agreed || loading}>{loading ? "Creating account…" : "Create account"}</button>
          <button style={s.authLink} onClick={() => setMode("signup")}>← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.authWrap}>
      <div style={s.authCard}>
        <div style={s.authLogo}><img src={tutorGuideLogo} alt="TutorGuide AI" style={{ height: 40, width: "auto" }} /><span style={s.authLogoText}>TutorGuide AI</span></div>
        <h2 style={s.authTitle}>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p style={s.authSub}>{mode === "login" ? "Sign in to access your sessions" : "Start coaching smarter with AI"}</p>
        {mode === "signup" && <div style={s.fieldWrap}><label style={s.fieldLabel}>Full name</label><input style={s.authInput} type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} /></div>}
        <div style={s.fieldWrap}><label style={s.fieldLabel}>Email</label><input style={s.authInput} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignupIntent())} /></div>
        <div style={s.fieldWrap}><label style={s.fieldLabel}>Password</label><input style={s.authInput} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignupIntent())} /></div>
        {error && <p style={s.authError}>{error}</p>}
        <button style={s.authBtn} onClick={mode === "login" ? handleLogin : handleSignupIntent} disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Continue →"}</button>
        <div style={s.authDivider}>
          <div style={{ flex: 1, height: 1, background: "rgba(209,213,219,0.7)" }} />
          <span style={s.authDividerText}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(209,213,219,0.7)" }} />
        </div>
        <button style={s.googleBtn} onClick={handleGoogleSignIn} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
        <p style={s.authSwitch}>{mode === "login" ? "Don't have an account? " : "Already have an account? "}<button style={s.authLink} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? "Sign up" : "Sign in"}</button></p>
      </div>
    </div>
  );
}

// ============================================================
// RESOURCES PAGE
// ============================================================
function ResourcesPage({ tutorName, avatarUrl, onNavigate, onSignOut, currentSubject, sidebarCollapsed, onToggleSidebar }) {
  const [activeSubject, setActiveSubject] = useState(currentSubject && RESOURCES[currentSubject] ? currentSubject : "Algebra");
  const [copiedUrl, setCopiedUrl] = useState(null);

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const resources = RESOURCES[activeSubject] || [];

  return (
    <div style={s.app}>
      <Sidebar activeLabel="Resources" onNavigate={onNavigate} onSignOut={onSignOut} collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
      <div style={s.mainArea}>
        <header style={s.topbar}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#111827", fontFamily: FONT }}>Resources</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontFamily: FONT }}>Free textbooks, practice problems and tools — organized by subject</p>
          </div>
          <div style={s.tutorProfile}>
            <div style={s.tutorInfo}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{tutorName}</p><p style={s.tutorRole}>Tutor</p></div>
            <Avatar avatarUrl={avatarUrl} name={tutorName} size={36} onClick={() => onNavigate("profile")} />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {/* Subject tabs */}
          <div style={s.resourceTabs}>
            {SUBJECTS.map((subject) => (
              <button key={subject} onClick={() => setActiveSubject(subject)}
                style={{ ...s.resourceTab, ...(activeSubject === subject ? { background: SUBJECT_COLORS[subject], color: "white", borderColor: SUBJECT_COLORS[subject] } : {}) }}>
                {subject}
              </button>
            ))}
          </div>

          {/* Resource cards */}
          <div style={s.resourceGrid}>
            {resources.map((resource, i) => {
              const typeStyle = TYPE_COLORS[resource.type] || { bg: "#f3f4f6", color: "#374151" };
              return (
                <div key={i} style={s.resourceCard}>
                  <div style={s.resourceCardTop}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {SOURCE_COLORS[resource.source] ? (
                        <span style={{ width: 9, height: 9, borderRadius: "50%", background: SOURCE_COLORS[resource.source], flexShrink: 0 }} />
                      ) : (
                        <Icon type="pin" stroke="#6b7280" fill="#e5e7eb" size={14} style={{ flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 11, color: "#6b7280", fontFamily: FONT }}>{resource.source}</span>
                      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 999, background: typeStyle.bg, color: typeStyle.color, fontFamily: FONT }}>{typeStyle.icon && <Icon type={typeStyle.icon} stroke={typeStyle.color} fill={typeStyle.color} size={11} />}{resource.type}</span>
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{resource.name}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5, fontFamily: FONT }}>{resource.desc}</p>
                  </div>
                  <div style={s.resourceCardActions}>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" style={s.openBtn}>Open ↗</a>
                    <button onClick={() => copyLink(resource.url)} style={{ ...s.copyBtn, ...(copiedUrl === resource.url ? { background: "#dcfce7", color: "#15803d", borderColor: "#86efac" } : {}) }}>
                      {copiedUrl === resource.url ? "✓ Copied!" : "Copy link"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cross-subject tools */}
          <div style={{ marginTop: 32 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 16px", fontFamily: FONT }}><Icon type="wrench" stroke="#0369a1" fill="#7dd3fc" size={18} />Tools for all subjects</h2>
            <div style={s.resourceGrid}>
              {[
                { name: "GeoGebra Graphing Calculator", source: "GeoGebra", desc: "Free interactive graphing tool for visualizing functions, geometry, and calculus concepts.", type: "Tool", url: "https://www.geogebra.org/graphing" },
                { name: "Desmos Graphing Calculator", source: "Desmos", desc: "Beautiful, intuitive graphing calculator — great for showing students graphs in real time.", type: "Tool", url: "https://www.desmos.com/calculator" },
                { name: "MyOpenMath", source: "MyOpenMath", desc: "Free online homework system with randomized practice problems for most math subjects.", type: "Practice", url: "https://www.myopenmath.com" },
                { name: "MIT OpenCourseWare — Math", source: "MIT OCW", desc: "Full MIT math course materials — lecture notes, exams, and problem sets, all free.", type: "Textbook", url: "https://ocw.mit.edu/courses/mathematics/" },
                { name: "Wolfram Alpha", source: "Wolfram Alpha", desc: "Computational knowledge engine — great for checking answers and exploring math concepts.", type: "Tool", url: "https://www.wolframalpha.com" },
                { name: "Paul's Math Cheat Sheets", source: "Paul's Online Math Notes", desc: "Printable cheat sheets for algebra, trig, and calculus — perfect for quick reference.", type: "Tool", url: "https://tutorial.math.lamar.edu/extras/cheatsheets_tables.aspx" },
              ].map((resource, i) => {
                const typeStyle = TYPE_COLORS[resource.type] || { bg: "#f3f4f6", color: "#374151" };
                return (
                  <div key={i} style={s.resourceCard}>
                    <div style={s.resourceCardTop}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        {SOURCE_COLORS[resource.source] ? (
                          <span style={{ width: 9, height: 9, borderRadius: "50%", background: SOURCE_COLORS[resource.source], flexShrink: 0 }} />
                        ) : (
                          <Icon type="pin" stroke="#6b7280" fill="#e5e7eb" size={14} style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 11, color: "#6b7280", fontFamily: FONT }}>{resource.source}</span>
                        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 999, background: typeStyle.bg, color: typeStyle.color, fontFamily: FONT }}>{typeStyle.icon && <Icon type={typeStyle.icon} stroke={typeStyle.color} fill={typeStyle.color} size={11} />}{resource.type}</span>
                      </div>
                      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{resource.name}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5, fontFamily: FONT }}>{resource.desc}</p>
                    </div>
                    <div style={s.resourceCardActions}>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" style={s.openBtn}>Open ↗</a>
                      <button onClick={() => copyLink(resource.url)} style={{ ...s.copyBtn, ...(copiedUrl === resource.url ? { background: "#dcfce7", color: "#15803d", borderColor: "#86efac" } : {}) }}>
                        {copiedUrl === resource.url ? "✓ Copied!" : "Copy link"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE PAGE
// ============================================================
function ProfilePage({ user, tutorName, setTutorName, avatarUrl, setAvatarUrl, onNavigate, onSignOut, sidebarCollapsed, onToggleSidebar }) {
  const [profile, setProfile] = useState({ full_name: "", username: "", subjects: [], grade_levels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile({ full_name: data.full_name || tutorName, username: data.username || "", subjects: data.subjects || [], grade_levels: data.grade_levels || [] });
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true); setSaveMsg("");
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: profile.full_name, username: profile.username, subjects: profile.subjects, grade_levels: profile.grade_levels, avatar_url: avatarUrl });
    if (error) setSaveMsg("Error: " + error.message);
    else { setSaveMsg("Saved!"); setTutorName(profile.full_name || tutorName); setTimeout(() => setSaveMsg(""), 3000); }
    setSaving(false);
  };

  const toggleSubject = (sub) => setProfile((p) => ({ ...p, subjects: p.subjects.includes(sub) ? p.subjects.filter((x) => x !== sub) : [...p.subjects, sub] }));
  const toggleGrade = (g) => setProfile((p) => ({ ...p, grade_levels: p.grade_levels.includes(g) ? p.grade_levels.filter((x) => x !== g) : [...p.grade_levels, g] }));

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Image must be under 2MB.");
    setAvatarUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (error) { alert("Upload failed: " + error.message); setAvatarUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    setAvatarUploading(false);
  };

  const changePassword = async () => {
    setPwError(""); setPwMsg("");
    if (!currentPassword) return setPwError("Please enter your current password.");
    if (!newPassword) return setPwError("Please enter a new password.");
    if (newPassword.length < 6) return setPwError("New password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setPwError("Passwords don't match.");
    setPwLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (signInError) { setPwError("Current password is incorrect."); setPwLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPwError(error.message);
    else { setPwMsg("Password updated!"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setTimeout(() => setPwMsg(""), 3000); }
    setPwLoading(false);
  };

  const sendResetEmail = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) alert("Error: " + error.message);
    else alert(`Reset email sent to ${user.email}`);
  };

  const deleteAllData = async () => {
    if (!confirm("Delete ALL sessions and student records? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure?")) return;
    await supabase.from("sessions").delete().eq("tutor_id", user.id);
    await supabase.from("students").delete().eq("tutor_id", user.id);
    alert("All data deleted.");
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: FONT, color: "#6b7280" }}>Loading…</div>;

  return (
    <div style={s.app}>
      <Sidebar activeLabel="" onNavigate={onNavigate} onSignOut={onSignOut} collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
      <div style={s.mainArea}>
        <header style={s.topbar}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#111827", fontFamily: FONT }}>My Profile</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontFamily: FONT }}>Manage your account and preferences</p>
          </div>
          <div style={s.tutorProfile}>
            <div style={s.tutorInfo}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{profile.full_name || tutorName}</p><p style={s.tutorRole}>Tutor</p></div>
            <Avatar avatarUrl={avatarUrl} name={profile.full_name || tutorName} size={36} />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 680 }}>
            <div style={s.profileCard}>
              <p style={s.profileSectionTitle}>Profile photo</p>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Avatar avatarUrl={avatarUrl} name={profile.full_name || tutorName} size={72} onClick={() => fileInputRef.current?.click()} />
                <div>
                  <button style={s.uploadBtn} onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>{avatarUploading ? "Uploading…" : "Upload photo"}</button>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af", fontFamily: FONT }}>JPG or PNG, max 2MB</p>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadAvatar} />
                </div>
              </div>
            </div>

            <div style={s.profileCard}>
              <p style={s.profileSectionTitle}>Basic information</p>
              <div style={s.fieldWrap}><label style={s.fieldLabel}>Full name</label><input style={s.authInput} value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" /></div>
              <div style={s.fieldWrap}><label style={s.fieldLabel}>Username</label><input style={s.authInput} value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} placeholder="Choose a username" /></div>
              <div style={s.fieldWrap}>
                <label style={s.fieldLabel}>Email</label>
                <input style={{ ...s.authInput, background: "rgba(249,250,251,0.8)", color: "#9ca3af" }} value={user.email} disabled />
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af", fontFamily: FONT }}>Email cannot be changed here.</p>
              </div>
            </div>

            <div style={s.profileCard}>
              <p style={s.profileSectionTitle}>Subjects you teach</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUBJECTS.map((subject) => {
                  const active = profile.subjects.includes(subject);
                  const color = SUBJECT_COLORS[subject];
                  return <button key={subject} onClick={() => toggleSubject(subject)} style={{ padding: "7px 16px", borderRadius: 999, border: "none", fontSize: 13, cursor: "pointer", fontFamily: FONT, background: active ? color : "#f3f4f6", color: active ? "white" : "#6b7280", transition: "all 0.15s" }}>{subject}</button>;
                })}
              </div>
            </div>

            <div style={s.profileCard}>
              <p style={s.profileSectionTitle}>Grade levels you tutor</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_GRADES.map((grade) => {
                  const active = profile.grade_levels.includes(grade);
                  const color = GRADE_COLORS[grade];
                  return <button key={grade} onClick={() => toggleGrade(grade)} style={{ padding: "7px 16px", borderRadius: 999, border: "none", fontSize: 13, cursor: "pointer", fontFamily: FONT, background: active ? color : "#f3f4f6", color: active ? "white" : "#6b7280", transition: "all 0.15s" }}>{grade}</button>;
                })}
              </div>
            </div>

            <button style={{ ...s.authBtn, marginBottom: 8 }} onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            {saveMsg && <p style={{ color: saveMsg.includes("Error") ? "#dc2626" : "#16a34a", fontSize: 14, marginBottom: 16, fontFamily: FONT }}>{saveMsg}</p>}

            <div style={s.profileCard}>
              <p style={s.profileSectionTitle}>Change password</p>
              <div style={s.fieldWrap}>
                <label style={s.fieldLabel}>Current password</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...s.authInput, paddingRight: 44 }} type={showCurrentPw ? "text" : "password"} placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  <button style={s.eyeBtn} onClick={() => setShowCurrentPw(!showCurrentPw)}><Icon type={showCurrentPw ? "eyeOff" : "eye"} stroke="#6b7280" fill="none" size={16} /></button>
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.fieldLabel}>New password</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...s.authInput, paddingRight: 44 }} type={showNewPw ? "text" : "password"} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button style={s.eyeBtn} onClick={() => setShowNewPw(!showNewPw)}><Icon type={showNewPw ? "eyeOff" : "eye"} stroke="#6b7280" fill="none" size={16} /></button>
                </div>
              </div>
              <div style={s.fieldWrap}><label style={s.fieldLabel}>Confirm new password</label><input style={s.authInput} type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
              {pwError && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontFamily: FONT }}>{pwError}</p>}
              {pwMsg && <p style={{ color: "#16a34a", fontSize: 13, margin: "0 0 12px", fontFamily: FONT }}>{pwMsg}</p>}
              <button style={s.authBtn} onClick={changePassword} disabled={pwLoading}>{pwLoading ? "Updating…" : "Update password"}</button>
              <button style={{ ...s.authLink, display: "block", marginTop: 10, fontSize: 13 }} onClick={sendResetEmail}>Forgot your current password? Send reset email →</button>
            </div>

            <div style={{ ...s.profileCard, border: "1px solid rgba(254,202,202,0.8)" }}>
              <p style={{ ...s.profileSectionTitle, color: "#dc2626" }}>Danger zone</p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 12px", fontFamily: FONT }}>Permanently delete all your session data and student records.</p>
              <button style={s.dangerBtn} onClick={deleteAllData}>Delete all my data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STUDENT PROGRESS PAGE
// ============================================================
function StudentProgressPage({ user, tutorName, avatarUrl, onNavigate, onSignOut, sidebarCollapsed, onToggleSidebar }) {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newName, setNewName] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: studentsData }, { data: sessionsData }] = await Promise.all([
      supabase.from("students").select("*").eq("tutor_id", user.id).order("name"),
      supabase.from("sessions").select("*").eq("tutor_id", user.id).order("created_at"),
    ]);
    setStudents(studentsData || []);
    setSessions(sessionsData || []);
    setLoading(false);
  };

  const saveStudent = async () => {
    if (!newName.trim()) return setFormError("Name is required.");
    setFormLoading(true); setFormError("");
    if (editingStudent) {
      const { error } = await supabase.from("students").update({ name: newName, grade: newGrade, primary_subject: newSubject, notes: newNotes }).eq("id", editingStudent.id).eq("tutor_id", user.id);
      if (error) setFormError(error.message);
      else { await fetchData(); setEditingStudent(null); setShowAddStudent(false); resetForm(); }
    } else {
      const { error } = await supabase.from("students").insert({ tutor_id: user.id, name: newName, grade: newGrade, primary_subject: newSubject, notes: newNotes });
      if (error) setFormError(error.message);
      else { await fetchData(); setShowAddStudent(false); resetForm(); }
    }
    setFormLoading(false);
  };

  const deleteStudent = async (id) => {
    if (!confirm("Delete this student?")) return;
    await supabase.from("students").delete().eq("id", id).eq("tutor_id", user.id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedStudent?.id === id) setSelectedStudent(null);
  };

  const startEdit = (student) => { setEditingStudent(student); setNewName(student.name); setNewGrade(student.grade || ""); setNewSubject(student.primary_subject || ""); setNewNotes(student.notes || ""); setShowAddStudent(true); };
  const resetForm = () => { setNewName(""); setNewGrade(""); setNewSubject(""); setNewNotes(""); setFormError(""); setEditingStudent(null); };

  const getStudentSessions = (student) => sessions.filter((sess) =>
    sess.student_id === student.id || (sess.student_name && sess.student_name.toLowerCase() === student.name.toLowerCase())
  ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const buildSessionsOverTime = (ss) => ss.map((sess) => ({ name: formatDate(sess.created_at), duration: Math.round((sess.duration_seconds || 0) / 60) }));
  const buildTopicsCovered = (ss) => { const t = {}; ss.forEach((sess) => { if (sess.topic) t[sess.topic] = (t[sess.topic] || 0) + 1; }); return Object.entries(t).map(([topic, count]) => ({ topic: topic.length > 20 ? topic.slice(0, 20) + "…" : topic, sessions: count })); };
  const buildFeelingsData = (ss) => ss.map((sess, i) => { const e = { name: `S${i + 1}` }; FEELINGS.forEach((f) => { e[f] = (sess.feelings || []).includes(f) ? 1 : 0; }); return e; });
  const studentSessions = selectedStudent ? getStudentSessions(selectedStudent) : [];

  return (
    <div style={s.app}>
      <Sidebar activeLabel="Student Progress" onNavigate={onNavigate} onSignOut={onSignOut} collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
      <div style={s.mainArea}>
        <header style={s.topbar}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#111827", fontFamily: FONT }}>Student Progress</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontFamily: FONT }}>{students.length} student{students.length !== 1 ? "s" : ""} tracked</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={s.addStudentBtn} onClick={() => { resetForm(); setShowAddStudent(true); }}>+ Add Student</button>
            <div style={s.tutorProfile}>
              <div style={s.tutorInfo}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{tutorName}</p><p style={s.tutorRole}>Tutor</p></div>
              <Avatar avatarUrl={avatarUrl} name={tutorName} size={36} onClick={() => onNavigate("profile")} />
            </div>
          </div>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={s.studentList}>
            <p style={s.studentListTitle}>Your Students</p>
            {loading ? <p style={{ color: "#9ca3af", fontSize: 13, fontFamily: FONT }}>Loading…</p> :
              students.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: FONT }}>No students yet.</p>
                  <button style={{ ...s.addStudentBtn, width: "100%", marginTop: 8 }} onClick={() => { resetForm(); setShowAddStudent(true); }}>Add your first student</button>
                </div>
              ) : students.map((student) => {
                const stuSessions = getStudentSessions(student);
                return (
                  <div key={student.id} style={{ ...s.studentCard, ...(selectedStudent?.id === student.id ? s.studentCardActive : {}) }} onClick={() => setSelectedStudent(student)}>
                    <div style={s.studentCardTop}>
                      <div style={s.studentCardAvatar}>{student.name.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ ...s.studentCardName, fontFamily: FONT }}>{student.name}</p>
                        <p style={{ ...s.studentCardMeta, fontFamily: FONT }}>{student.grade || "No grade"} · {student.primary_subject || "No subject"}</p>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={s.iconBtn} onClick={(e) => { e.stopPropagation(); startEdit(student); }}><Icon type="practice" stroke="currentColor" fill="none" size={14} /></button>
                        <button style={s.iconBtn} onClick={(e) => { e.stopPropagation(); deleteStudent(student.id); }}><Icon type="trash" stroke="currentColor" fill="none" size={14} /></button>
                      </div>
                    </div>
                    <p style={{ ...s.studentCardSessions, fontFamily: FONT }}>{stuSessions.length} session{stuSessions.length !== 1 ? "s" : ""}</p>
                  </div>
                );
              })
            }
          </div>

          <div style={s.studentDetail}>
            {!selectedStudent ? (
              <div style={s.emptyState}>
                <Icon type="user" stroke="#9ca3af" fill="#e5e7eb" size={44} style={s.emptyIcon} />
                <p style={{ ...s.emptyTitle, fontFamily: FONT }}>Select a student</p>
                <p style={{ ...s.emptySub, fontFamily: FONT }}>Choose a student from the left to see their progress.</p>
              </div>
            ) : (
              <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
                <div style={s.studentDetailHeader}>
                  <div style={{ ...s.studentCardAvatar, width: 56, height: 56, fontSize: 22 }}>{selectedStudent.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{selectedStudent.name}</h2>
                    <p style={{ margin: 0, fontSize: 14, color: "#6b7280", fontFamily: FONT }}>{selectedStudent.grade || "No grade"} · {selectedStudent.primary_subject || "No subject"} · {studentSessions.length} sessions</p>
                  </div>
                  <button style={s.addStudentBtn} onClick={() => startEdit(selectedStudent)}>Edit profile</button>
                </div>
                {selectedStudent.notes && <div style={s.notesBox}><p style={s.modalSectionLabel}>Tutor notes</p><p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6, fontFamily: FONT }}>{selectedStudent.notes}</p></div>}
                {studentSessions.length === 0 ? <p style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "40px 0", fontFamily: FONT }}>No sessions recorded yet.</p> : (
                  <>
                    <div style={s.chartCard}>
                      <p style={{ ...s.chartTitle, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}><Icon type="calendar" stroke="#7c3aed" fill="#ddd6fe" size={16} />Sessions over time — duration (minutes)</p>
                      <ResponsiveContainer width="100%" height={200}><LineChart data={buildSessionsOverTime(studentSessions)}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="duration" stroke={PURPLE} strokeWidth={2} dot={{ fill: PURPLE, r: 4 }} name="Duration (min)" /></LineChart></ResponsiveContainer>
                    </div>
                    <div style={s.chartCard}>
                      <p style={{ ...s.chartTitle, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}><Icon type="book" stroke="#7c3aed" fill="#ddd6fe" size={16} />Topics covered</p>
                      {buildTopicsCovered(studentSessions).length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13, fontFamily: FONT }}>No topics recorded yet.</p> : (
                        <ResponsiveContainer width="100%" height={200}><BarChart data={buildTopicsCovered(studentSessions)} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} /><YAxis type="category" dataKey="topic" tick={{ fontSize: 11 }} width={140} /><Tooltip /><Bar dataKey="sessions" fill={PURPLE} name="Sessions" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
                      )}
                    </div>
                    <div style={s.chartCard}>
                      <p style={{ ...s.chartTitle, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}><Icon type="smile" stroke="#7c3aed" fill="#ddd6fe" size={16} />Feelings trend</p>
                      <ResponsiveContainer width="100%" height={220}><BarChart data={buildFeelingsData(studentSessions)}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} /><Tooltip /><Legend />{FEELINGS.map((f) => <Bar key={f} dataKey={f} stackId="a" fill={FEELING_COLORS[f]} name={f} />)}</BarChart></ResponsiveContainer>
                    </div>
                    <div style={s.chartCard}>
                      <p style={{ ...s.chartTitle, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}><Icon type="clipboard" stroke="#7c3aed" fill="#ddd6fe" size={16} />Session history</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[...studentSessions].reverse().map((sess) => (
                          <div key={sess.id} style={s.sessionHistoryItem}>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 500, color: "#111827", fontFamily: FONT }}>{sess.topic || "No topic"}</p>
                              <p style={{ margin: 0, fontSize: 12, color: "#6b7280", fontFamily: FONT }}>{formatDate(sess.created_at)} · {formatTime(sess.duration_seconds || 0)}</p>
                            </div>
                            {sess.feelings?.length > 0 && <div style={{ display: "flex", gap: 4 }}>{sess.feelings.map((f) => <Icon key={f} type={FEELING_ICON[f]} stroke={FEELING_COLORS[f]} fill={FEELING_COLORS[f] + "33"} size={14} />)}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddStudent && (
        <div style={s.modalOverlay} onClick={() => { setShowAddStudent(false); resetForm(); }}>
          <div style={{ ...s.modalCard, maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ ...s.modalTitle, fontFamily: FONT }}>{editingStudent ? "Edit student" : "Add new student"}</h2>
              <button style={s.modalClose} onClick={() => { setShowAddStudent(false); resetForm(); }}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.fieldWrap}><label style={s.fieldLabel}>Name *</label><input style={s.authInput} placeholder="Student name" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
              <div style={s.fieldWrap}><label style={s.fieldLabel}>Grade level</label><select style={s.authInput} value={newGrade} onChange={(e) => setNewGrade(e.target.value)}><option value="">Select grade…</option>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
              <div style={s.fieldWrap}><label style={s.fieldLabel}>Primary subject</label><select style={s.authInput} value={newSubject} onChange={(e) => setNewSubject(e.target.value)}><option value="">Select subject…</option>{SUBJECTS.map((sub) => <option key={sub} value={sub}>{sub}</option>)}</select></div>
              <div style={s.fieldWrap}><label style={s.fieldLabel}>Notes</label><textarea style={{ ...s.authInput, height: 100, resize: "vertical" }} placeholder="e.g. Struggles with fractions…" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} /></div>
              {formError && <p style={s.authError}>{formError}</p>}
              <button style={s.authBtn} onClick={saveStudent} disabled={formLoading}>{formLoading ? "Saving…" : editingStudent ? "Save changes" : "Add student"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DASHBOARD SCREEN
// ============================================================
function DashboardScreen({ user, tutorName, avatarUrl, onNavigate, onSignOut, onResumeSession, sidebarCollapsed, onToggleSidebar }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStudent, setFilterStudent] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase.from("sessions").select("*").eq("tutor_id", user.id).order("created_at", { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  const deleteSession = async (id) => {
    if (!confirm("Delete this session?")) return;
    await supabase.from("sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const totalSessions = sessions.length;
  const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const avgDuration = totalSessions > 0 ? Math.round(totalSeconds / totalSessions) : 0;
  const subjectCounts = sessions.reduce((acc, s) => { if (s.subject) acc[s.subject] = (acc[s.subject] || 0) + 1; return acc; }, {});
  const topSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const filtered = sessions.filter((s) => {
    if (filterSubject && s.subject !== filterSubject) return false;
    if (filterStudent && !(s.student_name || "").toLowerCase().includes(filterStudent.toLowerCase())) return false;
    if (filterDateFrom && new Date(s.created_at) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(s.created_at) > new Date(filterDateTo + "T23:59:59")) return false;
    return true;
  });

  const uniqueSubjects = [...new Set(sessions.map((s) => s.subject).filter(Boolean))];

  return (
    <div style={s.app}>
      <Sidebar activeLabel="Dashboard" onNavigate={onNavigate} onSignOut={onSignOut} collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
      <div style={s.mainArea}>
        <header style={s.topbar}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#111827", fontFamily: FONT }}>Dashboard</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontFamily: FONT }}>Welcome back, {tutorName}</p>
          </div>
          <div style={s.tutorProfile}>
            <div style={s.tutorInfo}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{tutorName}</p><p style={s.tutorRole}>Tutor</p></div>
            <Avatar avatarUrl={avatarUrl} name={tutorName} size={36} onClick={() => onNavigate("profile")} />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div style={s.dashStatsRow}>
            {[["Total Sessions", totalSessions, "clipboard"], ["Hours Tutored", totalHours, "clock"], ["Top Subject", topSubject, "book"], ["Avg Duration", formatTime(avgDuration), "chart"]].map(([label, value, icon]) => (
              <div key={label} style={s.dashStatCard}>
                <Icon type={icon} stroke={PURPLE} fill={PURPLE_LIGHT} size={24} style={s.dashStatIcon} />
                <p style={{ ...s.dashStatValue, fontFamily: FONT }}>{value}</p>
                <p style={{ ...s.dashStatLabel, fontFamily: FONT }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={s.filterRow}>
            <select style={{ ...s.filterSelect, fontFamily: FONT }} value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All subjects</option>
              {uniqueSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
            </select>
            <input style={{ ...s.filterInput, fontFamily: FONT }} placeholder="Filter by student…" value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} />
            <input style={{ ...s.filterInput, fontFamily: FONT }} type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
            <input style={{ ...s.filterInput, fontFamily: FONT }} type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
            {(filterSubject || filterStudent || filterDateFrom || filterDateTo) && <button style={{ ...s.clearFilterBtn, fontFamily: FONT }} onClick={() => { setFilterSubject(""); setFilterStudent(""); setFilterDateFrom(""); setFilterDateTo(""); }}>Clear</button>}
          </div>

          {loading ? <p style={{ color: "#9ca3af", textAlign: "center", marginTop: 40, fontFamily: FONT }}>Loading…</p> :
            filtered.length === 0 ? (
              <div style={s.emptyState}>
                <Icon type="clipboard" stroke="#9ca3af" fill="#e5e7eb" size={44} style={s.emptyIcon} />
                <p style={{ ...s.emptyTitle, fontFamily: FONT }}>No sessions yet</p>
                <p style={{ ...s.emptySub, fontFamily: FONT }}>Start a session and it will appear here.</p>
                <button style={{ ...s.authBtn, fontFamily: FONT }} onClick={() => onNavigate("session")}>Start your first session</button>
              </div>
            ) : (
              <div style={s.sessionGrid}>
                {filtered.map((session) => (
                  <div key={session.id} style={s.sessionCard} onClick={() => onResumeSession(session)}>
                    <div style={s.sessionCardTop}>
                      <div>
                        <p style={{ ...s.sessionCardSubject, fontFamily: FONT }}>{session.subject || "No subject"}</p>
                        <p style={{ ...s.sessionCardTopic, fontFamily: FONT }}>{session.topic || "No topic"}</p>
                      </div>
                      <button style={s.deleteBtn} onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}><Icon type="trash" stroke="currentColor" fill="none" size={14} /></button>
                    </div>
                    <div style={s.sessionCardMeta}><span style={{ fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon type="user" stroke="#6b7280" fill="none" size={12} />{session.student_name || "No student"}</span><span style={{ fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon type="clock" stroke="#6b7280" fill="none" size={12} />{formatTime(session.duration_seconds || 0)}</span></div>
                    <div style={s.sessionCardMeta}><span style={{ fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon type="calendar" stroke="#6b7280" fill="none" size={12} />{formatDate(session.created_at)}</span><span style={{ fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon type="chat" stroke="#6b7280" fill="none" size={12} />{(session.chat_messages || []).length} messages</span></div>
                    {session.feelings?.length > 0 && <div style={s.sessionCardFeelings}>{session.feelings.map((f) => <span key={f} style={{ ...s.sessionCardFeeling, fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon type={FEELING_ICON[f]} stroke={FEELING_COLORS[f]} fill={FEELING_COLORS[f] + "33"} size={13} />{f}</span>)}</div>}
                    <div style={{ ...s.resumeHint, fontFamily: FONT }}>Click to view or resume →</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DESMOS GRAPH
// ============================================================
function DesmosGraph({ expressions, title }) {
  const containerRef = useRef(null);
  const calculatorRef = useRef(null);
  useEffect(() => {
    if (!window.Desmos) {
      const script = document.createElement("script");
      script.src = "https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fae6";
      script.onload = () => initDesmos();
      document.head.appendChild(script);
    } else { initDesmos(); }
    function initDesmos() {
      if (!containerRef.current) return;
      if (calculatorRef.current) calculatorRef.current.destroy();
      const calc = window.Desmos.GraphingCalculator(containerRef.current, { expressions: false, settingsMenu: false, zoomButtons: true, border: false, lockViewport: false, autosize: true });
      expressions.forEach((expr, i) => { calc.setExpression({ id: `expr${i}`, latex: expr, color: i === 0 ? "#7c3aed" : i === 1 ? "#e11d48" : "#059669" }); });
      calculatorRef.current = calc;
    }
    return () => { if (calculatorRef.current) calculatorRef.current.destroy(); };
  }, [expressions]);
  return (
    <div style={s.graphWrapper}>
      {title && <div style={{ ...s.graphTitle, display: "flex", alignItems: "center", gap: 5 }}><Icon type="chart" stroke="#6b7280" fill="none" size={13} />{title}</div>}
      <div ref={containerRef} style={s.graphContainer} />
    </div>
  );
}

function parseMessage(content) {
  const visualMatch = content.match(/VISUAL:(\{.*?\})/s);
  if (!visualMatch) return { text: content, visual: null };
  try {
    const visual = JSON.parse(visualMatch[1]);
    const text = content.replace(/VISUAL:\{.*?\}/s, "").trim();
    return { text, visual };
  } catch { return { text: content, visual: null }; }
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const { text, visual } = parseMessage(message.content);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
      <div style={{ ...s.bubble, ...(isUser ? s.userBubble : s.aiBubble), fontFamily: FONT }}>{text}</div>
      {!isUser && visual && visual.type === "graph" && <DesmosGraph expressions={visual.expressions || []} title={visual.title || ""} />}
    </div>
  );
}

// ============================================================
// REPORT SCREEN
// ============================================================
function ReportScreen({ report, duration, subject, topic, toolsUsed, messageCount, onNewSession, onNavigate }) {
  return (
    <div style={s.reportScreen}>
      <div style={s.reportCard}>
        <div style={s.reportHeader}>
          <div style={s.reportIcon}><Icon type="clipboard" stroke={PURPLE} fill={PURPLE_LIGHT} size={24} /></div>
          <div>
            <h2 style={{ ...s.reportTitle, fontFamily: FONT }}>Post-session reflection report</h2>
            <p style={{ ...s.reportMeta, fontFamily: FONT }}>{subject && topic ? `${subject} · ${topic} · ` : ""}{formatTime(duration)}</p>
          </div>
        </div>
        <div style={s.statsRow}>
          {[["Duration", formatTime(duration)], ["Messages", messageCount], ["Hints", toolsUsed.hints], ["Problems", toolsUsed.problems], ["Concept Explanations", toolsUsed.misconceptions], ["Next Steps", toolsUsed.nextSteps]].map(([label, value]) => (
            <div key={label} style={s.statCard}><p style={{ ...s.statLabel, fontFamily: FONT }}>{label}</p><p style={{ ...s.statValue, fontFamily: FONT }}>{value}</p></div>
          ))}
        </div>
        <div style={s.reportBody}>
          {report ? <p style={{ ...s.reportText, fontFamily: FONT }}>{report}</p> : <p style={{ color: "#94a3b8", fontStyle: "italic", fontFamily: FONT }}>Generating your report…</p>}
        </div>
        <div style={s.reportActions}>
          <button style={{ ...s.reportActionBtn, fontFamily: FONT }} onClick={onNewSession}><Icon type="play" stroke="currentColor" fill="none" size={16} style={s.reportActionIcon} /><span>New Session</span></button>
          <button style={{ ...s.reportActionBtn, ...s.reportActionSecondary, fontFamily: FONT }} onClick={() => onNavigate("dashboard")}><Icon type="grid" stroke="currentColor" fill="none" size={16} style={s.reportActionIcon} /><span>Dashboard</span></button>
          <button style={{ ...s.reportActionBtn, ...s.reportActionSecondary, fontFamily: FONT }} onClick={() => onNavigate("progress")}><Icon type="chart" stroke="currentColor" fill="none" size={16} style={s.reportActionIcon} /><span>Student Progress</span></button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS PAGE
// ============================================================
function SettingsPage({ tutorName, avatarUrl, user, onNavigate, onSignOut, sidebarCollapsed, onToggleSidebar }) {
  const [copied, setCopied] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadData = async () => {
    if (!user) return;
    const { data } = await supabase.from("sessions").select("*").eq("tutor_id", user.id);
    const blob = new Blob([JSON.stringify(data || [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tutorguide-data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAllData = async () => {
    if (!user) return;
    if (!confirm("Delete ALL sessions and student records? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure?")) return;
    await supabase.from("sessions").delete().eq("tutor_id", user.id);
    await supabase.from("students").delete().eq("tutor_id", user.id);
    alert("All data deleted.");
  };

  const sectionStyle = s.profileCard;
  const sectionTitle = s.profileSectionTitle;
  const labelStyle = { margin: 0, fontSize: 14, fontWeight: 500, color: "#111827", fontFamily: FONT };
  const subLabelStyle = { margin: "2px 0 0", fontSize: 12, color: "#6b7280", fontFamily: FONT };

  return (
    <div style={s.app}>
      <Sidebar activeLabel="Settings" onNavigate={onNavigate} onSignOut={onSignOut} collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
      <div style={s.mainArea}>
        <header style={s.topbar}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#111827", fontFamily: FONT }}>Settings</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontFamily: FONT }}>Manage your preferences and account</p>
          </div>
          <div style={s.tutorProfile}>
            <div style={s.tutorInfo}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{tutorName}</p><p style={s.tutorRole}>Tutor</p></div>
            <Avatar avatarUrl={avatarUrl} name={tutorName} size={36} onClick={() => onNavigate("profile")} />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 600 }}>

            {/* Account */}
            <div style={sectionStyle}>
              <p style={sectionTitle}>Account</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button style={{ ...s.authBtn, marginTop: 0 }} onClick={() => onNavigate("profile")}>View Profile</button>
                <button style={{ ...s.dangerBtn, width: "100%", padding: 12, borderRadius: 10, fontSize: 14 }} onClick={onSignOut}>Sign Out</button>
              </div>
            </div>

            {/* Onboarding */}
            <div style={sectionStyle}>
              <p style={sectionTitle}>Onboarding</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={labelStyle}>Invite a tutor</p>
                  <p style={subLabelStyle}>Share this app's signup link with another tutor to create their account</p>
                </div>
                <button onClick={shareLink} style={{ ...s.uploadBtn, marginLeft: 16, flexShrink: 0, background: copied ? "#dcfce7" : undefined, color: copied ? "#15803d" : undefined, borderColor: copied ? "#86efac" : undefined }}>
                  {copied ? "✓ Copied!" : "Share signup link"}
                </button>
              </div>
            </div>

            {/* Privacy & Data */}
            <div style={sectionStyle}>
              <p style={sectionTitle}>Privacy & Data</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button style={{ ...s.uploadBtn, textAlign: "left" }} onClick={downloadData}>⬇ Download my data</button>
                <button style={{ ...s.dangerBtn, textAlign: "left", display: "flex", alignItems: "center", gap: 6 }} onClick={deleteAllData}><Icon type="trash" stroke="currentColor" fill="none" size={14} />Delete all my data</button>
                <button style={{ ...s.authLink, textAlign: "left", padding: 0, fontSize: 14 }} onClick={() => setShowPrivacy(true)}>View Privacy Policy →</button>
              </div>
            </div>

            {/* About */}
            <div style={sectionStyle}>
              <p style={sectionTitle}>About</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: FONT }}>TutorGuide AI</p>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontFamily: FONT }}>Version 1.0.0</p>
                <a href="mailto:feedback@tutorguide.ai" style={{ fontSize: 13, color: PURPLE, fontFamily: FONT, textDecoration: "none", marginTop: 4 }}>Send feedback →</a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showPrivacy && (
        <div style={s.modalOverlay} onClick={() => setShowPrivacy(false)}>
          <div style={{ ...s.modalCard, maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ ...s.modalTitle, fontFamily: FONT }}>Privacy Policy</h2>
              <button style={s.modalClose} onClick={() => setShowPrivacy(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <pre style={s.privacyText}>{PRIVACY_POLICY}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [tutorName, setTutorName] = useState("Tutor");
  const [authLoading, setAuthLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Live Sessions");
  const [showProfile, setShowProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [screen, setScreen] = useState("session");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const [frozenSession, setFrozenSession] = useState(null);
  const [isResumed, setIsResumed] = useState(false);

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [showNewStudentQuick, setShowNewStudentQuick] = useState(false);
  const [quickStudentName, setQuickStudentName] = useState("");
  const [quickStudentGrade, setQuickStudentGrade] = useState("");

  const [openSubject, setOpenSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [sessionPlan, setSessionPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [feelings, setFeelings] = useState([]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [toolsUsed, setToolsUsed] = useState({ hints: 0, problems: 0, misconceptions: 0, nextSteps: 0, graphs: 0 });
  const [report, setReport] = useState(null);

  const [transcript, setTranscript] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const [transcriptWidth, setTranscriptWidth] = useState(300);
  const isDraggingTranscript = useRef(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      // If the landing page signed someone in and handed off their session via
      // the URL hash (#access_token=…&refresh_token=…), adopt it before reading
      // the stored session, then strip it from the URL.
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setTutorName(session.user.user_metadata?.full_name || session.user.email.split("@")[0]);
        const { data } = await supabase.from("profiles").select("avatar_url").eq("id", session.user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      }
      setAuthLoading(false);
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUser(session.user); setTutorName(session.user.user_metadata?.full_name || session.user.email.split("@")[0]); }
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) fetchStudents(); }, [user]);
  const fetchStudents = async () => { const { data } = await supabase.from("students").select("*").eq("tutor_id", user.id).order("name"); setStudents(data || []); };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript, interimText]);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSpeechSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const now = new Date();
          const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
          setTranscript((prev) => [...prev, { time, text: result[0].transcript.trim() }]);
          setInterimText("");
        } else { interim += result[0].transcript; }
      }
      setInterimText(interim);
    };
    recognition.onerror = (event) => { if (event.error === "not-allowed") alert("Microphone access was denied."); setIsListening(false); };
    recognition.onend = () => { if (recognitionRef.current?._shouldRestart) { try { recognition.start(); } catch {} } };
    recognitionRef.current = recognition;
    return () => { recognition.stop(); };
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); setUser(null); };

  const handleToggleSidebar = () => setSidebarCollapsed((c) => !c);

  // ----------------------------------------------------------
  // NAVIGATION — session continuity fix
  // "session" nav just switches view, "newSession" actually resets
  // ----------------------------------------------------------
  const handleNavigate = (dest) => {
    setShowProfile(false);
    if (dest === "newSession") {
      setActiveNav("Live Sessions");
      newSession();
    } else if (dest === "session") {
      setActiveNav("Live Sessions");
      // Just switch view — do NOT reset session
    } else if (dest === "dashboard") {
      setActiveNav("Dashboard");
    } else if (dest === "progress") {
      setActiveNav("Student Progress");
    } else if (dest === "resources") {
      setActiveNav("Resources");
    } else if (dest === "settings") {
      setActiveNav("Settings");
    } else if (dest === "profile") {
      setShowProfile(true);
    }
  };

  const handleResumeSession = (sessionRecord) => {
    setFrozenSession(sessionRecord);
    setIsResumed(false);
    setMessages(sessionRecord.chat_messages || []);
    setSelectedSubject(sessionRecord.subject || null);
    setSelectedTopic(sessionRecord.topic || null);
    setStudentName(sessionRecord.student_name || "");
    setFeelings(sessionRecord.feelings || []);
    setSessionPlan(sessionRecord.session_plan || null);
    setToolsUsed(sessionRecord.tools_used || { hints: 0, problems: 0, misconceptions: 0, nextSteps: 0, graphs: 0 });
    setReport(sessionRecord.reflection_report || null);
    if (sessionRecord.speech_transcript) {
      const lines = sessionRecord.speech_transcript.split("\n").map((line) => {
        const match = line.match(/^\[(\d+:\d+)\] (.*)$/);
        return match ? { time: match[1], text: match[2] } : { time: "", text: line };
      }).filter((e) => e.text);
      setTranscript(lines);
    } else { setTranscript([]); }
    setElapsed(sessionRecord.duration_seconds || 0);
    clearInterval(timerRef.current);
    setScreen("frozen");
    setActiveNav("Live Sessions");
  };

  const handleResume = () => { setIsResumed(true); timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000); };
  const handleBackToDashboard = () => { clearInterval(timerRef.current); setScreen("session"); setFrozenSession(null); setIsResumed(false); setActiveNav("Dashboard"); newSession(); };

  const toggleListening = () => {
    if (!recognitionRef.current || (!isResumed && screen === "frozen")) return;
    if (isListening) { recognitionRef.current._shouldRestart = false; recognitionRef.current.stop(); setIsListening(false); setInterimText(""); }
    else { try { recognitionRef.current._shouldRestart = true; recognitionRef.current.start(); setIsListening(true); } catch (e) { console.error(e); } }
  };

  const clearTranscript = () => { setTranscript([]); setInterimText(""); };

  const quickAddStudent = async () => {
    if (!quickStudentName.trim()) return;
    const { data, error } = await supabase.from("students").insert({ tutor_id: user.id, name: quickStudentName, grade: quickStudentGrade }).select().single();
    if (!error && data) { await fetchStudents(); setSelectedStudentId(data.id); setStudentName(data.name); setShowNewStudentQuick(false); setQuickStudentName(""); setQuickStudentGrade(""); }
  };

  const saveSession = async (reflectionReport) => {
    if (!user) return;
    const sessionData = { duration_seconds: elapsed, student_name: studentName || null, student_id: selectedStudentId || null, subject: selectedSubject || null, topic: selectedTopic || null, session_plan: sessionPlan || null, feelings, tools_used: toolsUsed, chat_messages: messages, speech_transcript: transcript.map((e) => `[${e.time}] ${e.text}`).join("\n"), reflection_report: reflectionReport };
    if (frozenSession && isResumed) {
      const { error } = await supabase.from("sessions").update(sessionData).eq("id", frozenSession.id);
      if (error) console.error("Error updating session:", error);
    } else {
      const { error } = await supabase.from("sessions").insert({ tutor_id: user.id, date: new Date().toISOString(), ...sessionData });
      if (error) console.error("Error saving session:", error);
    }
  };

  const endSession = async () => {
    clearInterval(timerRef.current);
    if (recognitionRef.current) { recognitionRef.current._shouldRestart = false; recognitionRef.current.stop(); }
    setIsListening(false); setScreen("report"); setReport(null);
    const transcriptText = transcript.map((e) => e.text).join(" ");
    const sessionSummary = `Subject: ${selectedSubject || "Not specified"}\nTopic: ${selectedTopic || "Not specified"}\nStudent: ${studentName || "Not specified"}\nDuration: ${formatTime(elapsed)}\nMessages: ${messages.length}\nTools: ${toolsUsed.hints} hints, ${toolsUsed.problems} practice problems, ${toolsUsed.misconceptions} concept explanations, ${toolsUsed.nextSteps} next steps\nFeelings: ${feelings.join(", ") || "Not tracked"}\nTranscript: ${transcriptText || "None"}\n\nChat:\n${messages.map((m) => `${m.role === "user" ? "Tutor" : "Coach"}: ${m.content}`).join("\n")}`;
    try {
      const res = await fetch(`${API_URL}/chat`, { method: "POST", headers: await getAuthHeaders(), body: JSON.stringify({ messages: [{ role: "user", content: `Generate a post-session reflection report with four labeled sections:\n1. SESSION SUMMARY\n2. STUDENT LEARNING INSIGHTS\n3. COACHING FEEDBACK\n4. TOOLS USED\nKeep each 2-4 sentences.\nData:\n${sessionSummary}` }] }) });
      const data = await res.json();
      const reflectionReport = data.reply || "Could not generate report.";
      setReport(reflectionReport);
      await saveSession(reflectionReport);
    } catch { setReport("Could not reach the server."); }
  };

  const newSession = () => {
    clearInterval(timerRef.current);
    setScreen("session"); setElapsed(0); setMessages([]); setSelectedTopic(null); setSelectedSubject(null); setOpenSubject(null); setSessionPlan(null); setFeelings([]); setToolsUsed({ hints: 0, problems: 0, misconceptions: 0, nextSteps: 0, graphs: 0 }); setReport(null); setInput(""); setActiveButton(null); setStudentName(""); setSelectedStudentId(""); setTranscript([]); setInterimText(""); setIsListening(false); setFrozenSession(null); setIsResumed(false);
    timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
  };

  const toggleFeeling = (f) => { if (screen === "frozen" && !isResumed) return; setFeelings((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]); };

  const generatePlan = async () => {
    if (!selectedSubject || !selectedTopic) return;
    setPlanLoading(true); setSessionPlan(null);
    try {
      const res = await fetch(`${API_URL}/generate-plan`, { method: "POST", headers: await getAuthHeaders(), body: JSON.stringify({ subject: selectedSubject, topic: selectedTopic }) });
      const data = await res.json();
      setSessionPlan(data.plan || "Could not generate plan.");
    } catch { setSessionPlan("Could not reach the server."); }
    finally { setPlanLoading(false); }
  };

  const getSessionContext = () => ({ subject: selectedSubject || "", topic: selectedTopic || "", sessionPlan: sessionPlan || "", feelings, transcript: transcript.map((e) => e.text).join(" ") });

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
  };

  const startTranscriptResize = (e) => {
    e.preventDefault(); isDraggingTranscript.current = true;
    const onMove = (e) => { if (!isDraggingTranscript.current) return; setTranscriptWidth(Math.min(600, Math.max(150, e.clientX - 240 - 24))); };
    const onUp = () => { isDraggingTranscript.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  const callAI = async (prompt, label, toolType) => {
    if (screen === "frozen" && !isResumed) return;
    setLoading(true);
    const newMessages = [...messages, { role: "user", content: label }];
    setMessages(newMessages);
    if (toolType) setToolsUsed((prev) => ({ ...prev, [toolType]: prev[toolType] + 1 }));
    try {
      const res = await fetch(`${API_URL}/chat`, { method: "POST", headers: await getAuthHeaders(), body: JSON.stringify({ messages: [{ role: "user", content: prompt }], ...getSessionContext() }) });
      const data = await res.json();
      const reply = data.reply || "Error: " + (data.error || "something went wrong");
      if (reply.includes("VISUAL:")) setToolsUsed((prev) => ({ ...prev, graphs: prev.graphs + 1 }));
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch { setMessages([...newMessages, { role: "assistant", content: "Could not reach the server." }]); }
    finally { setLoading(false); }
  };

  const handleHint = (level) => {
    const prompts = { Clue: "Give the tutor a subtle Socratic nudge. 1-2 sentences.", Partial: "Give a partial hint — reveal the key insight but not the full solution. 2-3 sentences.", Full: "Give a full step-by-step explanation." };
    callAI(`[Hint — ${level} level]\n${prompts[level]}`, `💡 Hint — ${level} level`, "hints"); setActiveButton(null);
  };

  const handlePractice = (difficulty) => {
    const prompts = { Easy: "Generate an easy practice problem. Include a solution key.", Medium: "Generate a medium difficulty practice problem. Include a solution key.", Hard: "Generate a challenging multi-step practice problem. Include a solution key." };
    callAI(`[Practice Problem — ${difficulty}]\n${prompts[difficulty]}`, `📝 Practice Problem — ${difficulty}`, "problems"); setActiveButton(null);
  };

  const handleMisconception = () => callAI(`[Concept explanation]\nProvide a clear, tutor-friendly explanation of this concept: (1) what it is in plain terms, (2) a simple analogy or visual to make it click, (3) common sticking points to watch for, (4) a follow-up question to check understanding.`, `💡 Concept explanation`, "misconceptions");
  const handleNextStep = () => callAI(`[Next step]\nGive 2-3 concrete ranked options. Be brief.`, `➡️ Next Step`, "nextSteps");

  const sendMessage = async () => {
    if (!input.trim() || loading || (screen === "frozen" && !isResumed)) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages); setInput(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, { method: "POST", headers: await getAuthHeaders(), body: JSON.stringify({ messages: newMessages, ...getSessionContext() }) });
      const data = await res.json();
      const reply = data.reply || "Error: " + (data.error || "something went wrong");
      if (reply.includes("VISUAL:")) setToolsUsed((prev) => ({ ...prev, graphs: prev.graphs + 1 }));
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch { setMessages([...newMessages, { role: "assistant", content: "Could not reach the server." }]); }
    finally { setLoading(false); }
  };

  if (authLoading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: FONT, color: "#6b7280" }}>Loading…</div>;
  if (!user) return <AuthScreen onAuth={(user, name) => { setUser(user); setTutorName(name); }} />;

  if (showProfile) return <ProfilePage user={user} tutorName={tutorName} setTutorName={setTutorName} avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} onNavigate={handleNavigate} onSignOut={handleSignOut} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={handleToggleSidebar} />;
  if (activeNav === "Dashboard") return <DashboardScreen user={user} tutorName={tutorName} avatarUrl={avatarUrl} onNavigate={handleNavigate} onSignOut={handleSignOut} onResumeSession={handleResumeSession} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={handleToggleSidebar} />;
  if (activeNav === "Student Progress") return <StudentProgressPage user={user} tutorName={tutorName} avatarUrl={avatarUrl} onNavigate={handleNavigate} onSignOut={handleSignOut} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={handleToggleSidebar} />;
  if (activeNav === "Resources") return <ResourcesPage tutorName={tutorName} avatarUrl={avatarUrl} onNavigate={handleNavigate} onSignOut={handleSignOut} currentSubject={selectedSubject} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={handleToggleSidebar} />;
  if (activeNav === "Settings") return <SettingsPage tutorName={tutorName} avatarUrl={avatarUrl} user={user} onNavigate={handleNavigate} onSignOut={handleSignOut} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={handleToggleSidebar} />;
  if (screen === "report") return <ReportScreen report={report} duration={elapsed} subject={selectedSubject} topic={selectedTopic} toolsUsed={toolsUsed} messageCount={messages.length} onNewSession={newSession} onNavigate={handleNavigate} />;

  const isFrozen = screen === "frozen" && !isResumed;

  return (
    <div style={s.app}>
      {sidebarCollapsed ? (
        <aside style={{ ...s.sidebar, width: 20, minWidth: 20, overflow: "visible", position: "relative", flexShrink: 0, transition: "width 0.25s ease, min-width 0.25s ease" }}>
          <button onClick={handleToggleSidebar} style={SIDEBAR_ARROW_BTN}>›</button>
        </aside>
      ) : (
      <aside style={{ ...s.sidebar, position: "relative", overflow: "visible", transition: "width 0.25s ease, min-width 0.25s ease" }}>
        <button onClick={handleToggleSidebar} style={SIDEBAR_ARROW_BTN}>‹</button>
        <div style={{ ...s.sidebarLogo, cursor: "pointer" }} onClick={() => { window.location.href = LANDING_URL; }} title="Go to landing page"><img src={tutorGuideLogo} alt="TutorGuide AI" style={{ height: 28, width: "auto" }} /><span style={{ ...s.logoText, fontFamily: FONT }}>TutorGuide AI</span></div>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <nav style={s.nav}>
            {NAV_ITEMS.map((item) => (
              <button key={item.label} style={{ ...s.navItem, ...(activeNav === item.label ? s.navItemActive : {}), fontFamily: FONT }} onClick={() => handleNavigate(item.label === "Dashboard" ? "dashboard" : item.label === "Live Sessions" ? "session" : item.label === "Student Progress" ? "progress" : item.label === "Resources" ? "resources" : item.label === "Settings" ? "settings" : "session")}>
                <Icon type={item.icon} stroke="currentColor" fill="none" size={16} style={s.navIcon} /><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div style={s.sidebarSection}>
            <p style={{ ...s.sidebarSectionTitle, fontFamily: FONT }}>Subject</p>
            {Object.keys(CURRICULUM).map((subject) => (
              <div key={subject}>
                <button style={{ ...s.subjectPill, ...(openSubject === subject ? s.subjectPillOpen : {}), fontFamily: FONT }} onClick={() => !isFrozen && setOpenSubject(openSubject === subject ? null : subject)}>
                  <span>{subject}</span><span style={s.chevron}>{openSubject === subject ? "▲" : "▼"}</span>
                </button>
                {openSubject === subject && !isFrozen && (
                  <div style={s.dropdown}>
                    {Object.entries(CURRICULUM[subject]).map(([unit, topics]) => (
                      <div key={unit} style={s.unit}>
                        <p style={{ ...s.unitLabel, fontFamily: FONT }}>{unit}</p>
                        {topics.map((topic) => (
                          <button key={topic} style={{ ...s.topicItem, ...(selectedTopic === topic ? s.topicItemActive : {}), fontFamily: FONT }} onClick={() => { setSelectedTopic(topic); setSelectedSubject(subject); setSessionPlan(null); }}>
                            {selectedTopic === topic && <span style={{ color: "#a78bfa" }}>✓ </span>}{topic}
                          </button>
                        ))}
                      </div>
                    ))}
                    {selectedSubject === subject && selectedTopic && (
                      <button style={{ ...s.generateBtn, fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={generatePlan} disabled={planLoading}>{planLoading ? "Generating…" : (<><Icon type="star" stroke="currentColor" fill="none" size={14} />Generate Plan</>)}</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {sessionPlan && <div style={s.planBox}><p style={{ ...s.planTitle, fontFamily: FONT, display: "flex", alignItems: "center", gap: 5 }}><Icon type="clipboard" stroke={PURPLE_LIGHT} fill="none" size={12} />{selectedTopic}</p><p style={{ ...s.planText, fontFamily: FONT }}>{sessionPlan}</p></div>}
          <div style={s.sidebarSection}>
            <p style={{ ...s.sidebarSectionTitle, fontFamily: FONT }}>Student is feeling…</p>
            <div style={s.pillWrap}>
              {FEELINGS.map((f) => (
                <button key={f} onClick={() => toggleFeeling(f)} style={{ ...s.feelingPill, ...(feelings.includes(f) ? s.feelingPillActive : {}), ...(isFrozen ? { opacity: 0.5, cursor: "not-allowed" } : {}), fontFamily: FONT }}>
                  <Icon type={FEELING_ICON[f]} stroke={FEELING_COLORS[f]} fill={FEELING_COLORS[f] + "33"} size={14} style={{ marginRight: 4, verticalAlign: "-3px" }} />{f}
                </button>
              ))}
            </div>
            {feelings.length > 0 && <p style={{ ...s.feelingNote, fontFamily: FONT }}>Adapting to: {feelings.join(", ")}</p>}
          </div>
        </div>
        <div style={s.sidebarBottom}>
          <button style={{ ...s.newSessionSideBtn, fontFamily: FONT }} onClick={() => handleNavigate("newSession")}>+ Start New Session</button>
          <button style={{ ...s.sideBottomLink, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}><Icon type="help" stroke="currentColor" fill="none" size={14} />Help Center</button>
          <button style={{ ...s.sideBottomLink, fontFamily: FONT }} onClick={handleSignOut}>→ Sign Out</button>
        </div>
      </aside>
      )}

      <div style={s.mainArea}>
        {isFrozen && (
          <div style={s.frozenBanner}>
            <div style={s.frozenBannerLeft}>
              <Icon type="snowflake" stroke="currentColor" fill="none" size={20} style={s.frozenIcon} />
              <div>
                <p style={{ ...s.frozenTitle, fontFamily: FONT }}>Viewing past session — {formatDate(frozenSession?.date)}</p>
                <p style={{ ...s.frozenSub, fontFamily: FONT }}>This session is frozen. Resume to continue coaching.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...s.resumeBtn, fontFamily: FONT }} onClick={handleResume}>▶ Resume Session</button>
              <button style={{ ...s.viewSummaryBtn, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setScreen("report")}><Icon type="clipboard" stroke="currentColor" fill="none" size={14} />View Summary</button>
              <button style={{ ...s.backBtn, fontFamily: FONT }} onClick={handleBackToDashboard}>← Back to Dashboard</button>
            </div>
          </div>
        )}

        <header style={s.topbar}>
          <div style={s.studentCard}>
            <div style={s.studentAvatar}>{studentName ? studentName.charAt(0).toUpperCase() : "?"}</div>
            <div>
              {isFrozen ? (
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{studentName || "No student"}</p>
              ) : showNewStudentQuick ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <input style={{ ...s.authInput, padding: "4px 8px", fontSize: 13, width: 160, fontFamily: FONT }} placeholder="Student name *" value={quickStudentName} onChange={(e) => setQuickStudentName(e.target.value)} />
                  <div style={{ display: "flex", gap: 4 }}>
                    <select style={{ ...s.authInput, padding: "4px 8px", fontSize: 12, flex: 1, fontFamily: FONT }} value={quickStudentGrade} onChange={(e) => setQuickStudentGrade(e.target.value)}>
                      <option value="">Grade…</option>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button style={{ ...s.levelBtn, fontSize: 11, padding: "4px 8px", fontFamily: FONT }} onClick={quickAddStudent}>Add</button>
                    <button style={{ ...s.cancelBtn, fontSize: 11, fontFamily: FONT }} onClick={() => setShowNewStudentQuick(false)}>✕</button>
                  </div>
                </div>
              ) : (
                <select style={{ border: "none", outline: "none", fontSize: 15, fontWeight: 600, color: "#111827", fontFamily: FONT, background: "transparent", maxWidth: 180 }} value={selectedStudentId}
                  onChange={(e) => {
                    if (e.target.value === "__new__") { setShowNewStudentQuick(true); return; }
                    setSelectedStudentId(e.target.value);
                    const found = students.find((st) => st.id === e.target.value);
                    setStudentName(found ? found.name : "");
                  }}>
                  <option value="">Select student…</option>
                  {students.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                  <option value="__new__">+ New student</option>
                </select>
              )}
              <p style={{ ...s.studentTag, fontFamily: FONT, display: "flex", alignItems: "center", gap: 5 }}>{isFrozen ? <><Icon type="book" stroke="currentColor" fill="none" size={12} />Read-only</> : <><Icon type="lightning" stroke="currentColor" fill="none" size={12} />AI Assisted Tutoring</>}</p>
            </div>
          </div>
          <div style={s.topRight}>
            <span style={{ ...s.timer, fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="clock" stroke="currentColor" fill="none" size={13} />{formatTime(elapsed)}{isFrozen ? " (paused)" : ""}</span>
            {(!isFrozen || isResumed) && <button style={{ ...s.endBtn, fontFamily: FONT }} onClick={endSession}>End Session</button>}
            <div style={s.tutorProfile}>
              <div style={s.tutorInfo}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{tutorName}</p><p style={{ ...s.tutorRole, fontFamily: FONT }}>Tutor</p></div>
              <Avatar avatarUrl={avatarUrl} name={tutorName} size={36} onClick={() => setShowProfile(true)} />
            </div>
          </div>
        </header>

        <div style={s.panels}>
          <section style={{ ...s.transcript, width: transcriptWidth, minWidth: transcriptWidth, maxWidth: transcriptWidth }}>
            <div style={s.panelHeader}>
              <h2 style={{ ...s.panelTitle, fontFamily: FONT }}>Transcript</h2>
              {isListening && <span style={{ ...s.liveBadge, fontFamily: FONT }}>● LIVE</span>}
              {isFrozen && <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: FONT }}>read-only</span>}
            </div>
            {!isFrozen && (
              <div style={s.transcriptControls}>
                {!speechSupported ? <p style={{ ...s.browserWarning, fontFamily: FONT, display: "flex", alignItems: "center", gap: 5 }}><Icon type="warning" stroke="currentColor" fill="none" size={13} />Use Chrome, Edge, or Safari.</p> : (
                  <>
                    <button style={{ ...s.listenBtn, ...(isListening ? s.listenBtnActive : {}), fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={toggleListening}>{isListening ? <><Icon type="stop" stroke="currentColor" fill="currentColor" size={13} />Stop</> : <><Icon type="mic" stroke="currentColor" fill="none" size={14} />Start Listening</>}</button>
                    <button style={{ ...s.clearBtn, fontFamily: FONT }} onClick={clearTranscript}>Clear</button>
                  </>
                )}
              </div>
            )}
            <div style={s.transcriptBody}>
              {transcript.length === 0 && !interimText ? (
                <p style={{ ...s.placeholder, fontFamily: FONT }}>{isFrozen ? "No transcript recorded." : "Press Start Listening to begin."}</p>
              ) : (
                <div>
                  {transcript.map((entry, i) => <div key={i} style={s.transcriptEntry}><span style={{ ...s.transcriptTime, fontFamily: FONT }}>{entry.time}</span><span style={{ ...s.transcriptText, fontFamily: FONT }}>{entry.text}</span></div>)}
                  {interimText && <div style={s.transcriptEntry}><span style={{ ...s.transcriptTime, fontFamily: FONT }}>…</span><span style={{ ...s.transcriptText, color: "#9ca3af", fontStyle: "italic", fontFamily: FONT }}>{interimText}</span></div>}
                  <div ref={transcriptEndRef} />
                </div>
              )}
            </div>
          </section>

          <div style={s.divider} onMouseDown={startTranscriptResize} title="Drag to resize" />

          <section style={{ ...s.coach, flex: 1, minWidth: 280 }}>
            <div style={s.panelHeader}>
              <h2 style={{ ...s.panelTitle, fontFamily: FONT }}>AI Coach</h2>
              {isFrozen ? <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: FONT }}>read-only</span> : <Icon type="star" stroke={PURPLE} fill={PURPLE_LIGHT} size={16} />}
            </div>
            {(selectedTopic || feelings.length > 0) && (
              <div style={s.contextBadge}>
                {selectedTopic && <span style={{ ...s.badge, fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon type="book" stroke={PURPLE} fill="none" size={12} />{selectedTopic}</span>}
                {feelings.map((f) => <span key={f} style={{ ...s.badge, ...s.feelingBadge, fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon type={FEELING_ICON[f]} stroke={FEELING_COLORS[f]} fill={FEELING_COLORS[f] + "33"} size={13} />{f}</span>)}
              </div>
            )}
            <div style={s.chatBox}>
              {messages.length === 0 && <p style={{ ...s.placeholder, fontFamily: FONT }}>{selectedTopic ? `Ready to coach on ${selectedTopic}.` : "Select a subject and topic on the left."}</p>}
              {messages.map((m, i) => <ChatBubble key={i} message={m} />)}
              {loading && <div style={{ ...s.thinking, fontFamily: FONT }}>Coach is thinking…</div>}
              <div ref={chatEndRef} />
            </div>
            <div style={{ ...s.actionGrid, opacity: isFrozen ? 0.4 : 1, pointerEvents: isFrozen ? "none" : "auto" }}>
              {activeButton === "hint" ? (
                <div style={s.levelGroupGrid}>
                  <p style={{ ...s.levelLabelGrid, fontFamily: FONT }}>Hint level:</p>
                  <div style={s.levelBtns}>
                    {["Clue", "Partial", "Full"].map((level) => <button key={level} style={{ ...s.levelBtn, fontFamily: FONT }} onClick={() => handleHint(level)}>{level}</button>)}
                    <button style={{ ...s.cancelBtn, fontFamily: FONT }} onClick={() => setActiveButton(null)}>✕</button>
                  </div>
                </div>
              ) : <button style={{ ...s.actionBtn, ...s.hintBtn, fontFamily: FONT }} onClick={() => setActiveButton("hint")}><Icon type="hint" stroke="#92400e" fill="#fcd34d" /><span>Hint</span></button>}
              {activeButton === "practice" ? (
                <div style={s.levelGroupGrid}>
                  <p style={{ ...s.levelLabelGrid, fontFamily: FONT }}>Difficulty:</p>
                  <div style={s.levelBtns}>
                    {["Easy", "Medium", "Hard"].map((level) => <button key={level} style={{ ...s.levelBtn, fontFamily: FONT }} onClick={() => handlePractice(level)}>{level}</button>)}
                    <button style={{ ...s.cancelBtn, fontFamily: FONT }} onClick={() => setActiveButton(null)}>✕</button>
                  </div>
                </div>
              ) : <button style={{ ...s.actionBtn, ...s.practiceBtn, fontFamily: FONT }} onClick={() => setActiveButton("practice")}><Icon type="practice" stroke="#5b21b6" fill="#c4b5fd" /><span>Practice Problem</span></button>}
              <button style={{ ...s.actionBtn, ...s.miscBtn, fontFamily: FONT }} onClick={handleMisconception}><Icon type="book" stroke="#0369a1" fill="#7dd3fc" /><span>Concept Explanation</span></button>
              <button style={{ ...s.actionBtn, ...s.nextBtn, fontFamily: FONT }} onClick={handleNextStep}><Icon type="arrow" stroke="#15803d" fill="#86efac" /><span>Next Step</span></button>
            </div>
            <div style={{ ...s.inputRow, opacity: isFrozen ? 0.4 : 1 }}>
              <input style={{ ...s.input, fontFamily: FONT }} value={input} onChange={(e) => !isFrozen && setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={isFrozen ? "Resume session to chat…" : selectedTopic ? `Ask about ${selectedTopic}…` : "Type a coaching question…"} disabled={isFrozen} />
              <button style={s.sendBtn} onClick={sendMessage} disabled={loading || isFrozen}>➤</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================
const s = {
  authWrap: { minHeight: "100vh", background: "linear-gradient(135deg, #ede9fe 0%, #f0f4ff 40%, #fce7f3 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 20 },
  authCard: { background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 20, padding: 40, width: "100%", maxWidth: 420, border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 8px 32px rgba(124,58,237,0.12)" },
  authLogo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  authLogoIcon: { fontSize: 28 },
  authLogoText: { fontSize: 20, fontWeight: 600, color: "#111827", fontFamily: FONT },
  authTitle: { margin: "0 0 6px", fontSize: 24, fontWeight: 600, color: "#111827", fontFamily: FONT },
  authSub: { margin: "0 0 24px", fontSize: 14, color: "#6b7280", fontFamily: FONT },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6, fontFamily: FONT },
  authInput: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(209,213,219,0.8)", fontSize: 15, fontFamily: FONT, outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.8)" },
  authBtn: { width: "100%", padding: 14, borderRadius: 10, background: PURPLE, color: "white", border: "none", fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 8, fontFamily: FONT },
  authDivider: { display: "flex", alignItems: "center", gap: 12, margin: "16px 0 8px" },
  authDividerText: { fontSize: 12, color: "#9ca3af", fontFamily: FONT, background: "transparent", padding: "0 4px", flexShrink: 0, borderTop: "none" },
  googleBtn: { width: "100%", padding: "12px 14px", borderRadius: 10, background: "white", color: "#374151", border: "1px solid rgba(209,213,219,0.9)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  authError: { color: "#dc2626", fontSize: 13, margin: "8px 0", fontFamily: FONT },
  authSwitch: { textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 16, fontFamily: FONT },
  authLink: { background: "none", border: "none", color: PURPLE, cursor: "pointer", fontSize: 13, fontFamily: FONT, fontWeight: 500 },
  privacyBox: { background: "rgba(249,250,251,0.8)", border: "1px solid rgba(229,231,235,0.8)", borderRadius: 8, padding: 16, maxHeight: 300, overflowY: "auto", marginBottom: 16 },
  privacyText: { margin: 0, fontSize: 12, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: FONT },
  agreeRow: { display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 16 },
  agreeLabel: { fontSize: 14, color: "#374151", lineHeight: 1.5, fontFamily: FONT },

  app: { display: "flex", height: "100vh", fontFamily: FONT, color: "#1f2937", background: "linear-gradient(135deg, #ede9fe 0%, #f0f4ff 40%, #fce7f3 100%)", overflow: "hidden" },
  sidebar: { width: 240, minWidth: 240, background: SIDEBAR_BG, display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "20px 16px 16px", borderBottom: "1px solid #2d2a45" },
  logoIcon: { fontSize: 20 },
  logoText: { fontSize: 15, fontWeight: 600, color: "white", letterSpacing: 0.3, fontFamily: FONT },
  nav: { padding: "12px 8px" },
  navItem: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: FONT, marginBottom: 2 },
  navItemActive: { background: PURPLE, color: "white" },
  navIcon: { flexShrink: 0 },
  sidebarSection: { padding: "12px 12px 8px", borderTop: "1px solid #2d2a45" },
  sidebarSectionTitle: { margin: "0 0 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "#64748b", fontWeight: 600, fontFamily: FONT },
  subjectPill: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 6, border: "1px solid #2d2a45", background: "transparent", fontSize: 12, color: "#94a3b8", cursor: "pointer", marginBottom: 3, textAlign: "left", fontFamily: FONT },
  subjectPillOpen: { background: PURPLE, color: "white", borderColor: PURPLE },
  chevron: { fontSize: 9 },
  dropdown: { background: "#16132a", borderRadius: 6, padding: 6, marginBottom: 4, border: "1px solid #2d2a45" },
  unit: { marginBottom: 6 },
  unitLabel: { margin: "3px 0 3px 4px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#475569", fontFamily: FONT },
  topicItem: { width: "100%", textAlign: "left", padding: "4px 8px", borderRadius: 4, border: "none", background: "transparent", fontSize: 11, color: "#94a3b8", cursor: "pointer", fontFamily: FONT, display: "block" },
  topicItemActive: { background: "#2d2a45", color: PURPLE_LIGHT },
  generateBtn: { width: "100%", marginTop: 6, padding: "6px 0", borderRadius: 6, border: "none", background: PURPLE, color: "white", fontSize: 11, cursor: "pointer", fontFamily: FONT },
  planBox: { margin: "0 12px 8px", background: "#16132a", border: `1px solid ${PURPLE}33`, borderRadius: 8, padding: 10 },
  planTitle: { margin: "0 0 4px", fontSize: 11, fontWeight: 500, color: PURPLE_LIGHT, fontFamily: FONT },
  planText: { margin: 0, fontSize: 11, color: "#94a3b8", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: FONT },
  pillWrap: { display: "flex", flexWrap: "wrap", gap: 5 },
  feelingPill: { padding: "4px 8px", borderRadius: 999, border: "1px solid #2d2a45", background: "transparent", fontSize: 11, color: "#94a3b8", cursor: "pointer", fontFamily: FONT },
  feelingPillActive: { background: PURPLE, color: "white", borderColor: PURPLE },
  feelingNote: { margin: "5px 0 0", fontSize: 10, color: "#64748b", fontStyle: "italic", fontFamily: FONT },
  sidebarBottom: { marginTop: "auto", padding: "12px 8px", borderTop: "1px solid #2d2a45" },
  newSessionSideBtn: { width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: PURPLE, color: "white", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT, marginBottom: 6 },
  sideBottomLink: { width: "100%", display: "block", padding: "7px 12px", border: "none", background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: FONT },

  mainArea: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  frozenBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "rgba(239,246,255,0.8)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(191,219,254,0.8)", flexShrink: 0 },
  frozenBannerLeft: { display: "flex", alignItems: "center", gap: 12 },
  frozenIcon: { fontSize: 24 },
  frozenTitle: { margin: 0, fontSize: 14, fontWeight: 600, color: "#1e40af", fontFamily: FONT },
  frozenSub: { margin: 0, fontSize: 12, color: "#3b82f6", fontFamily: FONT },
  resumeBtn: { padding: "8px 18px", borderRadius: 8, background: PURPLE, color: "white", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT },
  viewSummaryBtn: { padding: "8px 16px", borderRadius: 8, background: "rgba(239,246,255,0.9)", color: "#1d4ed8", border: "1px solid rgba(191,219,254,0.8)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT },
  backBtn: { padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.8)", color: "#374151", border: "1px solid rgba(209,213,219,0.8)", fontSize: 13, cursor: "pointer", fontFamily: FONT },

  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(229,231,235,0.6)", flexShrink: 0 },
  studentCard: { display: "flex", alignItems: "center", gap: 12 },
  studentAvatar: { width: 40, height: 40, borderRadius: "50%", background: `${PURPLE}22`, color: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, flexShrink: 0, fontFamily: FONT },
  studentTag: { margin: 0, fontSize: 12, color: PURPLE, fontWeight: 500, fontFamily: FONT },
  topRight: { display: "flex", alignItems: "center", gap: 16 },
  timer: { fontVariantNumeric: "tabular-nums", color: "#6b7280", fontSize: 14, fontFamily: FONT },
  endBtn: { padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(254,202,202,0.8)", background: "rgba(254,242,242,0.8)", color: "#dc2626", cursor: "pointer", fontSize: 13, fontFamily: FONT, fontWeight: 500 },
  tutorProfile: { display: "flex", alignItems: "center", gap: 10 },
  tutorInfo: { textAlign: "right" },
  tutorRole: { margin: 0, fontSize: 11, color: "#6b7280", fontFamily: FONT },
  tutorAvatar: { width: 36, height: 36, borderRadius: "50%", background: PURPLE, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0, fontFamily: FONT },

  panels: { display: "flex", flex: 1, padding: 12, gap: 8, overflow: "hidden" },
  transcript: { background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", flexShrink: 0, border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 24px rgba(124,58,237,0.06)" },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  panelTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: "#111827", fontFamily: FONT },
  liveBadge: { fontSize: 11, color: "#16a34a", fontWeight: 600, letterSpacing: 0.5, fontFamily: FONT },
  transcriptBody: { flex: 1, overflowY: "auto" },
  divider: { width: 6, cursor: "col-resize", flexShrink: 0, borderLeft: "2px solid rgba(229,231,235,0.5)", margin: "0 2px", borderRadius: 4 },
  transcriptControls: { display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexShrink: 0 },
  listenBtn: { padding: "7px 12px", borderRadius: 8, border: `1px solid ${PURPLE}`, background: "rgba(255,255,255,0.8)", color: PURPLE, fontSize: 12, cursor: "pointer", fontFamily: FONT, fontWeight: 500 },
  listenBtnActive: { background: PURPLE, color: "white" },
  clearBtn: { padding: "7px 10px", borderRadius: 8, border: "1px solid rgba(229,231,235,0.8)", background: "rgba(255,255,255,0.8)", color: "#6b7280", fontSize: 12, cursor: "pointer", fontFamily: FONT },
  browserWarning: { fontSize: 12, color: "#dc2626", margin: 0, fontFamily: FONT },
  transcriptEntry: { marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" },
  transcriptTime: { fontSize: 10, color: "#9ca3af", flexShrink: 0, marginTop: 2, fontFamily: FONT },
  transcriptText: { fontSize: 13, color: "#374151", lineHeight: 1.5, fontFamily: FONT },

  coach: { background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 24px rgba(124,58,237,0.08)" },
  contextBadge: { display: "flex", flexWrap: "wrap", gap: 6 },
  badge: { fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#ede9fe", color: PURPLE, fontFamily: FONT },
  feelingBadge: { background: "#fef3c7", color: "#92400e" },
  chatBox: { flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", padding: "4px 0" },
  bubble: { maxWidth: "85%", padding: "10px 14px", borderRadius: 14, whiteSpace: "pre-wrap", lineHeight: 1.5, fontSize: 14, fontFamily: FONT },
  userBubble: { alignSelf: "flex-end", background: PURPLE, color: "white" },
  aiBubble: { alignSelf: "flex-start", background: "rgba(243,244,246,0.9)", color: "#1f2937" },
  thinking: { color: "#9ca3af", fontStyle: "italic", fontSize: 13, fontFamily: FONT },
  placeholder: { color: "#9ca3af", textAlign: "center", marginTop: 40, fontSize: 13, fontFamily: FONT },
  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  actionBtn: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "12px 8px", borderRadius: 10, border: "1.5px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: FONT, minHeight: 64 },
  hintBtn: { background: "rgba(254,243,199,0.8)", borderColor: "#fcd34d", color: "#92400e" },
  practiceBtn: { background: "rgba(237,233,254,0.8)", borderColor: "#c4b5fd", color: "#5b21b6" },
  miscBtn: { background: "rgba(224,242,254,0.8)", borderColor: "#7dd3fc", color: "#0369a1" },
  nextBtn: { background: "rgba(220,252,231,0.8)", borderColor: "#86efac", color: "#15803d" },
  levelGroupGrid: { gridColumn: "span 2", background: "rgba(249,250,251,0.8)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(229,231,235,0.8)" },
  levelLabelGrid: { margin: "0 0 6px", fontSize: 12, color: "#6b7280", fontFamily: FONT },
  levelBtns: { display: "flex", gap: 6, flexWrap: "wrap" },
  levelBtn: { padding: "5px 12px", borderRadius: 999, border: `1px solid ${PURPLE}`, background: "#ede9fe", color: PURPLE, fontSize: 12, cursor: "pointer", fontFamily: FONT },
  cancelBtn: { padding: "5px 8px", borderRadius: 6, border: "none", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: FONT },
  inputRow: { display: "flex", gap: 8 },
  input: { flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(209,213,219,0.8)", fontSize: 14, fontFamily: FONT, outline: "none", background: "rgba(255,255,255,0.8)" },
  sendBtn: { padding: "10px 16px", borderRadius: 10, border: "none", background: PURPLE, color: "white", fontSize: 16, cursor: "pointer" },

  reportScreen: { minHeight: "100vh", background: "linear-gradient(135deg, #ede9fe 0%, #f0f4ff 40%, #fce7f3 100%)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", fontFamily: FONT },
  reportCard: { background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 720, border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 8px 32px rgba(124,58,237,0.1)" },
  reportHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(229,231,235,0.6)" },
  reportIcon: { width: 48, height: 48, borderRadius: 12, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  reportTitle: { margin: 0, fontSize: 20, fontWeight: 600, color: "#111827", fontFamily: FONT },
  reportMeta: { margin: "4px 0 0", fontSize: 13, color: "#6b7280", fontFamily: FONT },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 },
  statCard: { background: "rgba(249,250,251,0.8)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "12px 16px", border: "1px solid rgba(229,231,235,0.6)" },
  statLabel: { margin: "0 0 4px", fontSize: 12, color: "#6b7280", fontFamily: FONT },
  statValue: { margin: 0, fontSize: 22, fontWeight: 600, color: "#111827", fontFamily: FONT },
  reportBody: { marginBottom: 24 },
  reportText: { margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: FONT },
  reportActions: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 },
  reportActionBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px", borderRadius: 10, background: PURPLE, color: "white", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT },
  reportActionSecondary: { background: "rgba(255,255,255,0.8)", color: "#374151", border: "1px solid rgba(229,231,235,0.8)" },

  graphWrapper: { marginTop: 8, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(229,231,235,0.6)", background: "rgba(255,255,255,0.8)", width: "100%", maxWidth: 400 },
  graphTitle: { padding: "6px 12px", background: "rgba(249,250,251,0.8)", borderBottom: "1px solid rgba(229,231,235,0.6)", fontSize: 12, color: "#6b7280", fontFamily: FONT },
  graphContainer: { width: "100%", height: 280 },

  dashStatsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 },
  dashStatCard: { background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 16, padding: "20px 16px", border: "1px solid rgba(255,255,255,0.8)", textAlign: "center", boxShadow: "0 4px 24px rgba(124,58,237,0.06)" },
  dashStatIcon: { fontSize: 24, display: "block", marginBottom: 8 },
  dashStatValue: { margin: "0 0 4px", fontSize: 24, fontWeight: 600, color: "#111827", fontFamily: FONT },
  dashStatLabel: { margin: 0, fontSize: 12, color: "#6b7280", fontFamily: FONT },
  filterRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  filterSelect: { padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(209,213,219,0.8)", fontSize: 13, fontFamily: FONT, background: "rgba(255,255,255,0.8)", color: "#374151" },
  filterInput: { padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(209,213,219,0.8)", fontSize: 13, fontFamily: FONT, background: "rgba(255,255,255,0.8)", color: "#374151" },
  clearFilterBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(229,231,235,0.8)", background: "rgba(255,255,255,0.8)", color: "#6b7280", fontSize: 13, cursor: "pointer", fontFamily: FONT },
  sessionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 },
  sessionCard: { background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.8)", cursor: "pointer", boxShadow: "0 4px 24px rgba(124,58,237,0.08)" },
  sessionCardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  sessionCardSubject: { margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: FONT },
  sessionCardTopic: { margin: 0, fontSize: 12, color: PURPLE, fontFamily: FONT },
  sessionCardMeta: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6, fontFamily: FONT },
  sessionCardFeelings: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 },
  sessionCardFeeling: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#ede9fe", color: PURPLE, fontFamily: FONT },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9ca3af", padding: 4 },
  resumeHint: { fontSize: 11, color: "#9ca3af", marginTop: 8, textAlign: "right", fontFamily: FONT },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { display: "block", margin: "0 auto 16px" },
  emptyTitle: { fontSize: 20, fontWeight: 600, color: "#111827", margin: "0 0 8px", fontFamily: FONT },
  emptySub: { fontSize: 14, color: "#6b7280", margin: "0 0 24px", fontFamily: FONT },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modalCard: { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px 16px", borderBottom: "1px solid rgba(229,231,235,0.6)" },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 600, color: "#111827", fontFamily: FONT },
  modalMeta: { margin: "4px 0 0", fontSize: 13, color: "#6b7280", fontFamily: FONT },
  modalClose: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280", padding: 4 },
  modalBody: { flex: 1, overflowY: "auto", padding: 24 },
  modalSectionLabel: { margin: "0 0 8px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280", fontFamily: FONT },
  modalPre: { margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: FONT, background: "rgba(249,250,251,0.8)", padding: 14, borderRadius: 8 },

  addStudentBtn: { padding: "8px 16px", borderRadius: 8, background: PURPLE, color: "white", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT },
  studentList: { width: 280, flexShrink: 0, borderRight: "1px solid rgba(229,231,235,0.5)", overflowY: "auto", padding: 16, background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" },
  studentListTitle: { margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: FONT },
  studentCard: { background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRadius: 10, padding: 12, marginBottom: 8, cursor: "pointer", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 2px 12px rgba(124,58,237,0.05)" },
  studentCardActive: { border: `1px solid ${PURPLE}`, background: "rgba(237,233,254,0.7)" },
  studentCardTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  studentCardAvatar: { width: 36, height: 36, borderRadius: "50%", background: PURPLE, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0, fontFamily: FONT },
  studentCardName: { margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: FONT },
  studentCardMeta: { margin: 0, fontSize: 11, color: "#6b7280", fontFamily: FONT },
  studentCardSessions: { margin: 0, fontSize: 11, color: PURPLE, fontWeight: 500, fontFamily: FONT },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 3, color: "#9ca3af" },
  studentDetail: { flex: 1, overflowY: "auto", background: "rgba(249,250,251,0.4)" },
  studentDetailHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: "0 0 20px", borderBottom: "1px solid rgba(229,231,235,0.6)" },
  notesBox: { background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", borderRadius: 10, padding: 16, marginBottom: 20, border: "1px solid rgba(229,231,235,0.6)" },
  chartCard: { background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124,58,237,0.06)" },
  chartTitle: { margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: FONT },
  sessionHistoryItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(243,244,246,0.8)" },

  profileCard: { background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 14, padding: 20, marginBottom: 16, border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124,58,237,0.06)" },
  profileSectionTitle: { margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: FONT },
  uploadBtn: { padding: "8px 16px", borderRadius: 8, background: "rgba(243,244,246,0.8)", border: "1px solid rgba(229,231,235,0.8)", color: "#374151", fontSize: 13, cursor: "pointer", fontFamily: FONT },
  eyeBtn: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0 },
  dangerBtn: { padding: "8px 16px", borderRadius: 8, background: "rgba(254,242,242,0.8)", border: "1px solid rgba(254,202,202,0.8)", color: "#dc2626", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT },

  // Resources
  resourceTabs: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 },
  resourceTab: { padding: "8px 18px", borderRadius: 999, border: "1.5px solid rgba(209,213,219,0.8)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", color: "#6b7280", fontSize: 13, cursor: "pointer", fontFamily: FONT, fontWeight: 500, transition: "all 0.15s" },
  resourceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 },
  resourceCard: { background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 14, padding: 18, border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124,58,237,0.07)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 },
  resourceCardTop: { flex: 1 },
  resourceCardActions: { display: "flex", gap: 8 },
  openBtn: { padding: "7px 14px", borderRadius: 8, background: PURPLE, color: "white", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT, textDecoration: "none", display: "inline-block" },
  copyBtn: { padding: "7px 14px", borderRadius: 8, background: "rgba(243,244,246,0.8)", border: "1px solid rgba(209,213,219,0.8)", color: "#374151", fontSize: 13, cursor: "pointer", fontFamily: FONT, transition: "all 0.15s" },
};