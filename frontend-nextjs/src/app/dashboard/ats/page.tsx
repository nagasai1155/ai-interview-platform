"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getUserResumes, Resume } from "@/lib/resumeApi";
import api from "@/lib/api";
import Link from "next/link";

interface AtsResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  
}

export default function AtsCheckerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    resumeId: 0,
    jobDescription: "",
  });

  useEffect(() => {
    getUserResumes()
      .then(setResumes)
      .finally(() => setLoading(false));
  }, []);

  const handleCheck = async () => {
    if (!form.resumeId || !form.jobDescription.trim()) {
      setError("Please select a resume and enter a job description");
      return;
    }
    setError("");
    setResult(null);
    setChecking(true);

    try {
      // call ATS endpoint — already built in Step 8
      const res = await api.post(
        `/resumes/ai/ats/${form.resumeId}`,
        { jobDescription: form.jobDescription }
      );

      // also get full Gemini analysis
      const analysisRes = await api.post(
        `/resumes/ai/ats-detail/${form.resumeId}`,
        { jobDescription: form.jobDescription }
      );

      setResult(analysisRes.data);
    } catch (err: any) {
      // fallback — use score only endpoint
      try {
        const res = await api.post(
          `/resumes/ai/ats/${form.resumeId}`,
          { jobDescription: form.jobDescription }
        );
        setResult({
          score: res.data.atsScore,
          matchedKeywords: [],
          missingKeywords: [],
          suggestions: [],
        });
      } catch {
        setError("ATS check failed. Please try again.");
      }
    } finally {
      setChecking(false);
    }
  };

 // replace these 3 lines at the top of the component
const scoreColor =
  (result?.score ?? 0) >= 70 ? "text-green-600" :
  (result?.score ?? 0) >= 40 ? "text-yellow-600" : "text-red-500";

const scoreBg =
  (result?.score ?? 0) >= 70 ? "bg-green-50 border-green-200" :
  (result?.score ?? 0) >= 40 ? "bg-yellow-50 border-yellow-200" :
  "bg-red-50 border-red-200";

const scoreLabel =
  (result?.score ?? 0) >= 70 ? "Great Match! 🎉" :
  (result?.score ?? 0) >= 40 ? "Average Match 👍" : "Low Match ⚠️";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
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
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">ATS Checker</span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              ATS Score Checker
            </h1>
            <p className="text-gray-500 text-sm">
              See how well your resume matches a job description
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left — Input */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200
                rounded-2xl p-6 space-y-5">

                {error && (
                  <div className="bg-red-50 border border-red-200
                    text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                {/* Resume Select */}
                <div>
                  <label className="block text-sm font-medium
                    text-gray-700 mb-2">
                    Select Resume
                  </label>
                  {loading ? (
                    <div className="h-11 bg-gray-100 rounded-xl
                      animate-pulse" />
                  ) : resumes.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-50
                      border border-gray-200 rounded-xl px-4 py-3">
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
                        ...form,
                        resumeId: Number(e.target.value)
                      })}
                      className="w-full border border-gray-300 rounded-xl
                        px-4 py-2.5 text-sm text-gray-800 bg-white
                        focus:outline-none focus:ring-2
                        focus:ring-indigo-500 focus:border-transparent"
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

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium
                    text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={form.jobDescription}
                    onChange={(e) => setForm({
                      ...form,
                      jobDescription: e.target.value
                    })}
                    placeholder="Paste the full job description here..."
                    rows={8}
                    className="w-full border border-gray-300 rounded-xl
                      px-4 py-3 text-sm text-gray-800 placeholder-gray-400
                      resize-none focus:outline-none focus:ring-2
                      focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.jobDescription.length} characters
                  </p>
                </div>

                {/* Check Button */}
                <button
                  onClick={handleCheck}
                  disabled={checking || !form.resumeId ||
                    !form.jobDescription.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700
                    text-white font-medium py-3 rounded-xl text-sm
                    transition disabled:opacity-50
                    disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {checking ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none"
                        viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12"
                          r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      Check ATS Score
                      <svg className="w-4 h-4" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2
                          2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2
                          2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0
                          002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2
                          0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* How it works */}
              <div className="bg-white border border-gray-200
                rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  How ATS works
                </h3>
                <div className="space-y-2">
                  {[
                    { step: "1", text: "AI reads your resume text" },
                    { step: "2", text: "Compares with job description" },
                    { step: "3", text: "Finds matched & missing keywords" },
                    { step: "4", text: "Gives improvement suggestions" },
                  ].map((item) => (
                    <div key={item.step}
                      className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-indigo-100
                        text-indigo-700 rounded-full text-xs font-bold
                        flex items-center justify-center shrink-0">
                        {item.step}
                      </span>
                      <p className="text-xs text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Results */}
            <div>
              {checking && (
                <div className="bg-white border border-gray-200
                  rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 border-4 border-indigo-600
                    border-t-transparent rounded-full animate-spin
                    mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    AI is analyzing your resume...
                  </p>
                  <p className="text-xs text-gray-500">
                    Comparing keywords and skills
                  </p>
                </div>
              )}

              {!checking && !result && (
                <div className="bg-white border border-gray-200
                  rounded-2xl p-8 text-center h-full flex flex-col
                  items-center justify-center min-h-64">
                  <span className="text-4xl mb-4">📊</span>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Your ATS score will appear here
                  </p>
                  <p className="text-xs text-gray-500">
                    Select a resume and paste a job description
                  </p>
                </div>
              )}

              {!checking && result && (
                <div className="space-y-4">

                  {/* Score Card */}
                  <div className={`bg-white border rounded-2xl p-6
                    text-center ${scoreBg}`}>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      ATS Match Score
                    </p>
                    <div className={`text-6xl font-bold mb-2 ${scoreColor}`}>
                      {result.score}
                      <span className="text-2xl text-gray-400">%</span>
                    </div>
                    <p className={`text-sm font-semibold ${scoreColor}`}>
                      {scoreLabel}
                    </p>

                    {/* Score bar */}
                    <div className="mt-4 w-full bg-gray-200 rounded-full
                      h-2">
                      <div
                        className={`h-2 rounded-full transition-all
                          duration-1000 ${
                          result.score >= 70 ? "bg-green-500" :
                          result.score >= 40 ? "bg-yellow-500" :
                          "bg-red-400"
                        }`}
                        style={{ width: `${result?.score ?? 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs
                      text-gray-400 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  {result.matchedKeywords?.length > 0 && (
                    <div className="bg-white border border-gray-200
                      rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-green-600"
                          fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0
                            100-16 8 8 0 000 16zm3.707-9.293a1 1 0
                            00-1.414-1.414L9 10.586 7.707 9.293a1 1
                            0 00-1.414 1.414l2 2a1 1 0 001.414
                            0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-sm font-semibold
                          text-gray-700">
                          Matched Keywords
                          <span className="ml-2 bg-green-100
                            text-green-700 text-xs px-2 py-0.5
                            rounded-full">
                            {result.matchedKeywords.length}
                          </span>
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.matchedKeywords.map((kw, i) => (
                          <span key={i} className="text-xs bg-green-50
                            border border-green-200 text-green-700
                            px-2.5 py-1 rounded-full">
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {result.missingKeywords?.length > 0 && (
                    <div className="bg-white border border-gray-200
                      rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-red-500"
                          fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0
                            100-16 8 8 0 000 16zM8.707 7.293a1 1 0
                            00-1.414 1.414L8.586 10l-1.293 1.293a1 1
                            0 101.414 1.414L10 11.414l1.293 1.293a1
                            1 0 001.414-1.414L11.414 10l1.293-1.293a1
                            1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd" />
                        </svg>
                        <h3 className="text-sm font-semibold
                          text-gray-700">
                          Missing Keywords
                          <span className="ml-2 bg-red-100
                            text-red-700 text-xs px-2 py-0.5
                            rounded-full">
                            {result.missingKeywords.length}
                          </span>
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.map((kw, i) => (
                          <span key={i} className="text-xs bg-red-50
                            border border-red-200 text-red-600
                            px-2.5 py-1 rounded-full">
                            ✗ {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions?.length > 0 && (
                    <div className="bg-white border border-gray-200
                      rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-indigo-600"
                          fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0
                            11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2
                            0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1
                            0 001 1h1a1 1 0 100-2v-3a1 1 0
                            00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-sm font-semibold
                          text-gray-700">
                          Suggestions to Improve
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {result.suggestions.map((s, i) => (
                          <div key={i}
                            className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-indigo-100
                              text-indigo-700 rounded-full text-xs
                              font-bold flex items-center justify-center
                              shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-xs text-gray-600
                              leading-relaxed">
                              {s}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Try Another */}
                  <button
                    onClick={() => {
                      setResult(null);
                      setForm({ ...form, jobDescription: "" });
                    }}
                    className="w-full border border-gray-200
                      hover:bg-gray-50 text-gray-700 font-medium
                      py-2.5 rounded-xl text-sm transition"
                  >
                    Check Another Job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}