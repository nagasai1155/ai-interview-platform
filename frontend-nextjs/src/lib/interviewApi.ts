import api from "./api";

export interface Question {
  id: number;
  questionText: string;
  category: string;
  difficulty: string;
  orderIndex: number;
}

export interface Session {
  sessionId: number;
  jobTitle: string;
  status: string;
  questions: Question[];
  message: string;
}

export interface AnswerFeedback {
  answerId: number;
  questionId: number;
  score: number;
  feedback: string;
  strengths: string;
  improvements: string;
  sessionStatus: string;
  nextQuestion: Question | null;
  message?: string;
}

export interface SessionDetail {
  sessionId: number;
  jobTitle: string;
  status: string;
  overallScore: number;
  startedAt: string;
  completedAt: string | null;
  questionsAndAnswers: any[];
}

// create session + generate questions
export const createSession = async (data: {
  resumeId: number;
  jobTitle: string;
  jobDescription: string;
  interviewType: string;
  questionCount: number;
}): Promise<Session> => {
  const res = await api.post("/interview/session", data);
  return res.data;
};

// submit answer + get AI feedback
export const submitAnswer = async (
  sessionId: number,
  questionId: number,
  answerText: string
): Promise<AnswerFeedback> => {
  const res = await api.post(`/interview/session/${sessionId}/answer`, {
    questionId,
    answerText,
  });
  return res.data;
};

// get full session with all Q&A
export const getSession = async (
  sessionId: number
): Promise<SessionDetail> => {
  const res = await api.get(`/interview/session/${sessionId}`);
  return res.data;
};

// get all sessions
export const getUserSessions = async (): Promise<any[]> => {
  const res = await api.get("/interview/sessions");
  return res.data;
};