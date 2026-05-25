import type { MeetingAnalysis } from "@/lib/types";

export type AnalysisExportFormat = "word" | "pdf" | "xls" | "csv";

type ExportContext = {
  sourceFileName?: string | null;
  updatedAt?: string | null;
};

type ExportRow = {
  section: string;
  reference: string;
  title: string;
  owner: string;
  priority: string;
  dueDate: string;
  summary: string;
  details: string;
};

const EXPORT_COLUMNS: Array<keyof ExportRow> = [
  "section",
  "reference",
  "title",
  "owner",
  "priority",
  "dueDate",
  "summary",
  "details",
];

const EXPORT_COLUMN_LABELS: Record<keyof ExportRow, string> = {
  section: "Section",
  reference: "Reference",
  title: "Title",
  owner: "Owner",
  priority: "Priority",
  dueDate: "Due Date",
  summary: "Summary",
  details: "Details",
};

function optional(value: string | number | null | undefined, fallback = "Not specified") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function list(values: string[]) {
  return values.length ? values.join("; ") : "None captured";
}

function attendees(analysis: MeetingAnalysis) {
  const names = analysis.followUpMeeting.attendees.map((attendee) => {
    const email = attendee.email ? ` <${attendee.email}>` : "";
    const required = attendee.required ? "required" : "optional";
    return `${attendee.name}${email} (${required})`;
  });

  return list(names);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function createAnalysisFileBaseName(analysis: MeetingAnalysis) {
  const title = analysis.meetingTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return title ? `pmo-copilot-${title}` : "pmo-copilot-analysis";
}

export function createAnalysisExportRows(
  analysis: MeetingAnalysis,
  context: ExportContext = {},
): ExportRow[] {
  const rows: ExportRow[] = [
    {
      section: "Overview",
      reference: "",
      title: analysis.meetingTitle,
      owner: "",
      priority: "",
      dueDate: formatDate(analysis.meetingDate),
      summary: analysis.conciseSummary,
      details: [
        `Overall risk: ${analysis.overallRisk}`,
        `Recommended next step: ${analysis.recommendedNextStep}`,
        `Source: ${optional(context.sourceFileName, "Transcript workspace")}`,
        `Last updated: ${formatDateTime(context.updatedAt)}`,
      ].join("\n"),
    },
    {
      section: "Follow-up Meeting",
      reference: "",
      title: analysis.followUpMeeting.title,
      owner: "",
      priority: analysis.followUpMeeting.shouldSchedule ? "Recommended" : "Not recommended",
      dueDate: analysis.followUpMeeting.targetWithinDays
        ? `Within ${analysis.followUpMeeting.targetWithinDays} day(s)`
        : "Not specified",
      summary: analysis.followUpMeeting.summary,
      details: [
        `Rationale: ${analysis.followUpMeeting.rationale}`,
        `Suggested duration: ${analysis.followUpMeeting.suggestedDurationMinutes} minutes`,
        `Attendees: ${attendees(analysis)}`,
        `Agenda: ${list(analysis.followUpMeeting.agenda)}`,
      ].join("\n"),
    },
  ];

  for (const participant of analysis.participants) {
    rows.push({
      section: "Participants",
      reference: "",
      title: participant.name,
      owner: participant.role ?? "",
      priority: "",
      dueDate: "",
      summary: participant.role ?? "Role not specified",
      details: list(participant.signals),
    });
  }

  for (const section of analysis.agendaSections) {
    rows.push({
      section: "Agenda",
      reference: section.referenceId,
      title: section.title,
      owner: "",
      priority: "",
      dueDate: "",
      summary: section.summary,
      details: section.actionItemReferenceIds.length
        ? `Linked actions: ${section.actionItemReferenceIds.join(", ")}`
        : "No linked actions",
    });
  }

  rows.push({
    section: "Delivery Plan",
    reference: "",
    title: "Plan overview",
    owner: "",
    priority: "",
    dueDate: "",
    summary: analysis.deliveryPlan.overview,
    details: `${analysis.deliveryPlan.epics.length} epic(s) generated`,
  });

  for (const epic of analysis.deliveryPlan.epics) {
    rows.push({
      section: "Delivery Epic",
      reference: epic.referenceId,
      title: epic.title,
      owner: epic.ownerEmail ? `${epic.ownerName} <${epic.ownerEmail}>` : epic.ownerName,
      priority: epic.priority,
      dueDate: optional(epic.suggestedDueDate),
      summary: epic.objective,
      details: [
        `Business value: ${epic.businessValue}`,
        `Timeline: ${epic.suggestedTimeline}`,
        `Confidence: ${epic.confidence}`,
        `Success metrics: ${list(epic.successMetrics)}`,
        `Acceptance criteria: ${list(epic.acceptanceCriteria)}`,
        `Jira summary: ${epic.jiraSummary}`,
        `Jira description: ${epic.jiraDescription}`,
      ].join("\n"),
    });

    for (const story of epic.stories) {
      rows.push({
        section: "Delivery Story",
        reference: story.referenceId,
        title: story.title,
        owner: story.ownerEmail
          ? `${story.ownerName} <${story.ownerEmail}>`
          : story.ownerName,
        priority: story.priority,
        dueDate: optional(story.suggestedDueDate),
        summary: story.summary,
        details: [
          `Rationale: ${story.rationale}`,
          `Timeline: ${story.suggestedTimeline}`,
          `Confidence: ${story.confidence}`,
          `Blockers: ${list(story.blockers)}`,
          `Acceptance criteria: ${list(story.acceptanceCriteria)}`,
          `Jira summary: ${story.jiraSummary}`,
          `Jira description: ${story.jiraDescription}`,
        ].join("\n"),
      });
    }
  }

  for (const item of analysis.actionItems) {
    rows.push({
      section: "Action Item",
      reference: item.referenceId,
      title: item.title,
      owner: item.ownerEmail ? `${item.ownerName} <${item.ownerEmail}>` : item.ownerName,
      priority: item.priority,
      dueDate: optional(item.suggestedDueDate),
      summary: item.summary,
      details: [
        `Rationale: ${item.rationale}`,
        `Timeline: ${item.suggestedTimeline}`,
        `Confidence: ${item.confidence}`,
        `Blockers: ${list(item.blockers)}`,
        `Jira summary: ${item.jiraSummary}`,
        `Jira description: ${item.jiraDescription}`,
      ].join("\n"),
    });
  }

  return rows;
}

export function createAnalysisPlainText(
  analysis: MeetingAnalysis,
  context: ExportContext = {},
) {
  const rows = createAnalysisExportRows(analysis, context);

  return rows
    .map((row) => {
      const lines = [
        row.section,
        row.reference ? `Reference: ${row.reference}` : null,
        row.title ? `Title: ${row.title}` : null,
        row.owner ? `Owner: ${row.owner}` : null,
        row.priority ? `Priority: ${row.priority}` : null,
        row.dueDate ? `Due date: ${row.dueDate}` : null,
        row.summary ? `Summary: ${row.summary}` : null,
        row.details ? `Details:\n${row.details}` : null,
      ].filter(Boolean);

      return lines.join("\n");
    })
    .join("\n\n---\n\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createHtmlTable(rows: ExportRow[]) {
  return `<table><thead><tr>${EXPORT_COLUMNS.map(
    (column) => `<th>${EXPORT_COLUMN_LABELS[column]}</th>`,
  ).join("")}</tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr>${EXPORT_COLUMNS.map(
          (column) => `<td>${escapeHtml(row[column]).replace(/\n/g, "<br>")}</td>`,
        ).join("")}</tr>`,
    )
    .join("")}</tbody></table>`;
}

export function createAnalysisWordHtml(
  analysis: MeetingAnalysis,
  context: ExportContext = {},
) {
  const rows = createAnalysisExportRows(analysis, context);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(analysis.meetingTitle)}</title>
  <style>
    body { color: #0f172a; font-family: Arial, sans-serif; line-height: 1.45; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    p.meta { color: #475569; margin-top: 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #cbd5e1; padding: 7px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>${escapeHtml(analysis.meetingTitle)}</h1>
  <p class="meta">Source: ${escapeHtml(optional(context.sourceFileName, "Transcript workspace"))} | Updated: ${escapeHtml(formatDateTime(context.updatedAt))}</p>
  ${createHtmlTable(rows)}
</body>
</html>`;
}

export function createAnalysisXlsHtml(
  analysis: MeetingAnalysis,
  context: ExportContext = {},
) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    table { border-collapse: collapse; }
    th, td { border: 1px solid #999; padding: 6px; vertical-align: top; }
    th { background: #eef2ff; font-weight: bold; }
  </style>
</head>
<body>
  ${createHtmlTable(createAnalysisExportRows(analysis, context))}
</body>
</html>`;
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function createAnalysisCsv(
  analysis: MeetingAnalysis,
  context: ExportContext = {},
) {
  const rows = createAnalysisExportRows(analysis, context);
  const header = EXPORT_COLUMNS.map((column) =>
    escapeCsv(EXPORT_COLUMN_LABELS[column]),
  ).join(",");
  const body = rows
    .map((row) => EXPORT_COLUMNS.map((column) => escapeCsv(row[column])).join(","))
    .join("\r\n");

  return `${header}\r\n${body}`;
}

function normalizePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\t/g, "  ");
}

function wrapPdfLine(line: string, maxLength: number) {
  if (!line.trim()) {
    return [""];
  }

  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= maxLength) {
      current = `${current} ${word}`;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function escapePdfString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function createAnalysisPdfBlob(
  analysis: MeetingAnalysis,
  context: ExportContext = {},
) {
  const text = normalizePdfText(createAnalysisPlainText(analysis, context));
  const lines = text
    .split(/\r?\n/)
    .flatMap((line) => wrapPdfLine(line, 88));
  const linesPerPage = 48;
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(lines.length / linesPerPage)) },
    (_, index) => lines.slice(index * linesPerPage, (index + 1) * linesPerPage),
  );

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages
      .map((_, index) => `${4 + index * 2} 0 R`)
      .join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  pages.forEach((pageLines, index) => {
    const pageObjectId = 4 + index * 2;
    const streamObjectId = pageObjectId + 1;
    const stream = [
      "BT",
      "/F1 10 Tf",
      "54 748 Td",
      "14 TL",
      ...pageLines.map((line) =>
        line ? `(${escapePdfString(line)}) Tj T*` : "T*",
      ),
      "ET",
    ].join("\n");

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamObjectId} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

