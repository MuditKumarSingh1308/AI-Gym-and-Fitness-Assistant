"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Activity, ArrowRight, Dumbbell, Flame, Loader2, RefreshCw, Target } from "lucide-react";

export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { PlotlyChart } from "@/components/plotly-chart";
import { fetchDashboardOverview, getStoredToken } from "@/lib/api";
import type { DashboardOverview } from "@/lib/api";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export default function Page() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      fetchDashboardOverview(getStoredToken()).then(setData);
    });
  }, []);

  const caloriesTrace = useMemo(
    () => ({
      x: data?.series?.labels ?? [],
      y: data?.series?.calories_burned ?? [],
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#0ea5e9", width: 3 },
      fill: "tozeroy",
      fillcolor: "rgba(14,165,233,0.15)",
    }),
    [data],
  );

  const formTrace = useMemo(
    () => ({
      x: data?.series?.labels ?? [],
      y: data?.series?.form_score ?? [],
      type: "bar",
      marker: { color: "#8b5cf6" },
    }),
    [data],
  );

  const habitTrace = useMemo(
    () => ({
      x: data?.series?.labels ?? [],
      y: data?.series?.habit_completion ?? [],
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#22c55e", width: 3 },
    }),
    [data],
  );

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Dashboard"
          title="Your fitness command center"
          description="Monitor workout momentum, diet progress, and habit consistency from one responsive view."
          actions={
            <>
              <button
                type="button"
                onClick={() => fetchDashboardOverview(getStoredToken()).then(setData)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </button>
              <a href="/analytics" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Open analytics
                <ArrowRight className="h-4 w-4" />
              </a>
            </>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Performance Score" value={data ? `${Math.round(data.overview.performance_score)}` : "89"} icon={Target} hint="A single health signal combining workout, habit, and nutrition activity." />
          <StatCard title="Workout Sessions" value={data ? formatNumber(data.overview.workout.sessions ?? 0) : "2,480"} icon={Dumbbell} hint="Tracked training sessions across webcam and logged workouts." />
          <StatCard title="Calories Burned" value={data ? formatNumber(data.overview.workout.calories_burned ?? 0) : "168,400"} icon={Flame} hint="Aggregated calorie expenditure from active users." />
          <StatCard title="Habit Completion" value={data ? `${Math.round((data.overview.habits.completion_rate ?? 0) * 100)}%` : "84%"} icon={Activity} hint="Consistency across workout, water, sleep, and nutrition habits." />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <SectionCard title="Weekly progress" description="Workout energy, form quality, and habit completion over the last week.">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="h-72 rounded-[24px] border border-border p-2">
                <PlotlyChart
                  data={[caloriesTrace]}
                  layout={{
                    margin: { l: 30, r: 16, t: 20, b: 30 },
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    font: { color: "inherit" },
                    showlegend: false,
                  }}
                />
              </div>
              <div className="h-72 rounded-[24px] border border-border p-2">
                <PlotlyChart
                  data={[formTrace]}
                  layout={{
                    margin: { l: 30, r: 16, t: 20, b: 30 },
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    font: { color: "inherit" },
                    showlegend: false,
                  }}
                />
              </div>
              <div className="h-72 rounded-[24px] border border-border p-2">
                <PlotlyChart
                  data={[habitTrace]}
                  layout={{
                    margin: { l: 30, r: 16, t: 20, b: 30 },
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    font: { color: "inherit" },
                    showlegend: false,
                  }}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Backend-ready signals" description="The frontend consumes the same data structures that power the admin dashboard and analytics API.">
            <div className="grid gap-3">
              {[
                ["Workout", `Sessions: ${data?.overview?.workout?.sessions ?? 2480}`, `Form score: ${Math.round(data?.overview?.workout?.form_score ?? 91)}%`],
                ["Nutrition", `Plans: ${data?.overview?.nutrition?.diet_plans ?? 980}`, `Protein logs: ${data?.overview?.nutrition?.protein_logs ?? 4310}`],
                ["Habits", `Streak: ${data?.overview?.habits?.current_streak ?? 18}`, `Completion: ${Math.round((data?.overview?.habits?.completion_rate ?? 0.84) * 100)}%`],
              ].map(([title, primary, secondary]) => (
                <div key={title as string} className="rounded-[22px] border border-border bg-background p-4">
                  <p className="font-semibold">{title as string}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{primary as string}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{secondary as string}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
