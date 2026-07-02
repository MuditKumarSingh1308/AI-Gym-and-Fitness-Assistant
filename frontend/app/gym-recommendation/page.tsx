"use client";

import { useState, useTransition } from "react";
import { MapPinned, RefreshCw, Search, Target, Trophy } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { fetchChallenges, fetchNearbyGyms, fetchWorkoutProgram, getStoredToken, type ChallengeRecommendation, type NearbyGym, type WorkoutProgram } from "@/lib/api";

type FormState = {
  latitude: number;
  longitude: number;
  radius_km: number;
  goal: "fat_loss" | "muscle_gain" | "maintenance" | "endurance";
  days_per_week: number;
  experience_level: "beginner" | "intermediate" | "advanced";
};

export default function Page() {
  const [nearbyGyms, setNearbyGyms] = useState<NearbyGym[]>([]);
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [challenges, setChallenges] = useState<ChallengeRecommendation[]>([]);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>({
    latitude: 28.6139,
    longitude: 77.209,
    radius_km: 5,
    goal: "muscle_gain" as const,
    days_per_week: 5,
    experience_level: "intermediate" as const,
  });

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Gym recommendation"
          title="Nearby gyms, workout programs, and challenge ideas"
          description="Find nearby gyms, build a weekly program, and surface challenge recommendations from the backend."
          actions={
            <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Nearby gyms" value={String(nearbyGyms.length || 4)} icon={MapPinned} hint="Geospatial gym matches near the selected location." />
          <StatCard title="Challenge ideas" value={String(challenges.length || 3)} icon={Trophy} hint="Challenge recommendations to improve retention and engagement." />
          <StatCard title="Weekly sessions" value={String(form.days_per_week)} icon={Target} hint="Weekly workout split used for the program generator." />
          <StatCard title="Radius" value={`${form.radius_km} km`} icon={Search} hint="Search radius for nearby gym recommendations." />
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard title="Recommendation inputs" description="Latitude, longitude, goal, and experience level flow into the backend recommendation service.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Latitude" value={form.latitude} onChange={(value) => setForm((current) => ({ ...current, latitude: value }))} />
              <Field label="Longitude" value={form.longitude} onChange={(value) => setForm((current) => ({ ...current, longitude: value }))} />
              <Field label="Radius km" value={form.radius_km} onChange={(value) => setForm((current) => ({ ...current, radius_km: value }))} />
              <SelectField label="Goal" value={form.goal} onChange={(value) => setForm((current) => ({ ...current, goal: value }))} options={["fat_loss", "muscle_gain", "maintenance", "endurance"]} />
              <Field label="Days / week" value={form.days_per_week} onChange={(value) => setForm((current) => ({ ...current, days_per_week: value }))} />
              <SelectField label="Experience" value={form.experience_level} onChange={(value) => setForm((current) => ({ ...current, experience_level: value }))} options={["beginner", "intermediate", "advanced"]} />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  void (async () => {
                    const token = getStoredToken();
                    const [gyms, workoutProgram, challengeList] = await Promise.all([
                      fetchNearbyGyms(form, token),
                      fetchWorkoutProgram(form, token),
                      fetchChallenges(token),
                    ]);
                    setNearbyGyms(gyms);
                    setProgram(workoutProgram);
                    setChallenges(challengeList);
                  })().catch(() => undefined);
                });
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Search className="h-4 w-4" />
              Find recommendations
            </button>
          </SectionCard>

          <SectionCard title="Results" description="Nearby gyms, workout schedule, and challenge recommendations.">
            <div className="space-y-4">
              <div className="grid gap-3">
                {(nearbyGyms.length ? nearbyGyms : [
                  { name: "Peak Performance Gym", address: "Sector 18, Noida", distance_km: 2.1, rating: 4.7, equipment_match_score: 0.91 },
                  { name: "Iron Temple Fitness", address: "Connaught Place, New Delhi", distance_km: 4.3, rating: 4.5, equipment_match_score: 0.88 },
                ]).map((gym) => (
                  <article key={gym.name} className="rounded-[22px] border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{gym.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{gym.address}</p>
                      </div>
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{Number(gym.distance_km ?? 0).toFixed(1)} km</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <p>Rating: {Number(gym.rating ?? 0).toFixed(1)}</p>
                      <p>Match: {Math.round((gym.equipment_match_score ?? 0) * 100)}%</p>
                    </div>
                  </article>
                ))}
              </div>

              {program ? (
                <div className="rounded-[22px] border border-border bg-background p-4">
                  <p className="font-semibold">{program.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{program.estimated_duration_minutes} minutes per session</p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    {Object.entries(program.weekly_schedule as Record<string, string[]>).map(([day, items]) => (
                      <div key={day} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
                        <span className="font-medium text-foreground">{day}</span>
                        <span>{items.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3">
                {(challenges.length ? challenges : [
                  { title: "7-Day Strength Sprint", duration_days: 7, difficulty: "medium", reward_points: 120 },
                  { title: "Consistency Builder", duration_days: 14, difficulty: "easy", reward_points: 180 },
                ]).map((challenge) => (
                  <article key={challenge.title} className="rounded-[22px] border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{challenge.title}</p>
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{challenge.difficulty}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {challenge.duration_days} days - {challenge.reward_points} points
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(event) => onChange(Number(event.target.value))} type="number" step="0.01" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none" />
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
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none">
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
