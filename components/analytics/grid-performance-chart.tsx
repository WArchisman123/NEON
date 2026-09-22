"use client";

import React, { useState, useMemo } from "react";
import { Zap } from "lucide-react";
import { HourlyTelemetryRecord } from "@/lib/energy/types";

interface GridPerformanceChartProps {
  initialData: HourlyTelemetryRecord[];
  peakTariffRate: number;
  offpeakTariffRate: number;
}

interface GridDataPoint {
  timestamp: string;
  timeLabel: string;
  importKw: number;
  exportKw: number;
  tariff: number;
  isPeak: boolean;
}

export function GridPerformanceChart({
  initialData,
  peakTariffRate,
  offpeakTariffRate,
}: GridPerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d">("today");
  const [hoveredPoint, setHoveredPoint] = useState<GridDataPoint | null>(null);

  const displayData = useMemo(() => {
    let source = [...initialData];
    if (timeframe === "today") {
      source = source.slice(-24);
    } else if (timeframe === "7d") {
      source = source.slice(-168);
    } else {
      source = source.slice(-720);
    }

    const step = timeframe === "today" ? 1 : timeframe === "7d" ? 4 : 12;
    const sampled = [];

    for (let i = 0; i < source.length; i += step) {
      const item = source[i];
      const hour = new Date(item.bucket_timestamp).getHours();

      const importKw = item.grid_import_kwh || 0;
      const exportKw = item.grid_export_kwh || 0;
      const isPeak = hour >= 18 && hour <= 22;
      const tariff = isPeak ? peakTariffRate : offpeakTariffRate;

      sampled.push({
        timestamp: item.bucket_timestamp,
        timeLabel:
          timeframe === "today"
            ? `${hour.toString().padStart(2, "0")}:00`
            : new Date(item.bucket_timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        importKw,
        exportKw,
        tariff,
        isPeak,
      });
    }

    return sampled;
  }, [initialData, timeframe, peakTariffRate, offpeakTariffRate]);

  const maxKw = useMemo(() => {
    const highest = Math.max(
      ...displayData.map((d) => Math.max(d.importKw, d.exportKw, 100)),
      200
    );
    return Math.ceil((highest * 1.2) / 50) * 50;
  }, [displayData]);

  const width = 850;
  const height = 300;
  const paddingLeft = 65;
  const paddingRight = 65;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (displayData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (displayData.length - 1)) * chartW;
  };

  const getYPower = (kw: number) => {
    const clamped = Math.max(0, Math.min(maxKw, kw));
    return paddingTop + chartH - (clamped / maxKw) * chartH;
  };

  const makeLinePath = (key: "importKw" | "exportKw") => {
    if (displayData.length === 0) return "";
    return displayData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYPower(d[key]).toFixed(1)}`)
      .join(" ");
  };

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
      {/* Top Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-[#9D4EDD]" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-white">
              Grid Exchange & Time-of-Use (TOU) Tariff Arbitrage
            </h3>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Utility Import / Export exchange (kW) mapped against TOU energy pricing slots
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="inline-flex rounded-lg bg-[#121622] p-1 border border-white/[0.06] font-mono text-xs">
          <button
            type="button"
            onClick={() => setTimeframe("today")}
            className={`px-3 py-1 rounded-md transition-all ${
              timeframe === "today"
                ? "bg-[#9D4EDD] text-white font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Today (15m)
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("7d")}
            className={`px-3 py-1 rounded-md transition-all ${
              timeframe === "7d"
                ? "bg-[#9D4EDD] text-white font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("30d")}
            className={`px-3 py-1 rounded-md transition-all ${
              timeframe === "30d"
                ? "bg-[#9D4EDD] text-white font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#9D4EDD]" />
            <span className="text-white font-medium">Grid Import (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#00E676]" />
            <span className="text-white font-medium">Grid Export Feed-in (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#FF2A85]/20 border border-[#FF2A85]" />
            <span className="text-[#FF2A85] font-medium">Peak Window ($0.18/kWh)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Tariff: Off-Peak <span className="text-white font-bold">${offpeakTariffRate}/kWh</span> • Peak <span className="text-[#FF2A85] font-bold">${peakTariffRate}/kWh</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[650px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none overflow-visible"
          >
            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = paddingTop + chartH * (1 - pct);
              const kwVal = Math.round(maxKw * pct);
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={yVal}
                    x2={width - paddingRight}
                    y2={yVal}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={yVal + 3.5}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {kwVal} kW
                  </text>
                </g>
              );
            })}

            {/* Grid Import Line (Purple) */}
            <path
              d={makeLinePath("importKw")}
              fill="none"
              stroke="#9D4EDD"
              strokeWidth="2.5"
            />

            {/* Grid Export Line (Green) */}
            <path
              d={makeLinePath("exportKw")}
              fill="none"
              stroke="#00E676"
              strokeWidth="2.5"
              filter="drop-shadow(0 0 5px rgba(0, 230, 118, 0.3))"
            />

            {/* Time Axis Labels */}
            {displayData.map((d, i) => {
              const step = Math.ceil(displayData.length / 6);
              if (i % step !== 0 && i !== displayData.length - 1) return null;
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - 12}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {d.timeLabel}
                </text>
              );
            })}

            {/* Hover Tooltip Hotspots */}
            {displayData.map((d, i) => (
              <rect
                key={i}
                x={getX(i) - (chartW / displayData.length) / 2}
                y={paddingTop}
                width={chartW / displayData.length}
                height={chartH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {hoveredPoint && (
              <line
                x1={getX(displayData.indexOf(hoveredPoint))}
                y1={paddingTop}
                x2={getX(displayData.indexOf(hoveredPoint))}
                y2={paddingTop + chartH}
                stroke="#9D4EDD"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Hover Panel */}
      {hoveredPoint ? (
        <div className="p-3 rounded-lg bg-[#121622] border border-[#9D4EDD]/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Timestamp</span>
            <div className="font-bold text-white mt-0.5">{hoveredPoint.timeLabel}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Grid Import</span>
            <div className="font-bold text-[#9D4EDD] mt-0.5">
              {hoveredPoint.importKw.toLocaleString()} kW
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Grid Export</span>
            <div className="font-bold text-[#00E676] mt-0.5">
              {hoveredPoint.exportKw.toLocaleString()} kW
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Tariff Slot</span>
            <div className={`font-bold mt-0.5 ${hoveredPoint.isPeak ? "text-[#FF2A85]" : "text-slate-300"}`}>
              {hoveredPoint.isPeak ? "PEAK ($0.18/kWh)" : "OFF-PEAK ($0.07/kWh)"}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-[#121622]/50 border border-white/[0.04] text-[11px] font-mono text-slate-400 text-center">
          Hover over any point to inspect utility import, export feed-in, and TOU tariff rate
        </div>
      )}
    </div>
  );
}
