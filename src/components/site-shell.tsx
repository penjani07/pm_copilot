"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./site-shell.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Console", note: "Meeting workspace" },
  { href: "/playbooks", label: "Playbooks", note: "Reusable delivery kits" },
  { href: "/briefings", label: "Briefings", note: "Portfolio snapshots" },
  { href: "/workspace", label: "Workspace", note: "Direct console route" },
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
            PM Drill
          </Link>
          <p>
            A polished operating surface for turning meeting noise into delivery
            decisions.
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
