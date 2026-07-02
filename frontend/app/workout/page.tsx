"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Camera, CheckCircle2, Loader2, RefreshCw, SquareActivity, TimerReset, Video } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { completeWorkoutSession, createWorkoutSession, fetchSupportedExercises, fetchWorkoutSessions, getStoredToken, type WorkoutSession } from "@/lib/api";

const exerciseLabels = ["squat", "pushup", "plank", "jumping_jack", "bicep_curl", "lunge", "shoulder_press"];

export default function Page() {
  const [supported, setSupported] = useState<string[]>(exerciseLabels);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    exercise_type: "pushup",
    target_reps: 12,
    target_duration_seconds: 300,
  });
  const [completeForm, setCompleteForm] = useState({
    total_reps: 12,
    duration_seconds: 300,
    calories_burned: 180,
    form_score: 92,
    motion_efficiency_score: 88,
    notes: "Good posture and stable tempo.",
  });

  const loadSessions = () =>
    Promise.all([fetchSupportedExercises(getStoredToken()), fetchWorkoutSessions(getStoredToken())])
      .then(([supportedExercises, workoutSessions]) => {
        setSupported(supportedExercises.length ? supportedExercises : exerciseLabels);
        setSessions(workoutSessions);
        setActiveSession(workoutSessions.find((session) => session.status === "active") ?? null);
      })
      .catch(() => {
        setSupported(exerciseLabels);
        setSessions([]);
      });

  useEffect(() => {
    loadSessions();
  }, []);

  const activeSummary = useMemo(() => {
    const current = activeSession ?? sessions[0];
    return current
      ? [
          ["Exercise", current.exercise_type],
          ["Status", current.status],
          ["Reps", String(current.total_reps ?? 0)],
          ["Form score", `${Math.round(current.form_score ?? 0)}%`],
        ]
      : [
          ["Exercise", "Live session"],
          ["Status", "Ready"],
          ["Reps", "0"],
          ["Form score", "94%"],
        ];
  }, [activeSession, sessions]);

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Workout trainer"
          title="Pose detection and rep counting in one control panel"
          description="Start a workout session, review supported exercises, and push completed reps to the FastAPI backend."
          actions={
            <button type="button" onClick={loadSessions} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Supported moves" value={String(supported.length)} icon={SquareActivity} hint="Pushups, squats, lunges, curls, and more." />
          <StatCard title="Live confidence" value="96%" icon={Camera} hint="Backend pose inference returns confidence with each frame." />
          <StatCard title="Form quality" value="92%" icon={CheckCircle2} hint="Derived from joint angles, posture, and motion efficiency." />
          <StatCard title="Video flow" value="Ready" icon={Video} hint="Webcam capture can stream frames to /workouts/sessions/{id}/frames." />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard title="Start a workout session" description="Create a server-backed workout session and connect live webcam frames when the camera feed is available.">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block md:col-span-3">
                <span className="mb-2 block text-sm font-medium">Exercise</span>
                <select
                  value={form.exercise_type}
                  onChange={(event) => setForm((current) => ({ ...current, exercise_type: event.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                >
                  {supported.map((exercise) => (
                    <option key={exercise} value={exercise}>
                      {exercise.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Target reps" value={form.target_reps} onChange={(value) => setForm((current) => ({ ...current, target_reps: value }))} />
              <Field label="Target duration" value={form.target_duration_seconds} onChange={(value) => setForm((current) => ({ ...current, target_duration_seconds: value }))} suffix="sec" />
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => {
                      void (async () => {
                        const session = await createWorkoutSession(
                          {
                            exercise_type: form.exercise_type,
                            target_reps: Number(form.target_reps),
                            target_duration_seconds: Number(form.target_duration_seconds),
                          },
                          getStoredToken(),
                        );
                        setActiveSession(session);
                        setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
                      })().catch(() => undefined);
                    });
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TimerReset className="h-4 w-4" />}
                  Start session
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Session status" description="Use this panel to store results once the workout is completed.">
            <div className="grid gap-3 sm:grid-cols-2">
              {activeSummary.map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Total reps" value={completeForm.total_reps} onChange={(value) => setCompleteForm((current) => ({ ...current, total_reps: value }))} />
              <Field label="Duration" value={completeForm.duration_seconds} onChange={(value) => setCompleteForm((current) => ({ ...current, duration_seconds: value }))} suffix="sec" />
              <Field label="Calories" value={completeForm.calories_burned} onChange={(value) => setCompleteForm((current) => ({ ...current, calories_burned: value }))} suffix="kcal" />
              <Field label="Form score" value={completeForm.form_score} onChange={(value) => setCompleteForm((current) => ({ ...current, form_score: value }))} suffix="%" />
            </div>
            <div className="mt-4">
                <button
                  type="button"
                  disabled={!activeSession || isPending}
                  onClick={() => {
                    const sessionId = activeSession?.id;
                    if (!sessionId) return;
                    startTransition(() => {
                      void (async () => {
                        const session = await completeWorkoutSession(
                          sessionId,
                          {
                            total_reps: Number(completeForm.total_reps),
                            duration_seconds: Number(completeForm.duration_seconds),
                            calories_burned: Number(completeForm.calories_burned),
                            form_score: Number(completeForm.form_score),
                            motion_efficiency_score: Number(completeForm.motion_efficiency_score),
                            notes: completeForm.notes,
                          },
                          getStoredToken(),
                        );
                        setActiveSession(session);
                        await loadSessions();
                      })().catch(() => undefined);
                    });
                  }}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete session
              </button>
            </div>
          </SectionCard>
        </section>

        <SectionCard title="Recent workout sessions" description="All tracked sessions returned by the FastAPI backend.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sessions.length ? (
              sessions.map((session) => (
                <article key={session.id ?? `${session.exercise_type}-${session.created_at}`} className="rounded-[22px] border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold capitalize">{(session.exercise_type ?? "workout").replaceAll("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">{session.status}</p>
                    </div>
                    <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{Math.round(session.form_score ?? 0)}% form</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <p>Reps: {session.total_reps ?? 0}</p>
                    <p>Duration: {session.duration_seconds ?? 0}s</p>
                    <p>Calories: {Math.round(session.calories_burned ?? 0)}</p>
                    <p>Efficiency: {Math.round(session.motion_efficiency_score ?? 0)}%</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                No sessions yet. Start one above to begin recording workout history.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

function Field({
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
      <div className="flex items-center rounded-2xl border border-border bg-background">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-2xl bg-transparent px-4 py-3 text-sm outline-none"
        />
        {suffix ? <span className="px-4 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}
