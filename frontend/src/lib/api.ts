import {
  Achievement,
  AnswerCheckResponse,
  CoursePath,
  HeartStatus,
  LeaderboardUser,
  LessonClient,
  LessonCompleteResponse,
  User,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let globalDebugDate: string | null = null;

export const setDebugDateHeader = (dateStr: string | null) => {
  globalDebugDate = dateStr;
  if (typeof window !== "undefined") {
    if (dateStr) {
      localStorage.setItem("duo_debug_date", dateStr);
    } else {
      localStorage.removeItem("duo_debug_date");
    }
  }
};

export const getDebugDateHeader = (): string | null => {
  if (globalDebugDate) return globalDebugDate;
  if (typeof window !== "undefined") {
    return localStorage.getItem("duo_debug_date");
  }
  return null;
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const debugDate = getDebugDateHeader();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (debugDate) {
    headers["X-Debug-Date"] = debugDate;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    const message = errorData?.detail || response.statusText || "Request failed";
    const error = new Error(typeof message === "string" ? message : JSON.stringify(message));
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}

export const api = {
  // User & Stats
  getMe: () => apiFetch<User>("/me"),
  updateMe: (data: { daily_goal_xp?: number; username?: string }) =>
    apiFetch<User>("/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getHearts: () => apiFetch<HeartStatus>("/me/hearts"),
  refillHearts: () =>
    apiFetch<{ success: boolean; hearts: number; gems: number; message: string }>("/me/hearts/refill", {
      method: "POST",
    }),
  getAchievements: () => apiFetch<Achievement[]>("/me/achievements"),
  getLeaderboard: () => apiFetch<LeaderboardUser[]>("/leaderboard"),

  // Dev
  devReset: () =>
    apiFetch<User>("/dev/reset", {
      method: "POST",
    }),

  // Course & Path
  getCoursePath: () => apiFetch<CoursePath>("/course/path"),

  // Lessons
  getLesson: (id: number) => apiFetch<LessonClient>(`/lessons/${id}`),
  checkAnswer: (lessonId: number, exerciseId: number, answer: any) =>
    apiFetch<AnswerCheckResponse>(`/lessons/${lessonId}/answer`, {
      method: "POST",
      body: JSON.stringify({ exercise_id: exerciseId, answer }),
    }),
  completeLesson: (lessonId: number, mistakes: number = 0) =>
    apiFetch<LessonCompleteResponse>(`/lessons/${lessonId}/complete`, {
      method: "POST",
      body: JSON.stringify({ mistakes }),
    }),
};
