/** Shared domain types for ProgressAI. Mirrors the database schema. */

export type Level = "beginner" | "intermediate" | "advanced";
export type EntityStatus = "pending" | "in_progress" | "completed";

export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  theme: string;
  daily_reminder: boolean;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  target_date: string;
  duration_days: number;
  daily_available_minutes: number;
  current_level: string;
  status: string;
  is_demo: boolean;
  created_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description: string | null;
  order_index: number;
  estimated_days: number;
  status: string;
  created_at: string;
}

export interface Task {
  id: string;
  milestone_id: string;
  user_id: string;
  title: string;
  description: string | null;
  estimated_minutes: number;
  order_index: number;
  status: string;
  completed_at: string | null;
  created_at: string;
}

export interface DailyProgress {
  id: string;
  goal_id: string;
  user_id: string;
  date: string;
  time_spent_minutes: number;
  difficulty: string | null;
  mood: string | null;
  notes: string | null;
  created_at: string;
}

/** A goal with its full roadmap and activity history loaded. */
export interface GoalBundle {
  goal: Goal;
  milestones: Milestone[];
  tasks: Task[];
  logs: DailyProgress[];
}

/** Shape returned by AI roadmap generation (validated before use). */
export interface RoadmapDraftTask {
  title: string;
  estimated_minutes: number;
}

export interface RoadmapDraftMilestone {
  title: string;
  description: string;
  estimated_days: number;
  tasks: RoadmapDraftTask[];
}

export interface RoadmapDraft {
  milestones: RoadmapDraftMilestone[];
}
