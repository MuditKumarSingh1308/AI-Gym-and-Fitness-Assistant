"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  ChefHat,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  MessageSquareMore,
  MoonStar,
  Shield,
  Sparkles,
  SunMedium,
  MapPinned,
} from "lucide-react";

import { clearStoredAuth, getStoredUser } from "@/lib/api";
import { ThemeProvider, useTheme } from "@/components/providers/theme-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/diet", label: "Diet", icon: ChefHat },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/chatbot", label: "Chatbot", icon: MessageSquareMore },
  { href: "/habit-tracker", label: "Habits", icon: Activity },
  { href: "/gym-recommendation", label: "Gyms", icon: MapPinned },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppShellInner>{children}</AppShellInner>
    </ThemeProvider>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const user = useSyncExternalStore(
    () => () => {},
    () => getStoredUser(),
    () => null,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-border bg-card/95 px-4 py-4 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 lg:block">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">AI Gym</p>
                <p className="text-lg font-semibold">Fitness Assistant</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-3 text-sm font-medium"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearStoredAuth();
                  router.push("/login");
                }}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-3 text-sm font-medium"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 hidden rounded-2xl border border-border bg-background p-4 lg:block">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium">{user?.full_name ?? "Fitness member"}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? "Connected to the AI Gym backend"}</p>
            </div>
          </div>

          <nav className="mt-5 hidden gap-2 lg:flex lg:flex-col">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 hidden rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground lg:block">
            <p className="font-medium text-foreground">Ready for daily use</p>
            <p className="mt-2 leading-6">
              JWT auth, FastAPI integration, Plotly charts, habit analytics, and admin controls are wired for production.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-muted-foreground">AI Gym & Fitness Assistant</p>
                  <p className="truncate text-lg font-semibold">{pathname?.replace("/", "") || "dashboard"}</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                  {theme === "dark" ? "Light" : "Dark"} mode
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearStoredAuth();
                    router.push("/login");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                      active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
