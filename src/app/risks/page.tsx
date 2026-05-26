import Link from "next/link";

import { HeatStrip, SparkBars } from "@/components/visual-metrics";
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

function riskBadgeClass(risk: string) {
  if (risk.toLowerCase() === "high") {
    return "rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10";
  }

  if (risk.toLowerCase() === "low") {
    return "rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10";
  }

  return "rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10";
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
            <p>Repeated blockers, owner gaps, governance misses, and stakeholder friction.</p>
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
              <p>{filtered.length} active signals</p>
              <SparkBars values={[2, 4, filtered.length, 5, 3]} tone="bg-rose-500" />
            </div>
            <div className={styles.metricCard}>
              <span>Use case</span>
              <strong>PMO early warning system</strong>
              <p>Escalate with evidence, not anecdotes.</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Risk heatmap</h2>
              <p>Filter by category, scan the hot spots, act on the next step.</p>
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

          <div className="mb-5 border-b border-slate-100 pb-4">
            <HeatStrip
              cells={[
                { label: "Delivery", level: activeTab === "delivery" ? "high" : "medium" },
                { label: "Governance", level: activeTab === "governance" ? "high" : "low" },
                { label: "Stakeholder", level: activeTab === "stakeholder" ? "high" : "medium" },
              ]}
            />
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
                    <td>
                      <span className={riskBadgeClass(signal.risk)}>
                        {signal.risk}
                      </span>
                    </td>
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
              <p>Four signal families power the heatmap.</p>
            </div>
          </div>

          <div className={styles.riskGrid}>
            <article className={styles.riskCard}>
              <span className={styles.pill}>Governance</span>
              <h3>Missing owners and due dates</h3>
              <p>Unowned work cannot move.</p>
            </article>
            <article className={styles.riskCard}>
              <span className={styles.pill}>Dependencies</span>
              <h3>Blocked cross-team execution</h3>
              <p>Hidden paths become visible.</p>
            </article>
            <article className={styles.riskCard}>
              <span className={styles.pill}>Sentiment</span>
              <h3>Escalation likelihood</h3>
              <p>Friction becomes a signal.</p>
            </article>
            <article className={styles.riskCard}>
              <span className={styles.pill}>Memory</span>
              <h3>Recurring blockers</h3>
              <p>Repeat issues get surfaced.</p>
            </article>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
