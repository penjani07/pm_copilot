"use client";

import { Download, ExternalLink } from "lucide-react";

type Risk = {
  label: string;
  level: "High" | "Medium" | "Low";
  mitigation: string;
};

const risks: Risk[] = [
  {
    label: "Security approval latency",
    level: "High",
    mitigation: "Upload control evidence package, request director review, and confirm approval owner by next checkpoint.",
  },
  {
    label: "Infra firewall dependency",
    level: "Medium",
    mitigation: "Escalate change ticket in daily release checkpoint and reserve validation window immediately after completion.",
  },
  {
    label: "Treasury timeout validation",
    level: "Medium",
    mitigation: "Pair Treasury and Infra leads for a focused validation run before UAT readiness is declared.",
  },
];

const mitigations = [
  "Run a 30-minute dependency review across Treasury, Infra, Security, and PMO.",
  "Assign named owners for every critical-path blocker and publish due dates in Jira.",
  "Hold customer communication until gateway stability and approval status are both green.",
  "Send a sponsor-ready checkpoint if security approval is not complete by the next governance review.",
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createRiskRows() {
  return risks
    .map(
      (risk) => `
        <div class="risk-row">
          <span class="risk-level ${risk.level.toLowerCase()}">${escapeHtml(risk.level)}</span>
          <div>
            <strong>${escapeHtml(risk.label)}</strong>
            <p>${escapeHtml(risk.mitigation)}</p>
          </div>
        </div>
      `,
    )
    .join("");
}

function createMitigationList() {
  return mitigations
    .map((item, index) => `<li><span>${index + 1}</span>${escapeHtml(item)}</li>`)
    .join("");
}

function createDeckHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Executive Stakeholder Readout</title>
  <style>
    @page { size: 16in 9in; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #0b1220;
      color: #0f172a;
      font-family: Arial, Helvetica, sans-serif;
    }
    .slide {
      position: relative;
      width: 16in;
      height: 9in;
      padding: 0.68in 0.78in;
      overflow: hidden;
      background: #f8fafc;
      page-break-after: always;
    }
    .cover {
      color: #ffffff;
      background:
        linear-gradient(120deg, rgba(12,102,228,0.96), rgba(15,23,42,0.98)),
        radial-gradient(circle at 84% 20%, rgba(45,212,191,0.46), transparent 28%);
    }
    .eyebrow {
      margin: 0 0 0.24in;
      color: #0c66e4;
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .cover .eyebrow { color: #a7f3d0; }
    h1 {
      max-width: 9.2in;
      margin: 0;
      font-size: 48pt;
      line-height: 0.96;
      letter-spacing: -0.035em;
    }
    h2 {
      margin: 0;
      font-size: 34pt;
      line-height: 1.04;
      letter-spacing: -0.025em;
    }
    h3 {
      margin: 0 0 0.08in;
      font-size: 18pt;
    }
    p {
      margin: 0;
      color: #475569;
      font-size: 14pt;
      line-height: 1.5;
    }
    .cover p { color: #dbeafe; max-width: 7.2in; font-size: 17pt; }
    .footer {
      position: absolute;
      left: 0.78in;
      right: 0.78in;
      bottom: 0.4in;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 10pt;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .cover .footer { color: #bfdbfe; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.28in;
      margin-top: 0.48in;
    }
    .metric {
      border-left: 5px solid #0c66e4;
      padding-left: 0.18in;
    }
    .metric strong {
      display: block;
      font-size: 30pt;
      letter-spacing: -0.04em;
    }
    .metric span {
      color: #64748b;
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 0.55in;
      margin-top: 0.42in;
      align-items: start;
    }
    .stage-map {
      display: grid;
      gap: 0.16in;
      margin-top: 0.28in;
    }
    .stage {
      display: grid;
      grid-template-columns: 0.42in 1fr;
      gap: 0.16in;
      align-items: start;
      padding: 0.13in 0;
      border-top: 1px solid #dbe3ef;
    }
    .stage b {
      display: grid;
      place-items: center;
      width: 0.34in;
      height: 0.34in;
      border-radius: 999px;
      background: #e9f2ff;
      color: #0c66e4;
      font-size: 11pt;
    }
    .stage.active b {
      background: #0c66e4;
      color: #ffffff;
    }
    .stage strong {
      display: block;
      font-size: 15pt;
    }
    .stage p { font-size: 12pt; }
    .rating {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.2in;
      margin-top: 0.24in;
    }
    .rating-block {
      min-height: 1.1in;
      padding-left: 0.18in;
      border-left: 5px solid #f59e0b;
    }
    .rating-block strong {
      display: block;
      font-size: 28pt;
    }
    .diagram {
      width: 100%;
      height: 3.15in;
      margin-top: 0.24in;
    }
    .risk-row {
      display: grid;
      grid-template-columns: 1.1in 1fr;
      gap: 0.22in;
      padding: 0.18in 0;
      border-top: 1px solid #dbe3ef;
    }
    .risk-level {
      width: fit-content;
      height: fit-content;
      padding: 0.08in 0.14in;
      border-radius: 999px;
      font-size: 11pt;
      font-weight: 800;
    }
    .risk-level.high { background: #fee2e2; color: #b91c1c; }
    .risk-level.medium { background: #fef3c7; color: #a16207; }
    .risk-level.low { background: #dcfce7; color: #15803d; }
    .risk-row p { font-size: 12pt; }
    .mitigations {
      display: grid;
      gap: 0.16in;
      margin: 0.38in 0 0;
      padding: 0;
      list-style: none;
    }
    .mitigations li {
      display: grid;
      grid-template-columns: 0.42in 1fr;
      gap: 0.16in;
      align-items: start;
      color: #334155;
      font-size: 14pt;
      line-height: 1.4;
    }
    .mitigations span {
      display: grid;
      place-items: center;
      width: 0.32in;
      height: 0.32in;
      border-radius: 999px;
      background: #0c66e4;
      color: #ffffff;
      font-size: 11pt;
      font-weight: 800;
    }
    .bar-chart {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.24in;
      align-items: end;
      height: 3.4in;
      margin-top: 0.45in;
      border-bottom: 2px solid #cbd5e1;
    }
    .bar-col {
      display: grid;
      justify-items: center;
      gap: 0.1in;
    }
    .bar {
      width: 0.36in;
      border-radius: 999px 999px 0 0;
      background: linear-gradient(#0c66e4, #0f766e);
    }
    .bar-risk {
      width: 0.26in;
      border-radius: 999px 999px 0 0;
      background: #f59e0b;
    }
    .bar-label {
      color: #64748b;
      font-size: 10pt;
      font-weight: 800;
    }
    .sponsor-ask {
      max-width: 10.8in;
      margin-top: 0.45in;
      padding-left: 0.26in;
      border-left: 7px solid #0c66e4;
    }
    .sponsor-ask strong {
      display: block;
      margin-bottom: 0.12in;
      font-size: 22pt;
    }
    @media print {
      body { background: #ffffff; }
      .slide { box-shadow: none; }
    }
  </style>
</head>
<body>
  <section class="slide cover">
    <p class="eyebrow">Senior stakeholder readout</p>
    <h1>Release 5.2 is progressing, with approval and dependency risk on the critical path.</h1>
    <p style="margin-top:0.36in;">A sponsor-ready briefing for steering committee review, focused on business impact, current stage, key risks, mitigation plan, and leadership asks.</p>
    <div class="footer"><span>PMO Copilot</span><span>Executive deck</span></div>
  </section>

  <section class="slide">
    <p class="eyebrow">Executive position</p>
    <h2>Current stage: PM review and dependency closure</h2>
    <div class="metrics">
      <div class="metric"><span>Delivery health</span><strong>Watch</strong></div>
      <div class="metric"><span>DRAG rating</span><strong>Amber</strong></div>
      <div class="metric"><span>Governance</span><strong>89%</strong></div>
      <div class="metric"><span>Escalation</span><strong>Moderate</strong></div>
    </div>
    <div class="two-col">
      <div>
        <h3>Decision narrative</h3>
        <p>Technical work continues, but release confidence depends on closing the security approval path and confirming infra readiness before UAT is declared.</p>
      </div>
      <div>
        <h3>Leadership ask</h3>
        <p>Keep the release on watch and authorize sponsor escalation if approval status is not green by the next governance checkpoint.</p>
      </div>
    </div>
    <div class="footer"><span>Executive summary</span><span>01</span></div>
  </section>

  <section class="slide">
    <p class="eyebrow">Operating flow</p>
    <h2>From meeting signal to governed execution</h2>
    <div class="two-col">
      <div class="stage-map">
        <div class="stage"><b>1</b><div><strong>Evidence captured</strong><p>Meeting transcript loaded and structured.</p></div></div>
        <div class="stage"><b>2</b><div><strong>AI analysis complete</strong><p>Risks, decisions, owners, and action items extracted.</p></div></div>
        <div class="stage active"><b>3</b><div><strong>PM review active</strong><p>High-priority items are being validated before Jira push.</p></div></div>
        <div class="stage"><b>4</b><div><strong>Delivery sync next</strong><p>Approved tasks move into Jira after governance checks pass.</p></div></div>
      </div>
      <svg class="diagram" viewBox="0 0 560 340" role="img" aria-label="Flow diagram">
        <defs>
          <linearGradient id="g" x1="0" x2="1"><stop stop-color="#0c66e4"/><stop offset="1" stop-color="#14b8a6"/></linearGradient>
        </defs>
        <path d="M80 170 C160 40, 250 300, 340 130 S470 100, 500 210" fill="none" stroke="url(#g)" stroke-width="18" stroke-linecap="round"/>
        <circle cx="80" cy="170" r="34" fill="#dbeafe"/><text x="80" y="177" text-anchor="middle" font-size="20" font-weight="700" fill="#0c66e4">1</text>
        <circle cx="235" cy="228" r="34" fill="#ccfbf1"/><text x="235" y="235" text-anchor="middle" font-size="20" font-weight="700" fill="#0f766e">2</text>
        <circle cx="352" cy="130" r="42" fill="#fef3c7"/><text x="352" y="138" text-anchor="middle" font-size="22" font-weight="700" fill="#a16207">3</text>
        <circle cx="500" cy="210" r="34" fill="#e0e7ff"/><text x="500" y="217" text-anchor="middle" font-size="20" font-weight="700" fill="#4f46e5">4</text>
        <text x="65" y="258" font-size="16" fill="#334155">Source</text>
        <text x="190" y="303" font-size="16" fill="#334155">Analysis</text>
        <text x="300" y="70" font-size="16" fill="#334155">Review gate</text>
        <text x="452" y="288" font-size="16" fill="#334155">Jira sync</text>
      </svg>
    </div>
    <div class="footer"><span>Current stage</span><span>02</span></div>
  </section>

  <section class="slide">
    <p class="eyebrow">Risk posture</p>
    <h2>Key risks are manageable, but time-bound</h2>
    <div class="rating">
      <div class="rating-block"><span>Delivery</span><strong>Amber</strong><p>Critical path remains dependent on security and infra closure.</p></div>
      <div class="rating-block"><span>Governance</span><strong>Green / Amber</strong><p>Ownership is strong; due-date completeness needs cleanup.</p></div>
    </div>
    <div style="margin-top:0.34in;">${createRiskRows()}</div>
    <div class="footer"><span>Risk and DRAG rating</span><span>03</span></div>
  </section>

  <section class="slide">
    <p class="eyebrow">Mitigation plan</p>
    <h2>Recommended actions before sponsor escalation</h2>
    <ul class="mitigations">${createMitigationList()}</ul>
    <div class="sponsor-ask">
      <strong>Sponsor ask</strong>
      <p>Maintain amber status, reinforce director-level ownership for security approval, and authorize escalation if approval or firewall completion slips past the next checkpoint.</p>
    </div>
    <div class="footer"><span>Mitigation steps</span><span>04</span></div>
  </section>

  <section class="slide">
    <p class="eyebrow">Progress trend</p>
    <h2>Execution is improving, while risk is compressing slower than desired</h2>
    <div class="bar-chart">
      ${[
        ["W1", 58, 14],
        ["W2", 63, 12],
        ["W3", 69, 10],
        ["W4", 73, 9],
        ["W5", 78, 7],
        ["W6", 82, 6],
      ]
        .map(
          ([label, complete, risk]) => `
            <div class="bar-col">
              <div style="display:flex;align-items:end;gap:0.08in;">
                <div class="bar" style="height:${Number(complete) * 0.035}in"></div>
                <div class="bar-risk" style="height:${Number(risk) * 0.08}in"></div>
              </div>
              <span class="bar-label">${label}</span>
            </div>
          `,
        )
        .join("")}
    </div>
    <p style="margin-top:0.22in;">Blue-green bars show completion momentum. Amber bars show remaining risk load.</p>
    <div class="footer"><span>Trend and outlook</span><span>05</span></div>
  </section>
</body>
</html>`;
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function ExecutivePresentationExport() {
  function exportPresentation() {
    downloadTextFile(
      "executive-stakeholder-readout.html",
      createDeckHtml(),
      "text/html;charset=utf-8",
    );
  }

  function exportPowerPointCompatible() {
    downloadTextFile(
      "executive-stakeholder-readout.ppt",
      createDeckHtml(),
      "application/vnd.ms-powerpoint;charset=utf-8",
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" className="app-primary-action" onClick={exportPresentation}>
        <Download className="h-4 w-4" />
        Export designed deck
      </button>
      <button type="button" className="app-secondary-action" onClick={exportPowerPointCompatible}>
        <ExternalLink className="h-4 w-4" />
        PowerPoint-compatible
      </button>
    </div>
  );
}
