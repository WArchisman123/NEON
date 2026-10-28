"use client";

import React, { useMemo } from "react";
import {
  Radio,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Activity,
  Calendar,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import {
  generateGridMfmRecords,
} from "@/lib/energy/yield-reports-service";

interface GridMfmReportProps {
  site: SiteRecord;
  startDate: string;
  endDate: string;
  className?: string;
}

export function GridMfmReport({
  site,
  startDate,
  endDate,
  className = "",
}: GridMfmReportProps) {
  const records = useMemo(() => {
    return generateGridMfmRecords(site, startDate, endDate);
  }, [site, startDate, endDate]);

  // Aggregate KPI metrics
  const totalExportKwh = useMemo(() => {
    return records.reduce((acc, r) => acc + r.gridExportKwh, 0);
  }, [records]);

  const totalImportKwh = useMemo(() => {
    return records.reduce((acc, r) => acc + r.gridImportKwh, 0);
  }, [records]);

  const peakExportKw = useMemo(() => {
    return Math.max(...records.map((r) => r.peakExportKw), 0);
  }, [records]);

  const totalExportRevenue = useMemo(() => {
    return records.reduce((acc, r) => acc + r.exportRevenueInr, 0);
  }, [records]);

  const netBalanceKwh = totalExportKwh - totalImportKwh;

  // CSV Export
  const handleExportCsv = () => {
    let csv = "Date,Grid_Import_kWh,Grid_Export_kWh,Net_Balance_kWh,Peak_Export_kW,Peak_Import_kW,Export_Revenue_INR,Avg_Power_Factor,Grid_Freq_Hz\n";
    records.forEach((r) => {
      csv += `${r.date},${r.gridImportKwh},${r.gridExportKwh},${r.netBalanceKwh},${r.peakExportKw},${r.peakImportKw},₹${r.exportRevenueInr},${r.averagePowerFactor},${r.gridFrequencyHz}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Grid_MFM_Report_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-4 font-mono ${className}`}>
      {/* Top Banner: Keep existing Grid export data notice & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-[#9D4EDD]" />
          <div>
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              Grid MFM Revenue-Grade Metering &amp; Export Portal
            </h4>
            <p className="text-[10px] text-theme-muted">
              Preserved bidirectional tariff feeds, net-metering export logs &amp; phase telemetry
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-theme-primary border border-white/10 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <Download className="size-3.5" />
          <span>Export Grid MFM CSV</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-theme-secondary uppercase">
              Total Grid Export
            </span>
            <ArrowUpRight className="size-3 text-[#00E676]" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#00E676]">
              {totalExportKwh.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">kWh</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            ({(totalExportKwh / 1000).toFixed(2)} MWh exported)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-theme-secondary uppercase">
              Total Grid Import
            </span>
            <ArrowDownLeft className="size-3 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-theme-primary">
              {totalImportKwh.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">kWh</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            ({(totalImportKwh / 1000).toFixed(2)} MWh imported)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-theme-secondary uppercase">
              Peak Export Power
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-[#9D4EDD] font-bold">
              MFM Reg.
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#9D4EDD]">
              {peakExportKw.toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">kW</span>
          </div>
          <span className="text-[9px] text-[#00E676] mt-0.5 flex items-center gap-0.5">
            50.02 Hz synchronized
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-theme-secondary uppercase">
              Export Feed-in Credit
            </span>
            <Coins className="size-3 text-[#FFD600]" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FFD600]">
              ₹{totalExportRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">INR</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            Net: {netBalanceKwh >= 0 ? "+" : ""}{netBalanceKwh.toFixed(1)} kWh
          </span>
        </div>
      </div>

      {/* Visual Bar Chart: Bidirectional Grid Flow (Export vs Import) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[#9D4EDD]" />
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              Grid MFM Bidirectional Flow (Green = Export kWh, Blue = Import kWh)
            </h4>
          </div>
          <span className="text-[10px] text-theme-muted flex items-center gap-1">
            <Calendar className="size-3" />
            {startDate} to {endDate}
          </span>
        </div>

        <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-4 px-2 overflow-x-auto no-scrollbar">
          {records.slice(0, 24).map((r, i) => {
            const maxVal = Math.max(...records.map((rec) => Math.max(rec.gridExportKwh, rec.gridImportKwh)), 100);
            const exportHeight = Math.max(8, Math.round((r.gridExportKwh / maxVal) * 100));
            const importHeight = Math.max(8, Math.round((r.gridImportKwh / maxVal) * 100));

            return (
              <div
                key={`${r.date}-${i}`}
                className="flex-1 min-w-[32px] max-w-[54px] flex flex-col items-center gap-1 group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-14 z-20 hidden group-hover:flex flex-col items-center p-1.5 rounded bg-black/90 text-white text-[9px] whitespace-nowrap border border-white/20 shadow-lg pointer-events-none">
                  <span className="font-bold text-[#00E676]">Export: {r.gridExportKwh} kWh (₹{r.exportRevenueInr})</span>
                  <span className="text-cyan-400">Import: {r.gridImportKwh} kWh</span>
                  <span className="text-theme-muted">{r.dayLabel} • PF {r.averagePowerFactor}</span>
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-32">
                  {/* Export Bar */}
                  <div
                    className="w-1/2 rounded-t-sm bg-gradient-to-t from-[#00E676]/40 to-[#00E676] group-hover:brightness-125 transition-all"
                    style={{ height: `${exportHeight}%` }}
                    title={`Export: ${r.gridExportKwh} kWh`}
                  />
                  {/* Import Bar */}
                  <div
                    className="w-1/2 rounded-t-sm bg-gradient-to-t from-purple-500/40 to-[#9D4EDD] group-hover:brightness-125 transition-all"
                    style={{ height: `${importHeight}%` }}
                    title={`Import: ${r.gridImportKwh} kWh`}
                  />
                </div>
                <span className="text-[8px] text-theme-muted truncate w-full text-center">
                  {r.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Granular Telemetry Table */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle overflow-hidden">
        <div className="p-3 border-b border-theme-subtle/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-theme-primary uppercase">
            Grid MFM Daily Energy &amp; Power Log
          </h4>
          <span className="text-[10px] text-theme-muted">
            Showing {records.length} line items
          </span>
        </div>

        <div className="overflow-x-auto max-h-[360px] no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-elevated/80 text-[10px] text-theme-secondary uppercase sticky top-0 backdrop-blur z-10 border-b border-theme-subtle">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Grid Import (kWh)</th>
                <th className="py-2.5 px-3 text-right">Grid Export (kWh)</th>
                <th className="py-2.5 px-3 text-right">Net Balance (kWh)</th>
                <th className="py-2.5 px-3 text-right">Peak Export (kW)</th>
                <th className="py-2.5 px-3 text-right">Export Credit (₹)</th>
                <th className="py-2.5 px-3 text-right">Avg PF</th>
                <th className="py-2.5 px-3 text-center">Frequency (Hz)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 text-[11px]">
              {records.map((r, i) => (
                <tr key={`${r.date}-${i}`} className="hover:bg-theme-elevated/30 transition-colors">
                  <td className="py-2 px-3 font-semibold text-theme-primary">{r.date}</td>
                  <td className="py-2 px-3 text-right text-theme-secondary">
                    {r.gridImportKwh.toFixed(1)} kWh
                  </td>
                  <td className="py-2 px-3 text-right font-black text-[#00E676]">
                    {r.gridExportKwh.toFixed(1)} kWh
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-theme-primary">
                    {r.netBalanceKwh >= 0 ? "+" : ""}{r.netBalanceKwh.toFixed(1)} kWh
                  </td>
                  <td className="py-2 px-3 text-right font-black text-[#9D4EDD]">
                    {r.peakExportKw.toFixed(1)} kW
                  </td>
                  <td className="py-2 px-3 text-right font-black text-[#FFD600]">
                    ₹{r.exportRevenueInr.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-right text-theme-secondary">{r.averagePowerFactor}</td>
                  <td className="py-2 px-3 text-center text-[#00E676]">{r.gridFrequencyHz} Hz</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
