import { NextResponse } from "next/server";

import { analyzeMeetingTranscript } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      transcript?: string;
      cadenceWindowDays?: number;
    };
    const transcript = body.transcript?.trim();
    const cadenceWindowDays =
      typeof body.cadenceWindowDays === "number" &&
      Number.isFinite(body.cadenceWindowDays) &&
      body.cadenceWindowDays > 0
        ? Math.round(body.cadenceWindowDays)
        : null;

    if (!transcript || transcript.length < 40) {
      return NextResponse.json(
        {
          error:
            "Please provide a fuller transcript or meeting note before analyzing.",
        },
        { status: 400 },
      );
    }

    const analysis = await analyzeMeetingTranscript(transcript, {
      cadenceWindowDays,
    });
    return NextResponse.json({ analysis });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while analyzing the transcript.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
