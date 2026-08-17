import { supabase } from "@/integrations/supabase/client";
import type {
  DailyProgress,
  Goal,
  GoalBundle,
  Milestone,
  Profile,
  RoadmapDraft,
  Task,
} from "./types";
import { addDays, todayISO } from "./progress";

/** Turns any backend error into a friendly message. */
export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error && typeof error === "object" && "message" in error) {
    const raw = String((error as { message: unknown }).message);
    if (/duplicate key/i.test(raw)) return "That entry already exists.";
    if (/network|fetch/i.test(raw)) return "Network problem. Check your connection and retry.";
    if (/row-level security/i.test(raw)) return "You don't have access to that item.";
  }
  return fallback;
}

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as T;
}

export interface Workspace {
  goals: Goal[];
  bundles: GoalBundle[];
}

/** Loads every goal for the signed-in user together with roadmap + activity. */
export async function fetchWorkspace(userId: string): Promise<Workspace> {
  const goals = await unwrap<Goal[]>(
    supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  );
  if (goals.length === 0) return { goals: [], bundles: [] };

  const goalIds = goals.map((g) => g.id);
  const [milestones, logs] = await Promise.all([
    unwrap<Milestone[]>(
      supabase.from("milestones").select("*").in("goal_id", goalIds).order("order_index"),
    ),
    unwrap<DailyProgress[]>(
      supabase.from("daily_progress").select("*").in("goal_id", goalIds).order("date"),
    ),
  ]);
  const milestoneIds = milestones.map((m) => m.id);
  const tasks = milestoneIds.length
    ? await unwrap<Task[]>(
        supabase.from("tasks").select("*").in("milestone_id", milestoneIds).order("order_index"),
      )
    : [];

  const bundles: GoalBundle[] = goals.map((goal) => {
    const gm = milestones.filter((m) => m.goal_id === goal.id);
    const ids = new Set(gm.map((m) => m.id));
    return {
      goal,
      milestones: gm,
      tasks: tasks.filter((t) => ids.has(t.milestone_id)),
      logs: logs.filter((l) => l.goal_id === goal.id),
    };
  });

  return { goals, bundles };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(friendlyError(error));
  return (data as Profile | null) ?? null;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw new Error(friendlyError(error));
}

export interface NewGoalInput {
  title: string;
  description: string;
  start_date: string;
  target_date: string;
  duration_days: number;
  daily_available_minutes: number;
  current_level: string;
}

/** Creates a goal plus its roadmap in one flow. */
export async function createGoalWithRoadmap(
  userId: string,
  input: NewGoalInput,
  roadmap: RoadmapDraft,
  isDemo = false,
): Promise<string> {
  const { data: goal, error } = await supabase
    .from("goals")
    .insert({ ...input, user_id: userId, is_demo: isDemo })
    .select()
    .single();
  if (error || !goal) throw new Error(friendlyError(error, "We couldn't create that goal."));

  const goalId = (goal as Goal).id;
  if (roadmap.milestones.length > 0) {
    const { data: created, error: mErr } = await supabase
      .from("milestones")
      .insert(
        roadmap.milestones.map((m, i) => ({
          goal_id: goalId,
          user_id: userId,
          title: m.title,
          description: m.description,
          estimated_days: m.estimated_days,
          order_index: i,
        })),
      )
      .select();
    if (mErr) throw new Error(friendlyError(mErr, "We couldn't save your milestones."));

    const rows = (created as Milestone[]).flatMap((milestone, i) =>
      (roadmap.milestones[i]?.tasks ?? []).map((t, j) => ({
        milestone_id: milestone.id,
        user_id: userId,
        title: t.title,
        estimated_minutes: t.estimated_minutes,
        order_index: j,
      })),
    );
    if (rows.length) {
      const { error: tErr } = await supabase.from("tasks").insert(rows);
      if (tErr) throw new Error(friendlyError(tErr, "We couldn't save your tasks."));
    }
  }
  return goalId;
}

export async function updateGoal(goalId: string, patch: Partial<Goal>) {
  const { error } = await supabase.from("goals").update(patch).eq("id", goalId);
  if (error) throw new Error(friendlyError(error));
}

export async function deleteGoal(goalId: string) {
  const { error } = await supabase.from("goals").delete().eq("id", goalId);
  if (error) throw new Error(friendlyError(error));
}

export async function addMilestone(
  userId: string,
  goalId: string,
  title: string,
  orderIndex: number,
) {
  const { error } = await supabase
    .from("milestones")
    .insert({ user_id: userId, goal_id: goalId, title, order_index: orderIndex });
  if (error) throw new Error(friendlyError(error));
}

export async function updateMilestone(id: string, patch: Partial<Milestone>) {
  const { error } = await supabase.from("milestones").update(patch).eq("id", id);
  if (error) throw new Error(friendlyError(error));
}

export async function deleteMilestone(id: string) {
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error));
}

export async function reorderMilestones(ordered: { id: string; order_index: number }[]) {
  for (const row of ordered) {
    const { error } = await supabase
      .from("milestones")
      .update({ order_index: row.order_index })
      .eq("id", row.id);
    if (error) throw new Error(friendlyError(error));
  }
}

export async function addTask(
  userId: string,
  milestoneId: string,
  title: string,
  estimatedMinutes: number,
  orderIndex: number,
) {
  const { error } = await supabase.from("tasks").insert({
    user_id: userId,
    milestone_id: milestoneId,
    title,
    estimated_minutes: estimatedMinutes,
    order_index: orderIndex,
  });
  if (error) throw new Error(friendlyError(error));
}

export async function updateTask(id: string, patch: Partial<Task>) {
  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) throw new Error(friendlyError(error));
}

export async function setTaskCompleted(id: string, completed: boolean) {
  await updateTask(id, {
    status: completed ? "completed" : "pending",
    completed_at: completed ? new Date().toISOString() : null,
  });
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error));
}

export interface DailyLogInput {
  goalId: string;
  date: string;
  timeSpentMinutes: number;
  difficulty: string | null;
  mood: string | null;
  notes: string | null;
  completedTaskIds: string[];
}

/** Saves (or updates) a daily log and marks the selected tasks complete. */
export async function saveDailyLog(userId: string, input: DailyLogInput) {
  const { data, error } = await supabase
    .from("daily_progress")
    .upsert(
      {
        user_id: userId,
        goal_id: input.goalId,
        date: input.date,
        time_spent_minutes: input.timeSpentMinutes,
        difficulty: input.difficulty,
        mood: input.mood,
        notes: input.notes,
      },
      { onConflict: "goal_id,date" },
    )
    .select()
    .single();
  if (error || !data) throw new Error(friendlyError(error, "We couldn't save today's progress."));

  const logId = (data as DailyProgress).id;
  if (input.completedTaskIds.length) {
    const { error: linkErr } = await supabase.from("daily_task_completion").upsert(
      input.completedTaskIds.map((taskId) => ({
        daily_progress_id: logId,
        task_id: taskId,
        user_id: userId,
        completed: true,
      })),
      { onConflict: "daily_progress_id,task_id" },
    );
    if (linkErr) throw new Error(friendlyError(linkErr));

    const { error: taskErr } = await supabase
      .from("tasks")
      .update({ status: "completed", completed_at: new Date(`${input.date}T12:00:00Z`).toISOString() })
      .in("id", input.completedTaskIds);
    if (taskErr) throw new Error(friendlyError(taskErr));
  }
}

/** Creates the clearly-labelled sample goal used to demo the dashboard. */
export async function createDemoGoal(userId: string): Promise<string> {
  const start = addDays(todayISO(), -37);
  const roadmap: RoadmapDraft = {
    milestones: [
      {
        title: "Python Fundamentals",
        description: "Get comfortable writing clean Python before touching ML libraries.",
        estimated_days: 10,
        tasks: [
          { title: "Python data types", estimated_minutes: 60 },
          { title: "Functions and modules", estimated_minutes: 60 },
          { title: "Loops and comprehensions", estimated_minutes: 45 },
          { title: "OOP basics", estimated_minutes: 60 },
          { title: "Practice problems", estimated_minutes: 90 },
        ],
      },
      {
        title: "NumPy & Pandas",
        description: "Learn the data handling tools every ML workflow depends on.",
        estimated_days: 8,
        tasks: [
          { title: "NumPy arrays and broadcasting", estimated_minutes: 60 },
          { title: "Pandas DataFrames", estimated_minutes: 60 },
          { title: "Cleaning a messy dataset", estimated_minutes: 90 },
          { title: "Grouping and aggregation", estimated_minutes: 45 },
        ],
      },
      {
        title: "Data Visualization",
        description: "Learn to see the data before modelling it.",
        estimated_days: 7,
        tasks: [
          { title: "Matplotlib basics", estimated_minutes: 45 },
          { title: "Seaborn distributions", estimated_minutes: 45 },
          { title: "Exploratory analysis project", estimated_minutes: 90 },
        ],
      },
      {
        title: "ML Fundamentals",
        description: "Understand the core ideas: train/test, bias, evaluation.",
        estimated_days: 12,
        tasks: [
          { title: "Supervised vs unsupervised", estimated_minutes: 45 },
          { title: "Train/test split and overfitting", estimated_minutes: 60 },
          { title: "Evaluation metrics", estimated_minutes: 60 },
          { title: "First scikit-learn model", estimated_minutes: 90 },
        ],
      },
      {
        title: "ML Algorithms",
        description: "Work through the main families of algorithms hands-on.",
        estimated_days: 13,
        tasks: [
          { title: "Linear and logistic regression", estimated_minutes: 60 },
          { title: "Decision trees and forests", estimated_minutes: 60 },
          { title: "Clustering", estimated_minutes: 60 },
          { title: "Model tuning", estimated_minutes: 90 },
        ],
      },
      {
        title: "Final Project",
        description: "Prove the goal with one end-to-end project.",
        estimated_days: 10,
        tasks: [
          { title: "Pick a dataset and question", estimated_minutes: 45 },
          { title: "Build the pipeline", estimated_minutes: 120 },
          { title: "Evaluate and iterate", estimated_minutes: 90 },
          { title: "Write up the results", estimated_minutes: 60 },
        ],
      },
    ],
  };

  const goalId = await createGoalWithRoadmap(
    userId,
    {
      title: "Learn Machine Learning (Sample)",
      description: "Learn ML fundamentals and build two projects.",
      start_date: start,
      target_date: addDays(start, 60),
      duration_days: 60,
      daily_available_minutes: 60,
      current_level: "beginner",
    },
    roadmap,
    true,
  );

  // Mark roughly the first two thirds of the roadmap as done, spread over time.
  const milestones = await unwrap<Milestone[]>(
    supabase.from("milestones").select("*").eq("goal_id", goalId).order("order_index"),
  );
  const tasks = await unwrap<Task[]>(
    supabase
      .from("tasks")
      .select("*")
      .in("milestone_id", milestones.map((m) => m.id))
      .order("order_index"),
  );
  const doneCount = Math.round(tasks.length * 0.66);
  const done = tasks.slice(0, doneCount);
  for (let i = 0; i < done.length; i++) {
    const day = Math.min(36, Math.floor((i / Math.max(1, done.length)) * 36));
    await supabase
      .from("tasks")
      .update({ status: "completed", completed_at: `${addDays(start, day)}T12:00:00Z` })
      .eq("id", done[i]!.id);
  }

  const logs: Record<string, unknown>[] = [];
  for (let day = 0; day <= 37; day++) {
    if (day % 6 === 5) continue; // a couple of rest days
    logs.push({
      user_id: userId,
      goal_id: goalId,
      date: addDays(start, day),
      time_spent_minutes: 35 + ((day * 17) % 55),
      difficulty: ["easy", "moderate", "difficult"][day % 3],
      mood: ["okay", "good", "very_good"][day % 3],
      notes: null,
    });
  }
  const { error: logErr } = await supabase
    .from("daily_progress")
    .upsert(logs, { onConflict: "goal_id,date" });
  if (logErr) throw new Error(friendlyError(logErr));

  return goalId;
}
