"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Command } from "cmdk";
import { CalendarDays, CheckSquare2, FolderKanban, LayoutDashboard, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const COMMAND_GROUPS = [
  {
    heading: "Meetings",
    items: [
      { label: "Release 5.2 steering sync", description: "Open the intake workspace", href: "/" , icon: CalendarDays},
      { label: "Treasury dependency review", description: "Review refined minutes", href: "/minutes", icon: CalendarDays },
    ],
  },
  {
    heading: "Jira tickets",
    items: [
      { label: "REL-52 gateway readiness", description: "Jump to delivery orchestration", href: "/delivery", icon: FolderKanban },
      { label: "OPS-933 firewall escalation", description: "Open risk tracking", href: "/risks", icon: FolderKanban },
    ],
  },
  {
    heading: "Action items",
    items: [
      { label: "Validate Treasury timeout", description: "Open action approval queue", href: "/actions", icon: CheckSquare2 },
      { label: "Schedule dependency review", description: "Open delivery follow-up stage", href: "/delivery", icon: CheckSquare2 },
    ],
  },
  {
    heading: "Workflow stages",
    items: [
      { label: "Workspace", description: "Upload and process meeting evidence", href: "/", icon: Sparkles },
      { label: "Dashboard", description: "Presentation command center", href: "/dashboard", icon: LayoutDashboard },
      { label: "Executive summary", description: "Leadership briefing view", href: "/executive", icon: LayoutDashboard },
    ],
  },
];

export function GlobalCommandBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shouldOpen = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!shouldOpen) {
        return;
      }

      event.preventDefault();
      setOpen((current) => !current);
    }

    function onOpenCommandBar() {
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-bar", onOpenCommandBar);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-bar", onOpenCommandBar);
    };
  }, []);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] bg-slate-950/30 px-4 py-20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/30 bg-white/85 shadow-2xl shadow-black/10 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <Command className="w-full" label="Global Command Bar">
              <div className="flex items-center gap-3 border-b border-slate-200/70 px-5 py-4">
                <Search className="h-4 w-4 text-slate-400" />
                <Command.Input
                  autoFocus
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Search meetings, Jira tickets, action items, or workflow stages..."
                />
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
                  ESC
                </span>
              </div>

              <Command.List className="max-h-[420px] overflow-y-auto p-3">
                <Command.Empty className="px-4 py-10 text-center text-sm text-slate-500">
                  No matches yet. Try searching for a meeting, Jira ticket, or workflow stage.
                </Command.Empty>

                {COMMAND_GROUPS.map((group) => (
                  <Command.Group key={group.heading} heading={group.heading} className="mb-3">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {group.heading}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Command.Item
                            key={`${group.heading}-${item.label}`}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left outline-none data-[selected=true]:bg-[#156e67] data-[selected=true]:text-white"
                            onSelect={() => {
                              setOpen(false);
                              router.push(item.href);
                            }}
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 data-[selected=true]:bg-white/15 data-[selected=true]:text-white">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium">{item.label}</span>
                              <span className="truncate text-xs text-slate-500 data-[selected=true]:text-teal-50/90">
                                {item.description}
                              </span>
                            </span>
                          </Command.Item>
                        );
                      })}
                    </div>
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
