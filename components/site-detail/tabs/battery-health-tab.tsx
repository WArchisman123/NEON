"use client";

import React from "react";
import { SiteRecord } from "@/lib/energy/types";

interface BatteryHealthTabProps {
  site: SiteRecord;
}

export function BatteryHealthTab({ site }: BatteryHealthTabProps) {
  const sohPct = Number(site.bess_soh_pct || 98.3);

  const kpis = [
    { label: "Health Score", val: "97.9 / 100", color: "text-[#00E676]" },
    { label: "Average SOH", val: `${sohPct}%`, color: "text-[#00E676]" },
    { label: "Pred. Life", val: "5.8 Years", color: "text-cyan-400" },
    { label: "Cycle Count", val: "10,666", color: "text-theme-primary" },
    { label: "Degradation", val: "0.12 %/mo", color: "text-amber-400" },
    { label: "Weak Cells", val: "12 Cells", color: "text-[#FF1744]" },
    { label: "Thermal Risk", val: "Low (Safe)", color: "text-[#00E676]" },
    { label: "Maint Priority", val: "Medium", color: "text-amber-400" },
  ];

  const weakCells = [
    { rank: 1, loc: "Rack-02 / Cell-017", issue: "High Imbalance (4.2%)", severity: "Critical", soh: "80.3%" },
    { rank: 2, loc: "Rack-01 / Cell-005", issue: "High Temp Spread", severity: "High", soh: "82.7%" },
    { rank: 3, loc: "Rack-03 / Cell-022", issue: "Capacity Fade", severity: "High", soh: "85.1%" },
    { rank: 4, loc: "Rack-02 / Cell-014", issue: "Voltage Drift (74mV)", severity: "Medium", soh: "86.8%" },
    { rank: 5, loc: "Rack-04 / Cell-009", issue: "Passive Balancing Lag", severity: "Low", soh: "89.2%" },
  ];

  const racks = [
    { id: "Rack-01", score: 96.4, soh: 98.1, ratedAh: 560, actualAh: 549, cycles: 10650, tempSpread: 2.1, status: "Good" },
    { id: "Rack-02", score: 88.2, soh: 94.5, ratedAh: 560, actualAh: 529, cycles: 10712, tempSpread: 4.8, status: "Attention" },
    { id: "Rack-03", score: 94.0, soh: 97.2, ratedAh: 560, actualAh: 544, cycles: 10660, tempSpread: 2.4, status: "Good" },
    { id: "Rack-04", score: 97.8, soh: 98.9, ratedAh: 560, actualAh: 554, cycles: 10640, tempSpread: 1.8, status: "Good" },
  ];

  // 7-Year RUL Decay curve data points down to 70% EOL threshold
  const rulPoints = [
    { year: "2026", soh: 98.3 },
    { year: "2027", soh: 95.1 },
    { year: "2028", soh: 91.8 },
    { year: "2029", soh: 88.0 },
    { year: "2030", soh: 83.5 },
    { year: "2031", soh: 78.4 },
    { year: "2032", soh: 73.1 },
    { year: "2033 (EOL)", soh: 70.0 },
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200 font-mono">
      {/* 1. Health & Life Expectancy Strip (8 Items) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {kpis.map((k, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
            <span className="text-[10px] text-theme-secondary uppercase truncate">{k.label}</span>
            <span className={`text-sm font-black mt-1 ${k.color}`}>{k.val}</span>
          </div>
        ))}
      </div>

      {/* 2. Degradation & RUL Horizon Curve + Prescriptive Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RUL Projection Curve */}
        <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
            <div>
              <h3 className="text-xs font-bold text-theme-primary uppercase">
                Predicted Remaining Useful Life (RUL Decay)
              </h3>
              <p className="text-[10px] text-theme-secondary">
                Linear & calendar degradation to 70% End-of-Life (EOL)
              </p>
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
              70% EOL Cutoff
            </span>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-2 p-3 rounded-lg bg-theme-elevated/40 border border-theme-subtle">
            {rulPoints.map((pt, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                <span className="text-[9px] text-cyan-400 font-bold mb-1">{pt.soh}%</span>
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm transition-all duration-300"
                  style={{ height: `${(pt.soh / 100) * 100}%` }}
                />
                <span className="text-[9px] text-theme-muted truncate w-full text-center">
                  {pt.year}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-theme-muted">
            <span>Nominal Capacity: 560 Ah</span>
            <span className="text-[#00E676] font-bold">Current Status: {sohPct}% SOH</span>
            <span>Target Horizon: 7.2 Years</span>
          </div>
        </div>

        {/* Prescriptive Work Orders */}
        <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
          <div className="border-b border-theme-subtle pb-2">
            <h3 className="text-xs font-bold text-theme-primary uppercase">
              Automated Prescriptive Maintenance
            </h3>
            <p className="text-[10px] text-theme-secondary">
              Direct actionable work orders generated from BMS telemetry
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">Cell Balancing Required</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                  MEDIUM
                </span>
              </div>
              <p className="text-[11px] text-theme-secondary mt-1">
                Rack-02 exhibits 4.2% cell imbalance (ΔV: 74mV). Schedule active/passive equalization.
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 cursor-pointer shrink-0"
            >
              Schedule
            </button>
          </div>

          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-400">Inspect Thermal Variance</span>
                <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                  CRITICAL
                </span>
              </div>
              <p className="text-[11px] text-theme-secondary mt-1">
                Cell-005 in Rack-01 is 4.8°C hotter than rack median. Coolant flush recommended.
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-[#FF2A85] text-white font-bold text-xs hover:bg-[#FF2A85]/90 cursor-pointer shrink-0"
            >
              Work Order
            </button>
          </div>

          <div className="p-3 rounded-lg bg-theme-elevated border border-theme-subtle flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-theme-primary block">SoC Calibration Cycle</span>
              <p className="text-[11px] text-theme-secondary mt-1">
                Pack has operated within 20-80% window for 30 days. Full 100% calibration cycle due.
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-theme-card border border-theme-subtle text-theme-secondary text-xs hover:text-theme-primary cursor-pointer shrink-0"
            >
              Defer
            </button>
          </div>
        </div>
      </div>

      {/* 3. Weak Cells (Top 5) Diagnostic Ranking */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
          <div>
            <h3 className="text-xs font-bold text-theme-primary uppercase">
              Top Weak Cell Ranking & Impedance Degradation
            </h3>
            <p className="text-[10px] text-theme-secondary">
              Individual cell health telemetry prioritized by risk severity
            </p>
          </div>
          <span className="text-[10px] text-[#FF1744] font-bold">
            12 Outlier Cells Detected
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar rounded-lg border border-theme-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-elevated text-theme-muted uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">Rank</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Anomaly Issue</th>
                <th className="py-2 px-3">Severity</th>
                <th className="py-2 px-3">Cell SOH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 bg-theme-card">
              {weakCells.map((c) => (
                <tr key={c.rank} className="hover:bg-theme-elevated/40">
                  <td className="py-2 px-3 font-bold text-theme-secondary">#{c.rank}</td>
                  <td className="py-2 px-3 font-bold text-theme-primary">{c.loc}</td>
                  <td className="py-2 px-3 text-amber-400 font-semibold">{c.issue}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        c.severity === "Critical"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : c.severity === "High"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-theme-primary">{c.soh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Pack / Rack Health Summary Table */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
        <h3 className="text-xs font-bold text-theme-primary uppercase border-b border-theme-subtle pb-2">
          Rack-Level Telemetry Breakdown
        </h3>
        <div className="overflow-x-auto no-scrollbar rounded-lg border border-theme-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-elevated text-theme-muted uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">Rack ID</th>
                <th className="py-2 px-3">Health Score</th>
                <th className="py-2 px-3">SOH (%)</th>
                <th className="py-2 px-3">Actual / Rated Ah</th>
                <th className="py-2 px-3">Cycles</th>
                <th className="py-2 px-3">Temp Spread</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 bg-theme-card">
              {racks.map((r) => (
                <tr key={r.id} className="hover:bg-theme-elevated/40">
                  <td className="py-2 px-3 font-bold text-theme-primary">{r.id}</td>
                  <td className="py-2 px-3 font-bold text-[#00E676]">{r.score}</td>
                  <td className="py-2 px-3 font-bold text-cyan-400">{r.soh}%</td>
                  <td className="py-2 px-3 text-theme-secondary">{r.actualAh} / {r.ratedAh} Ah</td>
                  <td className="py-2 px-3 text-theme-secondary">{r.cycles}</td>
                  <td className="py-2 px-3 text-amber-400">{r.tempSpread} °C</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        r.status === "Good"
                          ? "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
