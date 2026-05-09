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
            <p>
              This screen packages weekly summaries, project health, delivery
              risk, key achievements, milestones, and governance posture for
              directors, VPs, and PMO leadership.
            </p>
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
              <p>
                The executive view distills the operating picture into decisions,
                risk, asks, and momentum.
              </p>
            </div>
            <div className={styles.metricCard}>
              <span>Outcome</span>
              <strong>Continuous briefings</strong>
              <p>
                Instead of manually assembling updates, the assistant keeps a
                living narrative for leadership consumption.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Leadership highlights</h2>
              <p>
                This is the concise briefing layer that rolls up execution,
                blockers, milestones, and governance quality.
              </p>
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
              <p>
                A leadership surface still needs operational evidence beneath the
                summary so the PMO can trust the story.
              </p>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={styles.label}>Delivery health</span>
              <strong>On watch</strong>
              <p>Release 5.2 progress is real, but dependency closure remains the gating signal.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.label}>Governance compliance</span>
              <strong>89%</strong>
              <p>Owner coverage is strong. Due-date completeness is the main gap left.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.label}>Escalation posture</span>
              <strong>Moderate</strong>
              <p>Leadership should expect one support ask if security approval slips again.</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.label}>Cross-team dependencies</span>
              <strong>18 tracked</strong>
              <p>8 of them are directly tied to the current release milestone path.</p>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>AI chat assistant prompts</h2>
              <p>
                Leadership and PMOs can interrogate the portfolio directly
                instead of waiting for a custom report.
              </p>
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
