"use client";

import React, { useState } from "react";
import { SiteRecord } from "@/lib/energy/types";

interface HistorianTabProps {
  site: SiteRecord;
}

export function HistorianTab({ site: _site }: HistorianTabProps) {
  void _site;
  const [selectedTag, setSelectedTag] = useState("bess_soc");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "custom">("24h");
  const [resolution, setResolution] = useState("6000");

  const tags = [
    { id: "bess_soc", label: "BESS State of Charge (%)", unit: "%", min: "18.2%", max: "94.5%", avg: "64.1%" },
    { id: "pack_voltage", label: "DC Pack Voltage (V)", unit: "V", min: "482.1 V", max: "512.4 V", avg: "490.2 V" },
    { id: "active_power", label: "Active Grid Power (kW)", unit: "kW", min: "-45.0 kW", max: "182.0 kW", avg: "74.8 kW" },
    { id: "v_thd", label: "Voltage THD (%)", unit: "%", min: "0.85%", max: "2.10%", avg: "1.20%" },
    { id: "irradiance", label: "Solar Irradiance (W/m²)", unit: "W/m²", min: "0 W/m²", max: "982 W/m²", avg: "540 W/m²" },
    { id: "coolant_temp", label: "Coolant Loop Outlet (°C)", unit: "°C", min: "16.8 °C", max: "34.2 °C", avg: "26.5 °C" },
  ];

  const currentTag = tags.find((t) => t.id === selectedTag) || tags[0];

  // 12 Sample downsampled points for display
  const points = [45, 48, 52, 65, 78, 88, 92, 85, 74, 62, 50, 42];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200 font-mono">
      {/* 1. Historian Query Configuration Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-theme-secondary uppercase font-bold">
              Telemetry Register Tag
            </span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="p-2 rounded-lg bg-theme-elevated border border-theme-subtle text-xs text-theme-primary font-bold focus:outline-none focus:border-[#FF2A85]"
            >
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-theme-secondary uppercase font-bold">
              Time Window Range
            </span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-theme-elevated border border-theme-subtle">
              {(["24h", "7d", "30d", "custom"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded text-xs transition-all cursor-pointer ${
                    timeRange === r
                      ? "bg-[#FF2A85] text-white font-bold"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-theme-secondary uppercase font-bold">
              Resolution
            </span>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="p-1.5 rounded-lg bg-theme-elevated border border-theme-subtle text-xs text-theme-primary focus:outline-none"
            >
              <option value="1000">1,000 pts (Fast)</option>
              <option value="6000">6,000 pts (High Res)</option>
              <option value="raw">Raw Stream (Full)</option>
            </select>
          </div>

          <button
            type="button"
            className="self-end px-3 py-2 rounded-lg bg-theme-elevated border border-theme-subtle hover:border-[#FF2A85] text-xs text-theme-primary font-bold cursor-pointer transition-all"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* 2. Statistical Analysis Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Minimum Value</span>
          <span className="text-sm font-black text-cyan-400 mt-1">{currentTag.min}</span>
        </div>
        <div className="p-3 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Maximum Value</span>
          <span className="text-sm font-black text-rose-400 mt-1">{currentTag.max}</span>
        </div>
        <div className="p-3 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Mean Average</span>
          <span className="text-sm font-black text-theme-primary mt-1">{currentTag.avg}</span>
        </div>
        <div className="p-3 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Sample Resolution</span>
          <span className="text-sm font-black text-[#00E676] mt-1">{resolution} pts (Decimated)</span>
        </div>
      </div>

      {/* 3. High-Density Downsampled Telemetry Canvas */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase">
              {currentTag.label} — Time Series Trajectory
            </h3>
            <p className="text-[10px] text-theme-secondary">
              60 FPS hardware accelerated chart canvas with downsampled decimation
            </p>
          </div>
          <span className="text-xs font-bold text-[#FF2A85] bg-[#FF2A85]/10 px-2 py-0.5 rounded border border-[#FF2A85]/30">
            Live Stream Active
          </span>
        </div>

        <div className="h-64 w-full flex items-end justify-between gap-2 p-3 rounded-lg bg-theme-elevated/40 border border-theme-subtle relative">
          {points.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <span className="text-[9px] text-cyan-400 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {val}{currentTag.unit}
              </span>
              <div
                className="w-full bg-gradient-to-t from-[#FF2A85]/40 via-[#FF2A85]/80 to-[#FF2A85] rounded-t-sm group-hover:brightness-125 transition-all"
                style={{ height: `${val}%` }}
              />
              <span className="text-[9px] text-theme-muted">T-{12 - idx}h</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-[10px] text-theme-muted pt-1">
          <span>Window Start: 00:00:00</span>
          <span>Sampling Interval: 100ms Ingestion • 15m Decimation</span>
          <span>Window End: 23:59:59 (Current)</span>
        </div>
      </div>
    </div>
  );
}
