import "server-only";

import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import WordExtractor from "word-extractor";

import {
  formatImportDocumentType,
  getImportDocumentType,
  IMPORT_DOCUMENT_ERROR_MESSAGE,
  type ImportDocumentType,
} from "./document-import";

export class DocumentImportError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "DocumentImportError";
  }
}

export type ImportedDocumentResult = {
  fileName: string;
  sourceMessage: string;
  transcript: string;
  type: ImportDocumentType;
};

function normalizeImportedText(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

async function extractTextFromPdf(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractTextFromTxt(buffer: Buffer) {
  return buffer.toString("utf8");
}

async function extractTextFromDocx(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractTextFromDoc(buffer: Buffer) {
  const extractor = new WordExtractor();
  const document = await extractor.extract(buffer);

  return [
    document.getBody(),
    document.getFootnotes(),
    document.getEndnotes(),
    document.getAnnotations(),
    document.getTextboxes(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function extractDocumentText(
  type: ImportDocumentType,
  buffer: Buffer,
): Promise<string> {
  switch (type) {
    case "pdf":
      return extractTextFromPdf(buffer);
    case "txt":
      return extractTextFromTxt(buffer);
    case "doc":
      return extractTextFromDoc(buffer);
    case "docx":
      return extractTextFromDocx(buffer);
    default: {
      const unsupportedType: never = type;
      throw new DocumentImportError(
        `Unsupported document type: ${unsupportedType}`,
      );
    }
  }
}

export async function importDocumentFile(
  file: File,
): Promise<ImportedDocumentResult> {
  const type = getImportDocumentType(file.name);

  if (!type) {
    throw new DocumentImportError(IMPORT_DOCUMENT_ERROR_MESSAGE);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText = "";

  try {
    extractedText = await extractDocumentText(type, buffer);
  } catch {
    throw new DocumentImportError(
      `We couldn't read that ${formatImportDocumentType(type)} file. Try another document or convert it to TXT.`,
    );
  }

  const transcript = normalizeImportedText(extractedText);

  if (!transcript) {
    throw new DocumentImportError(
      `The ${formatImportDocumentType(type)} file did not contain readable text.`,
    );
  }

  return {
    fileName: file.name,
    sourceMessage: `Imported ${formatImportDocumentType(type)} content from ${file.name}. Review the extracted text before analysis.`,
    transcript,
    type,
  };
}
