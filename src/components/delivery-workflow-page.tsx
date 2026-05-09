"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FolderSync,
  Gauge,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRoundX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ActionItem, Confidence } from "@/lib/types";
import { useWorkflowSnapshot } from "@/lib/use-workflow-snapshot";

type StepCard = {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  summary: string;
  metrics: { label: string; value: string }[];
  checklist: string[];
  notes: { id: string; title: string; body: string }[];
};

type TimelineEvent = {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
  tone: "good" | "watch" | "risk" | "neutral";
};

type InsightSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: string[];
};

const STAGE_META = [
  {
    id: "upload",
    title: "Upload Meeting",
    detail: "Normalize transcript and source evidence.",
    icon: Upload,
  },
  {
    id: "analysis",
    title: "AI Analysis",
    detail: "Extract actions, decisions, and owners.",
    icon: Sparkles,
  },
  {
    id: "review",
    title: "Review Actions",
    detail: "Keep PM approval in the loop.",
    icon: ClipboardCheck,
  },
  {
    id: "jira",
    title: "Jira Sync",
    detail: "Route approved work into delivery tooling.",
    icon: FolderSync,
  },
  {
    id: "risk",
    title: "Risk Detection",
    detail: "Surface blockers and slip signals.",
    icon: CircleAlert,
  },
  {
    id: "followup",
    title: "Follow-up",
    detail: "Schedule cadence and reminders.",
    icon: CalendarClock,
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function requiresReview(item: ActionItem) {
  return item.confidence !== "High" || !item.suggestedDueDate || item.blockers.length > 1;
}

function confidenceScore(items: ActionItem[]) {
  if (!items.length) {
    return 0;
  }

  const weights: Record<Confidence, number> = {
    High: 92,
    Medium: 76,
    Low: 58,
  };

  return Math.round(items.reduce((sum, item) => sum + weights[item.confidence], 0) / items.length);
}

function relativeTime(updatedAt: string | null) {
  if (!updatedAt) {
    return "just now";
  }

  const minutes = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60000);
  if (minutes <= 0) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-slate-100">
      <span>AI is reasoning</span>
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-slate-100"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -1, 0] }}
          transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, delay: dot * 0.14 }}
        />
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200/80" />
      <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/70" />
        ))}
      </div>
    </div>
  );
}

export function DeliveryWorkflowPage() {
  const {
    workflowSession,
    hasAnalysis,
    hasTranscript,
    isJiraReady,
    isOutlookReady,
  } = useWorkflowSnapshot();
  const [manualStageIndex, setManualStageIndex] = useState<number | null>(null);
  const [stageLoading, setStageLoading] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const timeoutRef = useRef<number | null>(null);

  const transcriptPreview = useMemo(
    () =>
      workflowSession.transcript
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4),
    [workflowSession.transcript],
  );

  const model = useMemo(() => {
    const analysis = workflowSession.analysis;
    const actionItems = analysis?.actionItems ?? [];
    const reviewItems = actionItems.filter(requiresReview);
    const readyItems = actionItems.filter((item) => !requiresReview(item));
    const blockers = Array.from(new Set(actionItems.flatMap((item) => item.blockers).filter(Boolean)));
    const missingOwners = actionItems.filter(
      (item) => !item.ownerName.trim() || /tbd|unassigned|owner/i.test(item.ownerName),
    );
    const score = confidenceScore(actionItems);
    const linkedStories =
      analysis?.deliveryPlan.epics.reduce((sum, epic) => sum + epic.stories.length, 0) ?? 0;
    const wordCount = workflowSession.transcript.trim()
      ? workflowSession.transcript.trim().split(/\s+/).filter(Boolean).length
      : 0;

    const steps: StepCard[] = [
      {
        ...STAGE_META[0],
        summary: hasTranscript
          ? `${workflowSession.selectedFileName ?? "Meeting transcript"} is now the live source of truth for the delivery workflow.`
          : "Upload or import a meeting to start the workflow.",
        metrics: [
          { label: "Source file", value: workflowSession.selectedFileName ?? "Not uploaded" },
          { label: "Preview lines", value: `${transcriptPreview.length}` },
          { label: "Transcript words", value: `${wordCount}` },
        ],
        checklist: hasTranscript
          ? [
              workflowSession.sourceMessage ?? "Meeting source captured successfully.",
              "The uploaded source is visible again here so the workflow stays transparent.",
              `${wordCount} transcript words are ready for downstream analysis.`,
            ]
          : [
              "No source has been uploaded yet.",
              "Import a transcript, audio file, or meeting export to activate the workflow.",
              "The app will show the uploaded source clearly once a file is present.",
            ],
        notes: [
          {
            id: "upload-source",
            title: "Source integrity",
            body: hasTranscript
              ? "The current meeting session is persisted and reused across minutes, actions, and delivery."
              : "Once a meeting is uploaded, the assistant will preserve the file name, import note, and transcript preview.",
          },
          {
            id: "upload-preview",
            title: "Preview evidence",
            body: transcriptPreview.length ? transcriptPreview.join(" ") : "No transcript preview is available yet.",
          },
        ],
      },
      {
        ...STAGE_META[1],
        summary: hasAnalysis
          ? `${analysis?.meetingTitle ?? "This meeting"} has been transformed into structured execution intelligence.`
          : "Run AI analysis in the workspace to generate minutes, actions, and delivery signals.",
        metrics: [
          { label: "Action items", value: `${actionItems.length}` },
          { label: "Agenda sections", value: `${analysis?.agendaSections.length ?? 0}` },
          { label: "Participants", value: `${analysis?.participants.length ?? 0}` },
        ],
        checklist: hasAnalysis
          ? [
              `${actionItems.length} action item${actionItems.length === 1 ? "" : "s"} extracted.`,
              `${analysis?.agendaSections.length ?? 0} agenda section${analysis?.agendaSections.length === 1 ? "" : "s"} detected.`,
              analysis?.conciseSummary ?? "Refined meeting summary captured.",
            ]
          : [
              "No analysis output is available yet.",
              "The assistant will turn the transcript into refined minutes and action intelligence.",
              "Friendly loading states appear here during AI processing.",
            ],
        notes: [
          {
            id: "analysis-summary",
            title: "Refined summary",
            body: analysis?.conciseSummary ?? "No refined summary is available yet.",
          },
          {
            id: "analysis-next",
            title: "Recommended next step",
            body: analysis?.recommendedNextStep ?? "The assistant will recommend the next move after analysis.",
          },
        ],
      },
      {
        ...STAGE_META[2],
        summary: hasAnalysis
          ? `${reviewItems.length} action item${reviewItems.length === 1 ? "" : "s"} still need PM review before sync.`
          : "Approval stays human-in-the-loop once actions have been extracted.",
        metrics: [
          { label: "Needs review", value: `${reviewItems.length}` },
          { label: "Ready to sync", value: `${readyItems.length}` },
          { label: "Missing owners", value: `${missingOwners.length}` },
        ],
        checklist: hasAnalysis
          ? [
              `${reviewItems.length} item${reviewItems.length === 1 ? "" : "s"} need confidence, blocker, or due-date review.`,
              `${readyItems.length} item${readyItems.length === 1 ? " is" : "s are"} clean enough to move forward.`,
              missingOwners.length
                ? `${missingOwners.length} item${missingOwners.length === 1 ? "" : "s"} still need a clearer owner.`
                : "Every current task has an owner attached.",
            ]
          : [
              "The review lane activates after AI analysis finishes.",
              "This stage will split actions into review and ready lanes.",
              "Governance stays visible before any production sync happens.",
            ],
        notes: [
          {
            id: "review-governance",
            title: "Governance checks",
            body: hasAnalysis
              ? "Each task is checked for ownership, due date, confidence, and blocker quality before sync."
              : "Governance checks appear here after the assistant extracts real action items.",
          },
          {
            id: "review-samples",
            title: "Review queue samples",
            body: reviewItems.length
              ? reviewItems.slice(0, 2).map((item) => `${item.referenceId}: ${item.title}`).join(" | ")
              : "No unresolved review items remain in the current queue.",
          },
        ],
      },
      {
        ...STAGE_META[3],
        summary: hasAnalysis
          ? isJiraReady
            ? `Jira is connected and ${analysis?.deliveryPlan.epics.length ?? 0} epic plan${analysis?.deliveryPlan.epics.length === 1 ? " is" : "s are"} ready for routing.`
            : "The delivery plan is ready, but Jira still needs to be connected before write-back can proceed."
          : "Delivery tool routing becomes available after the assistant builds a real plan.",
        metrics: [
          { label: "Epic drafts", value: `${analysis?.deliveryPlan.epics.length ?? 0}` },
          { label: "Story drafts", value: `${linkedStories}` },
          { label: "Jira status", value: isJiraReady ? "Connected" : "Pending" },
        ],
        checklist: hasAnalysis
          ? [
              `${analysis?.deliveryPlan.epics.length ?? 0} epic draft${analysis?.deliveryPlan.epics.length === 1 ? "" : "s"} are ready for sync.`,
              `${linkedStories} story draft${linkedStories === 1 ? "" : "s"} are nested under the current plan.`,
              isJiraReady
                ? "Jira settings are connected, so approved work can move into delivery boards."
                : "Connect Jira settings in the workspace before the assistant can create delivery tickets.",
            ]
          : [
              "No delivery plan is available yet.",
              "The assistant will map work into epics and stories after analysis.",
              "This stage will show real sync readiness instead of demo data.",
            ],
        notes: [
          {
            id: "jira-overview",
            title: "Routing overview",
            body:
              analysis?.deliveryPlan.overview ??
              "Routing details will appear here once the assistant builds a delivery plan.",
          },
          {
            id: "jira-readiness",
            title: "Integration readiness",
            body: isJiraReady
              ? "The Jira connection is in place, so the sync lane can proceed once approvals are complete."
              : "Add site URL, email, API token, and project key in workspace settings to enable Jira sync.",
          },
        ],
      },
      {
        ...STAGE_META[4],
        summary: hasAnalysis
          ? blockers.length
            ? `${blockers.length} blocker signal${blockers.length === 1 ? " is" : "s are"} shaping the current delivery risk posture.`
            : `No blockers were explicitly extracted, but the assistant is still monitoring overall risk: ${analysis?.overallRisk ?? "No risk summary yet."}`
          : "Risk detection activates after the assistant extracts blockers and dependencies.",
        metrics: [
          { label: "Blockers", value: `${blockers.length}` },
          {
            label: "High priority",
            value: `${actionItems.filter((item) => item.priority === "High").length}`,
          },
          { label: "Risk posture", value: hasAnalysis ? "Active" : "Pending" },
        ],
        checklist: hasAnalysis
          ? [
              analysis?.overallRisk ?? "Overall risk will appear here once analysis completes.",
              blockers.length
                ? `Current blocker focus: ${blockers.slice(0, 2).join("; ")}`
                : "No blockers are currently attached to the extracted action items.",
              reviewItems.length
                ? "Review-lane items are still contributing to delivery uncertainty."
                : "The review queue is clear, so risk is concentrated in downstream execution.",
            ]
          : [
              "No risk signals exist until analysis runs.",
              "The assistant will highlight blockers, delays, and accountability gaps here.",
              "This stage becomes the operating heatmap for delivery risk.",
            ],
        notes: [
          {
            id: "risk-blockers",
            title: "Blocker register",
            body: blockers.length ? blockers.join(" | ") : "No blockers are currently attached to the extracted tasks.",
          },
          {
            id: "risk-guidance",
            title: "AI guidance",
            body: analysis?.overallRisk ?? "Risk guidance will appear here once the assistant processes the meeting.",
          },
        ],
      },
      {
        ...STAGE_META[5],
        summary: hasAnalysis
          ? analysis?.followUpMeeting.shouldSchedule
            ? `${analysis.followUpMeeting.title} is recommended to keep ${analysis.followUpMeeting.attendees.length} attendee${analysis.followUpMeeting.attendees.length === 1 ? "" : "s"} aligned on execution.`
            : "No extra meeting is required right now, so reminders and dashboards can carry the follow-through."
          : "Follow-up automation appears once analysis recommends a meeting or reminder cadence.",
        metrics: [
          { label: "Suggested attendees", value: `${analysis?.followUpMeeting.attendees.length ?? 0}` },
          {
            label: "Duration",
            value: analysis?.followUpMeeting.shouldSchedule
              ? `${analysis.followUpMeeting.suggestedDurationMinutes} min`
              : "Not needed",
          },
          { label: "Calendar status", value: isOutlookReady ? "Connected" : "Pending" },
        ],
        checklist: hasAnalysis
          ? [
              analysis?.followUpMeeting.summary ?? "No follow-up recommendation is available yet.",
              analysis?.followUpMeeting.shouldSchedule
                ? `${analysis.followUpMeeting.suggestedDurationMinutes} minute follow-up recommended within ${analysis.followUpMeeting.targetWithinDays ?? analysis.followUpMeeting.recommendedOffsetDays ?? 0} day(s).`
                : "The assistant recommends no new meeting right now.",
              isOutlookReady
                ? "Calendar credentials are connected for scheduling and reminders."
                : "Connect calendar settings if you want the assistant to schedule follow-up automatically.",
            ]
          : [
              "No follow-up plan exists until the assistant processes the meeting.",
              "The assistant will recommend reminders, scheduling, or an executive note here.",
              "Calendar automation becomes available once settings are connected.",
            ],
        notes: [
          {
            id: "followup-rationale",
            title: "Follow-up rationale",
            body:
              analysis?.followUpMeeting.rationale ??
              "Follow-up reasoning will appear here once the assistant detects a need for extra coordination.",
          },
          {
            id: "followup-agenda",
            title: "Proposed agenda",
            body: analysis?.followUpMeeting.agenda.length
              ? analysis.followUpMeeting.agenda.join(" | ")
              : "No follow-up agenda has been proposed yet.",
          },
        ],
      },
    ];

    const timeline: TimelineEvent[] = [
      {
        id: "upload",
        title: hasTranscript ? "Meeting source loaded" : "Waiting for meeting source",
        detail: hasTranscript
          ? `${workflowSession.selectedFileName ?? "Meeting transcript"} is now the active source.`
          : "Upload or import a transcript to start the workflow.",
        time: relativeTime(workflowSession.updatedAt),
        icon: Upload,
        tone: hasTranscript ? "good" : "neutral",
      },
      {
        id: "analysis",
        title: hasAnalysis ? `AI analyzed ${analysis?.meetingTitle ?? "meeting"}` : "AI analysis pending",
        detail: hasAnalysis
          ? `${actionItems.length} task${actionItems.length === 1 ? "" : "s"} and ${analysis?.agendaSections.length ?? 0} agenda thread${analysis?.agendaSections.length === 1 ? "" : "s"} were extracted.`
          : "Run analysis from the workspace to populate structured meeting intelligence.",
        time: relativeTime(workflowSession.updatedAt),
        icon: Sparkles,
        tone: hasAnalysis ? "good" : "neutral",
      },
      {
        id: "review",
        title: reviewItems.length ? "PM review is required" : "Action queue is ready",
        detail: reviewItems.length
          ? `${reviewItems.length} task${reviewItems.length === 1 ? "" : "s"} still need PM clarification before sync.`
          : hasAnalysis
            ? "Current action items are clean enough to move downstream."
            : "The review lane activates after AI analysis.",
        time: relativeTime(workflowSession.updatedAt),
        icon: ClipboardCheck,
        tone: reviewItems.length ? "watch" : hasAnalysis ? "good" : "neutral",
      },
      {
        id: "risk",
        title: blockers.length ? "Risk signal detected" : "Risk posture stable",
        detail: blockers.length
          ? blockers[0]
          : hasAnalysis
            ? analysis?.overallRisk ?? "No explicit blocker has surfaced yet."
            : "Risk detection becomes active after analysis.",
        time: relativeTime(workflowSession.updatedAt),
        icon: AlertTriangle,
        tone: blockers.length ? "risk" : hasAnalysis ? "good" : "neutral",
      },
      {
        id: "followup",
        title: analysis?.followUpMeeting.shouldSchedule ? "Follow-up suggested" : "No extra meeting needed yet",
        detail: analysis?.followUpMeeting.shouldSchedule
          ? `${analysis.followUpMeeting.title} is recommended with ${analysis.followUpMeeting.attendees.length} attendee${analysis.followUpMeeting.attendees.length === 1 ? "" : "s"}.`
          : hasAnalysis
            ? "The assistant can rely on reminders and dashboards instead of creating another meeting."
            : "Follow-up guidance appears after analysis is complete.",
        time: relativeTime(workflowSession.updatedAt),
        icon: CalendarClock,
        tone: analysis?.followUpMeeting.shouldSchedule ? "watch" : hasAnalysis ? "good" : "neutral",
      },
    ];

    const insights: InsightSection[] = [
      {
        id: "risks",
        title: "Risks detected",
        icon: AlertTriangle,
        items: hasAnalysis
          ? [analysis?.overallRisk ?? "Overall risk is not available yet.", ...blockers.slice(0, 2)]
          : ["Risk insights will appear after the meeting is analyzed."],
      },
      {
        id: "owners",
        title: "Missing owners",
        icon: UserRoundX,
        items: missingOwners.length
          ? missingOwners.map((item) => `${item.referenceId}: ${item.title}`)
          : [hasAnalysis ? "No owner gaps are currently open in the action queue." : "Owner intelligence will appear after analysis."],
      },
      {
        id: "recommendations",
        title: "AI recommendations",
        icon: Bot,
        items: hasAnalysis
          ? [
              analysis?.recommendedNextStep ?? "The assistant will recommend the next move after analysis.",
              reviewItems.length ? "Resolve review-lane items before writing into Jira." : "The action queue is clean enough to progress downstream.",
              isOutlookReady ? "Calendar automation is available for follow-up." : "Connect calendar settings to automate follow-up.",
            ]
          : ["Recommendations will appear after the workflow has real meeting data."],
      },
      {
        id: "confidence",
        title: "Delivery confidence",
        icon: Gauge,
        items: hasAnalysis
          ? [
              `Overall delivery confidence is ${Math.max(score, blockers.length ? score - 6 : score)}%.`,
              isJiraReady ? "Jira is connected for execution handoff." : "Jira connection is still pending.",
              reviewItems.length ? `${reviewItems.length} review item(s) are reducing automation confidence.` : "The review queue is clear.",
            ]
          : ["Confidence scoring becomes available after analysis."],
      },
    ];

    const startingIndex = !hasTranscript
      ? 0
      : !hasAnalysis
        ? 1
        : reviewItems.length
          ? 2
          : !isJiraReady
            ? 3
            : blockers.length
              ? 4
              : 5;

    return {
      steps,
      timeline,
      insights,
      signals: [
        ["Source status", hasTranscript ? "Loaded" : "Waiting"],
        ["Review queue", reviewItems.length ? `${reviewItems.length} open` : hasAnalysis ? "Clear" : "Pending"],
        ["Jira sync", isJiraReady ? "Connected" : "Not connected"],
        ["Follow-up", analysis?.followUpMeeting.shouldSchedule ? "Suggested" : hasAnalysis ? "Not needed" : "Pending"],
      ] as const,
      startingIndex,
      confidence: Math.max(score, blockers.length ? score - 6 : score),
      followUpTitle: analysis?.followUpMeeting.title ?? "No follow-up meeting suggested",
      sourceLabel: workflowSession.selectedFileName ?? "Transcript workspace",
      sourceNote:
        workflowSession.sourceMessage ??
        "This lane uses the latest uploaded meeting session as the source of truth for delivery orchestration.",
    };
  }, [
    hasAnalysis,
    hasTranscript,
    isJiraReady,
    isOutlookReady,
    transcriptPreview,
    workflowSession.analysis,
    workflowSession.selectedFileName,
    workflowSession.sourceMessage,
    workflowSession.transcript,
    workflowSession.updatedAt,
  ]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const activeIndex = Math.min(
    manualStageIndex ?? model.startingIndex,
    model.steps.length - 1,
  );

  const workflow = useMemo(
    () =>
      model.steps.map((step, index) => ({
        ...step,
        status:
          index < activeIndex
            ? "complete"
            : index === activeIndex
              ? "active"
              : "upcoming",
      })),
    [activeIndex, model.steps],
  );

  const activeStep = workflow[Math.min(activeIndex, workflow.length - 1)] ?? workflow[0];

  function openCommandBar() {
    window.dispatchEvent(new Event("open-command-bar"));
  }

  function activateStep(nextIndex: number) {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setStageLoading(true);
    setManualStageIndex(nextIndex);
    timeoutRef.current = window.setTimeout(() => {
      setStageLoading(false);
      timeoutRef.current = null;
    }, 450);
  }

  function advanceWorkflow() {
    activateStep(Math.min(activeIndex + 1, workflow.length - 1));
  }

  if (!hasTranscript) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-[960px] rounded-3xl border border-white/20 bg-white/70 p-8 shadow-lg shadow-black/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Upload className="h-4 w-4" />
            Delivery workflow waiting for a source
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Upload a meeting first</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            The delivery console now binds to real workflow data. Once you upload or
            import a meeting in the workspace, this page will light up with actual
            transcript, action, sync, risk, and follow-up signals.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/10"
            >
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/minutes"
              className="inline-flex items-center rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-lg shadow-black/5"
            >
              View minutes shell
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-10 pt-4 lg:px-6">
        <motion.header
          className="sticky top-4 z-30 rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 backdrop-blur-md"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Autonomous PMO Copilot
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-xs text-slate-500">
                  Delivery workflow orchestrator
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
                Guided delivery execution
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                The assistant is operating delivery management step by step with your
                live meeting session, not seeded demo cards.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openCommandBar}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 shadow-lg shadow-black/5 transition hover:-translate-y-0.5"
              >
                <Search className="h-4 w-4" />
                Command bar
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
                  Ctrl/Cmd + K
                </span>
              </button>
              <button
                type="button"
                onClick={advanceWorkflow}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
              >
                Advance workflow
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.header>

        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
            <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
              <p className="text-sm text-slate-500">Workflow mission</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{model.sourceLabel}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">{model.sourceNote}</p>
            </section>

            <nav className="rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 backdrop-blur-md">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Workflow map
              </div>
              <div className="space-y-2">
                {workflow.map((step, index) => {
                  const Icon = step.icon;
                  const isCurrent = index === activeIndex;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => activateStep(index)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition",
                        isCurrent ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white/70",
                      )}
                    >
                      <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", isCurrent ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600")}>
                        {step.status === "complete" ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{step.title}</span>
                        <span className={cn("mt-1 block text-xs leading-5", isCurrent ? "text-slate-300" : "text-slate-500")}>
                          {step.detail}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 backdrop-blur-md">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Orchestration signals
              </div>
              <div className="space-y-3">
                {model.signals.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
          <main className="min-w-0 space-y-6">
            <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
              <div>
                <p className="text-sm text-slate-500">Workflow progress</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Step-by-step delivery progression
                </h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-6">
                {workflow.map((step, index) => {
                  const Icon = step.icon;
                  const isCurrent = index === activeIndex;
                  const isComplete = step.status === "complete";
                  return (
                    <motion.button
                      key={step.id}
                      type="button"
                      onClick={() => activateStep(index)}
                      whileHover={{ y: -4 }}
                      className={cn(
                        "relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-4 text-left shadow-lg shadow-black/5 transition",
                        isCurrent && "bg-slate-950 text-white",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", isCurrent ? "bg-white/10 text-white" : isComplete ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                          {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </span>
                        <span className={cn("text-xs font-medium", isCurrent ? "text-slate-200" : "text-slate-400")}>
                          0{index + 1}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-medium">{step.title}</p>
                      <p className={cn("mt-2 text-xs leading-5", isCurrent ? "text-slate-300" : "text-slate-500")}>
                        {step.detail}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Primary workflow stage</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{activeStep.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                    {activeStep.summary}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {stageLoading ? (
                    <TypingIndicator />
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {model.confidence}% confidence
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {stageLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <LoadingState />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={activeStep.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-6"
                    >
                      <div className="grid gap-3 md:grid-cols-3">
                        {activeStep.metrics.map((metric) => (
                          <motion.div key={metric.label} whileHover={{ y: -4 }} className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5">
                            <p className="text-sm text-slate-500">{metric.label}</p>
                            <p className="mt-3 break-words text-2xl font-semibold text-slate-950">{metric.value}</p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                        <article className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5">
                          <p className="text-sm text-slate-500">Execution checklist</p>
                          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Primary actions</h3>
                          <div className="mt-6 space-y-3">
                            {activeStep.checklist.map((item) => (
                              <motion.div key={item} whileHover={{ y: -2 }} className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-lg shadow-black/5">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                                <span className="text-sm leading-7 text-slate-700">{item}</span>
                              </motion.div>
                            ))}
                          </div>
                        </article>

                        <article className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg shadow-black/10">
                          <p className="text-sm text-slate-300">AI operating note</p>
                          <h3 className="mt-2 text-2xl font-semibold">Why this stage matters</h3>
                          <p className="mt-4 text-sm leading-7 text-slate-300">
                            This experience is now driven by the same uploaded meeting session across
                            workspace, minutes, actions, and delivery, so the AI is guiding execution
                            instead of replaying demo content.
                          </p>
                          <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
                            <TypingIndicator />
                            <p className="mt-4 text-sm leading-7 text-slate-300">
                              {activeStep.notes[0]?.body ?? "AI guidance will appear here for the active stage."}
                            </p>
                          </div>
                        </article>
                      </div>

                      <div className="space-y-3">
                        {activeStep.notes.map((note, noteIndex) => {
                          const isOpen = expandedNotes[note.id] ?? noteIndex === 0;
                          return (
                            <div key={note.id} className="overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-lg shadow-black/5">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedNotes((current) => ({ ...current, [note.id]: !current[note.id] }))
                                }
                                className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left"
                              >
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{note.title}</p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Secondary details stay collapsible to keep the workflow focused.
                                  </p>
                                </div>
                                {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                              </button>
                              <AnimatePresence initial={false}>
                                {isOpen ? (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-6 pb-6 text-sm leading-7 text-slate-600">{note.body}</div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Workflow timeline</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Live activity stream</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Updating in real time
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {model.timeline.map((event) => {
                  const Icon = event.icon;
                  return (
                    <motion.div key={event.id} whileHover={{ y: -3 }} className="relative rounded-2xl border border-white/20 bg-white/80 p-5 shadow-lg shadow-black/5">
                      <div className="flex items-start gap-4">
                        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", event.tone === "good" && "bg-emerald-50 text-emerald-600", event.tone === "watch" && "bg-amber-50 text-amber-600", event.tone === "risk" && "bg-rose-50 text-rose-600", event.tone === "neutral" && "bg-slate-100 text-slate-600")}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm font-medium text-slate-900">{event.title}</p>
                            <span className="text-xs text-slate-400">{event.time}</span>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-500">{event.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </main>

          <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
            <section className="overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-lg shadow-black/10">
              <div className="border-b border-white/10 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-300">AI insights</p>
                    <h2 className="mt-2 text-2xl font-semibold">Execution assistant</h2>
                  </div>
                  <TypingIndicator />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Compact, sticky, and tied to your live workflow session so the assistant can
                  guide delivery without cluttering the main canvas.
                </p>
              </div>
              <div className="space-y-3 p-4">
                {model.insights.map((section) => {
                  const Icon = section.icon;
                  const isOpen = expandedInsights[section.id] ?? true;
                  return (
                    <div key={section.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedInsights((current) => ({ ...current, [section.id]: !current[section.id] }))
                        }
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>
                            <span className="block text-sm font-medium">{section.title}</span>
                            <span className="mt-1 block text-xs text-slate-300">AI-curated delivery signal</span>
                          </span>
                        </span>
                        {isOpen ? <ChevronDown className="h-4 w-4 text-slate-300" /> : <ChevronRight className="h-4 w-4 text-slate-300" />}
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 px-4 pb-4">
                              {section.items.map((item) => (
                                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm leading-7 text-slate-200">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-md">
              <p className="text-sm text-slate-500">Intelligent next move</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">{model.followUpTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                The assistant is sequencing the workflow around the latest meeting output. You
                can reopen minutes or action review without losing this delivery context.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={advanceWorkflow}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
                >
                  Continue workflow
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  href="/actions"
                  className="inline-flex items-center rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-lg shadow-black/5"
                >
                  Open action review
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
