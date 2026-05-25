"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  CornerDownRight,
  Play,
  Sliders,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { ActionItem, Confidence } from "@/lib/types";
import { useWorkflowSnapshot } from "@/lib/use-workflow-snapshot";
import { DonutGauge, SegmentedBar } from "@/components/visual-metrics";

const WORKFLOW_STEPS = [
  { name: "Upload Meeting", desc: "Source evidence" },
  { name: "AI Analysis", desc: "Extract actions" },
  { name: "Review Actions", desc: "PM validation loop" },
  { name: "Jira Sync", desc: "Automated routing" },
  { name: "Risk Detection", desc: "Surface blockers" },
  { name: "Follow-up", desc: "Schedules & alerts" },
] as const;

function requiresReview(item: ActionItem) {
  return item.confidence !== "High" || !item.suggestedDueDate || item.blockers.length > 1;
}

function confidenceScore(items: ActionItem[]) {
  if (!items.length) {
    return 82;
  }

  const weights: Record<Confidence, number> = {
    High: 92,
    Medium: 76,
    Low: 58,
  };

  return Math.round(items.reduce((sum, item) => sum + weights[item.confidence], 0) / items.length);
}

function getRelativeTime(updatedAt: string | null) {
  if (!updatedAt) {
    return "just now";
  }

  const minutes = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60000);
  if (minutes <= 0) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

type StepState = "done" | "active" | "pending";

function getStepState(index: number, activeIndex: number): StepState {
  if (index < activeIndex) {
    return "done";
  }

  return index === activeIndex ? "active" : "pending";
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />;
  }

  if (state === "active") {
    return <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />;
  }

  return <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />;
}

export function DeliveryWorkflowPage() {
  const {
    workflowSession,
    hasAnalysis,
    hasTranscript,
    isJiraReady,
    isOutlookReady,
  } = useWorkflowSnapshot();

  const model = useMemo(() => {
    const analysis = workflowSession.analysis;
    const actionItems = analysis?.actionItems ?? [];
    const reviewItems = actionItems.filter(requiresReview);
    const readyItems = actionItems.filter((item) => !requiresReview(item));
    const missingOwners = actionItems.filter(
      (item) => !item.ownerName.trim() || /tbd|unassigned|owner/i.test(item.ownerName),
    );
    const blockers = Array.from(new Set(actionItems.flatMap((item) => item.blockers).filter(Boolean)));
    const confidence = confidenceScore(actionItems);
    const sourceName = workflowSession.selectedFileName ?? "sample-transcript.txt";

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
      actionItems,
      blockers,
      confidence,
      missingOwners,
      readyItems,
      reviewItems,
      sourceName,
      startingIndex,
      activity: [
        {
          title: hasTranscript ? "Meeting source loaded" : "Waiting for meeting source",
          meta: hasTranscript
            ? `${sourceName} is now the active workspace context.`
            : "Upload or import a source meeting to activate the delivery workflow.",
          time: getRelativeTime(workflowSession.updatedAt),
        },
        {
          title: hasAnalysis
            ? `AI analyzed ${analysis?.meetingTitle ?? "Weekly Product Delivery Sync"}`
            : "AI analysis pending",
          meta: hasAnalysis
            ? `Extracted ${actionItems.length} tactical action point${actionItems.length === 1 ? "" : "s"} and ${analysis?.agendaSections.length ?? 0} strategic agenda thread${analysis?.agendaSections.length === 1 ? "" : "s"}.`
            : "Run analysis from the workspace to populate action, risk, and follow-up signals.",
          time: hasAnalysis ? getRelativeTime(workflowSession.updatedAt) : "pending",
        },
        {
          title: reviewItems.length ? "PM review required" : "Action queue ready",
          meta: reviewItems.length
            ? `${reviewItems.length} specific item${reviewItems.length === 1 ? "" : "s"} require validation parameters prior to pipeline deployment.`
            : hasAnalysis
              ? "Current action items are clean enough to progress into delivery sync."
              : "Review will activate after the assistant extracts meeting actions.",
          time: hasAnalysis ? "now" : "pending",
        },
      ],
      nextStep: analysis?.followUpMeeting.shouldSchedule
        ? analysis.followUpMeeting.title
        : "Pre-training Delivery Check-in",
      riskCopy: blockers.length
        ? blockers.slice(0, 2).join(" ")
        : (analysis?.overallRisk ??
          "Medium priority risk flagged. Tight timelines and pending design sign-offs threaten the core onboarding milestone."),
    };
  }, [
    hasAnalysis,
    hasTranscript,
    isJiraReady,
    workflowSession.analysis,
    workflowSession.selectedFileName,
    workflowSession.updatedAt,
  ]);

  const [manualActiveIndex, setManualActiveIndex] = useState<number | null>(null);
  const activeIndex = manualActiveIndex ?? model.startingIndex;

  function advanceWorkflow() {
    setManualActiveIndex((current) => Math.min((current ?? activeIndex) + 1, WORKFLOW_STEPS.length - 1));
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
              Autonomous PMO Copilot
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              Delivery workflow orchestrator
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Guided delivery execution
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Milestones, review queues, risks, and sync readiness in one view.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={advanceWorkflow}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            <span>Advance workflow</span>
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="space-y-4 xl:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <SegmentedBar
              segments={[
                { label: "Done", value: activeIndex, className: "bg-emerald-500" },
                { label: "Active", value: 1, className: "bg-amber-500" },
                {
                  label: "Pending",
                  value: Math.max(WORKFLOW_STEPS.length - activeIndex - 1, 0),
                  className: "bg-slate-300",
                },
              ]}
            />
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workflow Map
            </h3>
            <nav className="space-y-1" aria-label="Delivery workflow">
              {WORKFLOW_STEPS.map((step, index) => {
                const state = getStepState(index, activeIndex);

                return (
                  <button
                    key={step.name}
                    type="button"
                    onClick={() => setManualActiveIndex(index)}
                    className={`flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors ${
                      state === "active"
                        ? "border border-slate-200/80 bg-slate-50"
                        : "opacity-70 hover:bg-slate-50"
                    }`}
                  >
                    <StepIcon state={state} />

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold ${
                          state === "active" ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">{step.desc}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="space-y-5 xl:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Phase
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {WORKFLOW_STEPS[activeIndex]?.name ?? "Review Actions"}
                </h2>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                {model.confidence}% Confidence
              </span>
            </div>

            <div className="mt-4">
              <DonutGauge label="Delivery Confidence" value={model.confidence} tone="emerald" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
              <div className="text-center sm:text-left">
                <span className="text-xs font-medium text-slate-400">Needs Review</span>
                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {model.reviewItems.length}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-xs font-medium text-slate-400">Ready to Sync</span>
                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {model.readyItems.length}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-xs font-medium text-slate-400">Missing Owners</span>
                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {model.missingOwners.length}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-700">Governance Checks</h4>
              <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>
                    {model.missingOwners.length
                      ? `${model.missingOwners.length} current delivery task${model.missingOwners.length === 1 ? "" : "s"} need clearer ownership.`
                      : "Every current delivery task has an assigned internal owner."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>
                    {model.reviewItems.length} item{model.reviewItems.length === 1 ? "" : "s"} need
                    confidence, blocker, or due-date evaluations.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Activity Stream
            </h3>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {model.activity.map((log) => (
                <div
                  key={log.title}
                  className="flex gap-3 p-4 transition-colors hover:bg-slate-50/60"
                >
                  <div className="mt-0.5">
                    <CornerDownRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold text-slate-900">{log.title}</p>
                      <span className="whitespace-nowrap text-[10px] text-slate-400">
                        {log.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{log.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="h-4 w-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Execution Assistant
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Risks Detected</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                  {model.riskCopy}
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="block text-[11px] font-medium text-slate-400">
                  Next Intelligent Step
                </span>
                <h4 className="mt-1 text-xs font-bold text-white">{model.nextStep}</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                  Recommended review with cross-functional owners.
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={advanceWorkflow}
                    className="w-full rounded-md bg-white/10 px-2 py-1.5 text-center text-[11px] font-medium text-white transition-colors hover:bg-white/20"
                  >
                    Continue Workflow
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualActiveIndex(2)}
                    className="w-full rounded-md bg-transparent px-2 py-1.5 text-center text-[11px] font-medium text-slate-400 transition-colors hover:text-white"
                  >
                    Open Action Review
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Jira</span>
                  <span className={isJiraReady ? "text-emerald-300" : "text-amber-300"}>
                    {isJiraReady ? "Connected" : "Needs setup"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Outlook</span>
                  <span className={isOutlookReady ? "text-emerald-300" : "text-amber-300"}>
                    {isOutlookReady ? "Connected" : "Needs setup"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Actions</span>
                  <span>{model.actionItems.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryWorkflowPage;
