"use client";

import React, { useState } from "react";
import { Activity } from "lucide-react";

interface VoltageDataPoint {
  time: string;
  voltage: number;
}

const defaultData: VoltageDataPoint[] = [
  { time: "11:00", voltage: 488.2 },
  { time: "11:10", voltage: 489.4 },
  { time: "11:20", voltage: 487.9 },
  { time: "11:30", voltage: 490.8 },
  { time: "11:40", voltage: 489.2 },
  { time: "11:50", voltage: 491.5 },
  { time: "12:00", voltage: 488.6 },
  { time: "12:05", voltage: 490.2 },
  { time: "12:07", voltage: 489.8 },
  { time: "12:09", voltage: 489.6 },
];

export function SystemVoltageChart({
  data = defaultData,
  currentVoltage = 489.6,
}: {
  data?: VoltageDataPoint[];
  currentVoltage?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Calibration bounds for 486V - 492V
  const minV = 486.0;
  const maxV = 492.0;
  const range = maxV - minV;

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 180;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 28;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Compute points
  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartWidth;
    const normY = Math.min(1, Math.max(0, (d.voltage - minV) / range));
    const y = padTop + chartHeight - normY * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`;

  // Y-axis ticks: 492, 490, 488, 486
  const yTicks = [492, 490, 488, 486];

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between font-mono shadow-xs">
      {/* Header with KPI and stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1 border-b border-theme-subtle/50">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-cyan-400" />
          <div>
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              System Voltage Waveform
            </h4>
            <span className="text-[10px] text-theme-secondary">
              DC Bus Nominal Waveform (490V RMS Target)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-theme-muted">
            <span>Min: <strong className="text-theme-primary">487.8V</strong></span>
            <span>•</span>
            <span>Max: <strong className="text-theme-primary">491.5V</strong></span>
          </div>
          <span className="text-sm font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
            {activePoint ? `${activePoint.voltage.toFixed(2)} V` : `${currentVoltage.toFixed(2)} V`}
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative w-full h-52 sm:h-56">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="volt-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Cartesian Grid Lines & Y-axis labels */}
          {yTicks.map((tick) => {
            const y = padTop + chartHeight - ((tick - minV) / range) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-theme-subtle/40"
                  strokeWidth="0.75"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-current text-theme-muted text-[9px] font-mono select-none"
                >
                  {tick}V
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#volt-area-grad)" />

          {/* Voltage Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#00F0FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]"
          />

          {/* X-Axis Time Ticks */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={padTop + chartHeight + 16}
              textAnchor="middle"
              className="fill-current text-theme-muted text-[9px] font-mono select-none"
            >
              {p.time}
            </text>
          ))}

          {/* Active Hover Crosshair / Point */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padTop}
                x2={activePoint.x}
                y2={padTop + chartHeight}
                stroke="#00F0FF"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-75"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#00F0FF"
                className="stroke-background stroke-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
              />
            </g>
          )}

          {/* Invisible Hover Hitboxes across X slices */}
          {points.map((p, idx) => {
            const sliceWidth = chartWidth / points.length;
            const sliceX = p.x - sliceWidth / 2;
            return (
              <rect
                key={idx}
                x={sliceX}
                y={padTop}
                width={sliceWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Pill */}
        {hoverIndex !== null && activePoint && (
          <div
            className="absolute top-2 pointer-events-none rounded bg-[#121622] light:bg-[#EAEFF8] border border-[#00F0FF]/40 px-2.5 py-1 text-[11px] shadow-lg z-20 flex items-center gap-2"
            style={{
              left: `${Math.min(80, Math.max(10, (activePoint.x / svgWidth) * 100))}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="text-theme-secondary">{activePoint.time}</span>
            <span className="text-cyan-400 font-bold">{activePoint.voltage.toFixed(2)} V</span>
          </div>
        )}
      </div>
    </div>
  );
}
