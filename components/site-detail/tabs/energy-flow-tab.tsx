"use client";

import React, { useState } from "react";
import { SiteRecord } from "@/lib/energy/types";
import { SystemTopologyVisualizer } from "@/components/energy-flow/system-topology-visualizer";
import { PowerFlowTrendsChart } from "@/components/energy-flow/power-flow-trends-chart";

interface EnergyFlowTabProps {
  site: SiteRecord;
}

export function EnergyFlowTab({ site }: EnergyFlowTabProps) {
  const [flowMode, setFlowMode] = useState<"day" | "night" | "excess">("day");

  // Summary accumulator values from competitor Page 2
  const solarKw = Number(site.solar_power_kw || 89.3);
  const loadKw = Number(site.load_power_kw || 112.4);
  const gridKw = Number(site.grid_power_kw || 76.6);
  const bessKw = Number(site.live_bess_power_kw || -74.4);
  const bessSoc = Number(site.bess_soc_pct || 21.7);

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
      <PowerFlowTrendsChart />
    </div>
  );
}
