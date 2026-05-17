"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  ClipboardCheck,
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
  {
    href: "/",
    label: "Workspace",
    note: "Guided execution",
    icon: Orbit,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    note: "Portfolio pulse",
    icon: LayoutDashboard,
  },
  {
    href: "/minutes",
    label: "Minutes",
    note: "AI record",
    icon: FileText,
  },
  {
    href: "/actions",
    label: "Actions",
    note: "Approval flow",
    icon: ClipboardCheck,
  },
  {
    href: "/delivery",
    label: "Delivery",
    note: "Sync and follow-up",
    icon: BriefcaseBusiness,
  },
  {
    href: "/risks",
    label: "Risks",
    note: "Signals and heatmaps",
    icon: Activity,
  },
  {
    href: "/executive",
    label: "Executive",
    note: "Leadership view",
    icon: Gauge,
  },
] as const;

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-18rem] h-[34rem] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.11),transparent_48%)]" />
        <div className="absolute left-[-12rem] top-[14rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.08),transparent_62%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.08),transparent_62%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1680px] px-4 py-4 lg:px-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="sticky top-4 z-50 rounded-[28px] border border-white/20 bg-white/70 px-5 py-4 shadow-xl shadow-black/5 backdrop-blur-md"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827,#1f2a44_60%,#31456d)] text-white shadow-lg shadow-black/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 transition hover:text-slate-900"
                >
                  PMO Copilot
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <h1 className="text-xl font-semibold tracking-[-0.04em] text-slate-950 lg:text-2xl">
                  AI-native delivery orchestration
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-500">
                  A premium operating layer for turning meeting evidence into governed execution,
                  delivery follow-through, and executive-grade visibility.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/70 px-3 py-2 text-xs font-medium text-slate-500 shadow-lg shadow-black/5">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                Live workflow state
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-command-bar"))}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 shadow-lg shadow-black/5 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Command bar
                <span className="rounded-full bg-[#156e67] px-2 py-1 text-[11px] text-white">
                  Ctrl/Cmd + K
                </span>
              </button>
            </div>
          </div>
        </motion.header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.04 }}
            className="space-y-4 lg:sticky lg:top-28 lg:h-fit"
          >
            <div className="rounded-[28px] border border-white/20 bg-white/70 p-4 shadow-xl shadow-black/5 backdrop-blur-md">
              <div className="mb-4 px-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Navigation rail
                </p>
              </div>
              <nav className="space-y-2" aria-label="Primary">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                  className={`group flex items-start gap-3 rounded-[24px] px-4 py-3 transition ${
                        isActive
                          ? "bg-[#156e67] text-white shadow-lg shadow-teal-900/10"
                          : "bg-transparent text-slate-600 hover:bg-white/80 hover:text-slate-950"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "bg-white/80 text-slate-500 shadow-sm shadow-black/5 group-hover:text-slate-900"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold tracking-[-0.02em]">
                          {item.label}
                        </span>
                        <span
                          className={`mt-1 block text-xs leading-5 ${
                            isActive ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {item.note}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-[28px] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.54))] p-5 shadow-xl shadow-black/5 backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Operating posture
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm shadow-black/5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    Guided AI workflow
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm shadow-black/5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Visual language
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    Glass surfaces, motion, and depth
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
