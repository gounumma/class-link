"use client";

import { useRef, useState, type TextareaHTMLAttributes } from "react";
import { Clipboard } from "lucide-react";
import { Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type PasteableTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  pasteButtonLabel?: string;
};

export function PasteableTextarea({
  className,
  pasteButtonLabel = "클립보드 붙여넣기",
  maxLength,
  ...props
}: PasteableTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState("");

  async function pasteFromClipboard() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    try {
      if (!navigator.clipboard?.readText) {
        setStatus("브라우저에서 버튼 붙여넣기를 지원하지 않아요. Ctrl+V로 붙여넣어 주세요.");
        textarea.focus();
        return;
      }

      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) {
        setStatus("클립보드에 붙여넣을 텍스트가 없어요.");
        textarea.focus();
        return;
      }

      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? textarea.value.length;
      const max = typeof maxLength === "number" ? maxLength : undefined;
      const currentLengthWithoutSelection = textarea.value.length - (end - start);
      const availableLength = max ? Math.max(max - currentLengthWithoutSelection, 0) : clipboardText.length;
      const textToInsert = clipboardText.slice(0, availableLength);

      if (!textToInsert) {
        setStatus(`최대 ${maxLength}자까지 입력할 수 있어요.`);
        textarea.focus();
        return;
      }

      textarea.setRangeText(textToInsert, start, end, "end");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.focus();
      setStatus(textToInsert.length < clipboardText.length ? `최대 ${maxLength}자에 맞춰 일부만 붙여넣었어요.` : "붙여넣었어요.");
    } catch {
      setStatus("클립보드 접근이 막혔어요. 입력칸을 누른 뒤 Ctrl+V로 붙여넣어 주세요.");
      textarea.focus();
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        maxLength={maxLength}
        className={cn("select-text", className)}
        {...props}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={pasteFromClipboard}
          className="focus-ring inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          <Clipboard className="mr-1.5 size-3.5" />
          {pasteButtonLabel}
        </button>
        <span className="text-xs text-slate-400">직접 Ctrl+V / ⌘V 붙여넣기도 가능해요.</span>
      </div>
      {status && <p className="text-xs font-medium text-blue-700">{status}</p>}
    </div>
  );
}
