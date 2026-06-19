"use client";

interface Props {
  score: number;
  feedback: string;
  strengths: string;
  improvements: string;
  onNext: () => void;
  isLastQuestion: boolean;
  isCompleted: boolean;
}

export default function FeedbackCard({
  score,
  feedback,
  strengths,
  improvements,
  onNext,
  isLastQuestion,
  isCompleted,
}: Props) {
  const scoreColor =
    score >= 8 ? "text-green-600" :
    score >= 5 ? "text-yellow-600" : "text-red-500";

  const scoreBg =
    score >= 8 ? "bg-green-50 border-green-200" :
    score >= 5 ? "bg-yellow-50 border-yellow-200" :
    "bg-red-50 border-red-200";

  const scoreLabel =
    score >= 8 ? "Excellent!" :
    score >= 5 ? "Good" : "Needs Improvement";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6
      space-y-4">

      {/* Score */}
      <div className={`flex items-center justify-between p-4 rounded-xl
        border ${scoreBg}`}>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">AI Score</p>
          <p className={`text-3xl font-bold ${scoreColor}`}>
            {score}
            <span className="text-lg text-gray-400">/10</span>
          </p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold ${scoreColor}`}>
            {scoreLabel}
          </span>
          <div className="flex gap-0.5 mt-1 justify-end">
            {[1,2,3,4,5,6,7,8,9,10].map((i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${
                i <= score ? (
                  score >= 8 ? "bg-green-500" :
                  score >= 5 ? "bg-yellow-500" : "bg-red-400"
                ) : "bg-gray-200"
              }`} />
            ))}
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase
          tracking-wide mb-2">
          AI Feedback
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
      </div>

      {/* Strengths */}
      {strengths && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor"
              viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0
                000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586
                7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414
                0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-semibold text-green-700">
              Strengths
            </p>
          </div>
          <p className="text-sm text-green-700 leading-relaxed">
            {strengths}
          </p>
        </div>
      )}

      {/* Improvements */}
      {improvements && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-orange-600" fill="currentColor"
              viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36
                2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213
                2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11
                13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1
                1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd" />
            </svg>
            <p className="text-xs font-semibold text-orange-700">
              Areas to Improve
            </p>
          </div>
          <p className="text-sm text-orange-700 leading-relaxed">
            {improvements}
          </p>
        </div>
      )}

      {/* Next Button */}
      {!isCompleted && (
        <button
          onClick={onNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700
            text-white font-medium py-3 rounded-xl text-sm
            transition flex items-center justify-center gap-2"
        >
          {isLastQuestion ? (
            <>
              View Results
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0
                  00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0
                  012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0
                  002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0
                  01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </>
          ) : (
            <>
              Next Question
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}