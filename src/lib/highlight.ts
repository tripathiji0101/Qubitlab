/**
 * Single-pass, leak-proof Python syntax highlighter for QubitLab.
 *
 * Tokenizes raw source code in ONE pass from left to right using precedence-ordered
 * token matching. Because tokens are classified BEFORE any HTML spans are created,
 * it is mathematically impossible for regular expressions to accidentally match
 * previously injected HTML tags, class attributes, hex colors, or numbers.
 */

export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function stripHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Token specification in strict precedence order:
// 1. Comments: (#.*)
// 2. Triple-quoted strings: ("""[\s\S]*?"""|'''[\s\S]*?''')
// 3. Single-line strings: ("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')
// 4. Keywords: Python standard reserved words
// 5. SDK Identifiers: Qiskit / PennyLane / Cirq high-level objects
// 6. Gate operations / methods: standard quantum gate names
// 7. Numbers: integers and floats
// 8. Whitespace / Newlines
// 9. Standard Identifiers
// 10. Operators / Punctuation
const PYTHON_TOKEN_REGEX = /(#.*)|("""[\s\S]*?"""|\x27\x27\x27[\s\S]*?\x27\x27\x27|"(?:[^"\\]|\\.)*"|\x27(?:[^\x27\\]|\\.)*\x27)|(\b(?:from|import|def|return|class|if|elif|else|for|in|while|pass|as|with|try|except|raise|lambda)\b)|(\b(?:QuantumCircuit|LineQubit|Circuit|Simulator|AerSimulator|Aer|qml|cirq|qc|qnode|device|sim|result|dev)\b)|(\b(?:Hadamard|PauliX|PauliY|PauliZ|CNOT|CZ|SWAP|RX|RY|RZ|h|x|y|z|s|t|rx|ry|rz|cx|cz|swap|measure|barrier|probs|state)\b)|(\b\d+(?:\.\d+)?\b)|(\r?\n|\s+)|([a-zA-Z_]\w*)|([^\s\w]+)/g;

/**
 * Highlights Python code for visual presentation layers.
 * The output is safe HTML containing spans with Tailwind styling classes.
 * Text content is preserved 1:1 with HTML entity escaping.
 */
export function highlightPython(code: string): string {
  if (!code) return "";

  return code.replace(
    PYTHON_TOKEN_REGEX,
    (match, comment, str, kw, sdk, gate, num, space) => {
      if (comment) return `<span class="text-txt-faint italic">${escapeHtml(comment)}</span>`;
      if (str) return `<span class="text-emerald-400">${escapeHtml(str)}</span>`;
      if (kw) return `<span class="text-purple-400 font-semibold">${escapeHtml(kw)}</span>`;
      if (sdk) return `<span class="text-sky-400 font-semibold">${escapeHtml(sdk)}</span>`;
      if (gate) return `<span class="text-accent-blue font-semibold">${escapeHtml(gate)}</span>`;
      if (num) return `<span class="text-amber-300 font-mono">${escapeHtml(num)}</span>`;
      if (space) return space;
      return escapeHtml(match);
    }
  );
}
