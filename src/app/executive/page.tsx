import { DonutGauge, SegmentedBar, SparkBars } from "@/components/visual-metrics";
import { SiteShell } from "@/components/site-shell";
import styles from "@/components/execution-page.module.css";
import { CHAT_PROMPTS, EXECUTIVE_HIGHLIGHTS } from "@/lib/execution-content";

export default function ExecutivePage() {
  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>Executive Summary</span>
            <h1>Brief leadership with program truth, not meeting fragments.</h1>
            <p>Weekly health, risks, milestones, decisions, and leadership asks.</p>
            <div className={styles.heroMeta}>
              <span>Weekly leadership summary</span>
              <span>Governance status</span>
              <span>Natural-language portfolio questions</span>
            </div>
          </div>

          <div className={styles.metricRail}>
            <div className={styles.metricCard}>
              <span>Audience</span>
              <strong>Program directors and PMOs</strong>
              <p>Decisions, risks, asks, momentum.</p>
              <SparkBars values={[62, 66, 71, 77, 82, 89]} tone="bg-indigo-500" />
            </div>
            <div className={styles.metricCard}>
              <span>Outcome</span>
              <strong>Continuous briefings</strong>
              <p>Always-current leadership narrative.</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Leadership highlights</h2>
              <p>Execution, blockers, milestones, governance.</p>
            </div>
          </div>

          <div className={styles.highlightGrid}>
            {EXECUTIVE_HIGHLIGHTS.map((highlight) => (
              <article key={highlight.title} className={styles.highlightCard}>
                <span className={styles.pill}>{highlight.signal}</span>
                <h3>{highlight.title}</h3>
                <p>{highlight.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Governance snapshot</h2>
              <p>Evidence behind the narrative.</p>
            </div>
          </div>

          <div className="mb-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <DonutGauge label="Governance Compliance" value={89} tone="emerald" />
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <SegmentedBar
                segments={[
                  { label: "Healthy", value: 18, className: "bg-emerald-500" },
                  { label: "Watch", value: 5, className: "bg-amber-500" },
                  { label: "Escalate", value: 1, className: "bg-rose-500" },
                ]}
              />
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={styles.label}>Delivery health</span>
              <strong>On watch</strong>
              <p>Dependency closure is gating.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.label}>Governance compliance</span>
              <strong>89%</strong>
              <p>Due-date completeness is the gap.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.label}>Escalation posture</span>
              <strong>Moderate</strong>
              <p>One support ask likely.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.label}>Cross-team dependencies</span>
              <strong>18 tracked</strong>
              <p>8 sit on milestone path.</p>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>AI chat assistant prompts</h2>
              <p>Ask the portfolio directly.</p>
            </div>
          </div>

          <div className={styles.promptGrid}>
            {CHAT_PROMPTS.map((prompt) => (
              <article key={prompt} className={styles.promptCard}>
                <span className={styles.label}>Prompt</span>
                <p>{prompt}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
