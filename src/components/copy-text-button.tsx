"use client";

import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";

type CopyTextButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

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

export function CopyTextButton({
  text,
  label = "Copy",
  className = "",
}: CopyTextButtonProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const Icon = copyState === "copied" ? Check : ClipboardCopy;
  const buttonLabel =
    copyState === "copied" ? "Copied" : copyState === "error" ? "Retry" : label;

  async function handleCopy() {
    try {
      await writeClipboardText(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      title={buttonLabel === "Copied" ? "Copied to clipboard" : "Copy text"}
    >
      <Icon aria-hidden="true" />
      <span>{buttonLabel}</span>
    </button>
  );
}
