"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Flame, RefreshCw, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { PlotlyChart } from "@/components/plotly-chart";
import { fetchDashboardOverview, getStoredToken } from "@/lib/api";
import type { DashboardOverview } from "@/lib/api";

export default function Page() {
  const [data, setData] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    fetchDashboardOverview(getStoredToken()).then(setData);
  }, []);

  const caloriesTrace = useMemo(
    () => ({
      x: data?.series?.labels ?? [],
      y: data?.series?.calories_burned ?? [],
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#38bdf8", width: 3 },
    }),
    [data],
  );

  const habitTrace = useMemo(
    () => ({
      x: data?.series?.labels ?? [],
      y: data?.series?.habit_completion ?? [],
      type: "bar",
      marker: { color: "#22c55e" },
    }),
    [data],
  );

  const formTrace = useMemo(
    () => ({
      x: data?.series?.labels ?? [],
      y: data?.series?.form_score ?? [],
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#8b5cf6", width: 3 },
    }),
    [data],
  );

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Analytics"
          title="Interactive progress analytics"
          description="Plotly charts for workout load, form quality, and habit completion, backed by the same data that powers the admin view."
          actions={
            <button
              type="button"
              onClick={() => fetchDashboardOverview(getStoredToken()).then(setData)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Performance" value={data ? `${Math.round(data.overview.performance_score)}` : "89"} icon={TrendingUp} hint="Composite score for workout, nutrition, and habit quality." />
          <StatCard title="Calories" value={data ? `${Math.round(data.overview.workout.calories_burned ?? 0)}` : "168,400"} icon={Flame} hint="Weekly calorie burn trend across logged activity." />
          <StatCard title="Workout sessions" value={data ? `${Math.round(data.overview.workout.sessions ?? 0)}` : "2,480"} icon={BarChart3} hint="Aggregate training session count." />
          <StatCard title="Form score" value={data ? `${Math.round(data.overview.workout.form_score ?? 91)}%` : "91%"} icon={TrendingUp} hint="Average pose quality across analyzed frames." />
        </section>

        <SectionCard title="Charts" description="Three views for product and operations review.">
          <div className="grid gap-4 xl:grid-cols-3">
            <ChartPanel title="Calories burned" data={[caloriesTrace]} />
            <ChartPanel title="Habit completion" data={[habitTrace]} />
            <ChartPanel title="Form score" data={[formTrace]} />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

function ChartPanel({ title, data }: { title: string; data: Array<Record<string, unknown>> }) {
  return (
    <div className="rounded-[24px] border border-border bg-background p-3">
      <p className="px-2 pt-1 text-sm font-medium">{title}</p>
      <div className="h-72">
        <PlotlyChart
          data={data}
          layout={{
            margin: { l: 30, r: 18, t: 18, b: 28 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "inherit" },
            showlegend: false,
          }}
        />
      </div>
    </div>
  );
}
