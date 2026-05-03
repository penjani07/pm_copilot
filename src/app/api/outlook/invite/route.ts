import { NextResponse } from "next/server";

import { scheduleOutlookInvite } from "@/lib/outlook";
import type { MeetingAnalysis, OutlookSettings } from "@/lib/types";

type OutlookInviteBody = {
  analysis?: MeetingAnalysis;
  settings?: OutlookSettings;
};

function hasOutlookSettings(settings?: OutlookSettings): settings is OutlookSettings {
  return Boolean(
    settings?.accessToken &&
      settings.cadenceWithinDays &&
      settings.meetingStartTime &&
      settings.meetingDurationMinutes &&
      settings.timeZone,
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OutlookInviteBody;

    if (!body.analysis || !hasOutlookSettings(body.settings)) {
      return NextResponse.json(
        { error: "Missing meeting analysis or Outlook scheduling settings." },
        { status: 400 },
      );
    }

    const created = await scheduleOutlookInvite({
      analysis: body.analysis,
      settings: body.settings,
    });

    return NextResponse.json(created);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected Outlook scheduling error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
