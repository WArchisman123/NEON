"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Maximize2,
  ChevronRight,
  Crosshair,
  Activity,
} from "lucide-react";

export interface MpptChannelData {
  channel: number;
  voltageV: number;
  currentA: number;
  powerKw: number;
  status: "optimal" | "soiling_warning" | "fuse_check";
}

interface MpptStringScatterPlotProps {
  channels: MpptChannelData[];
}

type PlotMode = "iv" | "channel";

export function MpptStringScatterPlot({ channels }: MpptStringScatterPlotProps) {
  const [plotMode, setPlotMode] = useState<PlotMode>("channel");
  const [selectedChannelNum, setSelectedChannelNum] = useState<number>(7); // Default to soiling outlier
  const [hoveredChannel, setHoveredChannel] = useState<MpptChannelData | null>(null);

  // SVG Canvas Dimensions
  const width = 840;
  const height = 400;
  const paddingLeft = 70;
  const paddingRight = 40;
  const paddingTop = 35;
  const paddingBottom = 50;

  const chartW = width - paddingLeft - paddingRight; // 730
  const chartH = height - paddingTop - paddingBottom; // 315

  // Statistical Calculations
  const stats = useMemo(() => {
    if (!channels || channels.length === 0) {
      return {
        meanCurrent: 0,
        meanVoltage: 0,
        meanPower: 0,
        stdDevCurrent: 0,
        uniformityIndex: 100,
        totalPowerKw: 0,
        outliers: [],
      };
    }

    const n = channels.length;
    const sumCurrent = channels.reduce((acc, c) => acc + c.currentA, 0);
    const sumVoltage = channels.reduce((acc, c) => acc + c.voltageV, 0);
    const sumPower = channels.reduce((acc, c) => acc + c.powerKw, 0);

    const meanCurrent = sumCurrent / n;
    const meanVoltage = sumVoltage / n;
    const meanPower = sumPower / n;

    const varianceCurrent =
      channels.reduce((acc, c) => acc + Math.pow(c.currentA - meanCurrent, 2), 0) / n;
    const stdDevCurrent = Math.sqrt(varianceCurrent);

    const uniformityIndex = Math.max(
      0,
      Math.min(100, 100 - (stdDevCurrent / (meanCurrent || 1)) * 100)
    );

    const outliers = channels.filter(
      (c) => (c.currentA - meanCurrent) / meanCurrent < -0.15 || c.status !== "optimal"
    );

    return {
      meanCurrent: parseFloat(meanCurrent.toFixed(2)),
      meanVoltage: Math.round(meanVoltage),
      meanPower: parseFloat(meanPower.toFixed(2)),
      stdDevCurrent: parseFloat(stdDevCurrent.toFixed(2)),
      uniformityIndex: parseFloat(uniformityIndex.toFixed(1)),
      totalPowerKw: parseFloat(sumPower.toFixed(2)),
      outliers,
    };
  }, [channels]);

  // Selected Channel Object
  const selectedChannel = useMemo(() => {
    return (
      channels.find((c) => c.channel === selectedChannelNum) ||
      channels[0] || {
        channel: 1,
        voltageV: 645,
        currentA: 11.2,
        powerKw: 7.22,
        status: "optimal" as const,
      }
    );
  }, [channels, selectedChannelNum]);

  // Selected Deviations
  const selectedDeviations = useMemo(() => {
    const curDelta = selectedChannel.currentA - stats.meanCurrent;
    const curDeltaPct = stats.meanCurrent > 0 ? (curDelta / stats.meanCurrent) * 100 : 0;

    const voltDelta = selectedChannel.voltageV - stats.meanVoltage;
    const voltDeltaPct = stats.meanVoltage > 0 ? (voltDelta / stats.meanVoltage) * 100 : 0;

    const pwrDelta = selectedChannel.powerKw - stats.meanPower;
    const pwrDeltaPct = stats.meanPower > 0 ? (pwrDelta / stats.meanPower) * 100 : 0;

    return {
      curDelta: parseFloat(curDelta.toFixed(2)),
      curDeltaPct: parseFloat(curDeltaPct.toFixed(1)),
      voltDelta: Math.round(voltDelta),
      voltDeltaPct: parseFloat(voltDeltaPct.toFixed(1)),
      pwrDelta: parseFloat(pwrDelta.toFixed(2)),
      pwrDeltaPct: parseFloat(pwrDeltaPct.toFixed(1)),
    };
  }, [selectedChannel, stats]);

  // Domain Ranges for Cartesian Plot
  // Voltage (X-axis): 580V to 670V
  const minV = 580;
  const maxV = 670;
  // Current (Y-axis): 6.0A to 13.0A
  const minI = 6.0;
  const maxI = 13.0;

  // Coordinate Mapping Functions
  const getCoordinates = (channel: MpptChannelData) => {
    if (plotMode === "iv") {
      // X = Voltage, Y = Current
      const xClamped = Math.max(minV, Math.min(maxV, channel.voltageV));
      const yClamped = Math.max(minI, Math.min(maxI, channel.currentA));

      const x = paddingLeft + ((xClamped - minV) / (maxV - minV)) * chartW;
      const y = paddingTop + chartH - ((yClamped - minI) / (maxI - minI)) * chartH;
      return { x, y };
    } else {
      // X = Channel # (1 to 24), Y = Current
      const x = paddingLeft + ((channel.channel - 0.5) / 24) * chartW;
      const yClamped = Math.max(minI, Math.min(maxI, channel.currentA));
      const y = paddingTop + chartH - ((yClamped - minI) / (maxI - minI)) * chartH;
      return { x, y };
    }
  };

  // Centroid Coordinates
  const centroidCoords = useMemo(() => {
    if (plotMode === "iv") {
      const x = paddingLeft + ((stats.meanVoltage - minV) / (maxV - minV)) * chartW;
      const y = paddingTop + chartH - ((stats.meanCurrent - minI) / (maxI - minI)) * chartH;
      return { x, y };
    } else {
      const y = paddingTop + chartH - ((stats.meanCurrent - minI) / (maxI - minI)) * chartH;
      return { x: paddingLeft + chartW / 2, y };
    }
  }, [plotMode, stats, chartW, chartH]);

  // Nominal Cluster Bounding Box in IV Mode
  const nominalEnvelope = useMemo(() => {
    // Normal strings cluster between ~635V to ~655V and ~10.4A to ~11.8A
    const envMinV = 634;
    const envMaxV = 656;
    const envMinI = 10.3;
    const envMaxI = 11.9;

    const x1 = paddingLeft + ((envMinV - minV) / (maxV - minV)) * chartW;
    const x2 = paddingLeft + ((envMaxV - minV) / (maxV - minV)) * chartW;
    const yTop = paddingTop + chartH - ((envMaxI - minI) / (maxI - minI)) * chartH;
    const yBottom = paddingTop + chartH - ((envMinI - minI) / (maxI - minI)) * chartH;

    return {
      x: x1,
      y: yTop,
      width: x2 - x1,
      height: yBottom - yTop,
    };
  }, [chartW, chartH]);

  const activeFocus = hoveredChannel || selectedChannel;
  const activeCoords = getCoordinates(activeFocus);

  const ch07 = useMemo(() => channels.find((c) => c.channel === 7), [channels]);
  const ch19 = useMemo(() => channels.find((c) => c.channel === 19), [channels]);

  const coords07 = ch07 ? getCoordinates(ch07) : null;
  const coords19 = ch19 ? getCoordinates(ch19) : null;

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD600]/80 to-transparent" />

      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="size-4 text-[#FFD600]" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-white font-mono flex items-center gap-2">
              <span>24-Channel MPPT String Scatter Plot &amp; Outlier Analyzer</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30 lowercase">
                cartesian plane
              </span>
            </h3>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Multivariate scatter distribution mapping operational string current against voltage. Anomalous outliers visibly decouple from the nominal operating cluster.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#121622] border border-white/[0.06] font-mono self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setPlotMode("iv")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              plotMode === "iv"
                ? "bg-[#FFD600] text-black shadow-[0_0_12px_rgba(255,214,0,0.35)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Activity className="size-3" />
            <span>Voltage vs Current (I-V Plane)</span>
          </button>

          <button
            type="button"
            onClick={() => setPlotMode("channel")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              plotMode === "channel"
                ? "bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Layers className="size-3" />
            <span>Channel # vs Current</span>
          </button>
        </div>
      </div>

      {/* Fleet Statistical Benchmarks Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Fleet Centroid (V, I)
          </span>
          <div className="text-base sm:text-lg font-bold text-[#FFD600] mt-0.5">
            {stats.meanVoltage}V, {stats.meanCurrent}A
          </div>
          <span className="text-[10px] text-slate-500">Array Operating Center</span>
        </div>

        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Current Std Dev (σ)
          </span>
          <div className="text-base sm:text-lg font-bold text-white mt-0.5">
            ±{stats.stdDevCurrent} A
          </div>
          <span className="text-[10px] text-slate-500">Tight Cluster Metric</span>
        </div>

        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Monitored Output
          </span>
          <div className="text-base sm:text-lg font-bold text-[#00E676] mt-0.5">
            {stats.totalPowerKw} kW
          </div>
          <span className="text-[10px] text-slate-500">24 Active MPPTs</span>
        </div>

        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Uniformity Index
          </span>
          <div className="text-base sm:text-lg font-bold text-[#00F0FF] mt-0.5">
            {stats.uniformityIndex}%
          </div>
          <span className="text-[10px] text-slate-500">Cluster Density</span>
        </div>

        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Decoupled Outliers
          </span>
          <div className="text-base sm:text-lg font-bold text-[#FF1744] mt-0.5 flex items-center gap-1.5">
            <span>{stats.outliers.length}</span>
            <span className="text-xs font-normal text-slate-400">Strings</span>
          </div>
          <span className="text-[10px] text-[#FFAB00]">Outside Tolerance</span>
        </div>

        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Active Selection
          </span>
          <div className="text-xs font-bold text-[#FF2A85] mt-1">
            String #{selectedChannel.channel.toString().padStart(2, "0")}
          </div>
          <span className="text-[10px] text-slate-500">Click dot to inspect</span>
        </div>
      </div>

      {/* Legend and Outlier Callout Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#121622]/60 border border-white/[0.04] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#FFD600] shadow-[0_0_8px_rgba(255,214,0,0.5)]" />
            <span className="text-white font-medium">Nominal Operating Cluster (22 Strings)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#FFAB00] shadow-[0_0_8px_rgba(255,171,0,0.6)] animate-pulse" />
            <span className="text-amber-300 font-medium">String #07: Soiling Outlier (-32.0%)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#FF1744] shadow-[0_0_8px_rgba(255,23,68,0.7)] animate-pulse" />
            <span className="text-red-300 font-medium">String #19: Fuse / Voltage Outlier (-24.1%)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 border-t border-dashed border-[#00F0FF]" />
            <span className="text-slate-300 font-medium">Fleet Centroid (x̄, ȳ)</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          Hover / click any node for crosshair breakdown
        </span>
      </div>

      {/* Responsive SVG Scatter Plot Canvas */}
      <div className="relative overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none overflow-visible font-mono"
          >
            <defs>
              {/* Radial Glow Filters */}
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="envelopeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E676" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#00E676" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Canvas Outer Border */}
            <rect
              x={paddingLeft}
              y={paddingTop}
              width={chartW}
              height={chartH}
              fill="#060709"
              stroke="rgba(255,255,255,0.08)"
              rx="6"
            />

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {[6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0].map((currentVal) => {
              const yPos = paddingTop + chartH - ((currentVal - minI) / (maxI - minI)) * chartH;
              return (
                <g key={`y-grid-${currentVal}`}>
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={paddingLeft + chartW}
                    y2={yPos}
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={yPos + 3.5}
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {currentVal.toFixed(1)} A
                  </text>
                </g>
              );
            })}

            {/* Y-Axis Title */}
            <text
              transform={`rotate(-90 ${paddingLeft - 48} ${paddingTop + chartH / 2})`}
              x={paddingLeft - 48}
              y={paddingTop + chartH / 2}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="11"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              STRING CURRENT (AMPERES)
            </text>

            {/* X-Axis Gridlines & Labels */}
            {plotMode === "iv" ? (
              // Voltage Scale
              [580, 600, 620, 640, 660].map((voltVal) => {
                const xPos = paddingLeft + ((voltVal - minV) / (maxV - minV)) * chartW;
                return (
                  <g key={`x-grid-${voltVal}`}>
                    <line
                      x1={xPos}
                      y1={paddingTop}
                      x2={xPos}
                      y2={paddingTop + chartH}
                      stroke="rgba(255,255,255,0.05)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={xPos}
                      y={paddingTop + chartH + 18}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {voltVal} V
                    </text>
                  </g>
                );
              })
            ) : (
              // Channel Numbers 1 to 24
              Array.from({ length: 24 }, (_, i) => i + 1).map((ch) => {
                const xPos = paddingLeft + ((ch - 0.5) / 24) * chartW;
                return (
                  <g key={`ch-grid-${ch}`}>
                    <line
                      x1={xPos}
                      y1={paddingTop}
                      x2={xPos}
                      y2={paddingTop + chartH}
                      stroke="rgba(255,255,255,0.03)"
                    />
                    <text
                      x={xPos}
                      y={paddingTop + chartH + 18}
                      textAnchor="middle"
                      fill={ch % 2 === 0 ? "#64748B" : "#94A3B8"}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      #{ch.toString().padStart(2, "0")}
                    </text>
                  </g>
                );
              })
            )}

            {/* X-Axis Title */}
            <text
              x={paddingLeft + chartW / 2}
              y={paddingTop + chartH + 38}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="11"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              {plotMode === "iv"
                ? "STRING DC VOLTAGE (VOLTS)"
                : "MPPT STRING CHANNEL NUMBER (#01 — #24)"}
            </text>

            {/* Nominal Operating Cluster Envelope in IV Mode */}
            {plotMode === "iv" && (
              <g>
                {/* Cluster Shaded Bounding Box */}
                <rect
                  x={nominalEnvelope.x}
                  y={nominalEnvelope.y}
                  width={nominalEnvelope.width}
                  height={nominalEnvelope.height}
                  fill="url(#envelopeGradient)"
                  stroke="#00E676"
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                  rx="10"
                  opacity="0.8"
                />
                <text
                  x={nominalEnvelope.x + 8}
                  y={nominalEnvelope.y + 14}
                  fill="#00E676"
                  fontSize="9.5"
                  fontWeight="bold"
                  opacity="0.9"
                >
                  ✓ Nominal Cluster (±10% Tolerance)
                </text>
              </g>
            )}

            {/* Nominal Fleet Current Band in Channel Mode */}
            {plotMode === "channel" && (
              <g>
                <rect
                  x={paddingLeft}
                  y={
                    paddingTop +
                    chartH -
                    ((Math.min(maxI, stats.meanCurrent * 1.08) - minI) / (maxI - minI)) * chartH
                  }
                  width={chartW}
                  height={((stats.meanCurrent * 0.16) / (maxI - minI)) * chartH}
                  fill="url(#envelopeGradient)"
                  stroke="#00E676"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <text
                  x={paddingLeft + 10}
                  y={
                    paddingTop +
                    chartH -
                    ((Math.min(maxI, stats.meanCurrent * 1.08) - minI) / (maxI - minI)) * chartH - 5
                  }
                  fill="#00E676"
                  fontSize="9.5"
                  fontWeight="bold"
                  opacity="0.85"
                >
                  ✓ Nominal Fleet Current Band (±8% Tolerance)
                </text>
              </g>
            )}

            {/* Fleet Centroid Reference Crosshairs */}
            <line
              x1={paddingLeft}
              y1={centroidCoords.y}
              x2={paddingLeft + chartW}
              y2={centroidCoords.y}
              stroke="#00F0FF"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            {plotMode === "iv" && (
              <line
                x1={centroidCoords.x}
                y1={paddingTop}
                x2={centroidCoords.x}
                y2={paddingTop + chartH}
                stroke="#00F0FF"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
            )}

            {/* Interactive Crosshairs for Focused Node */}
            {activeFocus && (
              <g>
                <line
                  x1={paddingLeft}
                  y1={activeCoords.y}
                  x2={paddingLeft + chartW}
                  y2={activeCoords.y}
                  stroke="#FF2A85"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                  opacity="0.8"
                />
                <line
                  x1={activeCoords.x}
                  y1={paddingTop}
                  x2={activeCoords.x}
                  y2={paddingTop + chartH}
                  stroke="#FF2A85"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                  opacity="0.8"
                />

                {/* Y-Axis Value Callout Badge */}
                <rect
                  x={paddingLeft - 45}
                  y={activeCoords.y - 9}
                  width="38"
                  height="18"
                  fill="#FF2A85"
                  rx="3"
                />
                <text
                  x={paddingLeft - 26}
                  y={activeCoords.y + 3.5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  {activeFocus.currentA}A
                </text>

                {/* X-Axis Value Callout Badge */}
                {plotMode === "iv" && (
                  <>
                    <rect
                      x={activeCoords.x - 22}
                      y={paddingTop + chartH + 2}
                      width="44"
                      height="18"
                      fill="#FF2A85"
                      rx="3"
                    />
                    <text
                      x={activeCoords.x}
                      y={paddingTop + chartH + 14}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {activeFocus.voltageV}V
                    </text>
                  </>
                )}
              </g>
            )}

            {/* Outlier Connecting Annotations */}
            {coords07 && coords19 && (
              <>
                {plotMode === "iv" ? (
                  <>
                    {/* Annotation for String #07 (Soiling) in IV Mode */}
                    <g>
                      <line
                        x1={coords07.x}
                        y1={coords07.y}
                        x2={coords07.x + 35}
                        y2={coords07.y + 20}
                        stroke="#FFAB00"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <rect
                        x={coords07.x + 35}
                        y={coords07.y + 10}
                        width="130"
                        height="20"
                        fill="#121622"
                        stroke="#FFAB00"
                        rx="4"
                      />
                      <text
                        x={coords07.x + 42}
                        y={coords07.y + 24}
                        fill="#FFAB00"
                        fontSize="9.5"
                        fontWeight="bold"
                      >
                        #07: SOILING (-32%)
                      </text>
                    </g>

                    {/* Annotation for String #19 (Fuse) in IV Mode */}
                    <g>
                      <line
                        x1={coords19.x}
                        y1={coords19.y}
                        x2={coords19.x - 30}
                        y2={coords19.y - 20}
                        stroke="#FF1744"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <rect
                        x={coords19.x - 145}
                        y={coords19.y - 30}
                        width="110"
                        height="20"
                        fill="#121622"
                        stroke="#FF1744"
                        rx="4"
                      />
                      <text
                        x={coords19.x - 140}
                        y={coords19.y - 16}
                        fill="#FF1744"
                        fontSize="9.5"
                        fontWeight="bold"
                      >
                        #19: FUSE CHECK
                      </text>
                    </g>
                  </>
                ) : (
                  <>
                    {/* Annotation for String #07 (Soiling) in Channel Mode */}
                    <g>
                      <line
                        x1={coords07.x}
                        y1={coords07.y}
                        x2={coords07.x}
                        y2={coords07.y + 22}
                        stroke="#FFAB00"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <rect
                        x={coords07.x - 65}
                        y={coords07.y + 22}
                        width="130"
                        height="20"
                        fill="#121622"
                        stroke="#FFAB00"
                        rx="4"
                      />
                      <text
                        x={coords07.x}
                        y={coords07.y + 36}
                        textAnchor="middle"
                        fill="#FFAB00"
                        fontSize="9.5"
                        fontWeight="bold"
                      >
                        #07: SOILING (-32%)
                      </text>
                    </g>

                    {/* Annotation for String #19 (Fuse) in Channel Mode */}
                    <g>
                      <line
                        x1={coords19.x}
                        y1={coords19.y}
                        x2={coords19.x}
                        y2={coords19.y + 22}
                        stroke="#FF1744"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <rect
                        x={coords19.x - 55}
                        y={coords19.y + 22}
                        width="110"
                        height="20"
                        fill="#121622"
                        stroke="#FF1744"
                        rx="4"
                      />
                      <text
                        x={coords19.x}
                        y={coords19.y + 36}
                        textAnchor="middle"
                        fill="#FF1744"
                        fontSize="9.5"
                        fontWeight="bold"
                      >
                        #19: FUSE CHECK
                      </text>
                    </g>
                  </>
                )}
              </>
            )}

            {/* Scatter Plot Nodes (All 24 Channels) */}
            {channels.map((ch) => {
              const { x, y } = getCoordinates(ch);
              const isSelected = ch.channel === selectedChannelNum;
              const isHovered = hoveredChannel?.channel === ch.channel;
              const isFuseOutlier = ch.status === "fuse_check";
              const isSoilingOutlier = ch.status === "soiling_warning";

              let nodeColor = "#FFD600";
              let filter = "url(#glow-gold)";
              let radius = 6.5;

              if (isFuseOutlier) {
                nodeColor = "#FF1744";
                filter = "url(#glow-red)";
                radius = 8;
              } else if (isSoilingOutlier) {
                nodeColor = "#FFAB00";
                filter = "url(#glow-amber)";
                radius = 8;
              }

              return (
                <g
                  key={ch.channel}
                  className="cursor-pointer transition-transform duration-100"
                  onClick={() => setSelectedChannelNum(ch.channel)}
                  onMouseEnter={() => setHoveredChannel(ch)}
                  onMouseLeave={() => setHoveredChannel(null)}
                >
                  {/* Invisible generous hit target (48x48) for touch devices */}
                  <circle cx={x} cy={y} r="24" fill="transparent" />

                  {/* Concentric Warning Ring for Outliers */}
                  {(isFuseOutlier || isSoilingOutlier) && (
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 5}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                  )}

                  {/* Selected Active Ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 4}
                      fill="none"
                      stroke="#FF2A85"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Scatter Node Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? radius + 2 : radius}
                    fill={nodeColor}
                    stroke="#0B0D13"
                    strokeWidth="2"
                    filter={filter}
                  />

                  {/* Channel Number Text inside/beside dot */}
                  <text
                    x={x}
                    y={y - radius - 4}
                    textAnchor="middle"
                    fill={isSelected ? "#FF2A85" : nodeColor}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    #{ch.channel.toString().padStart(2, "0")}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Interactive Deep Diagnostic Inspection Card */}
      <div className="rounded-xl bg-[#121622] border border-white/[0.08] p-4 sm:p-5 font-mono space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FF2A85]/10 border border-[#FF2A85]/30 text-[#FF2A85]">
              <Maximize2 className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight uppercase">
                  String #{selectedChannel.channel.toString().padStart(2, "0")} Diagnostic Analysis
                </h4>
                {selectedChannel.status === "fuse_check" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/40 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    DECOUPLED OUTLIER (FUSE BLOWN / UNDER-VOLTAGE)
                  </span>
                ) : selectedChannel.status === "soiling_warning" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFAB00]/20 text-[#FFAB00] border border-[#FFAB00]/40 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    SOILING / SHADING OUTLIER
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40 flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    NOMINAL CLUSTER PERFORMANCE
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                Array Combiner Block:{" "}
                {selectedChannel.channel <= 6
                  ? "CB-01 (Zone East-1)"
                  : selectedChannel.channel <= 12
                  ? "CB-02 (Zone East-2)"
                  : selectedChannel.channel <= 18
                  ? "CB-03 (Zone West-1)"
                  : "CB-04 (Zone West-2)"}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 sm:text-right">
            <span>Sampling Interval: </span>
            <span className="text-white font-bold">1s CANbus Feed</span>
          </div>
        </div>

        {/* 4-Metric Electrical Vector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#0B0D13] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Operating Current
            </span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                selectedDeviations.curDeltaPct <= -25
                  ? "text-[#FF1744]"
                  : selectedDeviations.curDeltaPct <= -12
                  ? "text-[#FFAB00]"
                  : "text-[#FFD600]"
              }`}
            >
              {selectedChannel.currentA} A
            </div>
            <span className="text-[10px] text-slate-400">
              Δ vs Fleet:{" "}
              <strong
                className={
                  selectedDeviations.curDeltaPct < 0
                    ? "text-[#FF1744]"
                    : "text-[#00E676]"
                }
              >
                {selectedDeviations.curDelta >= 0 ? "+" : ""}
                {selectedDeviations.curDelta} A ({selectedDeviations.curDeltaPct}%)
              </strong>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#0B0D13] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              String DC Voltage
            </span>
            <div className="text-lg font-bold text-white mt-0.5">
              {selectedChannel.voltageV} V
            </div>
            <span className="text-[10px] text-slate-400">
              Δ vs Fleet:{" "}
              <strong
                className={
                  selectedDeviations.voltDeltaPct < 0
                    ? "text-amber-400"
                    : "text-slate-200"
                }
              >
                {selectedDeviations.voltDelta >= 0 ? "+" : ""}
                {selectedDeviations.voltDelta} V ({selectedDeviations.voltDeltaPct}%)
              </strong>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#0B0D13] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Instantaneous Yield
            </span>
            <div className="text-lg font-bold text-[#00E676] mt-0.5">
              {selectedChannel.powerKw} kW
            </div>
            <span className="text-[10px] text-slate-400">
              Fleet Average: {stats.meanPower} kW
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#0B0D13] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Performance Ratio (PR)
            </span>
            <div className="text-lg font-bold text-[#00F0FF] mt-0.5">
              {(
                Math.max(
                  45,
                  Math.min(99, 82.4 + selectedDeviations.curDeltaPct * 0.8)
                )
              ).toFixed(1)}
              %
            </div>
            <span className="text-[10px] text-slate-400">IEC 61724 Normalized</span>
          </div>
        </div>

        {/* Actionable Root-Cause Field Recommendation */}
        <div
          className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            selectedChannel.status === "fuse_check"
              ? "bg-[#FF1744]/10 border-[#FF1744]/40 text-[#FF1744]"
              : selectedChannel.status === "soiling_warning"
              ? "bg-[#FFAB00]/10 border-[#FFAB00]/40 text-[#FFAB00]"
              : "bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <Wrench className="size-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold">
                {selectedChannel.status === "fuse_check"
                  ? "Recommended Field Action: Combiner DC Fuse Inspection"
                  : selectedChannel.status === "soiling_warning"
                  ? "Recommended Field Action: Module Washing / Drone IR Thermography"
                  : "Diagnostic Status: Nominal String Operating in Main Cluster"}
              </strong>
              <span className="text-slate-300 text-[11px] block mt-0.5">
                {selectedChannel.status === "fuse_check"
                  ? "Current output is 24% below peer average. Suspected blown 15A inline DC fuse on negative leg or MC4 connector thermal degradation. Dispatch certified field technician with clamp meter."
                  : selectedChannel.status === "soiling_warning"
                  ? "Current output is 32% below peer array average. Module glass accumulation or partial localized shading detected. Schedule robotic dry-wash cycle or drone IR thermography sweep."
                  : "String voltage and current cluster closely with peer channels within ±2.5% tolerance. No maintenance intervention required."}
              </span>
            </div>
          </div>

          {(selectedChannel.status === "fuse_check" ||
            selectedChannel.status === "soiling_warning") && (
            <a
              href="/maintenance"
              className="px-3 py-1.5 rounded-lg bg-[#FF2A85] hover:bg-[#ff4396] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(255,42,133,0.35)] shrink-0 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Dispatch Service</span>
              <ChevronRight className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
