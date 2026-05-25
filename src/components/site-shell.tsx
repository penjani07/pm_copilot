"use client";

import {
  Activity,
  ChevronRight,
  ClipboardCheck,
  Command,
  FileText,
  Gauge,
  LayoutDashboard,
  LogIn,
  Orbit,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AnalysisExportActions } from "@/components/analysis-export-actions";

const NAV_ITEMS = [
  { href: "/", label: "Workspace", icon: Orbit },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/minutes", label: "Minutes", icon: FileText },
  { href: "/actions", label: "Actions", icon: ClipboardCheck },
  { href: "/delivery", label: "Delivery", icon: Activity },
  { href: "/risks", label: "Risks", icon: Activity },
  { href: "/executive", label: "Executive", icon: Gauge },
] as const;

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();

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

        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
          <nav className="space-y-0.5" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                  )}
                </Link>
              );
            })}
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
            <span className="font-medium text-slate-700">Workspace</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate font-semibold capitalize text-slate-900">
              {pathname === "/" ? "Meeting flow" : pathname.replace("/", "")}
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
