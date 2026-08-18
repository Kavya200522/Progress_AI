import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Flame, Clock, CheckCircle2, CalendarDays, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { ProgressBar } from "@/components/ProgressBar";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { HowFarSection } from "@/components/HowFarSection";
import { InsightsPanel } from "@/components/InsightsPanel";
import { DailyLogDialog } from "@/components/DailyLogDialog";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import {
  ExpectedVsActualChart,
  WeeklyActivityChart,
  MilestoneProgressList,
  CumulativeTimeChart,
} from "@/components/charts/ProgressCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshWorkspace, useWorkspace } from "@/hooks/useWorkspace";
import { deleteGoal, setTaskCompleted } from "@/lib/api";
import { computeStats, daysBetween, formatMinutes, statusLabel, todayISO } from "@/lib/progress";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/goals/$goalId")({
  head: () => ({
    meta: [
      { title: "Goal progress — ProgressAI" },
      { name: "description", content: "Milestones, charts, streaks and daily logs for a single goal." },
      { property: "og:title", content: "Goal progress — ProgressAI" },
      { property: "og:description", content: "Milestones, charts, streaks and daily logs for a single goal." },
    ],
  }),
  component: GoalDetail,
});

function GoalDetail() {
  const { goalId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, userId } = useWorkspace();
  const refresh = useRefreshWorkspace();

  const bundle = data?.bundles.find((b) => b.goal.id === goalId);

  if (isLoading) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </AppShell>
    );
  }

  if (!bundle) {
    return (
      <AppShell>
        <Card className="shadow-card p-10 text-center">
          <h1 className="font-display text-xl font-semibold">We couldn't find that goal.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been deleted, or the link is out of date.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/goals">Back to my goals</Link>
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const stats = computeStats(bundle.goal, bundle.milestones, bundle.tasks, bundle.logs);
  const startedDaysAgo = Math.max(0, daysBetween(bundle.goal.start_date, todayISO()));

  const toggleTask = async (task: Task, completed: boolean) => {
    try {
      await setTaskCompleted(task.id, completed);
      await refresh();
    } catch {
      toast.error("We couldn't update that task.");
    }
  };

  const removeGoal = async () => {
    try {
      await deleteGoal(bundle.goal.id);
      await refresh();
      toast.success("Goal deleted.");
      navigate({ to: "/goals" });
    } catch {
      toast.error("We couldn't delete that goal.");
    }
  };

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/goals">
          <ArrowLeft className="h-4 w-4" /> All goals
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-semibold">{bundle.goal.title}</h1>
            <Badge variant="outline">{statusLabel[stats.status]}</Badge>
          </div>
          {bundle.goal.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">{bundle.goal.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {userId && <DailyLogDialog bundle={bundle} userId={userId} onSaved={refresh} />}
          <Button variant="ghost" size="icon" onClick={removeGoal} aria-label="Delete goal">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="shadow-card mt-6 gap-3 p-6">
        <div className="flex items-end justify-between">
          <p className="text-sm font-medium text-muted-foreground">Overall progress</p>
          <p className="font-display text-3xl font-semibold text-primary">{stats.percent}%</p>
        </div>
        <ProgressBar value={stats.percent} />
        <p className="text-sm text-muted-foreground">
          {stats.completedTasks} of {stats.totalTasks} tasks done · {stats.daysRemaining} days
          remaining
        </p>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current streak" value={`${stats.currentStreak} days`} icon={<Flame className="h-4 w-4" />} />
        <StatCard label="Longest streak" value={`${stats.longestStreak} days`} icon={<Flame className="h-4 w-4" />} />
        <StatCard label="Total time invested" value={formatMinutes(stats.totalMinutes)} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Days active" value={stats.activeDays} icon={<CalendarDays className="h-4 w-4" />} />
      </div>

      <div className="mt-8">
        <HowFarSection stats={stats} startedDaysAgo={startedDaysAgo} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ExpectedVsActualChart bundle={bundle} />
        <WeeklyActivityChart bundle={bundle} />
        <CumulativeTimeChart bundle={bundle} />
        <MilestoneProgressList bundle={bundle} />
      </div>

      <h2 className="font-display mt-10 mb-4 text-lg font-semibold">Consistency</h2>
      <ActivityHeatmap logs={bundle.logs} />

      <h2 className="font-display mt-10 mb-4 text-lg font-semibold">
        <CheckCircle2 className="mr-2 inline h-5 w-5 text-primary" />
        Roadmap
      </h2>
      <MilestoneTimeline
        milestones={bundle.milestones}
        tasks={bundle.tasks}
        onToggleTask={toggleTask}
      />

      <h2 className="font-display mt-10 mb-4 text-lg font-semibold">AI insights</h2>
      <InsightsPanel bundle={bundle} />
    </AppShell>
  );
}
