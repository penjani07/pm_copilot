import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import styles from "@/components/execution-page.module.css";
import { ACTION_REVIEW_ITEMS, type ActionTab } from "@/lib/execution-content";

const TAB_LABELS: Record<ActionTab, string> = {
  suggested: "Suggested",
  "needs-review": "Needs review",
  approved: "Approved",
};

const PER_PAGE = 2;

function parseTab(value: string | string[] | undefined): ActionTab {
  if (value === "suggested" || value === "needs-review" || value === "approved") {
    return value;
  }

  return "suggested";
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(Array.isArray(value) ? value[0] : value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const activeTab = parseTab(params.tab);
  const currentPage = parsePage(params.page);
  const filtered = ACTION_REVIEW_ITEMS.filter((item) => item.status === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>Approval Workflow</span>
            <h1>Review AI-suggested work before it hits production systems.</h1>
            <p>
              Enterprise teams need a human approval layer. This page is where a
              PM validates ownership, priority, duplicates, sprint mapping, and
              risk before any Jira or downstream ticket is created.
            </p>
            <div className={styles.heroMeta}>
              <span>AI confidence percentage</span>
              <span>Duplicate detection</span>
              <span>Epic and sprint recommendation</span>
            </div>
          </div>

          <div className={styles.metricRail}>
            <div className={styles.metricCard}>
              <span>Current queue</span>
              <strong>{TAB_LABELS[activeTab]}</strong>
              <p>Tabs keep the review surface focused and operationally fast.</p>
            </div>
            <div className={styles.metricCard}>
              <span>Pagination</span>
              <strong>{PER_PAGE} cards per page</strong>
              <p>Small batches mimic a real approval inbox rather than a giant backlog wall.</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Action review inbox</h2>
              <p>
                Suggested tasks become execution-ready artifacts with clearer
                ownership and better routing context.
              </p>
            </div>
            <div className={styles.tabs}>
              {(Object.keys(TAB_LABELS) as ActionTab[]).map((tab) => (
                <Link
                  key={tab}
                  href={`/actions?tab=${tab}&page=1`}
                  className={`${styles.tabLink} ${tab === activeTab ? styles.tabLinkActive : ""}`}
                >
                  {TAB_LABELS[tab]}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.itemGrid}>
            {pageItems.map((item) => (
              <article key={item.id} className={styles.itemCard}>
                <div className={styles.itemTopRow}>
                  <div>
                    <span className={styles.pill}>{item.id}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <span className={styles.toneWatch}>{item.priority}</span>
                </div>

                <p>{item.risk}</p>

                <div className={styles.detailGrid}>
                  <div className={styles.detailCard}>
                    <span className={styles.label}>Owner</span>
                    <p>{item.owner}</p>
                  </div>
                  <div className={styles.detailCard}>
                    <span className={styles.label}>Due date</span>
                    <p>{item.dueDate}</p>
                  </div>
                  <div className={styles.detailCard}>
                    <span className={styles.label}>Confidence</span>
                    <p>{item.confidence}</p>
                  </div>
                </div>

                <div className={styles.stack}>
                  <div className={styles.callout}>
                    <span className={styles.label}>Dependency</span>
                    <p>{item.dependency}</p>
                  </div>
                  <div className={styles.callout}>
                    <span className={styles.label}>Duplicate signal</span>
                    <p>{item.duplicateSignal}</p>
                  </div>
                  <div className={styles.callout}>
                    <span className={styles.label}>Jira mapping</span>
                    <p>{item.jiraMapping}</p>
                  </div>
                </div>

                <div className={styles.metaRow}>
                  <span>{item.team}</span>
                  <span>{item.epicRecommendation}</span>
                  <span>{item.sprintRecommendation}</span>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.footerBar}>
            <span>
              Showing {pageItems.length} of {filtered.length} items in {TAB_LABELS[activeTab]}.
            </span>
            <div className={styles.pager}>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Link
                  key={page}
                  href={`/actions?tab=${activeTab}&page=${page}`}
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
