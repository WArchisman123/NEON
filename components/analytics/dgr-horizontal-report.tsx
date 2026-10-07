"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  Printer,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface DgrReportProps {
  site: SiteRecord;
}

interface DailyRecord {
  date: string;
  dayTotalKwh: number;
  plantCumulativeKwh: number;
  inv01DayKwh: number;
  inv01CumulativeKwh: number;
  dgDayKwh: number;
  dgCumulativeKwh: number;
  invCount: number;
  pvDgFuelSavingKwh: number;
  cufPct: number;
  solarInsolation: number; // kWh/m2
  prPct: number;
  expectedGenKwh: number;
  peakIrradianceWm2: number;
  peakIrradianceTime: string;
  specificYield: number; // kWh/kWp
}

export function DgrHorizontalReport({ site }: DgrReportProps) {
  const [viewMode, setViewMode] = useState<"horizontal" | "vertical" | "charts">("horizontal");
  const [fromDate, setFromDate] = useState("2026-09-27");
  const [toDate, setToDate] = useState("2026-10-07");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate 11 days of realistic historical audit records matching ref_img_6 & ref_img_7
  const dailyRecords: DailyRecord[] = useMemo(() => {
    const rawData = [
      { date: "27-Sep-2026", gen: 323.39, dg: 0.0, cuf: 13.47, inso: 4.2, exp: 410, peak: 780, peakT: "12:30 PM" },
      { date: "28-Sep-2026", gen: 84.48, dg: 24.1, cuf: 3.52, inso: 1.8, exp: 420, peak: 320, peakT: "11:15 AM" }, // Rain/overcast day
      { date: "29-Sep-2026", gen: 474.40, dg: 1.43, cuf: 19.77, inso: 5.6, exp: 440, peak: 815, peakT: "12:40 PM" },
      { date: "30-Sep-2026", gen: 506.11, dg: 1.48, cuf: 21.09, inso: 5.9, exp: 450, peak: 840, peakT: "12:45 PM" },
      { date: "01-Oct-2026", gen: 476.99, dg: 0.0, cuf: 19.87, inso: 5.5, exp: 445, peak: 810, peakT: "12:35 PM" },
      { date: "02-Oct-2026", gen: 448.74, dg: 0.0, cuf: 18.70, inso: 5.3, exp: 440, peak: 795, peakT: "12:50 PM" },
      { date: "03-Oct-2026", gen: 394.18, dg: 0.0, cuf: 16.42, inso: 4.8, exp: 430, peak: 760, peakT: "01:05 PM" },
      { date: "04-Oct-2026", gen: 440.80, dg: 0.0, cuf: 18.37, inso: 5.2, exp: 440, peak: 805, peakT: "12:40 PM" },
      { date: "05-Oct-2026", gen: 464.60, dg: 0.0, cuf: 19.36, inso: 5.4, exp: 445, peak: 820, peakT: "12:30 PM" },
      { date: "06-Oct-2026", gen: 405.00, dg: 0.0, cuf: 16.88, inso: 4.9, exp: 435, peak: 775, peakT: "12:55 PM" },
      { date: "07-Oct-2026", gen: 384.32, dg: 0.0, cuf: 16.01, inso: 4.7, exp: 430, peak: 792, peakT: "12:45 PM" },
    ];

    let cumSolar = 303211.8;
    let cumDg = 4458.2;
    const capacityKwp = site.solar_capacity_kwp || 100;

    return rawData.map((d) => {
      cumSolar += d.gen;
      cumDg += d.dg;
      const pr = parseFloat(((d.gen / ((d.inso || 4.5) * capacityKwp)) * 100).toFixed(1));
      const specYield = parseFloat((d.gen / capacityKwp).toFixed(2));
      const pvDgSaving = d.dg > 0 ? parseFloat((d.gen * 0.15).toFixed(2)) : 0;

      return {
        date: d.date,
        dayTotalKwh: d.gen,
        plantCumulativeKwh: parseFloat(cumSolar.toFixed(1)),
        inv01DayKwh: d.gen,
        inv01CumulativeKwh: parseFloat(cumSolar.toFixed(1)),
        dgDayKwh: d.dg,
        dgCumulativeKwh: parseFloat(cumDg.toFixed(1)),
        invCount: 1,
        pvDgFuelSavingKwh: pvDgSaving,
        cufPct: d.cuf,
        solarInsolation: d.inso,
        prPct: Math.min(95, Math.max(60, pr)),
        expectedGenKwh: d.exp,
        peakIrradianceWm2: d.peak,
        peakIrradianceTime: d.peakT,
        specificYield: specYield,
      };
    });
  }, [site.solar_capacity_kwp]);

  // Export to CSV
  const handleExportCsv = () => {
    let csv =
      "Date,Day Total [KWH],Plant Cumulative [KWH],INV-01 Day [KWH],DG Day [KWH],CUF (%),Insolation (kWh/m2),PR (%),Expected Gen [KWH],Peak Irradiance (W/m2),Peak Time,Specific Yield (kWh/kWp)\n";

    dailyRecords.forEach((r) => {
      csv += `${r.date},${r.dayTotalKwh},${r.plantCumulativeKwh},${r.inv01DayKwh},${r.dgDayKwh},${r.cufPct},${r.solarInsolation},${r.prPct},${r.expectedGenKwh},${r.peakIrradianceWm2},${r.peakIrradianceTime},${r.specificYield}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DGR_${site.slug || "site"}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 transition-all ${
        isFullscreen ? "fixed inset-4 z-50 overflow-y-auto shadow-2xl backdrop-blur-xl" : ""
      }`}
    >
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-theme-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
            <FileSpreadsheet className="size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-theme-primary flex items-center gap-2">
              <span>Daily Generation Report (DGR) Audit Matrix</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40">
                EPC COMPLIANCE
              </span>
            </h2>
            <p className="text-xs text-theme-muted font-mono mt-0.5">
              Certified generation logs, CUF %, specific yield, and solar-DG fuel savings
            </p>
          </div>
        </div>

        {/* View Switcher, Date Controls, Export */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Format Mode Tabs */}
          <div className="flex items-center rounded-lg bg-theme-muted p-1 border border-theme-subtle">
            <button
              onClick={() => setViewMode("horizontal")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                viewMode === "horizontal"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]"
                  : "text-theme-muted hover:text-theme-primary"
              }`}
            >
              Horizontal Matrix
            </button>
            <button
              onClick={() => setViewMode("vertical")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                viewMode === "vertical"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]"
                  : "text-theme-muted hover:text-theme-primary"
              }`}
            >
              Vertical Audit Log
            </button>
            <button
              onClick={() => setViewMode("charts")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                viewMode === "charts"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]"
                  : "text-theme-muted hover:text-theme-primary"
              }`}
            >
              Correlation Curves
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle text-theme-primary">
            <Calendar className="size-3.5 text-[#FFD600]" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-xs font-mono text-theme-primary focus:outline-none cursor-pointer"
            />
            <span className="text-theme-muted">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-xs font-mono text-theme-primary focus:outline-none cursor-pointer"
            />
          </div>

          {/* Export Actions */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/30 text-[#00E676] font-bold transition-all"
          >
            <Download className="size-3.5" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-theme-muted hover:bg-theme-subtle border border-theme-subtle text-theme-primary font-bold transition-all"
            title="Print PDF Report"
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-theme-muted hover:bg-theme-subtle border border-theme-subtle text-theme-muted hover:text-theme-primary transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* 1. HORIZONTAL MATRIX VIEW (ref_img_7 format) */}
      {viewMode === "horizontal" && (
        <div className="mt-4 rounded-xl border border-theme-subtle bg-theme-muted overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-theme-card border-b border-theme-subtle">
                <tr>
                  <th className="py-3 px-4 font-bold text-theme-primary min-w-[220px] sticky left-0 bg-theme-card z-10 border-r border-theme-subtle shadow-sm">
                    Metric Parameters
                  </th>
                  {dailyRecords.map((r) => (
                    <th
                      key={r.date}
                      className="py-3 px-3 text-center font-bold text-theme-primary whitespace-nowrap min-w-[100px]"
                    >
                      {r.date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle">
                {/* Row: Day Total [KWH] */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#FFD600] sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    Day Total [KWH]
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center text-theme-primary font-bold">
                      {r.dayTotalKwh.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Row: INV-01 Day Total [KWH] */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-theme-secondary sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    INV-01 Day Total [KWH]
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center text-theme-primary">
                      {r.inv01DayKwh.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Row: DG Day Total [KWH] */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-[#FF6B00] sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    DG Day Total [KWH]
                  </td>
                  {dailyRecords.map((r) => (
                    <td
                      key={r.date}
                      className={`py-2.5 px-3 text-center ${
                        r.dgDayKwh > 0 ? "text-[#FF6B00] font-bold" : "text-theme-muted"
                      }`}
                    >
                      {r.dgDayKwh > 0 ? r.dgDayKwh.toFixed(2) : "-"}
                    </td>
                  ))}
                </tr>

                {/* Row: Online Inverters */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-theme-secondary sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    NO_OF_INV
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center text-theme-primary">
                      {r.invCount}
                    </td>
                  ))}
                </tr>

                {/* Row: PV-DG Fuel Savings (kWh) */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-[#00E676] sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    PV_DG_Fuel_Saving_KWH
                  </td>
                  {dailyRecords.map((r) => (
                    <td
                      key={r.date}
                      className={`py-2.5 px-3 text-center ${
                        r.pvDgFuelSavingKwh > 0 ? "text-[#00E676] font-bold" : "text-theme-muted"
                      }`}
                    >
                      {r.pvDgFuelSavingKwh > 0 ? r.pvDgFuelSavingKwh.toFixed(2) : "0.00"}
                    </td>
                  ))}
                </tr>

                {/* Row: CUF (%) */}
                <tr className="hover:bg-theme-card/60 transition-colors bg-[#00F0FF]/5">
                  <td className="py-2.5 px-4 font-bold text-[#00F0FF] sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    CUF (%)
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center font-bold text-[#00F0FF]">
                      {r.cufPct.toFixed(2)}%
                    </td>
                  ))}
                </tr>

                {/* Row: Specific Yield (kWh/kWp) */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#FF2A85] sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    Specific Yield [kWh/kWp]
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center font-bold text-[#FF2A85]">
                      {r.specificYield.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Row: Solar Insolation */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-theme-secondary sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    SOLAR_INSO [kWh/m²]
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center text-theme-primary">
                      {r.solarInsolation.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Row: PR (%) */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-[#00E676] font-bold sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    Performance Ratio (PR %)
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center font-bold text-[#00E676]">
                      {r.prPct.toFixed(1)}%
                    </td>
                  ))}
                </tr>

                {/* Row: Expected Generation */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-theme-muted sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    EXPECT_GEN [KWH]
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center text-theme-muted">
                      {r.expectedGenKwh.toFixed(0)}
                    </td>
                  ))}
                </tr>

                {/* Row: Peak Irradiance */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-theme-secondary sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    PEAK_IRRADIANCE [W/m²]
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center text-theme-primary font-bold">
                      {r.peakIrradianceWm2.toFixed(0)}
                    </td>
                  ))}
                </tr>

                {/* Row: Peak Irradiance Time */}
                <tr className="hover:bg-theme-card/60 transition-colors">
                  <td className="py-2.5 px-4 text-theme-muted sticky left-0 bg-theme-muted z-10 border-r border-theme-subtle">
                    PEAK_IRR_TIME
                  </td>
                  {dailyRecords.map((r) => (
                    <td key={r.date} className="py-2.5 px-3 text-center text-theme-muted text-[11px]">
                      {r.peakIrradianceTime}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. VERTICAL AUDIT LOG VIEW (ref_img_6 format) */}
      {viewMode === "vertical" && (
        <div className="mt-4 rounded-xl border border-theme-subtle bg-theme-muted overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-theme-card border-b border-theme-subtle text-[10px] text-theme-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 whitespace-nowrap">Date</th>
                  <th className="py-3 px-3 text-[#FFD600] whitespace-nowrap">Plant Total KWH [Cumulative]</th>
                  <th className="py-3 px-3 font-bold text-theme-primary whitespace-nowrap">Day Total [KWH]</th>
                  <th className="py-3 px-3 whitespace-nowrap">INV-01 Cumulative [KWH]</th>
                  <th className="py-3 px-3 whitespace-nowrap">INV-01 Day [KWH]</th>
                  <th className="py-3 px-3 text-[#FF6B00] whitespace-nowrap">DG Cumulative [KWH]</th>
                  <th className="py-3 px-3 text-[#FF6B00] whitespace-nowrap">DG Day [KWH]</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Inverters</th>
                  <th className="py-3 px-3 text-[#00F0FF] whitespace-nowrap">CUF (%)</th>
                  <th className="py-3 px-3 text-[#FF2A85] whitespace-nowrap">Specific Yield (kWh/kWp)</th>
                  <th className="py-3 px-3 text-[#00E676] whitespace-nowrap">PR (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle">
                {dailyRecords.map((r) => (
                  <tr key={r.date} className="hover:bg-theme-card/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-theme-primary whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3 text-[#FFD600] font-bold whitespace-nowrap">
                      {r.plantCumulativeKwh.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-theme-primary whitespace-nowrap">
                      {r.dayTotalKwh.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-theme-secondary whitespace-nowrap">
                      {r.inv01CumulativeKwh.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-theme-primary whitespace-nowrap">
                      {r.inv01DayKwh.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-[#FF6B00] whitespace-nowrap">
                      {r.dgCumulativeKwh.toLocaleString()}
                    </td>
                    <td
                      className={`py-2.5 px-3 whitespace-nowrap ${
                        r.dgDayKwh > 0 ? "text-[#FF6B00] font-bold" : "text-theme-muted"
                      }`}
                    >
                      {r.dgDayKwh > 0 ? r.dgDayKwh.toFixed(2) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center text-theme-primary whitespace-nowrap">
                      {r.invCount}
                    </td>
                    <td className="py-2.5 px-3 text-[#00F0FF] font-bold whitespace-nowrap">
                      {r.cufPct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-[#FF2A85] font-bold whitespace-nowrap">
                      {r.specificYield.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-[#00E676] font-bold whitespace-nowrap">
                      {r.prPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CORRELATION CURVES VIEW (ref_img_2 & ref_img_8 format) */}
      {viewMode === "charts" && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Energy Generation vs CUF Curve */}
          <div className="p-4 rounded-xl border border-theme-subtle bg-theme-muted">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono text-theme-primary uppercase flex items-center gap-1.5">
                <BarChart3 className="size-3.5 text-[#FFD600]" />
                <span>Energy Generation [kWh] vs. CUF Curve</span>
              </span>
              <span className="text-[10px] font-mono text-[#00F0FF] font-bold">Dual-Axis (kWh / %)</span>
            </div>

            {/* SVG Bars & Line Overlay */}
            <div className="h-64 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-theme-subtle relative">
              {dailyRecords.map((r) => {
                const heightPct = Math.min(100, (r.dayTotalKwh / 600) * 100);
                const cufHeightPct = Math.min(100, (r.cufPct / 25) * 100);

                return (
                  <div key={r.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] font-mono p-1 rounded whitespace-nowrap z-20 pointer-events-none">
                      {r.dayTotalKwh.toFixed(0)} kWh | CUF: {r.cufPct.toFixed(1)}%
                    </div>

                    {/* CUF Line Marker Dot */}
                    <div
                      style={{ bottom: `${cufHeightPct}%` }}
                      className="absolute size-2 rounded-full bg-[#00F0FF] border border-black shadow-[0_0_8px_#00F0FF] z-10"
                    />

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full rounded-t bg-[#FFD600]/80 group-hover:bg-[#FFD600] transition-colors"
                    />
                    <span className="text-[9px] font-mono text-theme-muted mt-1 truncate max-w-full">
                      {r.date.split("-")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-theme-muted">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded bg-[#FFD600]" />
                <span>Energy Generation (kWh)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#00F0FF]" />
                <span>CUF Curve (%)</span>
              </span>
            </div>
          </div>

          {/* Chart 2: Energy Generation vs Specific Yield */}
          <div className="p-4 rounded-xl border border-theme-subtle bg-theme-muted">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono text-theme-primary uppercase flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-[#FF2A85]" />
                <span>Energy Generation vs. Specific Yield</span>
              </span>
              <span className="text-[10px] font-mono text-[#FF2A85] font-bold">kWh / (kWh/kWp)</span>
            </div>

            {/* SVG Bars & Line Overlay */}
            <div className="h-64 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-theme-subtle relative">
              {dailyRecords.map((r) => {
                const heightPct = Math.min(100, (r.dayTotalKwh / 600) * 100);
                const specHeightPct = Math.min(100, (r.specificYield / 6.0) * 100);

                return (
                  <div key={r.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] font-mono p-1 rounded whitespace-nowrap z-20 pointer-events-none">
                      {r.dayTotalKwh.toFixed(0)} kWh | {r.specificYield} kWh/kWp
                    </div>

                    {/* Specific Yield Marker Dot */}
                    <div
                      style={{ bottom: `${specHeightPct}%` }}
                      className="absolute size-2 rounded-full bg-[#FF2A85] border border-black shadow-[0_0_8px_#FF2A85] z-10"
                    />

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full rounded-t bg-[#00E676]/80 group-hover:bg-[#00E676] transition-colors"
                    />
                    <span className="text-[9px] font-mono text-theme-muted mt-1 truncate max-w-full">
                      {r.date.split("-")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-theme-muted">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded bg-[#00E676]" />
                <span>Energy Generation (kWh)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#FF2A85]" />
                <span>Specific Yield (kWh/kWp)</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
