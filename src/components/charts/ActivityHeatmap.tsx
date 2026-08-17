import { Card } from "@/components/ui/card";
import { addDays, todayISO } from "@/lib/progress";
import type { DailyProgress } from "@/lib/types";

/** GitHub-style activity grid for the last ~18 weeks. */
export function ActivityHeatmap({ logs, weeks = 18 }: { logs: DailyProgress[]; weeks?: number }) {
  const byDate = new Map(logs.map((l) => [l.date, l.time_spent_minutes]));
  const today = todayISO();
  const todayDow = new Date(`${today}T00:00:00Z`).getUTCDay();
  const start = addDays(today, -(weeks * 7 - 1 + todayDow));

  const columns: { date: string; minutes: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: { date: string; minutes: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      col.push({ date, minutes: date <= today ? (byDate.get(date) ?? 0) : -1 });
    }
    columns.push(col);
  }

  const level = (m: number) => {
    if (m < 0) return "bg-transparent";
    if (m === 0) return "bg-muted";
    if (m < 30) return "bg-primary/25";
    if (m < 60) return "bg-primary/50";
    if (m < 90) return "bg-primary/75";
    return "bg-primary";
  };

  return (
    <Card className="shadow-card p-5">
      <h3 className="text-sm font-semibold">Activity heatmap</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Every square is a day. Darker means more time invested.
      </p>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {columns.map((col, i) => (
            <div key={i} className="flex flex-col gap-1">
              {col.map((cell) => (
                <span
                  key={cell.date}
                  title={cell.minutes >= 0 ? `${cell.date}: ${cell.minutes} min` : cell.date}
                  className={`h-3 w-3 rounded-[3px] ${level(cell.minutes)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        Less
        <span className="h-3 w-3 rounded-[3px] bg-muted" />
        <span className="h-3 w-3 rounded-[3px] bg-primary/25" />
        <span className="h-3 w-3 rounded-[3px] bg-primary/50" />
        <span className="h-3 w-3 rounded-[3px] bg-primary/75" />
        <span className="h-3 w-3 rounded-[3px] bg-primary" />
        More
      </div>
    </Card>
  );
}
