import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";

export const Route = createFileRoute("/_authenticated/goals/")({
  head: () => ({
    meta: [
      { title: "My Goals — ProgressAI" },
      { name: "description", content: "Every goal you're working on, with completion, streaks and status at a glance." },
      { property: "og:title", content: "My Goals — ProgressAI" },
      { property: "og:description", content: "Every goal you're working on, with completion and status at a glance." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { data, isLoading } = useWorkspace();
  const bundles = data?.bundles ?? [];

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">My goals</h1>
          <p className="mt-1 text-muted-foreground">Everything you're working towards.</p>
        </div>
        <Button asChild>
          <Link to="/goals/new">
            <Plus className="h-4 w-4" /> Create new goal
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      ) : bundles.length === 0 ? (
        <Card className="shadow-card mt-8 p-10 text-center">
          <h2 className="font-display text-xl font-semibold">Your progress journey starts here.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first goal and choose your own plan — or let AI draft one you can edit.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/goals/new">Create your first goal</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {bundles.map((b) => (
            <GoalCard key={b.goal.id} bundle={b} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
