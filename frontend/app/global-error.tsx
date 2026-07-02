"use client";

import Link from "next/link";

export default function GlobalError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-xl rounded-[28px] border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Application error</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The app encountered an unexpected error while rendering this page.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Open dashboard
        </Link>
      </section>
    </main>
  );
}
