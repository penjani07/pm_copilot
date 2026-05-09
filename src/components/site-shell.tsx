"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./site-shell.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", note: "Command center" },
  { href: "/intake", label: "Intake", note: "Ingest meeting evidence" },
  { href: "/minutes", label: "Minutes", note: "Refined MoM view" },
  { href: "/actions", label: "Actions", note: "Approval workflow" },
  { href: "/delivery", label: "Delivery", note: "Tool sync and follow-up" },
  { href: "/risks", label: "Risks", note: "Program intelligence" },
  { href: "/executive", label: "Executive", note: "Leadership briefings" },
];

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <Link href="/" className={styles.brandMark}>
            PMO Copilot
          </Link>
          <p>
            An AI program execution assistant for turning meetings into
            accountable work, governed follow-through, and leadership-grade
            delivery visibility.
          </p>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
