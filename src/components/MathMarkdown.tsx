import React, { useMemo, useState } from "react";
import katex from "katex";
import { marked } from "marked";

interface MathMarkdownProps {
  content: string;
  className?: string;
}

const KATEX_MACROS = {
  "\\ket": "\\left|#1\\right\\rangle",
  "\\bra": "\\left\\langle#1\\right|",
  "\\braket": "\\left\\langle#1\\middle|#2\\right\\rangle",
  "\\ketbra": "\\left|#1\\right\\rangle\\left\\langle#2\\right|",
};

/**
 * Renders Markdown with full KaTeX math equations (inline and block)
 * and syntax-styled code blocks with copy buttons.
 */
export default function MathMarkdown({ content, className = "" }: MathMarkdownProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const html = useMemo(() => {
    if (!content) return "";

    try {
      // 1. Normalize double-escaped backslashes from LLM or JSON (e.g. \\frac -> \frac, \\ket -> \ket)
      let processed = content.replace(/\\\\([a-zA-Z]+)/g, "\\$1");

      // 2. Protect fenced code blocks
      const codeBlocks: string[] = [];
      processed = processed.replace(/```([\s\S]*?)```/g, (match) => {
        codeBlocks.push(match);
        return `XCODEBLOCK${codeBlocks.length - 1}X`;
      });

      // 3. Protect inline code
      const inlineCodes: string[] = [];
      processed = processed.replace(/`([^`]+)`/g, (match) => {
        inlineCodes.push(match);
        return `XINLINECODE${inlineCodes.length - 1}X`;
      });

      // 3.5. Convert unicode kets (e.g. |00⟩, |11⟩, |ψ⟩) and raw \ket{...} to KaTeX math format
      processed = processed.replace(/(?<!\$)\\ket\{([^{}]+)\}(?!\$)/g, "$\\ket{$1}$");
      processed = processed.replace(/(?<!\$)\\bra\{([^{}]+)\}(?!\$)/g, "$\\bra{$1}$");
      processed = processed.replace(/\|([0-9a-zA-Z\+\-\*\_\^\\]+)[\u27e9\u3009\u232a\u27eb]/g, (_, state) => {
        const cleanState = state === "ψ" ? "\\psi" : state;
        return `$\\ket{${cleanState}}$`;
      });

      // 4. Extract and render Display Math ($$ ... $$ and \[ ... \])
      const displayMathBlocks: string[] = [];

      const renderDisplayMath = (math: string) => {
        try {
          const rendered = katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
            macros: KATEX_MACROS,
          });
          displayMathBlocks.push(
            `<div class="my-2.5 overflow-x-auto rounded-lg bg-bg-app/50 py-2 px-3 text-center border border-line/40">${rendered}</div>`
          );
        } catch {
          displayMathBlocks.push(
            `<div class="my-2 font-mono text-[12px] text-accent-blue bg-bg-app px-2 py-1 rounded">[Math: ${math}]</div>`
          );
        }
        return `\n\nXDISPLAYMATH${displayMathBlocks.length - 1}X\n\n`;
      };

      processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => renderDisplayMath(math));
      processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => renderDisplayMath(math));

      // 5. Extract and render Inline Math ($ ... $ and \( ... \))
      const inlineMathBlocks: string[] = [];

      const renderInlineMath = (math: string) => {
        try {
          const rendered = katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false,
            macros: KATEX_MACROS,
          });
          inlineMathBlocks.push(rendered);
        } catch {
          inlineMathBlocks.push(
            `<span class="font-mono text-[11px] text-accent-blue">${math}</span>`
          );
        }
        return `XINLINEMATH${inlineMathBlocks.length - 1}X`;
      };

      processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => renderInlineMath(math));
      // Inline $...$ (ensure not empty and not spans across newlines)
      processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => renderInlineMath(math));

      // 6. Restore code blocks and inline code
      processed = processed.replace(/XINLINECODE(\d+)X/g, (_, idx) => inlineCodes[+idx] || "");
      processed = processed.replace(/XCODEBLOCK(\d+)X/g, (_, idx) => codeBlocks[+idx] || "");

      // 7. Parse Markdown with marked
      const parsed = marked.parse(processed, {
        breaks: true,
        gfm: true,
      });

      let parsedHtml = typeof parsed === "string" ? parsed : "";

      // 8. Restore Math placeholders
      parsedHtml = parsedHtml.replace(/<p>\s*XDISPLAYMATH(\d+)X\s*<\/p>/g, (_, idx) => displayMathBlocks[+idx] || "");
      parsedHtml = parsedHtml.replace(/XDISPLAYMATH(\d+)X/g, (_, idx) => displayMathBlocks[+idx] || "");
      parsedHtml = parsedHtml.replace(/XINLINEMATH(\d+)X/g, (_, idx) => inlineMathBlocks[+idx] || "");

      return parsedHtml;
    } catch {
      // Fallback in case of parsing error
      return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [content]);

  const handleCopy = (codeText: string, idx: number) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(codeText);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div
      className={`prose-quantum text-[13px] leading-relaxed text-txt-dim space-y-2 select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
