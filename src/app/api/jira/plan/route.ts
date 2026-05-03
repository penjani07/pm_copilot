import { NextResponse } from "next/server";

import { createJiraEpicBundle } from "@/lib/jira";
import type { EpicDraft, JiraSettings, MeetingAnalysis } from "@/lib/types";

type JiraPlanBody = {
  epic?: EpicDraft;
  analysis?: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">;
  settings?: JiraSettings;
};

function hasPlanSettings(settings?: JiraSettings): settings is JiraSettings {
  return Boolean(
    settings?.siteUrl &&
      settings.email &&
      settings.apiToken &&
      settings.projectKey &&
      settings.epicIssueType &&
      settings.storyIssueType,
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JiraPlanBody;

    if (!body.epic || !body.analysis || !hasPlanSettings(body.settings)) {
      return NextResponse.json(
        { error: "Missing Jira plan settings or epic details." },
        { status: 400 },
      );
    }

    const created = await createJiraEpicBundle({
      epic: body.epic,
      analysis: body.analysis,
      settings: body.settings,
    });

    return NextResponse.json(created);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected Jira plan creation error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
