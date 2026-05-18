import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import {
  EMPTY_WORKFLOW_STORAGE_SNAPSHOT,
  parseWorkflowStorageSnapshot,
} from "@/lib/workflow-storage";

export const runtime = "nodejs";

const WORKFLOW_STATE_FILE = path.join(process.cwd(), ".workflow-state.json");

async function readWorkflowState() {
  try {
    const raw = await readFile(WORKFLOW_STATE_FILE, "utf8");
    return parseWorkflowStorageSnapshot(JSON.parse(raw));
  } catch {
    return EMPTY_WORKFLOW_STORAGE_SNAPSHOT;
  }
}

export async function GET() {
  return NextResponse.json(await readWorkflowState());
}

export async function POST(request: Request) {
  const payload = parseWorkflowStorageSnapshot(await request.json());
  const snapshot = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(WORKFLOW_STATE_FILE, JSON.stringify(snapshot, null, 2));

  return NextResponse.json(snapshot);
}
