import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Sparkles, Flame, Clock, CheckCircle2, Target } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GoalCard } from "@/components/GoalCard";
import { StatCard } from "@/components/StatCard";
import { DailyLogDialog } from "@/components/DailyLogDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { greeting, useAuth } from "@/hooks/useAuth";
import { useRefreshWorkspace, useWorkspace } from "@/hooks/useWorkspace";
import { createDemoGoal } from "@/lib/api";
import { computeStats, formatMinutes, todayISO } from "@/lib/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ProgressAI" },
      { name: "description", content: "See every active goal, your streaks and how far you've come today." },
      { property: "og:title", content: "Dashboard — ProgressAI" },
      { property: "og:description", content: "See every active goal, your streaks and how far you've come." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { displayName } = useAuth();
  const { data, isLoading, userId } = useWorkspace();
  const refresh = useRefreshWorkspace();
  const [seeding, setSeeding] = useState(false);

  const bundles = data?.bundles ?? [];
  const active = bundles.filter((b) => b.goal.status === "active");
  const today = todayISO();

  const totals = bundles.reduce(
    (acc, b) => {
      const s = computeStats(b.goal, b.milestones, b.tasks, b.logs);
      acc.minutes += s.totalMinutes;
      acc.tasks += s.completedTasks;
      acc.streak = Math.max(acc.streak, s.currentStreak);
      return acc;
    },
    { minutes: 0, tasks: 0, streak: 0 },
  );

  const seedDemo = async () => {
    if (!userId) return;
    setSeeding(true);
    try {
      await createDemoGoal(userId);
      await refresh();
      toast.success("Sample goal added so you can explore the dashboard.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "We couldn't add the sample goal.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {greeting()}, {displayName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {active.length > 0
              ? "Here's how far you've come so far."
              : "Your progress journey starts here."}
          </p>
        </div>
        <Button asChild>
          <Link to="/goals/new">
            <Plus className="h-4 w-4" /> Create new goal
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      ) : bundles.length === 0 ? (
        <Card className="shadow-card bg-hero-gradient mt-8 items-center p-10 text-center">
          <Target className="mx-auto h-10 w-10 text-primary" />
          <h2 className="font-display mt-4 text-xl font-semibold">
            You haven't started a goal yet.
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Create a goal, build or generate a roadmap, and start turning your daily effort into
            visible progress.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/goals/new">Create your first goal</Link>
            </Button>
            <Button variant="outline" onClick={seedDemo} disabled={seeding}>
              <Sparkles className="h-4 w-4" />
              {seeding ? "Adding…" : "Load sample data"}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Best current streak"
              value={`${totals.streak} days`}
              icon={<Flame className="h-4 w-4" />}
            />
            <StatCard
              label="Total effort"
              value={formatMinutes(totals.minutes)}
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              label="Tasks completed"
              value={totals.tasks}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
          </div>

          <h2 className="font-display mt-10 mb-4 text-lg font-semibold">Active goals</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {active.map((b) => (
              <GoalCard key={b.goal.id} bundle={b} />
            ))}
          </div>

          {active.length > 0 && userId && (
            <Card className="shadow-card mt-6 flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold">
                  {active[0]!.logs.some((l) => l.date === today)
                    ? "Today's progress is logged. Add more any time."
                    : "You haven't logged today's progress yet."}
                </p>
                <p className="text-sm text-muted-foreground">
                  A daily update takes less than a minute — {active[0]!.goal.title}.
                </p>
              </div>
              <DailyLogDialog bundle={active[0]!} userId={userId} onSaved={refresh} />
            </Card>
          )}

          {bundles.filter((b) => b.goal.status !== "active").length > 0 && (
            <>
              <h2 className="font-display mt-10 mb-4 text-lg font-semibold">Other goals</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {bundles
                  .filter((b) => b.goal.status !== "active")
                  .map((b) => (
                    <GoalCard key={b.goal.id} bundle={b} />
                  ))}
              </div>
            </>
          )}
        </>
      )}
    </AppShell>
  );
}
