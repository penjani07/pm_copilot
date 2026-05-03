import { NextResponse } from "next/server";

import { createJiraIssue } from "@/lib/jira";
import type { ActionItem, JiraSettings, MeetingAnalysis } from "@/lib/types";

type JiraCreateBody = {
  actionItem?: ActionItem;
  analysis?: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">;
  settings?: JiraSettings;
};

function hasAllSettings(settings?: JiraSettings): settings is JiraSettings {
  return Boolean(
    settings?.siteUrl &&
      settings.email &&
      settings.apiToken &&
      settings.projectKey,
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JiraCreateBody;

    if (!body.actionItem || !body.analysis || !hasAllSettings(body.settings)) {
      return NextResponse.json(
        { error: "Missing Jira settings or action item details." },
        { status: 400 },
      );
    }

    const actionItem = body.actionItem;
    const analysis = body.analysis;
    const settings = body.settings;

    const created = await createJiraIssue({
      actionItem,
      analysis,
      settings,
    });

    return NextResponse.json(created);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected Jira integration error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
