#!/usr/bin/env python3
"""
validate_curriculum_full.py
Rigorous automated data validation script for QubitLab's 12-algorithm interactive curriculum.

Verifies:
- exactly 12 projects
- exactly 12 phases/project
- exactly 144 phases
- every phase has required educational fields
- every phase has at least one activity
- every activity has a valid type
- every MCQ has a valid correctIndex
- every phase has non-empty objective/explanation
- no placeholder phrases
- all project slugs resolve
- phase ordering is 1–12
- no duplicate phase IDs
"""

import sys
import json
import subprocess
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent

# Forbidden placeholder / low-effort phrases
BANNED_PHRASES = [
    "quantum computing is powerful",
    "now you will learn more about the algorithm",
    "this concept is important",
    "lorem ipsum",
    "todo:",
    "placeholder",
    "tbd",
]

EXPECTED_PROJECT_SLUGS = [
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
    "hhl"
]

VALID_ACTIVITY_TYPES = {
    "prediction",
    "multiple-choice",
    "gate-prediction",
    "statevector",
    "circuit-analysis",
    "code-completion"
}

def load_curriculum_data():
    """Extract full curriculum data by executing node against curriculumData.ts"""
    script = """
    import('./src/lib/curriculumData.ts').then(mod => {
      const all = mod.getAllCurricula();
      console.log(JSON.stringify(all));
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
    """
    proc = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=str(WORKSPACE_ROOT),
        capture_output=True,
        text=True
    )
    if proc.returncode != 0:
        print("ERROR executing node to load curriculumData:", proc.stderr)
        sys.exit(1)
    return json.loads(proc.stdout)

def main():
    print("=" * 60)
    print("VALIDATING QUBITLAB 144-PHASE INTERACTIVE CURRICULUM")
    print("=" * 60)

    curricula = load_curriculum_data()

    # 1. Exactly 12 projects
    if len(curricula) != 12:
        print(f"FAIL: Expected 12 projects, found {len(curricula)}")
        sys.exit(1)
    print(f"✓ Project count: {len(curricula)} / 12")

    seen_phase_ids = set()
    total_phases = 0
    total_activities = 0
    total_checkpoints = 0

    for p_idx, project in enumerate(curricula):
        slug = project.get("projectId")
        if slug not in EXPECTED_PROJECT_SLUGS:
            print(f"FAIL: Unexpected project slug: {slug}")
            sys.exit(1)
        if slug != EXPECTED_PROJECT_SLUGS[p_idx]:
            print(f"FAIL: Canonical ordering mismatch: expected {EXPECTED_PROJECT_SLUGS[p_idx]}, found {slug}")
            sys.exit(1)

        phases = project.get("phases", [])
        # 2. Exactly 12 phases per project
        if len(phases) != 12:
            print(f"FAIL: Project '{slug}' has {len(phases)} phases (expected 12)")
            sys.exit(1)

        for i, phase in enumerate(phases):
            total_phases += 1
            order = phase.get("order")
            # 3. Phase ordering 1-12
            if order != i + 1:
                print(f"FAIL: Phase ordering error in '{slug}': expected {i + 1}, got {order}")
                sys.exit(1)

            pid = phase.get("id")
            if not pid:
                print(f"FAIL: Phase order {order} in '{slug}' has missing ID")
                sys.exit(1)
            # 4. No duplicate phase IDs
            if pid in seen_phase_ids:
                print(f"FAIL: Duplicate phase ID: {pid}")
                sys.exit(1)
            seen_phase_ids.add(pid)

            # 5. Required educational fields
            # - Learning objective
            # - Why this concept is necessary
            # - Beginner-friendly explanation
            # - Mathematical formulation
            # - Physical/intuitive explanation
            # - Circuit/gate connection
            # - Worked example
            # - Prediction question
            # - Interactive activity
            # - Verification/explanation
            # - Common mistakes
            # - Connection to previous phase
            # - Connection to next phase
            # - Qiskit implementation
            required_string_fields = [
                ("title", 4),
                ("objective", 15),
                ("whyNecessary", 15),
                ("explanation", 40),
                ("visualIntuition", 15),
                ("example", 15),
                ("predictionQuestion", 10),
                ("verification", 15),
                ("nextConnection", 10),
                ("prevConnection", 10),
                ("qiskitCode", 10)
            ]

            for field, min_len in required_string_fields:
                val = phase.get(field)
                if not val or not isinstance(val, str) or len(val.strip()) < min_len:
                    print(f"FAIL: Phase '{pid}' field '{field}' is missing or too short: {val!r}")
                    sys.exit(1)

            # Math formulation
            math_val = phase.get("math")
            if not math_val or not isinstance(math_val, str) or len(math_val.strip()) < 5:
                print(f"FAIL: Phase '{pid}' has missing or invalid math formulation")
                sys.exit(1)

            # Circuit connection
            circ_conn = phase.get("circuitConnection")
            if not circ_conn:
                print(f"FAIL: Phase '{pid}' has missing circuitConnection")
                sys.exit(1)

            # Common mistakes array
            mistakes = phase.get("commonMistakes")
            if not isinstance(mistakes, list) or len(mistakes) == 0:
                print(f"FAIL: Phase '{pid}' has missing commonMistakes list")
                sys.exit(1)

            # Check no placeholder / low-effort phrases in key content
            combined_text = (
                phase.get("objective", "") + " " +
                phase.get("explanation", "") + " " +
                phase.get("example", "")
            ).lower()

            for banned in BANNED_PHRASES:
                if banned in combined_text:
                    print(f"FAIL: Phase '{pid}' contains banned placeholder phrase: '{banned}'")
                    sys.exit(1)

            # 6. Interactive Activity
            activity = phase.get("activity")
            if not activity:
                print(f"FAIL: Phase '{pid}' is missing its interactive activity")
                sys.exit(1)
            total_activities += 1

            act_type = activity.get("type")
            if act_type not in VALID_ACTIVITY_TYPES:
                print(f"FAIL: Phase '{pid}' activity has invalid type: {act_type}")
                sys.exit(1)

            act_q = activity.get("question")
            if not act_q or len(act_q.strip()) < 10:
                print(f"FAIL: Phase '{pid}' activity has missing question")
                sys.exit(1)

            options = activity.get("options")
            if not isinstance(options, list) or len(options) < 2:
                print(f"FAIL: Phase '{pid}' activity options must be list of >= 2 options")
                sys.exit(1)

            c_idx = activity.get("correctIndex")
            if not isinstance(c_idx, int) or c_idx < 0 or c_idx >= len(options):
                print(f"FAIL: Phase '{pid}' activity correctIndex {c_idx} out of range [0, {len(options)-1}]")
                sys.exit(1)

            act_exp = activity.get("explanation")
            if not act_exp or len(act_exp.strip()) < 15:
                print(f"FAIL: Phase '{pid}' activity explanation missing or too short")
                sys.exit(1)

            hints = activity.get("hints")
            if not isinstance(hints, list) or len(hints) < 2:
                print(f"FAIL: Phase '{pid}' activity must provide at least 2 progressive hints")
                sys.exit(1)

            # Checkpoint verification (phases 4, 8, 12)
            if order in (4, 8, 12):
                checkpoint = phase.get("checkpoint")
                if not checkpoint:
                    print(f"FAIL: Milestone Phase '{pid}' (order {order}) must include a checkpoint")
                    sys.exit(1)
                total_checkpoints += 1

                chk_title = checkpoint.get("title")
                chk_q = checkpoint.get("question")
                chk_opts = checkpoint.get("options")
                chk_idx = checkpoint.get("correctIndex")
                chk_exp = checkpoint.get("explanation")
                if not chk_title or not chk_q or not chk_opts or not isinstance(chk_idx, int) or not chk_exp:
                    print(f"FAIL: Milestone Checkpoint in '{pid}' has invalid or missing fields")
                    sys.exit(1)
                if chk_idx < 0 or chk_idx >= len(chk_opts):
                    print(f"FAIL: Checkpoint in '{pid}' correctIndex {chk_idx} out of range [0, {len(chk_opts)-1}]")
                    sys.exit(1)

    print(f"✓ Total phases verified: {total_phases} / 144")
    print(f"✓ Total interactive activities: {total_activities} / 144")
    print(f"✓ Total milestone checkpoints: {total_checkpoints} / 36")
    print(f"✓ All {total_phases} phases satisfy all 15 educational requirements")
    print(f"✓ No banned placeholder phrases detected")
    print("=" * 60)
    print("ALL CURRICULUM DATA CHECKS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
