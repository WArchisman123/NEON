"use client";

import React, { useState } from "react";
import { SiteRecord } from "@/lib/energy/types";
import { SystemTopologyVisualizer } from "@/components/energy-flow/system-topology-visualizer";

interface EnergyFlowTabProps {
  site: SiteRecord;
}

export function EnergyFlowTab({ site }: EnergyFlowTabProps) {
  const [flowMode, setFlowMode] = useState<"day" | "night" | "excess">("day");
  const [trendRange, setTrendRange] = useState<"5m" | "15m" | "1h" | "6h" | "12h" | "1d">("1h");

  // Summary accumulator values from competitor Page 2
  const solarKw = Number(site.solar_power_kw || 89.3);
  const loadKw = Number(site.load_power_kw || 112.4);
  const gridKw = Number(site.grid_power_kw || 76.6);
  const bessKw = Number(site.live_bess_power_kw || -74.4);
  const bessSoc = Number(site.bess_soc_pct || 21.7);

  // Time-series mock trend for 5 streams
  const trendPoints = [
    { time: "10:00", solar: 72, grid: 80, battery: -60, building: 92 },
    { time: "10:15", solar: 81, grid: 75, battery: -70, building: 96 },
    { time: "10:30", solar: 86, grid: 78, battery: -72, building: 98 },
    { time: "10:45", solar: 89, grid: 76, battery: -74, building: 100 },
    { time: "11:00", solar: 92, grid: 74, battery: -75, building: 101 },
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200">
      {/* 1. Operating Mode Controls & Pill Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-theme-card border border-theme-subtle">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-theme-primary uppercase">
            Active Transfer Mode:
          </span>
          <span className="text-xs font-mono font-bold text-[#FF2A85] bg-[#FF2A85]/10 px-2.5 py-1 rounded-full border border-[#FF2A85]/30">
            {flowMode === "day"
              ? "Day Mode (Solar Dominant)"
              : flowMode === "night"
              ? "Night Mode (BESS Discharge)"
              : "Solar Excess (Grid Feed-In)"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-theme-elevated border border-theme-subtle">
          <button
            type="button"
            onClick={() => setFlowMode("day")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
              flowMode === "day"
                ? "bg-[#FF2A85] text-white shadow-[0_0_8px_rgba(255,42,133,0.3)]"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            Day Mode
          </button>
          <button
            type="button"
            onClick={() => setFlowMode("night")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
              flowMode === "night"
                ? "bg-[#FF2A85] text-white shadow-[0_0_8px_rgba(255,42,133,0.3)]"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            Night Mode
          </button>
          <button
            type="button"
            onClick={() => setFlowMode("excess")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
              flowMode === "excess"
                ? "bg-[#FF2A85] text-white shadow-[0_0_8px_rgba(255,42,133,0.3)]"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            Solar Excess
          </button>
        </div>
      </div>

      {/* 2. Interactive System Topology Canvas */}
      <SystemTopologyVisualizer site={site} />

      {/* 3. Energy Summary Accumulators (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between font-mono">
          <span className="text-[10px] text-theme-secondary uppercase">Total Generation</span>
          <span className="text-base font-black text-[#FFD600] mt-1">{solarKw.toFixed(1)} kW</span>
          <span className="text-[10px] text-theme-muted mt-0.5">Solar PV Active</span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between font-mono">
          <span className="text-[10px] text-theme-secondary uppercase">Total Facility Load</span>
          <span className="text-base font-black text-purple-400 mt-1">{loadKw.toFixed(1)} kW</span>
          <span className="text-[10px] text-theme-muted mt-0.5">Building + EV Station</span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between font-mono">
          <span className="text-[10px] text-theme-secondary uppercase">Battery Net Power</span>
          <span className="text-base font-black text-cyan-400 mt-1">{bessKw.toFixed(1)} kW</span>
          <span className="text-[10px] text-theme-muted mt-0.5">Charging ({bessSoc}%)</span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between font-mono">
          <span className="text-[10px] text-theme-secondary uppercase">Net Grid Power</span>
          <span className="text-base font-black text-theme-primary mt-1">{gridKw.toFixed(1)} kW</span>
          <span className="text-[10px] text-theme-muted mt-0.5">Importing from Utility</span>
        </div>

        <div className="p-3 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between font-mono col-span-2 sm:col-span-1">
          <span className="text-[10px] text-theme-secondary uppercase">Cycle Status</span>
          <span className="text-base font-black text-[#00E676] mt-1">0.0 / 74.4 kW</span>
          <span className="text-[10px] text-theme-muted mt-0.5">Chg / Dischg Rate</span>
        </div>
      </div>

      {/* 4. Four-Quadrant Diagnostic Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Source Summary */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-2.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
            <span className="font-bold text-theme-primary uppercase">Source Summary</span>
            <span className="text-[10px] text-[#FFD600] font-bold">54% Solar</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Solar PV:</span>
            <span className="font-bold text-[#FFD600]">{solarKw.toFixed(1)} kW (54%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">DG Genset:</span>
            <span className="font-bold text-slate-400">0.0 kW (0%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Grid Import:</span>
            <span className="font-bold text-theme-primary">{gridKw.toFixed(1)} kW (31%)</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-theme-subtle/40">
            <span className="text-theme-secondary font-bold">Total Available:</span>
            <span className="font-black text-[#00E676]">300.7 kW</span>
          </div>
        </div>

        {/* Battery Summary */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-2.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
            <span className="font-bold text-theme-primary uppercase">Battery Summary</span>
            <span className="text-[10px] text-cyan-400 font-bold">Charging</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">State of Charge:</span>
            <span className="font-bold text-cyan-400">{bessSoc}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Net Power:</span>
            <span className="font-bold text-cyan-400">{bessKw.toFixed(1)} kW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Available Energy:</span>
            <span className="font-bold text-theme-primary">135.4 kWh</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-theme-subtle/40">
            <span className="text-theme-secondary font-bold">Pack Health:</span>
            <span className="font-black text-[#00E676]">98.3% SOH</span>
          </div>
        </div>

        {/* Grid Summary */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-2.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
            <span className="font-bold text-theme-primary uppercase">Grid Summary</span>
            <span className="text-[10px] text-[#00E676] font-bold">Online</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Active Power:</span>
            <span className="font-bold text-theme-primary">{gridKw.toFixed(1)} kW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Frequency:</span>
            <span className="font-bold text-cyan-400">49.97 Hz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Line Voltage:</span>
            <span className="font-bold text-theme-primary">414.0 V</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-theme-subtle/40">
            <span className="text-theme-secondary font-bold">Power Factor:</span>
            <span className="font-black text-[#00E676]">0.99 Lead</span>
          </div>
        </div>

        {/* Load Summary */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-2.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
            <span className="font-bold text-theme-primary uppercase">Load Summary</span>
            <span className="text-[10px] text-purple-400 font-bold">64% Util</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Building Load:</span>
            <span className="font-bold text-purple-400">100.4 kW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">EV Charger:</span>
            <span className="font-bold text-cyan-400">12.0 kW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Load PF:</span>
            <span className="font-bold text-theme-primary">0.96</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-theme-subtle/40">
            <span className="text-theme-secondary font-bold">Transformer Util:</span>
            <span className="font-black text-amber-400">64% Nominal</span>
          </div>
        </div>
      </div>

      {/* 5. Power Flow Trends Multi-Series Chart */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-subtle pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase">
              Power Flow Multi-Stream Trends
            </h3>
            <p className="text-[10px] text-theme-secondary">
              Synchronized 5-channel power dispatch trajectory
            </p>
          </div>

          <div className="flex items-center gap-1">
            {(["5m", "15m", "1h", "6h", "12h", "1d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTrendRange(r)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  trendRange === r
                    ? "bg-[#FF2A85] text-white"
                    : "bg-theme-elevated text-theme-secondary hover:text-theme-primary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FFD600]" />
            <span className="text-theme-secondary">Solar PV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#00F0FF]" />
            <span className="text-theme-secondary">BESS Power</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#9D4EDD]" />
            <span className="text-theme-secondary">Grid Power</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#00E676]" />
            <span className="text-theme-secondary">Facility Demand</span>
          </div>
        </div>

        {/* Visualized Stack / Step Bars */}
        <div className="h-40 w-full flex items-end justify-between gap-3 p-3 rounded-lg bg-theme-elevated/40 border border-theme-subtle">
          {trendPoints.map((pt, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1 h-3/4">
                <div
                  className="w-1/4 bg-[#FFD600] rounded-t-sm"
                  style={{ height: `${(pt.solar / 110) * 100}%` }}
                  title={`Solar: ${pt.solar} kW`}
                />
                <div
                  className="w-1/4 bg-cyan-400 rounded-t-sm"
                  style={{ height: `${(Math.abs(pt.battery) / 110) * 100}%` }}
                  title={`Battery: ${pt.battery} kW`}
                />
                <div
                  className="w-1/4 bg-purple-500 rounded-t-sm"
                  style={{ height: `${(pt.grid / 110) * 100}%` }}
                  title={`Grid: ${pt.grid} kW`}
                />
                <div
                  className="w-1/4 bg-[#00E676] rounded-t-sm"
                  style={{ height: `${(pt.building / 110) * 100}%` }}
                  title={`Load: ${pt.building} kW`}
                />
              </div>
              <span className="text-[10px] text-theme-muted">{pt.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
