"use client";

import React, { useState, useMemo, useId } from "react";
import {
  Layers,
  Download,
  RefreshCw,
  Cpu,
  Sliders,
  FileSpreadsheet,
} from "lucide-react";
import { MpptDiurnalSample, MpptChannelPoint } from "@/lib/energy/types";

interface MpptDiagnosticStackProps {
  inverterCount?: number;
  siteName?: string;
}

// 12 High-Contrast Distinct Color Palette for the 12 MPPT Channels
const MPPT_COLORS = [
  "#FFD600", // MPPT 01 - Electric Amber
  "#00F0FF", // MPPT 02 - Laser Cyan
  "#00E676", // MPPT 03 - Cyber Emerald
  "#FF2A85", // MPPT 04 - Neon Pink
  "#9D4EDD", // MPPT 05 - Electric Purple
  "#FF6B00", // MPPT 06 - Hi-Viz Orange
  "#38BDF8", // MPPT 07 - Sky Blue
  "#F43F5E", // MPPT 08 - Rose Crimson
  "#A855F7", // MPPT 09 - Purple Violet
  "#EAB308", // MPPT 10 - Sunlight Yellow
  "#10B981", // MPPT 11 - Mint Emerald
  "#06B6D4", // MPPT 12 - Deep Teal
];

// Generate deterministic realistic 15-min diurnal curve data for an inverter
function generateDiurnalMpptData(inverterIndex: number): MpptDiurnalSample[] {
  const samples: MpptDiurnalSample[] = [];
  // From 06:00 (hour 6) to 18:00 (hour 18) in 15-min increments -> 49 samples
  for (let minuteTotal = 6 * 60; minuteTotal <= 18 * 60; minuteTotal += 15) {
    const hour = Math.floor(minuteTotal / 60);
    const minute = minuteTotal % 60;
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    // Solar bell curve peaked at 12:45 PM (765 min)
    const solarFactor = Math.max(0, Math.sin(((minuteTotal - 360) / 720) * Math.PI));
    const cloudDip = minuteTotal >= 840 && minuteTotal <= 900 ? 0.72 : 1.0; // Slight afternoon cloud dip
    const irradiance = Math.round(920 * Math.pow(solarFactor, 1.25) * cloudDip);

    const channels: MpptChannelPoint[] = [];

    for (let ch = 1; ch <= 12; ch++) {
      // Inverter 1 has standard anomalies matching competitor ref_img_4 / ref_img_5
      const isDegradedSoiling = inverterIndex === 0 && ch === 7;
      const isBlownFuse = inverterIndex === 0 && ch === 12;
      const isClipping = ch === 3 && irradiance > 800;

      // Base nominal string voltage: ~580V morning/evening, ~640-670V noon
      let voltage = 540 + 130 * solarFactor + ((ch * 7 + inverterIndex * 13) % 19);
      if (irradiance < 20) voltage = 0;

      // Base nominal string current: peak ~11.5A
      let current = 11.8 * solarFactor * cloudDip;
      // Slight channel variance
      current *= 0.96 + ((ch * 3 + inverterIndex * 5) % 9) * 0.01;

      let status: MpptChannelPoint["status"] = "optimal";

      if (isBlownFuse) {
        // Blown fuse: open-circuit voltage present, but current is 0.00A
        current = 0.0;
        status = "fuse_check";
      } else if (isDegradedSoiling) {
        // Soiling on MPPT 7: 30% lower current
        current *= 0.68;
        status = "soiling_warning";
      } else if (isClipping && current > 12.0) {
        // Inverter MPPT current limit clipping at 12.0A
        current = 12.0;
        status = "clipping";
      }

      if (irradiance < 20) {
        current = 0;
        voltage = 0;
      }

      const powerKw = (voltage * current) / 1000;

      channels.push({
        channel: ch,
        currentA: parseFloat(current.toFixed(2)),
        voltageV: Math.round(voltage),
        powerKw: parseFloat(powerKw.toFixed(2)),
        status,
      });
    }

    samples.push({
      time: timeStr,
      hour,
      minute,
      irradianceWm2: irradiance,
      channels,
    });
  }

  return samples;
}

export function MpptDiagnosticStack({
  inverterCount = 3,
  siteName = "Site Solar Array",
}: MpptDiagnosticStackProps) {
  const [selectedInverter, setSelectedInverter] = useState(0);
  const [activeChannels, setActiveChannels] = useState<boolean[]>(
    Array(12).fill(true)
  );
  const [hoveredSampleIndex, setHoveredSampleIndex] = useState<number | null>(27); // default midday hover
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSummaryOnly, setShowSummaryOnly] = useState(false);
  const chartId = useId();

  // Generate dataset for current inverter
  const data = useMemo(() => {
    return generateDiurnalMpptData(selectedInverter);
  }, [selectedInverter]);

  // Active hover sample
  const activeSample = hoveredSampleIndex !== null ? data[hoveredSampleIndex] : null;

  // Toggle channel visibility in summary curve
  const toggleChannel = (index: number) => {
    setActiveChannels((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      // Prevent all from being hidden
      if (next.every((v) => !v)) return prev;
      return next;
    });
  };

  const selectAllChannels = () => setActiveChannels(Array(12).fill(true));
  const isolateChannel = (index: number) => {
    const next = Array(12).fill(false);
    next[index] = true;
    setActiveChannels(next);
  };

  // Simulate refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Export CSV
  const handleExportCsv = () => {
    let csv = "Time,Hour,Irradiance_Wm2,";
    for (let c = 1; c <= 12; c++) {
      csv += `MPPT_${c}_Current_A,MPPT_${c}_Voltage_V,MPPT_${c}_Power_kW,`;
    }
    csv += "\n";

    data.forEach((s) => {
      csv += `${s.time},${s.hour},${s.irradianceWm2},`;
      s.channels.forEach((ch) => {
        csv += `${ch.currentA},${ch.voltageV},${ch.powerKw},`;
      });
      csv += "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `MPPT_Diagnostics_INV-${(selectedInverter + 1).toString().padStart(2, "0")}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG summary dimensions
  const svgWidth = 900;
  const svgHeight = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;
  const maxCurrent = 14; // Amps Y-axis scale

  // Sub-chart dimension for each individual MPPT card
  const subWidth = 360;
  const subHeight = 110;
  const subPadLeft = 32;
  const subPadRight = 32;
  const subPadTop = 12;
  const subPadBottom = 22;
  const subPlotW = subWidth - subPadLeft - subPadRight;
  const subPlotH = subHeight - subPadTop - subPadBottom;

  return (
    <div className="space-y-6">
      {/* Top Header Card & Inverter Switcher */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-theme-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFD600]/10 border border-[#FFD600]/30 text-[#FFD600]">
                <Layers className="size-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFD600] font-bold">
                  IEC 62446-1 Multi-Channel Diagnostic
                </span>
                <h2 className="text-base sm:text-lg font-black text-theme-primary">
                  12-Channel MPPT Diurnal Current & Voltage Stack
                </h2>
              </div>
            </div>
            <p className="text-xs text-theme-muted mt-1 font-mono">
              Site: <span className="text-theme-primary font-bold">{siteName}</span> • Synchronized 15-minute multi-tracker diurnal curve overlay & per-MPPT diagnostics
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle hover:border-theme-primary/30 text-xs font-mono text-theme-primary transition-all min-h-[44px]"
              title="Refresh telemetry"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-[#FFD600]" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 hover:bg-[#00E676]/20 text-[#00E676] text-xs font-mono font-bold transition-all min-h-[44px]"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowSummaryOnly(!showSummaryOnly)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle hover:border-theme-primary/30 text-xs font-mono text-theme-secondary transition-all min-h-[44px]"
            >
              <Sliders className="size-3.5" />
              <span>{showSummaryOnly ? "Show All 12 Cards" : "Summary Only"}</span>
            </button>
          </div>
        </div>

        {/* Inverter Selector Tab Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-mono text-theme-muted mr-1.5 flex items-center gap-1">
              <Cpu className="size-3.5 text-theme-muted" /> Inverter:
            </span>
            {Array.from({ length: inverterCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedInverter(idx)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all min-h-[40px] flex items-center gap-2 ${
                  selectedInverter === idx
                    ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                    : "bg-theme-muted text-theme-secondary hover:text-theme-primary border border-theme-subtle"
                }`}
              >
                <span>INV-{(idx + 1).toString().padStart(2, "0")}</span>
                <span
                  className={`size-1.5 rounded-full ${
                    idx === 0 ? "bg-[#FFAB00]" : "bg-[#00E676]"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-theme-muted">
            <span className="flex items-center gap-1.5 text-[#00E676]">
              <span className="size-2 rounded-full bg-[#00E676]" />
              10 Optimal
            </span>
            <span className="flex items-center gap-1.5 text-[#FFAB00]">
              <span className="size-2 rounded-full bg-[#FFAB00]" />
              1 Soiling (CH-07)
            </span>
            <span className="flex items-center gap-1.5 text-[#FF1744]">
              <span className="size-2 rounded-full bg-[#FF1744]" />
              1 Blown Fuse (CH-12)
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Overlaid Diurnal Multi-Channel Comparison Curve */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#00F0FF] animate-pulse" />
              12-Channel DC Current Diurnal Overlay (06:00 – 18:00)
            </h3>
            <p className="text-xs font-mono text-theme-muted mt-0.5">
              Hover cursor along time axis to inspect all 12 tracker currents simultaneously
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllChannels}
              className="text-[11px] font-mono text-[#00F0FF] hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-theme-muted">
              {activeSample ? `${activeSample.time} — ${activeSample.irradianceWm2} W/m²` : "Hover to inspect"}
            </span>
          </div>
        </div>

        {/* SVG Interactive Multi-Line Curve */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[720px] select-none"
            onMouseLeave={() => setHoveredSampleIndex(null)}
          >
            <defs>
              <linearGradient id={`${chartId}-gridline`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {[0, 3.5, 7, 10.5, 14].map((currentVal) => {
              const y = padTop + plotHeight - (currentVal / maxCurrent) * plotHeight;
              return (
                <g key={currentVal}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + plotWidth}
                    y2={y}
                    stroke="currentColor"
                    className="text-theme-subtle"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {currentVal.toFixed(1)} A
                  </text>
                </g>
              );
            })}

            {/* Time Horizontal X-Axis Labels */}
            {data.map((sample, idx) => {
              // Show label every 8 samples (~2 hours)
              if (idx % 8 !== 0 && idx !== data.length - 1) return null;
              const x = padLeft + (idx / (data.length - 1)) * plotWidth;
              return (
                <g key={sample.time}>
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + plotHeight}
                    stroke="currentColor"
                    className="text-theme-subtle"
                    strokeWidth="0.5"
                  />
                  <text
                    x={x}
                    y={padTop + plotHeight + 18}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {sample.time}
                  </text>
                </g>
              );
            })}

            {/* 12 MPPT Channel Lines */}
            {Array.from({ length: 12 }).map((_, chIdx) => {
              if (!activeChannels[chIdx]) return null;
              const color = MPPT_COLORS[chIdx];

              const pathPoints = data.map((sample, idx) => {
                const x = padLeft + (idx / (data.length - 1)) * plotWidth;
                const current = sample.channels[chIdx]?.currentA || 0;
                const y = padTop + plotHeight - (current / maxCurrent) * plotHeight;
                return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
              });

              return (
                <path
                  key={chIdx}
                  d={pathPoints.join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={chIdx === 6 || chIdx === 11 ? "2.5" : "1.75"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={chIdx === 11 ? 0.9 : 0.85}
                  className="transition-opacity hover:opacity-100 cursor-pointer"
                />
              );
            })}

            {/* Hover Cursor Vertical Line & Circles */}
            {hoveredSampleIndex !== null && (
              <g>
                {(() => {
                  const x = padLeft + (hoveredSampleIndex / (data.length - 1)) * plotWidth;
                  return (
                    <>
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotHeight}
                        stroke="#FF2A85"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      {data[hoveredSampleIndex].channels.map((ch, chIdx) => {
                        if (!activeChannels[chIdx]) return null;
                        const y =
                          padTop + plotHeight - (ch.currentA / maxCurrent) * plotHeight;
                        return (
                          <circle
                            key={chIdx}
                            cx={x}
                            cy={y}
                            r={chIdx === 6 || chIdx === 11 ? "4.5" : "3"}
                            fill={MPPT_COLORS[chIdx]}
                            stroke="#060709"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </g>
            )}

            {/* Interactive Full-Canvas Hover Rectangles */}
            {data.map((_, idx) => {
              const xStep = plotWidth / (data.length - 1);
              const x = padLeft + idx * xStep - xStep / 2;
              return (
                <rect
                  key={idx}
                  x={Math.max(padLeft, x)}
                  y={padTop}
                  width={xStep}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredSampleIndex(idx)}
                />
              );
            })}
          </svg>
        </div>

        {/* Interactive Channel Legend / Toggles */}
        <div className="pt-3 border-t border-theme-subtle">
          <div className="flex items-center justify-between text-xs text-theme-muted font-mono mb-2">
            <span>Filter Channels (Click to Toggle, Double Click to Isolate):</span>
            <span className="text-[11px] text-slate-500">12 MPPT Inputs Active</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {Array.from({ length: 12 }).map((_, chIdx) => {
              const chNum = chIdx + 1;
              const color = MPPT_COLORS[chIdx];
              const isActive = activeChannels[chIdx];
              const hoverCurrent = activeSample
                ? activeSample.channels[chIdx]?.currentA
                : null;

              return (
                <button
                  key={chIdx}
                  onClick={() => toggleChannel(chIdx)}
                  onDoubleClick={() => isolateChannel(chIdx)}
                  className={`p-2 rounded-lg border text-left transition-all font-mono min-h-[44px] ${
                    isActive
                      ? "bg-theme-muted border-theme-subtle hover:border-theme-primary/40"
                      : "bg-theme-muted/30 border-transparent opacity-40 hover:opacity-75"
                  }`}
                  title={`Double click to isolate MPPT-${chNum.toString().padStart(2, "0")}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] font-bold text-theme-primary truncate">
                      MPPT-{chNum.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-1 text-theme-primary">
                    {hoverCurrent !== null && hoverCurrent !== undefined ? (
                      <span style={{ color }}>{hoverCurrent.toFixed(2)} A</span>
                    ) : (
                      <span className="text-theme-muted">-- A</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: 12 Stacked Dual-Axis Tracker Cards (ref_img_4) */}
      {!showSummaryOnly && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-[#FFD600]" />
                Per-MPPT Dual-Axis Tracker Stack (Current [A] vs Voltage [V])
              </h3>
              <p className="text-xs font-mono text-theme-muted mt-0.5">
                Each card tracks DC Current (solid line) on left axis vs DC Voltage (dashed line) on right axis
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 bg-[#FFD600]" /> Current (A)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 bg-[#00F0FF] border-t border-dashed" /> Voltage (V)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, chIdx) => {
              const chNum = chIdx + 1;
              const color = MPPT_COLORS[chIdx];
              const isDegraded = selectedInverter === 0 && chNum === 7;
              const isFuseCheck = selectedInverter === 0 && chNum === 12;

              // Statistics for this specific channel
              const channelSeries = data.map((d) => d.channels[chIdx]);
              const peakCurrent = Math.max(...channelSeries.map((c) => c.currentA));
              const peakVoltage = Math.max(...channelSeries.map((c) => c.voltageV));
              const avgPower = (
                channelSeries.reduce((acc, c) => acc + c.powerKw, 0) /
                channelSeries.length
              ).toFixed(2);

              const currentValNow = activeSample ? activeSample.channels[chIdx]?.currentA : peakCurrent;
              const voltageValNow = activeSample ? activeSample.channels[chIdx]?.voltageV : peakVoltage;

              return (
                <div
                  key={chIdx}
                  className={`rounded-xl border p-3.5 space-y-3 transition-all ${
                    isFuseCheck
                      ? "bg-[#FF1744]/10 border-[#FF1744]/40"
                      : isDegraded
                      ? "bg-[#FFAB00]/10 border-[#FFAB00]/40"
                      : "bg-theme-card border-theme-subtle hover:border-theme-primary/30"
                  }`}
                >
                  {/* Card Header: Tracker ID & Status Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono font-bold text-theme-primary">
                        MPPT Tracker #{chNum.toString().padStart(2, "0")}
                      </span>
                    </div>

                    {isFuseCheck ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/30">
                        BLOWN FUSE (0A)
                      </span>
                    ) : isDegraded ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFAB00]/20 text-[#FFAB00] border border-[#FFAB00]/30">
                        SOILING DERATE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/25">
                        OPTIMAL (98.4%)
                      </span>
                    )}
                  </div>

                  {/* Dual-Axis SVG Sub-Chart */}
                  <div className="w-full">
                    <svg
                      viewBox={`0 0 ${subWidth} ${subHeight}`}
                      className="w-full h-auto select-none"
                    >
                      {/* Gridline */}
                      <line
                        x1={subPadLeft}
                        y1={subPadTop + subPlotH / 2}
                        x2={subPadLeft + subPlotW}
                        y2={subPadTop + subPlotH / 2}
                        stroke="currentColor"
                        className="text-theme-subtle"
                        strokeDasharray="2 2"
                        strokeWidth="0.75"
                      />

                      {/* Left Y-Axis Label (Current) */}
                      <text
                        x={subPadLeft - 4}
                        y={subPadTop + 6}
                        textAnchor="end"
                        className="text-[8px] font-mono fill-slate-400"
                      >
                        14A
                      </text>
                      <text
                        x={subPadLeft - 4}
                        y={subPadTop + subPlotH}
                        textAnchor="end"
                        className="text-[8px] font-mono fill-slate-500"
                      >
                        0A
                      </text>

                      {/* Right Y-Axis Label (Voltage) */}
                      <text
                        x={subPadLeft + subPlotW + 4}
                        y={subPadTop + 6}
                        textAnchor="start"
                        className="text-[8px] font-mono fill-[#00F0FF]"
                      >
                        800V
                      </text>
                      <text
                        x={subPadLeft + subPlotW + 4}
                        y={subPadTop + subPlotH}
                        textAnchor="start"
                        className="text-[8px] font-mono fill-[#00F0FF]/60"
                      >
                        0V
                      </text>

                      {/* Voltage Path (Cyan Dashed Line) */}
                      {(() => {
                        const vPoints = data.map((d, i) => {
                          const x = subPadLeft + (i / (data.length - 1)) * subPlotW;
                          const v = d.channels[chIdx]?.voltageV || 0;
                          const y = subPadTop + subPlotH - (v / 800) * subPlotH;
                          return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                        });
                        return (
                          <path
                            d={vPoints.join(" ")}
                            fill="none"
                            stroke="#00F0FF"
                            strokeWidth="1.2"
                            strokeDasharray="3 2"
                            opacity={0.65}
                          />
                        );
                      })()}

                      {/* Current Area & Path (Colored Solid Line) */}
                      {(() => {
                        const cPoints = data.map((d, i) => {
                          const x = subPadLeft + (i / (data.length - 1)) * subPlotW;
                          const a = d.channels[chIdx]?.currentA || 0;
                          const y = subPadTop + subPlotH - (a / maxCurrent) * subPlotH;
                          return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                        });

                        const areaPoints = [
                          `M ${subPadLeft} ${subPadTop + subPlotH}`,
                          ...data.map((d, i) => {
                            const x = subPadLeft + (i / (data.length - 1)) * subPlotW;
                            const a = d.channels[chIdx]?.currentA || 0;
                            const y = subPadTop + subPlotH - (a / maxCurrent) * subPlotH;
                            return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
                          }),
                          `L ${subPadLeft + subPlotW} ${subPadTop + subPlotH} Z`,
                        ];

                        return (
                          <>
                            <path
                              d={areaPoints.join(" ")}
                              fill={color}
                              opacity={0.12}
                            />
                            <path
                              d={cPoints.join(" ")}
                              fill="none"
                              stroke={color}
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </>
                        );
                      })()}

                      {/* Active Cursor Circle */}
                      {hoveredSampleIndex !== null && (
                        (() => {
                          const x =
                            subPadLeft +
                            (hoveredSampleIndex / (data.length - 1)) * subPlotW;
                          const a =
                            data[hoveredSampleIndex].channels[chIdx]?.currentA || 0;
                          const y =
                            subPadTop + subPlotH - (a / maxCurrent) * subPlotH;
                          return (
                            <circle
                              cx={x}
                              cy={y}
                              r="3.5"
                              fill={color}
                              stroke="#060709"
                              strokeWidth="1"
                            />
                          );
                        })()
                      )}

                      {/* Sub-chart time axis labels */}
                      <text
                        x={subPadLeft}
                        y={subPadTop + subPlotH + 14}
                        className="text-[8px] font-mono fill-slate-500"
                      >
                        06:00
                      </text>
                      <text
                        x={subPadLeft + subPlotW / 2}
                        y={subPadTop + subPlotH + 14}
                        textAnchor="middle"
                        className="text-[8px] font-mono fill-slate-400"
                      >
                        12:00
                      </text>
                      <text
                        x={subPadLeft + subPlotW}
                        y={subPadTop + subPlotH + 14}
                        textAnchor="end"
                        className="text-[8px] font-mono fill-slate-500"
                      >
                        18:00
                      </text>
                    </svg>
                  </div>

                  {/* Telemetry Numbers Strip */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-theme-subtle font-mono text-center">
                    <div>
                      <span className="text-[9px] uppercase text-theme-muted block truncate">
                        Current
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: isFuseCheck ? "#FF1744" : color }}
                      >
                        {currentValNow.toFixed(1)} A
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase text-theme-muted block truncate">
                        Voltage
                      </span>
                      <span className="text-xs font-bold text-[#00F0FF]">
                        {voltageValNow} V
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase text-theme-muted block truncate">
                        Live kW
                      </span>
                      <span className="text-xs font-bold text-theme-primary">
                        {((voltageValNow * currentValNow) / 1000).toFixed(1)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase text-theme-muted block truncate">
                        Avg kW
                      </span>
                      <span className="text-xs font-bold text-[#00E676]">
                        {avgPower}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
