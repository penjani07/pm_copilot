import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import styles from "@/components/section-page.module.css";
import { PLAYBOOKS, type PlaybookCategory } from "@/lib/site-content";

const TAB_LABELS: Record<PlaybookCategory, string> = {
  rituals: "Team rituals",
  launches: "Launch tracks",
  docs: "Documentation kits",
};

const PER_PAGE = 2;

function parseTab(value: string | string[] | undefined): PlaybookCategory {
  if (value === "launches" || value === "docs" || value === "rituals") {
    return value;
  }

  return "rituals";
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(Array.isArray(value) ? value[0] : value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function PlaybooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const activeTab = parseTab(params.tab);
  const currentPage = parsePage(params.page);
  const filtered = PLAYBOOKS.filter((playbook) => playbook.category === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>Library Mode</span>
            <h1>Keep your repeatable delivery plays close.</h1>
            <p>
              This page extends the main console with reusable operating kits so
              teams can move from one-off summaries into a clearer execution
              system.
            </p>
            <div className={styles.heroMeta}>
              <span>{PLAYBOOKS.length} playbooks seeded</span>
              <span>Tabs for operating modes</span>
              <span>Pagination for scanning fast</span>
            </div>
          </div>

          <div className={styles.metricRail}>
            <div className={styles.metricCard}>
              <span>Current tab</span>
              <strong>{TAB_LABELS[activeTab]}</strong>
              <p>Focused on a single mode so the page stays tidy and readable.</p>
            </div>
            <div className={styles.metricCard}>
              <span>Page size</span>
              <strong>{PER_PAGE} cards</strong>
              <p>Deliberately small batches keep the page from turning into a wall of cards.</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Filter by operating lane</h2>
              <p>Tabs swap between rituals, launches, and documentation-heavy working sets.</p>
            </div>
            <div className={styles.tabs}>
              {(Object.keys(TAB_LABELS) as PlaybookCategory[]).map((tab) => (
                <Link
                  key={tab}
                  href={`/playbooks?tab=${tab}&page=1`}
                  className={`${styles.tabLink} ${tab === activeTab ? styles.tabLinkActive : ""}`}
                >
                  {TAB_LABELS[tab]}
                </Link>
              ))}
            </div>
          </div>

          {pageItems.length ? (
            <div className={styles.itemGrid}>
              {pageItems.map((playbook) => (
                <article key={playbook.slug} className={styles.itemCard}>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.pill}>{playbook.slug}</span>
                      <h3>{playbook.title}</h3>
                    </div>
                    <span className={styles.subtlePill}>{playbook.cadence}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <p>{playbook.summary}</p>
                    <div className={styles.metaRow}>
                      <span>{playbook.audience}</span>
                      <span>{TAB_LABELS[playbook.category]}</span>
                    </div>
                    <ul className={styles.list}>
                      {playbook.checkpoints.map((checkpoint) => (
                        <li key={checkpoint}>{checkpoint}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No playbooks match this tab yet.</p>
            </div>
          )}

          <div className={styles.footerBar}>
            <span>
              Showing {pageItems.length} of {filtered.length} items in {TAB_LABELS[activeTab]}.
            </span>
            <div className={styles.pager}>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Link
                  key={page}
                  href={`/playbooks?tab=${activeTab}&page=${page}`}
                  className={`${styles.pageLink} ${page === safePage ? styles.pageLinkActive : ""}`}
                >
                  {page}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
