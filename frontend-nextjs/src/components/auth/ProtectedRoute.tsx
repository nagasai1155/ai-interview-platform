"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent 
                        rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}