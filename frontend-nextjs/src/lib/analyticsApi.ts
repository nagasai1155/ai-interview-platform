import api from "./api";

export interface AnalyticsSummary {
  totalSessions: number;
  completedSessions: number;
  totalAnswers: number;
  averageScore: number;
  bestScore: number;
  totalResumes: number;
  scoreTrend: {
    session: string;
    score: number;
    jobTitle: string;
    date: string;
  }[];
  recentSessions: {
    sessionId: number;
    jobTitle: string;
    status: string;
    overallScore: number;
    startedAt: string;
    completedAt: string | null;
  }[];
}

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await api.get("/analytics/summary");
  return res.data;
};