"use client";

import React, { useMemo } from "react";
import {
  CalendarDays,
  Download,
  Activity,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import {
  generateMonthlyGenerationRecords,
} from "@/lib/energy/yield-reports-service";

interface MonthlyGenerationTableProps {
  site: SiteRecord;
  className?: string;
}

export function MonthlyGenerationTable({
  site,
  className = "",
}: MonthlyGenerationTableProps) {
  const records = useMemo(() => {
    return generateMonthlyGenerationRecords(site);
  }, [site]);

  // Aggregate annual summaries
  const totalSolarKwh = records.reduce((acc, r) => acc + r.solarTotalKwh, 0);
  const totalExportKwh = records.reduce((acc, r) => acc + r.gridExportKwh, 0);
  const totalImportKwh = records.reduce((acc, r) => acc + r.gridImportKwh, 0);
  const totalDgKwh = records.reduce((acc, r) => acc + r.dgYieldKwh, 0);
  const totalRevenue = records.reduce((acc, r) => acc + r.solarRevenueInr, 0);
  const totalCo2 = records.reduce((acc, r) => acc + r.avoidedCo2Tonnes, 0);

  // CSV Export
  const handleExportCsv = () => {
    let csv = "Month,Solar_Total_kWh,Solar_Total_MWh,INV_01_kWh,INV_02_kWh,Grid_Export_kWh,Grid_Import_kWh,DG_Yield_kWh,Peak_Solar_kW,Specific_Yield_kWh_per_kWp,PR_Pct,Solar_Revenue_INR,Avoided_CO2_Tonnes\n";
    records.forEach((r) => {
      csv += `${r.monthName},${r.solarTotalKwh},${r.solarTotalMwh},${r.inv1Kwh},${r.inv2Kwh},${r.gridExportKwh},${r.gridImportKwh},${r.dgYieldKwh},${r.peakSolarKw},${r.specificYieldKwhPerKwp},${r.performanceRatioPct}%,₹${r.solarRevenueInr},${r.avoidedCo2Tonnes}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Monthly_Generation_Report_${site.name.replace(/\s+/g, "_")}_2026.csv`
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
          <CalendarDays className="size-4 text-[#FF2A85]" />
          <div>
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              12-Month Historical Generation &amp; Dispatch Ledger (Jan – Dec 2026)
            </h4>
            <p className="text-[10px] text-theme-muted">
              Consolidated month-wise breakdown across Solar Inverters, Grid Export/Import, and DG backup
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-theme-primary border border-white/10 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <Download className="size-3.5" />
          <span>Export 12-Month CSV</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Annual Solar Yield
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FFD600]">
              {(totalSolarKwh / 1000).toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">MWh</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            ({totalSolarKwh.toLocaleString("en-IN")} kWh)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Grid Net Energy Export
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#00E676]">
              {(totalExportKwh / 1000).toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">MWh</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            Import: {(totalImportKwh / 1000).toFixed(1)} MWh
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Annual Solar Revenue
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FF2A85]">
              ₹{(totalRevenue / 100000).toFixed(2)} L
            </span>
            <span className="text-[10px] text-theme-muted font-bold">INR</span>
          </div>
          <span className="text-[9px] text-[#00E676] mt-0.5 flex items-center gap-1">
            <TrendingUp className="size-2.5" />
            Feed-in tariff ₹{Number(site.feed_in_tariff_inr ?? 5.5).toFixed(2)}/kWh
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Carbon Emissions Avoided
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-cyan-400">
              {totalCo2.toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">Tonnes</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 flex items-center gap-1">
            <Sparkles className="size-2.5 text-cyan-400" />
            DG Run: {totalDgKwh} kWh total
          </span>
        </div>
      </div>

      {/* Visual Monthly Yield Curve */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[#FFD600]" />
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              12-Month Solar Yield Distribution (MWh per Month)
            </h4>
          </div>
          <span className="text-[10px] text-theme-muted">
            CY 2026 Production Baseline
          </span>
        </div>

        <div className="h-44 flex items-end gap-2 sm:gap-3 pt-4 px-2 overflow-x-auto no-scrollbar">
          {records.map((r, i) => {
            const maxVal = Math.max(...records.map((rec) => rec.solarTotalMwh), 20);
            const heightPct = Math.max(12, Math.round((r.solarTotalMwh / maxVal) * 100));

            return (
              <div
                key={`${r.monthKey}-${i}`}
                className="flex-1 min-w-[36px] max-w-[64px] flex flex-col items-center gap-1 group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-14 z-20 hidden group-hover:flex flex-col items-center p-1.5 rounded bg-black/90 text-white text-[9px] whitespace-nowrap border border-white/20 shadow-lg pointer-events-none">
                  <span className="font-bold text-[#FFD600]">{r.monthName}: {r.solarTotalMwh} MWh</span>
                  <span className="text-[#00E676]">Export: {r.gridExportKwh} kWh • Revenue: ₹{r.solarRevenueInr.toLocaleString("en-IN")}</span>
                  <span className="text-theme-muted">INV-1: {r.inv1Kwh} kWh • INV-2: {r.inv2Kwh} kWh</span>
                </div>

                <span className="text-[8px] text-theme-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  {r.solarTotalMwh}M
                </span>
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-[#FFD600]/40 to-[#FFD600] group-hover:brightness-125 transition-all shadow-[0_0_8px_rgba(255,214,0,0.2)]"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[8px] text-theme-muted truncate w-full text-center">
                  {r.monthName.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 12-Month Granular Table */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle overflow-hidden">
        <div className="p-3 border-b border-theme-subtle/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-theme-primary uppercase">
            12-Month Production Ledger
          </h4>
          <span className="text-[10px] text-theme-muted">
            12 monthly fiscal statements
          </span>
        </div>

        <div className="overflow-x-auto max-h-[380px] no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-elevated/80 text-[10px] text-theme-secondary uppercase sticky top-0 backdrop-blur z-10 border-b border-theme-subtle">
              <tr>
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3 text-right">Total Solar (kWh)</th>
                <th className="py-2.5 px-3 text-right">Total Solar (MWh)</th>
                <th className="py-2.5 px-3 text-right">INV-01 (kWh)</th>
                <th className="py-2.5 px-3 text-right">INV-02 (kWh)</th>
                <th className="py-2.5 px-3 text-right">Grid Export (kWh)</th>
                <th className="py-2.5 px-3 text-right">Grid Import (kWh)</th>
                <th className="py-2.5 px-3 text-right">DG Yield (kWh)</th>
                <th className="py-2.5 px-3 text-right">Revenue (₹)</th>
                <th className="py-2.5 px-3 text-right">CO₂ (T)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 text-[11px]">
              {records.map((r, i) => (
                <tr key={`${r.monthKey}-${i}`} className="hover:bg-theme-elevated/30 transition-colors">
                  <td className="py-2 px-3 font-bold text-theme-primary">{r.monthName}</td>
                  <td className="py-2 px-3 text-right font-black text-[#FFD600]">
                    {r.solarTotalKwh.toLocaleString("en-IN")} kWh
                  </td>
                  <td className="py-2 px-3 text-right font-black text-theme-primary">
                    {r.solarTotalMwh} MWh
                  </td>
                  <td className="py-2 px-3 text-right text-theme-secondary">
                    {r.inv1Kwh.toLocaleString("en-IN")} kWh
                  </td>
                  <td className="py-2 px-3 text-right text-theme-secondary">
                    {r.inv2Kwh.toLocaleString("en-IN")} kWh
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-[#00E676]">
                    {r.gridExportKwh.toLocaleString("en-IN")} kWh
                  </td>
                  <td className="py-2 px-3 text-right text-theme-secondary">
                    {r.gridImportKwh.toLocaleString("en-IN")} kWh
                  </td>
                  <td className="py-2 px-3 text-right text-[#FF6B00]">
                    {r.dgYieldKwh > 0 ? `${r.dgYieldKwh} kWh` : "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-black text-[#FF2A85]">
                    ₹{r.solarRevenueInr.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-right text-cyan-400">{r.avoidedCo2Tonnes} T</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
