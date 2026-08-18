import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { InsightsPanel } from "@/components/InsightsPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights — ProgressAI" },
      { name: "description", content: "Pattern-based observations on your pace, consistency and best working days." },
      { property: "og:title", content: "Insights — ProgressAI" },
      { property: "og:description", content: "Observations on your pace, consistency and best working days." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { data, isLoading } = useWorkspace();
  const bundles = data?.bundles ?? [];

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">Insights</h1>
      <p className="mt-1 text-muted-foreground">
        What your own data says about how you make progress.
      </p>

      {isLoading ? (
        <Skeleton className="mt-8 h-64 w-full" />
      ) : bundles.length === 0 ? (
        <Card className="shadow-card mt-8 p-10 text-center">
          <h2 className="font-display text-xl font-semibold">No insights yet.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Log a few days of progress and patterns will start showing up here.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/goals/new">Create a goal</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {bundles.map((b) => (
            <section key={b.goal.id}>
              <h2 className="font-display mb-3 text-lg font-semibold">{b.goal.title}</h2>
              <InsightsPanel bundle={b} />
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
