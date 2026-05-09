import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import styles from "@/components/execution-page.module.css";
import { DELIVERY_LANES } from "@/lib/execution-content";

export default function DeliveryPage() {
  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>Delivery Orchestration</span>
            <h1>Push approved work into enterprise tooling and keep it moving.</h1>
            <p>
              This module is where the assistant becomes operationally valuable:
              routing tasks, syncing status changes, proposing follow-up
              meetings, and automating reminders when commitments drift.
            </p>
            <div className={styles.heroMeta}>
              <span>Jira and Azure DevOps mapping</span>
              <span>Calendar follow-up automation</span>
              <span>Bi-directional execution sync</span>
            </div>
          </div>

          <div className={styles.metricRail}>
            <div className={styles.metricCard}>
              <span>Enterprise rule</span>
              <strong>Approve, then sync</strong>
              <p>
                Nothing goes straight from AI into production systems without a
                review checkpoint.
              </p>
            </div>
            <div className={styles.metricCard}>
              <span>Automation payoff</span>
              <strong>Operational cadence</strong>
              <p>
                The assistant keeps work, meetings, and stakeholder nudges tied
                together rather than acting as isolated features.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Integration lanes</h2>
              <p>
                Each lane represents a controlled path from AI output into a
                real execution system.
              </p>
            </div>
          </div>

          <div className={styles.integrationGrid}>
            {DELIVERY_LANES.map((lane) => (
              <article key={lane.title} className={styles.integrationCard}>
                <div className={styles.cardTopRow}>
                  <div>
                    <span className={styles.pill}>{lane.system}</span>
                    <h3>{lane.title}</h3>
                  </div>
                  <span className={styles.toneGood}>{lane.status}</span>
                </div>
                <p>{lane.summary}</p>
                <ul className={styles.bulletList}>
                  {lane.fields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Operational flow</h2>
              <p>
                The delivery lane now behaves like a workflow engine rather than
                a one-time export button.
              </p>
            </div>
          </div>

          <div className={styles.timeline}>
            <article className={styles.timelineCard}>
              <span className={styles.timelineStep}>01</span>
              <h3>AI suggests the work</h3>
              <p>Tasks, owners, risks, and system mappings are generated from the approved MoM.</p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.timelineStep}>02</span>
              <h3>PM validates routing</h3>
              <p>Merge duplicates, tune issue types, and confirm sprint or board placement.</p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.timelineStep}>03</span>
              <h3>Systems sync and watch back</h3>
              <p>Ticket status, missed due dates, and blocked dependencies feed the PMO view continuously.</p>
            </article>
          </div>
        </section>

        <section className={styles.banner}>
          <span className={styles.eyebrow}>Follow-up automation</span>
          <h2>Meetings stop being the end of the process.</h2>
          <p>
            If unresolved blockers remain, the assistant proposes a follow-up
            meeting, attendee list, agenda, and reminder sequence automatically.
          </p>
          <div className={styles.bannerLinks}>
            <Link href="/actions" className={styles.heroLink}>
              Review actions first
            </Link>
            <Link href="/risks" className={styles.heroLink}>
              Inspect blocker heatmap
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
