import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Flame, CheckCircle2, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { HowFarSection } from "@/components/HowFarSection";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import {
  ExpectedVsActualChart,
  WeeklyActivityChart,
  CumulativeTimeChart,
  MilestoneProgressList,
} from "@/components/charts/ProgressCharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { computeStats, daysBetween, formatMinutes, todayISO } from "@/lib/progress";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress — ProgressAI" },
      { name: "description", content: "Charts, streaks and consistency across every goal you're tracking." },
      { property: "og:title", content: "Progress — ProgressAI" },
      { property: "og:description", content: "Charts, streaks and consistency across every goal you're tracking." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { data, isLoading } = useWorkspace();
  const bundles = data?.bundles ?? [];
  const allLogs = bundles.flatMap((b) => b.logs);

  const totals = bundles.reduce(
    (acc, b) => {
      const s = computeStats(b.goal, b.milestones, b.tasks, b.logs);
      acc.minutes += s.totalMinutes;
      acc.tasks += s.completedTasks;
      acc.streak = Math.max(acc.streak, s.currentStreak);
      acc.active = Math.max(acc.active, s.activeDays);
      return acc;
    },
    { minutes: 0, tasks: 0, streak: 0, active: 0 },
  );

  const primary = bundles.find((b) => b.goal.status === "active") ?? bundles[0];

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">Progress</h1>
      <p className="mt-1 text-muted-foreground">Look how far you've come across every goal.</p>

      {isLoading ? (
        <Skeleton className="mt-8 h-72 w-full" />
      ) : bundles.length === 0 ? (
        <Card className="shadow-card mt-8 p-10 text-center">
          <h2 className="font-display text-xl font-semibold">No progress to show yet.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a goal and log your first day — your charts will build themselves from there.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/goals/new">Create a goal</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total time invested" value={formatMinutes(totals.minutes)} icon={<Clock className="h-4 w-4" />} />
            <StatCard label="Tasks completed" value={totals.tasks} icon={<CheckCircle2 className="h-4 w-4" />} />
            <StatCard label="Best current streak" value={`${totals.streak} days`} icon={<Flame className="h-4 w-4" />} />
            <StatCard label="Most active days" value={totals.active} icon={<CalendarDays className="h-4 w-4" />} />
          </div>

          {primary && (
            <>
              <div className="mt-8">
                <HowFarSection
                  stats={computeStats(primary.goal, primary.milestones, primary.tasks, primary.logs)}
                  startedDaysAgo={Math.max(0, daysBetween(primary.goal.start_date, todayISO()))}
                />
              </div>

              <h2 className="font-display mt-10 mb-4 text-lg font-semibold">
                {primary.goal.title}
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <ExpectedVsActualChart bundle={primary} />
                <WeeklyActivityChart bundle={primary} />
                <CumulativeTimeChart bundle={primary} />
                <MilestoneProgressList bundle={primary} />
              </div>
            </>
          )}

          <h2 className="font-display mt-10 mb-4 text-lg font-semibold">Consistency across all goals</h2>
          <ActivityHeatmap logs={allLogs} />
        </>
      )}
    </AppShell>
  );
}
