import { mockRoadmap, roadmapSchema } from "./roadmap";
import type { RoadmapDraft } from "./types";

export interface RoadmapRequest {
  title: string;
  description?: string;
  level: string;
  durationDays: number;
  dailyMinutes: number;
  preference?: string;
  extra?: string;
}

export interface RoadmapResult {
  roadmap: RoadmapDraft;
  source: "ai" | "demo";
  message?: string;
}

const SYSTEM_PROMPT = `You are a planning coach. Break a user's goal into a realistic, ordered roadmap.
Rules:
- Respect the total duration: the sum of estimated_days must be close to the target duration.
- Respect the user's daily available minutes: tasks in a milestone should fit that budget.
- Between 3 and 8 milestones, each with 3-6 concrete tasks.
- Each milestone gets a one or two sentence description explaining why it comes at that point.
Return ONLY JSON matching: {"milestones":[{"title":string,"description":string,"estimated_days":number,"tasks":[{"title":string,"estimated_minutes":number}]}]}`;

/** Calls the AI gateway; falls back to a clearly-labelled demo roadmap on failure. */
export async function generateRoadmap(req: RoadmapRequest): Promise<RoadmapResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const fallback = (message: string): RoadmapResult => ({
    roadmap: mockRoadmap(req.title, req.durationDays),
    source: "demo",
    message,
  });

  if (!apiKey) return fallback("AI is not configured, so this is a demo roadmap you can edit.");

  const userPrompt = [
    `Goal: ${req.title}`,
    req.description ? `Description: ${req.description}` : "",
    `Current level: ${req.level}`,
    `Available time per day: ${req.dailyMinutes} minutes`,
    `Target duration: ${req.durationDays} days`,
    req.preference ? `Learning preference: ${req.preference}` : "",
    req.extra ? `Additional information: ${req.extra}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return fallback("The AI service is busy right now. Here is an editable starter roadmap.");
      }
      if (response.status === 402 || response.status === 403) {
        return fallback("AI credits are unavailable. Here is an editable starter roadmap.");
      }
      return fallback("The AI service could not respond. Here is an editable starter roadmap.");
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return fallback("The AI response was empty. Here is an editable starter roadmap.");

    const parsed = roadmapSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      return fallback("The AI plan was not in a usable format. Here is an editable starter roadmap.");
    }
    return { roadmap: parsed.data, source: "ai" };
  } catch {
    return fallback("We could not reach the AI service. Here is an editable starter roadmap.");
  }
}
