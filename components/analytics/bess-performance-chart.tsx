"use client";

import React, { useState, useMemo } from "react";
import { BatteryCharging } from "lucide-react";
import { HourlyTelemetryRecord } from "@/lib/energy/types";

interface BessPerformanceChartProps {
  initialData: HourlyTelemetryRecord[];
  bessCapacityKwh: number;
}

interface BessDataPoint {
  timestamp: string;
  timeLabel: string;
  bessKw: number;
  chargeKw: number;
  dischargeKw: number;
  socPct: number;
}

export function BessPerformanceChart({
  initialData,
  bessCapacityKwh,
}: BessPerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d">("today");
  const [hoveredPoint, setHoveredPoint] = useState<BessDataPoint | null>(null);

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

      const bessKw = item.avg_bess_kw || 0;
      const chargeKw = item.bess_charge_kwh || (bessKw < 0 ? Math.abs(bessKw) : 0);
      const dischargeKw = item.bess_discharge_kwh || (bessKw > 0 ? bessKw : 0);
      const socPct = item.end_bess_soc_pct || 75;

      sampled.push({
        timestamp: item.bucket_timestamp,
        timeLabel:
          timeframe === "today"
            ? `${hour.toString().padStart(2, "0")}:00`
            : new Date(item.bucket_timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        bessKw,
        chargeKw,
        dischargeKw,
        socPct,
      });
    }

    return sampled;
  }, [initialData, timeframe]);

  // Max power for scale
  const maxKw = useMemo(() => {
    const highest = Math.max(
      ...displayData.map((d) => Math.max(d.chargeKw, d.dischargeKw, 50)),
      100
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

  const getYSoC = (soc: number) => {
    const clamped = Math.max(0, Math.min(100, soc));
    return paddingTop + chartH - (clamped / 100) * chartH;
  };

  const makeLinePath = (key: "chargeKw" | "dischargeKw" | "socPct") => {
    if (displayData.length === 0) return "";
    return displayData
      .map((d, i) => {
        const yVal = key === "socPct" ? getYSoC(d[key]) : getYPower(d[key]);
        return `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${yVal.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
      {/* Top Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <BatteryCharging className="size-4 text-[#00F0FF]" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-white">
              BESS Diurnal Charge/Discharge & State of Charge (SoC) Profile
            </h3>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time power dispatch (kW) mapped against battery pack SoC percentage (%)
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="inline-flex rounded-lg bg-[#121622] p-1 border border-white/[0.06] font-mono text-xs">
          <button
            type="button"
            onClick={() => setTimeframe("today")}
            className={`px-3 py-1 rounded-md transition-all ${
              timeframe === "today"
                ? "bg-[#00F0FF] text-black font-bold shadow-md"
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
                ? "bg-[#00F0FF] text-black font-bold shadow-md"
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
                ? "bg-[#00F0FF] text-black font-bold shadow-md"
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
            <span className="size-3 rounded-sm bg-[#00F0FF]" />
            <span className="text-white font-medium">BESS Charge (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[#FF2A85]" />
            <span className="text-white font-medium">BESS Discharge (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-[#00E676]" />
            <span className="text-[#00E676] font-medium">Pack SoC (%)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Capacity: <span className="text-[#00F0FF] font-bold">{bessCapacityKwh} kWh</span>
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
              const socVal = Math.round(100 * pct);
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
                  {/* Left Axis: Power kW */}
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
                  {/* Right Axis: SoC % */}
                  <text
                    x={width - paddingRight + 8}
                    y={yVal + 3.5}
                    textAnchor="start"
                    fill="#00E676"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {socVal}%
                  </text>
                </g>
              );
            })}

            {/* Charge Line (Cyan) */}
            <path
              d={makeLinePath("chargeKw")}
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2.5"
            />

            {/* Discharge Line (Magenta/Pink) */}
            <path
              d={makeLinePath("dischargeKw")}
              fill="none"
              stroke="#FF2A85"
              strokeWidth="2.5"
            />

            {/* SoC Curve (Cyber Green with Glow) */}
            <path
              d={makeLinePath("socPct")}
              fill="none"
              stroke="#00E676"
              strokeWidth="2"
              strokeDasharray="4 2"
              filter="drop-shadow(0 0 5px rgba(0, 230, 118, 0.4))"
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
                stroke="#00F0FF"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Hover Panel */}
      {hoveredPoint ? (
        <div className="p-3 rounded-lg bg-[#121622] border border-[#00F0FF]/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Timestamp</span>
            <div className="font-bold text-white mt-0.5">{hoveredPoint.timeLabel}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Charge Power</span>
            <div className="font-bold text-[#00F0FF] mt-0.5">
              {hoveredPoint.chargeKw.toLocaleString()} kW
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Discharge Power</span>
            <div className="font-bold text-[#FF2A85] mt-0.5">
              {hoveredPoint.dischargeKw.toLocaleString()} kW
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">State of Charge</span>
            <div className="font-bold text-[#00E676] mt-0.5">
              {hoveredPoint.socPct.toFixed(1)}%
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-[#121622]/50 border border-white/[0.04] text-[11px] font-mono text-slate-400 text-center">
          Hover over any point to inspect BESS charge, discharge, and battery SoC level
        </div>
      )}
    </div>
  );
}
