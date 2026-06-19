"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  const cards = [
    {
      title: "My Resumes",
      desc: "Upload and manage your resumes",
      icon: "📄",
      href: "/dashboard/resume",
      color: "bg-indigo-50 border-indigo-200",
      iconBg: "bg-indigo-100",
    },
    {
      title: "Mock Interview",
      desc: "Practice with AI questions",
      icon: "🎯",
      href: "/dashboard/interview",
      color: "bg-purple-50 border-purple-200",
      iconBg: "bg-purple-100",
    },
    {
      title: "ATS Checker",
      desc: "Check your resume score",
      icon: "📊",
      href: "/dashboard/ats",
      color: "bg-green-50 border-green-200",
      iconBg: "bg-green-100",
    },
    {
      title: "Analytics",
      desc: "Track your progress",
      icon: "📈",
      href: "/dashboard/analytics",
      color: "bg-orange-50 border-orange-200",
      iconBg: "bg-orange-100",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
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

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                👋 {user?.email}
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-red-600
                  border border-gray-200 hover:border-red-200
                  px-3 py-1.5 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              What would you like to do today?
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card) => (
              <Link key={card.title} href={card.href}>
                <div className={`border rounded-2xl p-6 cursor-pointer
                  hover:shadow-md transition-shadow ${card.color}`}>
                  <div className={`w-11 h-11 ${card.iconBg} rounded-xl
                    flex items-center justify-center text-xl mb-4`}>
                    {card.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}