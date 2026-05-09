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
  hasOutlookCredentials,
  isJiraConfigured,
  isJiraPlanConfigured,
  parseStoredJiraSettings,
  parseStoredOutlookSettings,
  parseStoredWorkflowSession,
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
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("focus", onStoreChange);
  window.addEventListener(WORKFLOW_STORAGE_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("focus", onStoreChange);
    window.removeEventListener(WORKFLOW_STORAGE_UPDATED_EVENT, onStoreChange);
  };
}

export function notifyWorkflowSnapshotChanged() {
  cachedClientSignature = "";
  cachedClientSnapshot = null;
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
