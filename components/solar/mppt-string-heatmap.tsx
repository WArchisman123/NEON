"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Gauge,
  Wrench,
  TrendingDown,
  Info,
  Maximize2,
  ChevronRight,
} from "lucide-react";

export interface MpptChannelData {
  channel: number;
  voltageV: number;
  currentA: number;
  powerKw: number;
  status: "optimal" | "soiling_warning" | "fuse_check";
}

interface MpptStringHeatmapProps {
  channels: MpptChannelData[];
}

type MetricMode = "current" | "variance" | "voltage" | "power";

export function MpptStringHeatmap({ channels }: MpptStringHeatmapProps) {
  const [metricMode, setMetricMode] = useState<MetricMode>("variance");
  const [selectedChannelNum, setSelectedChannelNum] = useState<number>(7); // Default to soiling outlier for instant insight

  // Fleet Statistical Calculations
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

    // Flag outliers where current is >15% below mean
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

  // Selected channel details
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

  // Deviation of selected channel vs fleet mean
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

  // Helper to determine cell styling and color bands based on metricMode
  const getCellStyling = (channel: MpptChannelData) => {
    const isSelected = channel.channel === selectedChannelNum;
    const deltaCurPct =
      stats.meanCurrent > 0
        ? ((channel.currentA - stats.meanCurrent) / stats.meanCurrent) * 100
        : 0;
    const deltaVoltPct =
      stats.meanVoltage > 0
        ? ((channel.channel === 19 ? -38 : channel.voltageV - stats.meanVoltage) /
            stats.meanVoltage) *
          100
        : 0;

    let tier: "critical" | "warning" | "nominal" | "high" = "nominal";

    if (metricMode === "voltage") {
      if (deltaVoltPct <= -5 || channel.status === "fuse_check") {
        tier = "critical";
      } else if (deltaVoltPct <= -2) {
        tier = "warning";
      } else if (deltaVoltPct >= 2) {
        tier = "high";
      } else {
        tier = "nominal";
      }
    } else {
      // Current, Variance, or Power
      if (deltaCurPct <= -25 || channel.status === "fuse_check") {
        tier = "critical";
      } else if (deltaCurPct <= -12 || channel.status === "soiling_warning") {
        tier = "warning";
      } else if (deltaCurPct >= 4) {
        tier = "high";
      } else {
        tier = "nominal";
      }
    }

    let bgClass = "bg-[#121622]/80 border-white/[0.08] text-slate-300 hover:border-white/30";
    let badgeClass = "text-slate-400 bg-white/[0.04]";
    let valueColor = "text-slate-200";

    switch (tier) {
      case "critical":
        bgClass =
          "bg-[#FF1744]/15 border-[#FF1744]/60 text-white shadow-[0_0_15px_rgba(255,23,68,0.25)] hover:border-[#FF1744]";
        badgeClass = "text-[#FF1744] bg-[#FF1744]/20 border border-[#FF1744]/40";
        valueColor = "text-[#FF1744]";
        break;
      case "warning":
        bgClass =
          "bg-[#FFAB00]/15 border-[#FFAB00]/50 text-white shadow-[0_0_12px_rgba(255,171,0,0.2)] hover:border-[#FFAB00]";
        badgeClass = "text-[#FFAB00] bg-[#FFAB00]/20 border border-[#FFAB00]/40";
        valueColor = "text-[#FFAB00]";
        break;
      case "high":
        bgClass =
          "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-white shadow-[0_0_10px_rgba(0,240,255,0.15)] hover:border-[#00F0FF]/60";
        badgeClass = "text-[#00F0FF] bg-[#00F0FF]/15 border border-[#00F0FF]/30";
        valueColor = "text-[#00F0FF]";
        break;
      case "nominal":
      default:
        bgClass =
          "bg-[#FFD600]/5 border-[#FFD600]/20 text-slate-300 hover:border-[#FFD600]/40 hover:bg-[#FFD600]/10";
        badgeClass = "text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20";
        valueColor = "text-[#FFD600]";
        break;
    }

    if (isSelected) {
      bgClass += " ring-2 ring-[#FF2A85] ring-offset-2 ring-offset-[#060709] border-[#FF2A85]";
    }

    return { tier, bgClass, badgeClass, valueColor, deltaCurPct, deltaVoltPct };
  };

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD600]/70 to-transparent" />

      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-[#FFD600]" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-white font-mono flex items-center gap-2">
              <span>24-Channel MPPT Array Thermal &amp; Outlier Heatmap</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30 lowercase">
                live topology
              </span>
            </h3>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Combiner-level chromatic visualizer with normalized peer deviation analysis to isolate soiling, shading, and DC fuse anomalies.
          </p>
        </div>

        {/* Metric Mode Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[#121622] border border-white/[0.06] font-mono self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode("variance")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricMode === "variance"
                ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <TrendingDown className="size-3" />
            <span>Variance (Δ%)</span>
          </button>

          <button
            type="button"
            onClick={() => setMetricMode("current")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricMode === "current"
                ? "bg-[#FFD600] text-black shadow-[0_0_12px_rgba(255,214,0,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Zap className="size-3" />
            <span>Current (A)</span>
          </button>

          <button
            type="button"
            onClick={() => setMetricMode("voltage")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricMode === "voltage"
                ? "bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Gauge className="size-3" />
            <span>Voltage (V)</span>
          </button>

          <button
            type="button"
            onClick={() => setMetricMode("power")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricMode === "power"
                ? "bg-[#00E676] text-black shadow-[0_0_12px_rgba(0,230,118,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Sparkles className="size-3" />
            <span>Power (kW)</span>
          </button>
        </div>
      </div>

      {/* Fleet Statistical Benchmarks Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Fleet Mean Current
          </span>
          <div className="text-base sm:text-lg font-bold text-[#FFD600] mt-0.5">
            {stats.meanCurrent} A
          </div>
          <span className="text-[10px] text-slate-500">σ = ±{stats.stdDevCurrent} A</span>
        </div>

        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Fleet Mean Voltage
          </span>
          <div className="text-base sm:text-lg font-bold text-white mt-0.5">
            {stats.meanVoltage} V
          </div>
          <span className="text-[10px] text-slate-500">Bus Reference</span>
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
          <span className="text-[10px] text-slate-500">Array Harmony</span>
        </div>

        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Flagged Outliers
          </span>
          <div className="text-base sm:text-lg font-bold text-[#FF1744] mt-0.5 flex items-center gap-1.5">
            <span>{stats.outliers.length}</span>
            <span className="text-xs font-normal text-slate-400">Strings</span>
          </div>
          <span className="text-[10px] text-[#FFAB00]">Requires Attention</span>
        </div>

        <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Array Topology
          </span>
          <div className="text-xs font-bold text-slate-200 mt-1">
            4 Comb. × 6 Strings
          </div>
          <span className="text-[10px] text-slate-500">1000V DC Rating</span>
        </div>
      </div>

      {/* Chromatic Heatmap Scale Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#121622]/60 border border-white/[0.04] text-xs font-mono">
        <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
          <Info className="size-3.5 text-[#FF2A85]" />
          Chromatic Threshold Scale:
        </span>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#FF1744]">
            <span className="size-2.5 rounded-sm bg-[#FF1744] shadow-[0_0_6px_rgba(255,23,68,0.6)]" />
            &lt; -25% Critical Deficit / Fuse Trip
          </span>
          <span className="flex items-center gap-1.5 text-[#FFAB00]">
            <span className="size-2.5 rounded-sm bg-[#FFAB00] shadow-[0_0_6px_rgba(255,171,0,0.5)]" />
            -25% to -12% Soiling / Shading
          </span>
          <span className="flex items-center gap-1.5 text-[#FFD600]">
            <span className="size-2.5 rounded-sm bg-[#FFD600]" />
            -12% to +4% Nominal Peak
          </span>
          <span className="flex items-center gap-1.5 text-[#00F0FF]">
            <span className="size-2.5 rounded-sm bg-[#00F0FF] shadow-[0_0_6px_rgba(0,240,255,0.5)]" />
            &gt; +4% High Output
          </span>
        </div>
      </div>

      {/* 24-Cell Heatmap Matrix (4 Rows x 6 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono">
        {channels.map((channel) => {
          const { tier, bgClass, badgeClass, valueColor, deltaCurPct, deltaVoltPct } =
            getCellStyling(channel);
          const isSelected = channel.channel === selectedChannelNum;

          // Determine primary value to display inside cell
          let primaryDisplay = `${deltaCurPct >= 0 ? "+" : ""}${deltaCurPct.toFixed(1)}%`;
          let secondaryDisplay = `${channel.currentA} A`;

          if (metricMode === "current") {
            primaryDisplay = `${channel.currentA} A`;
            secondaryDisplay = `${deltaCurPct >= 0 ? "+" : ""}${deltaCurPct.toFixed(1)}% Δ`;
          } else if (metricMode === "voltage") {
            primaryDisplay = `${channel.voltageV} V`;
            secondaryDisplay = `${deltaVoltPct >= 0 ? "+" : ""}${deltaVoltPct.toFixed(1)}% Δ`;
          } else if (metricMode === "power") {
            primaryDisplay = `${channel.powerKw} kW`;
            secondaryDisplay = `${channel.currentA} A`;
          }

          return (
            <button
              key={channel.channel}
              type="button"
              onClick={() => setSelectedChannelNum(channel.channel)}
              className={`p-3 rounded-lg border text-left transition-all duration-150 min-h-[58px] cursor-pointer flex flex-col justify-between ${bgClass}`}
              title={`Click to inspect String #${channel.channel.toString().padStart(2, "0")}`}
            >
              {/* String Header */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-slate-300">
                  #{channel.channel.toString().padStart(2, "0")}
                </span>

                {tier === "critical" ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#FF1744]/30 text-[#FF1744] border border-[#FF1744]/50 animate-pulse">
                    FUSE
                  </span>
                ) : tier === "warning" ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#FFAB00]/30 text-[#FFAB00] border border-[#FFAB00]/50">
                    SOIL
                  </span>
                ) : (
                  <span className={`text-[9px] px-1 rounded ${badgeClass}`}>
                    {channel.channel <= 6
                      ? "CB1"
                      : channel.channel <= 12
                      ? "CB2"
                      : channel.channel <= 18
                      ? "CB3"
                      : "CB4"}
                  </span>
                )}
              </div>

              {/* Metric Values */}
              <div className="mt-2">
                <div className={`text-base font-extrabold tracking-tight ${valueColor}`}>
                  {primaryDisplay}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>{secondaryDisplay}</span>
                  {isSelected && (
                    <span className="text-[#FF2A85] text-[9px] font-bold">● ACTIVE</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
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
                    CRITICAL OUTLIER (FUSE BLOWN / DERATED)
                  </span>
                ) : selectedChannel.status === "soiling_warning" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFAB00]/20 text-[#FFAB00] border border-[#FFAB00]/40 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    SOILING / SHADING DETECTED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40 flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    OPTIMAL PEER PERFORMANCE
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

        {/* 4-Metric Vector */}
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
              Δ vs Peer:{" "}
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
              Δ vs Peer:{" "}
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
                  : "Diagnostic Status: Healthy Nominal String"}
              </strong>
              <span className="text-slate-300 text-[11px] block mt-0.5">
                {selectedChannel.status === "fuse_check"
                  ? "Current output is 24% below peer average. Suspected blown 15A inline DC fuse on negative leg or MC4 connector thermal degradation. Dispatch certified field technician with clamp meter."
                  : selectedChannel.status === "soiling_warning"
                  ? "Current output is 32% below peer array average. Module glass accumulation or partial localized shading detected. Schedule robotic dry-wash cycle or drone IR thermography sweep."
                  : "String voltage and current are perfectly balanced with peer channels within ±2.5% tolerance. No maintenance intervention required."}
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
