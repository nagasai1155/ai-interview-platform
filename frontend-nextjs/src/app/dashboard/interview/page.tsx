"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getUserResumes, Resume } from "@/lib/resumeApi";
import { createSession } from "@/lib/interviewApi";
import Link from "next/link";

export default function StartInterviewPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    resumeId: 0,
    jobTitle: "",
    jobDescription: "",
    interviewType: "TEXT",
    questionCount: 5,
  });

  useEffect(() => {
    getUserResumes()
      .then(setResumes)
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async () => {
    if (!form.resumeId || !form.jobTitle) {
      setError("Please select a resume and enter a job title");
      return;
    }
    setError("");
    setStarting(true);
    try {
      const session = await createSession(form);
      router.push(`/dashboard/interview/${session.sessionId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start interview");
      setStarting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Link href="/dashboard"
              className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex
              items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800">InterviewAI</span>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Start Mock Interview
            </h1>
            <p className="text-gray-500 text-sm">
              Set up your interview session and practice with AI
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6
            space-y-6">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700
                text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Resume Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume
              </label>
              {loading ? (
                <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
              ) : resumes.length === 0 ? (
                <div className="text-sm text-gray-500 bg-gray-50 border
                  border-gray-200 rounded-xl px-4 py-3">
                  No resumes found.{" "}
                  <Link href="/dashboard/resume"
                    className="text-indigo-600 hover:underline">
                    Upload one first
                  </Link>
                </div>
              ) : (
                <select
                  value={form.resumeId}
                  onChange={(e) => setForm({
                    ...form, resumeId: Number(e.target.value)
                  })}
                  className="w-full border border-gray-300 rounded-xl
                    px-4 py-2.5 text-sm text-gray-800 bg-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                    focus:border-transparent"
                >
                  <option value={0}>Select a resume...</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={form.jobTitle}
                onChange={(e) => setForm({
                  ...form, jobTitle: e.target.value
                })}
                placeholder="e.g. Full Stack Developer, Backend Engineer"
                className="w-full border border-gray-300 rounded-xl px-4
                  py-2.5 text-sm text-gray-800 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                  focus:border-transparent"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
                <span className="text-gray-400 font-normal ml-1">
                  (optional but recommended)
                </span>
              </label>
              <textarea
                value={form.jobDescription}
                onChange={(e) => setForm({
                  ...form, jobDescription: e.target.value
                })}
                placeholder="Paste the job description here for more relevant questions..."
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4
                  py-3 text-sm text-gray-800 placeholder-gray-400
                  resize-none focus:outline-none focus:ring-2
                  focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Question Count + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700
                  mb-2">
                  Number of Questions
                </label>
                <select
                  value={form.questionCount}
                  onChange={(e) => setForm({
                    ...form, questionCount: Number(e.target.value)
                  })}
                  className="w-full border border-gray-300 rounded-xl px-4
                    py-2.5 text-sm text-gray-800 bg-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[3, 5, 7, 10].map((n) => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700
                  mb-2">
                  Interview Type
                </label>
                <select
                  value={form.interviewType}
                  onChange={(e) => setForm({
                    ...form, interviewType: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-xl px-4
                    py-2.5 text-sm text-gray-800 bg-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TEXT">Text Interview</option>
                  <option value="CODING">Coding Interview</option>
                </select>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🤖", title: "AI Generated", desc: "Questions from your resume" },
                { icon: "📊", title: "Instant Feedback", desc: "Score + improvements" },
                { icon: "💾", title: "Auto Saved", desc: "Review anytime" },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 border
                  border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <p className="text-xs font-semibold text-gray-700">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={starting || !form.resumeId || !form.jobTitle}
              className="w-full bg-indigo-600 hover:bg-indigo-700
                text-white font-medium py-3.5 rounded-xl text-sm
                transition disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {starting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none"
                    viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating questions with AI...
                </>
              ) : (
                <>
                  Start Interview
                  <svg className="w-4 h-4" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}