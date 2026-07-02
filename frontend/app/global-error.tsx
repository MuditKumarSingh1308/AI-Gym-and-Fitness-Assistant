"use client";

export const dynamic = "force-dynamic";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <main className="mx-auto max-w-xl rounded-[28px] border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Application error</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The app encountered an unexpected error while rendering this page.
          </p>
          <p className="mt-4 rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm text-muted-foreground">
            {error.message}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
