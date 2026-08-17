import type { DailyProgress, Goal, GoalBundle, Milestone, Task } from "./types";

export interface GoalStats {
  totalMilestones: number;
  completedMilestones: number;
  totalTasks: number;
  completedTasks: number;
  /** Completion driven by tasks (falls back to milestones when no tasks exist). */
  percent: number;
  daysElapsed: number;
  daysTotal: number;
  daysRemaining: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  expectedPercent: number;
  status: "ahead" | "on_track" | "behind";
  daysBehind: number;
  lastActivity: string | null;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000);
}

export function addDays(iso: string, n: number): string {
  const d = parseDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function streaks(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const sorted = [...new Set(dates)].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1]!, sorted[i]!) === 1) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }
  // Current streak counts back from today (or yesterday if today isn't logged yet).
  const today = todayISO();
  const last = sorted[sorted.length - 1]!;
  const gap = daysBetween(last, today);
  if (gap > 1) return { current: 0, longest };
  let current = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    if (daysBetween(sorted[i - 1]!, sorted[i]!) === 1) current += 1;
    else break;
  }
  return { current, longest };
}

export function computeStats(
  goal: Goal,
  milestones: Milestone[],
  tasks: Task[],
  logs: DailyProgress[],
): GoalStats {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => isMilestoneComplete(m, tasks)).length;

  const percent =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

  const daysTotal = Math.max(1, daysBetween(goal.start_date, goal.target_date));
  const rawElapsed = daysBetween(goal.start_date, todayISO());
  const daysElapsed = Math.min(Math.max(rawElapsed, 0), daysTotal);
  const daysRemaining = Math.max(daysTotal - rawElapsed, 0);

  const expectedPercent = Math.min(100, Math.round((daysElapsed / daysTotal) * 100));
  const diff = percent - expectedPercent;
  const status = diff >= 5 ? "ahead" : diff <= -5 ? "behind" : "on_track";
  const daysBehind = diff < 0 ? Math.round((Math.abs(diff) / 100) * daysTotal) : 0;

  const { current, longest } = streaks(logs.map((l) => l.date));
  const totalMinutes = logs.reduce((sum, l) => sum + (l.time_spent_minutes || 0), 0);
  const lastActivity = logs.length
    ? [...logs].sort((a, b) => (a.date < b.date ? 1 : -1))[0]!.date
    : null;

  return {
    totalMilestones,
    completedMilestones,
    totalTasks,
    completedTasks,
    percent,
    daysElapsed,
    daysTotal,
    daysRemaining,
    activeDays: new Set(logs.map((l) => l.date)).size,
    currentStreak: current,
    longestStreak: longest,
    totalMinutes,
    expectedPercent,
    status,
    daysBehind,
    lastActivity,
  };
}

export function isMilestoneComplete(milestone: Milestone, tasks: Task[]): boolean {
  const own = tasks.filter((t) => t.milestone_id === milestone.id);
  if (own.length === 0) return milestone.status === "completed";
  return own.every((t) => t.status === "completed");
}

export function milestonePercent(milestone: Milestone, tasks: Task[]): number {
  const own = tasks.filter((t) => t.milestone_id === milestone.id);
  if (own.length === 0) return milestone.status === "completed" ? 100 : 0;
  return Math.round((own.filter((t) => t.status === "completed").length / own.length) * 100);
}

/** Expected vs actual progress series for the line chart. */
export function progressSeries(bundle: GoalBundle) {
  const { goal, tasks, logs } = bundle;
  const daysTotal = Math.max(1, daysBetween(goal.start_date, goal.target_date));
  const today = todayISO();
  const elapsed = Math.min(Math.max(daysBetween(goal.start_date, today), 0), daysTotal);

  // Actual progress is reconstructed from when tasks were completed.
  const completions = tasks
    .filter((t) => t.status === "completed" && t.completed_at)
    .map((t) => t.completed_at!.slice(0, 10))
    .sort();

  const logDates = new Set(logs.map((l) => l.date));
  const points: { day: number; date: string; expected: number; actual: number | null }[] = [];
  for (let day = 0; day <= daysTotal; day++) {
    const date = addDays(goal.start_date, day);
    const expected = Math.round((day / daysTotal) * 100);
    let actual: number | null = null;
    if (day <= elapsed && tasks.length > 0) {
      const done = completions.filter((c) => c <= date).length;
      actual = Math.round((done / tasks.length) * 100);
    }
    points.push({ day, date, expected, actual });
    void logDates;
  }
  return points;
}

/** Weekly totals of minutes logged. */
export function weeklyActivity(bundle: GoalBundle) {
  const { goal, logs } = bundle;
  const weeks = new Map<number, number>();
  for (const log of logs) {
    const week = Math.floor(Math.max(daysBetween(goal.start_date, log.date), 0) / 7);
    weeks.set(week, (weeks.get(week) ?? 0) + log.time_spent_minutes);
  }
  const maxWeek = Math.max(0, ...weeks.keys());
  return Array.from({ length: maxWeek + 1 }, (_, i) => ({
    week: `W${i + 1}`,
    minutes: weeks.get(i) ?? 0,
  }));
}

export const statusLabel: Record<GoalStats["status"], string> = {
  ahead: "Ahead of schedule",
  on_track: "On track",
  behind: "Behind schedule",
};
