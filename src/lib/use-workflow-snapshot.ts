"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { JiraSettings, OutlookSettings } from "@/lib/types";
import {
  EMPTY_WORKFLOW_SESSION,
  INITIAL_JIRA_SETTINGS,
  INITIAL_OUTLOOK_SETTINGS,
  JIRA_STORAGE_KEY,
  OUTLOOK_STORAGE_KEY,
  WORKFLOW_SESSION_STORAGE_KEY,
  hasWorkflowStorageSnapshotData,
  hasOutlookCredentials,
  isJiraConfigured,
  isJiraPlanConfigured,
  parseWorkflowStorageSnapshot,
  parseStoredJiraSettings,
  parseStoredOutlookSettings,
  parseStoredWorkflowSession,
  type WorkflowStorageSnapshot,
  type WorkflowSession,
} from "@/lib/workflow-storage";

type WorkflowSnapshotState = {
  workflowSession: WorkflowSession;
  jiraSettings: JiraSettings;
  outlookSettings: OutlookSettings;
  hasLoaded: boolean;
};

const WORKFLOW_STORAGE_UPDATED_EVENT = "workflow-storage-updated";

let cachedClientSignature = "";
let cachedClientSnapshot: WorkflowSnapshotState | null = null;
let isRefreshingSharedSnapshot = false;

function writeSharedSnapshotToLocalStorage(snapshot: WorkflowStorageSnapshot) {
  window.localStorage.setItem(
    WORKFLOW_SESSION_STORAGE_KEY,
    JSON.stringify(snapshot.workflowSession),
  );
  window.localStorage.setItem(
    JIRA_STORAGE_KEY,
    JSON.stringify(snapshot.jiraSettings),
  );
  window.localStorage.setItem(
    OUTLOOK_STORAGE_KEY,
    JSON.stringify(snapshot.outlookSettings),
  );
}

function createLocalStorageSnapshot(): WorkflowStorageSnapshot {
  return {
    workflowSession: parseStoredWorkflowSession(
      window.localStorage.getItem(WORKFLOW_SESSION_STORAGE_KEY),
    ),
    jiraSettings: parseStoredJiraSettings(
      window.localStorage.getItem(JIRA_STORAGE_KEY),
    ),
    outlookSettings: parseStoredOutlookSettings(
      window.localStorage.getItem(OUTLOOK_STORAGE_KEY),
    ),
    updatedAt:
      parseStoredWorkflowSession(
        window.localStorage.getItem(WORKFLOW_SESSION_STORAGE_KEY),
      ).updatedAt ?? null,
  };
}

async function refreshSharedWorkflowSnapshot() {
  if (isRefreshingSharedSnapshot) {
    return;
  }

  isRefreshingSharedSnapshot = true;

  try {
    const response = await fetch("/api/workflow-state", { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const sharedSnapshot = parseWorkflowStorageSnapshot(await response.json());
    if (!hasWorkflowStorageSnapshotData(sharedSnapshot)) {
      return;
    }

    const localSnapshot = createLocalStorageSnapshot();
    const shouldUseShared =
      !hasWorkflowStorageSnapshotData(localSnapshot) ||
      Date.parse(sharedSnapshot.updatedAt ?? "") >
        Date.parse(localSnapshot.updatedAt ?? "");

    if (!shouldUseShared) {
      return;
    }

    writeSharedSnapshotToLocalStorage(sharedSnapshot);
    cachedClientSignature = "";
    cachedClientSnapshot = null;
    window.dispatchEvent(new Event(WORKFLOW_STORAGE_UPDATED_EVENT));
  } catch {
    // Keep localStorage as the fallback when the shared dev-session endpoint is unavailable.
  } finally {
    isRefreshingSharedSnapshot = false;
  }
}

async function publishSharedWorkflowSnapshot() {
  try {
    const snapshot = createLocalStorageSnapshot();
    if (!hasWorkflowStorageSnapshotData(snapshot)) {
      return;
    }

    await fetch("/api/workflow-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(snapshot),
    });
  } catch {
    // Sharing state across origins is best-effort; localStorage remains authoritative locally.
  }
}

function readServerSnapshot(): WorkflowSnapshotState {
  return {
    workflowSession: EMPTY_WORKFLOW_SESSION,
    jiraSettings: INITIAL_JIRA_SETTINGS,
    outlookSettings: INITIAL_OUTLOOK_SETTINGS,
    hasLoaded: false,
  };
}

function readClientSnapshot(): WorkflowSnapshotState {
  const workflowValue =
    window.localStorage.getItem(WORKFLOW_SESSION_STORAGE_KEY) ?? "";
  const jiraValue = window.localStorage.getItem(JIRA_STORAGE_KEY) ?? "";
  const outlookValue = window.localStorage.getItem(OUTLOOK_STORAGE_KEY) ?? "";
  const signature = `${workflowValue}::${jiraValue}::${outlookValue}`;

  if (cachedClientSnapshot && cachedClientSignature === signature) {
    return cachedClientSnapshot;
  }

  cachedClientSignature = signature;
  cachedClientSnapshot = {
    workflowSession: parseStoredWorkflowSession(
      workflowValue,
    ),
    jiraSettings: parseStoredJiraSettings(
      jiraValue,
    ),
    outlookSettings: parseStoredOutlookSettings(
      outlookValue,
    ),
    hasLoaded: true,
  };

  return cachedClientSnapshot;
}

function subscribe(onStoreChange: () => void) {
  function onFocus() {
    onStoreChange();
    void refreshSharedWorkflowSnapshot();
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener("focus", onFocus);
  window.addEventListener(WORKFLOW_STORAGE_UPDATED_EVENT, onStoreChange);

  void refreshSharedWorkflowSnapshot();

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("focus", onFocus);
    window.removeEventListener(WORKFLOW_STORAGE_UPDATED_EVENT, onStoreChange);
  };
}

export function notifyWorkflowSnapshotChanged() {
  cachedClientSignature = "";
  cachedClientSnapshot = null;
  void publishSharedWorkflowSnapshot();
  window.dispatchEvent(new Event(WORKFLOW_STORAGE_UPDATED_EVENT));
}

export function useWorkflowSnapshot() {
  const snapshot = useSyncExternalStore(
    subscribe,
    readClientSnapshot,
    readServerSnapshot,
  );

  const derived = useMemo(
    () => ({
      hasAnalysis: Boolean(snapshot.workflowSession.analysis),
      hasTranscript: Boolean(snapshot.workflowSession.transcript.trim()),
      isJiraReady: isJiraConfigured(snapshot.jiraSettings),
      isJiraPlanReady: isJiraPlanConfigured(snapshot.jiraSettings),
      isOutlookReady: hasOutlookCredentials(snapshot.outlookSettings),
    }),
    [
      snapshot.jiraSettings,
      snapshot.outlookSettings,
      snapshot.workflowSession.analysis,
      snapshot.workflowSession.transcript,
    ],
  );

  return {
    workflowSession: snapshot.workflowSession,
    jiraSettings: snapshot.jiraSettings,
    outlookSettings: snapshot.outlookSettings,
    hasLoaded: snapshot.hasLoaded,
    ...derived,
  };
}
