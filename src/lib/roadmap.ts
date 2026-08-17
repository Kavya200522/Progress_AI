import { z } from "zod";
import type { RoadmapDraft } from "./types";

export const roadmapSchema = z.object({
  milestones: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().max(600).default(""),
        estimated_days: z.number().int().min(1).max(365),
        tasks: z
          .array(
            z.object({
              title: z.string().min(1).max(200),
              estimated_minutes: z.number().int().min(5).max(600),
            }),
          )
          .min(1)
          .max(15),
      }),
    )
    .min(1)
    .max(12),
});

/** Deterministic demo roadmap used when the AI service is unavailable. */
export function mockRoadmap(goalTitle: string, durationDays: number): RoadmapDraft {
  const chunk = Math.max(3, Math.round(durationDays / 5));
  const phases = [
    ["Foundations", "Build the base knowledge and set up your working environment."],
    ["Core practice", "Work through the essential skills with daily hands-on reps."],
    ["Applied work", "Apply what you know to a small, realistic piece of work."],
    ["Depth & gaps", "Close weak spots and go deeper on the hardest parts."],
    ["Final project", "Ship one complete result that proves the goal is reached."],
  ];
  return {
    milestones: phases.map(([title, description], i) => ({
      title: `${title}`,
      description: `${description} (${goalTitle})`,
      estimated_days: chunk,
      tasks: [
        { title: `Plan week ${i + 1} of ${title.toLowerCase()}`, estimated_minutes: 30 },
        { title: `Study the key concepts for ${title.toLowerCase()}`, estimated_minutes: 60 },
        { title: `Practice exercises for ${title.toLowerCase()}`, estimated_minutes: 60 },
        { title: `Review and take notes on ${title.toLowerCase()}`, estimated_minutes: 30 },
      ],
    })),
  };
}
