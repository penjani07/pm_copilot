import type {
  CreatedOutlookInvite,
  MeetingAnalysis,
  OutlookSettings,
} from "./types";

type ScheduleOutlookInviteArgs = {
  analysis: MeetingAnalysis;
  settings: OutlookSettings;
};

type GraphAttendee = {
  emailAddress: {
    address: string;
    name: string;
  };
  type: "required";
};

type GraphCreateEventResponse = {
  id: string;
  subject?: string;
  webLink?: string | null;
  onlineMeeting?: {
    joinUrl?: string | null;
  } | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value) ? value : "10:00";
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseMeetingDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function addBusinessDays(date: Date, businessDays: number) {
  const result = new Date(date);
  let added = 0;

  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }

  return result;
}

function formatDatePart(value: number) {
  return `${value}`.padStart(2, "0");
}

function buildDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  return `${date.getFullYear()}-${formatDatePart(date.getMonth() + 1)}-${formatDatePart(date.getDate())}T${formatDatePart(hours)}:${formatDatePart(minutes)}:00`;
}

function addMinutesToDateTime(date: Date, time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  const result = new Date(date);
  result.setHours(hours, minutes + minutesToAdd, 0, 0);

  return `${result.getFullYear()}-${formatDatePart(result.getMonth() + 1)}-${formatDatePart(result.getDate())}T${formatDatePart(result.getHours())}:${formatDatePart(result.getMinutes())}:00`;
}

function buildEventPath(settings: OutlookSettings) {
  const organizer = settings.organizerUserId.trim();
  const calendarId = settings.calendarId.trim();

  if (organizer && calendarId) {
    return `/users/${encodeURIComponent(organizer)}/calendars/${encodeURIComponent(calendarId)}/events`;
  }

  if (organizer) {
    return `/users/${encodeURIComponent(organizer)}/events`;
  }

  if (calendarId) {
    return `/me/calendars/${encodeURIComponent(calendarId)}/events`;
  }

  return "/me/events";
}

function parseAdditionalAttendees(raw: string) {
  const entries = raw
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  return entries.flatMap((entry) => {
    const match = entry.match(/^(.*)<([^>]+)>$/);
    if (match) {
      const name = match[1].trim() || match[2].trim();
      const address = match[2].trim();
      return address.includes("@")
        ? [{ name, email: address }]
        : [];
    }

    return entry.includes("@")
      ? [{ name: entry, email: entry }]
      : [];
  });
}

function mergeAttendees(analysis: MeetingAnalysis, settings: OutlookSettings) {
  const fromAnalysis = analysis.followUpMeeting.attendees
    .filter((attendee) => attendee.email)
    .map((attendee) => ({
      name: attendee.name || attendee.email || "Participant",
      email: attendee.email!.trim(),
    }));
  const fromSettings = parseAdditionalAttendees(settings.additionalAttendees);
  const deduped = new Map<string, { name: string; email: string }>();

  for (const attendee of [...fromAnalysis, ...fromSettings]) {
    const normalizedEmail = attendee.email.trim().toLowerCase();
    if (!normalizedEmail) {
      continue;
    }

    if (!deduped.has(normalizedEmail)) {
      deduped.set(normalizedEmail, attendee);
    }
  }

  return [...deduped.values()].map(
    (attendee) =>
      ({
        emailAddress: {
          address: attendee.email,
          name: attendee.name,
        },
        type: "required",
      }) satisfies GraphAttendee,
  );
}

function buildInviteBody(analysis: MeetingAnalysis) {
  const agendaHtml = analysis.followUpMeeting.agenda.length
    ? `<ul>${analysis.followUpMeeting.agenda
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`
    : "<p>No additional agenda items were proposed.</p>";
  const taskRows = analysis.actionItems.length
    ? `<ul>${analysis.actionItems
        .slice(0, 6)
        .map((item) => {
          const due = item.suggestedDueDate
            ? `Due ${escapeHtml(item.suggestedDueDate)}`
            : escapeHtml(item.suggestedTimeline);

          return `<li><strong>${escapeHtml(item.title)}</strong> - ${escapeHtml(item.ownerName)} to ${escapeHtml(item.summary)} (${due})</li>`;
        })
        .join("")}</ul>`
    : "<p>No action items were extracted from the source notes.</p>";
  const agendaBriefsHtml = analysis.agendaSections.length
    ? `<ul>${analysis.agendaSections
        .map(
          (section) =>
            `<li><strong>${escapeHtml(section.title)}</strong> - ${escapeHtml(section.summary)}</li>`,
        )
        .join("")}</ul>`
    : "<p>No agenda sections were identified.</p>";

  return `
    <p>${escapeHtml(analysis.followUpMeeting.summary)}</p>
    <p><strong>Why this meeting is being scheduled:</strong> ${escapeHtml(analysis.followUpMeeting.rationale)}</p>
    <h3>Agenda</h3>
    ${agendaHtml}
    <h3>Context from the previous meeting</h3>
    <p>${escapeHtml(analysis.conciseSummary)}</p>
    ${agendaBriefsHtml}
    <h3>Tracked follow-ups</h3>
    ${taskRows}
  `.trim();
}

async function graphRequest<T>(
  accessToken: string,
  path: string,
  init: RequestInit,
) {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken.trim()}`,
      ...init.headers,
    },
  });
  const text = await response.text();

  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
        ? payload.error.message
        : typeof payload === "string" && payload
          ? payload
          : `${response.status} ${response.statusText}`;

    throw new Error(message);
  }

  return payload as T;
}

export async function scheduleOutlookInvite({
  analysis,
  settings,
}: ScheduleOutlookInviteArgs): Promise<CreatedOutlookInvite> {
  if (!analysis.followUpMeeting.shouldSchedule) {
    throw new Error("This meeting does not currently require a follow-up cadence invite.");
  }

  const accessToken = settings.accessToken.trim();
  if (!accessToken) {
    throw new Error("Microsoft Graph access token is required.");
  }

  const attendees = mergeAttendees(analysis, settings);
  if (!attendees.length) {
    throw new Error(
      "No attendee email addresses were available for the invite. Add them in Outlook setup or include emails in the meeting notes.",
    );
  }

  const windowDays = parsePositiveInt(settings.cadenceWithinDays, 5);
  const configuredDuration = parsePositiveInt(settings.meetingDurationMinutes, 30);
  const suggestedDuration = analysis.followUpMeeting.suggestedDurationMinutes;
  const durationMinutes =
    suggestedDuration > 0 ? suggestedDuration : configuredDuration;
  const recommendedOffset = analysis.followUpMeeting.recommendedOffsetDays;
  const offsetDays =
    typeof recommendedOffset === "number" && recommendedOffset > 0
      ? Math.min(recommendedOffset, windowDays)
      : Math.min(windowDays, 3);
  const baseDate =
    parseMeetingDate(analysis.meetingDate) ?? startOfToday();
  const today = startOfToday();
  const schedulingAnchor = baseDate > today ? baseDate : today;
  const scheduledDate = addBusinessDays(schedulingAnchor, Math.max(1, offsetDays));
  const startTime = normalizeTime(settings.meetingStartTime);
  const timeZone = settings.timeZone.trim() || "UTC";
  const subject = analysis.followUpMeeting.title.trim() || `Follow-up: ${analysis.meetingTitle}`;
  const startDateTime = buildDateTime(scheduledDate, startTime);
  const endDateTime = addMinutesToDateTime(
    scheduledDate,
    startTime,
    durationMinutes,
  );
  const response = await graphRequest<GraphCreateEventResponse>(
    accessToken,
    buildEventPath(settings),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: `outlook.timezone="${timeZone}"`,
      },
      body: JSON.stringify({
        subject,
        body: {
          contentType: "HTML",
          content: buildInviteBody(analysis),
        },
        start: {
          dateTime: startDateTime,
          timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone,
        },
        location: {
          displayName: settings.location.trim() || "Microsoft Teams",
        },
        attendees,
        allowNewTimeProposals: true,
        isOnlineMeeting: true,
        onlineMeetingProvider: "teamsForBusiness",
      }),
    },
  );

  const missingEmailCount = analysis.followUpMeeting.attendees.filter(
    (attendee) => !attendee.email,
  ).length;

  return {
    eventId: response.id,
    subject: response.subject ?? subject,
    webLink: response.webLink ?? null,
    joinUrl: response.onlineMeeting?.joinUrl ?? null,
    start: startDateTime,
    end: endDateTime,
    attendeeCount: attendees.length,
    note:
      missingEmailCount > 0
        ? `${missingEmailCount} suggested attendee(s) were excluded because no email address was available.`
        : null,
  };
}
