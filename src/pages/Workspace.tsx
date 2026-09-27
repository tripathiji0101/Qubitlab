import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Logo from "../components/Logo";
import { Button, Tabs, cx, Tooltip } from "../components/ui";
import { gateColors, gatePalette, gateLabel, ProbabilityChart, Statevector, QSphere, BlochSphere } from "../components/quantum";
import GateEducationalTooltip from "../components/quantum/GateEducationalTooltip";
import MathMarkdown from "../components/MathMarkdown";
import { simulate, type Op } from "../lib/sim";
import { highlightPython, stripHtml } from "../lib/highlight";
import { tutor as tutorApi, learning, type TutorChatRequest, type TutorResponse, type WhatIfResult, type MissionProgress, type CelebrationInfo, getAccessToken, ApiError } from "../lib/api";
import { levels, projectContent, getMissionActivities, type Level } from "../lib/data";
import MissionActivityCard from "../components/MissionActivityCard";
import CollabRoom from "../components/CollabRoom";
import QuantumIDE from "../components/ide/QuantumIDE";

type Placement = { id: string; g: string; col: number; q: number; q2?: number; theta?: number };

interface TutorMessage {
  role: "user" | "ai";
  text: string;
  what_if?: WhatIfResult;
  applied?: boolean;
  student_state?: "NOT_STARTED" | "EARLY_ATTEMPT" | "PROGRESSING" | "NEAR_COMPLETION" | "COMPLETED" | "BLOCKED" | "INVALID";
  intent?: string;
  mission_progress?: MissionProgress;
  celebration?: CelebrationInfo;
  suggested_experiment?: string;
  sources?: Array<{
    document_title?: string;
    page_number?: number;
    section_title?: string;
    content?: string;
    similarity_score?: number;
  }>;
}
const COLS = 14;
const SDKS = ["Qiskit", "PennyLane", "Cirq"] as const;
const TWO = new Set(["CNOT", "CZ", "SWAP"]);
const ROT = new Set(["RX", "RY", "RZ"]);

let idc = 0;
const uid = () => `p${idc++}`;

const initial: Placement[] = [
  { id: uid(), g: "H", col: 0, q: 0 },
  { id: uid(), g: "CNOT", col: 1, q: 0, q2: 1 },
];

export default function Workspace() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get("room");
  const [collabRole, setCollabRole] = useState<"owner" | "editor" | "viewer">("editor");
  const isCollabViewer = Boolean(roomParam && collabRole === "viewer");
  const modeParam = searchParams.get("mode");
  const [mode, setMode] = useState<"studio" | "ide">(() => {
    if (typeof window !== "undefined" && (window.location.pathname === "/ide" || searchParams.get("mode") === "ide")) {
      return "ide";
    }
    return "studio";
  });
  const [ideCode, setIdeCode] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/ide" || modeParam === "ide") {
        setMode("ide");
      } else if (modeParam === "studio") {
        setMode("studio");
      }
    }
  }, [modeParam]);

  const [qubits, setQubits] = useState(4);
  const [placements, setPlacements] = useState<Placement[]>(initial);
  const [activeGate, setActiveGate] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredGate, setHoveredGate] = useState<{
    placement: Placement;
    rect: DOMRect;
    isTarget?: boolean;
  } | null>(null);
  const [sdk, setSdk] = useState<(typeof SDKS)[number]>("Qiskit");
  const [rightTab, setRightTab] = useState<"challenges" | "ai" | "code">("ai");
  const [sphereMode, setSphereMode] = useState<"qsphere" | "bloch">("qsphere");
  const [align, setAlign] = useState("Left alignment");
  const [inspect, setInspect] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [runStep, setRunStep] = useState("");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState<{
    timestamp: number;
    gate_count: number;
    gates: string[];
    met_criteria: number;
  }[]>([]);
  const [messages, setMessages] = useState<TutorMessage[]>([
    { role: "ai", text: "I can see your circuit — ask me anything about it, or use the quick actions below." },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tutorLoading]);

  // Track session attempts whenever non-empty placements change
  useEffect(() => {
    if (placements.length > 0) {
      setAttempts((prev) => {
        const last = prev[prev.length - 1];
        const currentGates = placements.map((p) => p.g);
        if (last && last.gate_count === placements.length && JSON.stringify(last.gates) === JSON.stringify(currentGates)) {
          return prev;
        }
        return [
          ...prev.slice(-9),
          {
            timestamp: Date.now(),
            gate_count: placements.length,
            gates: currentGates,
            met_criteria: 0,
          },
        ];
      });
    }
  }, [placements]);

  const ops: Op[] = useMemo(() => {
    return [...placements].sort((a, b) => a.col - b.col).flatMap((p): Op[] => {
      if (p.g === "M" || p.g === "B") return [];
      if (p.g === "CNOT") return [{ kind: "cnot", control: p.q, target: p.q2! }];
      if (p.g === "CZ") return [{ kind: "cz", control: p.q, target: p.q2! }];
      if (p.g === "SWAP") return [{ kind: "swap", a: p.q, b: p.q2! }];
      return [{ kind: "single", g: p.g, target: p.q, theta: p.theta ?? Math.PI / 2 }];
    });
  }, [placements]);

  const [results, setResults] = useState(() => simulate(qubits, ops));

  const place = (g: string, q: number, col: number) => {
    if (isCollabViewer) return;
    if (TWO.has(g) && q >= qubits - 1) return;
    const occupied = placements.some((p) => p.col === col && (p.q === q || p.q2 === q || (TWO.has(g) && (p.q === q + 1 || p.q2 === q + 1))));
    if (occupied) return;
    const np: Placement = { id: uid(), g, col, q, ...(TWO.has(g) ? { q2: q + 1 } : {}), ...(ROT.has(g) ? { theta: Math.PI / 2 } : {}) };
    setPlacements((prev) => [...prev, np]);
    setSelected(np.id);
    setActiveGate(null);
  };

  const updatePlacement = (id: string, updates: Partial<Placement>) => {
    if (isCollabViewer) return;
    setPlacements((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let nextG = updates.g ?? p.g;
        let nextQ = updates.q !== undefined ? updates.q : p.q;
        let nextCol = updates.col !== undefined ? updates.col : p.col;
        let nextQ2 = updates.q2 !== undefined ? updates.q2 : p.q2;
        let nextTheta = updates.theta !== undefined ? updates.theta : p.theta;

        if (TWO.has(nextG)) {
          if (nextQ2 === undefined || nextQ2 === nextQ) {
            nextQ2 = nextQ === qubits - 1 ? nextQ - 1 : nextQ + 1;
          }
        } else {
          nextQ2 = undefined;
        }

        if (ROT.has(nextG)) {
          if (nextTheta === undefined) nextTheta = Math.PI / 2;
        } else {
          nextTheta = undefined;
        }

        const collision = prev.some(
          (other) =>
            other.id !== id &&
            other.col === nextCol &&
            (other.q === nextQ ||
              other.q2 === nextQ ||
              (TWO.has(nextG) && (other.q === nextQ2 || other.q2 === nextQ2)))
        );

        if (collision) {
          return {
            ...p,
            g: nextG,
            theta: nextTheta,
          };
        }

        return {
          ...p,
          g: nextG,
          q: nextQ,
          col: nextCol,
          ...(nextQ2 !== undefined ? { q2: nextQ2 } : {}),
          ...(nextTheta !== undefined ? { theta: nextTheta } : {}),
        };
      })
    );
  };

  const remove = (id: string) => {
    if (isCollabViewer) return;
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => (prev === id ? null : prev));
  };

  const duplicate = (id: string) => {
    if (isCollabViewer) return;
    const p = placements.find((x) => x.id === id);
    if (!p) return;
    let targetCol = p.col + 1;
    while (targetCol < COLS) {
      const occupied = placements.some(
        (o) =>
          o.col === targetCol &&
          (o.q === p.q ||
            o.q2 === p.q ||
            (p.q2 !== undefined && (o.q === p.q2 || o.q2 === p.q2)))
      );
      if (!occupied) break;
      targetCol++;
    }
    if (targetCol >= COLS) return;
    const np: Placement = {
      ...p,
      id: uid(),
      col: targetCol,
    };
    setPlacements((prev) => [...prev, np]);
    setSelected(np.id);
  };

  const moveBlockBy = (id: string, deltaQ: number, deltaCol: number) => {
    if (isCollabViewer) return;
    const p = placements.find((x) => x.id === id);
    if (!p) return;

    const targetQ = p.q + deltaQ;
    const targetCol = p.col + deltaCol;
    const targetQ2 = p.q2 !== undefined ? p.q2 + deltaQ : undefined;

    if (targetCol < 0 || targetCol >= COLS) return;
    if (targetQ < 0 || targetQ >= qubits) return;
    if (TWO.has(p.g) && targetQ2 !== undefined && (targetQ2 < 0 || targetQ2 >= qubits)) return;

    const collision = placements.some(
      (other) =>
        other.id !== id &&
        other.col === targetCol &&
        (other.q === targetQ ||
          other.q2 === targetQ ||
          (TWO.has(p.g) && (other.q === targetQ2 || other.q2 === targetQ2)))
    );
    if (collision) return;

    setPlacements((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              q: targetQ,
              col: targetCol,
              ...(targetQ2 !== undefined ? { q2: targetQ2 } : {}),
            }
          : x
      )
    );
  };

  const flipBlockQubits = (id: string) => {
    if (isCollabViewer) return;
    const p = placements.find((x) => x.id === id);
    if (!p || !TWO.has(p.g) || p.q2 === undefined) return;
    setPlacements((prev) =>
      prev.map((x) => (x.id === id ? { ...x, q: x.q2!, q2: x.q } : x))
    );
  };

  const moveBlockTo = (id: string, newRow: number, newCol: number) => {
    if (isCollabViewer) return;
    const p = placements.find((x) => x.id === id);
    if (!p) return;
    if (p.q === newRow && p.col === newCol) return;

    let newQ2 = p.q2;
    if (TWO.has(p.g) && p.q2 !== undefined) {
      const diff = p.q2 - p.q;
      if (newRow + diff >= 0 && newRow + diff < qubits && newRow + diff !== newRow) {
        newQ2 = newRow + diff;
      } else {
        newQ2 = newRow === 0 ? 1 : newRow - 1;
      }
    }

    const collision = placements.some(
      (x) =>
        x.id !== id &&
        x.col === newCol &&
        (x.q === newRow ||
          x.q2 === newRow ||
          (TWO.has(p.g) && (x.q === newQ2 || x.q2 === newQ2)))
    );
    if (collision) return;

    setPlacements((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              q: newRow,
              col: newCol,
              ...(newQ2 !== undefined ? { q2: newQ2 } : {}),
            }
          : x
      )
    );
    setSelected(id);
  };

  // Keyboard shortcuts: Delete/Backspace to remove, Escape to deselect, Arrows to nudge block
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selected) {
        e.preventDefault();
        remove(selected);
      }
      if (e.key === "Escape") {
        setSelected(null);
        setActiveGate(null);
      }
      if (selected) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          moveBlockBy(selected, 0, -1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          moveBlockBy(selected, 0, 1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          moveBlockBy(selected, -1, 0);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          moveBlockBy(selected, 1, 0);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, placements, qubits]);

  const run = () => {
    setRunning(true);
    const steps = ["Compiling circuit…", "Running Qiskit Aer…", "Calculating statevector…", "Generating measurements…"];
    steps.forEach((s, i) => setTimeout(() => setRunStep(s), i * 260));
    setTimeout(() => { setResults(simulate(qubits, ops)); setRunning(false); setRunStep(""); }, steps.length * 260 + 200);
  };

  const code = useMemo(() => genCode(sdk, qubits, placements), [sdk, qubits, placements]);
  const selPlacement = placements.find((p) => p.id === selected);
  const depth = placements.length ? Math.max(...placements.map((p) => p.col)) + 1 : 0;
  const nonMeasure = placements.filter((p) => p.g !== "M" && p.g !== "B").length;

  // ── Dynamic Level Context from URL (?level=... or ?project=...) ──
  const levelParam = searchParams.get("level") || searchParams.get("project");
  const circuitRevisionRef = useRef(0);

  // Collaboration room circuit sync handler
  const handleCollabCircuitSync = useCallback((circuit: { placements: unknown[]; qubits: number }, revision: number) => {
    setPlacements(circuit.placements as Placement[]);
    setQubits(circuit.qubits as number);
    circuitRevisionRef.current = revision;
  }, []);

  const getCircuitForCollab = useCallback(() => ({
    placements: placements as unknown[],
    qubits,
  }), [placements, qubits]);
  const currentLevel = useMemo(() => {
    if (levelParam) {
      const match = levels.find(
        (l) => l.slug === levelParam || String(l.n) === levelParam || (levelParam === "qkd" && l.slug === "bb84")
      );
      if (match) return match;
    }
    return levels.find((l) => l.status === "active") ?? levels[0];
  }, [levelParam]);

  const currentContent = projectContent[currentLevel.slug] ?? projectContent._default;
  const nextLevel = levels.find((x) => x.n === currentLevel.n + 1);

  // Live mission progress state
  const [liveMissionProgress, setLiveMissionProgress] = useState<MissionProgress | null>(null);
  const [showMissionDrawer, setShowMissionDrawer] = useState(false);
  const [missionAwarded, setMissionAwarded] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"objectives" | "challenges">("objectives");

  // Interactive challenges state
  const activities = useMemo(() => getMissionActivities(currentLevel.slug), [currentLevel.slug]);
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});

  // Sync initial completion status from localStorage
  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const act of activities) {
      try {
        const saved = localStorage.getItem(`qubitlab_act_${currentLevel.slug}_${act.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.status === "CORRECT" || parsed.status === "COMPLETED") {
            map[act.id] = true;
          }
        }
      } catch {}
    }
    setCompletedActivities(map);
  }, [currentLevel.slug, activities]);

  const completedActCount = Object.values(completedActivities).filter(Boolean).length;

  // Reset live verification on circuit or level changes so UI never displays stale verification
  useEffect(() => {
    setLiveMissionProgress(null);
  }, [placements]);

  useEffect(() => {
    setLiveMissionProgress(null);
    setMissionAwarded(false);
  }, [currentLevel.slug]);

  // Active criteria evaluation for compact mission ribbon
  const activeCriteria = useMemo(() => {
    if (liveMissionProgress) {
      return {
        metCount: liveMissionProgress.met_count,
        totalCount: liveMissionProgress.total_count,
        percentage: liveMissionProgress.percentage,
        isCompleted: liveMissionProgress.percentage === 100,
        items: liveMissionProgress.criteria.map((c) => ({
          text: c.criterion,
          passed: c.status === "MET",
          reason: c.reason,
        })),
      };
    }

    // Canvas placement heuristic evaluation before tutor is invoked
    const criteriaTexts = currentContent.successCriteria || [];
    const hasH = placements.some((p) => p.g === "H");
    const hasCNOT = placements.some((p) => p.g === "CNOT");
    const p00 = results.probs.find((p) => p.state === "00" || p.state.startsWith("00"))?.p || 0;
    const p11 = results.probs.find((p) => p.state === "11" || p.state.startsWith("11"))?.p || 0;
    const isBell = Math.abs(p00 - 0.5) < 0.08 && Math.abs(p11 - 0.5) < 0.08 && results.probs.filter((p) => p.p > 0.05).length === 2;

    const items = criteriaTexts.map((text, idx) => {
      let passed = false;
      const lower = text.toLowerCase();
      if (lower.includes("superposition") || lower.includes("hadamard") || lower.includes("h gate")) {
        passed = hasH;
      } else if (lower.includes("entangle") || lower.includes("cnot") || lower.includes("bell pair")) {
        passed = hasCNOT;
      } else if (lower.includes("bell state") || lower.includes("target") || lower.includes("correct")) {
        passed = isBell;
      } else if (idx === 0 && placements.length > 0) {
        passed = true;
      }
      return { text, passed, reason: passed ? "Ready to verify" : "Pending" };
    });

    const metCount = items.filter((x) => x.passed).length;
    const totalCount = items.length || 1;
    const percentage = Math.round((metCount / totalCount) * 100);

    return {
      metCount,
      totalCount,
      percentage,
      isCompleted: false, // Authoritative completion requires backend verification
      items,
    };
  }, [liveMissionProgress, currentContent.successCriteria, placements, results.probs]);

  const buildPayload = useCallback(
    (question: string): TutorChatRequest => {
      // Recompute sim results fresh from current placements so tutor never sees stale data
      const freshOps: Op[] = [...placements].sort((a, b) => a.col - b.col).flatMap((p): Op[] => {
        if (p.g === "M" || p.g === "B") return [];
        if (p.g === "CNOT") return [{ kind: "cnot", control: p.q, target: p.q2! }];
        if (p.g === "CZ") return [{ kind: "cz", control: p.q, target: p.q2! }];
        if (p.g === "SWAP") return [{ kind: "swap", a: p.q, b: p.q2! }];
        return [{ kind: "single", g: p.g, target: p.q, theta: p.theta ?? Math.PI / 2 }];
      });
      const freshSim = simulate(qubits, freshOps);

      // Build selected gate context from the currently selected placement
      const sel = selected ? placements.find((p) => p.id === selected) : null;
      const selectedGate = sel ? { id: sel.id, gate: sel.g, qubit: sel.q, moment: sel.col, ...(sel.q2 !== undefined ? { target: sel.q2 } : {}) } : undefined;

      return {
        question,
        placements: placements.map((p) => ({ id: p.id, g: p.g, col: p.col, q: p.q, q2: p.q2, theta: p.theta })),
        qubits,
        classical_bits: qubits,
        simulation_result: { probs: freshSim.probs, amps: freshSim.amps },
        project_slug: currentLevel.slug,
        level: {
          number: currentLevel.n,
          title: currentLevel.title,
          algorithm: currentLevel.algorithm,
          difficulty: currentLevel.difficulty,
        },
        lesson: {
          title: currentLevel.title,
          content: currentContent.sections.map((s) => (s.body ? s.body(currentLevel) : (s.list ?? []).join("; "))).join(" "),
        },
        mission: currentLevel.mission,
        success_criteria: currentContent.successCriteria,
        concepts: currentLevel.concepts,
        selected_gate: selectedGate,
        challenge_context: {
          active: false,
          objective: currentLevel.mission,
          hints_used: hintsUsed,
        },
        student_history: {
          attempt_count: Math.max(attempts.length, 1),
          hints_used: hintsUsed,
          recent_attempts: attempts.slice(-5),
        },
        available_gates: currentLevel.gates,
        conversation_history: messages.slice(-8),
      };
    },
    [placements, qubits, selected, currentLevel, currentContent, messages, hintsUsed, attempts],
  );

  const callTutor = useCallback(
    async (apiFn: (body: TutorChatRequest) => Promise<TutorResponse>, question: string, showQuestion = true) => {
      if (tutorLoading) return;
      setCopilotOpen(true);
      setRightTab("ai");

      const token = getAccessToken();
      if (!token) {
        if (showQuestion) setMessages((m) => [...m, { role: "user", text: question }]);
        setMessages((m) => [
          ...m,
          {
            role: "ai",
            text: "Authentication required. Please sign in to your account to use the Quantum AI Tutor.",
          },
        ]);
        nav("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
        return;
      }

      if (showQuestion) setMessages((m) => [...m, { role: "user", text: question }]);
      setTutorLoading(true);
      try {
        const payload = buildPayload(question);
        const res = await apiFn(payload);
        if (res.mission_progress) {
          setLiveMissionProgress(res.mission_progress);
        }
        if ((res.celebration || res.student_state === "COMPLETED") && !missionAwarded) {
          setMissionAwarded(true);
          learning.completeProject(currentLevel.slug).catch(() => {});
        }
        setMessages((m) => [
          ...m,
          {
            role: "ai",
            text: res.response,
            what_if: res.what_if,
            student_state: res.student_state,
            intent: res.intent,
            mission_progress: res.mission_progress,
            celebration: res.celebration,
            suggested_experiment: res.suggested_experiment,
            sources: res.sources as any,
          },
        ]);
      } catch (e: unknown) {
        if (e instanceof ApiError && e.status === 401) {
          setMessages((m) => [
            ...m,
            {
              role: "ai",
              text: "Authentication required. Your session may have expired. Redirecting to sign in...",
            },
          ]);
          nav("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
          return;
        }
        const errMsg = e instanceof Error ? e.message : "Request failed";
        setMessages((m) => [...m, { role: "ai", text: `Sorry, I encountered an error: ${errMsg}. I can still help — try asking a specific question about your circuit.` }]);
      } finally {
        setTutorLoading(false);
      }
    },
    [buildPayload, tutorLoading, nav],
  );

  // If entering from the Curriculum modal with a pre-loaded question, trigger Tutor
  const tutorPromptProcessedRef = useRef(false);
  const tutorPromptParam = searchParams.get("tutorPrompt") || searchParams.get("ask");
  const tutorPhaseParam = searchParams.get("phase");

  useEffect(() => {
    if (tutorPromptParam && !tutorPromptProcessedRef.current) {
      tutorPromptProcessedRef.current = true;
      setCopilotOpen(true);
      setRightTab("ai");
      const promptText = tutorPhaseParam
        ? `[Curriculum: ${tutorPhaseParam}]\n${tutorPromptParam}`
        : tutorPromptParam;
      callTutor(tutorApi.chat, promptText);
    }
  }, [tutorPromptParam, tutorPhaseParam, callTutor]);

  const applyWhatIf = useCallback(
    (index: number, whatIf: WhatIfResult) => {
      if (!whatIf?.valid || !whatIf.modified_placements) return;

      // 1. Update circuit placements with fresh UUIDs (actual circuit modified only here!)
      const newPlacements: Placement[] = whatIf.modified_placements.map((p) => ({
        id: p.id || uid(),
        g: p.g,
        col: p.col,
        q: p.q,
        q2: p.q2,
        theta: p.theta,
      }));
      setPlacements(newPlacements);
      setSelected(null);

      // 2. Immediately re-simulate for the quantum studio canvas & telemetry
      const newOps: Op[] = [...newPlacements].sort((a, b) => a.col - b.col).flatMap((p): Op[] => {
        if (p.g === "M" || p.g === "B") return [];
        if (p.g === "CNOT") return [{ kind: "cnot", control: p.q, target: p.q2! }];
        if (p.g === "CZ") return [{ kind: "cz", control: p.q, target: p.q2! }];
        if (p.g === "SWAP") return [{ kind: "swap", a: p.q, b: p.q2! }];
        return [{ kind: "single", g: p.g, target: p.q, theta: p.theta ?? Math.PI / 2 }];
      });
      setResults(simulate(qubits, newOps));

      // 3. Mark message as applied
      setMessages((prev) =>
        prev.map((msg, i) => (i === index ? { ...msg, applied: true } : msg))
      );

      // 4. Append tutor confirmation message
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `⚡ **Applied modification to circuit**: *${whatIf.description}*\n\nYour active workspace circuit and quantum simulator ground truth have been updated.`,
        },
      ]);
    },
    [qubits],
  );

  const ask = (text: string) => callTutor(tutorApi.chat, text);
  const explainCircuit = () => callTutor(tutorApi.explain, "Explain my circuit step by step");
  const debugCircuit = () => callTutor(tutorApi.debug, "Debug my circuit");
  const verifyCircuit = () => callTutor(tutorApi.verify, "Check my circuit against the mission");
  const suggestNext = () => callTutor(tutorApi.chat, "What should I add next?");
  const giveHint = () => {
    setHintsUsed((h) => h + 1);
    callTutor(tutorApi.hint, "Give me a hint");
  };

  const filtered = gatePalette.map((grp) => ({ ...grp, gates: grp.gates.filter((g) => (gateLabel[g] + g).toLowerCase().includes(search.toLowerCase())) })).filter((g) => g.gates.length);

  /* ── Results tab state for unified panel ── */
  const [resultsTab, setResultsTab] = useState<"prob" | "state" | "viz">("prob");

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-bg-app text-txt">
      
      {/* 1. Far Left Sidebar — Inspired by Modern Learning Tech Platforms */}
      <aside className="hidden w-56 flex-col border-r border-line/60 bg-bg-app lg:flex select-none">
        <div className="flex h-14 items-center justify-between px-5 border-b border-line/40">
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-7 w-7 place-items-center rounded-lg bg-accent-primary/15 border border-accent-primary/30">
              <Logo size={20} withWordmark={false} />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-quantum-cyan animate-pulse" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white font-display">QubitLab</span>
          </div>
          <span className="rounded-full bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-accent-blue">
            Studio
          </span>
        </div>
        
        <nav className="flex-1 space-y-6 px-3.5 py-5 overflow-y-auto">
          <div>
            <div className="mb-2.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-txt-faint flex items-center justify-between">
              <span>Learning Path</span>
              <span className="h-1 w-1 rounded-full bg-ok" />
            </div>
            <div className="space-y-1">
              <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-txt-dim transition-all hover:bg-bg-panel/70 hover:text-white">
                <span className="text-base text-txt-faint">⌂</span> Dashboard
              </Link>
              <Link to="/workspace" className="flex items-center gap-3 rounded-xl bg-bg-panel/80 px-3 py-2 text-[13px] font-semibold text-white shadow-xs border border-line/70 relative">
                <span className="text-base text-accent-primary">⚛</span> Quantum Studio
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-quantum-cyan" />
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-2.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-txt-faint">
              Curriculum
            </div>
            <div className="space-y-1">
              <Link to="/challenges" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-txt-dim transition-all hover:bg-bg-panel/70 hover:text-white">
                <span className="text-base text-txt-faint">🎯</span> Challenges
              </Link>
              <Link to="/learn" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-txt-dim transition-all hover:bg-bg-panel/70 hover:text-white">
                <span className="text-base text-txt-faint">📚</span> Courses
              </Link>
            </div>
          </div>
        </nav>
        
        {/* User Card — Gamified Learning Profile */}
        <div className="border-t border-line/50 p-3.5 bg-bg-surface/20">
          <div className="flex items-center gap-3 rounded-xl p-2 bg-bg-surface/40 border border-line/40">
            <div className="relative h-8.5 w-8.5 overflow-hidden rounded-full border border-line bg-bg-panel shrink-0">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex" alt="Profile" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-[12px] font-bold text-white">Alex Mercer</span>
                <span className="text-[10px] font-mono text-ok font-bold">L{currentLevel.n}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-txt-faint mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                <span className="truncate">Quantum Explorer</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        
        {/* ═══════════════════════════════════════════════════════════
            TOP HEADER — Learning Tech Stage Bar
            ═══════════════════════════════════════════════════════════ */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-line/60 bg-bg-app px-4">
          <div className="flex items-center gap-2.5 text-[13px]">
            {/* Unified Environment Switcher: Circuit Studio | Quantum IDE */}
            <div className="flex items-center rounded-lg bg-bg-surface p-0.5 border border-line/60">
              <button
                type="button"
                onClick={() => setMode("studio")}
                className={cx(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                  mode === "studio"
                    ? "bg-accent-primary text-white shadow-xs"
                    : "text-txt-dim hover:text-white"
                )}
              >
                <span>📐 Studio</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("ide");
                  setIdeCode(code);
                }}
                className={cx(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                  mode === "ide"
                    ? "bg-accent-primary text-white shadow-xs"
                    : "text-txt-dim hover:text-white"
                )}
              >
                <span>💻 IDE</span>
              </button>
            </div>

            <span className="text-txt-faint/40 hidden sm:inline">/</span>
            <span className="font-mono text-[11px] font-bold text-accent-blue bg-accent-primary/10 border border-accent-primary/30 rounded-md px-1.5 py-0.5">
              L{String(currentLevel.n).padStart(2, "0")}
            </span>
            <span className="font-bold text-white tracking-tight hidden sm:inline">{currentLevel.algorithm}</span>
            <span className="hidden md:inline-flex rounded-full bg-bg-surface border border-line/60 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-txt-dim">
              {currentLevel.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {mode === "studio" && (
              <>
                {/* Target Framework / SDK */}
                <div className="relative flex items-center">
                  <select
                    value={sdk}
                    onChange={(e) => setSdk(e.target.value as any)}
                    className="h-8 rounded-lg border border-line/60 bg-bg-surface px-2.5 pr-7 text-[12px] font-mono font-semibold text-txt-dim outline-none focus:border-accent-primary hover:border-line-strong transition-colors cursor-pointer appearance-none"
                  >
                    {SDKS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2 text-[10px] text-txt-faint">▼</span>
                </div>

                {/* Run Circuit Action Button — Primary Accent with Subtle Quantum Glow */}
                <button
                  type="button"
                  onClick={run}
                  disabled={running}
                  className={cx(
                    "flex items-center gap-2 h-8 px-4 rounded-lg text-[12px] font-bold transition-all select-none cursor-pointer shadow-sm",
                    running
                      ? "bg-accent-primary/50 text-white cursor-wait"
                      : "bg-accent-primary hover:bg-blue-600 text-white hover:shadow-[0_0_14px_rgba(59,130,246,0.35)] active:scale-98"
                  )}
                >
                  <span className={running ? "animate-spin" : ""}>{running ? "⚙" : "▶"}</span>
                  <span>{running ? "Running…" : "Run Circuit"}</span>
                </button>
              </>
            )}

            {/* Socratic Copilot Trigger Pill */}
            <button
              type="button"
              onClick={() => {
                if (!copilotOpen) {
                  setCopilotOpen(true);
                  setRightTab("ai");
                } else if (rightTab === "ai") {
                  setCopilotOpen(false);
                } else {
                  setRightTab("ai");
                }
              }}
              className={cx(
                "flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-all relative select-none cursor-pointer border",
                copilotOpen && rightTab === "ai"
                  ? "bg-accent-primary/20 text-accent-blue border-accent-primary/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                  : "bg-bg-surface/70 text-txt-dim hover:text-white hover:bg-bg-panel border-line/60"
              )}
              aria-label="Toggle Quantum Copilot"
            >
              <span className="text-accent-primary font-bold">✦</span>
              <span className="hidden sm:inline">AI Tutor</span>
              {messages.length > 1 && (!copilotOpen || rightTab !== "ai") && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-quantum-cyan shadow-[0_0_6px_#00f0ff]" />
              )}
            </button>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════
            WORKSPACE BODY: Quantum IDE or Circuit Studio
            ═══════════════════════════════════════════════════════════ */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
        {mode === "ide" ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <QuantumIDE
              initialCode={ideCode || code}
              initialFramework={sdk}
              initialPlacements={placements}
              initialQubits={qubits}
              onOpenInStudio={(newPlacements, newQubits, newFramework) => {
                setPlacements(newPlacements);
                setQubits(newQubits);
                if (newFramework && (SDKS as readonly string[]).includes(newFramework)) {
                  setSdk(newFramework as any);
                }
                setMode("studio");
              }}
              onAskTutor={(question) => {
                setCopilotOpen(true);
                setRightTab("ai");
                ask(question);
              }}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 overflow-hidden bg-bg-canvas">
          
          {/* ── Gate Palette Sidebar (Quantum Toolbox) ── */}
          <aside className="w-56 shrink-0 flex-col overflow-y-auto hidden md:flex border-r border-line/40 bg-bg-app px-3.5 py-4 select-none">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-txt-faint">
                Quantum Toolbox
              </h2>
              <span className="rounded-full bg-bg-surface border border-line/50 px-2 py-0.2 text-[9px] font-mono text-txt-faint">
                {gatePalette.flatMap(g => g.gates).length} Gates
              </span>
            </div>
            
            {/* Gate Search Filter */}
            <div className="relative mb-3.5">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-faint text-[11px]">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter gates…"
                className="h-8 w-full rounded-lg bg-bg-surface pl-7.5 pr-6 text-[12px] outline-none border border-line/50 focus:border-accent-primary/60 transition-colors text-txt placeholder:text-txt-faint"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-bg-panel px-1 text-[9px] font-mono text-txt-faint">
                /
              </span>
            </div>

            <div className="space-y-4">
              {filtered.map((grp) => (
                <div key={grp.group} className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-txt-faint/80 px-0.5">
                    {grp.group}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {grp.gates.map((g) => (
                      <Tooltip key={g} label={gateLabel[g]}>
                        <button
                          draggable
                          onDragStart={(e) => { e.dataTransfer.setData("gate", g); setDragging(true); }}
                          onDragEnd={() => setDragging(false)}
                          onClick={() => setActiveGate((a) => (a === g ? null : g))}
                          className={cx(
                            "tactile-chip grid h-9 w-full place-items-center rounded-lg font-mono font-bold border cursor-pointer select-none",
                            g.length > 2 ? "text-[11px] tracking-tight" : "text-[13px]",
                            activeGate === g
                              ? "ring-2 ring-accent-primary bg-accent-primary/20 border-accent-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                              : "bg-bg-surface/90 border-line/60 hover:bg-bg-panel hover:border-line-strong hover:text-white"
                          )}
                          style={{ color: activeGate === g ? undefined : gateColors[g] }}
                        >
                          {g}
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Central Area: Circuit + Results ── */}
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
            
            {/* ─── Mission Header: Inspiring Learning Deck (Brilliant / Khan Academy inspired) ─── */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-2.5 border-b border-line/40 bg-bg-app/95 backdrop-blur-md select-none">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[11px] font-bold text-accent-blue bg-accent-primary/10 border border-accent-primary/30 rounded-md px-2 py-0.5 tracking-wide shrink-0">
                  MISSION L{String(currentLevel.n).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-white truncate font-display">{currentLevel.algorithm}</div>
                  <div className="text-[12px] text-txt-dim truncate hidden sm:block">{currentLevel.mission}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Objectives Progress Pill with embedded visual progress bar */}
                <button
                  type="button"
                  onClick={() => setShowMissionDrawer(!showMissionDrawer)}
                  className={cx(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] font-mono transition-all cursor-pointer shadow-xs",
                    showMissionDrawer
                      ? "bg-accent-primary/15 border-accent-primary/40 text-accent-blue"
                      : "bg-bg-surface/60 border-line/60 text-txt-dim hover:text-txt hover:bg-bg-panel"
                  )}
                  title="View Mission Objectives"
                >
                  <span className="font-bold">🎯 {activeCriteria.metCount}/{activeCriteria.totalCount}</span>
                  <div className="h-1.5 w-10 rounded-full bg-bg-panel overflow-hidden border border-line/40 shrink-0">
                    <div
                      className={cx("h-full transition-all duration-300 rounded-full", activeCriteria.isCompleted ? "bg-ok" : "bg-accent-primary")}
                      style={{ width: `${(activeCriteria.metCount / Math.max(1, activeCriteria.totalCount)) * 100}%` }}
                    />
                  </div>
                </button>

                {/* Challenges Pill — Opens Challenges in the Right Learning Dock */}
                {activities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!copilotOpen) {
                        setCopilotOpen(true);
                        setRightTab("challenges");
                      } else if (rightTab === "challenges") {
                        setCopilotOpen(false);
                      } else {
                        setRightTab("challenges");
                      }
                    }}
                    className={cx(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-mono transition-all cursor-pointer shadow-xs",
                      copilotOpen && rightTab === "challenges"
                        ? "bg-accent-primary/20 border-accent-primary text-white shadow-xs"
                        : "bg-bg-surface/60 border-line/60 text-txt-dim hover:text-txt hover:bg-bg-panel"
                    )}
                    title="Open Interactive Quantum Challenges"
                  >
                    <span>🧠</span>
                    <span className="font-bold">{completedActCount}/{activities.length}</span>
                    {completedActCount === activities.length && (
                      <span className="text-ok font-bold text-[10px]">✓</span>
                    )}
                  </button>
                )}

                {/* Verify Mission Button with emerald celebratory reward feel */}
                <button
                  type="button"
                  onClick={() => {
                    if (!copilotOpen) setCopilotOpen(true);
                    setRightTab("ai");
                    verifyCircuit();
                  }}
                  className="rounded-lg bg-accent-primary/10 border border-accent-primary/30 px-3 py-1.5 text-[12px] font-bold text-accent-primary hover:bg-accent-primary hover:text-white transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  ✓ Verify Mission
                </button>

                {/* Next Level Progression */}
                {activeCriteria.isCompleted && nextLevel && (
                  <Link
                    to={`/workspace?level=${nextLevel.slug}`}
                    className="rounded-lg bg-ok px-3 py-1.5 text-[12px] font-bold text-bg-app hover:bg-ok/90 transition-all flex items-center gap-1 animate-pulse shadow-sm"
                  >
                    Next Level →
                  </Link>
                )}

                {/* Drawer toggle chevron */}
                <button
                  type="button"
                  onClick={() => setShowMissionDrawer(!showMissionDrawer)}
                  className="rounded-md p-1.5 text-txt-faint hover:text-txt hover:bg-bg-panel transition-colors text-[11px] cursor-pointer"
                  aria-label="Toggle mission drawer"
                >
                  {showMissionDrawer ? "▲" : "▼"}
                </button>
              </div>
            </div>

            {/* ─── Mission Drawer (expandable Objectives) ─── */}
            {showMissionDrawer && (
              <div className="border-b border-line/40 bg-bg-app px-6 py-3.5 text-[13px] space-y-3 animate-rise max-h-[300px] overflow-y-auto select-none">
                <div className="flex items-center justify-between pb-1 border-b border-line/30">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-txt-dim text-[11px] font-mono">Mission Objectives & Criteria</span>
                    <span className="rounded-full bg-ok/10 border border-ok/30 px-2 py-0.5 text-[10px] font-mono font-bold text-ok">
                      {activeCriteria.metCount} / {activeCriteria.totalCount} Satisfied
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMissionDrawer(false);
                          setCopilotOpen(true);
                          setRightTab("challenges");
                        }}
                        className="rounded-lg border border-line/40 bg-bg-surface/60 px-2.5 py-1 text-[11px] font-mono font-bold text-txt-dim hover:text-white hover:bg-bg-panel transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🧠 Open Challenges ({completedActCount}/{activities.length}) →</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowMissionDrawer(false)}
                      className="h-7 w-7 rounded-lg border border-line/40 bg-bg-surface/60 flex items-center justify-center text-txt-faint hover:text-white hover:bg-bg-panel text-[12px] transition-all cursor-pointer"
                      aria-label="Close drawer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Objectives List — Scannable Learning Milestone Cards */}
                <div className="divide-y divide-line/30 rounded-xl border border-line/50 bg-bg-surface/30 overflow-hidden">
                  {activeCriteria.items.map((crit, idx) => (
                    <div
                      key={idx}
                      className={cx(
                        "flex items-start gap-3 px-3.5 py-2.5 text-[12px] min-h-[44px] transition-colors",
                        crit.passed ? "bg-ok/[0.04]" : "hover:bg-bg-panel/20"
                      )}
                    >
                      <span
                        className={cx(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold shadow-xs",
                          crit.passed
                            ? "bg-ok/20 text-ok border border-ok/50"
                            : "bg-bg-panel text-txt-faint border border-line/60"
                        )}
                      >
                        {crit.passed ? "✓" : "○"}
                      </span>
                      <div className="min-w-0 flex-1 leading-snug">
                        <div className={cx("font-semibold", crit.passed ? "text-white" : "text-txt-dim")}>
                          {crit.text}
                        </div>
                        <div className="text-[11px] text-txt-faint mt-0.5 font-mono flex items-center gap-1.5">
                          <span className={crit.passed ? "text-ok" : "text-txt-faint"}>●</span>
                          <span>{crit.reason || (crit.passed ? "Ready to verify" : "Pending")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                CIRCUIT CANVAS — THE HERO (IBM Quantum & Brilliant Laboratory Stage)
                ═══════════════════════════════════════════════════════════ */}
            <div className="relative shrink-0 px-6 pt-3.5 pb-3">
              {running && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-bg-canvas/85 backdrop-blur-sm rounded-2xl">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-line-strong border-t-accent-primary" />
                  <span className="font-mono text-[13px] font-bold text-white tracking-wide">{runStep}</span>
                </div>
              )}

              {/* Floating circuit telemetry toolbar */}
              <div className="flex items-center justify-between pb-2 text-[12px] font-mono text-txt-faint select-none">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-bg-surface/80 border border-line/40 px-2 py-0.5 text-[11px]">
                    Depth <strong className="text-white font-bold">{depth}</strong>
                  </span>
                  <span className="rounded-md bg-bg-surface/80 border border-line/40 px-2 py-0.5 text-[11px]">
                    Gates <strong className="text-white font-bold">{nonMeasure}</strong>
                  </span>
                  {placements.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setPlacements([]); setSelected(null); }}
                      className="rounded-md border border-line/40 bg-bg-surface/50 hover:bg-danger/15 hover:border-danger/40 hover:text-danger px-2.5 py-0.5 text-[11px] text-txt-faint transition-all cursor-pointer"
                      title="Clear all gates from canvas"
                    >
                      Clear Circuit
                    </button>
                  )}
                </div>

                {/* Tactile Qubit Stepper */}
                <div className="flex items-center gap-1.5 bg-bg-surface/80 border border-line/60 rounded-lg p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQubits((q) => Math.max(1, q - 1))}
                    className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-bg-panel text-txt-dim hover:text-white text-[13px] font-bold cursor-pointer transition-colors"
                    title="Remove Qubit"
                  >
                    −
                  </button>
                  <span className="text-[11px] font-mono font-bold text-white w-16 text-center select-none">
                    {qubits} {qubits === 1 ? "qubit" : "qubits"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQubits((q) => Math.min(6, q + 1))}
                    className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-bg-panel text-txt-dim hover:text-white text-[13px] font-bold cursor-pointer transition-colors"
                    title="Add Qubit"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Circuit Bed / Blueprint Instrument Stage */}
              {roomParam && (
                <CollabRoom
                  roomId={roomParam}
                  onCircuitSync={handleCollabCircuitSync}
                  getCircuit={getCircuitForCollab}
                  circuitRevisionRef={circuitRevisionRef}
                  onRoleChange={setCollabRole}
                />
              )}
              <div className="rounded-2xl border border-line/60 quantum-grid-bg p-4.5 shadow-sm relative overflow-hidden">
                {placements.length === 0 && (
                  <div className="mb-4 rounded-xl border border-dashed border-line/70 bg-bg-surface/40 p-5 text-center">
                    <div className="text-[13px] font-bold text-white mb-1 font-display">Quantum Canvas Ready</div>
                    <div className="text-[12px] text-txt-dim">Click a gate in the toolbox or drag it directly onto any quantum wire.</div>
                  </div>
                )}

                <div className="space-y-1">
                  {Array.from({ length: qubits }).map((_, row) => {
                    const p1 = results.amps.filter((a) => a.state[row] === "1").reduce((s, a) => s + a.p, 0);
                    return (
                      <div key={row} className="flex items-center gap-3 h-13">
                        {/* Qubit Rail Pill Badge */}
                        <span className="w-8 shrink-0 rounded-md bg-bg-surface/90 border border-line/60 py-1 text-center font-mono text-[11px] font-bold text-txt-dim select-none shadow-2xs">
                          q[{row}]
                        </span>
                        <div className="relative flex-1">
                          {/* Quantum wire with subtle electrical glow */}
                          <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-line-strong quantum-wire-glow" />
                          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
                            {Array.from({ length: COLS }).map((_, col) => {
                              const here = placements.find((p) => p.col === col && p.q === row);
                              const target = placements.find((p) => p.col === col && TWO.has(p.g) && p.q2 === row);
                              return (
                                <div
                                  key={col}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const moveBlockId = e.dataTransfer.getData("move-block");
                                    if (moveBlockId) {
                                      moveBlockTo(moveBlockId, row, col);
                                      setDragging(false);
                                      return;
                                    }
                                    const moveTargetId = e.dataTransfer.getData("move-target");
                                    if (moveTargetId) {
                                      updatePlacement(moveTargetId, { q2: row });
                                      setDragging(false);
                                      return;
                                    }
                                    const g = e.dataTransfer.getData("gate");
                                    if (g) place(g, row, col);
                                    setDragging(false);
                                  }}
                                  onClick={() => { if (activeGate) place(activeGate, row, col); }}
                                  className={cx(
                                    "group/cell relative flex h-13 items-center justify-center rounded transition-colors",
                                    (activeGate || dragging) && "cursor-pointer hover:bg-accent-primary/10",
                                    dragging && !here && !target && "ring-1 ring-inset ring-accent-primary/30"
                                  )}
                                >
                                  {/* Subtle moment column guide tick */}
                                  <span className="absolute inset-y-2 left-0 w-px bg-line/25 pointer-events-none" />

                                  {/* Vertical entanglement conduit line for two-qubit gates */}
                                  {here && TWO.has(here.g) && here.q2 !== undefined && (
                                    <span
                                      className="absolute left-1/2 -z-0 w-[2.5px] -translate-x-1/2 shadow-xs pointer-events-none"
                                      style={{
                                        height: `${Math.abs(here.q2 - here.q) * 52}px`,
                                        top: here.q2 > here.q ? "50%" : `calc(50% - ${(here.q - here.q2) * 52}px)`,
                                        background: gateColors[here.g]
                                      }}
                                    />
                                  )}
                                  {here && renderGate(
                                    here,
                                    () => setSelected(here.id),
                                    selected === here.id,
                                    (e) => {
                                      e.stopPropagation();
                                      e.dataTransfer.setData("move-block", here.id);
                                      setDragging(true);
                                    },
                                    () => setDragging(false),
                                    (rect) => {
                                      if (!dragging) {
                                        setHoveredGate({ placement: here, rect });
                                      }
                                    },
                                    () => setHoveredGate(null)
                                  )}
                                  {target && (
                                    <span
                                      tabIndex={0}
                                      role="button"
                                      aria-label={`Target qubit for ${target.g} gate on wire q[${row}]`}
                                      aria-describedby={`gate-tooltip-${target.id}`}
                                      draggable
                                      onDragStart={(e) => {
                                        setHoveredGate(null);
                                        e.stopPropagation();
                                        e.dataTransfer.setData("move-target", target.id);
                                        setDragging(true);
                                      }}
                                      onDragEnd={() => setDragging(false)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelected(target.id);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          setSelected(target.id);
                                        }
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!dragging) {
                                          setHoveredGate({ placement: target, rect: e.currentTarget.getBoundingClientRect(), isTarget: true });
                                        }
                                      }}
                                      onMouseLeave={() => setHoveredGate(null)}
                                      onFocus={(e) => {
                                        setHoveredGate({ placement: target, rect: e.currentTarget.getBoundingClientRect(), isTarget: true });
                                      }}
                                      onBlur={() => setHoveredGate(null)}
                                      className={cx(
                                        "z-10 grid h-7 w-7 cursor-grab active:cursor-grabbing place-items-center rounded-full border-2 bg-bg-surface font-mono text-[13px] font-bold transition-transform hover:scale-110 select-none focus:outline-none focus:ring-2 focus:ring-accent-primary",
                                        selected === target.id
                                          ? "ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-surface shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                          : "shadow-sm"
                                      )}
                                      style={{ borderColor: gateColors[target.g], color: gateColors[target.g] }}
                                      title={`Target qubit for ${target.g}. Click to adjust, or drag to another wire.`}
                                    >
                                      {target.g === "SWAP" ? "×" : "⊕"}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Precision Measurement Readout Meter */}
                        <Tooltip label={`P(|1⟩) = ${(p1 * 100).toFixed(1)}%`}>
                          <span
                            className="relative grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line/70 select-none shadow-xs cursor-help bg-bg-surface"
                            style={{ background: `conic-gradient(#3b82f6 ${p1 * 360}deg, #232429 0)` }}
                          >
                            <span className="grid h-4.5 w-4.5 place-items-center rounded-md bg-bg-canvas font-mono text-[9px] font-bold text-txt-dim">M</span>
                          </span>
                        </Tooltip>
                      </div>
                    );
                  })}

                  {/* Classical register data bus wire */}
                  <div className="flex items-center gap-3 pt-1.5">
                    <span className="w-8 shrink-0 text-center font-mono text-[10px] font-bold text-txt-faint/70 select-none">
                      c[{qubits}]
                    </span>
                    <div className="h-[2px] flex-1 bg-[repeating-linear-gradient(90deg,#64748b_0_6px,transparent_6px_12px)] opacity-60" />
                  </div>
                </div>

                {/* Interactive Gate Inspector & Manual Block Adjuster Panel */}
                {selPlacement && (
                  <div className="mt-4 rounded-2xl border border-line/70 bg-bg-surface/95 p-4 text-[13px] shadow-xl animate-rise backdrop-blur-md">
                    {/* Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/40">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-10 w-10 place-items-center rounded-xl font-mono text-[14px] font-bold text-bg-surface shadow-sm select-none border-t border-white/35 border-b-2 border-black/35"
                          style={{ background: gateColors[selPlacement.g] || "#3b82f6" }}
                        >
                          {selPlacement.g}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-display text-[15px]">
                              {gateLabel[selPlacement.g] || selPlacement.g}
                            </span>
                            <span className="rounded-md bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 text-[10px] font-mono text-accent-blue font-semibold">
                              Block {selPlacement.id}
                            </span>
                            {TWO.has(selPlacement.g) && (
                              <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-mono text-purple-400 font-semibold">
                                2-Qubit Entangler
                              </span>
                            )}
                            {ROT.has(selPlacement.g) && (
                              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold">
                                Parametric Rotation
                              </span>
                            )}
                          </div>
                          <div className="text-txt-dim font-mono text-[11px] mt-0.5">
                            Position: Control Wire <strong className="text-white">q[{selPlacement.q}]</strong>
                            {selPlacement.q2 !== undefined && (
                              <> → Target Wire <strong className="text-white">q[{selPlacement.q2}]</strong></>
                            )}
                            {" "}· Moment Step <strong className="text-white">{selPlacement.col + 1}</strong> of {COLS}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => duplicate(selPlacement.id)}
                          className="cursor-pointer text-[12px] h-8"
                          title="Duplicate this block to the next available column"
                        >
                          ⧉ Duplicate
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => remove(selPlacement.id)}
                          className="cursor-pointer text-[12px] h-8"
                          title="Delete block (or press Del/Backspace)"
                        >
                          🗑 Delete
                        </Button>
                        <button
                          type="button"
                          onClick={() => setSelected(null)}
                          className="h-8 w-8 rounded-lg border border-line/60 bg-bg-panel hover:bg-line/40 text-txt-dim hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                          title="Close Adjuster (Escape)"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Manual Adjustments Controls Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3.5">
                      {/* 1. Gate Type Switcher */}
                      <div className="rounded-xl border border-line/40 bg-bg-app/60 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-txt-faint">
                            Gate Identity
                          </span>
                          <span className="text-[10px] text-txt-dim font-mono">
                            Morph block
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {["H", "X", "Y", "Z", "S", "T", "RX", "RY", "RZ", "CNOT", "CZ", "SWAP", "M"].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => updatePlacement(selPlacement.id, { g })}
                              className={cx(
                                "h-7 min-w-[28px] px-1.5 rounded font-mono text-[11px] font-bold transition-all cursor-pointer border select-none",
                                selPlacement.g === g
                                  ? "ring-1 ring-accent-primary text-white shadow-sm scale-105"
                                  : "border-line/50 bg-bg-surface hover:bg-bg-panel text-txt-dim hover:text-white"
                              )}
                              style={{
                                borderColor: selPlacement.g === g ? gateColors[g] : undefined,
                                background: selPlacement.g === g ? gateColors[g] : undefined,
                                color: selPlacement.g === g ? "#000" : undefined,
                              }}
                              title={gateLabel[g] || g}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Wire & Connection Controls */}
                      <div className="rounded-xl border border-line/40 bg-bg-app/60 p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-txt-faint">
                            Wire Connection
                          </span>
                          {TWO.has(selPlacement.g) && (
                            <button
                              type="button"
                              onClick={() => flipBlockQubits(selPlacement.id)}
                              className="text-[11px] font-mono text-quantum-cyan hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                              title="Invert control and target wires"
                            >
                              <span>⇄ Flip Wires</span>
                            </button>
                          )}
                        </div>

                        {/* Control wire selector */}
                        <div className="flex items-center justify-between gap-2 text-[12px]">
                          <span className="text-txt-dim font-medium">Control Wire (q):</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={selPlacement.q <= 0}
                              onClick={() => updatePlacement(selPlacement.id, { q: selPlacement.q - 1 })}
                              className="h-6 w-6 rounded border border-line/60 bg-bg-surface hover:bg-bg-panel disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              −
                            </button>
                            <select
                              value={selPlacement.q}
                              onChange={(e) => updatePlacement(selPlacement.id, { q: +e.target.value })}
                              className="h-6 px-1.5 rounded bg-bg-surface border border-line/60 text-white font-mono text-[11px] font-bold cursor-pointer outline-none"
                            >
                              {Array.from({ length: qubits }).map((_, i) => (
                                <option key={i} value={i}>
                                  q[{i}]
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={selPlacement.q >= qubits - 1}
                              onClick={() => updatePlacement(selPlacement.id, { q: selPlacement.q + 1 })}
                              className="h-6 w-6 rounded border border-line/60 bg-bg-surface hover:bg-bg-panel disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Target wire selector for two-qubit gates */}
                        {TWO.has(selPlacement.g) && selPlacement.q2 !== undefined && (
                          <div className="flex items-center justify-between gap-2 text-[12px] pt-1 border-t border-line/30">
                            <span className="text-txt-dim font-medium">Target Wire (q2):</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={selPlacement.q2 <= 0}
                                onClick={() => {
                                  const nextQ2 = selPlacement.q2! - 1 === selPlacement.q ? selPlacement.q2! - 2 : selPlacement.q2! - 1;
                                  if (nextQ2 >= 0) updatePlacement(selPlacement.id, { q2: nextQ2 });
                                }}
                                className="h-6 w-6 rounded border border-line/60 bg-bg-surface hover:bg-bg-panel disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                −
                              </button>
                              <select
                                value={selPlacement.q2}
                                onChange={(e) => updatePlacement(selPlacement.id, { q2: +e.target.value })}
                                className="h-6 px-1.5 rounded bg-bg-surface border border-line/60 text-white font-mono text-[11px] font-bold cursor-pointer outline-none"
                              >
                                {Array.from({ length: qubits }).map((_, i) => (
                                  <option key={i} value={i} disabled={i === selPlacement.q}>
                                    q[{i}] {i === selPlacement.q ? "(Control)" : ""}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                disabled={selPlacement.q2 >= qubits - 1}
                                onClick={() => {
                                  const nextQ2 = selPlacement.q2! + 1 === selPlacement.q ? selPlacement.q2! + 2 : selPlacement.q2! + 1;
                                  if (nextQ2 < qubits) updatePlacement(selPlacement.id, { q2: nextQ2 });
                                }}
                                className="h-6 w-6 rounded border border-line/60 bg-bg-surface hover:bg-bg-panel disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Step Position & Directional Nudge D-Pad */}
                      <div className="rounded-xl border border-line/40 bg-bg-app/60 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-txt-faint">
                            Timeline & Nudge
                          </span>
                          <span className="text-[10px] text-txt-dim font-mono">
                            Step {selPlacement.col + 1}/{COLS}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          {/* Step selector */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={selPlacement.col <= 0}
                              onClick={() => moveBlockBy(selPlacement.id, 0, -1)}
                              className="h-7 px-2 rounded border border-line/60 bg-bg-surface hover:bg-bg-panel disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-xs cursor-pointer"
                              title="Move step earlier (Left arrow)"
                            >
                              ← Earlier
                            </button>
                            <button
                              type="button"
                              disabled={selPlacement.col >= COLS - 1}
                              onClick={() => moveBlockBy(selPlacement.id, 0, 1)}
                              className="h-7 px-2 rounded border border-line/60 bg-bg-surface hover:bg-bg-panel disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-xs cursor-pointer"
                              title="Move step later (Right arrow)"
                            >
                              Later →
                            </button>
                          </div>

                          {/* Compact 4-way Nudge D-Pad */}
                          <div className="grid grid-cols-3 gap-0.5 w-20">
                            <span />
                            <button
                              type="button"
                              disabled={selPlacement.q <= 0}
                              onClick={() => moveBlockBy(selPlacement.id, -1, 0)}
                              className="h-6 w-6 rounded border border-line/60 bg-bg-surface hover:bg-accent-primary/20 hover:border-accent-primary disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-[11px] cursor-pointer"
                              title="Nudge Up (Up arrow)"
                            >
                              ▲
                            </button>
                            <span />
                            <button
                              type="button"
                              disabled={selPlacement.col <= 0}
                              onClick={() => moveBlockBy(selPlacement.id, 0, -1)}
                              className="h-6 w-6 rounded border border-line/60 bg-bg-surface hover:bg-accent-primary/20 hover:border-accent-primary disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-[11px] cursor-pointer"
                              title="Nudge Left (Left arrow)"
                            >
                              ◀
                            </button>
                            <div className="h-6 w-6 grid place-items-center text-[8px] font-mono text-txt-faint select-none">
                              ✥
                            </div>
                            <button
                              type="button"
                              disabled={selPlacement.col >= COLS - 1}
                              onClick={() => moveBlockBy(selPlacement.id, 0, 1)}
                              className="h-6 w-6 rounded border border-line/60 bg-bg-surface hover:bg-accent-primary/20 hover:border-accent-primary disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-[11px] cursor-pointer"
                              title="Nudge Right (Right arrow)"
                            >
                              ▶
                            </button>
                            <span />
                            <button
                              type="button"
                              disabled={selPlacement.q >= qubits - 1}
                              onClick={() => moveBlockBy(selPlacement.id, 1, 0)}
                              className="h-6 w-6 rounded border border-line/60 bg-bg-surface hover:bg-accent-primary/20 hover:border-accent-primary disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-[11px] cursor-pointer"
                              title="Nudge Down (Down arrow)"
                            >
                              ▼
                            </button>
                            <span />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Rotation Angle Parameter Slider & Presets (when applicable) */}
                    {ROT.has(selPlacement.g) && (
                      <div className="mt-3.5 rounded-xl border border-line/40 bg-bg-app/60 p-3.5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-txt-faint">
                              Rotation Angle θ
                            </span>
                            <span className="rounded bg-bg-surface border border-line/60 px-2 py-0.5 font-mono text-[11px] font-bold text-quantum-cyan">
                              {(selPlacement.theta ?? Math.PI / 2).toFixed(3)} rad
                            </span>
                            <span className="rounded bg-bg-surface border border-line/60 px-2 py-0.5 font-mono text-[11px] font-bold text-txt-dim">
                              {Math.round(((selPlacement.theta ?? Math.PI / 2) * 180) / Math.PI)}°
                            </span>
                          </div>

                          {/* Quick Angle Presets */}
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <span className="text-txt-faint mr-1">Presets:</span>
                            {[
                              { label: "0", rad: 0 },
                              { label: "π/4 (45°)", rad: Math.PI / 4 },
                              { label: "π/2 (90°)", rad: Math.PI / 2 },
                              { label: "π (180°)", rad: Math.PI },
                              { label: "3π/2 (270°)", rad: (3 * Math.PI) / 2 },
                              { label: "2π (360°)", rad: 2 * Math.PI },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => updatePlacement(selPlacement.id, { theta: preset.rad })}
                                className={cx(
                                  "px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors cursor-pointer",
                                  Math.abs((selPlacement.theta ?? 0) - preset.rad) < 0.02
                                    ? "bg-quantum-cyan/20 border-quantum-cyan text-quantum-cyan"
                                    : "bg-bg-surface border-line/50 text-txt-dim hover:text-white"
                                )}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={0}
                            max={Math.PI * 2}
                            step={0.01}
                            value={selPlacement.theta ?? Math.PI / 2}
                            onChange={(e) => updatePlacement(selPlacement.id, { theta: +e.target.value })}
                            className="flex-1 accent-accent-primary cursor-pointer h-2"
                          />
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="text-txt-faint">Exact rad:</span>
                            <input
                              type="number"
                              min={0}
                              max={6.283}
                              step={0.05}
                              value={Number((selPlacement.theta ?? Math.PI / 2).toFixed(2))}
                              onChange={(e) => updatePlacement(selPlacement.id, { theta: Math.max(0, Math.min(Math.PI * 2, +e.target.value)) })}
                              className="w-16 h-7 rounded border border-line/60 bg-bg-surface px-1.5 text-right text-white font-mono text-xs outline-none focus:border-accent-primary"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                SIMULATION RESULTS — Precision Telemetry Console
                ═══════════════════════════════════════════════════════════ */}
            <div className="shrink-0 border-t border-line/50 bg-bg-app/90 select-none">
              {/* Results Console Header with Segmented Tabs & Telemetry Strip */}
              <div className="flex items-center justify-between px-6 py-2 border-b border-line/30">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-txt-faint mr-2">
                    Telemetry
                  </span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-bg-surface border border-line/50">
                    {(["prob", "state", "viz"] as const).map((tab) => {
                      const labels = { prob: "Probability", state: "Statevector", viz: "Visualization" };
                      return (
                        <button
                          key={tab}
                          onClick={() => setResultsTab(tab)}
                          className={cx(
                            "px-3 py-1 rounded-md text-[12px] font-bold transition-all cursor-pointer select-none",
                            resultsTab === tab
                              ? "bg-accent-primary text-white shadow-xs"
                              : "text-txt-dim hover:text-white"
                          )}
                        >
                          {labels[tab]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline font-mono text-[10px] text-txt-faint border border-line/40 rounded px-2 py-0.5 bg-bg-surface/50">
                    1024 Shots · {qubits} Qubits · 2^{qubits} Dim
                  </span>
                  {resultsTab === "viz" && (
                    <div className="flex overflow-hidden rounded-md bg-bg-surface border border-line/50">
                      {(["qsphere", "bloch"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setSphereMode(m)}
                          className={cx(
                            "px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer",
                            sphereMode === m ? "bg-bg-panel text-white" : "text-txt-faint hover:text-txt"
                          )}
                        >
                          {m === "qsphere" ? "Q-Sphere" : "Bloch"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Results content */}
              <div className="h-[200px] px-6 py-3">
                <div className="h-full rounded-xl bg-bg-surface/50 border border-line/40 overflow-hidden">
                  {resultsTab === "prob" && (
                    <div className="h-full p-3">
                      <ProbabilityChart data={results.probs.filter((p) => p.p > 0.05)} />
                    </div>
                  )}
                  {resultsTab === "state" && (
                    <div className="h-full p-3 overflow-auto">
                      <Statevector amps={results.amps} />
                    </div>
                  )}
                  {resultsTab === "viz" && (
                    <div className="flex h-full items-center justify-center p-3">
                      <div className="min-w-0 flex-1 h-full">
                        {sphereMode === "qsphere"
                          ? <QSphere states={results.amps.filter((a) => a.p > 0.001).map((a) => ({ label: a.state, amp: Math.sqrt(a.p), phase: a.phase }))} />
                          : <BlochSphere theta={1.05} phi={0.6} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
          
        {/* ═══════════════════════════════════════════════════════════
            LEARNING COMPANION, CHALLENGES & TUTOR DOCK
            ═══════════════════════════════════════════════════════════ */}
        {copilotOpen && (
          <aside className={cx(
              "shrink-0 flex-col flex overflow-hidden border-l border-line/40 bg-bg-surface animate-rise transition-all duration-200",
              rightTab === "challenges" ? "w-[380px] xl:w-[420px]" : "w-[340px] xl:w-[380px]"
            )}>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-line/40 bg-bg-panel/20">
                <div className="flex items-center gap-1">
                  {activities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setRightTab("challenges")}
                      className={cx(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer select-none",
                        rightTab === "challenges"
                          ? "bg-bg-surface text-white shadow-xs border border-line/50"
                          : "text-txt-dim hover:text-white"
                      )}
                    >
                      <span>🧠 Challenges</span>
                      <span className={cx(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                        completedActCount === activities.length ? "bg-ok/20 text-ok" : "bg-bg-panel text-txt-dim"
                      )}>
                        {completedActCount}/{activities.length}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRightTab("ai")}
                    className={cx(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer select-none",
                      rightTab === "ai"
                        ? "bg-bg-surface text-white shadow-xs border border-line/50"
                        : "text-txt-dim hover:text-white"
                    )}
                  >
                    <span>✦ Tutor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightTab("code")}
                    className={cx(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer select-none",
                      rightTab === "code"
                        ? "bg-bg-surface text-white shadow-xs border border-line/50"
                        : "text-txt-dim hover:text-white"
                    )}
                  >
                    <span>‹/› Code</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setCopilotOpen(false)}
                  className="text-txt-faint hover:text-white text-[13px] p-1.5 rounded-lg hover:bg-bg-panel transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  ✕
                </button>
              </div>

              {rightTab === "challenges" && activities.length > 0 ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  {/* Challenges Context Header */}
                  <div className="px-4 py-3 border-b border-line/40 bg-bg-panel/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent-primary/20 border border-accent-primary/40 text-accent-primary font-bold text-sm shadow-xs">
                        🧠
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-white font-display">Interactive Challenges</div>
                        <div className="text-[10px] font-mono text-txt-faint">
                          Level {currentLevel.n} • {currentLevel.algorithm}
                        </div>
                      </div>
                    </div>
                    <span className={cx(
                      "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
                      completedActCount === activities.length
                        ? "bg-ok/10 border border-ok/30 text-ok"
                        : "bg-bg-panel border border-line/50 text-txt-dim"
                    )}>
                      {completedActCount === activities.length && <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />}
                      {completedActCount} / {activities.length} Solved
                    </span>
                  </div>

                  {/* Challenges Cards List */}
                  <div className="flex-1 space-y-3.5 overflow-y-auto p-3.5 select-none">
                    {activities.map((act) => (
                      <MissionActivityCard
                        key={act.id}
                        activity={act}
                        levelSlug={currentLevel.slug}
                        compact={true}
                        onRunWhatIf={(query) => {
                          setRightTab("ai");
                          callTutor(tutorApi.whatIf, query);
                        }}
                        onCompletedChange={(id, done) => {
                          setCompletedActivities((prev) => ({ ...prev, [id]: done }));
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : rightTab === "code" ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-auto bg-bg-inset">
                    <div className="flex font-mono text-[12px] leading-relaxed">
                      <div aria-hidden className="select-none border-r border-line/40 bg-bg-surface px-3 py-4 text-right text-txt-faint">
                        {code.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                      </div>
                      <pre className="flex-1 overflow-auto px-4 py-4 text-txt-dim"><code dangerouslySetInnerHTML={{ __html: highlightPython(code) }} /></pre>
                    </div>
                  </div>
                  <div className="p-3 border-t border-line/40 space-y-2">
                    <Button
                      size="sm"
                      className="w-full bg-accent-primary text-white font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      onClick={() => {
                        setMode("ide");
                        setIdeCode(code);
                      }}
                    >
                      <span>💻</span>
                      <span>Open in Quantum IDE</span>
                      <span>↗</span>
                    </Button>
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => navigator.clipboard?.writeText(code)}>Copy Code</Button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  {/* Tutor context header — Modern Socratic AI Copilot Header */}
                  <div className="px-4 py-3 border-b border-line/40 bg-bg-panel/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent-primary/20 border border-accent-primary/40 text-accent-primary font-bold text-sm shadow-xs">
                        ✦
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-white font-display">Quantum Copilot</div>
                        <div className="text-[10px] font-mono text-txt-faint">
                          Level {currentLevel.n} • {currentLevel.algorithm} • AI Guide
                        </div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-ok/10 border border-ok/30 px-2 py-0.5 text-[9px] font-mono font-bold text-ok">
                      <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />
                      Online
                    </span>
                  </div>

                  {/* Quick action chips — Tactile ed-tech style */}
                  <div className="flex gap-1.5 px-3 py-2 border-b border-line/40 flex-wrap bg-bg-surface/30">
                    <button onClick={giveHint} disabled={tutorLoading} className="rounded-lg border border-line/50 bg-bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-ok hover:bg-bg-panel hover:border-line-strong transition-all disabled:opacity-40 cursor-pointer shadow-2xs">💡 Hint</button>
                    <button onClick={explainCircuit} disabled={tutorLoading} className="rounded-lg border border-line/50 bg-bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-accent-blue hover:bg-bg-panel hover:border-line-strong transition-all disabled:opacity-40 cursor-pointer shadow-2xs">📖 Explain</button>
                    <button onClick={debugCircuit} disabled={tutorLoading} className="rounded-lg border border-line/50 bg-bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-warn hover:bg-bg-panel hover:border-line-strong transition-all disabled:opacity-40 cursor-pointer shadow-2xs">🔍 Debug</button>
                    <button onClick={verifyCircuit} disabled={tutorLoading} className="rounded-lg border border-line/50 bg-bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-accent-primary hover:bg-bg-panel hover:border-line-strong transition-all disabled:opacity-40 cursor-pointer shadow-2xs">✓ Verify</button>
                    <button onClick={suggestNext} disabled={tutorLoading} className="rounded-lg border border-line/50 bg-bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-txt-dim hover:bg-bg-panel hover:border-line-strong transition-all disabled:opacity-40 cursor-pointer shadow-2xs">⚡ Next</button>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-1 space-y-3 overflow-auto px-4 py-4">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={cx(
                          "rounded-xl px-4 py-3 text-[13px] leading-relaxed w-fit max-w-[92%] animate-rise",
                          m.role === "ai"
                            ? "bg-bg-panel/60 text-txt rounded-tl-sm"
                            : "ml-auto bg-accent-primary text-white rounded-tr-sm"
                        )}
                      >
                        {m.role === "ai" ? (
                          <div className="space-y-3">
                            <MathMarkdown content={m.text} />
                            {m.mission_progress && (
                              <MissionProgressCard
                                progress={m.mission_progress}
                                studentState={m.student_state}
                              />
                            )}
                            {(m.celebration || m.student_state === "COMPLETED") && (
                              <CelebrationBanner
                                celebration={m.celebration}
                                suggestedExperiment={m.suggested_experiment}
                                nextLevel={nextLevel}
                                onExperimentClick={(exp) => ask(exp)}
                              />
                            )}
                            {m.what_if && m.what_if.valid && (
                              <WhatIfCard
                                whatIf={m.what_if}
                                applied={m.applied}
                                onApply={() => applyWhatIf(i, m.what_if!)}
                              />
                            )}
                            {m.sources && m.sources.length > 0 && (
                              <div className="mt-2.5 pt-2.5 border-t border-line/40">
                                <div className="text-[11px] font-bold text-accent-cyan flex items-center gap-1.5 mb-1.5">
                                  <span>🏛️</span> Institutional Syllabus Grounding
                                </div>
                                <div className="space-y-1.5">
                                  {m.sources.map((s, sIdx) => (
                                    <div key={sIdx} className="rounded-lg bg-bg-surface/90 border border-line/60 p-2.5 text-[11px] text-txt-dim shadow-2xs">
                                      <div className="font-semibold text-white flex items-center justify-between">
                                        <span>{s.document_title || "University Document"}</span>
                                        {s.page_number && <span className="text-[10px] text-accent-primary font-mono">Page {s.page_number}</span>}
                                      </div>
                                      {s.section_title && <div className="text-[10px] text-accent-blue/90 font-mono mt-0.5">{s.section_title}</div>}
                                      {s.content && <p className="mt-1 line-clamp-2 italic text-txt-faint">"{s.content}"</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap font-500">{m.text}</div>
                        )}
                      </div>
                    ))}
                    {tutorLoading && (
                      <div className="flex items-center gap-2 rounded-xl bg-bg-panel/60 px-4 py-3 w-fit animate-rise">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-accent-primary" />
                        <span className="text-[12px] text-txt-faint">Analyzing your circuit…</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat input */}
                  <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const v = String(f.get("q") || "").trim(); if (v) ask(v); e.currentTarget.reset(); }}
                    className="p-3 border-t border-line/40">
                    <div className="relative">
                      <input name="q" placeholder="Ask about your circuit…" disabled={tutorLoading} className="h-9 w-full rounded-lg border border-line/40 bg-bg-panel pl-4 pr-10 text-[12px] text-white outline-none focus:border-accent-primary transition-all disabled:opacity-50" />
                      <button type="submit" disabled={tutorLoading} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim hover:text-white disabled:opacity-50">↵</button>
                    </div>
                  </form>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* Educational Hover/Focus Gate Tooltip Portal */}
      {hoveredGate && (
        <GateEducationalTooltip
          placement={hoveredGate.placement}
          anchorRect={hoveredGate.rect}
          isTarget={hoveredGate.isTarget}
          onClose={() => setHoveredGate(null)}
        />
      )}
    </div>
  );
}

function renderGate(
  p: Placement,
  onSelect: () => void,
  sel: boolean,
  onDragStart?: (e: React.DragEvent) => void,
  onDragEnd?: () => void,
  onHover?: (rect: DOMRect) => void,
  onLeave?: () => void
) {
  if (p.g === "M") {
    return (
      <span
        tabIndex={0}
        role="button"
        aria-label="Measurement block"
        aria-describedby={`gate-tooltip-${p.id}`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        draggable
        onDragStart={(e) => {
          onLeave?.();
          onDragStart?.(e);
        }}
        onDragEnd={onDragEnd}
        onMouseEnter={(e) => onHover?.(e.currentTarget.getBoundingClientRect())}
        onMouseLeave={onLeave}
        onFocus={(e) => onHover?.(e.currentTarget.getBoundingClientRect())}
        onBlur={onLeave}
        title="Measurement block. Click to inspect & adjust, or drag to move."
        className={cx(
          "z-10 grid h-8.5 w-8.5 cursor-grab active:cursor-grabbing place-items-center rounded-lg border font-mono font-bold text-[11px] transition-all shadow-xs select-none focus:outline-none focus:ring-2 focus:ring-accent-primary",
          sel
            ? "bg-bg-panel ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-surface border-accent-primary text-white shadow-md scale-105"
            : "bg-bg-surface border-line-strong text-txt-dim hover:text-white hover:border-line-strong"
        )}
      >
        M
      </span>
    );
  }
  if (p.g === "B") {
    return (
      <span
        tabIndex={0}
        role="button"
        aria-label="Barrier block"
        aria-describedby={`gate-tooltip-${p.id}`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        draggable
        onDragStart={(e) => {
          onLeave?.();
          onDragStart?.(e);
        }}
        onDragEnd={onDragEnd}
        onMouseEnter={(e) => onHover?.(e.currentTarget.getBoundingClientRect())}
        onMouseLeave={onLeave}
        onFocus={(e) => onHover?.(e.currentTarget.getBoundingClientRect())}
        onBlur={onLeave}
        title="Barrier block. Click to inspect & adjust, or drag to move."
        className={cx(
          "z-10 flex flex-col items-center justify-center h-12 w-4 cursor-grab active:cursor-grabbing select-none transition-all focus:outline-none focus:ring-1 focus:ring-accent-primary",
          sel ? "scale-110" : ""
        )}
      >
        <span
          className={cx(
            "h-full w-[2px] border-r-2 border-dashed transition-colors",
            sel ? "border-accent-primary ring-2 ring-accent-primary/40" : "border-txt-faint/80 hover:border-txt"
          )}
        />
      </span>
    );
  }
  return (
    <span
      tabIndex={0}
      role="button"
      aria-label={`${gateLabel[p.g] || p.g} gate on wire q[${p.q}]`}
      aria-describedby={`gate-tooltip-${p.id}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      draggable
      onDragStart={(e) => {
        onLeave?.();
        onDragStart?.(e);
      }}
      onDragEnd={onDragEnd}
      onMouseEnter={(e) => onHover?.(e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      onFocus={(e) => onHover?.(e.currentTarget.getBoundingClientRect())}
      onBlur={onLeave}
      title={`${gateLabel[p.g] || p.g} on q[${p.q}]. Click to inspect & adjust, or drag to move.`}
      className={cx(
        "z-10 flex flex-col items-center justify-center h-9.5 min-w-9.5 px-1.5 cursor-grab active:cursor-grabbing rounded-xl font-mono font-bold text-bg-surface shadow-md transition-all hover:scale-105 select-none focus:outline-none focus:ring-2 focus:ring-accent-primary",
        "border-t border-white/35 border-b-2 border-black/35",
        sel
          ? "ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-surface shadow-[0_0_14px_rgba(59,130,246,0.5)] scale-105"
          : "hover:shadow-lg"
      )}
      style={{ background: gateColors[p.g] || "#3b82f6" }}
    >
      <span className={cx(p.g === "CNOT" || p.g === "CZ" ? "text-[16px] leading-none" : "text-[13px] leading-none")}>
        {p.g === "CNOT" || p.g === "CZ" ? "●" : p.g}
      </span>
      {ROT.has(p.g) && p.theta !== undefined && (
        <span className="text-[8.5px] font-mono font-bold opacity-90 leading-none mt-0.5 tracking-tighter">
          {Math.abs(p.theta - Math.PI) < 0.05
            ? "π"
            : Math.abs(p.theta - Math.PI / 2) < 0.05
            ? "π/2"
            : Math.abs(p.theta - Math.PI / 4) < 0.05
            ? "π/4"
            : Math.abs(p.theta - (3 * Math.PI) / 2) < 0.05
            ? "3π/2"
            : Math.abs(p.theta - 2 * Math.PI) < 0.05
            ? "2π"
            : `${(p.theta / Math.PI).toFixed(2)}π`}
        </span>
      )}
    </span>
  );
}

function genCode(sdk: string, qubits: number, placements: Placement[]) {
  const ops = [...placements].sort((a, b) => a.col - b.col);
  if (sdk === "PennyLane") {
    const body = ops.map((p) => plGate(p)).filter(Boolean).join("\n    ");
    return `import pennylane as qml\n\ndev = qml.device("default.qubit", wires=${qubits})\n\n@qml.qnode(dev)\ndef circuit():\n    ${body || "pass"}\n    return qml.probs(wires=range(${qubits}))`;
  }
  if (sdk === "Cirq") {
    const body = ops.map((p) => cirqGate(p)).filter(Boolean).join(",\n    ");
    return `import cirq\n\nq = cirq.LineQubit.range(${qubits})\ncircuit = cirq.Circuit([\n    ${body || "# empty"}\n])\n\nsim = cirq.Simulator()\nresult = sim.simulate(circuit)`;
  }
  const body = ops.map((p) => qiskitGate(p)).filter(Boolean).join("\n");
  return `from qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\n\nqc = QuantumCircuit(${qubits}, ${qubits})\n\n${body || "# add gates"}\n\nsim = AerSimulator()\nresult = sim.run(qc, shots=1024).result()`;
}

const th = (p: Placement) => (p.theta ?? Math.PI / 2).toFixed(2);
function qiskitGate(p: Placement) {
  switch (p.g) {
    case "CNOT": return `qc.cx(${p.q}, ${p.q2})`;
    case "CZ": return `qc.cz(${p.q}, ${p.q2})`;
    case "SWAP": return `qc.swap(${p.q}, ${p.q2})`;
    case "RX": case "RY": case "RZ": return `qc.${p.g.toLowerCase()}(${th(p)}, ${p.q})`;
    case "M": return `qc.measure(${p.q}, ${p.q})`;
    case "B": return `qc.barrier()`;
    default: return `qc.${p.g.toLowerCase()}(${p.q})`;
  }
}
function plGate(p: Placement) {
  const map: Record<string, string> = { H: "Hadamard", X: "PauliX", Y: "PauliY", Z: "PauliZ", S: "S", T: "T" };
  switch (p.g) {
    case "CNOT": return `qml.CNOT(wires=[${p.q}, ${p.q2}])`;
    case "CZ": return `qml.CZ(wires=[${p.q}, ${p.q2}])`;
    case "SWAP": return `qml.SWAP(wires=[${p.q}, ${p.q2}])`;
    case "RX": case "RY": case "RZ": return `qml.${p.g}(${th(p)}, wires=${p.q})`;
    case "M": case "B": return "";
    default: return `qml.${map[p.g] ?? p.g}(wires=${p.q})`;
  }
}
function cirqGate(p: Placement) {
  switch (p.g) {
    case "CNOT": return `cirq.CNOT(q[${p.q}], q[${p.q2}])`;
    case "CZ": return `cirq.CZ(q[${p.q}], q[${p.q2}])`;
    case "SWAP": return `cirq.SWAP(q[${p.q}], q[${p.q2}])`;
    case "RX": case "RY": case "RZ": return `cirq.r${p.g[1].toLowerCase()}(${th(p)}).on(q[${p.q}])`;
    case "M": return `cirq.measure(q[${p.q}])`;
    case "B": return "";
    default: return `cirq.${p.g}(q[${p.q}])`;
  }
}



function WhatIfCard({
  whatIf,
  applied,
  onApply,
}: {
  whatIf: WhatIfResult;
  applied?: boolean;
  onApply: () => void;
}) {
  const [showDiff, setShowDiff] = useState(false);
  const comp = whatIf.comparison;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-accent-primary/25 bg-bg-surface/90 p-3.5 shadow-sm text-txt backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2.5">
        <div className="flex items-center gap-1.5 text-[12px] font-700 text-accent-primary tracking-wide">
          <span>🔬 WHAT-IF EXPERIMENT</span>
        </div>
        <span className="rounded-md bg-accent-primary/10 px-2 py-0.5 text-[10px] font-600 text-accent-primary border border-accent-primary/20">
          {(whatIf.operation || "HYPOTHETICAL").toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <div className="mt-2 text-[12px] font-600 text-white">
        {whatIf.description}
      </div>

      {/* Metrics Comparison Grid */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg border border-line bg-bg-panel/60 p-2">
          <div className="text-[10px] uppercase font-600 text-txt-dim">Original Circuit</div>
          <div className="mt-0.5 font-700 text-txt">
            {comp.gate_count.original} gate{comp.gate_count.original !== 1 ? "s" : ""} • depth {comp.depth.original}
          </div>
        </div>
        <div className="rounded-lg border border-accent-primary/30 bg-accent-primary/5 p-2">
          <div className="text-[10px] uppercase font-600 text-accent-primary">Modified (What-If)</div>
          <div className="mt-0.5 font-700 text-white">
            {comp.gate_count.modified} gate{comp.gate_count.modified !== 1 ? "s" : ""} • depth {comp.depth.modified}
          </div>
        </div>
      </div>

      {/* Entanglement Status */}
      {comp.entanglement?.summary && (
        <div className="mt-2 rounded-lg bg-bg-panel/40 px-2.5 py-1.5 text-[11px] text-txt-dim flex items-center justify-between">
          <span>Entanglement:</span>
          <span className="font-600 text-white">{comp.entanglement.summary}</span>
        </div>
      )}

      {/* Mission Impact */}
      {comp.mission_impact && (
        <div className="mt-2 rounded-lg border border-warn/30 bg-warn/10 p-2 text-[11px]">
          <div className="text-[10px] font-700 uppercase text-warn tracking-wider flex items-center gap-1 mb-0.5">
            <span>🎯 Mission Impact</span>
          </div>
          <div className="text-white font-500 leading-snug">{comp.mission_impact}</div>
        </div>
      )}

      {/* Probability Comparison */}
      {comp.probabilities && comp.probabilities.length > 0 && (
        <div className="mt-2.5 rounded-lg border border-line/60 bg-bg-panel/40 p-2">
          <div className="text-[10px] uppercase font-600 text-txt-dim mb-1.5 flex justify-between">
            <span>Basis State (UI Wire Order)</span>
            <span>Probability Shift</span>
          </div>
          <div className="space-y-1">
            {comp.probabilities.slice(0, 4).map((p) => {
              const changed = p.original !== p.modified;
              return (
                <div key={p.state} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-txt">|{p.state}⟩</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-txt-dim">{p.original.toFixed(1)}%</span>
                    <span className="text-txt-faint">→</span>
                    <span className={cx("font-700", changed ? (p.delta > 0 ? "text-ok" : "text-warn") : "text-txt")}>
                      {p.modified.toFixed(1)}%
                    </span>
                    {changed && (
                      <span className={cx("text-[10px]", p.delta > 0 ? "text-ok" : "text-warn")}>
                        ({p.delta > 0 ? `+${p.delta.toFixed(1)}` : p.delta.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Textual Circuit Diff Collapsible */}
      {comp.ascii_diff && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowDiff(!showDiff)}
            className="text-[10px] text-accent-blue hover:underline flex items-center gap-1 font-500"
          >
            {showDiff ? "▼ Hide Circuit Wire Diff" : "▶ Show Circuit Wire Diff"}
          </button>
          {showDiff && (
            <div className="mt-1.5 rounded-lg border border-line bg-black/40 p-2 font-mono text-[10px] text-txt-dim overflow-x-auto space-y-1.5">
              <div className="text-txt-faint uppercase font-700">Original:</div>
              <pre className="whitespace-pre">{comp.ascii_diff.original}</pre>
              <div className="text-accent-primary uppercase font-700 mt-2">What-If:</div>
              <pre className="whitespace-pre">{comp.ascii_diff.modified}</pre>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between">
        <span className="text-[11px] text-txt-dim">
          {applied ? "Modification applied" : "Safe preview — circuit unchanged"}
        </span>
        {applied ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-ok/10 border border-ok/30 px-2.5 py-1 text-[11px] font-600 text-ok">
            ✓ Applied to Circuit
          </span>
        ) : (
          <button
            type="button"
            onClick={onApply}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent-primary hover:bg-accent-primary/90 px-3 py-1.5 text-[11px] font-700 text-white shadow transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            ⚡ Apply this change
          </button>
        )}
      </div>
    </div>
  );
}

function MissionProgressCard({ progress, studentState }: { progress: MissionProgress; studentState?: string }) {
  const isComplete = progress.percentage === 100 || studentState === "COMPLETED";
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-line bg-bg-surface/90 p-3.5 shadow-sm text-txt backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-700 tracking-wide text-white">
          <span>🎯 MISSION PROGRESS</span>
        </div>
        <span
          className={cx(
            "rounded-md px-2 py-0.5 text-[10px] font-700 border",
            isComplete
              ? "bg-ok/15 text-ok border-ok/30"
              : "bg-accent-primary/10 text-accent-primary border-accent-primary/25"
          )}
        >
          {progress.met_count} / {progress.total_count} MET ({progress.percentage.toFixed(0)}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-panel">
        <div
          className={cx(
            "h-full transition-all duration-500 rounded-full",
            isComplete ? "bg-ok" : "bg-accent-primary"
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
        />
      </div>

      {/* Criteria checklist */}
      <div className="mt-3 space-y-1.5">
        {progress.criteria.map((c, idx) => {
          const met = c.status === "MET";
          return (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-lg border border-line/40 bg-bg-panel/40 p-2 text-[11px]"
            >
              <span className="shrink-0 text-[12px] mt-0.5">{met ? "✅" : "❌"}</span>
              <div className="min-w-0 flex-1">
                <div className={cx("font-600", met ? "text-white" : "text-txt-dim")}>
                  {c.criterion}
                </div>
                {c.reason && (
                  <div className="text-[10px] text-txt-faint mt-0.5 leading-snug">{c.reason}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CelebrationBanner({
  celebration,
  suggestedExperiment,
  nextLevel,
  onExperimentClick,
}: {
  celebration?: CelebrationInfo;
  suggestedExperiment?: string;
  nextLevel?: Level;
  onExperimentClick: (exp: string) => void;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-ok/50 bg-gradient-to-br from-ok/15 via-bg-surface/95 to-accent-primary/15 p-4 shadow-lg text-txt backdrop-blur-md animate-rise">
      <div className="flex items-center justify-between gap-2 border-b border-ok/30 pb-2.5">
        <div className="flex items-center gap-2 text-[14px] font-700 text-ok font-display tracking-tight">
          <span className="text-base">🎉</span> MISSION COMPLETE!
        </div>
        <span className="rounded-full bg-ok/25 px-3 py-0.5 text-[12px] font-bold text-ok border border-ok/40 shadow-sm font-mono">
          +{celebration?.xp || 500} XP
        </span>
      </div>

      <div className="mt-2.5 text-[13px] font-medium text-white/95 leading-relaxed">
        {celebration?.message || "All success criteria have been satisfied! You have demonstrated quantum mastery for this algorithm."}
      </div>

      {suggestedExperiment && (
        <div className="mt-3 rounded-lg border border-accent-primary/30 bg-accent-primary/10 p-2.5">
          <div className="text-[10px] font-700 uppercase text-accent-primary tracking-wider mb-1 flex items-center gap-1">
            <span>🔬</span> Suggested What-If Experiment
          </div>
          <button
            type="button"
            onClick={() => onExperimentClick(suggestedExperiment)}
            className="w-full text-left text-[11px] font-mono text-white hover:text-quantum-cyan transition-colors flex items-center justify-between gap-2"
          >
            <span className="italic">"{suggestedExperiment}"</span>
            <span className="text-[11px] shrink-0 text-quantum-cyan font-bold">Simulate →</span>
          </button>
        </div>
      )}

      {/* Next Mission Progression Action */}
      <div className="mt-3.5 flex flex-wrap gap-2 pt-2 border-t border-line/50">
        {nextLevel ? (
          <Link
            to={`/workspace?level=${nextLevel.slug}`}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-ok hover:bg-ok/90 px-3 py-2 text-[12px] font-bold text-ink-950 font-mono shadow transition-all hover:scale-[1.02]"
          >
            Next: Level {nextLevel.n} ({nextLevel.algorithm.split(" ")[0]}) →
          </Link>
        ) : (
          <Link
            to="/learn"
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-ok hover:bg-ok/90 px-3 py-2 text-[12px] font-bold text-ink-950 font-mono shadow transition-all"
          >
            Review Learning Path →
          </Link>
        )}
      </div>
    </div>
  );
}


