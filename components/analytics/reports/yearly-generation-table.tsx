"use client";

import React, { useMemo } from "react";
import {
  CalendarRange,
  Download,
  Target,
  CheckCircle2,
  Leaf,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import {
  generateYearlyGenerationRecords,
} from "@/lib/energy/yield-reports-service";

interface YearlyGenerationTableProps {
  site: SiteRecord;
  className?: string;
}

export function YearlyGenerationTable({
  site,
  className = "",
}: YearlyGenerationTableProps) {
  const records = useMemo(() => {
    return generateYearlyGenerationRecords(site);
  }, [site]);

  // Total Lifetime Accumulation
  const lifetimeActualMwh = records.reduce((acc, r) => acc + r.actualMwh, 0);
  const lifetimeExportMwh = records.reduce((acc, r) => acc + r.gridExportMwh, 0);
  const lifetimeRevenueLakhs = records.reduce((acc, r) => acc + r.revenueInrLakhs, 0);
  const lifetimeCo2Tonnes = records.reduce((acc, r) => acc + r.carbonOffsetTonnes, 0);

  // CSV Export
  const handleExportCsv = () => {
    let csv = "Year,Target_MWh,Actual_Generation_MWh,Achievement_Rate_Pct,Solar_Yield_MWh,Grid_Export_MWh,DG_Yield_MWh,Degradation_Pct,Revenue_INR_Lakhs,Carbon_Offset_Tonnes,Status\n";
    records.forEach((r) => {
      csv += `${r.year},${r.targetMwh},${r.actualMwh},${r.achievementPct}%,${r.solarYieldMwh},${r.gridExportMwh},${r.dgYieldMwh},${r.degradationPct}%,₹${r.revenueInrLakhs}L,${r.carbonOffsetTonnes},${r.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Yearly_Generation_Report_${site.name.replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-4 font-mono ${className}`}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-4 text-cyan-400" />
          <div>
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              Multi-Year Generation Audit &amp; Degradation Index
            </h4>
            <p className="text-[10px] text-theme-muted">
              P50 baseline vs. achieved yields, cumulative grid exports, module degradation &amp; avoided carbon
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-theme-primary border border-white/10 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <Download className="size-3.5" />
          <span>Export Multi-Year CSV</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Cumulative Generation
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FFD600]">
              {lifetimeActualMwh.toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">MWh</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            ({(lifetimeActualMwh * 1000).toLocaleString("en-IN")} kWh)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Lifetime Grid Export
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#00E676]">
              {lifetimeExportMwh.toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">MWh</span>
          </div>
          <span className="text-[9px] text-[#00E676] mt-0.5 block">
            {(lifetimeExportMwh / lifetimeActualMwh * 100).toFixed(1)}% of total yield exported
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Cumulative Revenue
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FF2A85]">
              ₹{lifetimeRevenueLakhs.toFixed(2)} L
            </span>
            <span className="text-[10px] text-theme-muted font-bold">INR</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            Combined PPA &amp; net metering
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Lifetime Carbon Offset
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-cyan-400">
              {lifetimeCo2Tonnes.toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">Tonnes</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 flex items-center gap-1">
            <Leaf className="size-2.5 text-[#00E676]" />
            Verified ESG green credits
          </span>
        </div>
      </div>

      {/* Multi-Year Progress Comparison Bars */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50 mb-3">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-[#FF2A85]" />
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              Target P50 vs. Actual Year-by-Year Generation (MWh)
            </h4>
          </div>
          <span className="text-[10px] text-theme-muted">
            Annual Target: {Number(site.annual_target_mwh ?? 165)} MWh
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {records.map((r) => {
            return (
              <div key={r.year} className="space-y-1.5 p-2.5 rounded-lg bg-theme-elevated/40 border border-theme-subtle">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-theme-primary text-sm">{r.year}</span>
                    <span className="text-[10px] text-theme-muted">
                      ({r.actualMwh} MWh / {r.targetMwh} MWh target)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#00E676]">{r.achievementPct}% Achieved</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                      {r.status}
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFD600] via-[#00F0FF] to-[#00E676] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, r.achievementPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-theme-muted pt-0.5">
                  <span>Export: {r.gridExportMwh} MWh • DG: {r.dgYieldMwh} MWh</span>
                  <span className="text-[#FF2A85] font-semibold">Revenue: ₹{r.revenueInrLakhs} Lakhs</span>
                  <span>Degradation: -{r.degradationPct}% (Tier-1 Pass)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Year Table */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle overflow-hidden">
        <div className="p-3 border-b border-theme-subtle/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-theme-primary uppercase">
            Yearly Generation Audit Table
          </h4>
          <span className="text-[10px] text-theme-muted">
            Audited financial and energy records
          </span>
        </div>

        <div className="overflow-x-auto max-h-[360px] no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-elevated/80 text-[10px] text-theme-secondary uppercase sticky top-0 backdrop-blur z-10 border-b border-theme-subtle">
              <tr>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3 text-right">Target (MWh)</th>
                <th className="py-2.5 px-3 text-right">Actual (MWh)</th>
                <th className="py-2.5 px-3 text-right">Achievement (%)</th>
                <th className="py-2.5 px-3 text-right">Grid Export (MWh)</th>
                <th className="py-2.5 px-3 text-right">DG Yield (MWh)</th>
                <th className="py-2.5 px-3 text-right">Degradation (%)</th>
                <th className="py-2.5 px-3 text-right">Revenue (₹ Lakhs)</th>
                <th className="py-2.5 px-3 text-right">CO₂ (Tonnes)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 text-[11px]">
              {records.map((r) => (
                <tr key={r.year} className="hover:bg-theme-elevated/30 transition-colors">
                  <td className="py-2.5 px-3 font-black text-theme-primary text-sm">{r.year}</td>
                  <td className="py-2.5 px-3 text-right text-theme-secondary">{r.targetMwh} MWh</td>
                  <td className="py-2.5 px-3 text-right font-black text-[#FFD600]">{r.actualMwh} MWh</td>
                  <td className="py-2.5 px-3 text-right font-black text-[#00E676]">{r.achievementPct}%</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#00E676]">{r.gridExportMwh} MWh</td>
                  <td className="py-2.5 px-3 text-right text-[#FF6B00]">{r.dgYieldMwh} MWh</td>
                  <td className="py-2.5 px-3 text-right text-theme-muted">-{r.degradationPct}%</td>
                  <td className="py-2.5 px-3 text-right font-black text-[#FF2A85]">₹{r.revenueInrLakhs} L</td>
                  <td className="py-2.5 px-3 text-right text-cyan-400">{r.carbonOffsetTonnes} T</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                      <CheckCircle2 className="size-2.5" />
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
