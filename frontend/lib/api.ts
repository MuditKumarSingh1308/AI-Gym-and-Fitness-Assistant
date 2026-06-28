import type {
  AdminStats,
  AnalyticsDashboard,
  AuthTokenPair,
  ChallengeRecommendation,
  ChatMessage,
  ChatResponse,
  ChatSession,
  CheckInResponse,
  DietPlan,
  DashboardSeries,
  GroceryList,
  Habit,
  NearbyGym,
  NutritionLog,
  PromptTemplateResponse,
  PublicUser,
  StreakSummary,
  WorkoutProgram,
  WorkoutSession,
  WorkoutSkipPredictionHistory,
  WorkoutSkipPredictionResponse,
} from "@/lib/types";

export type {
  ChallengeRecommendation,
  ChatMessage,
  ChatSession,
  CheckInResponse,
  DietPlan,
  GroceryList,
  Habit,
  NearbyGym,
  NutritionLog,
  PromptTemplateResponse,
  PublicUser,
  StreakSummary,
  WorkoutProgram,
  WorkoutSession,
  WorkoutSkipPredictionHistory,
  WorkoutSkipPredictionResponse,
} from "@/lib/types";

const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";

type Primitive = string | number | boolean | null | undefined;

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem("access_token");
}

export function setStoredAuth(tokens: AuthTokenPair, user?: PublicUser | null) {
  if (!isBrowser()) return;
  window.localStorage.setItem("access_token", tokens.access_token);
  window.localStorage.setItem("refresh_token", tokens.refresh_token);
  if (user) {
    window.localStorage.setItem("current_user", JSON.stringify(user));
  }
}

export function clearStoredAuth() {
  if (!isBrowser()) return;
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("current_user");
}

export function getStoredUser(): PublicUser | null {
  if (!isBrowser()) return null;
  const value = window.localStorage.getItem("current_user");
  if (!value) return null;
  try {
    return JSON.parse(value) as PublicUser;
  } catch {
    return null;
  }
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = response.statusText || "Request failed";
    try {
      const payload = await response.json();
      detail = payload?.detail ?? payload?.message ?? detail;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function fallback<T>(factory: () => T) {
  return factory();
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  full_name: string;
  role?: "user" | "trainer" | "admin";
};

export async function loginUser(payload: LoginPayload) {
  return requestJson<AuthTokenPair>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload: RegisterPayload) {
  return requestJson<PublicUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(token?: string | null) {
  return requestJson<PublicUser>("/auth/me", {}, token ?? getStoredToken());
}

export type AuthSessionResult = {
  user: PublicUser;
  tokens: AuthTokenPair;
};

export async function registerAndLogin(payload: RegisterPayload): Promise<AuthSessionResult> {
  const user = await registerUser(payload);
  const tokens = await loginUser({ email: payload.email, password: payload.password });
  return { user, tokens };
}

export type DashboardOverview = {
  overview: AnalyticsDashboard;
  series: DashboardSeries;
};

const dashboardFallback: DashboardOverview = {
  overview: {
    workout: {
      sessions: 2480,
      calories_burned: 168400,
      form_score: 91,
    },
    nutrition: {
      diet_plans: 980,
      protein_logs: 4310,
      water_intake: 2190,
    },
    habits: {
      current_streak: 18,
      completion_rate: 0.84,
    },
    performance_score: 89,
  },
  series: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    calories_burned: [1380, 1610, 1490, 1755, 1690, 1910, 2040],
    form_score: [86, 88, 91, 90, 92, 93, 94],
    habit_completion: [72, 78, 82, 85, 84, 88, 90],
  },
};

export async function fetchDashboardOverview(token?: string | null): Promise<DashboardOverview> {
  const authToken = token ?? getStoredToken();
  try {
    const [overview, series] = await Promise.all([
      requestJson<AnalyticsDashboard>("/analytics/dashboard", {}, authToken),
      requestJson<DashboardSeries>("/analytics/progress-series", {}, authToken),
    ]);
    return { overview, series };
  } catch {
    return fallback(() => dashboardFallback);
  }
}

export type WorkoutCreatePayload = {
  exercise_type: string;
  target_reps?: number | null;
  target_duration_seconds?: number | null;
};

export type WorkoutCompletePayload = {
  total_reps: number;
  duration_seconds: number;
  calories_burned: number;
  form_score: number;
  motion_efficiency_score: number;
  notes?: string | null;
};

export type WorkoutFramePayload = {
  frame_base64: string;
  frame_timestamp: number;
  include_overlay?: boolean;
};

export async function fetchSupportedExercises(token?: string | null) {
  return requestJson<string[]>("/workouts/exercises/supported", {}, token ?? getStoredToken());
}

export async function fetchWorkoutSessions(token?: string | null) {
  return requestJson<WorkoutSession[]>("/workouts/sessions", {}, token ?? getStoredToken());
}

export async function createWorkoutSession(payload: WorkoutCreatePayload, token?: string | null) {
  return requestJson<WorkoutSession>("/workouts/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function analyzeWorkoutFrame(sessionId: string, payload: WorkoutFramePayload, token?: string | null) {
  return requestJson<Record<string, unknown>>(`/workouts/sessions/${sessionId}/frames`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function completeWorkoutSession(sessionId: string, payload: WorkoutCompletePayload, token?: string | null) {
  return requestJson<WorkoutSession>(`/workouts/sessions/${sessionId}/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export type DietInput = {
  age: number;
  height_cm: number;
  weight_kg: number;
  gender: "male" | "female" | "other";
  activity_level: "sedentary" | "light" | "moderate" | "active" | "athlete";
  goal: "weight_loss" | "weight_gain" | "maintenance" | "fat_loss" | "muscle_gain";
  food_preference: "vegetarian" | "non_vegetarian" | "high_protein";
  allergies?: string[];
  cuisine_preference?: string;
};

export async function calculateBmi(payload: Pick<DietInput, "height_cm" | "weight_kg">, token?: string | null) {
  return requestJson<{ bmi: number; category: string }>("/diet/bmi", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function calculateCalories(payload: Pick<DietInput, "age" | "height_cm" | "weight_kg" | "gender" | "activity_level" | "goal">, token?: string | null) {
  return requestJson<{ bmr: number; tdee: number; daily_calorie_target: number; macro_targets: Record<string, number> }>("/diet/calories", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function generateDietPlan(payload: DietInput, token?: string | null) {
  return requestJson<DietPlan>("/diet/plans", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function fetchCurrentDietPlan(token?: string | null) {
  return requestJson<DietPlan | null>("/diet/plans/current", {}, token ?? getStoredToken());
}

export async function generateGroceryList(payload: DietInput, token?: string | null) {
  return requestJson<GroceryList>("/diet/grocery-list", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function fetchNutritionLogs(token?: string | null) {
  return requestJson<NutritionLog[]>("/diet/nutrition-logs", {}, token ?? getStoredToken());
}

export async function logNutrition(payload: NutritionLog, token?: string | null) {
  return requestJson<NutritionLog>("/diet/nutrition-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export type ChatPromptInput = {
  goal?: string;
  tone?: "friendly" | "direct" | "empathetic" | "energetic";
  memory_summary?: string;
  mood?: "happy" | "motivated" | "neutral" | "tired" | "stressed";
  sentiment?: "positive" | "neutral" | "negative";
};

export async function createChatSession(title?: string, token?: string | null) {
  return requestJson<ChatSession>("/chatbot/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  }, token ?? getStoredToken());
}

export async function fetchChatSessions(token?: string | null) {
  return requestJson<ChatSession[]>("/chatbot/sessions", {}, token ?? getStoredToken());
}

export async function fetchChatHistory(token?: string | null) {
  return requestJson<ChatMessage[]>("/chatbot/history", {}, token ?? getStoredToken());
}

export async function sendChatMessage(
  payload: {
    message: string;
    context?: Record<string, string>;
    conversation_id?: string | null;
    tone?: "friendly" | "direct" | "empathetic" | "energetic";
  },
  token?: string | null,
) {
  return requestJson<ChatResponse>("/chatbot/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function generatePromptTemplate(payload: ChatPromptInput, token?: string | null) {
  return requestJson<PromptTemplateResponse>("/chatbot/prompt-templates", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function submitCheckIn(payload: { energy_level: number; soreness_level: number; mood_text: string }, token?: string | null) {
  return requestJson<CheckInResponse>("/chatbot/check-ins", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function fetchHabits(token?: string | null) {
  return requestJson<Habit[]>("/habits", {}, token ?? getStoredToken());
}

export async function createHabit(payload: Habit, token?: string | null) {
  return requestJson<Habit>("/habits", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function fetchStreakSummary(token?: string | null) {
  return requestJson<StreakSummary>("/habits/streaks", {}, token ?? getStoredToken());
}

export async function fetchWorkoutSkipPrediction(token?: string | null) {
  return requestJson<{ completion_probability: number; missed_workout_risk: number; best_notification_time: string; motivation_style: string }>("/habits/prediction", {}, token ?? getStoredToken());
}

export type WorkoutSkipPayload = {
  prediction_date: string;
  workouts_last_7_days: number;
  workouts_last_30_days: number;
  previous_consistency: number;
  sleep_hours: number;
  mood: "very_low" | "low" | "neutral" | "good" | "great";
  weather: "clear" | "cloudy" | "rain" | "storm" | "hot" | "cold";
  calories_consumed: number;
  calories_target: number;
  working_hours: number;
  planned_workout_minutes?: number;
  model?: "random_forest" | "xgboost" | "ensemble";
};

export async function predictWorkoutSkip(payload: WorkoutSkipPayload, token?: string | null) {
  return requestJson<WorkoutSkipPredictionResponse>("/habits/workout-skip-prediction", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function fetchWorkoutSkipHistory(token?: string | null) {
  return requestJson<WorkoutSkipPredictionHistory[]>("/habits/workout-skip-predictions", {}, token ?? getStoredToken());
}

export type GymRecommendationInput = {
  latitude: number;
  longitude: number;
  radius_km?: number;
  goal: "fat_loss" | "muscle_gain" | "maintenance" | "endurance";
};

export type WorkoutProgramInput = {
  goal: "fat_loss" | "muscle_gain" | "maintenance" | "endurance";
  days_per_week: number;
  experience_level: "beginner" | "intermediate" | "advanced";
};

export async function fetchNearbyGyms(payload: GymRecommendationInput, token?: string | null) {
  return requestJson<NearbyGym[]>("/gym-recommendations/nearby", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function fetchWorkoutProgram(payload: WorkoutProgramInput, token?: string | null) {
  return requestJson<WorkoutProgram>("/gym-recommendations/workout-program", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token ?? getStoredToken());
}

export async function fetchChallenges(token?: string | null) {
  return requestJson<ChallengeRecommendation[]>("/gym-recommendations/challenges", {}, token ?? getStoredToken());
}

export async function fetchAdminStats(token?: string | null) {
  return requestJson<AdminStats>("/admin/stats", {}, token ?? getStoredToken());
}

export async function fetchAdminUsers(token?: string | null) {
  return requestJson<PublicUser[]>("/admin/users", {}, token ?? getStoredToken());
}

export function normalizeNumber(value: Primitive, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
