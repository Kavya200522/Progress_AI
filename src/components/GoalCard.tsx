import { Link } from "@tanstack/react-router";
import { Flame, CalendarDays, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "./ProgressBar";
import { computeStats, statusLabel } from "@/lib/progress";
import type { GoalBundle } from "@/lib/types";

const statusStyles: Record<string, string> = {
  ahead: "bg-success/15 text-success border-success/30",
  on_track: "bg-primary/10 text-primary border-primary/30",
  behind: "bg-warning/15 text-warning-foreground border-warning/40",
};

export function GoalCard({ bundle }: { bundle: GoalBundle }) {
  const s = computeStats(bundle.goal, bundle.milestones, bundle.tasks, bundle.logs);
  return (
    <Link to="/goals/$goalId" params={{ goalId: bundle.goal.id }} className="group block">
      <Card className="shadow-card h-full gap-4 p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lift">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold">{bundle.goal.title}</h3>
              {bundle.goal.is_demo && (
                <Badge variant="outline" className="text-[10px]">
                  Sample data
                </Badge>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {bundle.goal.description || "No description yet."}
            </p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-display text-2xl font-semibold">{s.percent}%</span>
            <span className="text-xs text-muted-foreground">
              Day {Math.min(s.daysElapsed + 1, s.daysTotal)} / {s.daysTotal}
            </span>
          </div>
          <ProgressBar value={s.percent} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className={statusStyles[s.status]}>
            {statusLabel[s.status]}
          </Badge>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-warning" />
            {s.currentStreak} day streak
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {s.daysRemaining} days left
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {s.lastActivity ? `Last activity ${s.lastActivity}` : "No activity logged yet"}
        </p>
      </Card>
    </Link>
  );
}
