"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarHeart, Flame, Loader2, RefreshCw, ShieldAlert, TimerReset } from "lucide-react";

export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import {
  fetchHabits,
  fetchStreakSummary,
  fetchWorkoutSkipHistory,
  getStoredToken,
  predictWorkoutSkip,
  type WorkoutSkipPayload,
  type Habit,
  type WorkoutSkipPredictionHistory,
  type WorkoutSkipPredictionResponse,
} from "@/lib/api";

type PredictionForm = Omit<WorkoutSkipPayload, "planned_workout_minutes" | "model"> & {
  planned_workout_minutes: number;
  model: NonNullable<WorkoutSkipPayload["model"]>;
};

const defaultPredictionForm: PredictionForm = {
  prediction_date: new Date().toISOString().slice(0, 10),
  workouts_last_7_days: 4,
  workouts_last_30_days: 14,
  previous_consistency: 0.82,
  sleep_hours: 7.2,
  mood: "neutral" as const,
  weather: "clear" as const,
  calories_consumed: 2200,
  calories_target: 2400,
  working_hours: 9,
  planned_workout_minutes: 45,
  model: "ensemble" as const,
};

export default function Page() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [history, setHistory] = useState<WorkoutSkipPredictionHistory[]>([]);
  const [streaks, setStreaks] = useState<{ current_streak: number; longest_streak: number; completed_habits: number } | null>(null);
  const [prediction, setPrediction] = useState<WorkoutSkipPredictionResponse | null>(null);
  const [form, setForm] = useState<PredictionForm>(defaultPredictionForm);
  const [isPending, startTransition] = useTransition();

  const reload = () =>
    Promise.all([fetchHabits(getStoredToken()), fetchStreakSummary(getStoredToken()), fetchWorkoutSkipHistory(getStoredToken())])
      .then(([habitList, streakSummary, predictionHistory]) => {
        setHabits(habitList);
        setStreaks(streakSummary);
        setHistory(predictionHistory);
      })
      .catch(() => {
        setHabits([]);
        setHistory([]);
      });

  useEffect(() => {
    reload();
  }, []);

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Habit tracker"
          title="Consistency engine and workout skip prediction"
          description="Track habits, see streaks, and generate an ML-backed skip risk score with motivation advice."
          actions={
            <button type="button" onClick={reload} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Current streak" value={String(streaks?.current_streak ?? 18)} icon={CalendarHeart} hint="Consecutive successful habit days." />
          <StatCard title="Longest streak" value={String(streaks?.longest_streak ?? 42)} icon={TimerReset} hint="Peak consistency window from the history collection." />
          <StatCard title="Completed habits" value={String(streaks?.completed_habits ?? 126)} icon={Flame} hint="Completed habit entries stored in MongoDB." />
          <StatCard title="Skip risk" value={prediction ? `${Math.round(prediction.skip_probability * 100)}%` : "27%"} icon={ShieldAlert} hint="Workout skip prediction from Random Forest or XGBoost." />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
          <SectionCard title="Workout skip prediction" description="Feed in sleep, mood, weather, calories, and working hours to get a probability score and a motivation recommendation.">
            <div className="grid gap-4 md:grid-cols-2">
              <SmallNumberField label="Workout days last 7" value={form.workouts_last_7_days} onChange={(value) => setForm((current) => ({ ...current, workouts_last_7_days: value }))} />
              <SmallNumberField label="Workout days last 30" value={form.workouts_last_30_days} onChange={(value) => setForm((current) => ({ ...current, workouts_last_30_days: value }))} />
              <SmallNumberField label="Consistency" value={Math.round(form.previous_consistency * 100)} onChange={(value) => setForm((current) => ({ ...current, previous_consistency: value / 100 }))} suffix="%" />
              <SmallNumberField label="Sleep hours" value={form.sleep_hours} onChange={(value) => setForm((current) => ({ ...current, sleep_hours: value }))} />
              <SelectField label="Mood" value={form.mood} onChange={(value) => setForm((current) => ({ ...current, mood: value }))} options={["very_low", "low", "neutral", "good", "great"]} />
              <SelectField label="Weather" value={form.weather} onChange={(value) => setForm((current) => ({ ...current, weather: value }))} options={["clear", "cloudy", "rain", "storm", "hot", "cold"]} />
              <SmallNumberField label="Calories consumed" value={form.calories_consumed} onChange={(value) => setForm((current) => ({ ...current, calories_consumed: value }))} />
              <SmallNumberField label="Calories target" value={form.calories_target} onChange={(value) => setForm((current) => ({ ...current, calories_target: value }))} />
              <SmallNumberField label="Working hours" value={form.working_hours} onChange={(value) => setForm((current) => ({ ...current, working_hours: value }))} />
              <SmallNumberField label="Workout minutes" value={form.planned_workout_minutes} onChange={(value) => setForm((current) => ({ ...current, planned_workout_minutes: value }))} />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  void (async () => {
                    const result = await predictWorkoutSkip(form, getStoredToken());
                    setPrediction(result);
                    setHistory((current) => [
                      {
                        prediction_date: result.prediction_date,
                        input_features: form,
                        prediction: result,
                        created_at: new Date().toISOString(),
                      },
                      ...current,
                    ]);
                  })().catch(() => undefined);
                });
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              Predict skip risk
            </button>

            {prediction ? (
              <div className="mt-4 rounded-[24px] border border-border bg-background p-4">
                <p className="text-sm font-semibold">Prediction result</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{prediction.motivation_recommendation}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Metric label="Skip probability" value={`${Math.round(prediction.skip_probability * 100)}%`} />
                  <Metric label="Confidence" value={`${Math.round(prediction.confidence_score * 100)}%`} />
                  <Metric label="Model" value={prediction.model_used} />
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Habits and history" description="Stored habit records and prediction history from MongoDB.">
            <div className="grid gap-3">
              {habits.length ? (
                habits.slice(0, 5).map((habit) => (
                  <article key={habit.id ?? `${habit.habit_type}-${habit.date}`} className="rounded-[22px] border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold capitalize">{habit.habit_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {habit.current_value}/{habit.target_value} {habit.unit}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs ${habit.completed ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {habit.completed ? "Completed" : "In progress"}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No habits loaded yet. The backend can persist workout, water, sleep, and nutrition habits.</p>
              )}
            </div>
            <div className="mt-5 space-y-3">
              {history.length ? (
                history.slice(0, 3).map((entry) => (
                  <div key={entry.id ?? entry.prediction_date} className="rounded-[22px] border border-border bg-background p-4 text-sm">
                    <p className="font-semibold">{entry.prediction_date}</p>
                    <p className="mt-2 text-muted-foreground">{entry.prediction?.motivation_recommendation ?? "Prediction details will appear here after the first run."}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Prediction history will appear here after the first run.</p>
              )}
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}

function SmallNumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <div className="flex items-center rounded-[20px] border border-border bg-background">
        <input
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          type="number"
          className="w-full rounded-[20px] bg-transparent px-4 py-3 text-sm outline-none"
        />
        {suffix ? <span className="px-4 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: T[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="w-full rounded-[20px] border border-border bg-background px-4 py-3 text-sm outline-none">
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border bg-background p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
