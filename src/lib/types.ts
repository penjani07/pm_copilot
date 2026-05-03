export type Priority = "High" | "Medium" | "Low";
export type Confidence = "High" | "Medium" | "Low";

export type Participant = {
  name: string;
  role: string | null;
  signals: string[];
};

export type AgendaSection = {
  referenceId: string;
  title: string;
  summary: string;
  actionItemReferenceIds: string[];
};

export type ActionItem = {
  referenceId: string;
  title: string;
  ownerName: string;
  ownerEmail: string | null;
  priority: Priority;
  summary: string;
  rationale: string;
  suggestedTimeline: string;
  suggestedDueDate: string | null;
  confidence: Confidence;
  blockers: string[];
  jiraSummary: string;
  jiraDescription: string;
};

export type StoryDraft = {
  referenceId: string;
  title: string;
  ownerName: string;
  ownerEmail: string | null;
  priority: Priority;
  summary: string;
  rationale: string;
  suggestedTimeline: string;
  suggestedDueDate: string | null;
  confidence: Confidence;
  blockers: string[];
  acceptanceCriteria: string[];
  jiraSummary: string;
  jiraDescription: string;
};

export type EpicDraft = {
  referenceId: string;
  title: string;
  ownerName: string;
  ownerEmail: string | null;
  priority: Priority;
  objective: string;
  businessValue: string;
  suggestedTimeline: string;
  suggestedDueDate: string | null;
  confidence: Confidence;
  successMetrics: string[];
  acceptanceCriteria: string[];
  jiraSummary: string;
  jiraDescription: string;
  stories: StoryDraft[];
};

export type DeliveryPlan = {
  overview: string;
  epics: EpicDraft[];
};

export type FollowUpMeetingAttendee = {
  name: string;
  email: string | null;
  required: boolean;
};

export type FollowUpMeeting = {
  shouldSchedule: boolean;
  title: string;
  summary: string;
  rationale: string;
  targetWithinDays: number | null;
  recommendedOffsetDays: number | null;
  suggestedDurationMinutes: number;
  attendees: FollowUpMeetingAttendee[];
  agenda: string[];
};

export type MeetingAnalysis = {
  meetingTitle: string;
  meetingDate: string | null;
  conciseSummary: string;
  overallRisk: string;
  recommendedNextStep: string;
  agendaSections: AgendaSection[];
  followUpMeeting: FollowUpMeeting;
  participants: Participant[];
  actionItems: ActionItem[];
  deliveryPlan: DeliveryPlan;
};

export type JiraSettings = {
  siteUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  issueType: string;
  epicIssueType: string;
  storyIssueType: string;
  defaultLabels: string;
};

export type OutlookSettings = {
  accessToken: string;
  organizerUserId: string;
  calendarId: string;
  cadenceWithinDays: string;
  meetingStartTime: string;
  meetingDurationMinutes: string;
  timeZone: string;
  location: string;
  additionalAttendees: string;
};

export type CreatedJiraIssue = {
  issueKey: string;
  issueUrl: string;
  assigneeName: string | null;
  note: string | null;
};

export type CreatedJiraStory = CreatedJiraIssue & {
  referenceId: string;
  parentLinked: boolean;
};

export type CreatedJiraEpicBundle = {
  epic: CreatedJiraIssue;
  stories: CreatedJiraStory[];
  note: string | null;
};

export type CreatedOutlookInvite = {
  eventId: string;
  subject: string;
  webLink: string | null;
  joinUrl: string | null;
  start: string;
  end: string;
  attendeeCount: number;
  note: string | null;
};

export type MeetingSourceProvider = "slack" | "teams" | "zoom";

export type SlackImportSettings = {
  botToken: string;
  channelId: string;
  threadTs: string;
  oldest: string;
  latest: string;
  limit: string;
};

export type TeamsImportSettings = {
  accessToken: string;
  organizerUserId: string;
  meetingId: string;
  transcriptId: string;
};

export type ZoomImportSettings = {
  accessToken: string;
  meetingId: string;
};

export type MeetingSourceSettings = {
  slack: SlackImportSettings;
  teams: TeamsImportSettings;
  zoom: ZoomImportSettings;
};

export type ImportedTranscript = {
  provider: MeetingSourceProvider;
  title: string;
  sourceLabel: string;
  transcript: string;
  importedAt: string;
  hints: string[];
};
