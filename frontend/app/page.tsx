import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Dumbbell, MessageSquareMore, Shield, Sparkles, Target } from "lucide-react";

import heroImage from "../src/assets/hero.png";

const highlights = [
  { title: "Workout trainer", copy: "MediaPipe, OpenCV, rep counting, form correction, and pose overlays." },
  { title: "Diet planner", copy: "BMI, BMR, calories, macros, Indian meal plans, and grocery lists." },
  { title: "Habit engine", copy: "Workout streaks, skip prediction, motivation, and progress analytics." },
  { title: "Chat coach", copy: "LLM-powered conversations with memory, sentiment, and check-ins." },
];

const modules = ["Workout", "Diet", "Analytics", "Chatbot", "Habit Tracker", "Gym Recommendation", "Admin"];

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border bg-slate-950 text-white">
        <Image src={heroImage} alt="AI Gym illustration" fill priority className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.88))]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-1px)] max-w-7xl flex-col justify-between gap-10 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-300 ring-1 ring-white/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-200/70">AI Gym & Fitness Assistant</p>
                <p className="text-lg font-semibold">Next.js Frontend</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                Login
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                Register
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-200/80">
                <Target className="h-3.5 w-3.5" />
                Production-ready fitness platform
              </p>
              <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
                Train smarter with one unified AI fitness workspace.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Workout coaching, diet planning, habit intelligence, gym recommendations, and admin analytics live in one responsive Next.js interface.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/workout" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                  Explore workout trainer
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Pose detection", "MediaPipe + OpenCV"],
                  ["LLM coach", "Chat memory and sentiment"],
                  ["Diet engine", "Macros and meals"],
                  ["Admin insights", "Plotly dashboards"],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="font-medium">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-sky-950/40 backdrop-blur">
              <Image
                  src={heroImage}
                  alt="AI Gym preview"
                  width={900}
                  height={700}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  loading="eager"
                  className="h-[360px] w-full rounded-[24px] object-cover object-center"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-[26px] border border-white/10 bg-slate-950/70 p-4">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-5 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Shield className="h-4 w-4 text-emerald-300" />
              JWT auth
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <BarChart3 className="h-4 w-4 text-sky-300" />
              Plotly analytics
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Dumbbell className="h-4 w-4 text-amber-300" />
              AI workout trainer
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <MessageSquareMore className="h-4 w-4 text-fuchsia-300" />
              AI gym buddy
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Modules</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Everything the platform needs, surfaced in one UI.</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-[24px] border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {modules.map((module) => (
            <span key={module} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              {module}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
