import { NextResponse } from "next/server";

import {
  DocumentImportError,
  importDocumentFile,
} from "@/lib/document-parser";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A single document file is required for import." },
        { status: 400 },
      );
    }

    const importedDocument = await importDocumentFile(file);
    return NextResponse.json({ importedDocument });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected document import error.";
    const status = error instanceof DocumentImportError ? error.status : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
