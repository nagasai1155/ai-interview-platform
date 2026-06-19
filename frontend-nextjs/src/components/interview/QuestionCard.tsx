"use client";

interface Props {
  question: {
    id: number;
    questionText: string;
    category: string;
    difficulty: string;
    orderIndex: number;
  };
  totalQuestions: number;
  currentIndex: number;
}

export default function QuestionCard({
  question,
  totalQuestions,
  currentIndex,
}: Props) {
  const difficultyColor = {
    EASY: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HARD: "bg-red-100 text-red-700",
  }[question.difficulty] ?? "bg-gray-100 text-gray-600";

  const categoryColor = {
    technical: "bg-indigo-100 text-indigo-700",
    behavioural: "bg-purple-100 text-purple-700",
    situational: "bg-blue-100 text-blue-700",
  }[question.category] ?? "bg-gray-100 text-gray-600";

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 font-medium">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-100 rounded-full">
            <div
              className="h-1.5 bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full
          capitalize ${categoryColor}`}>
          {question.category}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full
          ${difficultyColor}`}>
          {question.difficulty}
        </span>
      </div>

      {/* Question */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center
          justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2
              2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006
              2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0
              11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-800 font-medium leading-relaxed text-base">
          {question.questionText}
        </p>
      </div>
    </div>
  );
}