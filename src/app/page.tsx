import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import styles from "@/components/execution-page.module.css";
import {
  DASHBOARD_KPIS,
  DASHBOARD_WIDGETS,
  MODULE_CARDS,
  WORKFLOW_STEPS,
} from "@/lib/execution-content";

const TONE_CLASS = {
  neutral: styles.toneNeutral,
  good: styles.toneGood,
  watch: styles.toneWatch,
  risk: styles.toneRisk,
};

export default function HomePage() {
  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <span className={styles.eyebrow}>AI Program Execution Assistant</span>
            <h1>Turn conversations into governed execution.</h1>
            <p>
              This product is no longer framed as a meeting-notes tool. It is an
              operating layer for PMs and PMOs that captures conversations,
              detects delivery risk, maintains accountability, and automates the
              follow-through across enterprise systems.
            </p>
            <Link href="/intake" className={styles.heroLink}>
              Open the intake workflow
            </Link>
            <div className={styles.heroMeta}>
              <span>Execution intelligence, not summarization</span>
              <span>Approval-first enterprise workflow</span>
              <span>Built for PMs, PMOs, and leadership</span>
            </div>
          </div>

          <div className={styles.metricRail}>
            <div className={styles.metricCard}>
              <span>Command center mode</span>
              <strong>Autonomous PMO Copilot</strong>
              <p>
                The home screen is now a delivery cockpit with live risk,
                follow-through, and governance posture instead of a blank single
                page.
              </p>
            </div>
            <div className={styles.metricCard}>
              <span>Core promise</span>
              <strong>Conversation to execution</strong>
              <p>
                Extract work, validate ownership, approve actions, sync to
                tooling, and keep leadership current.
              </p>
            </div>
            <div className={styles.metricCard}>
              <span>Operator view</span>
              <strong>6-stage workflow</strong>
              <p>
                Intake, minutes, action approval, delivery sync, risk
                intelligence, and executive briefing are all first-class pages.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Program manager command center</h2>
              <p>
                High-signal KPIs and operating widgets keep the whole portfolio
                visible at a glance.
              </p>
            </div>
          </div>

          <div className={styles.kpiGrid}>
            {DASHBOARD_KPIS.map((kpi) => (
              <article key={kpi.label} className={styles.kpiCard}>
                <span className={styles.label}>{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <p className={styles.kpiTrend}>{kpi.trend}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Operational widgets</h2>
              <p>
                These tiles mirror the day-to-day questions a program office
                needs answered without digging through transcripts.
              </p>
            </div>
          </div>

          <div className={styles.widgetGrid}>
            {DASHBOARD_WIDGETS.map((widget) => (
              <article key={widget.title} className={styles.widgetCard}>
                <span className={styles.label}>{widget.title}</span>
                <div className={styles.widgetValueRow}>
                  <strong>{widget.value}</strong>
                  <span className={TONE_CLASS[widget.tone]}>{widget.tone}</span>
                </div>
                <p>{widget.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>End-to-end workflow</h2>
              <p>
                The application now follows a proper operational cadence instead
                of asking the user to do everything inside a single sparse page.
              </p>
            </div>
          </div>

          <div className={styles.timeline}>
            {WORKFLOW_STEPS.map((step) => (
              <article key={step.step} className={styles.timelineCard}>
                <span className={styles.timelineStep}>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.summary}</p>
                <Link href={step.href} className={styles.timelineLink}>
                  Open screen
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>MVP product surfaces</h2>
              <p>
                These are the fresh screens that define the new execution-first
                product story.
              </p>
            </div>
          </div>

          <div className={styles.moduleGrid}>
            {MODULE_CARDS.map((module) => (
              <article key={module.href} className={styles.moduleCard}>
                <span className={styles.pill}>Module</span>
                <h3>{module.title}</h3>
                <p>{module.summary}</p>
                <ul className={styles.bulletList}>
                  {module.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <Link href={module.href} className={styles.cardLink}>
                  Explore this module
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.banner}>
          <span className={styles.eyebrow}>Product positioning</span>
          <h2>Execution intelligence is the differentiator.</h2>
          <p>
            Most competitors stop at transcripts and summaries. This experience
            is built around approvals, accountability, governance, delivery
            system sync, and PMO-grade visibility.
          </p>
          <div className={styles.bannerLinks}>
            <Link href="/actions" className={styles.heroLink}>
              Review AI-suggested actions
            </Link>
            <Link href="/risks" className={styles.heroLink}>
              Inspect risk intelligence
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
