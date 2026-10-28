"use client";

import React, { useMemo } from "react";
import {
  Flame,
  Download,
  Clock,
  Gauge,
  Activity,
  Fuel,
  Calendar,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import {
  generateDgRecords,
} from "@/lib/energy/yield-reports-service";

interface DgGenerationReportProps {
  site: SiteRecord;
  startDate: string;
  endDate: string;
  className?: string;
}

export function DgGenerationReport({
  site,
  startDate,
  endDate,
  className = "",
}: DgGenerationReportProps) {
  const records = useMemo(() => {
    return generateDgRecords(site, startDate, endDate);
  }, [site, startDate, endDate]);

  // Aggregate KPI metrics
  const totalYieldKwh = useMemo(() => {
    return records.reduce((acc, r) => acc + r.generationYieldKwh, 0);
  }, [records]);

  const totalRunHours = useMemo(() => {
    return records.reduce((acc, r) => acc + r.runHours, 0);
  }, [records]);

  const totalFuelLiters = useMemo(() => {
    return records.reduce((acc, r) => acc + r.fuelConsumedLiters, 0);
  }, [records]);

  const peakPowerKw = useMemo(() => {
    return Math.max(...records.map((r) => r.peakPowerKw), 0);
  }, [records]);

  const avgSpecificFuel = totalYieldKwh > 0 ? Number((totalFuelLiters / totalYieldKwh).toFixed(2)) : 0.28;

  // CSV Export
  const handleExportCsv = () => {
    let csv = "Date,Run_Hours,Generation_Yield_kWh,Peak_Power_kW,Fuel_Consumed_Liters,Specific_Fuel_Rate_L_per_kWh,Fuel_Efficiency_kWh_per_L,Status\n";
    records.forEach((r) => {
      csv += `${r.date},${r.runHours},${r.generationYieldKwh},${r.peakPowerKw},${r.fuelConsumedLiters},${r.specificFuelRateLPerKwh},${r.fuelEfficiencyKwhPerLiter},${r.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `DG_Generation_Report_${startDate}_to_${endDate}.csv`
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
          <Flame className="size-4 text-[#FF6B00]" />
          <div>
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              Diesel Generator (DG) Auxiliary Backup Report
            </h4>
            <p className="text-[10px] text-theme-muted">
              Grid failure dispatch logs, fuel burn curves &amp; specific fuel consumption (L/kWh)
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-theme-primary border border-white/10 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <Download className="size-3.5" />
          <span>Export DG CSV</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Total DG Generation
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FF6B00]">
              {totalYieldKwh.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">kWh</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 block">
            Peak output: {peakPowerKw.toFixed(1)} kW
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Operational Run Hours
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-theme-primary">
              {totalRunHours.toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">hrs</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 flex items-center gap-1">
            <Clock className="size-2.5" />
            Automatic AMF synchronized
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Diesel Fuel Consumed
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-rose-400">
              {totalFuelLiters.toFixed(1)}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">Liters</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 flex items-center gap-1">
            <Fuel className="size-2.5" />
            Fuel rate: {avgSpecificFuel} L/kWh
          </span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle">
          <span className="text-[10px] text-theme-secondary uppercase block">
            Fuel Efficiency
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#00E676]">
              {totalFuelLiters > 0 ? (totalYieldKwh / totalFuelLiters).toFixed(2) : "3.57"}
            </span>
            <span className="text-[10px] text-theme-muted font-bold">kWh/L</span>
          </div>
          <span className="text-[9px] text-theme-muted mt-0.5 flex items-center gap-1">
            <Gauge className="size-2.5 text-[#00E676]" />
            BS-IV Tier compliant
          </span>
        </div>
      </div>

      {/* Visual Bar Chart: DG Generation & Fuel Burn */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[#FF6B00]" />
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              DG Emergency Dispatch Profile (Orange = kWh Yield, Amber = Fuel Liters)
            </h4>
          </div>
          <span className="text-[10px] text-theme-muted flex items-center gap-1">
            <Calendar className="size-3" />
            {startDate} to {endDate}
          </span>
        </div>

        <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-4 px-2 overflow-x-auto no-scrollbar">
          {records.slice(0, 24).map((r, i) => {
            const maxHeight = Math.max(...records.map((rec) => rec.generationYieldKwh), 60);
            const heightPct = r.generationYieldKwh > 0
              ? Math.max(14, Math.round((r.generationYieldKwh / maxHeight) * 100))
              : 4;

            return (
              <div
                key={`${r.date}-${i}`}
                className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-1 group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                {r.generationYieldKwh > 0 ? (
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center p-1.5 rounded bg-black/90 text-white text-[9px] whitespace-nowrap border border-white/20 shadow-lg pointer-events-none">
                    <span className="font-bold text-[#FF6B00]">{r.generationYieldKwh} kWh • {r.runHours} hrs</span>
                    <span className="text-theme-muted">Fuel: {r.fuelConsumedLiters} L • {r.dayLabel}</span>
                  </div>
                ) : null}

                <div
                  className={`w-full rounded-t-sm transition-all group-hover:brightness-125 ${
                    r.generationYieldKwh > 0
                      ? "bg-gradient-to-t from-[#FF6B00]/40 to-[#FF6B00]"
                      : "bg-white/5"
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

      {/* Granular Table */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle overflow-hidden">
        <div className="p-3 border-b border-theme-subtle/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-theme-primary uppercase">
            Diesel Generator Dispatch Logs
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
                <th className="py-2.5 px-3 text-right">Run Hours</th>
                <th className="py-2.5 px-3 text-right">Energy Yield (kWh)</th>
                <th className="py-2.5 px-3 text-right">Peak Power (kW)</th>
                <th className="py-2.5 px-3 text-right">Fuel Burned (L)</th>
                <th className="py-2.5 px-3 text-right">Specific Fuel (L/kWh)</th>
                <th className="py-2.5 px-3 text-right">Efficiency (kWh/L)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 text-[11px]">
              {records.map((r, i) => (
                <tr key={`${r.date}-${i}`} className="hover:bg-theme-elevated/30 transition-colors">
                  <td className="py-2 px-3 font-semibold text-theme-primary">{r.date}</td>
                  <td className="py-2 px-3 text-right text-theme-secondary">
                    {r.runHours > 0 ? `${r.runHours.toFixed(1)} hrs` : "0.0 hrs"}
                  </td>
                  <td className="py-2 px-3 text-right font-black text-[#FF6B00]">
                    {r.generationYieldKwh > 0 ? `${r.generationYieldKwh.toFixed(1)} kWh` : "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-black text-theme-primary">
                    {r.peakPowerKw > 0 ? `${r.peakPowerKw.toFixed(1)} kW` : "—"}
                  </td>
                  <td className="py-2 px-3 text-right text-rose-400">
                    {r.fuelConsumedLiters > 0 ? `${r.fuelConsumedLiters.toFixed(1)} L` : "—"}
                  </td>
                  <td className="py-2 px-3 text-right text-theme-muted">
                    {r.specificFuelRateLPerKwh > 0 ? `${r.specificFuelRateLPerKwh.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-2 px-3 text-right text-[#00E676]">
                    {r.fuelEfficiencyKwhPerLiter > 0 ? `${r.fuelEfficiencyKwhPerLiter.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                        r.status === "Operational"
                          ? "bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30"
                          : "bg-white/5 text-theme-muted border border-white/10"
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
