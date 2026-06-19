import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-800 text-lg">InterviewAI</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition">
            Login
          </Link>
          <Link href="/register"
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white
            font-medium px-4 py-2 rounded-xl transition">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200
          text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          AI Powered Interview Preparation
        </div>

        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Ace your next interview
          <span className="text-indigo-600"> with AI</span>
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
          Upload your resume, get personalized interview questions, practice with
          AI mock interviews, and track your progress — all in one place.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium
            px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-indigo-200">
            Start Preparing Free
          </Link>
          <Link href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium
            border border-gray-200 px-8 py-3.5 rounded-xl transition">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "📄", title: "Resume Parsing", desc: "Upload PDF or DOCX and we extract your skills automatically" },
            { icon: "🤖", title: "AI Questions", desc: "Get interview questions generated from your resume and job role" },
            { icon: "🎙️", title: "Mock Interviews", desc: "Practice with voice or text and get instant AI feedback" },
            { icon: "📊", title: "ATS Checker", desc: "See how well your resume matches any job description" },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 border border-gray-200
              rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}