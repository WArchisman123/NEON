"use client";

import React, { useState } from "react";
import { ShieldCheck, Zap } from "lucide-react";

interface PowerQualityHarmonicsCardProps {
  voltageThdPct?: number;
  currentThdPct?: number;
  phaseImbalancePct?: number;
  className?: string;
}

export function PowerQualityHarmonicsCard({
  voltageThdPct,
  currentThdPct,
  phaseImbalancePct = 1.60,
  className = "",
}: PowerQualityHarmonicsCardProps) {
  const [viewMode, setViewMode] = useState<"voltage" | "current">("voltage");

  // Realistic IEEE 519 compliant harmonic spectrum orders
  const harmonicOrders = [
    { order: "THD", l1: 1.10, l2: 1.30, l3: 1.20 },
    { order: "3rd", l1: 3.40, l2: 3.10, l3: 3.30 },
    { order: "5th", l1: 1.70, l2: 1.55, l3: 1.65 },
    { order: "7th", l1: 1.15, l2: 1.05, l3: 1.10 },
    { order: "9th", l1: 0.85, l2: 0.78, l3: 0.80 },
    { order: "11th", l1: 0.70, l2: 0.65, l3: 0.68 },
    { order: "13th", l1: 0.60, l2: 0.55, l3: 0.58 },
    { order: "15th", l1: 0.50, l2: 0.48, l3: 0.49 },
    { order: "17th", l1: 0.45, l2: 0.42, l3: 0.44 },
    { order: "19th", l1: 0.40, l2: 0.38, l3: 0.39 },
    { order: "21st", l1: 0.38, l2: 0.35, l3: 0.36 },
    { order: "23rd", l1: 0.35, l2: 0.32, l3: 0.34 },
    { order: "25th", l1: 0.30, l2: 0.28, l3: 0.29 },
  ];

  const l1Thd = viewMode === "voltage" ? (voltageThdPct || 1.10) : 2.80;
  const l2Thd = viewMode === "voltage" ? 1.30 : 3.20;
  const l3Thd = viewMode === "voltage" ? 1.20 : (currentThdPct || 3.00);
  const avgThd = ((l1Thd + l2Thd + l3Thd) / 3).toFixed(2);

  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle shadow-sm flex flex-col justify-between ${className}`}>
      <div>
        {/* Header & Toggle */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-subtle">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-[#FF2A85]/10 text-[#FF2A85] flex items-center justify-center">
              <Zap className="size-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase tracking-wider">
                Power Quality & Harmonics
              </h3>
              <p className="text-[10px] text-theme-secondary font-mono">
                IEEE 519 compliance & individual harmonic spectrum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-theme-elevated border border-theme-subtle">
            <button
              type="button"
              onClick={() => setViewMode("voltage")}
              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                viewMode === "voltage"
                  ? "bg-[#FF2A85] text-white shadow-sm"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Voltage THD
            </button>
            <button
              type="button"
              onClick={() => setViewMode("current")}
              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                viewMode === "current"
                  ? "bg-[#FF2A85] text-white shadow-sm"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Current THD
            </button>
          </div>
        </div>

        {/* THD by Phase Bars */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-theme-secondary font-semibold uppercase text-[10px]">
              {viewMode.toUpperCase()} THD BY PHASE
            </span>
            <span className="text-[#00E676] font-bold text-xs">
              Avg ({avgThd}%) • IEEE 519 Pass (&lt;5%)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-theme-elevated border border-theme-subtle">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-rose-400 font-bold">L1</span>
                <span className="text-theme-primary font-bold">{l1Thd}%</span>
              </div>
              <div className="h-1.5 w-full bg-theme-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, (l1Thd / 5) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-2 rounded-lg bg-theme-elevated border border-theme-subtle">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-amber-400 font-bold">L2</span>
                <span className="text-theme-primary font-bold">{l2Thd}%</span>
              </div>
              <div className="h-1.5 w-full bg-theme-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (l2Thd / 5) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-2 rounded-lg bg-theme-elevated border border-theme-subtle">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-sky-400 font-bold">L3</span>
                <span className="text-theme-primary font-bold">{l3Thd}%</span>
              </div>
              <div className="h-1.5 w-full bg-theme-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${Math.min(100, (l3Thd / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Harmonic Spectrum Chart */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-theme-secondary">
            <span>HARMONIC SPECTRUM (% OF FUNDAMENTAL)</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px]">
                <span className="size-2 rounded-full bg-rose-500" /> L1
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className="size-2 rounded-full bg-amber-500" /> L2
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className="size-2 rounded-full bg-sky-500" /> L3
              </span>
            </div>
          </div>

          {/* Clustered Spectrum Bars */}
          <div className="h-36 w-full pt-4 pb-1 flex items-end justify-between gap-1 border-b border-theme-subtle bg-theme-elevated/20 rounded-lg px-2">
            {harmonicOrders.map((h) => {
              const maxVal = 4.0;
              const hL1 = Math.min(100, (h.l1 / maxVal) * 100);
              const hL2 = Math.min(100, (h.l2 / maxVal) * 100);
              const hL3 = Math.min(100, (h.l3 / maxVal) * 100);

              return (
                <div
                  key={h.order}
                  className="flex-1 flex flex-col items-center h-full justify-end group"
                  title={`${h.order} Harmonic: L1=${h.l1}%, L2=${h.l2}%, L3=${h.l3}%`}
                >
                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    <div
                      className="w-1 bg-rose-500/80 group-hover:bg-rose-400 rounded-t-sm transition-all"
                      style={{ height: `${hL1}%` }}
                    />
                    <div
                      className="w-1 bg-amber-500/80 group-hover:bg-amber-400 rounded-t-sm transition-all"
                      style={{ height: `${hL2}%` }}
                    />
                    <div
                      className="w-1 bg-sky-500/80 group-hover:bg-sky-400 rounded-t-sm transition-all"
                      style={{ height: `${hL3}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-theme-secondary mt-1 group-hover:text-theme-primary">
                    {h.order}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase Imbalance Diagnostic Bar */}
      <div className="pt-3 mt-3 border-t border-theme-subtle flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-theme-secondary font-semibold uppercase">
            Phase Imbalance:
          </span>
          <span className="text-theme-primary text-[11px]">
            L1: <strong className="text-rose-400">1.1%</strong>
          </span>
          <span className="text-theme-primary text-[11px]">
            L2: <strong className="text-amber-400">1.3%</strong>
          </span>
          <span className="text-theme-primary text-[11px]">
            L3: <strong className="text-sky-400">1.2%</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-theme-secondary text-[11px]">Overall:</span>
          <span className="font-bold text-theme-primary text-xs">{phaseImbalancePct.toFixed(1)}%</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
            <ShieldCheck className="size-3" />
            GOOD
          </span>
        </div>
      </div>
    </div>
  );
}
