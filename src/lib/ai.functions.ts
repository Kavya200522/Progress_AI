import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateRoadmap } from "./ai-roadmap.server";

const inputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  level: z.string().default("beginner"),
  durationDays: z.number().int().min(1).max(365),
  dailyMinutes: z.number().int().min(5).max(600),
  preference: z.string().optional().default(""),
  extra: z.string().optional().default(""),
});

export const generateRoadmapFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => generateRoadmap(data));
