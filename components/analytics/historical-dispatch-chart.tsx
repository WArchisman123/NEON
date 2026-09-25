"use client";

import React, { useState } from "react";
import { HourlyTelemetryRecord } from "@/lib/energy/types";
import {
  Sun,
  Zap,
  Calendar,
  IndianRupee,
  Leaf,
} from "lucide-react";
import {
  CyberDatetimePicker,
  DateTimeRange,
  getDefaultDateTimeRange,
} from "./cyber-datetime-picker";

interface Props {
  initialData: HourlyTelemetryRecord[];
  siteId: string;
  hasBess: boolean;
  hasDg: boolean;
  hasSolar: boolean;
  hasGrid: boolean;
}

export function HistoricalDispatchChart({
  initialData,
  hasBess,
  hasDg,
}: Props) {
  const [range, setRange] = useState<"today" | "7d" | "30d" | "custom">("today");
  const [customRange, setCustomRange] = useState<DateTimeRange>(() => getDefaultDateTimeRange(7));

  // Filter data based on selected range
  const filteredData = React.useMemo(() => {
    if (range === "today") {
      return initialData.slice(-24);
    } else if (range === "7d") {
      // Sample every 3 hours for clean 7-day display
      const last7Days = initialData.slice(-168);
      return last7Days.filter((_, idx) => idx % 3 === 0);
    } else if (range === "30d") {
      // 30 days: sample daily aggregates
      const last30Days = initialData.slice(-720);
      return last30Days.filter((_, idx) => idx % 12 === 0);
    } else {
      // Custom range
      if (!customRange.startDate || !customRange.endDate) {
        return initialData.slice(-168);
      }
      const startMs = new Date(
        `${customRange.startDate}T${customRange.startTime || "00:00"}`
      ).getTime();
      const endMs = new Date(
        `${customRange.endDate}T${customRange.endTime || "23:59"}`
      ).getTime();

      const matched = initialData.filter((item) => {
        const itemMs = new Date(item.bucket_timestamp).getTime();
        return itemMs >= startMs && itemMs <= endMs;
      });

      const res = matched.length > 0 ? matched : initialData.slice(-24);
      if (res.length > 100) {
        const factor = Math.ceil(res.length / 50);
        return res.filter((_, idx) => idx % factor === 0);
      }
      return res;
    }
  }, [initialData, range, customRange]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Interval totals
  const totals = React.useMemo(() => {
    const totalSolarKwh = filteredData.reduce(
      (sum, d) => sum + (d.solar_energy_kwh || d.avg_solar_kw || 0),
      0
    );
    const totalLoadKwh = filteredData.reduce(
      (sum, d) => sum + (d.load_energy_kwh || d.avg_load_kw || 0),
      0
    );
    const totalCostSaved = filteredData.reduce(
      (sum, d) => sum + (d.estimated_cost_saved || 0),
      0
    );
    const totalCo2Saved = Math.round(totalSolarKwh * 0.49);

    return {
      solarKwh: Math.round(totalSolarKwh),
      loadKwh: Math.round(totalLoadKwh),
      costSaved: Math.round(totalCostSaved),
      co2Kg: totalCo2Saved,
    };
  }, [filteredData]);

  // Determine chart scales
  const maxKw = Math.max(
    ...filteredData.map((d) =>
      Math.max(
        d.avg_solar_kw || 0,
        d.avg_load_kw || 0,
        d.bess_discharge_kwh || 0,
        d.grid_import_kwh || 0,
        d.dg_energy_kwh || 0,
        100
      )
    ),
    100
  );

  const activePoint =
    hoveredIdx !== null && filteredData[hoveredIdx]
      ? filteredData[hoveredIdx]
      : filteredData[filteredData.length - 1] || null;

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-6 relative overflow-hidden shadow-xl">
      {/* Top Header: Title, Intervals & Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[#FF2A85]" />
            <h3 className="text-base font-bold uppercase tracking-tight text-white">
              Power Dispatch & Historical Energy Balance
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hourly generation, storage cycling, and demand curves from Supabase
            PostgreSQL time-series rollups.
          </p>
        </div>

        {/* Range Selector Switcher & Custom DateTime Picker */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#121622] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setRange("today")}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
                range === "today"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Today (24h)
            </button>
            <button
              type="button"
              onClick={() => setRange("7d")}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
                range === "7d"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setRange("30d")}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
                range === "30d"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.4)]"
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
              setRange("custom");
            }}
            activePreset={range}
            onPresetChange={(preset) => {
              if (preset === "custom") {
                setRange("custom");
              } else if (preset === "today" || preset === "7d" || preset === "30d") {
                setRange(preset);
              }
            }}
            accentColor="#FF2A85"
          />
        </div>
      </div>

      {/* Aggregate KPI Strip for Selected Interval */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[#121622]/70 border border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold text-slate-400">
            <Sun className="size-3 text-[#FFD600]" />
            <span>Solar Yield</span>
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {totals.solarKwh.toLocaleString()}{" "}
            <span className="text-xs text-slate-400 font-normal">kWh</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#121622]/70 border border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold text-slate-400">
            <Zap className="size-3 text-[#FF2A85]" />
            <span>Load Demand</span>
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {totals.loadKwh.toLocaleString()}{" "}
            <span className="text-xs text-slate-400 font-normal">kWh</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#121622]/70 border border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold text-slate-400">
            <IndianRupee className="size-3 text-[#00E676]" />
            <span>Arbitrage Saved</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#00E676] mt-1">
            ₹{totals.costSaved.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#121622]/70 border border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold text-slate-400">
            <Leaf className="size-3 text-[#00E676]" />
            <span>CO2 Avoided</span>
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {totals.co2Kg.toLocaleString()}{" "}
            <span className="text-xs text-slate-400 font-normal">kg</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Historical Dispatch Canvas */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between text-xs gap-3 pb-2">
          {/* Active Hover readout */}
          <div className="font-mono text-xs text-slate-300">
            {activePoint ? (
              <span className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-sans">
                  {new Date(activePoint.bucket_timestamp).toLocaleString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                  :
                </span>
                <span className="text-[#FFD600]">
                  Solar: {Math.round(activePoint.avg_solar_kw)} kW
                </span>
                {hasBess && (
                  <span className="text-[#00F0FF]">
                    BESS: {Math.round(activePoint.avg_bess_kw)} kW (
                    {Math.round(activePoint.end_bess_soc_pct)}% SoC)
                  </span>
                )}
                {hasDg && activePoint.dg_energy_kwh > 0 && (
                  <span className="text-[#FF6B00]">
                    DG: {Math.round(activePoint.dg_energy_kwh)} kW
                  </span>
                )}
                <span className="text-[#FF2A85]">
                  Load: {Math.round(activePoint.avg_load_kw)} kW
                </span>
              </span>
            ) : null}
          </div>

          {/* Legend Badges */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="size-2 rounded-full bg-[#FFD600]" /> Solar
            </span>
            {hasBess && (
              <span className="flex items-center gap-1 text-slate-300">
                <span className="size-2 rounded-full bg-[#00F0FF]" /> BESS
              </span>
            )}
            {hasDg && (
              <span className="flex items-center gap-1 text-slate-300">
                <span className="size-2 rounded-full bg-[#FF6B00]" /> DG
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-300">
              <span className="size-2 rounded-full bg-[#9D4EDD]" /> Grid
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="size-2 rounded-full bg-[#FF2A85]" /> Load
            </span>
          </div>
        </div>

        {/* Chart SVG Canvas */}
        <div className="relative h-64 sm:h-72 w-full bg-[#060709] rounded-lg p-2 border border-white/[0.04]">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 800 240"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="solarGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD600" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FFD600" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="bessGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="loadGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF2A85" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF2A85" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 60, 120, 180, 240].map((y, idx) => (
              <line
                key={idx}
                x1="0"
                y1={y}
                x2="800"
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Area & Line Curves */}
            {filteredData.length > 1 && (
              <>
                {/* Solar Area */}
                <polygon
                  points={`0,240 ${filteredData
                    .map((d, i) => {
                      const x = (i / (filteredData.length - 1)) * 800;
                      const y = 240 - ((d.avg_solar_kw || 0) / maxKw) * 220;
                      return `${x},${y}`;
                    })
                    .join(" ")} 800,240`}
                  fill="url(#solarGlow)"
                />
                {/* Solar Stroke */}
                <polyline
                  points={filteredData
                    .map((d, i) => {
                      const x = (i / (filteredData.length - 1)) * 800;
                      const y = 240 - ((d.avg_solar_kw || 0) / maxKw) * 220;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#FFD600"
                  strokeWidth="2"
                  className="filter drop-shadow-[0_0_6px_rgba(255,214,0,0.6)]"
                />

                {/* BESS Curve if present */}
                {hasBess && (
                  <polyline
                    points={filteredData
                      .map((d, i) => {
                        const x = (i / (filteredData.length - 1)) * 800;
                        const val = d.bess_discharge_kwh || Math.abs(d.avg_bess_kw || 0);
                        const y = 240 - (val / maxKw) * 220;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Load Area & Stroke */}
                <polyline
                  points={filteredData
                    .map((d, i) => {
                      const x = (i / (filteredData.length - 1)) * 800;
                      const y = 240 - ((d.avg_load_kw || 0) / maxKw) * 220;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#FF2A85"
                  strokeWidth="2"
                  className="filter drop-shadow-[0_0_6px_rgba(255,42,133,0.5)]"
                />
              </>
            )}

            {/* Interactive Hover Columns */}
            {filteredData.map((_, i) => {
              const x = (i / (filteredData.length - 1)) * 800;
              const colWidth = 800 / filteredData.length;
              return (
                <rect
                  key={i}
                  x={x - colWidth / 2}
                  y="0"
                  width={colWidth}
                  height="240"
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIdx(i)}
                />
              );
            })}

            {/* Hover Cursor Line */}
            {hoveredIdx !== null && (
              <line
                x1={(hoveredIdx / (filteredData.length - 1)) * 800}
                y1="0"
                x2={(hoveredIdx / (filteredData.length - 1)) * 800}
                y2="240"
                stroke="#FF2A85"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
