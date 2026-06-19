"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import QuestionCard from "@/components/interview/QuestionCard";
import AnswerInput from "@/components/interview/AnswerInput";
import FeedbackCard from "@/components/interview/FeedbackCard";
import { getSession, submitAnswer } from "@/lib/interviewApi";
import Link from "next/link";

type Phase = "answering" | "feedback" | "completed";

export default function ActiveInterviewPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>("answering");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const data = await getSession(Number(sessionId));
      setSession(data);

      // find first unanswered question
      const firstUnanswered = data.questionsAndAnswers.findIndex(
        (qa: any) => !qa.answered
      );
      if (firstUnanswered === -1) {
        // all answered
        setPhase("completed");
        setCurrentQuestionIndex(data.questionsAndAnswers.length - 1);
      } else {
        setCurrentQuestionIndex(firstUnanswered);
      }
    } catch (err) {
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answerText: string) => {
    setSubmitting(true);
    setError("");
    try {
      const currentQA = session.questionsAndAnswers[currentQuestionIndex];
      const feedback = await submitAnswer(
        Number(sessionId),
        currentQA.questionId,
        answerText
      );

      setLastFeedback(feedback);
      setPhase("feedback");

      // reload session to get updated data
      const updated = await getSession(Number(sessionId));
      setSession(updated);

      if (feedback.sessionStatus === "COMPLETED") {
        setPhase("completed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < session.questionsAndAnswers.length) {
      setCurrentQuestionIndex(nextIndex);
      setPhase("answering");
      setLastFeedback(null);
    } else {
      setPhase("completed");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center
          justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600
              border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Loading interview...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!session) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center
          justify-center">
          <p className="text-gray-500">Session not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  const questions = session.questionsAndAnswers;
  const currentQA = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answeredCount = questions.filter((q: any) => q.answered).length;
  const totalScore = questions
    .filter((q: any) => q.answered)
    .reduce((sum: number, q: any) => sum + (q.score || 0), 0);
  const avgScore = answeredCount > 0
    ? Math.round(totalScore / answeredCount) : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4
          sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center
            justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex
                items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {session.jobTitle}
                </p>
                <p className="text-xs text-gray-500">Mock Interview</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Score tracker */}
              {answeredCount > 0 && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">Avg Score</p>
                  <p className={`text-sm font-bold ${
                    avgScore >= 8 ? "text-green-600" :
                    avgScore >= 5 ? "text-yellow-600" : "text-red-500"
                  }`}>
                    {avgScore}/10
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500">Progress</p>
                <p className="text-sm font-bold text-gray-800">
                  {answeredCount}/{questions.length}
                </p>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700
              text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* COMPLETED STATE */}
          {phase === "completed" ? (
            <div className="space-y-4">
              {/* Results Card */}
              <div className="bg-white border border-gray-200 rounded-2xl
                p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex
                  items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2
                      0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0
                      0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0
                      002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0
                      012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Interview Complete!
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Here's how you performed
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-indigo-600">
                      {session.overallScore || avgScore}
                      <span className="text-sm text-gray-400">/10</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Overall Score
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-600">
                      {answeredCount}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Questions Answered
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-purple-600">
                      {questions.filter((q: any) =>
                        q.score >= 7).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Strong Answers
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href="/dashboard/interview"
                    className="flex-1 border border-gray-200 text-gray-700
                    hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm
                    transition text-center">
                    New Interview
                  </Link>
                  <Link href="/dashboard"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700
                    text-white font-medium py-2.5 rounded-xl text-sm
                    transition text-center">
                    Dashboard
                  </Link>
                </div>
              </div>

              {/* All Q&A Review */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Review All Answers
                </h3>
                {questions.map((qa: any, i: number) => (
                  <div key={qa.questionId} className="bg-white border
                    border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700
                        rounded-full text-xs font-bold flex items-center
                        justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-800">
                        {qa.questionText}
                      </p>
                    </div>

                    {qa.answered && (
                      <div className="ml-9 space-y-2">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Your answer
                          </p>
                          <p className="text-xs text-gray-700">
                            {qa.answerText}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${
                            qa.score >= 8 ? "text-green-600" :
                            qa.score >= 5 ? "text-yellow-600" :
                            "text-red-500"
                          }`}>
                            Score: {qa.score}/10
                          </span>
                          <span className="text-xs text-gray-500">
                            {qa.category}
                          </span>
                        </div>
                        {qa.feedback && (
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {qa.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          ) : (
            /* ACTIVE INTERVIEW STATE */
            <>
              {/* Question */}
              <QuestionCard
                question={{
                  id: currentQA.questionId,
                  questionText: currentQA.questionText,
                  category: currentQA.category,
                  difficulty: currentQA.difficulty,
                  orderIndex: currentQA.orderIndex,
                }}
                totalQuestions={questions.length}
                currentIndex={currentQuestionIndex}
              />

              {/* Answer or Feedback */}
              {phase === "answering" ? (
                <AnswerInput
                  onSubmit={handleSubmitAnswer}
                  isLoading={submitting}
                  isLastQuestion={isLastQuestion}
                />
              ) : lastFeedback && (
                <FeedbackCard
                  score={lastFeedback.score}
                  feedback={lastFeedback.feedback}
                  strengths={lastFeedback.strengths}
                  improvements={lastFeedback.improvements}
                  onNext={handleNextQuestion}
                  isLastQuestion={isLastQuestion}
                  isCompleted={false}
                />
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}