"use client";

import {
  Activity,
  ChevronRight,
  ClipboardCheck,
  Command,
  FileText,
  Gauge,
  LayoutDashboard,
  Orbit,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-slate-900"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>PMO Copilot</span>
          </Link>
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
            Live
          </span>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
          <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Navigation
          </div>
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
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        isActive
                          ? "text-slate-900"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-100 px-2 pt-4">
            <div className="rounded-lg border border-slate-200/60 bg-slate-50 p-3">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Workflow Posture
              </span>
              <span className="mt-1 block text-xs font-medium text-slate-600">
                Guided AI Sync active
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">Project Workspace</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold capitalize text-slate-900">
              {pathname === "/" ? "Overview" : pathname.replace("/", "")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-command-bar"))}
              className="hidden items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 shadow-sm hover:bg-slate-50 lg:inline-flex"
            >
              <Command className="h-3.5 w-3.5" />
              <span>Search / Command</span>
              <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] text-slate-400">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
          <div className="mx-auto h-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
