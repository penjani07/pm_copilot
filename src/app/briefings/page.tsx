import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import styles from "@/components/section-page.module.css";
import { BRIEFINGS, type BriefingStatus } from "@/lib/site-content";

const TAB_LABELS: Record<BriefingStatus, string> = {
  "at-risk": "At risk",
  scheduled: "Scheduled",
  shipped: "Shipped",
};

const PER_PAGE = 2;

function parseTab(value: string | string[] | undefined): BriefingStatus {
  if (value === "at-risk" || value === "scheduled" || value === "shipped") {
    return value;
  }

  return "at-risk";
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(Array.isArray(value) ? value[0] : value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function BriefingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const activeTab = parseTab(params.tab);
  const currentPage = parsePage(params.page);
  const filtered = BRIEFINGS.filter((briefing) => briefing.status === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>Portfolio View</span>
            <h1>Read the state of delivery without hunting for it.</h1>
            <p>
              Briefings turn individual meeting outputs into a cleaner portfolio
              readout, with tabbed slices for risk, upcoming work, and shipped
              updates.
            </p>
            <div className={styles.heroMeta}>
              <span>{BRIEFINGS.length} seeded updates</span>
              <span>Risk and progress tabs</span>
              <span>Paged snapshots</span>
            </div>
          </div>

          <div className={styles.metricRail}>
            <div className={styles.metricCard}>
              <span>Portfolio lane</span>
              <strong>{TAB_LABELS[activeTab]}</strong>
              <p>Each lane focuses attention on one kind of operational signal.</p>
            </div>
            <div className={styles.metricCard}>
              <span>Next step</span>
              <strong>Review then route</strong>
              <p>Use the briefings page for scanning, then hop into the workspace when action is needed.</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Switch the portfolio lens</h2>
              <p>Tabs keep the page quick to scan when you only need one slice of the operating picture.</p>
            </div>
            <div className={styles.tabs}>
              {(Object.keys(TAB_LABELS) as BriefingStatus[]).map((tab) => (
                <Link
                  key={tab}
                  href={`/briefings?tab=${tab}&page=1`}
                  className={`${styles.tabLink} ${tab === activeTab ? styles.tabLinkActive : ""}`}
                >
                  {TAB_LABELS[tab]}
                </Link>
              ))}
            </div>
          </div>

          {pageItems.length ? (
            <div className={styles.itemGrid}>
              {pageItems.map((briefing) => (
                <article key={briefing.id} className={styles.itemCard}>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.pill}>{briefing.id}</span>
                      <h3>{briefing.title}</h3>
                    </div>
                    <span className={styles.subtlePill}>{briefing.timeWindow}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <p>{briefing.summary}</p>
                    <div className={styles.metaRow}>
                      <span>{briefing.owner}</span>
                      <span>{briefing.signal}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No briefings match this tab yet.</p>
            </div>
          )}

          <div className={styles.footerBar}>
            <span>
              Showing {pageItems.length} of {filtered.length} updates in {TAB_LABELS[activeTab]}.
            </span>
            <div className={styles.pager}>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Link
                  key={page}
                  href={`/briefings?tab=${activeTab}&page=${page}`}
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
