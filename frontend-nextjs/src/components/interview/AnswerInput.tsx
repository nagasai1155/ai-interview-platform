"use client";

import { useState } from "react";

interface Props {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
  isLastQuestion: boolean;
}

export default function AnswerInput({
  onSubmit,
  isLoading,
  isLastQuestion,
}: Props) {
  const [answer, setAnswer] = useState("");
  const minChars = 50;

  const handleSubmit = () => {
    if (answer.trim().length < minChars) return;
    onSubmit(answer.trim());
    setAnswer("");
  };

  const charCount = answer.trim().length;
  const isValid = charCount >= minChars;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Your Answer
        </label>
        <span className={`text-xs ${isValid
          ? "text-green-600" : "text-gray-400"}`}>
          {charCount} / {minChars} min chars
        </span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here... Be specific and use examples from your experience."
        rows={6}
        disabled={isLoading}
        className="w-full border border-gray-300 rounded-xl px-4 py-3
          text-sm text-gray-800 placeholder-gray-400 resize-none
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          focus:border-transparent transition disabled:opacity-60
          disabled:bg-gray-50"
      />

      {/* Tips */}
      <div className="flex items-start gap-2 mt-3 mb-4">
        <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5"
          fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116
            0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1
            0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd" />
        </svg>
        <p className="text-xs text-gray-500">
          For behavioural questions use the STAR method
          (Situation, Task, Action, Result).
          For technical questions explain your reasoning clearly.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700
          text-white font-medium py-3 rounded-xl text-sm transition
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none"
              viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI is evaluating your answer...
          </>
        ) : (
          <>
            {isLastQuestion ? "Submit Final Answer" : "Submit Answer"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}