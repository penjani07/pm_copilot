import { DonutGauge, SegmentedBar, SparkBars } from "@/components/visual-metrics";
import { SiteShell } from "@/components/site-shell";
import { ExecutivePresentationExport } from "@/components/executive-presentation-export";
import styles from "@/components/execution-page.module.css";
import { CHAT_PROMPTS, EXECUTIVE_HIGHLIGHTS } from "@/lib/execution-content";

type ExecutiveTab = "summary" | "presentation";

function parseTab(value: string | string[] | undefined): ExecutiveTab {
  return value === "presentation" ? "presentation" : "summary";
}

export default async function ExecutivePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const activeTab = parseTab(params.tab);

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
              <h2>{activeTab === "presentation" ? "Stakeholder presentation" : "Leadership highlights"}</h2>
              <p>
                {activeTab === "presentation"
                  ? "Curated slides for sponsors and senior stakeholders, designed for briefing rather than raw data review."
                  : "Execution, blockers, milestones, governance."}
              </p>
            </div>
            <div className={styles.tabs}>
              <a
                href="/executive?tab=summary"
                className={`${styles.tabLink} ${activeTab === "summary" ? styles.tabLinkActive : ""}`}
              >
                Summary
              </a>
              <a
                href="/executive?tab=presentation"
                className={`${styles.tabLink} ${activeTab === "presentation" ? styles.tabLinkActive : ""}`}
              >
                Presentation
              </a>
            </div>
          </div>

          {activeTab === "presentation" ? (
            <div className={styles.presentationSurface}>
              <div className={styles.presentationIntro}>
                <div>
                  <span className={styles.label}>Deck objective</span>
                  <h3>Sponsor-ready release readout</h3>
                  <p>
                    A designed five-slide narrative covering current stage, DRAG rating,
                    key risks, mitigation plan, sponsor ask, and execution trend.
                  </p>
                </div>
                <ExecutivePresentationExport />
              </div>

              <div className={styles.slidePreviewGrid}>
                <article className={`${styles.slidePreview} ${styles.slidePreviewHero}`}>
                  <span>01</span>
                  <h3>Executive position</h3>
                  <p>Release 5.2 remains on watch, with approval and dependency risk on the critical path.</p>
                  <div className={styles.deckMetricStrip}>
                    <strong>Watch</strong>
                    <strong>Amber</strong>
                    <strong>89%</strong>
                  </div>
                </article>

                <article className={styles.slidePreview}>
                  <span>02</span>
                  <h3>Current stage</h3>
                  <div className={styles.miniFlow}>
                    <i />
                    <i />
                    <i className={styles.activeFlowNode} />
                    <i />
                  </div>
                  <p>PM review is active before approved tasks move into Jira.</p>
                </article>

                <article className={styles.slidePreview}>
                  <span>03</span>
                  <h3>Risk posture</h3>
                  <div className={styles.riskBars}>
                    <b style={{ width: "86%" }} />
                    <b style={{ width: "64%" }} />
                    <b style={{ width: "58%" }} />
                  </div>
                  <p>Security approval, infra firewall timing, and Treasury validation are highlighted.</p>
                </article>

                <article className={styles.slidePreview}>
                  <span>04</span>
                  <h3>Mitigation steps</h3>
                  <ol className={styles.presentationSteps}>
                    <li>Run dependency review</li>
                    <li>Publish owners and due dates</li>
                    <li>Hold customer communication</li>
                  </ol>
                </article>

                <article className={styles.slidePreview}>
                  <span>05</span>
                  <h3>Progress trend</h3>
                  <div className={styles.previewChart}>
                    {[58, 63, 69, 73, 78, 82].map((value) => (
                      <b key={value} style={{ height: `${value}%` }} />
                    ))}
                  </div>
                  <p>Completion momentum is improving while remaining risk compresses more slowly.</p>
                </article>
              </div>
            </div>
          ) : (
            <div className={styles.highlightGrid}>
              {EXECUTIVE_HIGHLIGHTS.map((highlight) => (
                <article key={highlight.title} className={styles.highlightCard}>
                  <span className={styles.pill}>{highlight.signal}</span>
                  <h3>{highlight.title}</h3>
                  <p>{highlight.summary}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {activeTab === "summary" ? (
          <>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Governance snapshot</h2>
              <p>Evidence behind the narrative.</p>
            </div>
          </div>

          <div className="mb-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <DonutGauge label="Governance Compliance" value={89} tone="emerald" />
            <div className="border-l border-slate-200 pl-5">
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
          </>
        ) : null}
      </div>
    </SiteShell>
  );
}
