import type { JiraSettings, MeetingAnalysis, OutlookSettings } from "@/lib/types";

export const JIRA_STORAGE_KEY = "project-management-drill-jira-settings";
export const OUTLOOK_STORAGE_KEY = "project-management-drill-outlook-settings";
export const WORKFLOW_SESSION_STORAGE_KEY =
  "project-management-drill-workflow-session";

export const INITIAL_JIRA_SETTINGS: JiraSettings = {
  siteUrl: "",
  email: "",
  apiToken: "",
  projectKey: "",
  issueType: "Task",
  epicIssueType: "Epic",
  storyIssueType: "Story",
  defaultLabels: "meeting-ai,action-item",
};

export const INITIAL_OUTLOOK_SETTINGS: OutlookSettings = {
  accessToken: "",
  organizerUserId: "",
  calendarId: "",
  cadenceWithinDays: "5",
  meetingStartTime: "10:00",
  meetingDurationMinutes: "30",
  timeZone: "UTC",
  location: "Microsoft Teams",
  additionalAttendees: "",
};

export type WorkflowSession = {
  transcript: string;
  selectedFileName: string | null;
  sourceMessage: string | null;
  analysis: MeetingAnalysis | null;
  updatedAt: string | null;
};

export type WorkflowStorageSnapshot = {
  workflowSession: WorkflowSession;
  jiraSettings: JiraSettings;
  outlookSettings: OutlookSettings;
  updatedAt: string | null;
};

export const EMPTY_WORKFLOW_SESSION: WorkflowSession = {
  transcript: "",
  selectedFileName: null,
  sourceMessage: null,
  analysis: null,
  updatedAt: null,
};

export const EMPTY_WORKFLOW_STORAGE_SNAPSHOT: WorkflowStorageSnapshot = {
  workflowSession: EMPTY_WORKFLOW_SESSION,
  jiraSettings: INITIAL_JIRA_SETTINGS,
  outlookSettings: INITIAL_OUTLOOK_SETTINGS,
  updatedAt: null,
};

export function parseStoredJiraSettings(value: string | null) {
  if (!value) {
    return INITIAL_JIRA_SETTINGS;
  }

  try {
    const parsed = JSON.parse(value) as Partial<JiraSettings>;
    return { ...INITIAL_JIRA_SETTINGS, ...parsed };
  } catch {
    return INITIAL_JIRA_SETTINGS;
  }
}

export function parseStoredOutlookSettings(value: string | null) {
  if (!value) {
    return INITIAL_OUTLOOK_SETTINGS;
  }

  try {
    const parsed = JSON.parse(value) as Partial<OutlookSettings>;
    return { ...INITIAL_OUTLOOK_SETTINGS, ...parsed };
  } catch {
    return INITIAL_OUTLOOK_SETTINGS;
  }
}

export function parseStoredWorkflowSession(value: string | null) {
  if (!value) {
    return EMPTY_WORKFLOW_SESSION;
  }

  try {
    const parsed = JSON.parse(value) as Partial<WorkflowSession>;
    return { ...EMPTY_WORKFLOW_SESSION, ...parsed };
  } catch {
    return EMPTY_WORKFLOW_SESSION;
  }
}

export function parseWorkflowStorageSnapshot(value: unknown) {
  if (!value || typeof value !== "object") {
    return EMPTY_WORKFLOW_STORAGE_SNAPSHOT;
  }

  const parsed = value as Partial<WorkflowStorageSnapshot>;

  return {
    workflowSession: {
      ...EMPTY_WORKFLOW_SESSION,
      ...(parsed.workflowSession ?? {}),
    },
    jiraSettings: {
      ...INITIAL_JIRA_SETTINGS,
      ...(parsed.jiraSettings ?? {}),
    },
    outlookSettings: {
      ...INITIAL_OUTLOOK_SETTINGS,
      ...(parsed.outlookSettings ?? {}),
    },
    updatedAt: parsed.updatedAt ?? parsed.workflowSession?.updatedAt ?? null,
  };
}

export function hasWorkflowStorageSnapshotData(
  snapshot: WorkflowStorageSnapshot,
) {
  return Boolean(
    snapshot.workflowSession.transcript.trim() ||
      snapshot.workflowSession.analysis ||
      isJiraConfigured(snapshot.jiraSettings) ||
      hasOutlookCredentials(snapshot.outlookSettings),
  );
}

export function hasOutlookCredentials(settings: OutlookSettings) {
  return Boolean(
    settings.accessToken &&
      settings.cadenceWithinDays &&
      settings.meetingStartTime &&
      settings.meetingDurationMinutes &&
      settings.timeZone,
  );
}

export function isJiraConfigured(settings: JiraSettings) {
  return Boolean(
    settings.siteUrl &&
      settings.email &&
      settings.apiToken &&
      settings.projectKey,
  );
}

export function isJiraPlanConfigured(settings: JiraSettings) {
  return Boolean(
    settings.siteUrl &&
      settings.email &&
      settings.apiToken &&
      settings.projectKey &&
      settings.epicIssueType &&
      settings.storyIssueType,
  );
}
