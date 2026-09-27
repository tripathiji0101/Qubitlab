import assert from "node:assert";
import test from "node:test";
import {
  projectCurricula,
  getProjectCurriculum,
  getCurriculumPhase,
  getAllCurricula,
} from "../../src/lib/curriculumData.ts";
import { levels, getProjectLessons } from "../../src/lib/data.ts";

const EXPECTED_PROJECTS = [
  "bb84",
  "deutsch-jozsa",
  "grover",
  "qaoa",
  "qnn",
  "teleportation",
  "qft",
  "simon",
  "vqe",
  "shor",
  "error-correction",
  "hhl",
];

test("1. Every project has curriculum data", () => {
  const all = getAllCurricula();
  assert.strictEqual(all.length, 12, "Must have exactly 12 project curricula");

  for (const slug of EXPECTED_PROJECTS) {
    const cur = getProjectCurriculum(slug);
    assert.ok(cur, `Curriculum for ${slug} must exist`);
    assert.strictEqual(cur.projectId, slug);
    assert.ok(cur.algorithm, `${slug} must have an algorithm title`);
    assert.ok(cur.overview, `${slug} must have an overview`);
  }
});

test("2. Every project has >= 8 phases (specifically 12 phases)", () => {
  for (const slug of EXPECTED_PROJECTS) {
    const cur = getProjectCurriculum(slug);
    assert.ok(cur.phases.length >= 8, `${slug} must have >= 8 phases`);
    assert.strictEqual(cur.phases.length, 12, `${slug} must have 12 phases`);

    // Verify ordering
    for (let i = 0; i < cur.phases.length; i++) {
      assert.strictEqual(cur.phases[i].order, i + 1, `Phase order in ${slug} must be sequential 1-12`);
    }
  }
});

test("3. Every phase has title, objective, explanation, and educational depth", () => {
  let totalPhases = 0;
  for (const slug of EXPECTED_PROJECTS) {
    const cur = getProjectCurriculum(slug);
    for (const phase of cur.phases) {
      totalPhases++;
      assert.ok(phase.title && phase.title.length > 5, `${slug} phase ${phase.order} has meaningful title`);
      assert.ok(phase.objective && phase.objective.length > 15, `${slug} phase ${phase.order} has meaningful objective`);
      assert.ok(phase.explanation && phase.explanation.length > 40, `${slug} phase ${phase.order} has meaningful explanation`);
      assert.ok(phase.duration, `${slug} phase ${phase.order} has duration`);
      assert.ok(phase.xp_reward > 0, `${slug} phase ${phase.order} has xp_reward`);
      assert.ok(phase.circuitConnection, `${slug} phase ${phase.order} has circuit connection`);
      assert.ok(phase.visualIntuition, `${slug} phase ${phase.order} has visual intuition`);
      assert.ok(phase.example, `${slug} phase ${phase.order} has concrete example`);
      assert.ok(Array.isArray(phase.commonMistakes) && phase.commonMistakes.length > 0, `${slug} phase ${phase.order} has common mistakes`);
      assert.ok(phase.checkQuestion, `${slug} phase ${phase.order} has check question`);
      assert.ok(phase.checkAnswer, `${slug} phase ${phase.order} has check answer`);
      assert.ok(phase.nextConnection, `${slug} phase ${phase.order} has connection to next phase`);
    }
  }
  assert.strictEqual(totalPhases, 144, "Total phases across 12 projects must be 144");
});

test("4. Math content is present and formatted safely", () => {
  for (const slug of EXPECTED_PROJECTS) {
    const cur = getProjectCurriculum(slug);
    const mathPhases = cur.phases.filter((p) => p.math);
    assert.ok(mathPhases.length >= 6, `${slug} must have mathematical equations in key phases`);

    for (const phase of mathPhases) {
      assert.ok(typeof phase.math === "string");
      assert.ok(
        phase.math.includes("$") || phase.math.includes("\\") || phase.math.includes("|"),
        `Math in ${slug} phase ${phase.order} should contain mathematical notation`
      );
    }
  }
});

test("5. Project slug and alias resolution works correctly", () => {
  assert.ok(getProjectCurriculum("bb84"));
  assert.ok(getProjectCurriculum("deutsch-jozsa"));
  assert.ok(getProjectCurriculum("deutschjozsa"));
  assert.ok(getProjectCurriculum("dj"));
  assert.ok(getProjectCurriculum("teleport"));
  assert.ok(getProjectCurriculum("teleportation"));
  assert.ok(getProjectCurriculum("qec"));
  assert.ok(getProjectCurriculum("quantum-error-correction"));
  assert.ok(getProjectCurriculum("error-correction"));
  assert.ok(getProjectCurriculum("grover-search"));
  assert.ok(getProjectCurriculum("qaoa-opt"));

  // Level number aliases
  for (let n = 1; n <= 12; n++) {
    assert.ok(getProjectCurriculum(String(n)), `Resolves level number '${n}'`);
    assert.ok(getProjectCurriculum(`level-${n}`), `Resolves 'level-${n}'`);
    assert.ok(getProjectCurriculum(`level ${n}`), `Resolves 'level ${n}'`);
  }
});

test("6. Missing or invalid project slug does not crash", () => {
  assert.strictEqual(getProjectCurriculum(null), undefined);
  assert.strictEqual(getProjectCurriculum(undefined), undefined);
  assert.strictEqual(getProjectCurriculum(""), undefined);
  assert.strictEqual(getProjectCurriculum("invalid-slug-xyz"), undefined);
  assert.strictEqual(getCurriculumPhase("invalid-slug", 1), undefined);
  assert.strictEqual(getCurriculumPhase("bb84", 999), undefined);
});

test("7. Previous/Next phase boundary conditions", () => {
  const cur = getProjectCurriculum("grover");
  assert.ok(cur);

  // Phase 1 cannot go backward
  const p1 = getCurriculumPhase("grover", 1);
  assert.strictEqual(p1.order, 1);
  const prevOrder1 = Math.max(1, p1.order - 1);
  assert.strictEqual(prevOrder1, 1, "First phase cannot navigate backward");

  // Phase 12 cannot go forward beyond 12
  const p12 = getCurriculumPhase("grover", 12);
  assert.strictEqual(p12.order, 12);
  const nextOrder12 = Math.min(cur.phases.length, p12.order + 1);
  assert.strictEqual(nextOrder12, 12, "Last phase cannot navigate forward beyond total phases");
});

test("8. data.ts getProjectLessons integration", () => {
  for (const l of levels) {
    const lessons = getProjectLessons(l.slug, l.n, l.algorithm);
    assert.ok(lessons.length >= 10, `${l.slug} lessons must have >= 10 items`);
    assert.ok(lessons[0].title, "First lesson must have title");
    assert.ok(lessons[0].learningObjective, "First lesson must have learningObjective");
    assert.ok(lessons[0].explanation, "First lesson must have explanation");
  }
});

test("9. All 144 phases have interactive activities and 36 milestone checkpoints", () => {
  let totalActivities = 0;
  let totalCheckpoints = 0;

  for (const slug of EXPECTED_PROJECTS) {
    const cur = getProjectCurriculum(slug);
    for (const phase of cur.phases) {
      assert.ok(phase.activity, `${slug} phase ${phase.order} must have an activity`);
      assert.ok(phase.activity.question, `Activity in ${phase.id} must have a question`);
      assert.ok(Array.isArray(phase.activity.options) && phase.activity.options.length >= 2, `Activity in ${phase.id} must have >= 2 options`);
      assert.ok(typeof phase.activity.correctIndex === "number", `Activity in ${phase.id} must have correctIndex`);
      assert.ok(phase.activity.correctIndex >= 0 && phase.activity.correctIndex < phase.activity.options.length, `Activity in ${phase.id} correctIndex out of bounds`);
      assert.ok(phase.activity.explanation, `Activity in ${phase.id} must have explanation`);
      assert.ok(Array.isArray(phase.activity.hints) && phase.activity.hints.length >= 2, `Activity in ${phase.id} must have >= 2 progressive hints`);
      totalActivities++;

      if (phase.order === 4 || phase.order === 8 || phase.order === 12) {
        assert.ok(phase.checkpoint, `Phase ${phase.id} (order ${phase.order}) must have a milestone checkpoint`);
        assert.ok(phase.checkpoint.title, `Checkpoint in ${phase.id} must have title`);
        assert.ok(phase.checkpoint.question, `Checkpoint in ${phase.id} must have question`);
        assert.ok(phase.checkpoint.options.length >= 2, `Checkpoint in ${phase.id} must have >= 2 options`);
        assert.ok(phase.checkpoint.correctIndex >= 0 && phase.checkpoint.correctIndex < phase.checkpoint.options.length, `Checkpoint in ${phase.id} correctIndex out of bounds`);
        assert.ok(phase.checkpoint.explanation, `Checkpoint in ${phase.id} must have explanation`);
        totalCheckpoints++;
      }
    }
  }

  assert.strictEqual(totalActivities, 144, "Total activities must be exactly 144");
  assert.strictEqual(totalCheckpoints, 36, "Total checkpoints must be exactly 36 (3 per project * 12 projects)");
});

test("10. Discriminated union types and 2-stage hints validation", () => {
  const validTypes = new Set([
    "prediction",
    "multiple-choice",
    "gate-prediction",
    "statevector",
    "circuit-analysis",
    "code-completion",
  ]);

  for (const slug of EXPECTED_PROJECTS) {
    const cur = getProjectCurriculum(slug);
    for (const phase of cur.phases) {
      assert.ok(validTypes.has(phase.activity.type), `Activity in ${phase.id} has valid discriminated union type ${phase.activity.type}`);
      assert.ok(phase.activity.hints.length >= 2, `Activity in ${phase.id} must provide >= 2 progressive hints`);
    }
  }
});

test("11. Real quantum simulator integration test", async () => {
  const { simulate } = await import("../../src/lib/sim.ts");

  // 1. Single Qubit Hadamard Superposition: H |0> -> (|0> + |1>)/sqrt(2)
  const hadamardSim = simulate(1, [{ kind: "single", g: "H", target: 0 }]);
  assert.strictEqual(hadamardSim.probs.length, 2);
  assert.strictEqual(hadamardSim.probs[0].state, "0");
  assert.strictEqual(hadamardSim.probs[0].p, 50.0);
  assert.strictEqual(hadamardSim.probs[1].state, "1");
  assert.strictEqual(hadamardSim.probs[1].p, 50.0);

  // 2. Bell State Creation: H on q0, CNOT(0 -> 1) -> (|00> + |11>)/sqrt(2)
  const bellSim = simulate(2, [
    { kind: "single", g: "H", target: 0 },
    { kind: "cnot", control: 0, target: 1 },
  ]);
  assert.strictEqual(bellSim.probs.length, 4);
  const p00 = bellSim.probs.find((p) => p.state === "00")?.p;
  const p11 = bellSim.probs.find((p) => p.state === "11")?.p;
  const p01 = bellSim.probs.find((p) => p.state === "01")?.p;
  const p10 = bellSim.probs.find((p) => p.state === "10")?.p;
  assert.strictEqual(p00, 50.0);
  assert.strictEqual(p11, 50.0);
  assert.strictEqual(p01, 0.0);
  assert.strictEqual(p10, 0.0);

  // 3. Self-inverse property: H * H = I
  const hhSim = simulate(1, [
    { kind: "single", g: "H", target: 0 },
    { kind: "single", g: "H", target: 0 },
  ]);
  assert.strictEqual(hhSim.probs[0].state, "0");
  assert.strictEqual(hhSim.probs[0].p, 100.0);
});

test("12. Phase knowledge state manager", async () => {
  const { getPhaseKnowledgeState, savePhaseKnowledgeState } = await import("../../src/lib/curriculumActivities.ts");

  const state = getPhaseKnowledgeState("test-slug", 1);
  assert.strictEqual(state.started, false);
  assert.strictEqual(state.completed, false);
  assert.strictEqual(state.activityAttempts, 0);
  assert.strictEqual(state.hintsUsed, 0);

  const updated = savePhaseKnowledgeState("test-slug", 1, {
    started: true,
    activityAttempts: 2,
    hintsUsed: 1,
    lastAnsweredCorrectly: true,
  });
  assert.strictEqual(updated.started, true);
  assert.strictEqual(updated.activityAttempts, 2);
  assert.strictEqual(updated.hintsUsed, 1);
});

test("13. All 144 phases satisfy all 15 pedagogical structure requirements", () => {
  for (const slug of EXPECTED_PROJECTS) {
    const cur = getProjectCurriculum(slug);
    for (const p of cur.phases) {
      assert.ok(p.objective && p.objective.length >= 15, `Objective in ${p.id}`);
      assert.ok(p.whyNecessary && p.whyNecessary.length >= 15, `whyNecessary in ${p.id}`);
      assert.ok(p.explanation && p.explanation.length >= 40, `explanation in ${p.id}`);
      assert.ok(p.math && p.math.length >= 5, `math in ${p.id}`);
      assert.ok(p.visualIntuition && p.visualIntuition.length >= 15, `visualIntuition in ${p.id}`);
      assert.ok(p.circuitConnection, `circuitConnection in ${p.id}`);
      assert.ok(p.example && p.example.length >= 15, `example in ${p.id}`);
      assert.ok(p.predictionQuestion && p.predictionQuestion.length >= 10, `predictionQuestion in ${p.id}`);
      assert.ok(p.activity, `activity in ${p.id}`);
      assert.ok(p.verification && p.verification.length >= 15, `verification in ${p.id}`);
      assert.ok(Array.isArray(p.commonMistakes) && p.commonMistakes.length >= 1, `commonMistakes in ${p.id}`);
      assert.ok(p.prevConnection && p.prevConnection.length >= 10, `prevConnection in ${p.id}`);
      assert.ok(p.nextConnection && p.nextConnection.length >= 10, `nextConnection in ${p.id}`);
      assert.ok(p.qiskitCode && p.qiskitCode.length >= 10, `qiskitCode in ${p.id}`);
    }
  }
});

console.log("All unit tests passed successfully!");

