import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "./ProgressBar";
import { isMilestoneComplete, milestonePercent, formatMinutes } from "@/lib/progress";
import type { Milestone, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MilestoneTimeline({
  milestones,
  tasks,
  onToggleTask,
}: {
  milestones: Milestone[];
  tasks: Task[];
  onToggleTask: (task: Task, completed: boolean) => void;
}) {
  const [open, setOpen] = useState<string | null>(milestones[0]?.id ?? null);

  if (milestones.length === 0) {
    return (
      <Card className="shadow-card p-6 text-sm text-muted-foreground">
        This goal has no milestones yet. Add some from the roadmap editor to start tracking.
      </Card>
    );
  }

  return (
    <div className="relative">
      <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Start
      </p>
      <ol className="relative space-y-3 border-l border-border pl-6">
        {milestones.map((m) => {
          const done = isMilestoneComplete(m, tasks);
          const pct = milestonePercent(m, tasks);
          const own = tasks.filter((t) => t.milestone_id === m.id);
          const expanded = open === m.id;
          return (
            <li key={m.id} className="relative">
              <span
                className={cn(
                  "absolute top-5 -left-[31px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-background",
                  done ? "border-primary bg-primary" : "border-border",
                )}
              />
              <Card className="shadow-card gap-3 p-4">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setOpen(expanded ? null : m.id)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h4 className="truncate font-semibold">{m.title}</h4>
                    </div>
                    {m.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-medium">{pct}%</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        expanded && "rotate-180",
                      )}
                    />
                  </div>
                </button>
                <ProgressBar value={pct} size="sm" />
                {expanded && (
                  <ul className="mt-1 space-y-2">
                    {own.length === 0 && (
                      <li className="text-sm text-muted-foreground">No tasks in this milestone.</li>
                    )}
                    {own.map((t) => (
                      <li key={t.id} className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={t.status === "completed"}
                          onCheckedChange={(v) => onToggleTask(t, v === true)}
                          className="mt-0.5"
                        />
                        <span className="flex-1">
                          <span
                            className={cn(
                              t.status === "completed" && "text-muted-foreground line-through",
                            )}
                          >
                            {t.title}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {formatMinutes(t.estimated_minutes)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Target
      </p>
    </div>
  );
}
