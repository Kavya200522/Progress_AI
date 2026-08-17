import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Target,
  Activity,
  TrendingUp,
  Sparkles,
  Flame,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ProgressBar } from "@/components/ProgressBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProgressAI — Turn effort into visible progress" },
      {
        name: "description",
        content:
          "ProgressAI turns your small daily efforts into visible, measurable progress. Set any goal, build or generate a roadmap, and see how far you've come.",
      },
      { property: "og:title", content: "ProgressAI — Turn effort into visible progress" },
      {
        property: "og:description",
        content:
          "Set any goal. Track your daily effort. See how far you've come — with roadmaps, streaks, charts and AI insights.",
      },
    ],
  }),
  component: Landing,
});

function DashboardPreview() {
  return (
    <Card className="shadow-lift w-full max-w-md gap-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Learn Machine Learning</p>
          <p className="text-xs text-muted-foreground">Day 37 / 60</p>
        </div>
        <span className="rounded-full border border-success/30 bg-success/15 px-2 py-1 text-[11px] font-medium text-success">
          Ahead of schedule
        </span>
      </div>
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-display text-3xl font-semibold">68%</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-warning" /> 8 day streak
          </span>
        </div>
        <ProgressBar value={68} size="lg" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["32h 45m", "invested"],
          ["41", "tasks done"],
          ["29", "active days"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-lg bg-muted/60 p-2">
            <p className="font-display text-sm font-semibold">{v}</p>
            <p className="text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="h-6 flex-1 rounded-sm"
            style={{
              backgroundColor: "var(--primary)",
              opacity: [0.15, 0.35, 0.6, 0.85, 1][(i * 7) % 5],
            }}
          />
        ))}
      </div>
    </Card>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Start your goal
            </Link>
          </Button>
        </div>
      </header>

      <section className="bg-hero-gradient border-y border-border/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/70 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Personal progress visualization
            </span>
            <h1 className="font-display mt-5 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
              Turn effort into <span className="text-gradient-primary">visible progress</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-foreground/80">
              Set any goal. Track your daily effort. See how far you've come.
            </p>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground">
              Motivation fades when progress is invisible. ProgressAI converts your small daily
              efforts into a picture you can actually see.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start your goal <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <DashboardPreview />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="font-display text-center text-3xl font-semibold">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Three simple steps. No categories to pick from, no plan forced on you.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: "1. Create your goal",
              body: "Any goal at all, with your own duration, daily time budget and starting level.",
            },
            {
              icon: Activity,
              title: "2. Track your effort",
              body: "One quick daily update: what you worked on, how long, how it felt. Under a minute.",
            },
            {
              icon: TrendingUp,
              title: "3. See your progress",
              body: "Milestone timeline, streaks, heatmap and charts that show how far you've come.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="shadow-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> AI roadmap generation
            </span>
            <h2 className="font-display mt-3 text-3xl font-semibold">
              Don't know how to break your goal into milestones?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Let AI create a personalized roadmap that you can edit. Milestones, tasks, suggested
              order and time estimates — all fully editable before you start. You are never locked
              into the AI's plan.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Generate my roadmap
              </Link>
            </Button>
          </div>
          <Card className="shadow-card p-5">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Your AI-generated roadmap
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["Python Fundamentals", "Days 1-10"],
                ["NumPy & Pandas", "Days 11-18"],
                ["Data Visualization", "Days 19-25"],
                ["ML Fundamentals", "Days 26-37"],
              ].map(([title, days]) => (
                <li key={title} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="flex-1 font-medium">{title}</span>
                  <span className="text-xs text-muted-foreground">{days}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <Logo />
        <p>Turn effort into visible progress.</p>
        <p>© {new Date().getFullYear()} ProgressAI</p>
      </footer>
    </div>
  );
}
