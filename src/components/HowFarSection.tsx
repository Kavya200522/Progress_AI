import { Card } from "@/components/ui/card";
import { Flame, Clock, CheckCircle2, Trophy, CalendarCheck, TrendingUp } from "lucide-react";
import { formatMinutes, type GoalStats } from "@/lib/progress";

export function HowFarSection({ stats, startedDaysAgo }: { stats: GoalStats; startedDaysAgo: number }) {
  const items = [
    { icon: CalendarCheck, label: "Days worked", value: `${stats.activeDays}` },
    { icon: Clock, label: "Time invested", value: formatMinutes(stats.totalMinutes) },
    { icon: CheckCircle2, label: "Tasks completed", value: `${stats.completedTasks}` },
    { icon: Trophy, label: "Milestones completed", value: `${stats.completedMilestones}` },
    { icon: Flame, label: "Current streak", value: `${stats.currentStreak} days` },
    { icon: TrendingUp, label: "Longest streak", value: `${stats.longestStreak} days` },
  ];

  return (
    <Card className="shadow-card bg-hero-gradient border-primary/20 p-6">
      <h3 className="font-display text-xl font-semibold">Look how far you've come</h3>
      <p className="mt-2 max-w-2xl text-sm text-foreground/80">
        You started this goal {startedDaysAgo} {startedDaysAgo === 1 ? "day" : "days"} ago. You've
        invested {formatMinutes(stats.totalMinutes)}, completed {stats.completedTasks}{" "}
        {stats.completedTasks === 1 ? "task" : "tasks"}, and shown up on {stats.activeDays} different{" "}
        {stats.activeDays === 1 ? "day" : "days"} — that's {stats.percent}% of your goal done.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border/60 bg-card/70 p-3">
            <Icon className="h-4 w-4 text-primary" />
            <p className="font-display mt-2 text-lg font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
