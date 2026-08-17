import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RoadmapDraft, RoadmapDraftMilestone } from "@/lib/types";

/**
 * Fully editable roadmap draft (used for both manual plans and AI output).
 * The parent owns the draft state so it can be saved or regenerated.
 */
export function RoadmapEditor({
  draft,
  onChange,
}: {
  draft: RoadmapDraft;
  onChange: (next: RoadmapDraft) => void;
}) {
  const [newTask, setNewTask] = useState<Record<number, string>>({});

  const update = (milestones: RoadmapDraftMilestone[]) => onChange({ milestones });

  const patchMilestone = (i: number, patch: Partial<RoadmapDraftMilestone>) =>
    update(draft.milestones.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...draft.milestones];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    update(next);
  };

  return (
    <div className="space-y-3">
      {draft.milestones.map((m, i) => (
        <Card key={i} className="shadow-card gap-3 p-4">
          <div className="flex items-start gap-2">
            <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <div className="flex-1 space-y-2">
              <Input
                value={m.title}
                placeholder="Milestone title"
                onChange={(e) => patchMilestone(i, { title: e.target.value })}
              />
              <Textarea
                value={m.description}
                placeholder="Why this milestone comes here (optional)"
                className="min-h-16"
                onChange={(e) => patchMilestone(i, { description: e.target.value })}
              />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Estimated days</span>
                <Input
                  type="number"
                  min={1}
                  className="w-24"
                  value={m.estimated_days}
                  onChange={(e) =>
                    patchMilestone(i, { estimated_days: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up">
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down">
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete milestone"
                onClick={() => update(draft.milestones.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <ul className="space-y-2 border-t border-border pt-3">
            {m.tasks.map((t, j) => (
              <li key={j} className="flex items-center gap-2">
                <Input
                  value={t.title}
                  onChange={(e) =>
                    patchMilestone(i, {
                      tasks: m.tasks.map((task, idx) =>
                        idx === j ? { ...task, title: e.target.value } : task,
                      ),
                    })
                  }
                />
                <Input
                  type="number"
                  min={5}
                  className="w-20"
                  value={t.estimated_minutes}
                  onChange={(e) =>
                    patchMilestone(i, {
                      tasks: m.tasks.map((task, idx) =>
                        idx === j
                          ? { ...task, estimated_minutes: Math.max(5, Number(e.target.value) || 5) }
                          : task,
                      ),
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete task"
                  onClick={() =>
                    patchMilestone(i, { tasks: m.tasks.filter((_, idx) => idx !== j) })
                  }
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <Input
                placeholder="Add a task…"
                value={newTask[i] ?? ""}
                onChange={(e) => setNewTask({ ...newTask, [i]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const title = (newTask[i] ?? "").trim();
                  if (!title) return;
                  patchMilestone(i, {
                    tasks: [...m.tasks, { title, estimated_minutes: 30 }],
                  });
                  setNewTask({ ...newTask, [i]: "" });
                }}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  const title = (newTask[i] ?? "").trim();
                  if (!title) return;
                  patchMilestone(i, { tasks: [...m.tasks, { title, estimated_minutes: 30 }] });
                  setNewTask({ ...newTask, [i]: "" });
                }}
              >
                Add
              </Button>
            </li>
          </ul>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={() =>
          update([
            ...draft.milestones,
            { title: "", description: "", estimated_days: 7, tasks: [] },
          ])
        }
      >
        <Plus className="h-4 w-4" />
        Add milestone
      </Button>
    </div>
  );
}
