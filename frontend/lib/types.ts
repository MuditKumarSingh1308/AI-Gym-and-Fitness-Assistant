export type AuthTokenPair = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
};

export type PublicUser = {
  id?: string | null;
  email?: string | null;
  full_name?: string | null;
  role?: "user" | "trainer" | "admin" | string;
};

export type AnalyticsDashboard = {
  workout: {
    sessions?: number;
    calories_burned?: number;
    form_score?: number;
    [key: string]: unknown;
  };
  nutrition: {
    diet_plans?: number;
    protein_logs?: number;
    water_intake?: number;
    [key: string]: unknown;
  };
  habits: {
    current_streak?: number;
    completion_rate?: number;
    [key: string]: unknown;
  };
  performance_score: number;
};

export type DashboardSeries = {
  labels: string[];
  calories_burned: number[];
  form_score: number[];
  habit_completion: number[];
};

export type WorkoutSession = {
  id?: string;
  user_id?: string;
  exercise_type?: string;
  status?: "active" | "completed" | string;
  target_reps?: number | null;
  target_duration_seconds?: number | null;
  total_reps?: number;
  duration_seconds?: number;
  calories_burned?: number;
  form_score?: number;
  motion_efficiency_score?: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DietPlan = {
  id?: string;
  bmi: number;
  bmi_category: string;
  bmr: number;
  tdee: number;
  daily_calorie_target: number;
  protein_intake_g: number;
  water_intake_liters: number;
  macro_targets: Record<string, number>;
  meals: Array<{
    meal_type: string;
    name: string;
    calories: number;
    items: string[];
  }>;
  grocery_list: GroceryList;
};

export type GroceryList = {
  items: string[];
};

export type NutritionLog = {
  id?: string;
  date?: string;
  water_intake?: number;
  calories?: number;
  protein_g?: number;
  [key: string]: unknown;
};

export type ChatSession = {
  id: string;
  title?: string;
  summary?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ChatMessage = {
  id?: string;
  conversation_id?: string;
  sender: "user" | "assistant";
  message: string;
  mood_detected?: string;
  sentiment?: "positive" | "neutral" | "negative" | string;
  prompt_type?: string;
  created_at?: string;
};

export type ChatResponse = {
  conversation_id: string;
  message: string;
  mood_detected: string;
  sentiment: "positive" | "neutral" | "negative" | string;
  sentiment_score: number;
  motivational_tip: string;
  suggested_workouts: string[];
  suggested_meals: string[];
  memory_summary: string;
  model_used?: string;
  follow_up_question?: string | null;
};

export type PromptTemplateResponse = {
  system_prompt: string;
  user_prompt_template: string;
  response_guidelines: string[];
};

export type CheckInResponse = {
  mood_detected: string;
  recommendation: string;
};

export type Habit = {
  id?: string;
  user_id?: string;
  habit_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  completed?: boolean;
  streak_count?: number;
  date?: string;
  created_at?: string;
  updated_at?: string;
};

export type StreakSummary = {
  current_streak: number;
  longest_streak: number;
  completed_habits: number;
};

export type WorkoutSkipPredictionHistory = {
  id?: string;
  user_id?: string;
  prediction_date?: string;
  input_features?: Record<string, unknown>;
  prediction?: WorkoutSkipPredictionResponse;
  created_at?: string;
};

export type WorkoutSkipPredictionResponse = {
  prediction_date: string;
  likely_to_skip: boolean;
  skip_probability: number;
  confidence_score: number;
  model_used: string;
  metrics?: Record<string, unknown>;
  motivation_recommendation: string;
  risk_factors: string[];
};

export type WorkoutProgram = {
  goal: string;
  days_per_week: number;
  experience_level?: string;
  title?: string;
  estimated_duration_minutes?: number;
  weekly_schedule?: Record<string, string[]>;
  weekly_split?: Array<{
    day: string;
    focus: string;
    exercises: string[];
  }>;
};

export type ChallengeRecommendation = {
  title: string;
  description: string;
  duration_days?: number;
  reward?: string;
  difficulty?: string;
  reward_points?: number;
};

export type NearbyGym = {
  name: string;
  address?: string;
  distance_km?: number;
  rating?: number;
  amenities?: string[];
  equipment_match_score?: number;
};

export type AdminStats = {
  total_users: number;
  daily_active_users: number;
  workout_analytics: Record<string, unknown>;
  exercise_popularity: Record<string, number>;
  calories_burned: number;
  average_bmi: number;
  habit_score: number;
  prediction_accuracy: number;
  revenue_ready: boolean;
};
