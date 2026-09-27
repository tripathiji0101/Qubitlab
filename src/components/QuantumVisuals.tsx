import React, { useState } from "react";
import { Level } from "../lib/data";

interface QuantumLevelVisualProps {
  level: Level | { n: number; title: string; algorithm: string; video?: string; image?: string; slug?: string };
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  showBadge?: boolean;
}

/**
 * Scientifically authentic SVG schematics for all 12 quantum algorithms.
 * Each visual accurately captures the physical mechanism of the quantum algorithm.
 */
function ScientificSchematic({ levelNum, size = "md" }: { levelNum: number; size: string }) {
  const isLg = size === "lg" || size === "hero";
  const strokeW = isLg ? 2 : 1.5;

  switch (levelNum) {
    case 1:
      // BB84 QKD: Polarized photon bases (Rectilinear + / Diagonal ×) & filter matching
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bb84Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#35e0d8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4d7cfe" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Alice Basis: + and x */}
          <circle cx="45" cy="60" r="28" stroke="rgba(53, 224, 216, 0.4)" strokeWidth={strokeW} fill="rgba(53, 224, 216, 0.05)" />
          <line x1="45" y1="40" x2="45" y2="80" stroke="#35e0d8" strokeWidth={strokeW} strokeLinecap="round" />
          <line x1="25" y1="60" x2="65" y2="60" stroke="#35e0d8" strokeWidth={strokeW} strokeLinecap="round" />
          <text x="45" y="102" fill="#35e0d8" fontSize="10" fontFamily="monospace" textAnchor="middle">Alice (+/×)</text>

          {/* Quantum Channel Photon Pulse */}
          <line x1="80" y1="60" x2="120" y2="60" stroke="url(#bb84Grad)" strokeWidth={strokeW} strokeDasharray="3 3" />
          <circle cx="100" cy="60" r="4" fill="#35e0d8" className="animate-pulse" />
          <text x="100" y="50" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">|ψ⟩ Photon</text>

          {/* Bob Basis Detector */}
          <circle cx="155" cy="60" r="28" stroke="rgba(77, 124, 254, 0.4)" strokeWidth={strokeW} fill="rgba(77, 124, 254, 0.05)" />
          <line x1="140" y1="45" x2="170" y2="75" stroke="#4d7cfe" strokeWidth={strokeW} strokeLinecap="round" />
          <line x1="170" y1="45" x2="140" y2="75" stroke="#4d7cfe" strokeWidth={strokeW} strokeLinecap="round" />
          <text x="155" y="102" fill="#4d7cfe" fontSize="10" fontFamily="monospace" textAnchor="middle">Bob Detector</text>
        </svg>
      );

    case 2:
      // Deutsch–Jozsa: Superposition + Phase Kickback Oracle |x⟩|y ⊕ f(x)⟩
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="djOracle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9b6bff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#35e0d8" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Wire 0 & Wire 1 */}
          <line x1="20" y1="45" x2="180" y2="45" stroke="#475569" strokeWidth="1.5" />
          <line x1="20" y1="75" x2="180" y2="75" stroke="#475569" strokeWidth="1.5" />
          <text x="14" y="48" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">|0⟩</text>
          <text x="14" y="78" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">|1⟩</text>

          {/* Hadamard Gates */}
          <rect x="35" y="34" width="22" height="22" rx="4" fill="#1e293b" stroke="#35e0d8" strokeWidth={strokeW} />
          <text x="46" y="49" fill="#35e0d8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
          <rect x="35" y="64" width="22" height="22" rx="4" fill="#1e293b" stroke="#35e0d8" strokeWidth={strokeW} />
          <text x="46" y="79" fill="#35e0d8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>

          {/* Quantum Oracle Box */}
          <rect x="75" y="30" width="50" height="60" rx="6" fill="url(#djOracle)" stroke="#9b6bff" strokeWidth={strokeW} />
          <text x="100" y="55" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">U_f</text>
          <text x="100" y="70" fill="#a78bfa" fontSize="8" fontFamily="monospace" textAnchor="middle">(-1)^f(x)</text>

          {/* Final H Gate on q0 */}
          <rect x="140" y="34" width="22" height="22" rx="4" fill="#1e293b" stroke="#35e0d8" strokeWidth={strokeW} />
          <text x="151" y="49" fill="#35e0d8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>
          <text x="100" y="108" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">Constant: |0⟩  Balanced: |1⟩</text>
        </svg>
      );

    case 3:
      // Grover's Search: Diffusion Operator & Amplitude Reflection
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Baseline */}
          <line x1="25" y1="85" x2="175" y2="85" stroke="#475569" strokeWidth="1" />
          {/* Average Line */}
          <line x1="25" y1="55" x2="175" y2="55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="178" y="58" fill="#38bdf8" fontSize="8" fontFamily="monospace">⟨μ⟩ Mean</text>

          {/* States Bars: Target State inverted then amplified */}
          <rect x="40" y="65" width="16" height="20" rx="2" fill="rgba(148, 163, 184, 0.4)" />
          <text x="48" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">|00⟩</text>

          <rect x="75" y="65" width="16" height="20" rx="2" fill="rgba(148, 163, 184, 0.4)" />
          <text x="83" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">|01⟩</text>

          {/* Marked Target State: Amplified High */}
          <rect x="110" y="20" width="18" height="65" rx="3" fill="#35e0d8" stroke="#38bdf8" strokeWidth={strokeW} />
          <text x="119" y="98" fill="#35e0d8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">|ω*⟩</text>
          <circle cx="119" cy="14" r="3" fill="#35e0d8" className="animate-ping" />

          <rect x="145" y="65" width="16" height="20" rx="2" fill="rgba(148, 163, 184, 0.4)" />
          <text x="153" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">|11⟩</text>
          <text x="100" y="112" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">2|ψ⟩⟨ψ| - I Diffusion</text>
        </svg>
      );

    case 4:
      // QAOA: Alternating Cost & Mixer Hamiltonian Graph Pulses
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Graph Nodes */}
          <circle cx="45" cy="40" r="12" stroke="#e05fce" strokeWidth={strokeW} fill="rgba(224, 95, 206, 0.1)" />
          <text x="45" y="44" fill="#e05fce" fontSize="10" fontWeight="bold" textAnchor="middle">v₁</text>

          <circle cx="45" cy="80" r="12" stroke="#e05fce" strokeWidth={strokeW} fill="rgba(224, 95, 206, 0.1)" />
          <text x="45" y="84" fill="#e05fce" fontSize="10" fontWeight="bold" textAnchor="middle">v₂</text>

          <circle cx="85" cy="60" r="12" stroke="#4d7cfe" strokeWidth={strokeW} fill="rgba(77, 124, 254, 0.1)" />
          <text x="85" y="64" fill="#4d7cfe" fontSize="10" fontWeight="bold" textAnchor="middle">v₃</text>

          {/* Graph Edges */}
          <line x1="57" y1="40" x2="73" y2="55" stroke="#64748b" strokeWidth="1.5" />
          <line x1="57" y1="80" x2="73" y2="65" stroke="#64748b" strokeWidth="1.5" />
          <line x1="45" y1="52" x2="45" y2="68" stroke="#64748b" strokeWidth="1.5" />

          {/* Alternating Pulses */}
          <rect x="115" y="32" width="32" height="24" rx="4" fill="#1e293b" stroke="#e05fce" strokeWidth={strokeW} />
          <text x="131" y="48" fill="#e05fce" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">e^-iγC</text>

          <rect x="155" y="32" width="32" height="24" rx="4" fill="#1e293b" stroke="#4d7cfe" strokeWidth={strokeW} />
          <text x="171" y="48" fill="#4d7cfe" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">e^-iβB</text>

          <path d="M120 75 Q 150 65 180 75" stroke="#35e0d8" strokeWidth="1.5" fill="none" />
          <text x="150" y="92" fill="#35e0d8" fontSize="9" fontFamily="monospace" textAnchor="middle">MaxCut Optimizer</text>
        </svg>
      );

    case 5:
      // Quantum Neural Network (QNN): Feature Map & Variational Ansatz Loop
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Input Encoding U_Φ(x) */}
          <rect x="30" y="35" width="40" height="48" rx="5" fill="rgba(53, 224, 216, 0.1)" stroke="#35e0d8" strokeWidth={strokeW} />
          <text x="50" y="56" fill="#35e0d8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">U_Φ(x)</text>
          <text x="50" y="70" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Feature</text>

          {/* Variational Layer W(θ) */}
          <rect x="85" y="35" width="45" height="48" rx="5" fill="rgba(155, 107, 255, 0.1)" stroke="#9b6bff" strokeWidth={strokeW} />
          <text x="107" y="56" fill="#9b6bff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">W(θ)</text>
          <text x="107" y="70" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Ansatz</text>

          {/* Measurement & Gradient Classical Loop */}
          <circle cx="155" cy="59" r="16" stroke="#f59e0b" strokeWidth={strokeW} fill="rgba(245, 158, 11, 0.1)" />
          <text x="155" y="63" fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">∇θ</text>

          {/* Feedback arrow */}
          <path d="M155 77 C 155 98, 107 98, 107 88" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          <text x="100" y="110" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">Hybrid Quantum-Classical Loop</text>
        </svg>
      );

    case 6:
      // Quantum Teleportation: 3-Qubit Line, Shared Bell Pair & Corrections
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Qubit wires */}
          <line x1="25" y1="35" x2="175" y2="35" stroke="#475569" strokeWidth="1.5" />
          <line x1="25" y1="65" x2="120" y2="65" stroke="#475569" strokeWidth="1.5" />
          <line x1="25" y1="95" x2="175" y2="95" stroke="#475569" strokeWidth="1.5" />
          <text x="18" y="38" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">q0: |ψ⟩</text>
          <text x="18" y="68" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">q1: A</text>
          <text x="18" y="98" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">q2: B</text>

          {/* Bell pair link between q1 & q2 */}
          <circle cx="50" cy="65" r="4" fill="#35e0d8" />
          <line x1="50" y1="65" x2="50" y2="95" stroke="#35e0d8" strokeWidth={strokeW} />
          <circle cx="50" cy="95" r="4" fill="#35e0d8" />

          {/* Alice Bell Measurement */}
          <rect x="75" y="27" width="36" height="46" rx="4" fill="rgba(155, 107, 255, 0.15)" stroke="#9b6bff" strokeWidth={strokeW} />
          <text x="93" y="52" fill="#9b6bff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">BSM</text>

          {/* Classical Feedforward Channel */}
          <path d="M111 35 L 145 35 L 145 85" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
          <rect x="135" y="86" width="28" height="18" rx="3" fill="#1e293b" stroke="#35e0d8" strokeWidth={strokeW} />
          <text x="149" y="99" fill="#35e0d8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">XᶻZˣ</text>
          <text x="100" y="114" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">State Teleportation q0 → q2</text>
        </svg>
      );

    case 7:
      // QFT: Quantum Fourier Transform Phase Grid & SWAP
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Three Wires */}
          <line x1="20" y1="35" x2="180" y2="35" stroke="#475569" strokeWidth="1.5" />
          <line x1="20" y1="65" x2="180" y2="65" stroke="#475569" strokeWidth="1.5" />
          <line x1="20" y1="95" x2="180" y2="95" stroke="#475569" strokeWidth="1.5" />

          {/* H Gate on Wire 0 */}
          <rect x="35" y="25" width="20" height="20" rx="3" fill="#1e293b" stroke="#35e0d8" strokeWidth={strokeW} />
          <text x="45" y="39" fill="#35e0d8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">H</text>

          {/* Controlled R2 and R3 Gates */}
          <circle cx="70" cy="65" r="3" fill="#4d7cfe" />
          <line x1="70" y1="45" x2="70" y2="65" stroke="#4d7cfe" strokeWidth="1.5" />
          <rect x="60" y="25" width="20" height="20" rx="3" fill="#1e293b" stroke="#4d7cfe" strokeWidth={strokeW} />
          <text x="70" y="39" fill="#4d7cfe" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">R₂</text>

          <circle cx="100" cy="95" r="3" fill="#9b6bff" />
          <line x1="100" y1="45" x2="100" y2="95" stroke="#9b6bff" strokeWidth="1.5" />
          <rect x="90" y="25" width="20" height="20" rx="3" fill="#1e293b" stroke="#9b6bff" strokeWidth={strokeW} />
          <text x="100" y="39" fill="#9b6bff" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">R₃</text>

          {/* SWAP Gate */}
          <line x1="140" y1="35" x2="140" y2="95" stroke="#e05fce" strokeWidth="1.5" />
          <text x="140" y="39" fill="#e05fce" fontSize="12" fontWeight="bold" textAnchor="middle">×</text>
          <text x="140" y="99" fill="#e05fce" fontSize="12" fontWeight="bold" textAnchor="middle">×</text>
          <text x="100" y="114" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">Computational → Fourier Basis</text>
        </svg>
      );

    case 8:
      // Simon's Algorithm: Hidden XOR pattern s where f(x)=f(y) <=> x ⊕ y = s
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dual Registers */}
          <rect x="25" y="25" width="150" height="32" rx="6" fill="rgba(53, 224, 216, 0.08)" stroke="#35e0d8" strokeWidth="1.5" />
          <text x="35" y="45" fill="#35e0d8" fontSize="10" fontWeight="bold" fontFamily="monospace">Register 1: |x⟩</text>
          <text x="155" y="45" fill="#38bdf8" fontSize="9" fontFamily="monospace">H^⊗n</text>

          <rect x="25" y="65" width="150" height="32" rx="6" fill="rgba(155, 107, 255, 0.08)" stroke="#9b6bff" strokeWidth="1.5" />
          <text x="35" y="85" fill="#9b6bff" fontSize="10" fontWeight="bold" fontFamily="monospace">Register 2: |y ⊕ f(x)⟩</text>

          {/* Hidden String XOR Box */}
          <circle cx="100" cy="60" r="14" fill="#1e293b" stroke="#e05fce" strokeWidth={strokeW} />
          <text x="100" y="64" fill="#e05fce" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">⊕ s</text>
          <text x="100" y="112" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">Exponential Quantum Advantage</text>
        </svg>
      );

    case 9:
      // VQE: Parameterized Ansatz & Ground State Energy Convergence
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Energy Curve Potential */}
          <path d="M 30 30 Q 90 90, 105 85 T 175 30" stroke="#64748b" strokeWidth="1.5" fill="none" />
          {/* Ground state minimum indicator */}
          <circle cx="105" cy="85" r="5" fill="#35e0d8" stroke="#38bdf8" strokeWidth="2" className="animate-pulse" />
          <line x1="25" y1="85" x2="175" y2="85" stroke="#35e0d8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="30" y="80" fill="#35e0d8" fontSize="8" fontFamily="monospace">E₀ Ground State</text>

          {/* Parameter descent path */}
          <circle cx="45" cy="42" r="3" fill="#f59e0b" />
          <circle cx="65" cy="62" r="3" fill="#f59e0b" />
          <circle cx="85" cy="78" r="3" fill="#f59e0b" />
          <text x="100" y="110" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">⟨ψ(θ)|H|ψ(θ)⟩ Optimization</text>
        </svg>
      );

    case 10:
      // Shor's Algorithm: Period Finding r on Modular Function f(x) = a^x mod N
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Modular periodic wave */}
          <path d="M 25 75 Q 40 30 55 75 T 85 75 T 115 75 T 145 75 T 175 75" stroke="#35e0d8" strokeWidth={strokeW} fill="none" />
          <line x1="25" y1="75" x2="175" y2="75" stroke="#475569" strokeWidth="1" />

          {/* Period Marker (r) */}
          <line x1="55" y1="25" x2="115" y2="25" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="55" y1="20" x2="55" y2="30" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="115" y1="20" x2="115" y2="30" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="85" y="20" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Period r</text>

          <text x="100" y="100" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">f(x) = aˣ mod N</text>
          <text x="100" y="114" fill="#a78bfa" fontSize="8" fontFamily="monospace" textAnchor="middle">QFT Period Readout → RSA Factors</text>
        </svg>
      );

    case 11:
      // Quantum Error Correction: 3-Qubit Bit-Flip Code & Ancilla Syndromes
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Data Qubits (3 wires) */}
          <line x1="20" y1="30" x2="180" y2="30" stroke="#35e0d8" strokeWidth="1.5" />
          <line x1="20" y1="50" x2="180" y2="50" stroke="#35e0d8" strokeWidth="1.5" />
          <line x1="20" y1="70" x2="180" y2="70" stroke="#35e0d8" strokeWidth="1.5" />
          <text x="14" y="53" fill="#35e0d8" fontSize="8" fontFamily="monospace" textAnchor="end">Data</text>

          {/* Bit flip error X on middle qubit */}
          <rect x="75" y="42" width="16" height="16" rx="3" fill="#ef4444" stroke="#f87171" strokeWidth="1" />
          <text x="83" y="54" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">X</text>

          {/* Ancilla Wires for Parity Syndromes */}
          <line x1="20" y1="90" x2="180" y2="90" stroke="#9b6bff" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="14" y="93" fill="#9b6bff" fontSize="8" fontFamily="monospace" textAnchor="end">Anc</text>

          {/* Syndrome parity measurements */}
          <circle cx="115" cy="50" r="3" fill="#9b6bff" />
          <line x1="115" y1="50" x2="115" y2="90" stroke="#9b6bff" strokeWidth="1.5" />
          <circle cx="115" cy="90" r="4" fill="#9b6bff" />
          <text x="115" y="105" fill="#9b6bff" fontSize="8" fontFamily="monospace" textAnchor="middle">Z₁Z₂</text>

          {/* Recovery Correction */}
          <rect x="145" y="42" width="16" height="16" rx="3" fill="#10b981" stroke="#34d399" strokeWidth="1" />
          <text x="153" y="54" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">X</text>
          <text x="100" y="116" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">Syndrome Detection & Correction</text>
        </svg>
      );

    case 12:
      // HHL Algorithm: Quantum Linear System Solver Ax = b & Eigenvalue Inversion
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Matrix System Ax = b */}
          <rect x="25" y="30" width="35" height="50" rx="4" fill="rgba(53, 224, 216, 0.1)" stroke="#35e0d8" strokeWidth={strokeW} />
          <text x="42" y="50" fill="#35e0d8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">|b⟩</text>
          <text x="42" y="65" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Input</text>

          {/* QPE Block */}
          <rect x="70" y="30" width="35" height="50" rx="4" fill="rgba(77, 124, 254, 0.1)" stroke="#4d7cfe" strokeWidth={strokeW} />
          <text x="87" y="50" fill="#4d7cfe" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">QPE</text>
          <text x="87" y="65" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">λⱼ Exp</text>

          {/* Controlled Rotation R_y(C/λ) */}
          <rect x="115" y="30" width="35" height="50" rx="4" fill="rgba(155, 107, 255, 0.1)" stroke="#9b6bff" strokeWidth={strokeW} />
          <text x="132" y="48" fill="#9b6bff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">R_y</text>
          <text x="132" y="63" fill="#e05fce" fontSize="8" fontFamily="monospace" textAnchor="middle">1/λⱼ</text>

          {/* Output State |x⟩ */}
          <circle cx="170" cy="55" r="14" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth={strokeW} />
          <text x="170" y="59" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">|x⟩</text>
          <text x="100" y="110" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">A⁻¹|b⟩ Linear System Solution</text>
        </svg>
      );

    default:
      return null;
  }
}

export function QuantumLevelVisual({
  level,
  size = "md",
  className = "",
  showBadge = true,
}: QuantumLevelVisualProps) {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Height mappings based on size
  const heightClasses = {
    sm: "h-24 min-h-[96px]",
    md: "h-36 min-h-[144px]",
    lg: "h-56 min-h-[224px]",
    hero: "h-72 min-h-[288px]",
  };

  const hasVideo = Boolean(level.video && !videoError);
  const hasImage = Boolean(level.image);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-line/60 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-850 shadow-inner group ${heightClasses[size]} ${className}`}
    >
      {/* Background Subtle Quantum Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#35e0d8_1px,transparent_1px)] [background-size:16px_16px]"
        aria-hidden="true"
      />

      {/* 1. Video Asset Rendering (if available, e.g. Level 8 Simon's Algorithm) */}
      {hasVideo ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <video
            src={level.video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={`${level.title} quantum algorithm demonstration video`}
            onError={() => setVideoError(true)}
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              videoLoaded ? "opacity-90 group-hover:opacity-100" : "opacity-0"
            }`}
          />
          {!videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <ScientificSchematic levelNum={level.n} size={size} />
            </div>
          )}
        </div>
      ) : hasImage ? (
        /* 2. Image Asset Rendering */
        <img
          src={level.image}
          alt={`${level.title} algorithm visual representation`}
          loading="lazy"
          className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        /* 3. Scientific Quantum SVG Schematic Rendering */
        <div className="absolute inset-0 flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-[1.02]">
          <ScientificSchematic levelNum={level.n} size={size} />
        </div>
      )}

      {/* Decorative Corner Accents */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-quantum-cyan/80 animate-pulse" />
        <span className="font-mono text-[10px] tracking-wider text-txt-faint uppercase">
          L{level.n.toString().padStart(2, "0")} · {level.algorithm.split(" ")[0]}
        </span>
      </div>

      {showBadge && (
        <div className="absolute bottom-2 right-2 rounded-md bg-ink-950/80 px-2 py-0.5 border border-line/40 backdrop-blur-sm text-[10px] font-mono text-quantum-cyan/90">
          {hasVideo ? "🎥 Simulation Video" : "⚛️ Quantum Topology"}
        </div>
      )}
    </div>
  );
}

export default QuantumLevelVisual;
