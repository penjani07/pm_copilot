"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import styles from "@/components/execution-page.module.css";
import {
  ACTION_PIPELINE,
  CAPABILITY_CARDS,
  CAPACITY_HEATMAP,
  DASHBOARD_KPIS,
  DASHBOARD_WIDGETS,
  DELIVERY_LANES,
  EXECUTION_TREND,
  GOVERNANCE_CHECKS,
  HERO_SIGNALS,
  INTEGRATION_CLOUD,
  MODULE_CARDS,
  PROGRAM_BOARD_ROWS,
  RISK_MATRIX,
  WORKFLOW_STEPS,
} from "@/lib/execution-content";

type HomeBoardView = "command" | "capacity" | "governance";

const VIEW_LABELS: Record<HomeBoardView, string> = {
  command: "Command center",
  capacity: "Capacity heatmap",
  governance: "Governance view",
};

const TONE_CLASS = {
  neutral: styles.toneNeutral,
  good: styles.toneGood,
  watch: styles.toneWatch,
  risk: styles.toneRisk,
};

export function HomeDashboard() {
  const [activeView, setActiveView] = useState<HomeBoardView>("command");

  return (
    <div className={styles.page}>
      <section className={styles.homeHero}>
        <div className={styles.homeHeroStory}>
          <span className={styles.eyebrow}>AI Program Execution Assistant</span>
          <h1>Manage delivery with the clarity of a dashboard, not the chaos of meeting notes.</h1>
          <p>
            Inspired by the organized feel of modern work-management platforms,
            this home screen now presents PMO Copilot as a polished operations
            product: structured, visual, data-rich, and built for execution.
          </p>

          <div className={styles.homeHeroActions}>
            <Link href="/intake" className={styles.homePrimaryCta}>
              Start with meeting intake
            </Link>
            <Link href="/executive" className={styles.homeSecondaryCta}>
              Open executive summary
            </Link>
          </div>

          <div className={styles.homeSignalGrid}>
            {HERO_SIGNALS.map((signal) => (
              <article key={signal.label} className={styles.homeSignalCard}>
                <span className={styles.label}>{signal.label}</span>
                <strong>{signal.value}</strong>
                <p>{signal.note}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.homeHeroPreview}>
          <div className={styles.heroPreviewFrame}>
            <div className={styles.previewHeaderRow}>
              <div>
                <span className={styles.label}>Live portfolio</span>
                <h2>Program command console</h2>
              </div>
              <span className={styles.toneGood}>Live signals</span>
            </div>

            <Image
              src="/program-hero-illustration.svg"
              alt="Illustration of a PMO Copilot dashboard with charts, widgets, and tracking boards"
              width={860}
              height={560}
              className={styles.heroPreviewImage}
              priority
            />

            <div className={styles.previewMetricStrip}>
              {DASHBOARD_WIDGETS.slice(0, 4).map((widget) => (
                <div key={widget.title} className={styles.previewMetricCard}>
                  <span className={styles.label}>{widget.title}</span>
                  <strong>{widget.value}</strong>
                  <span className={TONE_CLASS[widget.tone]}>{widget.tone}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.homeStatStrip}>
        {DASHBOARD_KPIS.map((kpi) => (
          <article key={kpi.label} className={styles.homeStatCard}>
            <span className={styles.label}>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <p>{kpi.trend}</p>
          </article>
        ))}
      </section>

      <section className={styles.homeCapabilitySection}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Why PMOs would actually use this</h2>
            <p>
              The goal is not prettier minutes. It is a more controllable,
              visible execution layer across projects, teams, and governance.
            </p>
          </div>
        </div>

        <div className={styles.homeCapabilityGrid}>
          <div className={styles.homeCapabilityCards}>
            {CAPABILITY_CARDS.map((card) => (
              <article key={card.title} className={styles.homeCapabilityCard}>
                <h3>{card.title}</h3>
                <p>{card.summary}</p>
                <ul className={styles.bulletList}>
                  {card.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className={styles.homeVisualPair}>
            <article className={styles.homeVisualCard}>
              <span className={styles.pill}>Execution visibility</span>
              <Image
                src="/governance-map.svg"
                alt="Illustration showing heat maps, workflow stages, and governance indicators"
                width={720}
                height={520}
                className={styles.homeVisualImage}
              />
              <p>
                Present work as a living system of programs, approvals,
                workloads, and governance posture instead of repeating the same
                card layout section after section.
              </p>
            </article>

            <article className={styles.homeMiniBoard}>
              <div className={styles.previewHeaderRow}>
                <div>
                  <span className={styles.label}>Connected systems</span>
                  <h3>Tooling in one operating layer</h3>
                </div>
              </div>
              <div className={styles.integrationCloud}>
                {INTEGRATION_CLOUD.map((item) => (
                  <span key={item} className={styles.integrationPill}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.homeBoardSection}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Portfolio board</h2>
            <p>
              A more interactive main page means you can pivot between delivery,
              capacity, and governance signals without leaving the dashboard.
            </p>
          </div>
          <div className={styles.tabs}>
            {(Object.keys(VIEW_LABELS) as HomeBoardView[]).map((view) => (
              <button
                key={view}
                type="button"
                className={`${styles.tabLink} ${activeView === view ? styles.tabLinkActive : ""}`}
                onClick={() => setActiveView(view)}
              >
                {VIEW_LABELS[view]}
              </button>
            ))}
          </div>
        </div>

        {activeView === "command" ? (
          <div className={styles.homeBoardGrid}>
            <article className={styles.homeChartCard}>
              <div className={styles.previewHeaderRow}>
                <div>
                  <span className={styles.label}>Execution trend</span>
                  <h3>Resolved work is rising while at-risk items are shrinking</h3>
                </div>
                <span className={styles.toneGood}>6-week view</span>
              </div>
              <div className={styles.trendChart}>
                {EXECUTION_TREND.map((point) => (
                  <div key={point.label} className={styles.trendColumn}>
                    <div className={styles.trendBars}>
                      <div
                        className={styles.trendBarGood}
                        style={{ height: `${point.completed}%` }}
                        title={`${point.completed}% completed`}
                      />
                      <div
                        className={styles.trendBarRisk}
                        style={{ height: `${point.atRisk * 6}%` }}
                        title={`${point.atRisk}% at risk`}
                      />
                    </div>
                    <span>{point.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.homeTableCard}>
              <div className={styles.previewHeaderRow}>
                <div>
                  <span className={styles.label}>Priority programs</span>
                  <h3>Current program health</h3>
                </div>
              </div>
              <div className={styles.programList}>
                {PROGRAM_BOARD_ROWS.map((row) => (
                  <div key={row.program} className={styles.programRow}>
                    <div className={styles.programRowTop}>
                      <div>
                        <strong>{row.program}</strong>
                        <p>{row.owner}</p>
                      </div>
                      <span className={TONE_CLASS[row.health]}>{row.health}</span>
                    </div>
                    <div className={styles.programProgressMeta}>
                      <span>{row.milestone}</span>
                      <span>{row.progress}% complete</span>
                    </div>
                    <div className={styles.programProgressTrack}>
                      <span style={{ width: `${row.progress}%` }} />
                    </div>
                    <p>{row.attention}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        ) : null}

        {activeView === "capacity" ? (
          <div className={styles.homeBoardGrid}>
            <article className={styles.homeTableCard}>
              <div className={styles.previewHeaderRow}>
                <div>
                  <span className={styles.label}>Team capacity heat map</span>
                  <h3>Where delivery pressure is accumulating</h3>
                </div>
                <span className={styles.toneWatch}>Updated from meetings</span>
              </div>
              <div className={styles.capacityTable}>
                <div className={styles.capacityHeader}>
                  <span>Team</span>
                  {CAPACITY_HEATMAP[0]?.cells.map((cell) => (
                    <span key={cell.label}>{cell.label}</span>
                  ))}
                </div>
                {CAPACITY_HEATMAP.map((row) => (
                  <div key={row.team} className={styles.capacityRow}>
                    <strong>{row.team}</strong>
                    {row.cells.map((cell) => (
                      <div
                        key={`${row.team}-${cell.label}`}
                        className={`${styles.heatCell} ${styles[`heatLevel${cell.load}`]}`}
                        title={`${row.team} ${cell.label}: ${cell.value}`}
                      >
                        {cell.value}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.homeInsightCard}>
              <span className={styles.label}>Capacity insight</span>
              <h3>Security and Treasury are the current pacing teams</h3>
              <p>
                The dashboard makes hot spots explicit so PMs can rebalance work,
                trigger a dependency review, or move milestones before slippage
                becomes visible in Jira alone.
              </p>
              <ul className={styles.bulletList}>
                <li>Treasury peaks on Monday and Wednesday around gateway validation.</li>
                <li>Infra load spikes around change windows and firewall approvals.</li>
                <li>Security remains saturated late in the week, increasing approval risk.</li>
              </ul>
            </article>
          </div>
        ) : null}

        {activeView === "governance" ? (
          <div className={styles.homeBoardGrid}>
            <article className={styles.homeTableCard}>
              <div className={styles.previewHeaderRow}>
                <div>
                  <span className={styles.label}>Governance indicators</span>
                  <h3>Audit the health of execution data itself</h3>
                </div>
              </div>
              <div className={styles.governanceList}>
                {GOVERNANCE_CHECKS.map((check) => (
                  <div key={check.label} className={styles.governanceRow}>
                    <div className={styles.programRowTop}>
                      <div>
                        <strong>{check.label}</strong>
                        <p>{check.note}</p>
                      </div>
                      <span>{check.score}%</span>
                    </div>
                    <div className={styles.governanceTrack}>
                      <span style={{ width: `${check.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.homeTableCard}>
              <div className={styles.previewHeaderRow}>
                <div>
                  <span className={styles.label}>Risk matrix</span>
                  <h3>Signals that still need intervention</h3>
                </div>
              </div>
              <div className={styles.riskMatrixList}>
                {RISK_MATRIX.map((item) => (
                  <div key={item.workstream} className={styles.riskMatrixItem}>
                    <div className={styles.programRowTop}>
                      <div>
                        <strong>{item.workstream}</strong>
                        <p>{item.owner}</p>
                      </div>
                      <span className={styles.toneRisk}>{item.urgency}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span>Impact: {item.impact}</span>
                      <span>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        ) : null}
      </section>

      <section className={styles.homeOperationsSection}>
        <article className={styles.homePipelineCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Execution pipeline</h2>
              <p>
                Show the flow from suggestion to approval to escalation so the
                main page feels operational, not purely promotional.
              </p>
            </div>
          </div>

          <div className={styles.pipelineGrid}>
            {ACTION_PIPELINE.map((stage) => (
              <article key={stage.label} className={styles.pipelineStageCard}>
                <span className={styles.label}>{stage.label}</span>
                <strong>{stage.count}</strong>
                <p>{stage.delta}</p>
                <span className={TONE_CLASS[stage.tone]}>{stage.tone}</span>
              </article>
            ))}
          </div>
        </article>

        <article className={styles.homeWorkflowCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2>How the workflow moves</h2>
              <p>
                The platform now shows a clearer presentation path from intake
                to leadership visibility.
              </p>
            </div>
          </div>
          <div className={styles.timelineCompact}>
            {WORKFLOW_STEPS.map((step) => (
              <div key={step.step} className={styles.timelineCompactItem}>
                <span className={styles.timelineStep}>{step.step}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.homeShowcaseSection}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Feature surfaces worth exploring</h2>
            <p>
              Keep the landing page varied by mixing product modules,
              integration lanes, and focused operational cards.
            </p>
          </div>
        </div>

        <div className={styles.homeShowcaseGrid}>
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

          <div className={styles.homeDeliveryColumn}>
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
                <div className={styles.integrationCloud}>
                  {lane.fields.map((field) => (
                    <span key={field} className={styles.integrationPill}>
                      {field}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.homeBanner}>
        <div>
          <span className={styles.eyebrow}>Presentation-ready PMO surface</span>
          <h2>More organized, more visual, and much easier to present.</h2>
          <p>
            The homepage now behaves more like a modern work management product:
            charts, heat maps, indicators, visual hierarchy, and fewer repeated
            card patterns.
          </p>
        </div>
        <div className={styles.bannerLinks}>
          <Link href="/actions" className={styles.homePrimaryCta}>
            Review AI action workflow
          </Link>
          <Link href="/risks" className={styles.homeSecondaryCta}>
            Open risk intelligence
          </Link>
        </div>
      </section>
    </div>
  );
}
