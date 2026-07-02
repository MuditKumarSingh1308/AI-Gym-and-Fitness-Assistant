"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Dumbbell, LockKeyhole, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";

import { setStoredAuth } from "@/lib/api";

export const dynamic = "force-dynamic";

function buildDemoSession(email: string, fullName = "Fitness Member") {
  return {
    tokens: {
      access_token: `demo-access-${email}`,
      refresh_token: `demo-refresh-${email}`,
      token_type: "bearer",
    },
    user: {
      id: `demo-${email}`,
      email,
      full_name: fullName,
      role: "user",
    },
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@aigym.local");
  const [password, setPassword] = useState("demo12345");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const session = buildDemoSession(email.trim(), "Demo User");
      setStoredAuth(session.tokens, session.user);
      router.push("/dashboard");
    } catch {
      setError("Unable to start the demo session.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.98))]" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-300 ring-1 ring-white/10">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-200/70">AI Gym & Fitness Assistant</p>
                  <p className="text-lg font-semibold">Login</p>
                </div>
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                Register
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="max-w-2xl py-14 lg:py-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-200/80">
                <LockKeyhole className="h-3.5 w-3.5" />
                Demo authentication
              </p>
              <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
                Step into the fitness workspace.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Use a demo login to unlock the dashboard, workout tracker, diet planner, analytics, and AI gym buddy without any backend auth setup.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  ["Fast access", "Session data is saved locally and routed to the dashboard immediately."],
                  ["Shared design", "Matches the dark, polished interface used across the app."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="font-medium text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-5 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Dumbbell className="h-4 w-4 text-sky-300" />
                Workout access
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Mail className="h-4 w-4 text-emerald-300" />
                Email login
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <form onSubmit={handleSubmit} className="w-full rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-sky-950/40 backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-200/75">Welcome back</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Sign in</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">No backend credentials required for the demo flow.</p>
                </div>
                <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-200">
                  Demo mode
                </span>
              </div>

              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                    placeholder="demo@aigym.local"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                    placeholder="••••••••"
                  />
                </label>
              </div>

              {error ? (
                <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Open dashboard"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-5 text-center text-sm text-slate-300">
                New here?{" "}
                <Link href="/register" className="font-medium text-sky-300 underline decoration-sky-300/30 underline-offset-4 hover:text-sky-200">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
