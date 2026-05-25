"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardCopy,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import {
  createAnalysisCsv,
  createAnalysisFileBaseName,
  createAnalysisPdfBlob,
  createAnalysisPlainText,
  createAnalysisWordHtml,
  createAnalysisXlsHtml,
  type AnalysisExportFormat,
} from "@/lib/analysis-export";
import { useWorkflowSnapshot } from "@/lib/use-workflow-snapshot";

const DOWNLOAD_OPTIONS: Array<{
  format: AnalysisExportFormat;
  label: string;
  extension: string;
}> = [
  { format: "word", label: "Word", extension: "doc" },
  { format: "pdf", label: "PDF", extension: "pdf" },
  { format: "xls", label: "Excel", extension: "xls" },
  { format: "csv", label: "CSV", extension: "csv" },
];

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function createBlob(content: string, type: string) {
  return new Blob([content], { type });
}

async function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function getFormatIcon(format: AnalysisExportFormat) {
  if (format === "xls" || format === "csv") {
    return FileSpreadsheet;
  }

  return FileText;
}

type AnalysisExportActionsProps = {
  className?: string;
};

export function AnalysisExportActions({ className = "" }: AnalysisExportActionsProps) {
  const { workflowSession, hasLoaded } = useWorkflowSnapshot();
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const analysis = workflowSession.analysis;
  const isDisabled = !hasLoaded || !analysis;

  async function copyGeneratedInfo() {
    if (!analysis) {
      return;
    }

    const text = createAnalysisPlainText(analysis, {
      sourceFileName: workflowSession.selectedFileName,
      updatedAt: workflowSession.updatedAt,
    });

    try {
      await writeClipboardText(text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  function downloadGeneratedInfo(format: AnalysisExportFormat) {
    if (!analysis) {
      return;
    }

    const context = {
      sourceFileName: workflowSession.selectedFileName,
      updatedAt: workflowSession.updatedAt,
    };
    const baseName = createAnalysisFileBaseName(analysis);

    if (format === "pdf") {
      downloadBlob(createAnalysisPdfBlob(analysis, context), `${baseName}.pdf`);
      setIsOpen(false);
      return;
    }

    if (format === "word") {
      downloadBlob(
        createBlob(createAnalysisWordHtml(analysis, context), "application/msword"),
        `${baseName}.doc`,
      );
      setIsOpen(false);
      return;
    }

    if (format === "xls") {
      downloadBlob(
        createBlob(createAnalysisXlsHtml(analysis, context), "application/vnd.ms-excel"),
        `${baseName}.xls`,
      );
      setIsOpen(false);
      return;
    }

    downloadBlob(
      createBlob(`\ufeff${createAnalysisCsv(analysis, context)}`, "text/csv;charset=utf-8"),
      `${baseName}.csv`,
    );
    setIsOpen(false);
  }

  const copyLabel =
    copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy";
  const CopyIcon = copyState === "copied" ? Check : ClipboardCopy;

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={copyGeneratedInfo}
        disabled={isDisabled}
        title={isDisabled ? "Run AI analysis before copying generated information." : "Copy generated information"}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
      >
        <CopyIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{copyLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={isDisabled}
        title={isDisabled ? "Run AI analysis before downloading generated information." : "Download generated information"}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
        aria-expanded={isOpen}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Download</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {isOpen && !isDisabled ? (
        <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {DOWNLOAD_OPTIONS.map((option) => {
            const Icon = getFormatIcon(option.format);

            return (
              <button
                key={option.format}
                type="button"
                onClick={() => downloadGeneratedInfo(option.format)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                <span>{option.label}</span>
                <span className="ml-auto text-[10px] uppercase text-slate-400">
                  .{option.extension}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
