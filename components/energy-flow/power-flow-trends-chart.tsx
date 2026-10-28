"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Sun,
  BatteryCharging,
  Zap,
  Factory,
  Car,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";

export type TrendTimeRange = "5m" | "15m" | "1h" | "6h" | "12h" | "1d";

export interface StreamDataPoint {
  time: string;
  solar: number;     // e.g. 0 to 110 kW
  battery: number;   // -80 kW (charging) to +80 kW (discharging)
  grid: number;      // -40 kW (export) to +95 kW (import)
  load: number;      // 75 to 115 kW
  ev: number;        // 0 to 22 kW
}

const RANGE_DATA_MAP: Record<TrendTimeRange, StreamDataPoint[]> = {
  "5m": [
    { time: "12:05", solar: 87.2, battery: -72.0, grid: 74.5, load: 99.8, ev: 11.5 },
    { time: "12:06", solar: 88.5, battery: -73.2, grid: 75.2, load: 100.2, ev: 11.8 },
    { time: "12:07", solar: 89.1, battery: -74.0, grid: 76.0, load: 100.5, ev: 12.0 },
    { time: "12:08", solar: 89.3, battery: -74.4, grid: 76.6, load: 100.4, ev: 12.0 },
    { time: "12:09", solar: 89.6, battery: -74.2, grid: 76.1, load: 100.3, ev: 11.9 },
    { time: "12:10", solar: 89.4, battery: -74.5, grid: 76.8, load: 100.6, ev: 12.1 },
  ],
  "15m": [
    { time: "11:55", solar: 84.1, battery: -68.4, grid: 71.0, load: 97.5, ev: 10.2 },
    { time: "12:00", solar: 86.8, battery: -71.5, grid: 73.8, load: 99.1, ev: 11.0 },
    { time: "12:05", solar: 88.4, battery: -73.6, grid: 75.5, load: 100.1, ev: 11.8 },
    { time: "12:10", solar: 89.3, battery: -74.4, grid: 76.6, load: 100.4, ev: 12.0 },
  ],
  "1h": [
    { time: "11:15", solar: 72.4, battery: -54.0, grid: 62.5, load: 91.2, ev: 8.5 },
    { time: "11:30", solar: 79.8, battery: -62.5, grid: 68.2, load: 95.8, ev: 10.0 },
    { time: "11:45", solar: 85.2, battery: -70.1, grid: 72.9, load: 98.4, ev: 11.2 },
    { time: "12:00", solar: 89.3, battery: -74.4, grid: 76.6, load: 100.4, ev: 12.0 },
  ],
  "6h": [
    { time: "06:00", solar: 12.0, battery: 45.2, grid: 38.0, load: 78.5, ev: 0.0 },
    { time: "07:30", solar: 38.5, battery: 15.0, grid: 52.4, load: 86.0, ev: 6.2 },
    { time: "09:00", solar: 68.4, battery: -40.2, grid: 65.8, load: 94.2, ev: 11.5 },
    { time: "10:30", solar: 84.0, battery: -68.5, grid: 73.1, load: 98.6, ev: 12.0 },
    { time: "12:00", solar: 89.3, battery: -74.4, grid: 76.6, load: 100.4, ev: 12.0 },
  ],
  "12h": [
    { time: "00:00", solar: 0.0, battery: 58.4, grid: 28.5, load: 68.2, ev: 0.0 },
    { time: "03:00", solar: 0.0, battery: 52.1, grid: 24.2, load: 62.0, ev: 0.0 },
    { time: "06:00", solar: 14.5, battery: 32.0, grid: 42.1, load: 76.5, ev: 0.0 },
    { time: "09:00", solar: 68.4, battery: -40.2, grid: 65.8, load: 94.2, ev: 11.5 },
    { time: "12:00", solar: 89.3, battery: -74.4, grid: 76.6, load: 100.4, ev: 12.0 },
  ],
  "1d": [
    { time: "00:00", solar: 0.0, battery: 55.0, grid: 26.0, load: 65.0, ev: 0.0 },
    { time: "04:00", solar: 0.0, battery: 48.2, grid: 22.5, load: 58.4, ev: 0.0 },
    { time: "08:00", solar: 45.2, battery: -10.5, grid: 58.2, load: 88.0, ev: 8.4 },
    { time: "12:00", solar: 89.3, battery: -74.4, grid: 76.6, load: 100.4, ev: 12.0 },
    { time: "16:00", solar: 62.1, battery: -35.0, grid: 64.2, load: 96.5, ev: 10.5 },
    { time: "20:00", solar: 0.0, battery: 65.4, grid: 48.2, load: 104.2, ev: 14.2 },
  ],
};

interface PowerFlowTrendsChartProps {
  className?: string;
  initialRange?: TrendTimeRange;
}

export function PowerFlowTrendsChart({
  className = "",
  initialRange = "1h",
}: PowerFlowTrendsChartProps) {
  const [range, setRange] = useState<TrendTimeRange>(initialRange);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Stream visibility toggles
  const [visibleStreams, setVisibleStreams] = useState({
    solar: true,
    battery: true,
    grid: true,
    load: true,
    ev: true,
  });

  const toggleStream = (key: keyof typeof visibleStreams) => {
    setVisibleStreams((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentData = RANGE_DATA_MAP[range];

  // Chart coordinate space bounds: -100 kW to +130 kW
  const minKw = -100.0;
  const maxKw = 130.0;
  const kwRange = maxKw - minKw;

  const svgWidth = 720;
  const svgHeight = 220;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Project data points to SVG coordinates
  const projected = useMemo(() => {
    return currentData.map((d, i) => {
      const x = padLeft + (i / (currentData.length - 1)) * chartWidth;

      const calcY = (val: number) => {
        const clamped = Math.min(maxKw, Math.max(minKw, val));
        const norm = (clamped - minKw) / kwRange;
        return padTop + chartHeight - norm * chartHeight;
      };

      return {
        ...d,
        x,
        ySolar: calcY(d.solar),
        yBattery: calcY(d.battery),
        yGrid: calcY(d.grid),
        yLoad: calcY(d.load),
        yEv: calcY(d.ev),
      };
    });
  }, [currentData, chartWidth, chartHeight, kwRange, minKw]);

  // Generate SVG path string with smooth line segments
  const pathSolar = useMemo(() => {
    return projected.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x.toFixed(1)} ${p.ySolar.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.ySolar.toFixed(1)}`;
    }, "");
  }, [projected]);

  const pathBattery = useMemo(() => {
    return projected.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x.toFixed(1)} ${p.yBattery.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.yBattery.toFixed(1)}`;
    }, "");
  }, [projected]);

  const pathGrid = useMemo(() => {
    return projected.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x.toFixed(1)} ${p.yGrid.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.yGrid.toFixed(1)}`;
    }, "");
  }, [projected]);

  const pathLoad = useMemo(() => {
    return projected.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x.toFixed(1)} ${p.yLoad.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.yLoad.toFixed(1)}`;
    }, "");
  }, [projected]);

  const pathEv = useMemo(() => {
    return projected.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x.toFixed(1)} ${p.yEv.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.yEv.toFixed(1)}`;
    }, "");
  }, [projected]);

  // Horizontal Grid Lines & Y-ticks
  const yTicks = [120, 80, 40, 0, -40, -80];

  const activeHover = hoverIndex !== null ? projected[hoverIndex] : projected[projected.length - 1];

  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3 font-mono shadow-sm ${className}`}>
      {/* Header with Title and Range Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-[#FF2A85]/10 border border-[#FF2A85]/30 flex items-center justify-center">
            <TrendingUp className="size-3.5 text-[#FF2A85]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase tracking-wide">
              Power Flow Multi-Stream Trends
            </h3>
            <p className="text-[10px] text-theme-secondary flex items-center gap-1.5 mt-0.5">
              <Clock className="size-3" />
              Synchronized 5-channel continuous electrical power balance
            </p>
          </div>
        </div>

        {/* Time Interval Pills */}
        <div className="flex items-center gap-1 bg-theme-elevated/70 p-1 rounded-lg border border-theme-subtle">
          {(["5m", "15m", "1h", "6h", "12h", "1d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRange(r);
                setHoverIndex(null);
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                range === r
                  ? "bg-[#FF2A85] text-white shadow-xs"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Stream Legend & Quick-Toggle Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Solar PV */}
          <button
            type="button"
            onClick={() => toggleStream("solar")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
              visibleStreams.solar
                ? "bg-[#FFD600]/10 border-[#FFD600]/50 text-[#FFD600] font-bold"
                : "bg-theme-elevated/40 border-theme-subtle text-slate-500 opacity-60"
            }`}
          >
            <Sun className="size-3" />
            <span>Solar PV</span>
            {visibleStreams.solar ? <Eye className="size-2.5 opacity-70" /> : <EyeOff className="size-2.5" />}
          </button>

          {/* BESS Power */}
          <button
            type="button"
            onClick={() => toggleStream("battery")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
              visibleStreams.battery
                ? "bg-cyan-500/10 border-cyan-400/50 text-[#00F0FF] font-bold"
                : "bg-theme-elevated/40 border-theme-subtle text-slate-500 opacity-60"
            }`}
          >
            <BatteryCharging className="size-3" />
            <span>BESS (±)</span>
            {visibleStreams.battery ? <Eye className="size-2.5 opacity-70" /> : <EyeOff className="size-2.5" />}
          </button>

          {/* Utility Grid */}
          <button
            type="button"
            onClick={() => toggleStream("grid")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
              visibleStreams.grid
                ? "bg-purple-500/10 border-purple-400/50 text-purple-400 font-bold"
                : "bg-theme-elevated/40 border-theme-subtle text-slate-500 opacity-60"
            }`}
          >
            <Zap className="size-3" />
            <span>Grid Power (±)</span>
            {visibleStreams.grid ? <Eye className="size-2.5 opacity-70" /> : <EyeOff className="size-2.5" />}
          </button>

          {/* Facility Load */}
          <button
            type="button"
            onClick={() => toggleStream("load")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
              visibleStreams.load
                ? "bg-[#FF2A85]/10 border-[#FF2A85]/50 text-[#FF2A85] font-bold"
                : "bg-theme-elevated/40 border-theme-subtle text-slate-500 opacity-60"
            }`}
          >
            <Factory className="size-3" />
            <span>Facility Demand</span>
            {visibleStreams.load ? <Eye className="size-2.5 opacity-70" /> : <EyeOff className="size-2.5" />}
          </button>

          {/* EV Station */}
          <button
            type="button"
            onClick={() => toggleStream("ev")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
              visibleStreams.ev
                ? "bg-sky-500/10 border-sky-400/50 text-sky-400 font-bold"
                : "bg-theme-elevated/40 border-theme-subtle text-slate-500 opacity-60"
            }`}
          >
            <Car className="size-3" />
            <span>EV Station</span>
            {visibleStreams.ev ? <Eye className="size-2.5 opacity-70" /> : <EyeOff className="size-2.5" />}
          </button>
        </div>

        {/* Live Instantaneous Values at cursor */}
        <div className="text-[11px] text-theme-secondary flex items-center gap-2">
          <span className="text-theme-muted">{activeHover.time}:</span>
          {visibleStreams.solar && <span className="text-[#FFD600]">{activeHover.solar.toFixed(1)} kW</span>}
          {visibleStreams.battery && (
            <span className="text-[#00F0FF]">
              {activeHover.battery >= 0 ? `+${activeHover.battery.toFixed(1)}` : activeHover.battery.toFixed(1)} kW
            </span>
          )}
          {visibleStreams.grid && (
            <span className="text-purple-400">
              {activeHover.grid >= 0 ? `+${activeHover.grid.toFixed(1)}` : activeHover.grid.toFixed(1)} kW
            </span>
          )}
          {visibleStreams.load && <span className="text-[#FF2A85]">{activeHover.load.toFixed(1)} kW</span>}
        </div>
      </div>

      {/* SVG Multi-Stream Chart Canvas */}
      <div className="relative w-full h-[220px] rounded-lg bg-theme-elevated/30 border border-theme-subtle overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Subtle glow filter for lines */}
            <filter id="stream-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = padTop + chartHeight - ((tick - minKw) / kwRange) * chartHeight;
            const isZero = tick === 0;

            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={isZero ? "rgba(255, 42, 133, 0.4)" : "rgba(148, 163, 184, 0.12)"}
                  strokeWidth={isZero ? "1.5" : "0.75"}
                  strokeDasharray={isZero ? "4 4" : "2 2"}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill={isZero ? "#FF2A85" : "rgba(148, 163, 184, 0.6)"}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight={isZero ? "bold" : "normal"}
                >
                  {tick > 0 ? `+${tick}` : tick} kW
                </text>
              </g>
            );
          })}

          {/* X-Axis Timestamps */}
          {projected.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={svgHeight - 8}
              textAnchor="middle"
              fill="rgba(148, 163, 184, 0.6)"
              fontSize="9"
              fontFamily="monospace"
            >
              {pt.time}
            </text>
          ))}

          {/* STREAM 1: Facility Load (Pink) */}
          {visibleStreams.load && (
            <path
              d={pathLoad}
              fill="none"
              stroke="#FF2A85"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#stream-glow)"
            />
          )}

          {/* STREAM 2: Solar PV (Amber) */}
          {visibleStreams.solar && (
            <path
              d={pathSolar}
              fill="none"
              stroke="#FFD600"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#stream-glow)"
            />
          )}

          {/* STREAM 3: Utility Grid (Purple) */}
          {visibleStreams.grid && (
            <path
              d={pathGrid}
              fill="none"
              stroke="#9D4EDD"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#stream-glow)"
            />
          )}

          {/* STREAM 4: BESS Battery (Cyan) */}
          {visibleStreams.battery && (
            <path
              d={pathBattery}
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#stream-glow)"
            />
          )}

          {/* STREAM 5: EV Station (Sky Blue) */}
          {visibleStreams.ev && (
            <path
              d={pathEv}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.6"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          )}

          {/* Interactive Hover Crosshair & Tracking Markers */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={projected[hoverIndex].x}
                y1={padTop}
                x2={projected[hoverIndex].x}
                y2={padTop + chartHeight}
                stroke="#FF2A85"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Data Point Rings */}
              {visibleStreams.load && (
                <circle cx={projected[hoverIndex].x} cy={projected[hoverIndex].yLoad} r="4" fill="#FF2A85" stroke="#FFFFFF" strokeWidth="1.5" />
              )}
              {visibleStreams.solar && (
                <circle cx={projected[hoverIndex].x} cy={projected[hoverIndex].ySolar} r="4" fill="#FFD600" stroke="#FFFFFF" strokeWidth="1.5" />
              )}
              {visibleStreams.grid && (
                <circle cx={projected[hoverIndex].x} cy={projected[hoverIndex].yGrid} r="4" fill="#9D4EDD" stroke="#FFFFFF" strokeWidth="1.5" />
              )}
              {visibleStreams.battery && (
                <circle cx={projected[hoverIndex].x} cy={projected[hoverIndex].yBattery} r="4" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.5" />
              )}
              {visibleStreams.ev && (
                <circle cx={projected[hoverIndex].x} cy={projected[hoverIndex].yEv} r="3.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
              )}
            </g>
          )}

          {/* Transparent Hover Columns for Mouse Interactions */}
          {projected.map((pt, i) => {
            const colWidth = chartWidth / (projected.length - 1);
            return (
              <rect
                key={i}
                x={pt.x - colWidth / 2}
                y={padTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}
        </svg>

        {/* Hover Floating Stat Pill */}
        {hoverIndex !== null && (
          <div
            className="absolute top-2 right-2 pointer-events-none p-2 rounded-lg bg-black/85 backdrop-blur-md border border-[#FF2A85]/40 shadow-xl text-[10px] font-mono space-y-1 animate-in fade-in-0 duration-100"
          >
            <div className="flex items-center justify-between gap-4 font-bold text-white border-b border-white/10 pb-1">
              <span>Timestamp:</span>
              <span>{projected[hoverIndex].time}</span>
            </div>
            {visibleStreams.solar && (
              <div className="flex items-center justify-between gap-4 text-[#FFD600]">
                <span>Solar PV:</span>
                <span>+{projected[hoverIndex].solar.toFixed(1)} kW</span>
              </div>
            )}
            {visibleStreams.battery && (
              <div className="flex items-center justify-between gap-4 text-[#00F0FF]">
                <span>Battery BESS:</span>
                <span>{projected[hoverIndex].battery >= 0 ? `+${projected[hoverIndex].battery.toFixed(1)}` : projected[hoverIndex].battery.toFixed(1)} kW</span>
              </div>
            )}
            {visibleStreams.grid && (
              <div className="flex items-center justify-between gap-4 text-purple-400">
                <span>Utility Grid:</span>
                <span>{projected[hoverIndex].grid >= 0 ? `+${projected[hoverIndex].grid.toFixed(1)}` : projected[hoverIndex].grid.toFixed(1)} kW</span>
              </div>
            )}
            {visibleStreams.load && (
              <div className="flex items-center justify-between gap-4 text-[#FF2A85]">
                <span>Facility Load:</span>
                <span>{projected[hoverIndex].load.toFixed(1)} kW</span>
              </div>
            )}
            {visibleStreams.ev && (
              <div className="flex items-center justify-between gap-4 text-sky-400">
                <span>EV Charger:</span>
                <span>{projected[hoverIndex].ev.toFixed(1)} kW</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
