export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-body text-dark">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="text-sm text-[#5BC0EB] hover:underline mb-8 inline-block">← Back to home</a>

        <h1 className="font-heading text-4xl font-semibold text-dark mb-2">Privacy Policy & Terms of Service</h1>
        <p className="text-sm text-dark/50 mb-10">Last updated: June 2026</p>

        {[
          {
            title: "1. Data We Collect",
            body: `When you use TutorGuide AI, we collect and store:
• Session metadata (date, time, duration, subject, topic)
• Student names and profiles (optional, entered by you)
• AI coaching chat logs
• Live session speech transcripts
• Student emotional state indicators
• Post-session reflection reports
• Your name and email address (used for your account)`
          },
          {
            title: "2. How We Use Your Data",
            body: "Your data is used solely to display your past sessions and student progress within the app. We do not sell, share, or use your data for advertising or any third-party purpose."
          },
          {
            title: "3. Data Storage & Security",
            body: "All data is stored in Supabase with Row Level Security (RLS) enforced at the database level. This means your data is cryptographically isolated — no other user can access it, even if they are authenticated. Access controls are enforced server-side, not just in the app."
          },
          {
            title: "4. Authentication",
            body: `You may sign in using email/password or Google OAuth. When you use Google Sign-In, authentication is handled by Google and subject to Google's Privacy Policy (policies.google.com/privacy). We receive only your name and email address from Google — we do not receive your Google password or any other Google account data.`
          },
          {
            title: "5. Student Privacy",
            body: "You are responsible for obtaining appropriate consent from students and parents/guardians before entering student names or recording session transcripts. Do not enter personally identifiable information beyond what is necessary."
          },
          {
            title: "6. FERPA Notice",
            body: "If TutorGuide AI is used in a school or institutional setting, you (the tutor) are responsible for ensuring compliance with the Family Educational Rights and Privacy Act (FERPA) and any applicable state laws. TutorGuide AI is a tool for individual tutors and is not a FERPA-compliant service provider."
          },
          {
            title: "7. Data Retention & Deletion",
            body: "Your data is retained until you delete it. You may delete any session, student record, or your entire account at any time from within the app. Deleted data is permanently removed and cannot be recovered."
          },
          {
            title: "8. Contact",
            body: "If you have questions or concerns about your data, contact us at tutorguideai@gmail.com."
          },
        ].map(({ title, body }) => (
          <div key={title} className="mb-8">
            <h2 className="font-heading text-lg font-semibold text-dark mb-2">{title}</h2>
            <p className="text-sm text-dark/70 leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        ))}

        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs text-dark/40">By creating an account, you agree to these terms. © {new Date().getFullYear()} TutorGuide AI.</p>
        </div>
      </div>
    </div>
  );
}
