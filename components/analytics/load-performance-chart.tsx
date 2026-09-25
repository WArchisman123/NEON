"use client";

import React, { useState, useMemo } from "react";
import { Factory } from "lucide-react";
import { HourlyTelemetryRecord } from "@/lib/energy/types";
import {
  CyberDatetimePicker,
  DateTimeRange,
  getDefaultDateTimeRange,
} from "./cyber-datetime-picker";

interface LoadPerformanceChartProps {
  initialData: HourlyTelemetryRecord[];
  contractedMdKva: number;
}

interface LoadDataPoint {
  timestamp: string;
  timeLabel: string;
  totalLoad: number;
  criticalLoad: number;
  hvacLoad: number;
  auxiliaryLoad: number;
}

export function LoadPerformanceChart({
  initialData,
  contractedMdKva,
}: LoadPerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d" | "custom">("today");
  const [customRange, setCustomRange] = useState<DateTimeRange>(() => getDefaultDateTimeRange(7));
  const [hoveredPoint, setHoveredPoint] = useState<LoadDataPoint | null>(null);

  const displayData = useMemo(() => {
    let source = [...initialData];
    if (timeframe === "today") {
      source = source.slice(-24);
    } else if (timeframe === "7d") {
      source = source.slice(-168);
    } else if (timeframe === "30d") {
      source = source.slice(-720);
    } else {
      if (!customRange.startDate || !customRange.endDate) {
        source = source.slice(-168);
      } else {
        const startMs = new Date(
          `${customRange.startDate}T${customRange.startTime || "00:00"}`
        ).getTime();
        const endMs = new Date(
          `${customRange.endDate}T${customRange.endTime || "23:59"}`
        ).getTime();

        const matched = source.filter((item) => {
          const itemMs = new Date(item.bucket_timestamp).getTime();
          return itemMs >= startMs && itemMs <= endMs;
        });

        source = matched.length > 0 ? matched : source.slice(-24);
      }
    }

    const step =
      timeframe === "today"
        ? 1
        : timeframe === "7d"
        ? 4
        : timeframe === "30d"
        ? 12
        : source.length <= 24
        ? 1
        : source.length <= 168
        ? 4
        : 12;
    const sampled = [];

    for (let i = 0; i < source.length; i += step) {
      const item = source[i];
      const hour = new Date(item.bucket_timestamp).getHours();

      const totalLoad = item.avg_load_kw || 600;
      // Synthesize sub-circuit breakdown for industrial profile
      const criticalLoad = Math.round(totalLoad * 0.45);
      const hvacLoad = Math.round(totalLoad * 0.35);
      const auxiliaryLoad = totalLoad - criticalLoad - hvacLoad;

      sampled.push({
        timestamp: item.bucket_timestamp,
        timeLabel:
          timeframe === "today"
            ? `${hour.toString().padStart(2, "0")}:00`
            : new Date(item.bucket_timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        totalLoad,
        criticalLoad,
        hvacLoad,
        auxiliaryLoad,
      });
    }

    return sampled;
  }, [initialData, timeframe, customRange]);

  const maxKw = useMemo(() => {
    const highest = Math.max(
      ...displayData.map((d) => d.totalLoad),
      contractedMdKva
    );
    return Math.ceil((highest * 1.15) / 50) * 50;
  }, [displayData, contractedMdKva]);

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

  const makeLinePath = (key: "totalLoad" | "criticalLoad") => {
    if (displayData.length === 0) return "";
    return displayData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYPower(d[key]).toFixed(1)}`)
      .join(" ");
  };

  const makeAreaPath = () => {
    if (displayData.length === 0) return "";
    const line = displayData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYPower(d.totalLoad).toFixed(1)}`)
      .join(" ");
    const bottomY = (paddingTop + chartH).toFixed(1);
    const lastX = getX(displayData.length - 1).toFixed(1);
    const firstX = getX(0).toFixed(1);
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
      {/* Top Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="size-4 text-[#FF2A85]" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-white">
              Facility Demand Profile & Contracted MD Threshold
            </h3>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Active demand curve (kW) vs. contracted sanctioned Maximum Demand threshold
          </p>
        </div>

        {/* Timeframe Selector & Custom DateTime Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-[#121622] p-1 border border-white/[0.06] font-mono text-xs">
            <button
              type="button"
              onClick={() => setTimeframe("today")}
              className={`px-3 py-1 rounded-md transition-all ${
                timeframe === "today"
                  ? "bg-[#FF2A85] text-white font-bold shadow-md"
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
                  ? "bg-[#FF2A85] text-white font-bold shadow-md"
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
                  ? "bg-[#FF2A85] text-white font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              30 Days
            </button>
          </div>

          <CyberDatetimePicker
            value={customRange}
            onChange={(r) => {
              setCustomRange(r);
              setTimeframe("custom");
            }}
            activePreset={timeframe}
            onPresetChange={(preset) => {
              if (preset === "custom") {
                setTimeframe("custom");
              } else if (preset === "today" || preset === "7d" || preset === "30d") {
                setTimeframe(preset);
              }
            }}
            accentColor="#FF2A85"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#FF2A85]" />
            <span className="text-white font-medium">Total Facility Demand (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#00F0FF]" />
            <span className="text-white font-medium">Critical Circuits (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#FF1744]" />
            <span className="text-[#FF1744] font-medium">Contracted MD ({contractedMdKva} kVA)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Peak Sanctioned: <span className="text-[#FF2A85] font-bold">{contractedMdKva} kVA</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[650px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none overflow-visible"
          >
            <defs>
              <linearGradient id="loadAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF2A85" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF2A85" stopOpacity="0.0" />
              </linearGradient>
            </defs>

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

            {/* Contracted MD Threshold Line (Red Dashed) */}
            <line
              x1={paddingLeft}
              y1={getYPower(contractedMdKva)}
              x2={width - paddingRight}
              y2={getYPower(contractedMdKva)}
              stroke="#FF1744"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Area Fill for Total Demand */}
            <path d={makeAreaPath()} fill="url(#loadAreaGradient)" />

            {/* Total Demand Line (Neon Pink with glow) */}
            <path
              d={makeLinePath("totalLoad")}
              fill="none"
              stroke="#FF2A85"
              strokeWidth="3"
              filter="drop-shadow(0 0 6px rgba(255, 42, 133, 0.45))"
            />

            {/* Critical Sub-circuit Line (Cyan) */}
            <path
              d={makeLinePath("criticalLoad")}
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
              strokeDasharray="3 2"
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
                stroke="#FF2A85"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Hover Panel */}
      {hoveredPoint ? (
        <div className="p-3 rounded-lg bg-[#121622] border border-[#FF2A85]/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Timestamp</span>
            <div className="font-bold text-white mt-0.5">{hoveredPoint.timeLabel}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Total Demand</span>
            <div className="font-bold text-[#FF2A85] mt-0.5">
              {hoveredPoint.totalLoad.toLocaleString()} kW
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Critical Circuits</span>
            <div className="font-bold text-[#00F0FF] mt-0.5">
              {hoveredPoint.criticalLoad.toLocaleString()} kW
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">HVAC & Chillers</span>
            <div className="font-bold text-slate-200 mt-0.5">
              {hoveredPoint.hvacLoad.toLocaleString()} kW
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-[#121622]/50 border border-white/[0.04] text-[11px] font-mono text-slate-400 text-center">
          Hover over any point to inspect total demand and critical sub-circuit breakdown
        </div>
      )}
    </div>
  );
}
