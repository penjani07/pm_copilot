"use client";

import { CalendarClock, CheckCircle2, FileText, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import { CopyTextButton } from "@/components/copy-text-button";
import { useWorkflowSnapshot } from "@/lib/use-workflow-snapshot";
import type { AgendaSection, MeetingAnalysis } from "@/lib/types";

function formatList(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function createMinutesCopy(analysis: MeetingAnalysis) {
  return [
    analysis.meetingTitle,
    "",
    "Summary",
    analysis.conciseSummary,
    "",
    "Overall risk",
    analysis.overallRisk,
    "",
    "Recommended next step",
    analysis.recommendedNextStep,
    "",
    "Agenda briefs",
    analysis.agendaSections
      .map((section) => `- ${section.referenceId}: ${section.title} - ${section.summary}`)
      .join("\n"),
    "",
    "Action items",
    analysis.actionItems
      .map((item) => `- ${item.title} (${item.ownerName}, ${item.suggestedTimeline})`)
      .join("\n"),
  ].join("\n");
}

function createAgendaCopy(section: AgendaSection) {
  return [`${section.referenceId} ${section.title}`, "", section.summary].join("\n");
}

const copyButtonClass =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 [&_svg]:h-3.5 [&_svg]:w-3.5";

export function MinutesWorkflowPage() {
  const { workflowSession } = useWorkflowSnapshot();
  const analysis = workflowSession.analysis;
  const transcriptLines = workflowSession.transcript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (!analysis) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-10">
        <header className="border-b border-slate-200 pb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
            AI refined minutes
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
            Review the meeting as a trusted operating record
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
            Run AI analysis to unlock minutes, owners, risks, and follow-up logic.
          </p>
        </header>

        <section className="py-6">
          <h2 className="text-xl font-semibold text-slate-950">No analyzed meeting yet</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Upload a meeting and run AI analysis first.
          </p>
          <Link href="/" className="app-primary-action mt-5">
            Go to workspace
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-10">
      <header className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
            AI refined minutes
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {workflowSession.selectedFileName ?? "Transcript workspace"}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
              {analysis.meetingTitle}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Refined minutes, decisions, owners, blockers, and follow-up signals in one readable record.
            </p>
          </div>
          <CopyTextButton
            className={copyButtonClass}
            label="Copy minutes"
            text={createMinutesCopy(analysis)}
          />
        </div>

        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          {[
            ["Agenda sections", `${analysis.agendaSections.length}`],
            ["Action items", `${analysis.actionItems.length}`],
            ["Participants", `${analysis.participants.length}`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {label}
              </dt>
              <dd className="mt-1 text-xl font-semibold text-slate-950">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <main>
        <section className="border-b border-slate-100 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              Refined record
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700">{analysis.conciseSummary}</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Overall risk
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{analysis.overallRisk}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Recommended next step
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {analysis.recommendedNextStep}
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-100 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="h-4 w-4 text-sky-600" />
              Transcript preview
            </div>
            <CopyTextButton
              className={copyButtonClass}
              label="Copy source"
              text={workflowSession.transcript}
            />
          </div>
          <div className="mt-4 space-y-3">
            {transcriptLines.length ? (
              transcriptLines.map((line) => (
                <p key={line} className="border-l-2 border-slate-200 pl-4 text-sm leading-7 text-slate-600">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500">No transcript preview available.</p>
            )}
          </div>
        </section>

        <section className="border-b border-slate-100 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarClock className="h-4 w-4 text-amber-600" />
              Follow-up meeting logic
            </div>
            <CopyTextButton
              className={copyButtonClass}
              label="Copy follow-up"
              text={[
                analysis.followUpMeeting.title,
                "",
                analysis.followUpMeeting.summary,
                "",
                analysis.followUpMeeting.rationale,
                "",
                "Agenda",
                formatList(analysis.followUpMeeting.agenda),
              ].join("\n")}
            />
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {analysis.followUpMeeting.summary}
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            {analysis.followUpMeeting.shouldSchedule
              ? `${analysis.followUpMeeting.attendees.length} attendees suggested / ${analysis.followUpMeeting.suggestedDurationMinutes} minutes`
              : "No follow-up meeting recommended right now"}
          </p>
        </section>

        <section className="border-b border-slate-100 py-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="h-4 w-4 text-indigo-600" />
            Participants
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {analysis.participants.map((participant) => (
              <div key={participant.name} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-950">{participant.name}</h3>
                  <span className="text-xs text-slate-500">
                    {participant.role ?? "Role not stated"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {participant.signals.join(" ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            Agenda briefs
          </h2>
          <div className="mt-4 divide-y divide-slate-100">
            {analysis.agendaSections.map((section) => (
              <article key={section.referenceId} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {section.referenceId}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">
                      {section.title}
                    </h3>
                  </div>
                  <CopyTextButton
                    className={copyButtonClass}
                    text={createAgendaCopy(section)}
                  />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
