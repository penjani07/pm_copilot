export type PlaybookCategory = "rituals" | "launches" | "docs";
export type BriefingStatus = "at-risk" | "scheduled" | "shipped";

export type Playbook = {
  slug: string;
  title: string;
  category: PlaybookCategory;
  audience: string;
  cadence: string;
  summary: string;
  checkpoints: string[];
};

export type Briefing = {
  id: string;
  status: BriefingStatus;
  title: string;
  owner: string;
  timeWindow: string;
  signal: string;
  summary: string;
};

export const PLAYBOOKS: Playbook[] = [
  {
    slug: "customer-onboarding-refresh",
    title: "Customer onboarding refresh",
    category: "launches",
    audience: "Product, support, enablement",
    cadence: "2-week launch run",
    summary:
      "Coordinates content updates, screenshot approvals, rollout notes, and support readiness for onboarding changes.",
    checkpoints: [
      "Approve revised setup copy and screenshots.",
      "Stage the knowledge base update before the training date.",
      "Ship a customer success note with support escalation paths.",
    ],
  },
  {
    slug: "weekly-delivery-sync",
    title: "Weekly delivery sync",
    category: "rituals",
    audience: "Engineering, product, design",
    cadence: "Weekly",
    summary:
      "Turns recurring team syncs into a trackable operating rhythm with owners, risks, and a follow-up checklist.",
    checkpoints: [
      "Capture blockers with owners and dates.",
      "Promote cross-team dependencies into Jira within one business day.",
      "Close the loop with a written recap and next-step note.",
    ],
  },
  {
    slug: "incident-follow-up-brief",
    title: "Incident follow-up brief",
    category: "docs",
    audience: "Engineering leadership and support",
    cadence: "As needed",
    summary:
      "Packages the post-incident recap into a concise, accountable brief that is ready for internal distribution.",
    checkpoints: [
      "Summarize impact, timeline, and root cause.",
      "Assign preventive work with acceptance criteria.",
      "Schedule a follow-up review with required stakeholders.",
    ],
  },
  {
    slug: "beta-rollout-command-center",
    title: "Beta rollout command center",
    category: "launches",
    audience: "Product marketing and CX",
    cadence: "4-week rollout",
    summary:
      "Keeps beta launches aligned across onboarding, comms, risk tracking, and daily rollout signals.",
    checkpoints: [
      "Lock target accounts and owner coverage.",
      "Publish launch-day comms and support FAQ.",
      "Review opt-in signals and escalation triggers each morning.",
    ],
  },
  {
    slug: "decision-log-pack",
    title: "Decision log pack",
    category: "docs",
    audience: "Program and PM leadership",
    cadence: "Continuous",
    summary:
      "Creates a reusable bundle for documenting decisions, tradeoffs, and downstream owner commitments.",
    checkpoints: [
      "Tag each decision with impacted teams.",
      "Attach unresolved questions to the next checkpoint review.",
      "Export action items into the working board.",
    ],
  },
  {
    slug: "monthly-exec-standup",
    title: "Monthly exec standup",
    category: "rituals",
    audience: "Leadership and delivery leads",
    cadence: "Monthly",
    summary:
      "Condenses multiple team updates into a clear leadership-ready sequence of wins, risks, and asks.",
    checkpoints: [
      "Highlight progress against the quarter theme.",
      "Escalate red risks with explicit help needed.",
      "Roll commitments into the following month plan.",
    ],
  },
];

export const BRIEFINGS: Briefing[] = [
  {
    id: "BR-101",
    status: "at-risk",
    title: "Workspace invite fix",
    owner: "Devon Rao",
    timeWindow: "Due May 4",
    signal: "Support volume elevated",
    summary:
      "Invite analytics are still blocking support workflows, and the patch needs paired validation before release.",
  },
  {
    id: "BR-102",
    status: "scheduled",
    title: "Onboarding checklist refresh",
    owner: "Marcus Lee",
    timeWindow: "Training on May 7",
    signal: "Assets pending approval",
    summary:
      "Copy revisions are on track, but design approval for the screenshot set remains the pacing item.",
  },
  {
    id: "BR-103",
    status: "shipped",
    title: "Knowledge base alignment",
    owner: "Lena Ortiz",
    timeWindow: "Published Apr 29",
    signal: "Support handoff complete",
    summary:
      "The KB article was refreshed with the new setup path and linked to the support macros already in use.",
  },
  {
    id: "BR-104",
    status: "at-risk",
    title: "Partner beta outreach",
    owner: "Jalen Brooks",
    timeWindow: "Starts May 10",
    signal: "Target list incomplete",
    summary:
      "The outreach plan has messaging ready, but target-account confirmation from sales ops has slipped by two days.",
  },
  {
    id: "BR-105",
    status: "scheduled",
    title: "Risk review workshop",
    owner: "Nina Shah",
    timeWindow: "May 8 at 10:00",
    signal: "Cross-team attendance confirmed",
    summary:
      "Engineering, CX, and program leads are booked for a single-session review of the current release blockers.",
  },
  {
    id: "BR-106",
    status: "shipped",
    title: "Customer success rollout note",
    owner: "Priya Desai",
    timeWindow: "Sent May 1",
    signal: "Field enablement complete",
    summary:
      "Customer success received the rollout sequence, risk callouts, and direct support escalation guidance.",
  },
  {
    id: "BR-107",
    status: "at-risk",
    title: "API adoption scorecard",
    owner: "Marta Singh",
    timeWindow: "Quarter close",
    signal: "Telemetry gaps open",
    summary:
      "A usable scorecard exists, but the current dashboard still misses partner-side event coverage for activation funnels.",
  },
  {
    id: "BR-108",
    status: "scheduled",
    title: "Migration pilot standup",
    owner: "Owen Park",
    timeWindow: "Every Tuesday",
    signal: "Cadence reset this week",
    summary:
      "The pilot team is moving to a tighter weekly standup with explicit decision logging and issue triage owners.",
  },
  {
    id: "BR-109",
    status: "shipped",
    title: "Release checklist cleanup",
    owner: "Cara Nguyen",
    timeWindow: "Closed Apr 26",
    signal: "Template updated",
    summary:
      "The release checklist now includes rollback contacts, comms gates, and clearer preflight verification steps.",
  },
];
