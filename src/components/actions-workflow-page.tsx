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

export function ActionsWorkflowPage() {
  const { workflowSession, hasAnalysis, hasLoaded, isJiraReady } = useWorkflowSnapshot();
  const analysis = workflowSession.analysis;
  const actionItems = analysis?.actionItems ?? [];
  const reviewItems = actionItems.filter(requiresReview);
  const readyItems = actionItems.filter((item) => !requiresReview(item));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-10 pt-4 lg:px-6">
        <motion.header
          className="sticky top-4 z-30 rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 backdrop-blur-md"
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
                This stage keeps a PM in control: validate ownership, blockers, due dates,
                and confidence before anything moves into Jira or downstream orchestration.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-6">
              {TRACKER_STEPS.map((step, index) => (
                <div
                  key={step}
                  className={`rounded-2xl border border-white/20 p-4 text-sm shadow-lg shadow-black/5 backdrop-blur-md ${
                    index === 2
                      ? "bg-slate-950 text-white"
                      : index < 2
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-white/70 text-slate-500"
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
            <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
              <p className="text-sm text-slate-500">Approval readiness</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {actionItems.length ? `${actionItems.length} extracted tasks` : "Awaiting action items"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                This queue is now driven by the actual analyzed meeting session instead of static sample cards.
              </p>
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 backdrop-blur-md">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Queue signals
              </div>
              <div className="space-y-3">
                {[
                  ["Needs review", `${reviewItems.length}`],
                  ["Ready to sync", `${readyItems.length}`],
                  ["Jira connection", isJiraReady ? "Ready" : "Not connected"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            {!hasLoaded ? (
              <div className="rounded-3xl border border-white/20 bg-white/70 p-8 shadow-lg shadow-black/5 backdrop-blur-md">
                <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200/80" />
                <div className="mt-4 h-32 animate-pulse rounded-2xl bg-white/70" />
              </div>
            ) : !hasAnalysis ? (
              <div className="rounded-3xl border border-white/20 bg-white/70 p-8 shadow-lg shadow-black/5 backdrop-blur-md">
                <h2 className="text-2xl font-semibold text-slate-950">No approved action queue yet</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Run AI analysis from the workspace first. Then this page will show the real action
                  items extracted from your meeting and split them into review and sync lanes.
                </p>
                <Link
                  href="/"
                  className="mt-5 inline-flex items-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                >
                  Go to workspace
                </Link>
              </div>
            ) : (
              <>
                <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
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
                          className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5"
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
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                              {item.confidence} confidence
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-sm text-slate-500">Owner</p>
                              <p className="mt-2 text-lg font-semibold text-slate-950">
                                {item.ownerName}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-sm text-slate-500">Due date</p>
                              <p className="mt-2 text-lg font-semibold text-slate-950">
                                {item.suggestedDueDate ?? "Needs date"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-sm text-slate-500">Priority</p>
                              <p className="mt-2 text-lg font-semibold text-slate-950">
                                {item.priority}
                              </p>
                            </div>
                          </div>

                          {item.blockers.length ? (
                            <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                              Blockers: {item.blockers.join(", ")}
                            </div>
                          ) : null}
                        </article>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50 p-5 text-sm text-emerald-700">
                        All current action items are strong enough to move forward into sync.
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
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
                        className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">{item.referenceId}</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-950">
                              {item.title}
                            </h3>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
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
            <section className="rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg shadow-black/10">
              <p className="text-sm text-slate-300">AI insights</p>
              <h2 className="mt-2 text-2xl font-semibold">Approval intelligence</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-medium text-slate-100">Blocking signals</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {reviewItems.length
                      ? `${reviewItems.length} tasks still need PM clarification before sync.`
                      : "No blocker-rich tasks remain in the current review queue."}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-medium text-slate-100">Jira readiness</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {isJiraReady
                      ? "Jira is connected, so ready items can progress directly into sync."
                      : "Connect Jira in settings before the ready lane can move into creation."}
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
