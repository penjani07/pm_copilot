"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { useWorkflowSnapshot } from "@/lib/use-workflow-snapshot";
import { DonutGauge, SegmentedBar, SparkBars } from "@/components/visual-metrics";

const TRACKER_STEPS = [
  "Upload Meeting",
  "AI Analysis",
  "Review Actions",
  "Jira Sync",
  "Risk Detection",
  "Follow-up",
];

export function MinutesWorkflowPage() {
  const { workflowSession } = useWorkflowSnapshot();
  const analysis = workflowSession.analysis;
  const transcriptLines = workflowSession.transcript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10);

  if (!analysis) {
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
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Refined Minutes
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
                  Review the meeting as a trusted operating record
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                  Run AI analysis to unlock minutes, owners, risks, and follow-up logic.
                </p>
              </div>
            </div>
          </motion.header>

          <div className="rounded-3xl border border-white/20 bg-white/70 p-8 shadow-lg shadow-black/5 backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-slate-950">No analyzed meeting yet</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Upload a meeting and run AI analysis first.
            </p>
            <Link
              href="/"
              className="app-primary-action mt-5"
            >
              Go to workspace
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI Refined Minutes
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs text-slate-500">
                Golden output for PM review
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
                Review the meeting as a trusted operating record
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Refined minutes, decisions, owners, blockers, and follow-up signals.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-6">
              {TRACKER_STEPS.map((step, index) => (
                <div
                  key={step}
                  className={`rounded-2xl border border-white/20 p-4 text-sm shadow-lg shadow-black/5 backdrop-blur-md ${
                    index === 1
                      ? "bg-[#156e67] text-white"
                      : index < 1
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
              <p className="text-sm text-slate-500">Source file</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {workflowSession.selectedFileName ?? "Transcript workspace"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {workflowSession.sourceMessage ??
                  "The current transcript and analysis session will appear here after upload."}
              </p>
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 backdrop-blur-md">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Workflow signals
              </div>
              <div className="space-y-3">
                {[
                  ["Transcript lines", transcriptLines.length ? `${transcriptLines.length} visible` : "No source yet"],
                  ["Agenda sections", `${analysis.agendaSections.length} detected`],
                  ["Participants", `${analysis.participants.length} resolved`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <SegmentedBar
                  segments={[
                    { label: "Agenda", value: analysis.agendaSections.length, className: "bg-indigo-500" },
                    { label: "Actions", value: analysis.actionItems.length, className: "bg-emerald-500" },
                    { label: "People", value: analysis.participants.length, className: "bg-amber-500" },
                  ]}
                />
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
              <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <article className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="h-4 w-4" />
                    Raw transcript
                  </div>
                  <div className="mt-4 space-y-3">
                    {transcriptLines.length ? (
                      transcriptLines.map((line) => (
                        <div key={line} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
                          {line}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        No transcript preview available.
                      </div>
                    )}
                  </div>
                </article>

                <div className="space-y-4">
                  <article className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Refined minutes
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-slate-950">{analysis.meetingTitle}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{analysis.conciseSummary}</p>
                    <div className="mt-4">
                      <SparkBars
                        values={[
                          transcriptLines.length,
                          analysis.agendaSections.length,
                          analysis.actionItems.length,
                          analysis.participants.length,
                        ]}
                        tone="bg-sky-500"
                      />
                    </div>
                  </article>

                  <article className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Overall risk</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{analysis.overallRisk}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Next recommendation</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{analysis.recommendedNextStep}</p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarClock className="h-4 w-4" />
                      Follow-up meeting logic
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{analysis.followUpMeeting.summary}</p>
                    <p className="mt-3 text-sm font-medium text-slate-900">
                      {analysis.followUpMeeting.shouldSchedule
                        ? `${analysis.followUpMeeting.attendees.length} attendees suggested / ${analysis.followUpMeeting.suggestedDurationMinutes} minutes`
                        : "No follow-up meeting recommended right now"}
                    </p>
                  </article>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md">
              <h2 className="text-2xl font-semibold text-slate-950">Agenda intelligence</h2>
              <div className="mt-4 space-y-4">
                {analysis.agendaSections.map((section) => (
                  <article key={section.referenceId} className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-black/5">
                    <p className="text-sm text-slate-500">{section.referenceId}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{section.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{section.summary}</p>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
            <section className="rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg shadow-black/10">
              <p className="text-sm text-slate-300">AI insights</p>
              <h2 className="mt-2 text-2xl font-semibold">MoM intelligence</h2>
              <div className="mt-4">
                <DonutGauge label="Record Completeness" value={88} tone="indigo" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <CircleAlert className="h-4 w-4" />
                    Risks
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{analysis.overallRisk}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <Users className="h-4 w-4" />
                    Participants
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {analysis.participants.length} participant signals resolved.
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
