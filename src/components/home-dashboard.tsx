import Link from "next/link";

import { DonutGauge, SegmentedBar, SparkBars } from "@/components/visual-metrics";

const STATS = [
  {
    label: "Programs on Track",
    value: "18 / 24",
    detail: "6 need intervention this week",
    color: "text-amber-600",
  },
  {
    label: "Decisions Captured",
    value: "96%",
    detail: "Flowing into execution systems",
    color: "text-emerald-600",
  },
  {
    label: "Escalations Prevented",
    value: "11",
    detail: "Surfaced before leadership review",
    color: "text-slate-900",
  },
  {
    label: "Action Items Completed",
    value: "82%",
    detail: "+6 pts vs last week",
    color: "text-indigo-600",
  },
] as const;

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Intake",
    desc: "Sample-transcript.txt loaded into the workflow matrix.",
    status: "Complete",
  },
  {
    step: "02",
    title: "Review what the AI understood",
    desc: "Run analysis, inspect meeting summaries, agenda briefs, and extracted work items.",
    status: "In Progress",
  },
  {
    step: "03",
    title: "Deliver & Sync",
    desc: "Create tickets, send invites, and pass conversational data to Jira.",
    status: "Pending",
  },
] as const;

const INTEGRATION_POSTURE = [
  {
    label: "Jira Cloud Connection",
    status: "Needs Setup",
    color: "text-amber-600",
  },
  {
    label: "Outlook Integration",
    status: "Needs Setup",
    color: "text-amber-600",
  },
  {
    label: "AI Engine Availability",
    status: "Operational",
    color: "text-emerald-600",
  },
] as const;

function getStatusClass(status: string) {
  if (status === "Complete") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10";
  }

  if (status === "In Progress") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10";
  }

  return "bg-slate-50 text-slate-600 ring-1 ring-slate-500/10";
}

export function HomeDashboard() {
  return (
    <div className="w-full space-y-8 pb-12">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          AI Program Execution Assistant
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Manage delivery with the clarity of a dashboard, not the chaos of
          meeting notes.
        </h1>
        <p className="mt-3 max-w-4xl text-base text-slate-500">
          A structured command layer for meetings, actions, risk, and executive visibility.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/intake"
            className="rounded-md bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Start with meeting intake
          </Link>
          <Link
            href="/executive"
            className="rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            Open executive summary
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-bold tracking-tight ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
            <div className="mt-4">
              <SparkBars
                values={
                  stat.label === "Programs on Track"
                    ? [14, 15, 17, 18]
                    : stat.label === "Decisions Captured"
                      ? [72, 81, 88, 96]
                      : stat.label === "Escalations Prevented"
                        ? [4, 6, 9, 11]
                        : [64, 71, 76, 82]
                }
                tone={
                  stat.label === "Programs on Track"
                    ? "bg-amber-500"
                    : stat.label === "Decisions Captured"
                      ? "bg-emerald-500"
                      : stat.label === "Escalations Prevented"
                        ? "bg-slate-800"
                        : "bg-indigo-500"
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Execution Pipeline
          </h2>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <SegmentedBar
                segments={[
                  { label: "Done", value: 2, className: "bg-emerald-500" },
                  { label: "Review", value: 1, className: "bg-amber-500" },
                  { label: "Queued", value: 3, className: "bg-slate-300" },
                ]}
              />
            </div>
            <ul className="divide-y divide-slate-200">
              {PIPELINE_STEPS.map((item) => (
                <li
                  key={item.step}
                  className={`flex items-start gap-4 p-4 transition-colors hover:bg-slate-50 ${
                    item.status === "In Progress" ? "bg-slate-50/50" : ""
                  }`}
                >
                  <span className="flex h-6 w-8 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
                    {item.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Integration Posture
          </h2>
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <DonutGauge label="Automation readiness" value={68} tone="indigo" />
            {INTEGRATION_POSTURE.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between text-sm ${
                  index === 0 ? "" : "border-t border-slate-100 pt-3"
                }`}
              >
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className={`text-xs font-semibold ${item.color}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
