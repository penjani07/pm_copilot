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

function readServerSnapshot(): WorkflowSnapshotState {
  return {
    workflowSession: EMPTY_WORKFLOW_SESSION,
    jiraSettings: INITIAL_JIRA_SETTINGS,
    outlookSettings: INITIAL_OUTLOOK_SETTINGS,
    hasLoaded: false,
  };
}

function readClientSnapshot(): WorkflowSnapshotState {
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
    hasLoaded: true,
  };
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("focus", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
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
