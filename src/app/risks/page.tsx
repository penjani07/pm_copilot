import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import styles from "@/components/execution-page.module.css";
import { RISK_SIGNALS, type RiskTab } from "@/lib/execution-content";

const TAB_LABELS: Record<RiskTab, string> = {
  delivery: "Delivery",
  governance: "Governance",
  stakeholder: "Stakeholder",
};

const PER_PAGE = 2;

function parseTab(value: string | string[] | undefined): RiskTab {
  if (value === "delivery" || value === "governance" || value === "stakeholder") {
    return value;
  }

  return "delivery";
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(Array.isArray(value) ? value[0] : value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function RisksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const activeTab = parseTab(params.tab);
  const currentPage = parsePage(params.page);
  const filtered = RISK_SIGNALS.filter((signal) => signal.category === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>Program Risk Intelligence</span>
            <h1>Detect delivery drift before it becomes a status surprise.</h1>
            <p>
              This screen is the executive-grade intelligence layer: repeated
              blockers, overdue owners, missing governance fields, and
              stakeholder friction all roll into a single heatmap view.
            </p>
            <div className={styles.heroMeta}>
              <span>Repeated blocker detection</span>
              <span>Missed deadline awareness</span>
              <span>Sentiment and escalation signals</span>
            </div>
          </div>

          <div className={styles.metricRail}>
            <div className={styles.metricCard}>
              <span>Active lens</span>
              <strong>{TAB_LABELS[activeTab]} risk</strong>
              <p>Tabs separate execution issues from governance and stakeholder posture.</p>
            </div>
            <div className={styles.metricCard}>
              <span>Use case</span>
              <strong>PMO early warning system</strong>
              <p>
                The goal is less firefighting and more structured escalation with
                clear reasons.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Risk heatmap</h2>
              <p>
                Slice the signals by category and review them in small batches so
                the screen stays sharp instead of overwhelming.
              </p>
            </div>
            <div className={styles.tabs}>
              {(Object.keys(TAB_LABELS) as RiskTab[]).map((tab) => (
                <Link
                  key={tab}
                  href={`/risks?tab=${tab}&page=1`}
                  className={`${styles.tabLink} ${tab === activeTab ? styles.tabLinkActive : ""}`}
                >
                  {TAB_LABELS[tab]}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Risk</th>
                  <th>Reason</th>
                  <th>Next action</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((signal) => (
                  <tr key={`${signal.team}-${signal.reason}`}>
                    <td>{signal.team}</td>
                    <td>{signal.risk}</td>
                    <td>{signal.reason}</td>
                    <td>{signal.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.footerBar}>
            <span>
              Showing {pageItems.length} of {filtered.length} signals in {TAB_LABELS[activeTab]} risk.
            </span>
            <div className={styles.pager}>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Link
                  key={page}
                  href={`/risks?tab=${activeTab}&page=${page}`}
                  className={`${styles.pageLink} ${page === safePage ? styles.pageLinkActive : ""}`}
                >
                  {page}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>What the engine looks for</h2>
              <p>
                Risk is not just schedule slip. It is governance quality,
                accountability health, and stakeholder temperature too.
              </p>
            </div>
          </div>

          <div className={styles.riskGrid}>
            <article className={styles.riskCard}>
              <span className={styles.pill}>Governance</span>
              <h3>Missing owners and due dates</h3>
              <p>Flags action items that cannot be operationalized responsibly.</p>
            </article>
            <article className={styles.riskCard}>
              <span className={styles.pill}>Dependencies</span>
              <h3>Blocked cross-team execution</h3>
              <p>Tracks unresolved handoffs that create invisible critical paths.</p>
            </article>
            <article className={styles.riskCard}>
              <span className={styles.pill}>Sentiment</span>
              <h3>Escalation likelihood</h3>
              <p>Interprets repeated frustration, disagreement, or confusion in program calls.</p>
            </article>
            <article className={styles.riskCard}>
              <span className={styles.pill}>Memory</span>
              <h3>Recurring blockers</h3>
              <p>Uses organizational memory to show when the same issue keeps reappearing.</p>
            </article>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
