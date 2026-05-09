export type MetricTone = "neutral" | "good" | "watch" | "risk";
export type ActionTab = "suggested" | "needs-review" | "approved";
export type RiskTab = "delivery" | "governance" | "stakeholder";

export type DashboardKpi = {
  label: string;
  value: string;
  trend: string;
};

export type DashboardWidget = {
  title: string;
  value: string;
  note: string;
  tone: MetricTone;
};

export type WorkflowStep = {
  step: string;
  title: string;
  summary: string;
  href: string;
};

export type ModuleCard = {
  href: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type MinutesPanel = {
  title: string;
  body: string[];
};

export type MetadataCard = {
  label: string;
  value: string;
  detail: string;
};

export type ActionReviewItem = {
  id: string;
  status: ActionTab;
  title: string;
  owner: string;
  team: string;
  priority: string;
  dueDate: string;
  dependency: string;
  risk: string;
  confidence: string;
  duplicateSignal: string;
  sprintRecommendation: string;
  epicRecommendation: string;
  jiraMapping: string;
};

export type IntegrationLane = {
  title: string;
  system: string;
  status: string;
  summary: string;
  fields: string[];
};

export type RiskSignal = {
  team: string;
  category: RiskTab;
  risk: string;
  reason: string;
  nextAction: string;
};

export type ExecutiveHighlight = {
  title: string;
  summary: string;
  signal: string;
};

export const DASHBOARD_KPIS: DashboardKpi[] = [
  { label: "Action items completed", value: "82%", trend: "+6 pts vs last week" },
  { label: "Average follow-up delay", value: "1.4 days", trend: "Down from 2.1 days" },
  { label: "Delivery risk index", value: "68 / 100", trend: "2 programs need attention" },
  { label: "Team responsiveness", value: "91%", trend: "Replies within 24h" },
];

export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    title: "Meetings today",
    value: "12",
    note: "4 already processed into execution packs.",
    tone: "neutral",
  },
  {
    title: "Unresolved action items",
    value: "27",
    note: "7 are overdue and ready for escalation.",
    tone: "risk",
  },
  {
    title: "Risks detected by AI",
    value: "9",
    note: "Security approvals and infra dependencies dominate.",
    tone: "watch",
  },
  {
    title: "Delayed Jira tickets",
    value: "14",
    note: "5 slipped more than one sprint boundary.",
    tone: "risk",
  },
  {
    title: "Teams with no updates",
    value: "3",
    note: "Treasury, Security, and CX owe progress notes.",
    tone: "watch",
  },
  {
    title: "Upcoming follow-up meetings",
    value: "6",
    note: "2 were proposed automatically from blocker clusters.",
    tone: "good",
  },
  {
    title: "Cross-team dependencies",
    value: "18",
    note: "8 dependencies are tied to release 5.2 milestones.",
    tone: "neutral",
  },
  {
    title: "Sentiment escalation risk",
    value: "Medium",
    note: "Treasury sync language shows rising frustration.",
    tone: "watch",
  },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: "01",
    title: "Ingest meeting evidence",
    summary: "Upload transcript, audio, or pasted notes so the assistant starts with a governed source.",
    href: "/intake",
  },
  {
    step: "02",
    title: "Refine minutes and ownership",
    summary: "Convert raw discussion into structured MoM, decisions, blockers, and named owners.",
    href: "/minutes",
  },
  {
    step: "03",
    title: "Approve work before creation",
    summary: "Review AI-suggested tasks with confidence, duplicate detection, and sprint mapping.",
    href: "/actions",
  },
  {
    step: "04",
    title: "Push into delivery systems",
    summary: "Sync approved work into Jira, Azure DevOps, or Asana and schedule follow-ups automatically.",
    href: "/delivery",
  },
  {
    step: "05",
    title: "Track risk and governance",
    summary: "Monitor slippage, accountability gaps, and unresolved dependencies as living program signals.",
    href: "/risks",
  },
  {
    step: "06",
    title: "Brief leadership continuously",
    summary: "Roll everything into executive summaries, PMO insights, and natural-language exploration.",
    href: "/executive",
  },
];

export const MODULE_CARDS: ModuleCard[] = [
  {
    href: "/minutes",
    title: "AI refined minutes",
    summary: "A three-panel review surface for transcript, refined notes, and extracted metadata.",
    bullets: ["Topic segmentation", "Decision logging", "Deadline and blocker capture"],
  },
  {
    href: "/actions",
    title: "Action approval workflow",
    summary: "Where program managers approve, merge, reject, and route execution items before system writes.",
    bullets: ["AI confidence", "Duplicate detection", "Epic and sprint recommendation"],
  },
  {
    href: "/delivery",
    title: "Delivery orchestration",
    summary: "Operational handoff across Jira, calendars, reminders, and downstream execution tooling.",
    bullets: ["Bi-directional sync", "Auto follow-up meetings", "Reminder and escalation hooks"],
  },
  {
    href: "/risks",
    title: "Program risk intelligence",
    summary: "Heatmaps, governance checks, and dependency visibility for delivery leaders.",
    bullets: ["Repeated blocker detection", "Owner drift", "Stakeholder sentiment signals"],
  },
];

export const MINUTES_TRANSCRIPT = [
  "Priya: Release 5.2 still depends on Treasury API timeout validation and a security approval for the new gateway path.",
  "John: I can validate the downstream timeout issue, but I need the infra firewall change before UAT can proceed.",
  "Asha: Security sign-off is stuck because the control evidence package has not been uploaded to SharePoint yet.",
  "Marcus: The customer enablement note is drafted, but we should not send it until the gateway path is stable.",
  "Priya: We need one owner for the evidence pack, one for the timeout fix, and a follow-up dependency meeting this week.",
];

export const MINUTES_REFINED: MinutesPanel[] = [
  {
    title: "Executive summary",
    body: [
      "The release review focused on two critical blockers: Treasury API timeout validation and pending security approval for the gateway cutover.",
      "The team aligned that UAT readiness cannot be declared until the infra firewall update is complete and the control evidence package is approved.",
    ],
  },
  {
    title: "Key decisions",
    body: [
      "Delay external customer communication until gateway stability is confirmed.",
      "Run a dependency review with Treasury, Infra, and Security within 48 hours.",
    ],
  },
  {
    title: "Follow-ups",
    body: [
      "John owns timeout validation after infra firewall completion.",
      "Asha owns the SharePoint evidence pack upload and approval chase.",
      "Priya owns the dependency review meeting and release checkpoint escalation if timelines slip.",
    ],
  },
];

export const MINUTES_METADATA: MetadataCard[] = [
  {
    label: "Tasks extracted",
    value: "6",
    detail: "4 task candidates, 2 governance checks",
  },
  {
    label: "Risks detected",
    value: "High",
    detail: "Security approval and infra dependency may block UAT",
  },
  {
    label: "Dependencies",
    value: "3",
    detail: "Treasury API, infra firewall, SharePoint evidence package",
  },
  {
    label: "Escalations",
    value: "2",
    detail: "Release slip warning and approval latency signal",
  },
  {
    label: "Owners resolved",
    value: "5 / 6",
    detail: "One governance reminder still needs a direct assignee",
  },
  {
    label: "AI confidence",
    value: "87%",
    detail: "Strong ownership detection, medium due-date certainty",
  },
];

export const ACTION_REVIEW_ITEMS: ActionReviewItem[] = [
  {
    id: "ACT-201",
    status: "suggested",
    title: "Validate downstream API timeout issue in Treasury gateway",
    owner: "John Smith",
    team: "Treasury Engineering",
    priority: "High",
    dueDate: "May 14",
    dependency: "Infra firewall update pending",
    risk: "Blocks UAT deployment if unresolved",
    confidence: "92%",
    duplicateSignal: "No Jira duplicate detected",
    sprintRecommendation: "Sprint 22",
    epicRecommendation: "Release 5.2 gateway readiness",
    jiraMapping: "Suggested as Story under REL-52 epic",
  },
  {
    id: "ACT-202",
    status: "suggested",
    title: "Upload control evidence package to SharePoint for security approval",
    owner: "Asha Menon",
    team: "Security PMO",
    priority: "High",
    dueDate: "May 13",
    dependency: "Evidence artifacts from controls team",
    risk: "Pending approval could delay release go-live decision",
    confidence: "88%",
    duplicateSignal: "Possible overlap with SEC-184 needs merge review",
    sprintRecommendation: "Sprint 22",
    epicRecommendation: "Release 5.2 compliance readiness",
    jiraMapping: "Suggested as Task mapped to SEC board",
  },
  {
    id: "ACT-203",
    status: "needs-review",
    title: "Schedule dependency review for Treasury, Infra, and Security",
    owner: "Priya Raman",
    team: "Program Management",
    priority: "Medium",
    dueDate: "May 12",
    dependency: "Attendee confirmation from three teams",
    risk: "Without alignment, blocker resolution may drift by a week",
    confidence: "94%",
    duplicateSignal: "No calendar event mapped yet",
    sprintRecommendation: "Operational cadence",
    epicRecommendation: "Release 5.2 unblockers",
    jiraMapping: "Recommend Outlook event plus Jira tracking task",
  },
  {
    id: "ACT-204",
    status: "needs-review",
    title: "Prepare customer enablement note once gateway stability is confirmed",
    owner: "Marcus Lee",
    team: "Customer Enablement",
    priority: "Medium",
    dueDate: "May 16",
    dependency: "Gateway validation and PM sign-off",
    risk: "Premature communication may create confusion for customers",
    confidence: "79%",
    duplicateSignal: "May merge with CSM-441 rollout note",
    sprintRecommendation: "Post-UAT handoff",
    epicRecommendation: "Release 5.2 launch readiness",
    jiraMapping: "Suggested as Task on enablement board",
  },
  {
    id: "ACT-205",
    status: "approved",
    title: "Escalate firewall change delay in daily release checkpoint",
    owner: "Nina Shah",
    team: "Infra Operations",
    priority: "High",
    dueDate: "May 11",
    dependency: "Release checkpoint attendance",
    risk: "Missed escalation extends critical path",
    confidence: "90%",
    duplicateSignal: "Linked to OPS-933",
    sprintRecommendation: "Sprint 22",
    epicRecommendation: "Release 5.2 gateway readiness",
    jiraMapping: "Ready to sync to existing Ops ticket",
  },
  {
    id: "ACT-206",
    status: "approved",
    title: "Audit unresolved owners and due dates from last 30 days",
    owner: "PMO Governance Bot",
    team: "PMO Office",
    priority: "Medium",
    dueDate: "May 17",
    dependency: "Historical meeting archive availability",
    risk: "Hidden accountability gaps remain invisible to leadership",
    confidence: "84%",
    duplicateSignal: "No existing governance ticket found",
    sprintRecommendation: "Governance backlog",
    epicRecommendation: "PMO operating cadence",
    jiraMapping: "Suggested as PMO task",
  },
];

export const DELIVERY_LANES: IntegrationLane[] = [
  {
    title: "Jira command lane",
    system: "Jira Software",
    status: "Bi-directional sync active",
    summary: "AI maps approved work into epic, story, bug, or task structures and watches status changes for follow-through updates.",
    fields: ["Sprint recommendation", "Assignee mapping", "Labels and story points", "Dependency linking"],
  },
  {
    title: "Execution follow-up lane",
    system: "Outlook and Teams",
    status: "Meeting automation ready",
    summary: "When unresolved blockers cluster, the copilot drafts a follow-up meeting, attendee list, agenda, and reminder sequence.",
    fields: ["Auto scheduling", "Reminder drafts", "Escalation suggestions", "Join-link creation"],
  },
  {
    title: "Portfolio sync lane",
    system: "Azure DevOps and Asana",
    status: "Connector blueprint",
    summary: "Cross-functional programs can push the same approved action set into the system that each delivery team already uses.",
    fields: ["Work-item type mapping", "Team routing", "Status reconciliation", "Portfolio roll-up"],
  },
];

export const RISK_SIGNALS: RiskSignal[] = [
  {
    team: "Treasury",
    category: "delivery",
    risk: "High",
    reason: "4 unresolved dependencies tied to release 5.2 gateway cutover.",
    nextAction: "Run 30-minute dependency review and lock owners.",
  },
  {
    team: "Infra",
    category: "delivery",
    risk: "Medium",
    reason: "Firewall SLA delays are pushing validation windows.",
    nextAction: "Escalate change ticket in daily release checkpoint.",
  },
  {
    team: "Security",
    category: "governance",
    risk: "High",
    reason: "Approval latency exceeds governance threshold for two consecutive meetings.",
    nextAction: "Upload evidence pack and request director review.",
  },
  {
    team: "PMO Office",
    category: "governance",
    risk: "Medium",
    reason: "7 action items have no confirmed due date in the last 14 days.",
    nextAction: "Trigger governance reminder and assign owners.",
  },
  {
    team: "Customer Success",
    category: "stakeholder",
    risk: "Low",
    reason: "Communication readiness is waiting on technical confirmation but sentiment is stable.",
    nextAction: "Hold release note until validation closes.",
  },
  {
    team: "Leadership",
    category: "stakeholder",
    risk: "Medium",
    reason: "Escalation language increased across three steering updates this week.",
    nextAction: "Provide concise executive summary with decision asks.",
  },
];

export const EXECUTIVE_HIGHLIGHTS: ExecutiveHighlight[] = [
  {
    title: "Weekly program summary",
    summary: "Release 5.2 remains on watch. Technical work is progressing, but security approval and infra firewall timing are the pacing items.",
    signal: "Leadership attention recommended",
  },
  {
    title: "Key achievement",
    summary: "AI-generated follow-up packs reduced PM prep time and surfaced owner gaps before Jira creation.",
    signal: "Efficiency gain",
  },
  {
    title: "Upcoming milestone",
    summary: "UAT readiness checkpoint is scheduled for May 15, dependent on blocker closure by May 14.",
    signal: "Milestone at risk",
  },
  {
    title: "Governance status",
    summary: "Owner coverage is strong overall, but due-date completeness still trails the PMO target in two teams.",
    signal: "Governance improving",
  },
];

export const CHAT_PROMPTS = [
  "What blockers are affecting release 5.2?",
  "Which teams are repeatedly delaying tasks?",
  "Show all unresolved action items from the last 30 days.",
  "Summarize delivery risks for leadership.",
  "Which Jira tickets originated from meetings?",
];
