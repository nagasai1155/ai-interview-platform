"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadResume, Resume } from "@/lib/resumeApi";

interface Props {
  onUploadSuccess: (resume: Resume) => void;
}

export default function ResumeUpload({ onUploadSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // validate file type
      const allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowed.includes(file.type)) {
        setError("Only PDF and DOCX files are allowed");
        return;
      }

      // validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setError("");
      setUploading(true);
      setProgress(0);

      // fake progress bar while uploading
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const resume = await uploadResume(file);
        clearInterval(interval);
        setProgress(100);

        setTimeout(() => {
          setProgress(0);
          setUploading(false);
          onUploadSuccess(resume);
          // tells parent component upload is done
        }, 500);
      } catch (err: any) {
        clearInterval(interval);
        setProgress(0);
        setUploading(false);
        setError(
          err.response?.data?.message || "Upload failed. Please try again."
        );
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
      },
      maxFiles: 1,
      disabled: uploading,
    });

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center
          cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject
            ? "border-indigo-500 bg-indigo-50"
            : isDragReject
            ? "border-red-400 bg-red-50"
            : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50"
          }
          ${uploading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <input {...getInputProps()} />

        {/* Upload Icon */}
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4
          ${isDragActive ? "bg-indigo-100" : "bg-white shadow-sm border border-gray-200"}
        `}>
          {uploading ? (
            <svg className="w-8 h-8 text-indigo-600 animate-spin"
              fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isDragActive ? (
            <svg className="w-8 h-8 text-indigo-600" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-gray-400" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        {/* Text */}
        {uploading ? (
          <div>
            <p className="text-sm font-medium text-indigo-700 mb-1">
              Uploading and extracting text...
            </p>
            <p className="text-xs text-gray-500">
              Apache Tika is reading your resume
            </p>
          </div>
        ) : isDragActive ? (
          <p className="text-sm font-medium text-indigo-700">
            Drop your resume here
          </p>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Drag and drop your resume here
            </p>
            <p className="text-xs text-gray-500 mb-3">
              or click to browse files
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs
              bg-white border border-gray-200 rounded-lg px-3 py-1.5
              text-gray-600 shadow-sm">
              <span>📄</span> PDF
              <span className="text-gray-300">|</span>
              <span>📝</span> DOCX
              <span className="text-gray-300">|</span>
              Max 5MB
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4 w-full max-w-xs mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mt-3 bg-red-50 border
          border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <svg className="w-4 h-4 shrink-0" fill="currentColor"
            viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000
              16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293
              1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0
              001.414-1.414L11.414 10l1.293-1.293a1 1 0
              00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}