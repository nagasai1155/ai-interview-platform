"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-500 mb-6">
            Logged in as <span className="font-medium text-indigo-600">{user?.email}</span>
          </p>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white 
                       px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}