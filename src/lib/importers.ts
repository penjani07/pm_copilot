import type {
  ImportedTranscript,
  MeetingSourceProvider,
  MeetingSourceSettings,
} from "./types";

type SlackMessage = {
  bot_id?: string;
  text?: string;
  ts?: string;
  user?: string;
  username?: string;
};

type SlackHistoryResponse = {
  error?: string;
  messages?: SlackMessage[];
  ok?: boolean;
};

type TeamsTranscript = {
  createdDateTime?: string;
  id?: string;
};

type TeamsTranscriptListResponse = {
  value?: TeamsTranscript[];
};

type ZoomRecordingFile = {
  download_url?: string;
  file_extension?: string;
  file_type?: string;
  id?: string;
  recording_end?: string;
  recording_start?: string;
};

type ZoomRecordingsResponse = {
  recording_files?: ZoomRecordingFile[];
  start_time?: string;
  topic?: string;
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "Unknown time";
  }

  const seconds = Number.parseFloat(value);
  if (Number.isNaN(seconds)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  return new Date(seconds * 1000).toISOString();
}

function stripSlackMarkup(value: string) {
  const withoutMentions = value.replace(/<@([A-Z0-9]+)>/g, "@user:$1");
  const withoutLinks = withoutMentions.replace(
    /<((?:https?:\/\/|mailto:)[^>|]+)\|([^>]+)>/g,
    "$2 ($1)",
  );
  const cleaned = withoutLinks.replace(/<([^>]+)>/g, "$1");
  return decodeHtmlEntities(cleaned);
}

function parseVttTranscript(value: string) {
  const output: string[] = [];

  for (const rawLine of value.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (
      line === "WEBVTT" ||
      line.startsWith("NOTE") ||
      /^\d+$/.test(line) ||
      line.includes("-->")
    ) {
      continue;
    }

    const withSpeaker = line
      .replace(/<v\s+([^>]+)>/gi, "$1: ")
      .replace(/<\/v>/gi, "");
    const withoutTags = withSpeaker.replace(/<[^>]+>/g, "");
    const normalized = normalizeWhitespace(decodeHtmlEntities(withoutTags));

    if (normalized) {
      output.push(normalized);
    }
  }

  return output.join("\n");
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    throw new Error(
      typeof payload === "object" && payload !== null && "error" in payload
        ? String(payload.error)
        : `${response.status} ${response.statusText}`,
    );
  }

  return payload;
}

async function importFromSlack(
  settings: MeetingSourceSettings["slack"],
): Promise<ImportedTranscript> {
  if (!settings.botToken || !settings.channelId) {
    throw new Error("Slack import needs a bot token and channel ID.");
  }

  const params = new URLSearchParams({
    channel: settings.channelId.trim(),
    limit: `${Math.max(10, Math.min(250, Number.parseInt(settings.limit || "80", 10) || 80))}`,
  });

  if (settings.oldest) {
    params.set("oldest", `${Date.parse(settings.oldest) / 1000}`);
  }

  if (settings.latest) {
    params.set("latest", `${Date.parse(settings.latest) / 1000}`);
  }

  const endpoint = settings.threadTs.trim()
    ? "conversations.replies"
    : "conversations.history";

  if (settings.threadTs.trim()) {
    params.set("ts", settings.threadTs.trim());
  }

  const response = await fetch(`https://slack.com/api/${endpoint}?${params}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${settings.botToken.trim()}`,
    },
    method: "GET",
  });

  const payload = await parseJsonResponse<SlackHistoryResponse>(response);

  if (!payload.ok) {
    throw new Error(payload.error || "Slack import failed.");
  }

  const orderedMessages = [...(payload.messages ?? [])].sort(
    (left, right) => Number(left.ts ?? 0) - Number(right.ts ?? 0),
  );

  const transcript = orderedMessages
    .map((message) => {
      const speaker =
        message.username ||
        (message.user ? `user:${message.user}` : undefined) ||
        (message.bot_id ? `bot:${message.bot_id}` : undefined) ||
        "Slack participant";
      const text = stripSlackMarkup(message.text ?? "");

      if (!text) {
        return null;
      }

      return `[${formatTimestamp(message.ts)}] ${speaker}: ${text}`;
    })
    .filter((value): value is string => Boolean(value))
    .join("\n");

  if (!transcript) {
    throw new Error("No readable Slack messages were returned for that source.");
  }

  return {
    provider: "slack",
    title: settings.threadTs.trim()
      ? "Slack thread import"
      : "Slack channel import",
    sourceLabel: settings.threadTs.trim()
      ? `Slack thread ${settings.threadTs.trim()}`
      : `Slack channel ${settings.channelId.trim()}`,
    transcript,
    importedAt: new Date().toISOString(),
    hints: [
      "Imports the latest readable messages from the selected Slack conversation.",
      "User IDs remain in-place when Slack display names are not available from the payload.",
    ],
  };
}

async function importFromTeams(
  settings: MeetingSourceSettings["teams"],
): Promise<ImportedTranscript> {
  if (!settings.accessToken || !settings.organizerUserId || !settings.meetingId) {
    throw new Error(
      "Teams import needs a Microsoft Graph access token, organizer user ID, and meeting ID.",
    );
  }

  const baseUrl =
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
      settings.organizerUserId.trim(),
    )}/onlineMeetings/${encodeURIComponent(settings.meetingId.trim())}`;

  let transcriptId = settings.transcriptId.trim();

  if (!transcriptId) {
    const listResponse = await fetch(`${baseUrl}/transcripts`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${settings.accessToken.trim()}`,
      },
      method: "GET",
    });

    const listPayload = await parseJsonResponse<TeamsTranscriptListResponse>(
      listResponse,
    );
    const latestTranscript = [...(listPayload.value ?? [])].sort((left, right) =>
      (right.createdDateTime ?? "").localeCompare(left.createdDateTime ?? ""),
    )[0];

    transcriptId = latestTranscript?.id?.trim() ?? "";
  }

  if (!transcriptId) {
    throw new Error("No Teams transcript was found for that meeting.");
  }

  const contentResponse = await fetch(
    `${baseUrl}/transcripts/${encodeURIComponent(
      transcriptId,
    )}/content?$format=text/vtt`,
    {
      headers: {
        Accept: "text/vtt",
        Authorization: `Bearer ${settings.accessToken.trim()}`,
      },
      method: "GET",
    },
  );

  const vtt = await contentResponse.text();

  if (!contentResponse.ok) {
    throw new Error(vtt || "Teams transcript import failed.");
  }

  const transcript = parseVttTranscript(vtt);

  if (!transcript) {
    throw new Error("The Teams transcript content was empty after parsing.");
  }

  return {
    provider: "teams",
    title: "Teams meeting transcript",
    sourceLabel: `Teams meeting ${settings.meetingId.trim()}`,
    transcript,
    importedAt: new Date().toISOString(),
    hints: [
      "If transcript ID is left blank, the latest transcript on the meeting is used.",
      "Teams imports expect a Microsoft Graph token with transcript read access.",
    ],
  };
}

async function importFromZoom(
  settings: MeetingSourceSettings["zoom"],
): Promise<ImportedTranscript> {
  if (!settings.accessToken || !settings.meetingId) {
    throw new Error("Zoom import needs an OAuth access token and meeting ID.");
  }

  const recordingsResponse = await fetch(
    `https://api.zoom.us/v2/meetings/${encodeURIComponent(
      settings.meetingId.trim(),
    )}/recordings`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${settings.accessToken.trim()}`,
      },
      method: "GET",
    },
  );

  const recordingsPayload = await parseJsonResponse<ZoomRecordingsResponse>(
    recordingsResponse,
  );

  const transcriptFile = [...(recordingsPayload.recording_files ?? [])]
    .filter((file) => {
      const fileType = (file.file_type ?? "").toUpperCase();
      const extension = (file.file_extension ?? "").toUpperCase();

      return (
        fileType.includes("TRANSCRIPT") ||
        fileType === "CC" ||
        extension === "VTT" ||
        extension === "TXT"
      );
    })
    .sort((left, right) =>
      (right.recording_end ?? "").localeCompare(left.recording_end ?? ""),
    )[0];

  if (!transcriptFile?.download_url) {
    throw new Error("No transcript-style recording file was found for that Zoom meeting.");
  }

  let transcriptResponse = await fetch(transcriptFile.download_url, {
    headers: {
      Authorization: `Bearer ${settings.accessToken.trim()}`,
    },
    method: "GET",
  });

  if (!transcriptResponse.ok) {
    const authorizedUrl = new URL(transcriptFile.download_url);
    authorizedUrl.searchParams.set("access_token", settings.accessToken.trim());
    transcriptResponse = await fetch(authorizedUrl.toString(), { method: "GET" });
  }

  const rawTranscript = await transcriptResponse.text();

  if (!transcriptResponse.ok) {
    throw new Error(rawTranscript || "Zoom transcript download failed.");
  }

  const transcript = rawTranscript.startsWith("WEBVTT")
    ? parseVttTranscript(rawTranscript)
    : rawTranscript.trim();

  if (!transcript) {
    throw new Error("The Zoom transcript content was empty after parsing.");
  }

  return {
    provider: "zoom",
    title: recordingsPayload.topic?.trim() || "Zoom meeting transcript",
    sourceLabel: `Zoom meeting ${settings.meetingId.trim()}`,
    transcript,
    importedAt: recordingsPayload.start_time || new Date().toISOString(),
    hints: [
      "Zoom imports read the latest transcript-like recording file from the selected meeting.",
      "If direct bearer download fails, the importer retries with the token on the download URL for compatibility.",
    ],
  };
}

export async function importTranscriptFromProvider(args: {
  provider: MeetingSourceProvider;
  settings: MeetingSourceSettings;
}): Promise<ImportedTranscript> {
  switch (args.provider) {
    case "slack":
      return importFromSlack(args.settings.slack);
    case "teams":
      return importFromTeams(args.settings.teams);
    case "zoom":
      return importFromZoom(args.settings.zoom);
    default:
      throw new Error("Unsupported provider.");
  }
}
