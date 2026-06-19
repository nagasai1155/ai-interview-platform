"use client";

import { useState } from "react";
import { Resume, deleteResume } from "@/lib/resumeApi";

interface Props {
  resume: Resume;
  onDelete: (id: number) => void;
}

export default function ResumeCard({ resume, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [showText, setShowText] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this resume?")) return;
    setDeleting(true);
    try {
      await deleteResume(resume.id);
      onDelete(resume.id);
      // tells parent to remove this card from the list
    } catch {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatSize = (text: string) => {
    // rough estimate of original file from text length
    return `${Math.round(text.length / 100) / 10} KB`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5
      hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* File icon */}
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center
            justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="currentColor"
              viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0
                0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2
                2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1
                1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {resume.fileName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Uploaded {formatDate(resume.uploadedAt)}
            </p>
          </div>
        </div>

        {/* ATS Score Badge */}
        <div className={`shrink-0 text-xs font-semibold px-2.5 py-1
          rounded-full ${
            resume.atsScore >= 70
              ? "bg-green-100 text-green-700"
              : resume.atsScore >= 40
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-500"
          }`}>
          {resume.atsScore > 0 ? `ATS ${resume.atsScore}%` : "ATS Pending"}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2
              2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0
              01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {resume.fileType === "application/pdf" ? "PDF" : "DOCX"}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {resume.rawText.split(" ").length} words extracted
        </div>
      </div>

      {/* Extracted Text Preview */}
      <div className="mb-4">
        <button
          onClick={() => setShowText(!showText)}
          className="flex items-center gap-1.5 text-xs text-indigo-600
            hover:text-indigo-700 font-medium"
        >
          <svg className={`w-3.5 h-3.5 transition-transform
            ${showText ? "rotate-90" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {showText ? "Hide" : "View"} extracted text
        </button>

        {showText && (
          <div className="mt-2 bg-gray-50 border border-gray-200
            rounded-xl p-3 max-h-40 overflow-y-auto">
            <p className="text-xs text-gray-600 whitespace-pre-wrap
              leading-relaxed font-mono">
              {resume.rawText.slice(0, 500)}
              {resume.rawText.length > 500 && "..."}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          className="flex-1 flex items-center justify-center gap-1.5
            bg-indigo-600 hover:bg-indigo-700 text-white text-xs
            font-medium py-2 rounded-xl transition"
          onClick={() => alert("Coming in Step 9 — AI Question Generation!")}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Interview
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center w-9 h-9
            text-gray-400 hover:text-red-500 hover:bg-red-50
            rounded-xl transition disabled:opacity-50"
        >
          {deleting ? (
            <svg className="w-4 h-4 animate-spin" fill="none"
              viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138
                21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1
                1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}