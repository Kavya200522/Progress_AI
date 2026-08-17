import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { milestonePercent, progressSeries, weeklyActivity } from "@/lib/progress";
import type { GoalBundle } from "@/lib/types";

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

export function ExpectedVsActualChart({ bundle }: { bundle: GoalBundle }) {
  const data = progressSeries(bundle).filter((_, i, arr) => arr.length < 90 || i % 2 === 0);
  return (
    <Card className="shadow-card p-5">
      <h3 className="text-sm font-semibold">Expected vs actual progress</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Your real completion curve against the pace your plan implies.
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" {...axisProps} />
            <YAxis domain={[0, 100]} unit="%" {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Day ${l}`} />
            <Line
              type="monotone"
              dataKey="expected"
              name="Expected"
              stroke="var(--chart-2)"
              strokeDasharray="5 4"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function WeeklyActivityChart({ bundle }: { bundle: GoalBundle }) {
  const data = weeklyActivity(bundle);
  return (
    <Card className="shadow-card p-5">
      <h3 className="text-sm font-semibold">Weekly effort</h3>
      <p className="mb-4 text-xs text-muted-foreground">Minutes logged each week of this goal.</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="minutes" name="Minutes" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function MilestoneProgressList({ bundle }: { bundle: GoalBundle }) {
  return (
    <Card className="shadow-card p-5">
      <h3 className="text-sm font-semibold">Milestone progress</h3>
      <p className="mb-4 text-xs text-muted-foreground">How complete each part of your plan is.</p>
      <ul className="space-y-3">
        {bundle.milestones.map((m) => {
          const pct = milestonePercent(m, bundle.tasks);
          return (
            <li key={m.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="truncate pr-3">{m.title}</span>
                <span className="text-muted-foreground">{pct}%</span>
              </div>
              <ProgressBar value={pct} size="sm" />
            </li>
          );
        })}
        {bundle.milestones.length === 0 && (
          <li className="text-sm text-muted-foreground">No milestones yet.</li>
        )}
      </ul>
    </Card>
  );
}

export function CumulativeTimeChart({ bundle }: { bundle: GoalBundle }) {
  let running = 0;
  const data = [...bundle.logs]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((l) => {
      running += l.time_spent_minutes;
      return { date: l.date.slice(5), hours: Math.round((running / 60) * 10) / 10 };
    });
  return (
    <Card className="shadow-card p-5">
      <h3 className="text-sm font-semibold">Effort invested over time</h3>
      <p className="mb-4 text-xs text-muted-foreground">Cumulative hours you have put in.</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" {...axisProps} minTickGap={24} />
            <YAxis unit="h" {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="hours"
              name="Hours"
              stroke="var(--chart-3)"
              fill="var(--chart-3)"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
