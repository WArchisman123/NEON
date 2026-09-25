"use client";

import React, { useState, useMemo } from "react";
import { Sun } from "lucide-react";
import { HourlyTelemetryRecord } from "@/lib/energy/types";
import {
  CyberDatetimePicker,
  DateTimeRange,
  getDefaultDateTimeRange,
} from "./cyber-datetime-picker";

interface SolarPerformanceChartProps {
  initialData: HourlyTelemetryRecord[];
  solarCapacityKwp: number;
}

interface SolarDataPoint {
  timestamp: string;
  timeLabel: string;
  actualKw: number;
  predictedKw: number;
  loadKw: number;
  clippingLossKw: number;
}

export function SolarPerformanceChart({
  initialData,
  solarCapacityKwp,
}: SolarPerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d" | "custom">("today");
  const [customRange, setCustomRange] = useState<DateTimeRange>(() => getDefaultDateTimeRange(7));
  const [hoveredPoint, setHoveredPoint] = useState<SolarDataPoint | null>(null);

  // Filter or aggregate based on timeframe
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

    // Downsample for clean SVG rendering
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

      // Theoretical clear-sky predicted solar curve (bell curve peaking at noon)
      let predictedKw = 0;
      if (hour >= 6 && hour <= 18) {
        const peakHour = 12.5;
        const width = 3.5;
        const normalized = Math.exp(-Math.pow((hour - peakHour) / width, 2));
        predictedKw = Math.round(solarCapacityKwp * 0.95 * normalized);
      }

      const actualKw = item.avg_solar_kw || 0;
      const loadKw = item.avg_load_kw || 0;
      const clippingLossKw = Math.max(0, predictedKw - actualKw);

      sampled.push({
        timestamp: item.bucket_timestamp,
        timeLabel:
          timeframe === "today"
            ? `${hour.toString().padStart(2, "0")}:00`
            : new Date(item.bucket_timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: timeframe === "7d" ? "numeric" : undefined,
              }),
        actualKw,
        predictedKw,
        loadKw,
        clippingLossKw,
      });
    }

    return sampled;
  }, [initialData, timeframe, solarCapacityKwp, customRange]);

  // Compute maximum power for SVG scaling
  const maxKw = useMemo(() => {
    const highest = Math.max(
      ...displayData.map((d) => Math.max(d.actualKw, d.predictedKw, d.loadKw, 100)),
      solarCapacityKwp
    );
    return Math.ceil((highest * 1.15) / 100) * 100;
  }, [displayData, solarCapacityKwp]);

  // SVG Chart Dimensions
  const width = 850;
  const height = 300;
  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Scale functions
  const getX = (index: number) => {
    if (displayData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (displayData.length - 1)) * chartW;
  };

  const getY = (kw: number) => {
    const clamped = Math.max(0, Math.min(maxKw, kw));
    return paddingTop + chartH - (clamped / maxKw) * chartH;
  };

  // Generate SVG path for line/area
  const makeLinePath = (key: "actualKw" | "predictedKw" | "loadKw") => {
    if (displayData.length === 0) return "";
    return displayData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
      .join(" ");
  };

  const makeAreaPath = (key: "actualKw") => {
    if (displayData.length === 0) return "";
    const line = displayData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
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
            <Sun className="size-4 text-[#FFD600]" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-white">
              Predicted Power vs. Actual Generation vs. Facility Load
            </h3>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Physical clear-sky solar forecast model vs. measured inverter output (kW)
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
                  ? "bg-[#FFD600] text-black font-bold shadow-md"
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
                  ? "bg-[#FFD600] text-black font-bold shadow-md"
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
                  ? "bg-[#FFD600] text-black font-bold shadow-md"
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
            accentColor="#FFD600"
          />
        </div>
      </div>

      {/* Legend & Summary Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#FFD600]" />
            <span className="text-white font-medium">Actual Solar (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#FFD600]/70" />
            <span className="text-slate-300">Predicted Yield (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#FF2A85]" />
            <span className="text-white font-medium">Facility Load (kW)</span>
          </div>
        </div>

        {/* Quick Comparison Metric */}
        <div className="text-[11px] text-slate-400">
          Nameplate Capacity: <span className="text-[#FFD600] font-bold">{solarCapacityKwp} kWp</span>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[650px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none overflow-visible"
          >
            <defs>
              {/* Solar Area Gradient */}
              <linearGradient id="solarAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD600" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FFD600" stopOpacity="0.0" />
              </linearGradient>

              {/* Grid Lines Pattern */}
              <linearGradient id="gridGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
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

            {/* Solar Actual Area Fill */}
            <path d={makeAreaPath("actualKw")} fill="url(#solarAreaGradient)" />

            {/* Predicted Curve (Dashed line) */}
            <path
              d={makeLinePath("predictedKw")}
              fill="none"
              stroke="#FFD600"
              strokeWidth="2"
              strokeDasharray="5 4"
              strokeOpacity="0.6"
            />

            {/* Facility Load Line (Pink) */}
            <path
              d={makeLinePath("loadKw")}
              fill="none"
              stroke="#FF2A85"
              strokeWidth="2.5"
            />

            {/* Actual Solar Line (Solid Yellow with glow) */}
            <path
              d={makeLinePath("actualKw")}
              fill="none"
              stroke="#FFD600"
              strokeWidth="3"
              filter="drop-shadow(0 0 6px rgba(255, 214, 0, 0.45))"
            />

            {/* Time Axis Labels */}
            {displayData.map((d, i) => {
              // Show label every few points
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

            {/* Hover Guides & Tooltip Hotspots */}
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

            {/* Active Hover Marker */}
            {hoveredPoint && (
              <g>
                <line
                  x1={getX(displayData.indexOf(hoveredPoint))}
                  y1={paddingTop}
                  x2={getX(displayData.indexOf(hoveredPoint))}
                  y2={paddingTop + chartH}
                  stroke="#FF2A85"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Hover Data Inspection Banner */}
      {hoveredPoint ? (
        <div className="p-3 rounded-lg bg-[#121622] border border-[#FFD600]/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Timestamp</span>
            <div className="font-bold text-white mt-0.5">{hoveredPoint.timeLabel}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Actual Solar</span>
            <div className="font-bold text-[#FFD600] mt-0.5">
              {hoveredPoint.actualKw.toLocaleString()} kW
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Predicted Yield</span>
            <div className="font-bold text-[#FFD600]/70 mt-0.5">
              {hoveredPoint.predictedKw.toLocaleString()} kW
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Facility Load</span>
            <div className="font-bold text-[#FF2A85] mt-0.5">
              {hoveredPoint.loadKw.toLocaleString()} kW
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-[#121622]/50 border border-white/[0.04] text-[11px] font-mono text-slate-400 text-center">
          Hover over any point on the chart to inspect predicted vs actual power generation and load
        </div>
      )}
    </div>
  );
}
