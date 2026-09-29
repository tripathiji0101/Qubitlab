#!/usr/bin/env python3
"""
QubitLab Aer Statevector Runtime Benchmark
===========================================
Produces the empirical runtime benchmarks for the Quantum Engine feasibility
presentation (Slide 4: Runtime Scalability vs. Qubit Count).

What it does:
1. Constructs parameterized test circuits (random single-qubit rotations + entangling CNOT layers)
   at 2, 4, 6, ..., 24 qubits.
2. Executes each circuit using Qiskit Aer's statevector simulator (`AerSimulator(method="statevector")`),
   matching QubitLab's backend execution pipeline (`backend/app/services/quantum/qiskit_engine.py`).
3. Measures wall-clock execution time across multiple trials per qubit count and computes the
   median execution time in milliseconds (ms), along with min/max bounds and memory footprint.
4. Outputs formatted tables and CSV-ready data ready for PowerPoint / Google Slides chart insertion.

Dependencies:
    pip install qiskit==1.2.0 qiskit-aer==0.15.0 numpy
"""

import sys
import os
import time
import argparse
import platform
import numpy as np

# Ensure required libraries are available
try:
    import qiskit
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
except ImportError as exc:
    print(f"\n[ERROR] Missing required library: {exc}")
    print("Please install requirements using:")
    print("    pip install qiskit==1.2.0 qiskit-aer==0.15.0 numpy\n")
    sys.exit(1)


def build_test_circuit(n_qubits: int, depth: int = 4, seed: int = 42) -> QuantumCircuit:
    """
    Builds a synthetic quantum circuit with layers of single-qubit rotations
    and two-qubit entangling CNOT gates to realistically stress the statevector engine.
    """
    rng = np.random.default_rng(seed + n_qubits)
    qc = QuantumCircuit(n_qubits)

    single_gates = ['h', 'x', 'y', 'z', 's', 't', 'rx', 'ry', 'rz']

    for layer in range(depth):
        # 1. Single-qubit random gate layer
        for q in range(n_qubits):
            gate = rng.choice(single_gates)
            if gate == 'h':
                qc.h(q)
            elif gate == 'x':
                qc.x(q)
            elif gate == 'y':
                qc.y(q)
            elif gate == 'z':
                qc.z(q)
            elif gate == 's':
                qc.s(q)
            elif gate == 't':
                qc.t(q)
            elif gate in ('rx', 'ry', 'rz'):
                angle = float(rng.uniform(0, 2 * np.pi))
                getattr(qc, gate)(angle, q)

        # 2. Entangling CNOT layer (linear nearest-neighbor ladder)
        for q in range(0, n_qubits - 1, 2):
            qc.cx(q, q + 1)
        for q in range(1, n_qubits - 1, 2):
            qc.cx(q, q + 1)

    # Instruct simulator to retain the full statevector
    qc.save_statevector()
    return qc


def format_memory(n_qubits: int) -> str:
    """Calculates theoretical complex128 statevector memory: 2^n * 16 bytes."""
    bytes_needed = (2 ** n_qubits) * 16
    if bytes_needed < 1024:
        return f"{bytes_needed} B"
    elif bytes_needed < 1024 * 1024:
        return f"{bytes_needed / 1024:.1f} KB"
    elif bytes_needed < 1024 * 1024 * 1024:
        return f"{bytes_needed / (1024 * 1024):.2f} MB"
    else:
        return f"{bytes_needed / (1024 * 1024 * 1024):.2f} GB"


def run_benchmark(
    min_qubits: int = 2,
    max_qubits: int = 24,
    step: int = 2,
    trials: int = 5,
    depth: int = 4,
    seed: int = 42,
    csv_file: str = None
):
    """Executes the Qiskit Aer statevector benchmark across the specified qubit range."""
    qubit_range = list(range(min_qubits, max_qubits + 1, step))
    simulator = AerSimulator(method="statevector")

    print("\n" + "=" * 78)
    print("          QUBITLAB - QISKIT AER STATEVECTOR RUNTIME BENCHMARK")
    print("=" * 78)
    print(f" System OS        : {platform.system()} {platform.release()} ({platform.machine()})")
    print(f" Python Version   : {platform.python_version()}")
    print(f" Qiskit Version   : {qiskit.__version__}")
    import qiskit_aer
    print(f" Qiskit Aer Vers. : {qiskit_aer.__version__}")
    print(f" Qubit Range      : {min_qubits} to {max_qubits} (step: {step})")
    print(f" Trials Per Qubit : {trials} (reporting median)")
    print(f" Circuit Depth    : {depth} layers")
    print("=" * 78)

    # Warm-up run to initialize Aer C++ backend and OpenMP thread pool
    print("\n[Init] Warming up Qiskit Aer statevector simulator...", end="", flush=True)
    warmup_qc = build_test_circuit(4, depth=2, seed=0)
    simulator.run(warmup_qc).result()
    print(" Done.\n")

    results = []

    header = f"{'Qubits':>6} | {'Dim (2^N)':>12} | {'Statevector RAM':>16} | {'Median (ms)':>12} | {'Min (ms)':>10} | {'Max (ms)':>10}"
    separator = "-" * len(header)
    print(separator)
    print(header)
    print(separator)

    for n in qubit_range:
        qc = build_test_circuit(n, depth=depth, seed=seed)
        times_ms = []

        for trial in range(trials):
            t0 = time.perf_counter()
            job = simulator.run(qc)
            _ = job.result()
            t1 = time.perf_counter()
            elapsed_ms = (t1 - t0) * 1000.0
            times_ms.append(elapsed_ms)

        med_ms = float(np.median(times_ms))
        min_ms = float(np.min(times_ms))
        max_ms = float(np.max(times_ms))
        dim = 2 ** n
        mem_str = format_memory(n)

        results.append({
            "qubits": n,
            "dimension": dim,
            "memory": mem_str,
            "median_ms": round(med_ms, 2),
            "min_ms": round(min_ms, 2),
            "max_ms": round(max_ms, 2),
        })

        print(f"{n:>6} | {dim:>12,d} | {mem_str:>16} | {med_ms:>12.2f} | {min_ms:>10.2f} | {max_ms:>10.2f}")

    print(separator)

    # Print copy-pasteable data for PowerPoint / Google Slides (Slide 4 chart)
    print("\n" + "=" * 78)
    print(" SLIDE 4 CHART DATA (Copy & paste directly into 'Edit Data' / spreadsheet)")
    print("=" * 78)
    print("Qubits,Runtime_ms,Dimension,Memory")
    for r in results:
        print(f"{r['qubits']},{r['median_ms']},{r['dimension']},{r['memory']}")
    print("=" * 78)

    # Optional CSV export
    if csv_file:
        try:
            with open(csv_file, "w", encoding="utf-8") as f:
                f.write("Qubits,Median_Runtime_ms,Min_ms,Max_ms,Dimension,Memory\n")
                for r in results:
                    f.write(f"{r['qubits']},{r['median_ms']},{r['min_ms']},{r['max_ms']},{r['dimension']},{r['memory']}\n")
            print(f"\n[Saved] Results exported to {csv_file}")
        except Exception as e:
            print(f"\n[Warning] Could not export CSV: {e}")

    print("\n✓ Benchmark complete. Use these numbers to populate Slide 4.")
    return results


def main():
    parser = argparse.ArgumentParser(
        description="QubitLab Qiskit Aer Statevector Benchmark for SIH Slide 4"
    )
    parser.add_argument("--min-qubits", type=int, default=2, help="Starting qubit count (default: 2)")
    parser.add_argument("--max-qubits", type=int, default=24, help="Maximum qubit count (default: 24)")
    parser.add_argument("--step", type=int, default=2, help="Qubit step increment (default: 2)")
    parser.add_argument("--trials", type=int, default=5, help="Number of trials per qubit count (default: 5)")
    parser.add_argument("--depth", type=int, default=4, help="Circuit depth layers (default: 4)")
    parser.add_argument("--seed", type=int, default=42, help="RNG seed for reproducibility (default: 42)")
    parser.add_argument("--csv", type=str, default=None, help="Optional output CSV path (e.g., benchmark_results.csv)")

    args = parser.parse_args()
    run_benchmark(
        min_qubits=args.min_qubits,
        max_qubits=args.max_qubits,
        step=args.step,
        trials=args.trials,
        depth=args.depth,
        seed=args.seed,
        csv_file=args.csv
    )


if __name__ == "__main__":
    main()
