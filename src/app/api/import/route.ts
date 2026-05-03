import { NextResponse } from "next/server";

import { importTranscriptFromProvider } from "@/lib/importers";
import type { MeetingSourceProvider, MeetingSourceSettings } from "@/lib/types";

type ImportRequestBody = {
  provider?: MeetingSourceProvider;
  settings?: MeetingSourceSettings;
};

function isSupportedProvider(
  provider?: string,
): provider is MeetingSourceProvider {
  return provider === "slack" || provider === "teams" || provider === "zoom";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ImportRequestBody;

    if (!isSupportedProvider(body.provider) || !body.settings) {
      return NextResponse.json(
        { error: "Provider selection and import settings are required." },
        { status: 400 },
      );
    }

    const importResult = await importTranscriptFromProvider({
      provider: body.provider,
      settings: body.settings,
    });

    return NextResponse.json({ importResult });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected source import error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
