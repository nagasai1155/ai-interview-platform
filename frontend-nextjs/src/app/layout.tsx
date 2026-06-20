import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InterviewAI",
  description: "AI Powered Interview Preparation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning tells React to ignore
          attributes added by browser extensions */}
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}