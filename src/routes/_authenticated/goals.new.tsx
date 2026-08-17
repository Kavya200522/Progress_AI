import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, PenLine, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RoadmapEditor } from "@/components/RoadmapEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRefreshWorkspace, useWorkspace } from "@/hooks/useWorkspace";
import { createGoalWithRoadmap } from "@/lib/api";
import { addDays, todayISO } from "@/lib/progress";
import { generateRoadmapFn } from "@/lib/ai.functions";
import type { RoadmapDraft } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/goals/new")({
  head: () => ({
    meta: [
      { title: "Create a goal — ProgressAI" },
      { name: "description", content: "Define your goal, then build your own roadmap or generate an editable one with AI." },
      { property: "og:title", content: "Create a goal — ProgressAI" },
      { property: "og:description", content: "Define your goal, then build your own roadmap or generate one with AI." },
    ],
  }),
  component: NewGoal,
});

type Step = "details" | "choice" | "roadmap";

function NewGoal() {
  const navigate = useNavigate();
  const { userId } = useWorkspace();
  const refresh = useRefreshWorkspace();
  const generate = useServerFn(generateRoadmapFn);

  const [step, setStep] = useState<Step>("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [startDate, setStartDate] = useState(todayISO());
  const [targetDate, setTargetDate] = useState(addDays(todayISO(), 60));
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [level, setLevel] = useState("beginner");
  const [preference, setPreference] = useState("");
  const [extra, setExtra] = useState("");

  const [draft, setDraft] = useState<RoadmapDraft>({ milestones: [] });
  const [source, setSource] = useState<"manual" | "ai" | "demo">("manual");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const setDurationAndTarget = (days: number) => {
    setDuration(days);
    setTargetDate(addDays(startDate, days));
  };

  const detailsValid = title.trim().length > 1 && duration > 0 && targetDate > startDate;

  const runGeneration = async () => {
    setGenerating(true);
    try {
      const result = await generate({
        data: {
          title: title.trim(),
          description: description.trim(),
          level,
          durationDays: duration,
          dailyMinutes,
          preference: preference.trim(),
          extra: extra.trim(),
        },
      });
      setDraft(result.roadmap);
      setSource(result.source);
      setStep("roadmap");
      if (result.message) toast.info(result.message);
      else toast.success("Your roadmap is ready. Edit anything before you start.");
    } catch {
      toast.error("We couldn't generate a roadmap right now. You can still build one yourself.");
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!userId) return;
    const cleaned: RoadmapDraft = {
      milestones: draft.milestones
        .filter((m) => m.title.trim())
        .map((m) => ({
          ...m,
          title: m.title.trim(),
          tasks: m.tasks.filter((t) => t.title.trim()),
        })),
    };
    if (cleaned.milestones.length === 0) {
      toast.error("Add at least one milestone before starting your goal.");
      return;
    }
    setSaving(true);
    try {
      const goalId = await createGoalWithRoadmap(
        userId,
        {
          title: title.trim(),
          description: description.trim(),
          start_date: startDate,
          target_date: targetDate,
          duration_days: duration,
          daily_available_minutes: dailyMinutes,
          current_level: level,
        },
        cleaned,
      );
      await refresh();
      toast.success("Goal started. Time to make progress visible.");
      navigate({ to: "/goals/$goalId", params: { goalId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "We couldn't start that goal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">Create a goal</h1>
        <p className="mt-1 text-muted-foreground">
          Any goal, your own plan. Nothing here is predefined.
        </p>

        {step === "details" && (
          <Card className="shadow-card mt-6 gap-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">Goal name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Learn Machine Learning"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Learn ML fundamentals and build two projects."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="duration">Target duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDurationAndTarget(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="daily">Daily available time (minutes)</Label>
                <Input
                  id="daily"
                  type="number"
                  min={5}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Math.max(5, Number(e.target.value) || 5))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setTargetDate(addDays(e.target.value, duration));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="target">Target date</Label>
                <Input
                  id="target"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Current level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button disabled={!detailsValid} onClick={() => setStep("choice")}>
                Continue
              </Button>
            </div>
            {!detailsValid && (
              <p className="text-right text-xs text-muted-foreground">
                Add a goal name and make sure the target date is after the start date.
              </p>
            )}
          </Card>
        )}

        {step === "choice" && (
          <div className="mt-6 space-y-4">
            <h2 className="font-display text-xl font-semibold">
              Do you already know how you want to achieve this goal?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSource("manual");
                  setDraft({
                    milestones: [{ title: "", description: "", estimated_days: 7, tasks: [] }],
                  });
                  setStep("roadmap");
                }}
                className="shadow-card cursor-pointer p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <PenLine className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">I already have a plan</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your own milestones and tasks, in your own order.
                </p>
              </Card>
              <Card
                role="button"
                tabIndex={0}
                onClick={runGeneration}
                className="shadow-card border-primary/40 cursor-pointer p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">Help me create a plan with AI</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {generating
                    ? "Generating your roadmap…"
                    : "Get a personalized roadmap you can fully edit before starting."}
                </p>
              </Card>
            </div>

            <Card className="shadow-card gap-4 p-6">
              <p className="text-sm font-medium">Optional details for the AI</p>
              <div className="space-y-1.5">
                <Label htmlFor="pref">Learning preference</Label>
                <Input
                  id="pref"
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  placeholder="e.g. project-based, video courses, reading"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="extra">Additional information</Label>
                <Textarea
                  id="extra"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="Anything else the plan should account for"
                />
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <Button variant="ghost" onClick={() => setStep("details")}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={runGeneration} disabled={generating}>
                  <Sparkles className="h-4 w-4" />
                  {generating ? "Generating…" : "Generate my roadmap"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === "roadmap" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  {source === "manual" ? "Your roadmap" : "Your AI-generated roadmap"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Edit anything — this plan is yours, not the AI's.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {source === "demo" && <Badge variant="outline">Demo roadmap</Badge>}
                {source !== "manual" && (
                  <Button variant="outline" onClick={runGeneration} disabled={generating}>
                    <Sparkles className="h-4 w-4" />
                    {generating ? "Regenerating…" : "Regenerate"}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setStep("choice")}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </div>
            </div>

            <RoadmapEditor draft={draft} onChange={setDraft} />

            <div className="flex justify-end">
              <Button size="lg" onClick={save} disabled={saving}>
                {saving ? "Starting…" : "Start goal"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
