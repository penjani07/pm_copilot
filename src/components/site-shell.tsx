"use client";

import {
  Activity,
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
  Command,
  FileText,
  Gauge,
  LayoutDashboard,
  LogIn,
  Orbit,
  Presentation,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AnalysisExportActions } from "@/components/analysis-export-actions";

const PRIMARY_NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    description: "Portfolio pulse",
    icon: LayoutDashboard,
  },
] as const;

const WORKFLOW_NAV_ITEMS = [
  { href: "/", label: "Intake", description: "Capture source", icon: Orbit },
  { href: "/minutes", label: "Minutes", description: "Refine record", icon: FileText },
  {
    href: "/actions",
    label: "Actions",
    description: "Approve work",
    icon: ClipboardCheck,
  },
  { href: "/delivery", label: "Delivery", description: "Sync systems", icon: Activity },
  { href: "/risks", label: "Risks", description: "RAG monitor", icon: AlertTriangle },
  {
    href: "/executive",
    label: "Executive",
    description: "Brief sponsors",
    icon: Gauge,
  },
] as const;

const SUPPORT_NAV_ITEMS = [
  {
    href: "/briefings",
    label: "Briefings",
    description: "Portfolio updates",
    icon: Presentation,
  },
  {
    href: "/playbooks",
    label: "Playbooks",
    description: "Reusable rituals",
    icon: FileText,
  },
] as const;

type SiteShellProps = {
  children: ReactNode;
};

const ALL_NAV_ITEMS = [
  ...PRIMARY_NAV_ITEMS,
  ...WORKFLOW_NAV_ITEMS,
  ...SUPPORT_NAV_ITEMS,
];

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const activeItem =
    ALL_NAV_ITEMS.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href)),
    ) ?? WORKFLOW_NAV_ITEMS[0];

  function renderNavItem(
    item: (typeof ALL_NAV_ITEMS)[number],
    index?: number,
  ) {
    const isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group grid grid-cols-[auto_1fr_auto] items-center gap-2 border-l-2 px-2.5 py-2 text-sm transition-colors ${
          isActive
            ? "border-blue-600 bg-blue-50 text-blue-700"
            : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
          }`}
        />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{item.label}</span>
          <span className="block truncate text-[11px] font-medium text-slate-400">
            {item.description}
          </span>
        </span>
        {typeof index === "number" ? (
          <span
            className={`text-[10px] font-bold tabular-nums ${
              isActive ? "text-blue-600" : "text-slate-300"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f8fb] font-sans text-slate-950 antialiased">
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex">
        <div className="flex h-14 items-center justify-between border-b border-slate-200/80 px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-slate-950"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>PMO Copilot</span>
          </Link>
          <span className="inline-flex items-center rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-medium text-teal-700 ring-1 ring-inset ring-teal-600/10">
            Live
          </span>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          <nav className="space-y-5" aria-label="Primary">
            <section>
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Portfolio
              </div>
              <div className="space-y-1">
                {PRIMARY_NAV_ITEMS.map((item) => renderNavItem(item))}
              </div>
            </section>

            <section>
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Delivery flow
              </div>
              <div className="space-y-1">
                {WORKFLOW_NAV_ITEMS.map((item, index) =>
                  renderNavItem(item, index),
                )}
              </div>
            </section>

            <section>
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Knowledge
              </div>
              <div className="space-y-1">
                {SUPPORT_NAV_ITEMS.map((item) => renderNavItem(item))}
              </div>
            </section>
          </nav>

          <div className="mt-auto border-t border-slate-100 px-2 pt-4">
            <Link
              href="/signin"
              className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
            >
              <span>Sign in</span>
              <LogIn className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">
              {WORKFLOW_NAV_ITEMS.some((item) => item.href === activeItem.href)
                ? "Delivery flow"
                : activeItem.href === "/dashboard"
                  ? "Portfolio"
                  : "Knowledge"}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate font-semibold capitalize text-slate-900">
              {activeItem.label}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <AnalysisExportActions />
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-command-bar"))}
              className="hidden items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 shadow-sm hover:bg-slate-50 lg:inline-flex"
            >
              <Command className="h-3.5 w-3.5" />
              <span>Command</span>
              <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] text-slate-400">
                Ctrl K
              </kbd>
            </button>
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f7f8fb] p-4 lg:p-6">
          <div className="mx-auto h-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
