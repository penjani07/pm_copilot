"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  IMPORT_DOCUMENT_ACCEPT,
  IMPORT_DOCUMENT_ERROR_MESSAGE,
  IMPORT_DOCUMENT_TYPES_LABEL,
  isSupportedImportDocument,
} from "@/lib/document-import";
import { SiteShell } from "@/components/site-shell";
import type {
  ActionItem,
  AgendaSection,
  CreatedJiraEpicBundle,
  CreatedOutlookInvite,
  EpicDraft,
  JiraSettings,
  MeetingAnalysis,
  OutlookSettings,
} from "@/lib/types";
import {
  JIRA_STORAGE_KEY,
  OUTLOOK_STORAGE_KEY,
  WORKFLOW_SESSION_STORAGE_KEY,
  INITIAL_JIRA_SETTINGS,
  INITIAL_OUTLOOK_SETTINGS,
  hasOutlookCredentials,
  parseStoredJiraSettings,
  parseStoredOutlookSettings,
  parseStoredWorkflowSession,
} from "@/lib/workflow-storage";
import { notifyWorkflowSnapshotChanged } from "@/lib/use-workflow-snapshot";

import styles from "@/app/page.module.css";

const SAMPLE_TRANSCRIPT = `Weekly Product Delivery Sync

Priya: We need the onboarding checklist refresh shipped before the customer training next Thursday.
Marcus: I can rewrite the setup steps and record the missing screenshots by Tuesday afternoon.
Lena: Please also send me the final copy so I can update the knowledge base article.
Priya: Good. Marcus owns the checklist rewrite. Lena owns the KB update after Marcus sends the draft.
Devon: The analytics bug for workspace invites is still blocking support. I can pair with Nina and push a fix by tomorrow evening.
Nina: Works for me. I will verify the patch in staging once Devon opens it.
Priya: Great. I also need a draft rollout note for customer success by Wednesday morning. I will take that.
Marcus: One risk is that we still do not have approval on the new screenshots from design.
Priya: I will follow up with design today.`;


type TicketState = {
  status: "idle" | "creating" | "success" | "error";
  message?: string;
  issueKey?: string;
  issueUrl?: string;
  assigneeName?: string | null;
};

type PlanState = {
  status: "idle" | "creating" | "success" | "error";
  message?: string;
  epicKey?: string;
  epicUrl?: string;
  storyCount?: number;
};

type InviteState = {
  status: "idle" | "creating" | "success" | "error";
  message?: string;
  subject?: string;
  webLink?: string | null;
  joinUrl?: string | null;
  start?: string;
};

type WorkflowTab = "intake" | "review" | "deliver" | "settings";

const WORKFLOW_TAB_META: Record<
  WorkflowTab,
  { description: string; eyebrow: string; heading: string; step: string }
> = {
  intake: {
    description:
      "Pull in notes, files, or transcripts so the workspace starts with a clean source of truth.",
    eyebrow: "Stage 01",
    heading: "Capture the meeting source.",
    step: "01",
  },
  review: {
    description:
      "Run analysis, then inspect the meeting summary, agenda briefs, and extracted work before shipping anything.",
    eyebrow: "Stage 02",
    heading: "Review what the AI understood.",
    step: "02",
  },
  deliver: {
    description:
      "Package the output into Jira work and a follow-up meeting plan once the analysis looks right.",
    eyebrow: "Stage 03",
    heading: "Move the work into delivery.",
    step: "03",
  },
  settings: {
    description:
      "Configure the systems behind the workflow so imports, Jira creation, and Outlook scheduling are ready when you need them.",
    eyebrow: "Stage 04",
    heading: "Connect the tools behind the workflow.",
    step: "04",
  },
};

const OPENAI_CONFIGURATION_MESSAGE =
  "File import works without OpenAI, but analysis needs OPENAI_API_KEY in .env.local. Add the key and restart the dev server to enable Analyze transcript.";

function formatMeetingDate(value: string | null) {
  if (!value) {
    return "No explicit meeting date detected";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function transcriptWordCount(transcript: string) {
  const trimmed = transcript.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function createTranscriptPreview(transcript: string, maxCharacters = 420) {
  const normalized = transcript
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ");

  if (!normalized) {
    return "No transcript loaded yet.";
  }

  if (normalized.length <= maxCharacters) {
    return normalized;
  }

  return `${normalized.slice(0, maxCharacters).trimEnd()}...`;
}

function formatDateTimeValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function parsePositiveNumber(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseAdditionalAttendeeEntries(raw: string) {
  return raw
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .flatMap((value) => {
      const match = value.match(/^(.*)<([^>]+)>$/);
      if (match) {
        return match[2].trim().includes("@") ? [match[2].trim()] : [];
      }

      return value.includes("@") ? [value] : [];
    });
}

type SourceSummaryCardProps = {
  title: string;
  fileName: string | null;
  sourceMessage: string | null;
  wordCount: number;
  transcriptPreview: string;
};

function SourceSummaryCard({
  title,
  fileName,
  sourceMessage,
  wordCount,
  transcriptPreview,
}: SourceSummaryCardProps) {
  return (
    <section className={styles.sourceSummaryCard}>
      <div className={styles.sourceSummaryHeader}>
        <div>
          <span className={styles.summaryLabel}>{title}</span>
          <h3 className={styles.sourceSummaryTitle}>
            {fileName ?? "Pasted meeting transcript"}
          </h3>
        </div>

        <div className={styles.sourceSummaryMeta}>
          <span className={styles.fileChip}>
            {wordCount} word{wordCount === 1 ? "" : "s"}
          </span>
          <span className={styles.fileChip}>Ready for review</span>
        </div>
      </div>

      {sourceMessage ? (
        <p className={styles.sourceSummaryMessage}>{sourceMessage}</p>
      ) : null}

      <div className={styles.sourcePreview}>{transcriptPreview}</div>
    </section>
  );
}

export function MeetingWorkspacePage() {
  const [transcript, setTranscript] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [sourceMessage, setSourceMessage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] =
    useState<WorkflowTab>("intake");
  const [isOpenAiConfigured, setIsOpenAiConfigured] = useState<boolean | null>(
    null,
  );
  const [planStates, setPlanStates] = useState<Record<string, PlanState>>({});
  const [ticketStates, setTicketStates] = useState<Record<string, TicketState>>(
    {},
  );
  const [jiraSettings, setJiraSettings] =
    useState<JiraSettings>(INITIAL_JIRA_SETTINGS);
  const [outlookSettings, setOutlookSettings] =
    useState<OutlookSettings>(INITIAL_OUTLOOK_SETTINGS);
  const [inviteState, setInviteState] = useState<InviteState>({
    status: "idle",
  });
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setJiraSettings(
      parseStoredJiraSettings(window.localStorage.getItem(JIRA_STORAGE_KEY)),
    );
    setOutlookSettings(
      parseStoredOutlookSettings(
        window.localStorage.getItem(OUTLOOK_STORAGE_KEY),
      ),
    );
    const workflowSession = parseStoredWorkflowSession(
      window.localStorage.getItem(WORKFLOW_SESSION_STORAGE_KEY),
    );

    if (workflowSession.transcript) {
      setTranscript(workflowSession.transcript);
      setSelectedFileName(workflowSession.selectedFileName);
      setSourceMessage(workflowSession.sourceMessage);
      setAnalysis(workflowSession.analysis);
      setActiveWorkflowTab(
        workflowSession.analysis
          ? "review"
          : workflowSession.transcript
            ? "review"
            : "intake",
      );
    }

    setIsStorageReady(true);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadConfigurationStatus() {
      try {
        const response = await fetch("/api/config", { cache: "no-store" });
        const payload = (await response.json()) as {
          openAiConfigured?: boolean;
        };

        if (!isActive) {
          return;
        }

        setIsOpenAiConfigured(Boolean(payload.openAiConfigured));
      } catch {
        if (!isActive) {
          return;
        }

        // If the status check fails, keep analysis available and fall back to
        // the server-side validation already enforced by /api/analyze.
        setIsOpenAiConfigured(null);
      }
    }

    void loadConfigurationStatus();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    window.localStorage.setItem(JIRA_STORAGE_KEY, JSON.stringify(jiraSettings));
    notifyWorkflowSnapshotChanged();
  }, [isStorageReady, jiraSettings]);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    window.localStorage.setItem(
      OUTLOOK_STORAGE_KEY,
      JSON.stringify(outlookSettings),
    );
    notifyWorkflowSnapshotChanged();
  }, [isStorageReady, outlookSettings]);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    window.localStorage.setItem(
      WORKFLOW_SESSION_STORAGE_KEY,
      JSON.stringify({
        transcript,
        selectedFileName,
        sourceMessage,
        analysis,
        updatedAt: new Date().toISOString(),
      }),
    );
    notifyWorkflowSnapshotChanged();
  }, [
    analysis,
    isStorageReady,
    selectedFileName,
    sourceMessage,
    transcript,
  ]);

  const wordCount = useMemo(() => transcriptWordCount(transcript), [transcript]);
  const hasTranscript = transcript.trim().length > 0;
  const isAnalyzeDisabled =
    isAnalyzing ||
    isUploadingFile ||
    !hasTranscript ||
    isOpenAiConfigured === false;
  const isJiraReady = useMemo(
    () =>
      Boolean(
        jiraSettings.siteUrl &&
          jiraSettings.email &&
          jiraSettings.apiToken &&
          jiraSettings.projectKey,
      ),
    [jiraSettings],
  );

  const isJiraPlanReady = useMemo(
    () =>
      Boolean(
        jiraSettings.siteUrl &&
          jiraSettings.email &&
          jiraSettings.apiToken &&
          jiraSettings.projectKey &&
          jiraSettings.epicIssueType &&
          jiraSettings.storyIssueType,
      ),
    [jiraSettings],
  );

  const isOutlookReady = useMemo(
    () => hasOutlookCredentials(outlookSettings),
    [outlookSettings],
  );
  const transcriptPreview = useMemo(
    () => createTranscriptPreview(transcript),
    [transcript],
  );

  const actionItemsByReference = useMemo(
    () =>
      new Map((analysis?.actionItems ?? []).map((item) => [item.referenceId, item])),
    [analysis],
  );

  const suggestedInviteeCount = useMemo(
    () =>
      new Set([
        ...(analysis?.followUpMeeting.attendees
          .map((attendee) => attendee.email?.trim().toLowerCase())
          .filter((value): value is string => Boolean(value)) ?? []),
        ...parseAdditionalAttendeeEntries(outlookSettings.additionalAttendees).map(
          (value) => value.trim().toLowerCase(),
        ),
      ]).size,
    [analysis, outlookSettings.additionalAttendees],
  );

  const workflowTabs = useMemo(
    () => [
      {
        id: "intake" as const,
        label: "Intake",
        description: "Import or paste the meeting source.",
        signal: hasTranscript
          ? selectedFileName ?? `${wordCount} word${wordCount === 1 ? "" : "s"} loaded`
          : "Awaiting source",
      },
      {
        id: "review" as const,
        label: "Review",
        description: "Inspect the AI analysis before shipping.",
        signal: analysis
          ? `${analysis.agendaSections.length} brief${analysis.agendaSections.length === 1 ? "" : "s"}`
          : "Run analysis",
      },
      {
        id: "deliver" as const,
        label: "Deliver",
        description: "Create tickets and send the follow-up plan.",
        signal: analysis
          ? `${analysis.actionItems.length} action item${analysis.actionItems.length === 1 ? "" : "s"}`
          : "Needs output",
      },
      {
        id: "settings" as const,
        label: "Settings",
        description: "Connect Jira and Outlook for the workflow.",
        signal: `${Number(isJiraReady) + Number(isOutlookReady)}/2 ready`,
      },
    ],
    [
      analysis,
      hasTranscript,
      isJiraReady,
      isOutlookReady,
      selectedFileName,
      wordCount,
    ],
  );

  const activeWorkflowMeta = WORKFLOW_TAB_META[activeWorkflowTab];
  const canOpenReview = hasTranscript;
  const canOpenDeliver = Boolean(analysis);
  const stageAvailability: Record<WorkflowTab, boolean> = {
    intake: true,
    review: canOpenReview,
    deliver: canOpenDeliver,
    settings: true,
  };

  function focusWorkflowTab(tab: WorkflowTab) {
    if (!stageAvailability[tab]) {
      return;
    }

    setActiveWorkflowTab(tab);
  }

  function updateJiraSetting(field: keyof JiraSettings) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setJiraSettings((current) => ({ ...current, [field]: value }));
    };
  }

  function updateOutlookSetting(field: keyof OutlookSettings) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setOutlookSettings((current) => ({ ...current, [field]: value }));
    };
  }

  async function applyFile(file: File) {
    if (!isSupportedImportDocument(file)) {
      setError(IMPORT_DOCUMENT_ERROR_MESSAGE);
      return;
    }

    setIsUploadingFile(true);
    setError(null);
    setSourceMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import/file", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        error?: string;
        importedDocument?: {
          fileName: string;
          sourceMessage: string;
          transcript: string;
        };
      };

      if (!response.ok || !payload.importedDocument) {
        throw new Error(payload.error || "Document import failed.");
      }

      setTranscript(payload.importedDocument.transcript);
      setSelectedFileName(payload.importedDocument.fileName);
      setSourceMessage(payload.importedDocument.sourceMessage);
      setAnalysis(null);
      setPlanStates({});
      setTicketStates({});
      setInviteState({ status: "idle" });
      setActiveWorkflowTab("review");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected document import error.",
      );
    } finally {
      setIsUploadingFile(false);
    }
  }

  async function onFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await applyFile(file);
    event.target.value = "";
  }

  async function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    await applyFile(file);
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  async function handleAnalyze() {
    if (isOpenAiConfigured === false) {
      setError(OPENAI_CONFIGURATION_MESSAGE);
      return;
    }

    if (!hasTranscript) {
      setError("Paste meeting notes or import a source transcript first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          cadenceWindowDays: parsePositiveNumber(
            outlookSettings.cadenceWithinDays,
            5,
          ),
        }),
      });

      const payload = (await response.json()) as {
        analysis?: MeetingAnalysis;
        error?: string;
      };

      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error || "Analysis failed.");
      }

      startTransition(() => {
        setAnalysis(payload.analysis ?? null);
        setActiveWorkflowTab("review");
        setPlanStates({});
        setTicketStates({});
        setInviteState({ status: "idle" });
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while analyzing the transcript.";

      if (message.includes("OPENAI_API_KEY is not configured.")) {
        setIsOpenAiConfigured(false);
        setError(OPENAI_CONFIGURATION_MESSAGE);
        return;
      }

      setError(
        message,
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleCreateEpicBundle(epic: EpicDraft) {
    if (!analysis || !isJiraPlanReady) {
      return;
    }

    setPlanStates((current) => ({
      ...current,
      [epic.referenceId]: { status: "creating" },
    }));

    try {
      const response = await fetch("/api/jira/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          epic,
          analysis: {
            meetingTitle: analysis.meetingTitle,
            conciseSummary: analysis.conciseSummary,
          },
          settings: jiraSettings,
        }),
      });

      const payload = (await response.json()) as
        | (CreatedJiraEpicBundle & { error?: string })
        | { error?: string };

      if (
        !response.ok ||
        !("epic" in payload) ||
        !payload.epic.issueKey ||
        !payload.epic.issueUrl
      ) {
        throw new Error(payload.error || "Jira epic bundle creation failed.");
      }

      setPlanStates((current) => ({
        ...current,
        [epic.referenceId]: {
          status: "success",
          message:
            payload.note ??
            `Created epic and ${payload.stories.length} linked story item(s).`,
          epicKey: payload.epic.issueKey,
          epicUrl: payload.epic.issueUrl,
          storyCount: payload.stories.length,
        },
      }));
    } catch (caughtError) {
      setPlanStates((current) => ({
        ...current,
        [epic.referenceId]: {
          status: "error",
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Unexpected Jira plan error.",
        },
      }));
    }
  }

  async function handleCreateAllEpicBundles() {
    if (!analysis) {
      return;
    }

    for (const epic of analysis.deliveryPlan.epics) {
      await handleCreateEpicBundle(epic);
    }
  }

  async function handleCreateTicket(actionItem: ActionItem) {
    if (!analysis || !isJiraReady) {
      return;
    }

    setTicketStates((current) => ({
      ...current,
      [actionItem.referenceId]: { status: "creating" },
    }));

    try {
      const response = await fetch("/api/jira/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionItem,
          analysis: {
            meetingTitle: analysis.meetingTitle,
            conciseSummary: analysis.conciseSummary,
          },
          settings: jiraSettings,
        }),
      });

      const payload = (await response.json()) as {
        issueKey?: string;
        issueUrl?: string;
        assigneeName?: string | null;
        note?: string | null;
        error?: string;
      };

      if (!response.ok || !payload.issueKey || !payload.issueUrl) {
        throw new Error(payload.error || "Jira issue creation failed.");
      }

      setTicketStates((current) => ({
        ...current,
        [actionItem.referenceId]: {
          status: "success",
          message: payload.note ?? "Issue created successfully.",
          issueKey: payload.issueKey,
          issueUrl: payload.issueUrl,
          assigneeName: payload.assigneeName ?? null,
        },
      }));
    } catch (caughtError) {
      setTicketStates((current) => ({
        ...current,
        [actionItem.referenceId]: {
          status: "error",
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Unexpected Jira error.",
        },
      }));
    }
  }

  async function handleCreateAll() {
    if (!analysis) {
      return;
    }

    for (const item of analysis.actionItems) {
      await handleCreateTicket(item);
    }
  }

  async function handleScheduleInvite() {
    if (!analysis || !isOutlookReady) {
      return;
    }

    setInviteState({ status: "creating" });

    try {
      const response = await fetch("/api/outlook/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis,
          settings: outlookSettings,
        }),
      });

      const payload = (await response.json()) as
        | (CreatedOutlookInvite & { error?: string })
        | { error?: string };

      if (!response.ok || !("eventId" in payload) || !payload.eventId) {
        throw new Error(payload.error || "Outlook invite creation failed.");
      }

      setInviteState({
        status: "success",
        message:
          payload.note ??
          `Invite sent to ${payload.attendeeCount} participant${payload.attendeeCount === 1 ? "" : "s"}.`,
        subject: payload.subject,
        webLink: payload.webLink,
        joinUrl: payload.joinUrl,
        start: payload.start,
      });
    } catch (caughtError) {
      setInviteState({
        status: "error",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Unexpected Outlook scheduling error.",
      });
    }
  }

  function getAgendaActionItems(section: AgendaSection) {
    return section.actionItemReferenceIds
      .map((referenceId) => actionItemsByReference.get(referenceId))
      .filter((item): item is ActionItem => Boolean(item));
  }

  return (
    <SiteShell>
      <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>AI Program Execution Assistant</span>
          <h1>Turn meeting evidence into owned execution, delivery follow-through, and PMO visibility.</h1>
          <p>
            This workspace is the operational core of PMO Copilot. Ingest a
            meeting transcript, refine the minutes, approve action items,
            connect Jira and Outlook, and carry the conversation all the way
            into accountable execution.
          </p>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => focusWorkflowTab("intake")}
            >
              Open intake
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => focusWorkflowTab("settings")}
            >
              Connect delivery tools
            </button>
          </div>

          <div className={styles.heroMeta}>
            <span>Ingest -&gt; review -&gt; deliver</span>
            <span>Approval-first Jira and Outlook flow</span>
            <span>{activeWorkflowMeta.heading}</span>
          </div>
        </div>

        <div className={styles.heroStats}>
          {workflowTabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.statCard} ${
                activeWorkflowTab === tab.id ? styles.statCardActive : ""
              }`}
              type="button"
              onClick={() => focusWorkflowTab(tab.id)}
            >
              <div className={styles.statTopRow}>
                <span className={styles.statStep}>
                  {WORKFLOW_TAB_META[tab.id].step}
                </span>
                <span className={styles.statSignal}>{tab.signal}</span>
              </div>
              <span className={styles.statTitle}>{tab.label}</span>
              <span className={styles.statLabel}>{tab.description}</span>
            </button>
          ))}
        </div>
      </header>

      <div className={styles.appWorkspace}>
      <nav className={styles.workflowNav} aria-label="Workflow sections">
        {workflowTabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.workflowNavButton} ${
              activeWorkflowTab === tab.id ? styles.workflowNavButtonActive : ""
            } ${!stageAvailability[tab.id] ? styles.workflowNavButtonLocked : ""}`}
            type="button"
            onClick={() => focusWorkflowTab(tab.id)}
            disabled={!stageAvailability[tab.id]}
          >
            <span>{WORKFLOW_TAB_META[tab.id].step}</span>
            <strong>{tab.label}</strong>
            <small>{tab.signal}</small>
          </button>
        ))}
      </nav>

      <div className={styles.stageDeck}>
      <section
        className={`${styles.workflowStage} ${
          activeWorkflowTab === "intake" || activeWorkflowTab === "settings"
            ? styles.workflowStageActive
            : styles.workflowStageHidden
        }`}
      >
        <div className={styles.stageIntro}>
          <span className={styles.eyebrow}>{activeWorkflowMeta.eyebrow}</span>
          <h2>{activeWorkflowMeta.heading}</h2>
          <p>{activeWorkflowMeta.description}</p>
        </div>

        {activeWorkflowTab === "intake" ? (
          <div className={styles.workspace}>
          <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Upload meeting source</h2>
                  <p>
                    Start with the transcript or meeting file. The next stages
                    handle AI-refined minutes, action approval, and delivery
                    system follow-through.
                  </p>
                </div>
              {selectedFileName ? (
                <span className={styles.fileChip}>{selectedFileName}</span>
              ) : null}
            </div>

            <label
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                className={styles.hiddenInput}
                type="file"
                accept={IMPORT_DOCUMENT_ACCEPT}
                disabled={isUploadingFile}
                onChange={onFilePicked}
              />
              <span className={styles.dropTitle}>
                {isUploadingFile ? "Importing document..." : "Drop meeting file here"}
              </span>
              <span className={styles.dropHint}>
                or tap to choose a {IMPORT_DOCUMENT_TYPES_LABEL} document
              </span>
            </label>

            {sourceMessage ? (
              <div className={styles.infoBanner}>{sourceMessage}</div>
            ) : null}

            {hasTranscript ? (
              <SourceSummaryCard
                title="Uploaded source"
                fileName={selectedFileName}
                sourceMessage={sourceMessage}
                wordCount={wordCount}
                transcriptPreview={transcriptPreview}
              />
            ) : null}

            <div className={styles.toolbar}>
              <div className={styles.toolbarMeta}>
                <span>
                  {selectedFileName ? "File ingested and ready." : "No file ingested yet."}
                </span>
                <span>
                  {hasTranscript
                    ? `${wordCount} words prepared for review`
                    : "The next tab will handle transcript review and analysis"}
                </span>
              </div>

              <div className={styles.toolbarActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={isUploadingFile}
                  onClick={() => {
                    setTranscript(SAMPLE_TRANSCRIPT);
                    setSelectedFileName("sample-transcript.txt");
                    setSourceMessage("Sample meeting file loaded into the workflow.");
                    setError(null);
                    setAnalysis(null);
                    setPlanStates({});
                    setTicketStates({});
                    setInviteState({ status: "idle" });
                    setActiveWorkflowTab("review");
                  }}
                >
                  Load sample file
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => focusWorkflowTab("review")}
                  disabled={!hasTranscript}
                >
                  Next: review
                </button>
              </div>
            </div>
          </section>

          <aside className={styles.sidebar}>
            <section className={`${styles.panel} ${styles.sidebarIntro}`}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>Execution map</span>
                  <h2>Built for structured follow-through</h2>
                  <p>
                    The workflow is intentionally staged so one meeting can turn
                    into refined minutes, owned actions, enterprise tool sync,
                    and governance-ready output without clutter.
                  </p>
                </div>
              </div>

              <div className={styles.summaryStack}>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Current stage</span>
                  <p>Upload a file to unlock the review tab.</p>
                </div>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Next outcome</span>
                  <p>
                    Review shows the transcript, AI-refined minutes, owners,
                    risks, blockers, and execution-ready follow-ups.
                  </p>
                </div>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Enterprise control</span>
                  <p>
                    Nothing is pushed into Jira automatically. Actions stay in
                    a PM review flow before downstream creation.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
        ) : (
        <div className={styles.sidebar}>
          <section className={`${styles.panel} ${styles.sidebarIntro}`}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>
                  {WORKFLOW_TAB_META.settings.eyebrow}
                </span>
                <h2>{WORKFLOW_TAB_META.settings.heading}</h2>
                <p>{WORKFLOW_TAB_META.settings.description}</p>
              </div>
            </div>

            <div className={styles.summaryStack}>
              <div className={styles.summaryBlock}>
                <span className={styles.summaryLabel}>Jira</span>
                <p>{isJiraReady ? "Connected and ready for ticket creation." : "Connection details still needed."}</p>
              </div>
              <div className={styles.summaryBlock}>
                <span className={styles.summaryLabel}>Outlook</span>
                <p>{isOutlookReady ? "Connected and ready for follow-up scheduling." : "Scheduling details still needed."}</p>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Organization Jira integration</h2>
                <p>Saved locally in this browser for the prototype workflow.</p>
              </div>
              <span className={isJiraReady ? styles.readyBadge : styles.setupBadge}>
                {isJiraReady ? "Connected" : "Needs setup"}
              </span>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Jira site URL</span>
                <input
                  type="url"
                  placeholder="https://your-org.atlassian.net"
                  value={jiraSettings.siteUrl}
                  onChange={updateJiraSetting("siteUrl")}
                />
              </label>

              <label className={styles.field}>
                <span>Jira email</span>
                <input
                  type="email"
                  placeholder="team@company.com"
                  value={jiraSettings.email}
                  onChange={updateJiraSetting("email")}
                />
              </label>

              <label className={styles.field}>
                <span>API token</span>
                <input
                  type="password"
                  placeholder="Atlassian API token"
                  value={jiraSettings.apiToken}
                  onChange={updateJiraSetting("apiToken")}
                />
              </label>

              <label className={styles.field}>
                <span>Project key</span>
                <input
                  type="text"
                  placeholder="ENG"
                  value={jiraSettings.projectKey}
                  onChange={updateJiraSetting("projectKey")}
                />
              </label>

              <label className={styles.field}>
                <span>Issue type</span>
                <input
                  type="text"
                  placeholder="Task"
                  value={jiraSettings.issueType}
                  onChange={updateJiraSetting("issueType")}
                />
              </label>

              <label className={styles.field}>
                <span>Epic issue type</span>
                <input
                  type="text"
                  placeholder="Epic"
                  value={jiraSettings.epicIssueType}
                  onChange={updateJiraSetting("epicIssueType")}
                />
              </label>

              <label className={styles.field}>
                <span>Story issue type</span>
                <input
                  type="text"
                  placeholder="Story"
                  value={jiraSettings.storyIssueType}
                  onChange={updateJiraSetting("storyIssueType")}
                />
              </label>

              <label className={styles.field}>
                <span>Default labels</span>
                <input
                  type="text"
                  placeholder="meeting-ai,team-sync"
                  value={jiraSettings.defaultLabels}
                  onChange={updateJiraSetting("defaultLabels")}
                />
              </label>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Outlook cadence scheduling</h2>
                <p>
                  Use Microsoft Graph to send the next follow-up meeting invite
                  with an Outlook calendar event and Teams join link.
                </p>
              </div>
              <span
                className={isOutlookReady ? styles.readyBadge : styles.setupBadge}
              >
                {isOutlookReady ? "Connected" : "Needs setup"}
              </span>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Microsoft Graph access token</span>
                <input
                  type="password"
                  placeholder="Calendars.ReadWrite token"
                  value={outlookSettings.accessToken}
                  onChange={updateOutlookSetting("accessToken")}
                />
              </label>

              <div className={styles.inlineFields}>
                <label className={styles.field}>
                  <span>Organizer user ID</span>
                  <input
                    type="text"
                    placeholder="Optional; blank uses /me"
                    value={outlookSettings.organizerUserId}
                    onChange={updateOutlookSetting("organizerUserId")}
                  />
                </label>

                <label className={styles.field}>
                  <span>Calendar ID</span>
                  <input
                    type="text"
                    placeholder="Optional target calendar"
                    value={outlookSettings.calendarId}
                    onChange={updateOutlookSetting("calendarId")}
                  />
                </label>
              </div>

              <div className={styles.inlineFields}>
                <label className={styles.field}>
                  <span>Schedule within days</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={outlookSettings.cadenceWithinDays}
                    onChange={updateOutlookSetting("cadenceWithinDays")}
                  />
                </label>

                <label className={styles.field}>
                  <span>Meeting start time</span>
                  <input
                    type="time"
                    value={outlookSettings.meetingStartTime}
                    onChange={updateOutlookSetting("meetingStartTime")}
                  />
                </label>

                <label className={styles.field}>
                  <span>Duration minutes</span>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={outlookSettings.meetingDurationMinutes}
                    onChange={updateOutlookSetting("meetingDurationMinutes")}
                  />
                </label>
              </div>

              <div className={styles.inlineFields}>
                <label className={styles.field}>
                  <span>Time zone</span>
                  <input
                    type="text"
                    placeholder="Pacific Standard Time or UTC"
                    value={outlookSettings.timeZone}
                    onChange={updateOutlookSetting("timeZone")}
                  />
                </label>

                <label className={styles.field}>
                  <span>Location label</span>
                  <input
                    type="text"
                    placeholder="Microsoft Teams"
                    value={outlookSettings.location}
                    onChange={updateOutlookSetting("location")}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>Additional attendee emails</span>
                <input
                  type="text"
                  placeholder="alex@company.com, sam@company.com"
                  value={outlookSettings.additionalAttendees}
                  onChange={updateOutlookSetting("additionalAttendees")}
                />
              </label>

              <p className={styles.helperText}>
                Outlook event creation uses Microsoft Graph calendar APIs and
                sends invitations to the attendee list. Use a Windows-style time
                zone if your tenant requires it.
              </p>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>AI behavior</h2>
                <p>Configured for strong extraction quality with cost-conscious defaults.</p>
              </div>
            </div>

            <ul className={styles.bulletList}>
              <li>Writes short summaries for each agenda section before the owned follow-ups.</li>
              <li>Detects owners, blockers, priorities, and ticket-ready descriptions.</li>
              <li>Builds Jira-ready epics and stories with acceptance criteria from meeting minutes.</li>
              <li>Suggests rough timelines per action item, epic, and story.</li>
              <li>Proposes a follow-up cadence meeting with a short agenda and recommended attendees.</li>
              <li>Supports direct imports from Slack, Teams, Zoom, and approved PDF, TXT, DOC, and DOCX files.</li>
            </ul>
          </section>
        </div>
        )}
      </section>

      {error ? <div className={styles.alert}>{error}</div> : null}

      <section
        className={`${styles.workflowStage} ${
          activeWorkflowTab === "deliver"
            ? styles.workflowStageActive
            : styles.workflowStageHidden
        }`}
      >
        <div className={styles.stageIntro}>
          <span className={styles.eyebrow}>{WORKFLOW_TAB_META.deliver.eyebrow}</span>
          <h2>{WORKFLOW_TAB_META.deliver.heading}</h2>
          <p>{WORKFLOW_TAB_META.deliver.description}</p>
        </div>

        {!analysis ? (
          <div className={styles.emptyState}>
            <h3>No delivery package yet</h3>
            <p>
              Analyze a meeting first so this stage can prepare Jira bundles,
              ticket handoff, and the follow-up meeting plan.
            </p>
          </div>
        ) : (
          <div className={styles.deliveryGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Delivery command center</h2>
                  <p>
                    Use the bulk actions when the analysis looks right, or drop
                    into the review section below for item-level edits.
                  </p>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailBlock}>
                  <span className={styles.summaryLabel}>Action items</span>
                  <p>{analysis.actionItems.length} ready for Jira ticket creation</p>
                </div>
                <div className={styles.detailBlock}>
                  <span className={styles.summaryLabel}>Epic bundles</span>
                  <p>{analysis.deliveryPlan.epics.length} grouped delivery plan(s)</p>
                </div>
                <div className={styles.detailBlock}>
                  <span className={styles.summaryLabel}>Follow-up meeting</span>
                  <p>
                    {analysis.followUpMeeting.shouldSchedule
                      ? "Suggested and ready for Outlook scheduling"
                      : "No separate cadence meeting suggested"}
                  </p>
                </div>
              </div>

              <div className={styles.commandActions}>
                {analysis.followUpMeeting.shouldSchedule ? (
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={!isOutlookReady || inviteState.status === "creating"}
                    onClick={handleScheduleInvite}
                  >
                    {inviteState.status === "creating"
                      ? "Sending invite..."
                      : "Send Outlook invite"}
                  </button>
                ) : null}

                {analysis.deliveryPlan.epics.length ? (
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={!isJiraPlanReady}
                    onClick={handleCreateAllEpicBundles}
                  >
                    Create all epics and stories
                  </button>
                ) : null}

                {analysis.actionItems.length ? (
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={!isJiraReady}
                    onClick={handleCreateAll}
                  >
                    Create Jira tickets for all items
                  </button>
                ) : null}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Connection readiness</h2>
                  <p>Ship faster once the destination tools are configured.</p>
                </div>
              </div>

              <div className={styles.summaryStack}>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Jira workspace</span>
                  <p>
                    {isJiraReady
                      ? "Ticket creation is connected."
                      : "Open settings to finish the Jira connection."}
                  </p>
                </div>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Outlook scheduling</span>
                  <p>
                    {isOutlookReady
                      ? "Follow-up scheduling is connected."
                      : "Open settings to finish the Outlook connection."}
                  </p>
                </div>
              </div>

              <div className={styles.toolbarActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => focusWorkflowTab("settings")}
                >
                  Open settings
                </button>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => focusWorkflowTab("review")}
                >
                  Review full output
                </button>
              </div>
            </section>
          </div>
        )}
      </section>

      <section
        className={`${styles.workflowStage} ${
          activeWorkflowTab === "review"
            ? styles.workflowStageActive
            : styles.workflowStageHidden
        }`}
      >
        <div className={styles.stageIntro}>
          <span className={styles.eyebrow}>{WORKFLOW_TAB_META.review.eyebrow}</span>
          <h2>{WORKFLOW_TAB_META.review.heading}</h2>
          <p>{WORKFLOW_TAB_META.review.description}</p>
        </div>

      <section className={styles.resultsSection}>
        <div className={styles.resultsHeader}>
          <div>
            <span className={styles.eyebrow}>Analysis output</span>
            <h2>Review agenda briefs, owned work, and the next meeting plan before sending anything out.</h2>
          </div>

          <div className={styles.resultsActions}>
            {analysis?.followUpMeeting.shouldSchedule ? (
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={!isOutlookReady || inviteState.status === "creating"}
                onClick={handleScheduleInvite}
              >
                {inviteState.status === "creating"
                  ? "Sending invite..."
                  : "Send Outlook invite"}
              </button>
            ) : null}

            {analysis?.deliveryPlan.epics.length ? (
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={!isJiraPlanReady}
                onClick={handleCreateAllEpicBundles}
              >
                Create all epics and stories
              </button>
            ) : null}

            {analysis?.actionItems.length ? (
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={!isJiraReady}
                onClick={handleCreateAll}
              >
                Create Jira tickets for all items
              </button>
            ) : null}
          </div>
        </div>

        {hasTranscript ? (
          <SourceSummaryCard
            title="Current source"
            fileName={selectedFileName}
            sourceMessage={sourceMessage}
            wordCount={wordCount}
            transcriptPreview={transcriptPreview}
          />
        ) : null}

        {!analysis ? (
          <div className={styles.emptyState}>
            <h3>No analysis yet</h3>
            <p>
              Once you analyze a transcript, this area will show the meeting
              summary, agenda briefs, participants, action items, Jira work, and
              follow-up meeting guidance.
            </p>
            <div className={styles.commandActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => focusWorkflowTab("intake")}
              >
                Back to intake
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzeDisabled}
                title={
                  isOpenAiConfigured === false
                    ? "Add OPENAI_API_KEY to .env.local and restart the dev server."
                    : undefined
                }
              >
                {isAnalyzing ? "Analyzing..." : "Analyze transcript"}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.resultsGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>{analysis.meetingTitle}</h2>
                  <p>{formatMeetingDate(analysis.meetingDate)}</p>
                </div>
              </div>

              <div className={styles.summaryStack}>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Meeting summary</span>
                  <p>{analysis.conciseSummary}</p>
                </div>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Overall risk</span>
                  <p>{analysis.overallRisk}</p>
                </div>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Recommended next step</span>
                  <p>{analysis.recommendedNextStep}</p>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Cadence follow-up</h2>
                  <p>
                    {analysis.followUpMeeting.shouldSchedule
                      ? "Review the suggested next meeting, then send the Outlook invite when ready."
                      : "The AI did not find a strong need for a separate cadence follow-up meeting."}
                  </p>
                </div>
                {analysis.followUpMeeting.shouldSchedule ? (
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={!isOutlookReady || inviteState.status === "creating"}
                    onClick={handleScheduleInvite}
                  >
                    {inviteState.status === "creating"
                      ? "Sending..."
                      : "Send Outlook invite"}
                  </button>
                ) : null}
              </div>

              <div className={styles.summaryStack}>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Meeting focus</span>
                  <p>{analysis.followUpMeeting.title}</p>
                </div>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Summary</span>
                  <p>{analysis.followUpMeeting.summary}</p>
                </div>
                <div className={styles.summaryBlock}>
                  <span className={styles.summaryLabel}>Why this helps</span>
                  <p>{analysis.followUpMeeting.rationale}</p>
                </div>
              </div>

              {analysis.followUpMeeting.shouldSchedule ? (
                <>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailBlock}>
                      <span className={styles.summaryLabel}>Window</span>
                      <p>
                        Within{" "}
                        {analysis.followUpMeeting.targetWithinDays ??
                          parsePositiveNumber(
                            outlookSettings.cadenceWithinDays,
                            5,
                          )}{" "}
                        days
                      </p>
                    </div>
                    <div className={styles.detailBlock}>
                      <span className={styles.summaryLabel}>Suggested duration</span>
                      <p>
                        {analysis.followUpMeeting.suggestedDurationMinutes} minutes
                      </p>
                    </div>
                    <div className={styles.detailBlock}>
                      <span className={styles.summaryLabel}>Inviteable attendees</span>
                      <p>{suggestedInviteeCount} detected email contact(s)</p>
                    </div>
                  </div>

                  {analysis.followUpMeeting.attendees.length ? (
                    <div className={styles.attendeeList}>
                      {analysis.followUpMeeting.attendees.map((attendee) => (
                        <div
                          key={`${attendee.name}-${attendee.email ?? "missing"}`}
                          className={styles.attendeeCard}
                        >
                          <div className={styles.participantHeader}>
                            <strong>{attendee.name}</strong>
                            <span>
                              {attendee.required ? "Required" : "Optional"}
                            </span>
                          </div>
                          <p>
                            {attendee.email
                              ? attendee.email
                              : "No email was inferred from the source notes."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyInline}>
                      No attendees were confidently identified for the follow-up
                      invite.
                    </div>
                  )}

                  <div className={styles.listBlock}>
                    <span className={styles.summaryLabel}>Proposed agenda</span>
                    {analysis.followUpMeeting.agenda.length ? (
                      <ul className={styles.criteriaList}>
                        {analysis.followUpMeeting.agenda.map((agendaItem) => (
                          <li key={agendaItem}>{agendaItem}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.emptyInline}>
                        No separate agenda was suggested for the next meeting.
                      </p>
                    )}
                  </div>

                  {inviteState.status === "success" ? (
                    <div className={styles.successBanner}>
                      <span>
                        Outlook invite created for{" "}
                        {formatDateTimeValue(inviteState.start) ?? "the scheduled slot"}
                        .
                      </span>
                      {inviteState.webLink ? (
                        <p>
                          <a
                            href={inviteState.webLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open the calendar event
                          </a>
                        </p>
                      ) : null}
                      {inviteState.joinUrl ? (
                        <p>
                          <a
                            href={inviteState.joinUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open the Teams join link
                          </a>
                        </p>
                      ) : null}
                      {inviteState.message ? <p>{inviteState.message}</p> : null}
                    </div>
                  ) : null}

                  {inviteState.status === "error" ? (
                    <div className={styles.errorBanner}>{inviteState.message}</div>
                  ) : null}
                </>
              ) : null}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Participants</h2>
                  <p>Signals captured for ownership and coordination context.</p>
                </div>
              </div>

              <div className={styles.participantList}>
                {analysis.participants.map((participant) => (
                  <div key={participant.name} className={styles.participantCard}>
                    <div className={styles.participantHeader}>
                      <strong>{participant.name}</strong>
                      <span>{participant.role ?? "Role not stated"}</span>
                    </div>
                    <p>{participant.signals.join(" ")}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${styles.panel} ${styles.actionPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Agenda briefs</h2>
                  <p>
                    Short summaries for each agenda item, followed by the owned
                    work and expected completion timing.
                  </p>
                </div>
              </div>

              {analysis.agendaSections.length === 0 ? (
                <div className={styles.emptyInline}>
                  No clear agenda sections were detected in this meeting source.
                </div>
              ) : (
                <div className={styles.agendaList}>
                  {analysis.agendaSections.map((section) => {
                    const agendaActionItems = getAgendaActionItems(section);

                    return (
                      <article
                        key={section.referenceId}
                        className={styles.agendaCard}
                      >
                        <div className={styles.actionMeta}>
                          <span className={styles.referencePill}>
                            {section.referenceId}
                          </span>
                        </div>
                        <h3>{section.title}</h3>

                        <div className={styles.summaryBlock}>
                          <span className={styles.summaryLabel}>Brief summary</span>
                          <p>{section.summary}</p>
                        </div>

                        {agendaActionItems.length ? (
                          <div className={styles.agendaTaskList}>
                            {agendaActionItems.map((item) => (
                              <div
                                key={`${section.referenceId}-${item.referenceId}`}
                                className={styles.agendaTaskCard}
                              >
                                <div className={styles.storyHeader}>
                                  <div>
                                    <span className={styles.referencePill}>
                                      {item.referenceId}
                                    </span>
                                    <h4>{item.title}</h4>
                                  </div>
                                  <span className={styles.priorityPill}>
                                    {item.priority}
                                  </span>
                                </div>

                                <p className={styles.storySummary}>{item.summary}</p>

                                <div className={styles.storyMeta}>
                                  <span>
                                    {item.ownerName}
                                    {item.ownerEmail ? ` (${item.ownerEmail})` : ""}
                                  </span>
                                  <span>{item.suggestedTimeline}</span>
                                  <span>
                                    {item.suggestedDueDate ?? "No hard due date inferred"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.emptyInline}>
                            No owned follow-ups were attached to this agenda item.
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className={`${styles.panel} ${styles.actionPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Jira delivery plan</h2>
                  <p>
                    {analysis.deliveryPlan.epics.length} epic
                    {analysis.deliveryPlan.epics.length === 1 ? "" : "s"} with
                    story breakdowns and acceptance criteria.
                  </p>
                </div>
              </div>

              <div className={styles.summaryBlock}>
                <span className={styles.summaryLabel}>Plan overview</span>
                <p>{analysis.deliveryPlan.overview}</p>
              </div>

              {analysis.deliveryPlan.epics.length === 0 ? (
                <div className={styles.emptyInline}>
                  No Jira delivery plan could be generated from these meeting
                  minutes.
                </div>
              ) : (
                <div className={styles.planList}>
                  {analysis.deliveryPlan.epics.map((epic) => {
                    const planState = planStates[epic.referenceId];

                    return (
                      <article key={epic.referenceId} className={styles.epicCard}>
                        <div className={styles.actionTopRow}>
                          <div>
                            <div className={styles.actionMeta}>
                              <span className={styles.referencePill}>
                                {epic.referenceId}
                              </span>
                              <span className={styles.priorityPill}>{epic.priority}</span>
                              <span className={styles.confidencePill}>
                                {epic.confidence} confidence
                              </span>
                            </div>
                            <h3>{epic.title}</h3>
                          </div>

                          <button
                            className={styles.primaryButton}
                            type="button"
                            disabled={
                              !isJiraPlanReady || planState?.status === "creating"
                            }
                            onClick={() => handleCreateEpicBundle(epic)}
                          >
                            {planState?.status === "creating"
                              ? "Creating..."
                              : "Create epic and stories"}
                          </button>
                        </div>

                        <div className={styles.detailGrid}>
                          <div className={styles.detailBlock}>
                            <span className={styles.summaryLabel}>Owner</span>
                            <p>
                              {epic.ownerName}
                              {epic.ownerEmail ? ` (${epic.ownerEmail})` : ""}
                            </p>
                          </div>
                          <div className={styles.detailBlock}>
                            <span className={styles.summaryLabel}>Suggested timeline</span>
                            <p>{epic.suggestedTimeline}</p>
                          </div>
                          <div className={styles.detailBlock}>
                            <span className={styles.summaryLabel}>Stories</span>
                            <p>{epic.stories.length} planned story item(s)</p>
                          </div>
                        </div>

                        <div className={styles.summaryStack}>
                          <div className={styles.summaryBlock}>
                            <span className={styles.summaryLabel}>Objective</span>
                            <p>{epic.objective}</p>
                          </div>
                          <div className={styles.summaryBlock}>
                            <span className={styles.summaryLabel}>Business value</span>
                            <p>{epic.businessValue}</p>
                          </div>
                        </div>

                        {epic.acceptanceCriteria.length ? (
                          <div className={styles.listBlock}>
                            <span className={styles.summaryLabel}>
                              Epic acceptance criteria
                            </span>
                            <ul className={styles.criteriaList}>
                              {epic.acceptanceCriteria.map((criterion) => (
                                <li key={criterion}>{criterion}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {epic.successMetrics.length ? (
                          <div className={styles.listBlock}>
                            <span className={styles.summaryLabel}>Success metrics</span>
                            <ul className={styles.criteriaList}>
                              {epic.successMetrics.map((metric) => (
                                <li key={metric}>{metric}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div className={styles.storyList}>
                          {epic.stories.map((story) => (
                            <div key={story.referenceId} className={styles.storyCard}>
                              <div className={styles.storyHeader}>
                                <div>
                                  <span className={styles.referencePill}>
                                    {story.referenceId}
                                  </span>
                                  <h4>{story.title}</h4>
                                </div>
                                <span className={styles.priorityPill}>
                                  {story.priority}
                                </span>
                              </div>

                              <p className={styles.storySummary}>{story.summary}</p>

                              <div className={styles.storyMeta}>
                                <span>{story.ownerName}</span>
                                <span>{story.suggestedTimeline}</span>
                              </div>

                              {story.acceptanceCriteria.length ? (
                                <ul className={styles.criteriaList}>
                                  {story.acceptanceCriteria.map((criterion) => (
                                    <li key={criterion}>{criterion}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))}
                        </div>

                        {planState?.status === "success" ? (
                          <div className={styles.successBanner}>
                            <span>
                              Jira epic{" "}
                              <a
                                href={planState.epicUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {planState.epicKey}
                              </a>{" "}
                              created with {planState.storyCount ?? 0} story item(s).
                            </span>
                            {planState.message ? <p>{planState.message}</p> : null}
                          </div>
                        ) : null}

                        {planState?.status === "error" ? (
                          <div className={styles.errorBanner}>{planState.message}</div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className={`${styles.panel} ${styles.actionPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Action items</h2>
                  <p>
                    {analysis.actionItems.length} extracted item
                    {analysis.actionItems.length === 1 ? "" : "s"} with suggested
                    timelines.
                  </p>
                </div>
              </div>

              {analysis.actionItems.length === 0 ? (
                <div className={styles.emptyInline}>
                  No concrete action items were found in this transcript.
                </div>
              ) : (
                <div className={styles.actionList}>
                  {analysis.actionItems.map((item) => {
                    const ticketState = ticketStates[item.referenceId];

                    return (
                      <article key={item.referenceId} className={styles.actionCard}>
                        <div className={styles.actionTopRow}>
                          <div>
                            <div className={styles.actionMeta}>
                              <span className={styles.referencePill}>
                                {item.referenceId}
                              </span>
                              <span className={styles.priorityPill}>{item.priority}</span>
                              <span className={styles.confidencePill}>
                                {item.confidence} confidence
                              </span>
                            </div>
                            <h3>{item.title}</h3>
                          </div>

                          <button
                            className={styles.primaryButton}
                            type="button"
                            disabled={!isJiraReady || ticketState?.status === "creating"}
                            onClick={() => handleCreateTicket(item)}
                          >
                            {ticketState?.status === "creating"
                              ? "Creating..."
                              : "Create Jira ticket"}
                          </button>
                        </div>

                        <div className={styles.detailGrid}>
                          <div className={styles.detailBlock}>
                            <span className={styles.summaryLabel}>Owner</span>
                            <p>
                              {item.ownerName}
                              {item.ownerEmail ? ` (${item.ownerEmail})` : ""}
                            </p>
                          </div>
                          <div className={styles.detailBlock}>
                            <span className={styles.summaryLabel}>Suggested timeline</span>
                            <p>{item.suggestedTimeline}</p>
                          </div>
                          <div className={styles.detailBlock}>
                            <span className={styles.summaryLabel}>Suggested due date</span>
                            <p>{item.suggestedDueDate ?? "No hard date inferred"}</p>
                          </div>
                        </div>

                        <div className={styles.summaryStack}>
                          <div className={styles.summaryBlock}>
                            <span className={styles.summaryLabel}>Action details</span>
                            <p>{item.summary}</p>
                          </div>
                          <div className={styles.summaryBlock}>
                            <span className={styles.summaryLabel}>Why this was created</span>
                            <p>{item.rationale}</p>
                          </div>
                          {item.blockers.length ? (
                            <div className={styles.summaryBlock}>
                              <span className={styles.summaryLabel}>Potential blockers</span>
                              <p>{item.blockers.join(", ")}</p>
                            </div>
                          ) : null}
                        </div>

                        {ticketState?.status === "success" ? (
                          <div className={styles.successBanner}>
                            <span>
                              Jira issue{" "}
                              <a
                                href={ticketState.issueUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {ticketState.issueKey}
                              </a>{" "}
                              created
                              {ticketState.assigneeName
                                ? ` and assigned to ${ticketState.assigneeName}`
                                : ""}.
                            </span>
                            {ticketState.message ? <p>{ticketState.message}</p> : null}
                          </div>
                        ) : null}

                        {ticketState?.status === "error" ? (
                          <div className={styles.errorBanner}>{ticketState.message}</div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
      </section>

      </div>
      </div>

        {isPending ? (
          <div className={styles.pendingNote}>Refreshing the analysis view...</div>
        ) : null}
      </div>
    </SiteShell>
  );
}

export default MeetingWorkspacePage;

