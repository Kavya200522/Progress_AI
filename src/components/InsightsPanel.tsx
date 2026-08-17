import { Sparkles, Brain, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeStats, daysBetween, formatMinutes, todayISO } from "@/lib/progress";
import type { GoalBundle } from "@/lib/types";

/**
 * Insights are derived only from stored user data — nothing is invented.
 * Returns an empty list when there isn't enough history to say anything real.
 */
export function deriveInsights(bundle: GoalBundle): string[] {
  const s = computeStats(bundle.goal, bundle.milestones, bundle.tasks, bundle.logs);
  const out: string[] = [];
  if (bundle.logs.length < 3) return out;

  out.push(
    `You've completed ${s.percent}% of your roadmap in ${s.daysElapsed} ${s.daysElapsed === 1 ? "day" : "days"}.`,
  );

  if (s.percent > s.expectedPercent + 4) {
    out.push(
      `Your current pace is ahead of your original plan (${s.percent}% done vs ${s.expectedPercent}% expected).`,
    );
  } else if (s.percent < s.expectedPercent - 4) {
    out.push(
      `You're behind your original plan (${s.percent}% done vs ${s.expectedPercent}% expected by now).`,
    );
  } else {
    out.push("Your pace closely matches your original plan.");
  }

  const recent = bundle.logs.filter((l) => daysBetween(l.date, todayISO()) <= 7);
  const previous = bundle.logs.filter((l) => {
    const d = daysBetween(l.date, todayISO());
    return d > 7 && d <= 14;
  });
  if (previous.length >= 2) {
    const recentMin = recent.reduce((a, l) => a + l.time_spent_minutes, 0);
    const prevMin = previous.reduce((a, l) => a + l.time_spent_minutes, 0);
    if (recentMin < prevMin * 0.7) {
      out.push("Your activity has decreased compared with the week before.");
    } else if (recentMin > prevMin * 1.3) {
      out.push("You've put in noticeably more time this week than last week.");
    }
  }

  if (s.activeDays > 0) {
    out.push(
      `You've logged ${formatMinutes(s.totalMinutes)} across ${s.activeDays} active days — an average of ${formatMinutes(
        Math.round(s.totalMinutes / s.activeDays),
      )} per active day.`,
    );
  }
  if (s.longestStreak >= 3) {
    out.push(`Your longest run of consecutive days on this goal is ${s.longestStreak} days.`);
  }
  return out;
}

export function InsightsPanel({ bundle }: { bundle: GoalBundle }) {
  const insights = deriveInsights(bundle);
  const s = computeStats(bundle.goal, bundle.milestones, bundle.tasks, bundle.logs);

  return (
    <div className="space-y-4">
      <Card className="shadow-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Insights</h3>
        </div>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keep logging your progress. AI insights will become available as we learn your activity
            pattern.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {insights.map((i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="shadow-card p-5">
        <div className="mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Goal completion prediction</h3>
          <Badge variant="outline" className="text-[10px]">
            Coming soon
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {bundle.logs.length < 14
            ? "Not enough data yet. Prediction will become available after enough progress data has been collected."
            : "Prediction will become available once the forecasting model is connected. We never show an estimate we can't back with data."}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Signals already being collected: active days ({s.activeDays}), tasks completed (
          {s.completedTasks}), average daily time, current streak ({s.currentStreak}), progress (
          {s.percent}%), days remaining ({s.daysRemaining}).
        </p>
      </Card>

      <Card className="shadow-card p-5">
        <div className="mb-2 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI re-plan</h3>
          <Badge variant="outline" className="text-[10px]">
            Coming soon
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {s.status === "behind"
            ? `You are currently about ${s.daysBehind} ${s.daysBehind === 1 ? "day" : "days"} behind your original roadmap.`
            : "You're keeping up with your roadmap. Re-planning is here if that changes."}
        </p>
        <Button variant="outline" className="mt-3" disabled>
          <Sparkles className="h-4 w-4" />
          Create revised plan
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Revised plans will use your remaining milestones, remaining days, recent activity and daily
          available time.
        </p>
      </Card>
    </div>
  );
}
