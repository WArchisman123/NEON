"use client";

import React, { useState, useMemo } from "react";
import {
  Cpu,
  Download,
  Gauge,
  TrendingUp,
  Activity,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import {
  generateInverterRecords,
} from "@/lib/energy/yield-reports-service";

interface InverterWiseReportProps {
  site: SiteRecord;
  startDate: string;
  endDate: string;
  className?: string;
}

export function InverterWiseReport({
  site,
  startDate,
  endDate,
  className = "",
}: InverterWiseReportProps) {
  const [selectedInverter, setSelectedInverter] = useState<"all" | "INV-01" | "INV-02">("all");

  const records = useMemo(() => {
    return generateInverterRecords(site, startDate, endDate, selectedInverter);
  }, [site, startDate, endDate, selectedInverter]);

  // Aggregate KPI metrics
  const totalYieldKwh = useMemo(() => {
    return records.reduce((acc, r) => acc + r.totalYieldKwh, 0);
  }, [records]);

  const peakPowerKw = useMemo(() => {
    return Math.max(...records.map((r) => r.peakPowerKw), 0);
  }, [records]);

  const avgEfficiency = useMemo(() => {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + r.efficiencyPct, 0);
    return Number((sum / records.length).toFixed(1));
  }, [records]);

  const avgSpecificYield = useMemo(() => {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + r.specificYieldKwhPerKwp, 0);
    return Number((sum / records.length).toFixed(2));
  }, [records]);

  // CSV Export
  const handleExportCsv = () => {
    let csv = "Date,Inverter_ID,Peak_Power_kW,Total_Yield_kWh,Efficiency_Pct,DC_Voltage_V,Specific_Yield_kWh_per_kWp,PR_Pct,Status\n";
    records.forEach((r) => {
      csv += `${r.date},${r.inverterId},${r.peakPowerKw},${r.totalYieldKwh},${r.efficiencyPct}%,${r.dcVoltageV},${r.specificYieldKwhPerKwp},${r.performanceRatioPct}%,${r.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Inverter_Report_${selectedInverter}_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-4 font-mono ${className}`}>
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-[#FFD600]" />
          <span className="text-xs font-bold text-theme-primary uppercase">
            Inverter Selection:
          </span>
          <div className="flex rounded-lg bg-theme-elevated p-1 border border-theme-subtle">
            {(["all", "INV-01", "INV-02"] as const).map((inv) => (
              <button
                key={inv}
                onClick={() => setSelectedInverter(inv)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  selectedInverter === inv
                    ? "bg-[#FFD600] text-black shadow-xs"
                    : "text-theme-secondary hover:text-theme-primary"
                }`}
              >
                {inv === "all" ? "All Inverters" : inv}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-theme-primary border border-white/10 text-xs font-bold transition-all"
        >
          <Download className="size-3.5" />
          <span>Export Inverter CSV</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Total Yield (Period)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FFD600]">
              {totalYieldKwh.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">kWh</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            ({(totalYieldKwh / 1000).toFixed(2)} MWh)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Peak Active Generation
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-theme-primary">
              {peakPowerKw.toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">kW</span>
          </div>
          <span className="text-[9px] text-[#00E676] mt-0.5 flex items-center gap-0.5">
            <TrendingUp className="size-2.5" />
            Rated capacity 100 kWp
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Mean Conversion Efficiency
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#00E676]">
              {avgEfficiency}%
            </span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 flex items-center gap-0.5">
            <Gauge className="size-2.5 text-[#00E676]" />
            MPPT Euro-weighted
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Average Specific Yield
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-cyan-400">
              {avgSpecificYield}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">kWh/kWp</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            PR 82.1% normalized
          </span>
        </div>
      </div>

      {/* Visual Bar Chart: Daily Generation per Inverter */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[#FFD600]" />
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              Daily Inverter Generation Profile (kW Peak vs. kWh Yield)
            </h4>
          </div>
          <span className="text-[10px] text-theme-muted flex items-center gap-1">
            <Calendar className="size-3" />
            {startDate} to {endDate}
          </span>
        </div>

        <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-4 px-2 overflow-x-auto no-scrollbar">
          {records.slice(0, 24).map((r, i) => {
            const maxYield = Math.max(...records.map((rec) => rec.totalYieldKwh), 100);
            const heightPct = Math.max(12, Math.round((r.totalYieldKwh / maxYield) * 100));

            return (
              <div
                key={`${r.date}-${r.inverterId}-${i}`}
                className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-1 group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center p-1.5 rounded bg-black/90 text-white text-[9px] whitespace-nowrap border border-white/20 shadow-lg pointer-events-none">
                  <span className="font-bold text-[#FFD600]">{r.inverterId}: {r.totalYieldKwh} kWh</span>
                  <span className="text-theme-muted">Peak: {r.peakPowerKw} kW • {r.dayLabel}</span>
                </div>

                <span className="text-[8px] text-theme-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  {Math.round(r.totalYieldKwh)}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all group-hover:brightness-125 ${
                    r.inverterId === "INV-01"
                      ? "bg-gradient-to-t from-[#FFD600]/40 to-[#FFD600]"
                      : "bg-gradient-to-t from-cyan-500/40 to-cyan-400"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
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
            Inverter Daily Log Records
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
                <th className="py-2.5 px-3">Inverter ID</th>
                <th className="py-2.5 px-3 text-right">Current Peak (kW)</th>
                <th className="py-2.5 px-3 text-right">Energy Yield (kWh)</th>
                <th className="py-2.5 px-3 text-right">DC Voltage (V)</th>
                <th className="py-2.5 px-3 text-right">Efficiency (%)</th>
                <th className="py-2.5 px-3 text-right">Specific (kWh/kWp)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 text-[11px]">
              {records.map((r, i) => (
                <tr key={`${r.date}-${r.inverterId}-${i}`} className="hover:bg-theme-elevated/30 transition-colors">
                  <td className="py-2 px-3 font-semibold text-theme-primary">{r.date}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold text-[#FFD600]">
                      {r.inverterId}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-black text-theme-primary">
                    {r.peakPowerKw.toFixed(1)} kW
                  </td>
                  <td className="py-2 px-3 text-right font-black text-[#00E676]">
                    {r.totalYieldKwh.toFixed(1)} kWh
                  </td>
                  <td className="py-2 px-3 text-right text-theme-secondary">{r.dcVoltageV} V</td>
                  <td className="py-2 px-3 text-right font-bold text-[#00E676]">{r.efficiencyPct}%</td>
                  <td className="py-2 px-3 text-right text-cyan-400">{r.specificYieldKwhPerKwp}</td>
                  <td className="py-2 px-3 text-center">
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
