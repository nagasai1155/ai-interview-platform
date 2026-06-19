"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumeCard from "@/components/resume/ResumeCard";
import { getUserResumes, Resume } from "@/lib/resumeApi";
import Link from "next/link";

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  // load all resumes on page open
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await getUserResumes();
      setResumes(data);
    } catch (err) {
      console.error("Failed to fetch resumes", err);
    } finally {
      setLoading(false);
    }
  };

  // called when upload succeeds
  const handleUploadSuccess = (resume: Resume) => {
    setResumes((prev) => [resume, ...prev]);
    // adds new resume to top of list without refetching
    setSuccessMsg("Resume uploaded successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // called when delete succeeds
  const handleDelete = (id: number) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
    // removes deleted resume from list without refetching
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        {/* Top Nav */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
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
            <span className="text-sm text-gray-500">Resume Manager</span>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              My Resumes
            </h1>
            <p className="text-gray-500 text-sm">
              Upload your resume to generate AI interview questions
            </p>
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 border
              border-green-200 text-green-700 text-sm rounded-xl
              px-4 py-3 mb-6">
              <svg className="w-4 h-4 shrink-0" fill="currentColor"
                viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0
                  000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586
                  7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414
                  0l4-4z" clipRule="evenodd" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex
              items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0
                  003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload New Resume
            </h2>
            <ResumeUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Resumes List */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex
              items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0
                  01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414
                  5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Uploaded Resumes
              <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs
                font-medium px-2 py-0.5 rounded-full">
                {resumes.length}
              </span>
            </h2>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white border border-gray-200
                    rounded-2xl p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded mb-2" />
                    <div className="h-2 bg-gray-200 rounded w-4/5" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && resumes.length === 0 && (
              <div className="text-center py-14 bg-white border
                border-dashed border-gray-300 rounded-2xl">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex
                  items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0
                      01-2-2V5a2 2 0 012-2h5.586a1 1 0
                      01.707.293l5.414 5.414a1 1 0
                      01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  No resumes yet
                </p>
                <p className="text-xs text-gray-500">
                  Upload your first resume above to get started
                </p>
              </div>
            )}

            {/* Resume Cards Grid */}
            {!loading && resumes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}