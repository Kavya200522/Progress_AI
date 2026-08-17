import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveDailyLog } from "@/lib/api";
import { todayISO } from "@/lib/progress";
import type { GoalBundle } from "@/lib/types";
import { cn } from "@/lib/utils";

const DIFFICULTY = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "difficult", label: "Difficult" },
];
const MOOD = [
  { value: "low", label: "Low" },
  { value: "okay", label: "Okay" },
  { value: "good", label: "Good" },
  { value: "very_good", label: "Very good" },
];

function Choice({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            value === o.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DailyLogDialog({
  bundle,
  userId,
  onSaved,
  trigger,
}: {
  bundle: GoalBundle;
  userId: string;
  onSaved: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [minutes, setMinutes] = useState<string>(String(bundle.goal.daily_available_minutes));
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const openTasks = bundle.tasks.filter((t) => t.status !== "completed");

  const submit = async () => {
    const mins = Number(minutes);
    if (!date) {
      toast.error("Please pick a date.");
      return;
    }
    if (!Number.isFinite(mins) || mins < 0 || mins > 1440) {
      toast.error("Enter the time you spent in minutes (0-1440).");
      return;
    }
    setSaving(true);
    try {
      await saveDailyLog(userId, {
        goalId: bundle.goal.id,
        date,
        timeSpentMinutes: Math.round(mins),
        difficulty,
        mood,
        notes: notes.trim() || null,
        completedTaskIds: selected,
      });
      toast.success("Progress saved. Nice work today.");
      setOpen(false);
      setSelected([]);
      setNotes("");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "We couldn't save your progress.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Update today's progress</Button>}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update today's progress</DialogTitle>
          <DialogDescription>Takes less than a minute. Only the time is required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="log-date">Date</Label>
              <Input
                id="log-date"
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-min">Time spent (minutes)</Label>
              <Input
                id="log-min"
                type="number"
                min={0}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>What did you work on?</Label>
            {openTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Every task is complete. Add more tasks to keep going.
              </p>
            ) : (
              <ScrollArea className="h-44 rounded-lg border border-border p-3">
                <ul className="space-y-2">
                  {openTasks.map((t) => (
                    <li key={t.id} className="flex items-start gap-3 text-sm">
                      <Checkbox
                        checked={selected.includes(t.id)}
                        onCheckedChange={(v) =>
                          setSelected((prev) =>
                            v === true ? [...prev, t.id] : prev.filter((id) => id !== t.id),
                          )
                        }
                        className="mt-0.5"
                      />
                      <span>{t.title}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>

          <div className="space-y-2">
            <Label>How difficult was today's work?</Label>
            <Choice options={DIFFICULTY} value={difficulty} onChange={setDifficulty} />
          </div>
          <div className="space-y-2">
            <Label>How are you feeling about your progress?</Label>
            <Choice options={MOOD} value={mood} onChange={setMood} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="log-notes">Notes (optional)</Label>
            <Textarea
              id="log-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth remembering about today"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Save progress"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
