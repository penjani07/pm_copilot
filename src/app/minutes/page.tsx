import { SiteShell } from "@/components/site-shell";
import styles from "@/components/execution-page.module.css";
import {
  MINUTES_METADATA,
  MINUTES_REFINED,
  MINUTES_TRANSCRIPT,
} from "@/lib/execution-content";

export default function MinutesPage() {
  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>Golden Output</span>
            <h1>Refine the meeting into a trusted operating record.</h1>
            <p>
              This screen turns raw conversation into a PMO-ready set of
              minutes, decisions, blockers, dependencies, and follow-up signals.
              It is the controlled bridge between ingestion and action creation.
            </p>
            <div className={styles.heroMeta}>
              <span>Left: raw transcript</span>
              <span>Center: AI refined MoM</span>
              <span>Right: extracted metadata</span>
            </div>
          </div>

          <div className={styles.metricRail}>
            <div className={styles.metricCard}>
              <span>Purpose</span>
              <strong>Review before automation</strong>
              <p>
                The minutes become the approval-grade record that downstream
                tasks and governance checks rely on.
              </p>
            </div>
            <div className={styles.metricCard}>
              <span>Why it matters</span>
              <strong>Shared source of truth</strong>
              <p>
                Delivery teams, PMOs, and leaders see the same cleaned-up view
                instead of interpreting the transcript differently.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Three-panel review surface</h2>
              <p>
                The layout mirrors how real operators inspect meeting evidence:
                source, interpretation, and structured output side by side.
              </p>
            </div>
          </div>

          <div className={styles.splitGrid}>
            <article className={styles.transcriptPanel}>
              <span className={styles.pill}>Raw transcript</span>
              <h3>Original meeting evidence</h3>
              <div className={styles.transcriptList}>
                {MINUTES_TRANSCRIPT.map((line) => (
                  <div key={line} className={styles.transcriptSnippet}>
                    {line}
                  </div>
                ))}
              </div>
            </article>

            <div className={styles.minutesGrid}>
              {MINUTES_REFINED.map((panel) => (
                <article key={panel.title} className={styles.minutesPanel}>
                  <span className={styles.pill}>{panel.title}</span>
                  {panel.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </article>
              ))}
            </div>

            <div className={styles.metaGrid}>
              {MINUTES_METADATA.map((card) => (
                <article key={card.label} className={styles.metaCard}>
                  <span className={styles.label}>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>What this stage resolves</h2>
              <p>
                The MoM layer is where the system proves it understood the
                meeting before it writes into Jira or starts nudging people.
              </p>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <span className={styles.label}>Decisions</span>
              <p>Captured explicitly so stakeholders can revisit intent later.</p>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.label}>Dependencies</span>
              <p>Called out as first-class blockers instead of getting buried in notes.</p>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.label}>Escalations</span>
              <p>Surfaced early when tone, latency, or ownership drift suggests risk.</p>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
