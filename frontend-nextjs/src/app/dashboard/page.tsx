"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { getAnalyticsSummary, AnalyticsSummary } from "@/lib/analyticsApi";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({
    label, value, sub, color, icon
  }: {
    label: string;
    value: string | number;
    sub?: string;
    color: string;
    icon: string;
  }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-xs font-medium">{label}</span>
        <span className={`w-8 h-8 ${color} rounded-xl flex items-center
          justify-center text-base`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4
          sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex
                items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-800 text-lg">
                InterviewAI
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                {user?.email}
              </span>
              <button onClick={logout}
                className="text-sm text-gray-500 hover:text-red-600
                border border-gray-200 hover:border-red-200
                px-3 py-1.5 rounded-lg transition">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Here's your interview preparation progress
              </p>
            </div>
            <Link href="/dashboard/interview"
              className="bg-indigo-600 hover:bg-indigo-700 text-white
              text-sm font-medium px-4 py-2.5 rounded-xl transition
              flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Interview
            </Link>
          </div>

          {/* Stat Cards */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-white border border-gray-200
                  rounded-2xl p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-7 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Sessions"
                value={analytics?.totalSessions ?? 0}
                sub={`${analytics?.completedSessions ?? 0} completed`}
                color="bg-indigo-100"
                icon="🎯"
              />
              <StatCard
                label="Average Score"
                value={analytics?.averageScore
                  ? `${analytics.averageScore}/10` : "—"}
                sub="across all interviews"
                color="bg-green-100"
                icon="📊"
              />
              <StatCard
                label="Best Score"
                value={analytics?.bestScore
                  ? `${analytics.bestScore}/10` : "—"}
                sub="personal best"
                color="bg-yellow-100"
                icon="⭐"
              />
              <StatCard
                label="Resumes"
                value={analytics?.totalResumes ?? 0}
                sub={`${analytics?.totalAnswers ?? 0} answers given`}
                color="bg-purple-100"
                icon="📄"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Score Trend Chart */}
            <div className="lg:col-span-2 bg-white border border-gray-200
              rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-5">
                Score Trend
              </h2>

              {!loading && analytics?.scoreTrend &&
               analytics.scoreTrend.length > 0 ? (
                <div className="space-y-3">
                  {analytics.scoreTrend.map((point, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-6 shrink-0">
                        {point.session}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all
                            duration-700 ${
                            point.score >= 8 ? "bg-green-500" :
                            point.score >= 5 ? "bg-yellow-500" :
                            "bg-red-400"
                          }`}
                          style={{ width: `${point.score * 10}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-8 text-right
                        ${point.score >= 8 ? "text-green-600" :
                        point.score >= 5 ? "text-yellow-600" :
                        "text-red-500"}`}>
                        {point.score}/10
                      </span>
                      <span className="text-xs text-gray-400 truncate
                        max-w-24 hidden sm:block">
                        {point.jobTitle}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center
                  py-12 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex
                    items-center justify-center mb-3">
                    <span className="text-2xl">📈</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    No completed interviews yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete your first interview to see your trend
                  </p>
                  <Link href="/dashboard/interview"
                    className="mt-4 text-xs text-indigo-600
                    hover:underline font-medium">
                    Start Interview →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  {[
                    {
                      icon: "🎯",
                      label: "Start Interview",
                      desc: "Practice with AI",
                      href: "/dashboard/interview",
                      color: "bg-indigo-50 hover:bg-indigo-100",
                    },
                    {
                      icon: "📄",
                      label: "My Resumes",
                      desc: "Upload or manage",
                      href: "/dashboard/resume",
                      color: "bg-purple-50 hover:bg-purple-100",
                    },
                    {
                      icon: "📊",
                      label: "ATS Checker",
                      desc: "Check job match",
                      href: "/dashboard/ats",
                      color: "bg-green-50 hover:bg-green-100",
                    },
                  ].map((item) => (
                    <Link key={item.label} href={item.href}>
                      <div className={`flex items-center gap-3 p-3
                        rounded-xl transition cursor-pointer ${item.color}`}>
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 ml-auto"
                          fill="none" stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-700">
                Recent Sessions
              </h2>
              <Link href="/dashboard/interview"
                className="text-xs text-indigo-600 hover:underline">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl
                    animate-pulse" />
                ))}
              </div>
            ) : analytics?.recentSessions &&
              analytics.recentSessions.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentSessions.map((session) => (
                  <Link key={session.sessionId}
                    href={`/dashboard/interview/${session.sessionId}`}>
                    <div className="flex items-center justify-between
                      p-4 bg-gray-50 hover:bg-indigo-50 border
                      border-gray-200 hover:border-indigo-200
                      rounded-xl transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white border
                          border-gray-200 rounded-xl flex items-center
                          justify-center">
                          <span className="text-base">🎯</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {session.jobTitle || "Interview Session"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.startedAt)
                              .toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2.5
                          py-1 rounded-full ${
                          session.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {session.status}
                        </span>
                        {session.status === "COMPLETED" && (
                          <span className={`text-sm font-bold ${
                            session.overallScore >= 8 ? "text-green-600" :
                            session.overallScore >= 5 ? "text-yellow-600" :
                            "text-red-500"
                          }`}>
                            {session.overallScore}/10
                          </span>
                        )}
                        <svg className="w-4 h-4 text-gray-400"
                          fill="none" stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="text-3xl">🎯</span>
                <p className="text-sm text-gray-500 mt-3">
                  No interviews yet
                </p>
                <Link href="/dashboard/interview"
                  className="mt-3 inline-block text-xs text-indigo-600
                  hover:underline font-medium">
                  Start your first interview →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}