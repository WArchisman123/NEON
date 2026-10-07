"use client";

import React, { useState, useMemo, useId } from "react";
import {
  TrendingUp,
  BarChart3,
  LineChart,
  Download,
  Layers,
  Sun,
  FileSpreadsheet,
  CloudRain,
  CloudSun,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import {
  generateComparativeDataset,
  ComparativeDayRecord,
} from "@/lib/energy/comparative-data-service";

interface PlantGenerationComparativeHubProps {
  site: SiteRecord;
}

export function PlantGenerationComparativeHub({
  site,
}: PlantGenerationComparativeHubProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);
  const [chartMode, setChartMode] = useState<"line" | "bar">("line");
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const chartId = useId();

  // Generate dataset based on selected day count
  const { records, summary } = useMemo(() => {
    return generateComparativeDataset(site, rangeDays);
  }, [site, rangeDays]);

  const activeRecord: ComparativeDayRecord | null =
    hoveredDayIndex !== null && records[hoveredDayIndex]
      ? records[hoveredDayIndex]
      : null;

  // Max values for chart scaling
  const maxEnergy = useMemo(() => {
    const maxVal = Math.max(...records.map((r) => r.actualEnergyKwh), 500);
    return Math.ceil((maxVal * 1.15) / 100) * 100;
  }, [records]);

  const maxCuf = useMemo(() => {
    const maxVal = Math.max(...records.map((r) => r.cufPct), 25);
    return Math.ceil(maxVal * 1.2);
  }, [records]);

  const maxSpecificYield = 8; // 0 to 8 kWh/kWp standard scale

  // Export CSV
  const handleExportCsv = () => {
    let csv =
      "Date,Full_Date,Actual_Yield_kWh,Expected_Yield_kWh,Variance_Pct,CUF_Pct,Specific_Yield_kWh_per_kWp,Peak_Irradiance_Wm2,Weather_Condition\n";
    records.forEach((r) => {
      csv += `${r.date},${r.fullDate},${r.actualEnergyKwh},${r.expectedEnergyKwh},${r.variancePct}%,${r.cufPct}%,${r.specificYieldKwhPerKwp},${r.peakIrradianceWm2},${r.weatherCondition}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Plant_Comparative_Generation_${site.name.replace(/\s+/g, "_")}_${rangeDays}D_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dimensions for Master Multi-Day Curve (ref_img_8)
  const masterW = 920;
  const masterH = 300;
  const padL = 55;
  const padR = 25;
  const padT = 25;
  const padB = 40;
  const plotW = masterW - padL - padR;
  const plotH = masterH - padT - padB;

  // Dimensions for 4 Quadrants (ref_img_2)
  const quadW = 440;
  const quadH = 220;
  const qPadL = 45;
  const qPadR = 40;
  const qPadT = 22;
  const qPadB = 35;
  const qPlotW = quadW - qPadL - qPadR;
  const qPlotH = quadH - qPadT - qPadB;

  return (
    <div className="space-y-6">
      {/* Top Header & Range Controls */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-theme-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF2A85]/10 border border-[#FF2A85]/30 text-[#FF2A85]">
                <TrendingUp className="size-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF2A85] font-bold">
                  IEC 61724 Plant Performance Analytics
                </span>
                <h2 className="text-base sm:text-lg font-black text-theme-primary">
                  Plant Generation Comparative Analysis &amp; Multi-Day Trend Curves
                </h2>
              </div>
            </div>
            <p className="text-xs text-theme-muted mt-1 font-mono">
              Site: <span className="text-theme-primary font-bold">{site.name}</span> ({site.solar_capacity_kwp} kW AC / {site.dc_capacity_kwp || Math.round(site.solar_capacity_kwp * 1.06)} kWp DC) • 4-Quadrant Correlated Yield Analysis
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Range Selector */}
            <div className="flex rounded-lg bg-theme-muted p-0.5 border border-theme-subtle">
              {([7, 14, 30] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setRangeDays(days)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all min-h-[38px] ${
                    rangeDays === days
                      ? "bg-[#FF2A85] text-white shadow-sm"
                      : "text-theme-muted hover:text-theme-primary"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            {/* Visual Mode: Line vs Bar */}
            <div className="flex rounded-lg bg-theme-muted p-0.5 border border-theme-subtle">
              <button
                onClick={() => setChartMode("line")}
                className={`p-1.5 rounded transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${
                  chartMode === "line"
                    ? "bg-[#FFD600] text-black font-bold shadow-sm"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
                title="Spline Line Mode"
              >
                <LineChart className="size-4" />
              </button>
              <button
                onClick={() => setChartMode("bar")}
                className={`p-1.5 rounded transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${
                  chartMode === "bar"
                    ? "bg-[#FFD600] text-black font-bold shadow-sm"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
                title="Bar Chart Mode"
              >
                <BarChart3 className="size-4" />
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 hover:bg-[#00E676]/20 text-[#00E676] text-xs font-mono font-bold transition-all min-h-[44px]"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 6-Metric Statistical KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 font-mono">
          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted block truncate">
              Total Generation
            </span>
            <div className="text-base sm:text-lg font-bold text-[#FFD600] mt-0.5">
              {summary.totalEnergyKwh >= 1000
                ? `${(summary.totalEnergyKwh / 1000).toFixed(2)} MWh`
                : `${summary.totalEnergyKwh} kWh`}
            </div>
            <span className="text-[9px] text-theme-muted">
              In {rangeDays} Day Period
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted block truncate">
              Peak Day Yield
            </span>
            <div className="text-base sm:text-lg font-bold text-theme-primary mt-0.5">
              {summary.peakDayEnergyKwh} kWh
            </div>
            <span className="text-[9px] text-[#00E676]">
              On {summary.peakDayDate}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted block truncate">
              Daily Average
            </span>
            <div className="text-base sm:text-lg font-bold text-[#00F0FF] mt-0.5">
              {summary.avgDailyEnergyKwh} kWh
            </div>
            <span className="text-[9px] text-theme-muted">Per Day Mean</span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted block truncate">
              Average CUF
            </span>
            <div className="text-base sm:text-lg font-bold text-[#00E676] mt-0.5">
              {summary.avgCufPct}%
            </div>
            <span className="text-[9px] text-theme-muted">Capacity Factor</span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted block truncate">
              Specific Yield
            </span>
            <div className="text-base sm:text-lg font-bold text-[#9D4EDD] mt-0.5">
              {summary.avgSpecificYieldKwhPerKwp}
            </div>
            <span className="text-[9px] text-theme-muted">kWh / kWp Daily</span>
          </div>

          <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle">
            <span className="text-[10px] uppercase text-theme-muted block truncate">
              Curtailment Dips
            </span>
            <div className="text-base sm:text-lg font-bold text-[#FF6B00] mt-0.5 flex items-center gap-1">
              <span>{summary.curtailmentDaysCount}</span>
              <span className="text-[9px] text-theme-muted font-normal">Days</span>
            </div>
            <span className="text-[9px] text-[#FFAB00]">
              Cloud / Weather Impact
            </span>
          </div>
        </div>
      </div>

      {/* FEATURE 1: MULTI-DAY ENERGY TREND SPLINE CURVE (ref_img_8.png) */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#FFD600] animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
                Daily Generation Trend Curve (kWh) — {rangeDays} Days Diurnal Rollup
              </h3>
            </div>
            <p className="text-xs font-mono text-theme-muted mt-0.5">
              Continuous multi-day energy dispatch curve exposing weather dips and recovery trends
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#FFD600]">
              <span className="w-3 h-0.5 bg-[#FFD600]" /> Actual Yield (kWh)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-0.5 bg-slate-500 border-t border-dashed" /> Expected Baseline
            </span>
            {activeRecord && (
              <span className="text-theme-primary font-bold pl-2 border-l border-theme-subtle">
                {activeRecord.date}: {activeRecord.actualEnergyKwh} kWh ({activeRecord.cufPct}% CUF)
              </span>
            )}
          </div>
        </div>

        {/* Master Trend SVG Canvas */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${masterW} ${masterH}`}
            className="w-full h-auto min-w-[700px] select-none"
            onMouseLeave={() => setHoveredDayIndex(null)}
          >
            <defs>
              <linearGradient id={`${chartId}-area-grad`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD600" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFD600" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Left Y-Axis */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((pct) => {
              const val = Math.round(maxEnergy * pct);
              const y = padT + plotH - (val / maxEnergy) * plotH;
              return (
                <g key={pct}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={padL + plotW}
                    y2={y}
                    stroke="currentColor"
                    className="text-theme-subtle"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padL - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {val} kWh
                  </text>
                </g>
              );
            })}

            {/* Expected Baseline Reference Line */}
            {(() => {
              const expVal = records[0]?.expectedEnergyKwh || 400;
              const y = padT + plotH - (expVal / maxEnergy) * plotH;
              return (
                <g>
                  <line
                    x1={padL}
                    y1={y}
                    x2={padL + plotW}
                    y2={y}
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                    strokeWidth="1.25"
                    opacity="0.5"
                  />
                  <text
                    x={padL + plotW + 4}
                    y={y + 3}
                    className="text-[9px] font-mono fill-slate-400"
                  >
                    Exp: {expVal}
                  </text>
                </g>
              );
            })()}

            {/* X-Axis Dates & Vertical Guidelines */}
            {records.map((rec, idx) => {
              const x = padL + (idx / (records.length - 1)) * plotW;
              return (
                <g key={rec.date}>
                  <line
                    x1={x}
                    y1={padT}
                    x2={x}
                    y2={padT + plotH}
                    stroke="currentColor"
                    className="text-theme-subtle"
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                  <text
                    x={x}
                    y={padT + plotH + 18}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {rec.date}
                  </text>
                  <text
                    x={x}
                    y={padT + plotH + 30}
                    textAnchor="middle"
                    className="text-[8px] font-mono fill-slate-500"
                  >
                    {rec.dayName}
                  </text>
                </g>
              );
            })}

            {/* LINE MODE: Spline Bezier Path & Gradient Area */}
            {chartMode === "line" && (
              <>
                {/* Area Gradient */}
                {(() => {
                  const pts = records.map((r, i) => {
                    const x = padL + (i / (records.length - 1)) * plotW;
                    const y = padT + plotH - (r.actualEnergyKwh / maxEnergy) * plotH;
                    return { x, y };
                  });

                  let d = `M ${pts[0].x} ${pts[0].y}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const curr = pts[i];
                    const next = pts[i + 1];
                    const mx = (curr.x + next.x) / 2;
                    d += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
                  }

                  const areaPath = `${d} L ${pts[pts.length - 1].x} ${padT + plotH} L ${pts[0].x} ${padT + plotH} Z`;

                  return (
                    <>
                      <path
                        d={areaPath}
                        fill={`url(#${chartId}-area-grad)`}
                      />
                      <path
                        d={d}
                        fill="none"
                        stroke="#FFD600"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}

                {/* Circular Data Nodes */}
                {records.map((r, idx) => {
                  const x = padL + (idx / (records.length - 1)) * plotW;
                  const y = padT + plotH - (r.actualEnergyKwh / maxEnergy) * plotH;
                  const isHovered = hoveredDayIndex === idx;
                  const isCurtailment = r.weatherCondition === "rain_curtailment";

                  return (
                    <g key={idx}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : isCurtailment ? 5 : 3.5}
                        fill={isCurtailment ? "#FF1744" : "#FFD600"}
                        stroke="#060709"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        className="transition-all"
                      />
                      {/* Label top of bar / point if hovered */}
                      {isHovered && (
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          className="text-[10px] font-mono font-bold fill-theme-primary"
                        >
                          {r.actualEnergyKwh} kWh
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            )}

            {/* BAR MODE: High-Contrast Vertical Bars */}
            {chartMode === "bar" && (
              <>
                {records.map((r, idx) => {
                  const barWidth = Math.max(12, (plotW / records.length) * 0.65);
                  const xCenter = padL + (idx / (records.length - 1)) * plotW;
                  const x = xCenter - barWidth / 2;
                  const barH = (r.actualEnergyKwh / maxEnergy) * plotH;
                  const y = padT + plotH - barH;
                  const isHovered = hoveredDayIndex === idx;
                  const isCurtailment = r.weatherCondition === "rain_curtailment";

                  return (
                    <g key={idx}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barH}
                        rx="3"
                        fill={isCurtailment ? "#FF1744" : isHovered ? "#FFE55C" : "#FFD600"}
                        opacity={isHovered ? 1.0 : 0.85}
                        className="transition-all"
                      />
                      <text
                        x={xCenter}
                        y={y - 6}
                        textAnchor="middle"
                        className="text-[8px] font-mono fill-theme-muted"
                      >
                        {r.actualEnergyKwh.toFixed(0)}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            {/* Hover Crosshair Column */}
            {hoveredDayIndex !== null && (
              (() => {
                const x = padL + (hoveredDayIndex / (records.length - 1)) * plotW;
                return (
                  <line
                    x1={x}
                    y1={padT}
                    x2={x}
                    y2={padT + plotH}
                    stroke="#FF2A85"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                );
              })()
            )}

            {/* Full-Height Transparent Hit Rectangles */}
            {records.map((_, idx) => {
              const colW = plotW / (records.length - 1);
              const x = padL + idx * colW - colW / 2;
              return (
                <rect
                  key={idx}
                  x={Math.max(padL, x)}
                  y={padT}
                  width={colW}
                  height={plotH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredDayIndex(idx)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* FEATURE 2: 4-QUADRANT ANALYTICAL CORRELATION GRID (ref_img_2.png) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-[#FFD600]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
                4-Quadrant Analytical Correlation Matrix (Matches eSolar Ref-2)
              </h3>
            </div>
            <p className="text-xs font-mono text-theme-muted mt-0.5">
              Comprehensive side-by-side correlation of Generation Yield vs CUF (%) and Specific Yield (kWh/kWp)
            </p>
          </div>
          <span className="text-xs font-mono text-theme-muted">
            {records.length} Continuous Days Plotted
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* QUADRANT 1: Energy Generation [kWh] Bar Chart */}
          <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
              <span className="text-xs font-mono font-bold text-theme-primary flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#FFD600]" />
                Quadrant 1: Energy Generation [kWh]
              </span>
              <span className="text-[10px] font-mono text-theme-muted">
                Daily Totals with Value Labels
              </span>
            </div>

            <svg viewBox={`0 0 ${quadW} ${quadH}`} className="w-full h-auto select-none">
              {/* Y-Axis Gridlines */}
              {[0, 0.5, 1.0].map((pct) => {
                const val = Math.round(maxEnergy * pct);
                const y = qPadT + qPlotH - (val / maxEnergy) * qPlotH;
                return (
                  <g key={pct}>
                    <line
                      x1={qPadL}
                      y1={y}
                      x2={qPadL + qPlotW}
                      y2={y}
                      stroke="currentColor"
                      className="text-theme-subtle"
                      strokeDasharray="2 2"
                      strokeWidth="0.75"
                    />
                    <text
                      x={qPadL - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[8px] font-mono fill-slate-400"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {records.map((r, i) => {
                const bw = Math.max(8, (qPlotW / records.length) * 0.6);
                const xc = qPadL + (i / (records.length - 1)) * qPlotW;
                const x = xc - bw / 2;
                const h = (r.actualEnergyKwh / maxEnergy) * qPlotH;
                const y = qPadT + qPlotH - h;
                const isDip = r.weatherCondition === "rain_curtailment";

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={bw}
                      height={h}
                      rx="2"
                      fill={isDip ? "#FF1744" : "#FFD600"}
                      opacity="0.9"
                    />
                    <text
                      x={xc}
                      y={y - 4}
                      textAnchor="middle"
                      className="text-[7px] font-mono fill-theme-primary font-bold"
                    >
                      {r.actualEnergyKwh.toFixed(0)}
                    </text>
                    {/* Date label */}
                    {i % 2 === 0 && (
                      <text
                        x={xc}
                        y={qPadT + qPlotH + 14}
                        textAnchor="middle"
                        className="text-[7px] font-mono fill-slate-500"
                      >
                        {r.date}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* QUADRANT 2: CUF Curve [%] Bar Chart */}
          <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
              <span className="text-xs font-mono font-bold text-theme-primary flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#00F0FF]" />
                Quadrant 2: Capacity Utilization Factor (CUF %)
              </span>
              <span className="text-[10px] font-mono text-theme-muted">
                18% Target Threshold
              </span>
            </div>

            <svg viewBox={`0 0 ${quadW} ${quadH}`} className="w-full h-auto select-none">
              {/* Y-Axis Gridlines */}
              {[0, 0.5, 1.0].map((pct) => {
                const val = Math.round(maxCuf * pct);
                const y = qPadT + qPlotH - (val / maxCuf) * qPlotH;
                return (
                  <g key={pct}>
                    <line
                      x1={qPadL}
                      y1={y}
                      x2={qPadL + qPlotW}
                      y2={y}
                      stroke="currentColor"
                      className="text-theme-subtle"
                      strokeDasharray="2 2"
                      strokeWidth="0.75"
                    />
                    <text
                      x={qPadL - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[8px] font-mono fill-slate-400"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* 18% Benchmark Target */}
              {(() => {
                const y = qPadT + qPlotH - (18 / maxCuf) * qPlotH;
                return (
                  <line
                    x1={qPadL}
                    y1={y}
                    x2={qPadL + qPlotW}
                    y2={y}
                    stroke="#00E676"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                );
              })()}

              {/* Bars */}
              {records.map((r, i) => {
                const bw = Math.max(8, (qPlotW / records.length) * 0.6);
                const xc = qPadL + (i / (records.length - 1)) * qPlotW;
                const x = xc - bw / 2;
                const h = (r.cufPct / maxCuf) * qPlotH;
                const y = qPadT + qPlotH - h;
                const isDip = r.weatherCondition === "rain_curtailment";

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={bw}
                      height={h}
                      rx="2"
                      fill={isDip ? "#FF1744" : "#00F0FF"}
                      opacity="0.85"
                    />
                    <text
                      x={xc}
                      y={y - 4}
                      textAnchor="middle"
                      className="text-[7px] font-mono fill-theme-primary font-bold"
                    >
                      {r.cufPct.toFixed(1)}%
                    </text>
                    {i % 2 === 0 && (
                      <text
                        x={xc}
                        y={qPadT + qPlotH + 14}
                        textAnchor="middle"
                        className="text-[7px] font-mono fill-slate-500"
                      >
                        {r.date}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* QUADRANT 3: Energy Generation [kWh] vs CUF Curve [%] (Dual-Axis) */}
          <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
              <span className="text-xs font-mono font-bold text-theme-primary flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#FF2A85]" />
                Quadrant 3: Energy [kWh] vs. CUF [%] (Dual-Axis)
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-[#FFD600]">Bars: kWh</span>
                <span className="text-[#00F0FF]">Line: CUF %</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${quadW} ${quadH}`} className="w-full h-auto select-none">
              {/* Left Y-Axis (Energy) & Right Y-Axis (CUF %) */}
              {[0, 0.5, 1.0].map((pct) => {
                const valKwh = Math.round(maxEnergy * pct);
                const valCuf = Math.round(maxCuf * pct);
                const y = qPadT + qPlotH - (valKwh / maxEnergy) * qPlotH;
                return (
                  <g key={pct}>
                    <line
                      x1={qPadL}
                      y1={y}
                      x2={qPadL + qPlotW}
                      y2={y}
                      stroke="currentColor"
                      className="text-theme-subtle"
                      strokeDasharray="2 2"
                      strokeWidth="0.75"
                    />
                    <text
                      x={qPadL - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[8px] font-mono fill-slate-400"
                    >
                      {valKwh}
                    </text>
                    <text
                      x={qPadL + qPlotW + 6}
                      y={y + 3}
                      textAnchor="start"
                      className="text-[8px] font-mono fill-[#00F0FF]"
                    >
                      {valCuf}%
                    </text>
                  </g>
                );
              })}

              {/* Energy Bars */}
              {records.map((r, i) => {
                const bw = Math.max(8, (qPlotW / records.length) * 0.55);
                const xc = qPadL + (i / (records.length - 1)) * qPlotW;
                const x = xc - bw / 2;
                const h = (r.actualEnergyKwh / maxEnergy) * qPlotH;
                const y = qPadT + qPlotH - h;

                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={bw}
                    height={h}
                    rx="2"
                    fill="#FFD600"
                    opacity="0.45"
                  />
                );
              })}

              {/* CUF Spline Path */}
              {(() => {
                const pts = records.map((r, i) => {
                  const x = qPadL + (i / (records.length - 1)) * qPlotW;
                  const y = qPadT + qPlotH - (r.cufPct / maxCuf) * qPlotH;
                  return { x, y };
                });

                let d = `M ${pts[0].x} ${pts[0].y}`;
                for (let i = 0; i < pts.length - 1; i++) {
                  const mx = (pts[i].x + pts[i + 1].x) / 2;
                  d += ` C ${mx} ${pts[i].y}, ${mx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
                }

                return (
                  <>
                    <path
                      d={d}
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {pts.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="#00F0FF"
                        stroke="#060709"
                        strokeWidth="1"
                      />
                    ))}
                  </>
                );
              })()}

              {/* Bottom Date Labels */}
              {records.map((r, i) => {
                if (i % 2 !== 0) return null;
                const xc = qPadL + (i / (records.length - 1)) * qPlotW;
                return (
                  <text
                    key={i}
                    x={xc}
                    y={qPadT + qPlotH + 14}
                    textAnchor="middle"
                    className="text-[7px] font-mono fill-slate-500"
                  >
                    {r.date}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* QUADRANT 4: Energy Generation [kWh] vs Specific Yield [kWh/kWp] (Dual-Axis) */}
          <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
              <span className="text-xs font-mono font-bold text-theme-primary flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#00E676]" />
                Quadrant 4: Energy [kWh] vs. Specific Yield [kWh/kWp]
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-[#FFD600]">Bars: kWh</span>
                <span className="text-[#00E676]">Line: Y_f (0-8)</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${quadW} ${quadH}`} className="w-full h-auto select-none">
              {/* Left Y-Axis (Energy) & Right Y-Axis (Specific Yield 0-8) */}
              {[0, 0.5, 1.0].map((pct) => {
                const valKwh = Math.round(maxEnergy * pct);
                const valYf = (maxSpecificYield * pct).toFixed(1);
                const y = qPadT + qPlotH - (valKwh / maxEnergy) * qPlotH;
                return (
                  <g key={pct}>
                    <line
                      x1={qPadL}
                      y1={y}
                      x2={qPadL + qPlotW}
                      y2={y}
                      stroke="currentColor"
                      className="text-theme-subtle"
                      strokeDasharray="2 2"
                      strokeWidth="0.75"
                    />
                    <text
                      x={qPadL - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[8px] font-mono fill-slate-400"
                    >
                      {valKwh}
                    </text>
                    <text
                      x={qPadL + qPlotW + 6}
                      y={y + 3}
                      textAnchor="start"
                      className="text-[8px] font-mono fill-[#00E676]"
                    >
                      {valYf}
                    </text>
                  </g>
                );
              })}

              {/* Energy Bars */}
              {records.map((r, i) => {
                const bw = Math.max(8, (qPlotW / records.length) * 0.55);
                const xc = qPadL + (i / (records.length - 1)) * qPlotW;
                const x = xc - bw / 2;
                const h = (r.actualEnergyKwh / maxEnergy) * qPlotH;
                const y = qPadT + qPlotH - h;

                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={bw}
                    height={h}
                    rx="2"
                    fill="#FFD600"
                    opacity="0.4"
                  />
                );
              })}

              {/* Specific Yield Spline Path */}
              {(() => {
                const pts = records.map((r, i) => {
                  const x = qPadL + (i / (records.length - 1)) * qPlotW;
                  const y =
                    qPadT +
                    qPlotH -
                    (r.specificYieldKwhPerKwp / maxSpecificYield) * qPlotH;
                  return { x, y };
                });

                let d = `M ${pts[0].x} ${pts[0].y}`;
                for (let i = 0; i < pts.length - 1; i++) {
                  const mx = (pts[i].x + pts[i + 1].x) / 2;
                  d += ` C ${mx} ${pts[i].y}, ${mx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
                }

                return (
                  <>
                    <path
                      d={d}
                      fill="none"
                      stroke="#00E676"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {pts.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="#00E676"
                        stroke="#060709"
                        strokeWidth="1"
                      />
                    ))}
                  </>
                );
              })()}

              {/* Bottom Date Labels */}
              {records.map((r, i) => {
                if (i % 2 !== 0) return null;
                const xc = qPadL + (i / (records.length - 1)) * qPlotW;
                return (
                  <text
                    key={i}
                    x={xc}
                    y={qPadT + qPlotH + 14}
                    textAnchor="middle"
                    className="text-[7px] font-mono fill-slate-500"
                  >
                    {r.date}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* FEATURE 3: COMPARATIVE AUDIT DATA TABLE */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-subtle">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-[#00E676]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
                Daily Generation Compliance Audit Log ({rangeDays} Day Records)
              </h3>
            </div>
            <p className="text-xs font-mono text-theme-muted mt-0.5">
              Correlated table reflecting actual generation, contractual PVSyst variance, CUF %, and specific yield
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle hover:border-theme-primary/30 text-xs font-mono text-theme-primary transition-all min-h-[40px]"
          >
            <Download className="size-3.5" />
            <span>Download Audit CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-theme-subtle text-theme-muted uppercase text-[10px]">
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5 text-right">Actual Yield</th>
                <th className="pb-2.5 text-right">Expected</th>
                <th className="pb-2.5 text-right">Variance</th>
                <th className="pb-2.5 text-right">CUF %</th>
                <th className="pb-2.5 text-right">Specific Yield</th>
                <th className="pb-2.5 text-right">Peak Irradiance</th>
                <th className="pb-2.5 text-right">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle">
              {records.map((r) => {
                const isCurtailment = r.weatherCondition === "rain_curtailment";
                const isCloudy = r.weatherCondition === "partly_cloudy";

                return (
                  <tr
                    key={r.date}
                    className="hover:bg-theme-muted/50 transition-colors"
                  >
                    <td className="py-2.5 font-bold text-theme-primary flex items-center gap-1.5">
                      <span>{r.date}</span>
                      <span className="text-[10px] text-theme-muted">({r.dayName})</span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#FFD600]">
                      {r.actualEnergyKwh} kWh
                    </td>
                    <td className="py-2.5 text-right text-theme-muted">
                      {r.expectedEnergyKwh} kWh
                    </td>
                    <td
                      className={`py-2.5 text-right font-bold ${
                        r.variancePct >= 0 ? "text-[#00E676]" : "text-[#FF1744]"
                      }`}
                    >
                      {r.variancePct >= 0 ? `+${r.variancePct}%` : `${r.variancePct}%`}
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#00F0FF]">
                      {r.cufPct}%
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#00E676]">
                      {r.specificYieldKwhPerKwp}
                    </td>
                    <td className="py-2.5 text-right text-theme-secondary">
                      {r.peakIrradianceWm2} W/m²
                    </td>
                    <td className="py-2.5 text-right">
                      {isCurtailment ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[#FF1744]/15 text-[#FF1744] border border-[#FF1744]/30 font-bold">
                          <CloudRain className="size-3" />
                          CURTAILMENT
                        </span>
                      ) : isCloudy ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[#FFAB00]/15 text-[#FFAB00] border border-[#FFAB00]/30 font-bold">
                          <CloudSun className="size-3" />
                          OVERCAST
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 font-bold">
                          <Sun className="size-3" />
                          OPTIMAL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
