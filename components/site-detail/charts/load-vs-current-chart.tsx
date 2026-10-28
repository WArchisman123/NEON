"use client";

import React, { useState } from "react";
import { Zap } from "lucide-react";

interface LoadCurrentDataPoint {
  time: string;
  currentA: number; // e.g. -142 to -155 A
  loadKw: number;   // e.g. 98 to 118 kW
}

const defaultData: LoadCurrentDataPoint[] = [
  { time: "11:00", currentA: -142.5, loadKw: 104.2 },
  { time: "11:10", currentA: -145.1, loadKw: 107.0 },
  { time: "11:20", currentA: -148.0, loadKw: 109.5 },
  { time: "11:30", currentA: -150.2, loadKw: 111.0 },
  { time: "11:40", currentA: -151.7, loadKw: 112.4 },
  { time: "11:50", currentA: -151.0, loadKw: 112.0 },
  { time: "12:00", currentA: -153.4, loadKw: 114.8 },
  { time: "12:05", currentA: -151.7, loadKw: 112.4 },
  { time: "12:07", currentA: -150.8, loadKw: 111.9 },
  { time: "12:09", currentA: -151.7, loadKw: 112.4 },
];

export function LoadVsCurrentChart({
  data = defaultData,
  currentA = -151.7,
  loadKw = 112.4,
}: {
  data?: LoadCurrentDataPoint[];
  currentA?: number;
  loadKw?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Bounds for Left Axis (Current: -130A down to -170A)
  const minA = -170.0;
  const maxA = -130.0;
  const rangeA = maxA - minA;

  // Bounds for Right Axis (Load: 80kW up to 140kW)
  const minKw = 80.0;
  const maxKw = 140.0;
  const rangeKw = maxKw - minKw;

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 180;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 15;
  const padBottom = 28;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Compute points
  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartWidth;

    // Current Y (left axis)
    const normA = Math.min(1, Math.max(0, (d.currentA - minA) / rangeA));
    const yA = padTop + chartHeight - normA * chartHeight;

    // Load Y (right axis)
    const normKw = Math.min(1, Math.max(0, (d.loadKw - minKw) / rangeKw));
    const yKw = padTop + chartHeight - normKw * chartHeight;

    return { x, yA, yKw, ...d };
  });

  // Current area path
  const pathCurrent = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.yA}` : `${acc} L ${p.x} ${p.yA}`;
  }, "");

  const areaCurrent = `${pathCurrent} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`;

  // Load line path
  const pathLoad = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.yKw}` : `${acc} L ${p.x} ${p.yKw}`;
  }, "");

  // Ticks
  const yTicksLeft = [-130, -140, -150, -160, -170];
  const yTicksRight = [140, 120, 100, 80];

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between font-mono shadow-xs">
      {/* Header with dual legends and live readouts */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1 border-b border-theme-subtle/50">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-[#FF2A85]" />
          <div>
            <h4 className="text-xs font-bold text-theme-primary uppercase">
              Load Power vs. Current Draw
            </h4>
            <span className="text-[10px] text-theme-secondary">
              Dual-Scale Step Response (Inductive Draw vs. Facility kW)
            </span>
          </div>
        </div>

        {/* Dual Live Values */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-xs">
            <span className="size-2 rounded-full bg-[#FF2A85]" />
            <span className="text-theme-secondary text-[10px]">Current:</span>
            <span className="text-[#FF2A85] font-black">
              {activePoint ? `${activePoint.currentA.toFixed(1)} A` : `${currentA.toFixed(1)} A`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-xs">
            <span className="size-2 rounded-full bg-[#FFD600]" />
            <span className="text-theme-secondary text-[10px]">Load:</span>
            <span className="text-amber-400 font-black">
              {activePoint ? `${activePoint.loadKw.toFixed(1)} kW` : `${loadKw.toFixed(1)} kW`}
            </span>
          </div>
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
            <linearGradient id="current-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF2A85" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF2A85" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Left Axis (Current Draw - A) */}
          {yTicksLeft.map((tick) => {
            const y = padTop + chartHeight - ((tick - minA) / rangeA) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-theme-subtle/30"
                  strokeWidth="0.75"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-current text-pink-400/80 text-[9px] font-mono select-none"
                >
                  {tick}A
                </text>
              </g>
            );
          })}

          {/* Right Axis (Load Demand - kW) */}
          {yTicksRight.map((tick) => {
            const y = padTop + chartHeight - ((tick - minKw) / rangeKw) * chartHeight;
            return (
              <text
                key={tick}
                x={padLeft + chartWidth + 6}
                y={y + 3}
                textAnchor="start"
                className="fill-current text-amber-400/80 text-[9px] font-mono select-none"
              >
                {tick}kW
              </text>
            );
          })}

          {/* Current Area Fill */}
          <path d={areaCurrent} fill="url(#current-area-grad)" />

          {/* Current Draw Step Curve (Pink/Purple) */}
          <path
            d={pathCurrent}
            fill="none"
            stroke="#FF2A85"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(255,42,133,0.4)]"
          />

          {/* Load kW Curve (Amber Line) */}
          <path
            d={pathLoad}
            fill="none"
            stroke="#FFD600"
            strokeWidth="2"
            strokeDasharray="4 2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(255,214,0,0.4)]"
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

          {/* Active Hover Crosshairs & Points */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padTop}
                x2={activePoint.x}
                y2={padTop + chartHeight}
                stroke="#FF2A85"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-75"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.yA}
                r="4.5"
                fill="#FF2A85"
                className="stroke-background stroke-2 drop-shadow-[0_0_8px_rgba(255,42,133,0.8)]"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.yKw}
                r="4.5"
                fill="#FFD600"
                className="stroke-background stroke-2 drop-shadow-[0_0_8px_rgba(255,214,0,0.8)]"
              />
            </g>
          )}

          {/* Invisible Hitboxes across X slices */}
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

        {/* Hover Tooltip Box */}
        {hoverIndex !== null && activePoint && (
          <div
            className="absolute top-2 pointer-events-none rounded bg-[#121622] light:bg-[#EAEFF8] border border-theme-subtle px-2.5 py-1 text-[11px] shadow-lg z-20 flex items-center gap-3"
            style={{
              left: `${Math.min(75, Math.max(20, (activePoint.x / svgWidth) * 100))}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="text-theme-secondary">{activePoint.time}</span>
            <span className="text-pink-400 font-bold">{activePoint.currentA.toFixed(1)} A</span>
            <span className="text-amber-400 font-bold">{activePoint.loadKw.toFixed(1)} kW</span>
          </div>
        )}
      </div>
    </div>
  );
}
