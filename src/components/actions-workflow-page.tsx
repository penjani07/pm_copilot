"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GitBranch,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import type { ActionItem } from "@/lib/types";
import { useWorkflowSnapshot } from "@/lib/use-workflow-snapshot";
import { DonutGauge, SegmentedBar } from "@/components/visual-metrics";

const TRACKER_STEPS = [
  "Upload Meeting",
  "AI Analysis",
  "Review Actions",
  "Jira Sync",
  "Risk Detection",
  "Follow-up",
];

function requiresReview(item: ActionItem) {
  return item.confidence !== "High" || !item.suggestedDueDate || item.blockers.length > 1;
}

function priorityBadgeClass(priority: ActionItem["priority"]) {
  if (priority === "High") {
    return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10";
  }

  if (priority === "Low") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10";
}

export function ActionsWorkflowPage() {
  const { workflowSession, hasAnalysis, isJiraReady } = useWorkflowSnapshot();
  const analysis = workflowSession.analysis;
  const actionItems = analysis?.actionItems ?? [];
  const reviewItems = actionItems.filter(requiresReview);
  const readyItems = actionItems.filter((item) => !requiresReview(item));

  return (
    <div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10">
        <motion.header
          className="border-b border-slate-200 pb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Action approval workflow
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs text-slate-500">
                Approval-first execution routing
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
                Review AI action items before they touch delivery systems
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Validate owners, blockers, dates, and confidence before Jira sync.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-6">
              {TRACKER_STEPS.map((step, index) => (
                <div
                  key={step}
                  className={`border-l-2 py-2 pl-3 text-sm ${
                    index === 2
                      ? "border-blue-600 bg-blue-50 text-slate-950"
                      : index < 2
                        ? "border-emerald-500 text-emerald-700"
                        : "border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="mb-2 text-xs font-medium">0{index + 1}</div>
                  <div className="font-medium">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
            <section className="border-b border-slate-200 pb-5">
              <p className="text-sm text-slate-500">Approval readiness</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {actionItems.length ? `${actionItems.length} extracted tasks` : "Awaiting action items"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Live queue from the analyzed meeting.
              </p>
              <div className="mt-4">
                <DonutGauge
                  label="Approval Readiness"
                  value={
                    actionItems.length
                      ? Math.round((readyItems.length / actionItems.length) * 100)
                      : 0
                  }
                  tone={readyItems.length >= reviewItems.length ? "emerald" : "amber"}
                />
              </div>
            </section>

            <section className="border-b border-slate-200 pb-5">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Queue signals
              </div>
              <div className="space-y-3">
                <SegmentedBar
                  segments={[
                    { label: "Review", value: reviewItems.length, className: "bg-amber-500" },
                    { label: "Ready", value: readyItems.length, className: "bg-emerald-500" },
                  ]}
                />
                {[
                  ["Needs review", `${reviewItems.length}`],
                  ["Ready to sync", `${readyItems.length}`],
                  ["Jira connection", isJiraReady ? "Ready" : "Not connected"],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-slate-100 py-3 first:border-t-0">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            {!hasAnalysis ? (
              <div className="py-8">
                <h2 className="text-2xl font-semibold text-slate-950">No approved action queue yet</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Run AI analysis to split real tasks into review and sync lanes.
                </p>
                <Link
                  href="/"
                  className="app-primary-action mt-5"
                >
                  Go to workspace
                </Link>
              </div>
            ) : (
              <>
                <section className="border-b border-slate-200 pb-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Review queue</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                        Needs PM attention
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Human review required
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {reviewItems.length ? (
                      reviewItems.map((item) => (
                        <article
                          key={item.referenceId}
                          className="border-t border-slate-100 py-5 first:border-t-0"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-sm text-slate-500">{item.referenceId}</p>
                              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                                {item.title}
                              </h3>
                              <p className="mt-3 text-sm leading-7 text-slate-600">
                                {item.summary}
                              </p>
                            </div>
                            <span
                              className={`rounded px-2 py-1 text-xs font-semibold ${priorityBadgeClass(item.priority)}`}
                            >
                              {item.priority} priority
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="border-l-2 border-slate-200 pl-3">
                              <p className="text-sm text-slate-500">Owner</p>
                              <p className="mt-2 text-lg font-semibold text-slate-950">
                                {item.ownerName}
                              </p>
                            </div>
                            <div className="border-l-2 border-slate-200 pl-3">
                              <p className="text-sm text-slate-500">Due date</p>
                              <p className="mt-2 text-lg font-semibold text-slate-950">
                                {item.suggestedDueDate ?? "Needs date"}
                              </p>
                            </div>
                            <div className="border-l-2 border-slate-200 pl-3">
                              <p className="text-sm text-slate-500">Priority</p>
                              <p className="mt-2 text-lg font-semibold text-slate-950">
                                {item.priority}
                              </p>
                            </div>
                          </div>

                          {item.blockers.length ? (
                            <div className="mt-4 border-l-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                              Blockers: {item.blockers.join(", ")}
                            </div>
                          ) : null}
                        </article>
                      ))
                    ) : (
                      <div className="border-l-2 border-emerald-400 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        All current action items are strong enough to move forward into sync.
                      </div>
                    )}
                  </div>
                </section>

                <section className="pb-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Ready lane</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                        Ready for Jira sync
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Sync capable
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {readyItems.map((item) => (
                      <article
                        key={item.referenceId}
                        className="border-t border-slate-100 py-5 first:border-t-0"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">{item.referenceId}</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-950">
                              {item.title}
                            </h3>
                          </div>
                          <span
                            className={`rounded px-2 py-1 text-xs font-semibold ${priorityBadgeClass(item.priority)}`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                            <UserRound className="h-4 w-4" />
                            {item.ownerName}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                            <GitBranch className="h-4 w-4" />
                            {item.suggestedTimeline}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
                            <ArrowRight className="h-4 w-4" />
                            {item.suggestedDueDate ?? "No hard date"}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            )}
          </main>

          <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
            <section className="border-l border-slate-200 pl-5">
              <p className="text-sm text-slate-500">AI insights</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Approval intelligence</h2>
              <div className="mt-4 space-y-3">
                <div className="border-t border-slate-100 py-3">
                  <p className="text-sm font-medium text-slate-950">Blocking signals</p>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {reviewItems.length
                      ? `${reviewItems.length} tasks need PM clarification.`
                      : "No blocker-rich tasks remain."}
                  </p>
                </div>
                <div className="border-t border-slate-100 py-3">
                  <p className="text-sm font-medium text-slate-950">Jira readiness</p>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {isJiraReady
                      ? "Jira connected. Ready items can sync."
                      : "Connect Jira before creation."}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
