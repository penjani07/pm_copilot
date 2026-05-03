export const IMPORT_DOCUMENT_TYPES = ["pdf", "txt", "doc", "docx"] as const;

export type ImportDocumentType = (typeof IMPORT_DOCUMENT_TYPES)[number];

export const IMPORT_DOCUMENT_TYPES_LABEL = "PDF, TXT, DOC, or DOCX";

export const IMPORT_DOCUMENT_ACCEPT =
  ".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const IMPORT_DOCUMENT_ERROR_MESSAGE =
  `Use a ${IMPORT_DOCUMENT_TYPES_LABEL} document for meeting minutes or other permitted imports.`;

const IMPORT_DOCUMENT_TYPE_SET = new Set<ImportDocumentType>(IMPORT_DOCUMENT_TYPES);

export function getImportDocumentType(
  fileName: string,
): ImportDocumentType | null {
  const extension = fileName.trim().split(".").pop()?.toLowerCase();

  if (!extension) {
    return null;
  }

  return IMPORT_DOCUMENT_TYPE_SET.has(extension as ImportDocumentType)
    ? (extension as ImportDocumentType)
    : null;
}

export function isSupportedImportDocument(fileLike: { name: string }) {
  return getImportDocumentType(fileLike.name) !== null;
}

export function formatImportDocumentType(type: ImportDocumentType) {
  return type.toUpperCase();
}
