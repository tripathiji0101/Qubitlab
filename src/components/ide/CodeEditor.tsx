import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { highlightPython, stripHtml } from "../../lib/highlight";
import { cx } from "../ui";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  errorLine?: number | null;
  readOnly?: boolean;
  className?: string;
  onSelectCode?: (selectedText: string) => void;
}

export default function CodeEditor({
  value,
  onChange,
  onRun,
  errorLine,
  readOnly = false,
  className,
  onSelectCode,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const [activeLine, setActiveLine] = useState(1);
  const [copied, setCopied] = useState(false);

  // Synchronize scroll between textarea, syntax overlay, and gutter
  const handleScroll = useCallback(() => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }
      if (gutterRef.current) {
        gutterRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  // Update active line on cursor position change
  const updateActiveLine = useCallback(() => {
    if (!textareaRef.current) return;
    const textBefore = value.slice(0, textareaRef.current.selectionStart);
    const line = textBefore.split("\n").length;
    setActiveLine(line);

    if (onSelectCode) {
      const selStart = textareaRef.current.selectionStart;
      const selEnd = textareaRef.current.selectionEnd;
      if (selStart !== selEnd) {
        onSelectCode(value.slice(selStart, selEnd));
      } else {
        onSelectCode("");
      }
    }
  }, [value, onSelectCode]);

  // Handle keyboard shortcuts (Cmd/Ctrl + Enter to run, Tab for 4 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onRun?.();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Outdent 4 spaces
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        if (value.slice(lineStart, lineStart + 4) === "    ") {
          const next = value.slice(0, lineStart) + value.slice(lineStart + 4);
          onChange(next);
          requestAnimationFrame(() => {
            textarea.selectionStart = Math.max(lineStart, start - 4);
            textarea.selectionEnd = Math.max(lineStart, end - 4);
          });
        }
      } else {
        // Indent 4 spaces
        const next = value.substring(0, start) + "    " + value.substring(end);
        onChange(next);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        });
      }
    }
  };

  const lines = useMemo(() => value.split("\n"), [value]);
  const lineCount = Math.max(lines.length, 1);
  const highlightedCode = useMemo(() => highlightPython(value), [value]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cx(
        "relative flex h-full flex-col overflow-hidden rounded-xl border border-line/60 bg-bg-surface text-txt shadow-sm",
        className
      )}
    >
      {/* Editor subheader toolbar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-line/50 bg-bg-panel/60 px-3 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-txt-dim">
            <span className="inline-block h-2 w-2 rounded-full bg-accent-blue/80" />
            Python 3
          </span>
          <span className="text-[10px] text-txt-faint">|</span>
          <span className="text-[11px] font-mono text-txt-faint">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {errorLine && (
            <span className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400 border border-red-500/20">
              <span>⚠</span> Line {errorLine} Error
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-txt-dim hover:bg-line/40 hover:text-white transition-colors cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <span className="text-emerald-400">✓</span>
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body: Gutter + Code Surface */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden font-mono text-[13px] leading-6">
        {/* Left Gutter: Line numbers */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-12 shrink-0 select-none overflow-hidden border-r border-line/40 bg-bg-app/80 py-3 text-right text-txt-faint"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const isError = errorLine === lineNum;
            const isActive = activeLine === lineNum;
            return (
              <div
                key={lineNum}
                className={cx(
                  "pr-2.5 h-6 transition-colors flex items-center justify-end gap-1",
                  isError
                    ? "bg-red-500/20 text-red-400 font-bold"
                    : isActive
                    ? "text-txt font-semibold"
                    : "text-txt-faint/60"
                )}
              >
                {isError && <span className="text-[10px] text-red-400">●</span>}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Code Canvas Container */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          {/* Syntax-highlighted background overlay */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden p-3 font-mono text-[13px] leading-6 tab-size-4 whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlightedCode + "\n" }}
          />

          {/* Interactive transparent textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onClick={updateActiveLine}
            onKeyUp={updateActiveLine}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            data-gramm="false"
            aria-label="Quantum Python Code Editor"
            className="absolute inset-0 h-full w-full resize-none bg-transparent p-3 font-mono text-[13px] leading-6 text-transparent caret-white outline-none selection:bg-accent-primary/30 tab-size-4 whitespace-pre overflow-auto"
          />
        </div>
      </div>

      {/* Editor status footer */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-line/40 bg-bg-app/90 px-3 text-[10px] font-mono text-txt-faint select-none">
        <div className="flex items-center gap-3">
          <span>Ln {activeLine}, Col 1</span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Run: ⌘+Enter / Ctrl+Enter</span>
        </div>
      </div>
    </div>
  );
}
