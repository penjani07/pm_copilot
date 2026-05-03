import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { MeetingAnalysis } from "./types";

const participantSchema = z.object({
  name: z.string(),
  role: z.string().nullable(),
  signals: z.array(z.string()),
});

const agendaSectionSchema = z.object({
  referenceId: z.string(),
  title: z.string(),
  summary: z.string(),
  actionItemReferenceIds: z.array(z.string()),
});

const actionItemSchema = z.object({
  referenceId: z.string(),
  title: z.string(),
  ownerName: z.string(),
  ownerEmail: z.string().nullable(),
  priority: z.enum(["High", "Medium", "Low"]),
  summary: z.string(),
  rationale: z.string(),
  suggestedTimeline: z.string(),
  suggestedDueDate: z.string().nullable(),
  confidence: z.enum(["High", "Medium", "Low"]),
  blockers: z.array(z.string()),
  jiraSummary: z.string(),
  jiraDescription: z.string(),
});

const storyDraftSchema = z.object({
  referenceId: z.string(),
  title: z.string(),
  ownerName: z.string(),
  ownerEmail: z.string().nullable(),
  priority: z.enum(["High", "Medium", "Low"]),
  summary: z.string(),
  rationale: z.string(),
  suggestedTimeline: z.string(),
  suggestedDueDate: z.string().nullable(),
  confidence: z.enum(["High", "Medium", "Low"]),
  blockers: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  jiraSummary: z.string(),
  jiraDescription: z.string(),
});

const epicDraftSchema = z.object({
  referenceId: z.string(),
  title: z.string(),
  ownerName: z.string(),
  ownerEmail: z.string().nullable(),
  priority: z.enum(["High", "Medium", "Low"]),
  objective: z.string(),
  businessValue: z.string(),
  suggestedTimeline: z.string(),
  suggestedDueDate: z.string().nullable(),
  confidence: z.enum(["High", "Medium", "Low"]),
  successMetrics: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  jiraSummary: z.string(),
  jiraDescription: z.string(),
  stories: z.array(storyDraftSchema),
});

const followUpMeetingAttendeeSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
  required: z.boolean(),
});

const followUpMeetingSchema = z.object({
  shouldSchedule: z.boolean(),
  title: z.string(),
  summary: z.string(),
  rationale: z.string(),
  targetWithinDays: z.number().int().nullable(),
  recommendedOffsetDays: z.number().int().nullable(),
  suggestedDurationMinutes: z.number().int(),
  attendees: z.array(followUpMeetingAttendeeSchema),
  agenda: z.array(z.string()),
});

const meetingAnalysisSchema = z.object({
  meetingTitle: z.string(),
  meetingDate: z.string().nullable(),
  conciseSummary: z.string(),
  overallRisk: z.string(),
  recommendedNextStep: z.string(),
  agendaSections: z.array(agendaSectionSchema),
  followUpMeeting: followUpMeetingSchema,
  participants: z.array(participantSchema),
  actionItems: z.array(actionItemSchema),
  deliveryPlan: z.object({
    overview: z.string(),
    epics: z.array(epicDraftSchema),
  }),
});

const ANALYSIS_TEXT_FORMAT = zodTextFormat(
  meetingAnalysisSchema,
  "meeting_analysis",
);

const ANALYSIS_MAX_OUTPUT_TOKENS = [7200, 9600] as const;

const ANALYSIS_INSTRUCTIONS = `You turn messy meeting notes and transcripts into action-oriented project output.

Rules:
- Extract only meaningful action items.
- Break the meeting into clear agenda sections or discussion blocks.
- Each agenda section needs a short, precise summary and should reference the action items that belong to it.
- Also organize the work into Jira-friendly epics and stories.
- Group related action items under shared epics where that creates a cleaner implementation plan.
- Every story and epic must include practical acceptance criteria.
- Prefer explicit commitments over vague discussion points.
- If the owner is unclear, use "Unassigned".
- Infer owner email only if the source text makes it clear. Otherwise return null.
- Suggest a rough execution timeline for every action item.
- Suggest a rough execution timeline for every epic and story.
- Only set suggestedDueDate when the transcript clearly implies a real date or deadline. Otherwise return null.
- If a useful follow-up or cadence meeting is warranted, create followUpMeeting with a short agenda, recommended attendees, and a realistic offset in days.
- If no follow-up meeting is warranted, set followUpMeeting.shouldSchedule to false, explain why in summary and rationale, and return null target/recommended day values with an empty attendee and agenda list.
- Only include attendee email when the source clearly provides or strongly implies it. Otherwise return null.
- suggestedDurationMinutes should usually be 30, 45, or 60.
- Keep jiraSummary concise and specific.
- Keep jiraDescription detailed enough to become a useful Jira ticket description.
- If no concrete action items exist, return an empty actionItems array.
- If no implementation-oriented delivery plan can be created, return deliveryPlan.overview explaining why and an empty epics array.
- Stories should be implementation-sized work items, not miniature epics.
- Acceptance criteria must be specific, observable, and testable.
- Keep all prose compact. Most summary, rationale, risk, and next-step fields should stay within one or two sentences.
- Keep arrays focused on the most important items only.
- agendaSections.actionItemReferenceIds must refer to referenceId values that exist in actionItems.
- Output must be valid JSON that matches the provided schema exactly.`;

export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";

class StructuredAnalysisRetryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StructuredAnalysisRetryError";
  }
}

function buildAnalysisRequest(args: {
  cadenceWindowInstruction: string;
  maxOutputTokens: number;
  retryAttempt: number;
  today: string;
  transcript: string;
}) {
  const retryInstruction =
    args.retryAttempt > 0
      ? `

Retry guidance:
- The previous attempt was incomplete or malformed.
- Be even more concise than usual.
- Keep jiraDescription under 120 words per item.
- Return only valid JSON that fully closes every string, array, and object.`
      : "";

  return {
    model: DEFAULT_OPENAI_MODEL,
    instructions: `${ANALYSIS_INSTRUCTIONS}${retryInstruction}`,
    input: [
      {
        role: "user" as const,
        content: [
          {
            type: "input_text" as const,
            text: `Current date: ${args.today}

Analyze the following meeting notes or transcript and create action items with ownership, priority, and a rough timeline.
Also create a Jira-ready delivery plan with epics, child stories, and acceptance criteria.
Create short agenda-level summaries before the work items for each agenda section.
${args.cadenceWindowInstruction}

Transcript:
${args.transcript}`,
          },
        ],
      },
    ],
    max_output_tokens: args.maxOutputTokens,
    text: {
      format: ANALYSIS_TEXT_FORMAT,
    },
    ...(DEFAULT_OPENAI_MODEL.startsWith("gpt-5")
      ? { reasoning: { effort: "low" as const } }
      : {}),
  };
}

function parseMeetingAnalysis(outputText: string): MeetingAnalysis {
  let payload: unknown;

  try {
    payload = JSON.parse(outputText);
  } catch {
    throw new StructuredAnalysisRetryError(
      "The model returned malformed JSON.",
    );
  }

  const parsed = meetingAnalysisSchema.safeParse(payload);

  if (!parsed.success) {
    throw new StructuredAnalysisRetryError(
      `The model returned JSON that did not match the meeting schema: ${parsed.error.issues[0]?.message ?? "Unknown validation error."}`,
    );
  }

  return parsed.data;
}

export async function analyzeMeetingTranscript(
  transcript: string,
  options?: {
    cadenceWindowDays?: number | null;
  },
): Promise<MeetingAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const today = new Date().toISOString().slice(0, 10);
  const cadenceWindowInstruction =
    typeof options?.cadenceWindowDays === "number" &&
    Number.isFinite(options.cadenceWindowDays) &&
    options.cadenceWindowDays > 0
      ? `If a follow-up cadence meeting is justified, recommend it within ${options.cadenceWindowDays} days.`
      : "If a follow-up cadence meeting is justified, keep the recommendation within a practical short-term window.";

  let lastError: Error | null = null;

  for (const [retryAttempt, maxOutputTokens] of ANALYSIS_MAX_OUTPUT_TOKENS.entries()) {
    try {
      const response = await client.responses.create(
        buildAnalysisRequest({
          cadenceWindowInstruction,
          maxOutputTokens,
          retryAttempt,
          today,
          transcript,
        }),
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.status === "incomplete") {
        const reason = response.incomplete_details?.reason;

        throw new StructuredAnalysisRetryError(
          reason === "max_output_tokens"
            ? "The model hit the output token limit before finishing."
            : "The model returned an incomplete response.",
        );
      }

      const outputText = response.output_text.trim();

      if (!outputText) {
        throw new StructuredAnalysisRetryError(
          "The model returned an empty analysis response.",
        );
      }

      return parseMeetingAnalysis(outputText);
    } catch (error) {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error("Unexpected error while analyzing the transcript.");

      lastError = normalizedError;

      console.error("Meeting analysis attempt failed.", {
        attempt: retryAttempt + 1,
        maxOutputTokens,
        message: normalizedError.message,
      });

      const canRetry =
        normalizedError instanceof StructuredAnalysisRetryError &&
        retryAttempt < ANALYSIS_MAX_OUTPUT_TOKENS.length - 1;

      if (canRetry) {
        continue;
      }

      break;
    }
  }

  if (lastError instanceof StructuredAnalysisRetryError) {
    throw new Error(
      "The AI response was cut off or malformed before it finished. Please try again. If this keeps happening, shorten the transcript or split the meeting notes into smaller sections.",
    );
  }

  throw lastError ?? new Error("The model did not return a structured analysis.");
}
