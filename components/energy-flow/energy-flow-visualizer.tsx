"use client";

import React, { useState, useMemo } from "react";
import {
  Sun,
  BatteryCharging,
  Zap,
  Flame,
  Factory,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import { calculateEnergyFlows } from "@/lib/energy/flow-engine";
import { TelemetryDrawer } from "./telemetry-drawer";

interface EnergyFlowVisualizerProps {
  site: SiteRecord;
}

export function EnergyFlowVisualizer({ site }: EnergyFlowVisualizerProps) {
  const [scenario, setScenario] = useState<
    "live" | "solar_surplus" | "peak_shaving" | "grid_support" | "islanded_dg"
  >("live");
  const [selectedDrawerNode, setSelectedDrawerNode] = useState<
    "solar" | "bess" | "dg" | "grid" | "load" | null
  >(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Calculate direct point-to-point energy flows
  const flowState = useMemo(() => {
    return calculateEnergyFlows(site, scenario, refreshKey);
  }, [site, scenario, refreshKey]);

  const {
    conduits,
    systemMode,
    systemModeDescription,
    loadEnergyMix,
    sourceOutputs,
    directTransfers,
  } = flowState;

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 relative overflow-hidden shadow-2xl">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />

      {/* Top Canvas Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              Direct Source-to-Sink Electrical Energy Flow
            </h3>
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/25">
              <span className="size-1.5 rounded-full bg-[#00E676] animate-pulse" />
              MODBUS SCADA ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time energy routing showing exact kilowatt distribution from generation sources into facility load
          </p>
        </div>

        {/* Operational Mode Badge & Timestamp */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121622] border border-[#FF2A85]/40 text-xs font-mono shadow-[0_0_12px_rgba(255,42,133,0.15)]">
            <span className="size-2 rounded-full bg-[#FF2A85] animate-pulse" />
            <span className="text-slate-400">Mode:</span>
            <strong className="text-white font-bold">{systemMode}</strong>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121622] border border-white/[0.06] text-[11px] font-mono text-slate-300">
            <span className="size-1.5 rounded-full bg-[#00E676]" />
            <span className="text-slate-400">LAST RECEIVED:</span>
            <strong className="text-white">
              {flowState.lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </strong>
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              title="Refresh telemetry"
              className="ml-1 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Flow Switcher */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pb-4 border-b border-white/[0.04]">
        <span className="text-xs font-mono font-semibold uppercase text-slate-400 flex items-center gap-1.5 mr-1">
          <Sliders className="size-3.5 text-[#FF2A85]" />
          <span>Flow Routing Scenarios:</span>
        </span>

        <button
          type="button"
          onClick={() => setScenario("live")}
          className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
            scenario === "live"
              ? "bg-[#FF2A85] text-white font-bold shadow-[0_0_10px_rgba(255,42,133,0.4)]"
              : "bg-[#121622] text-slate-400 hover:text-slate-200 border border-white/[0.04]"
          }`}
        >
          Live Telemetry
        </button>

        <button
          type="button"
          onClick={() => setScenario("peak_shaving")}
          className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
            scenario === "peak_shaving"
              ? "bg-[#00F0FF] text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              : "bg-[#121622] text-slate-400 hover:text-slate-200 border border-white/[0.04]"
          }`}
        >
          Peak Shaving ➔ BESS + Solar to Load
        </button>

        <button
          type="button"
          onClick={() => setScenario("solar_surplus")}
          className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
            scenario === "solar_surplus"
              ? "bg-[#FFD600] text-black font-bold shadow-[0_0_10px_rgba(255,214,0,0.4)]"
              : "bg-[#121622] text-slate-400 hover:text-slate-200 border border-white/[0.04]"
          }`}
        >
          Solar Surplus ➔ Load + BESS Charge + Feed
        </button>

        <button
          type="button"
          onClick={() => setScenario("grid_support")}
          className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
            scenario === "grid_support"
              ? "bg-[#9D4EDD] text-white font-bold shadow-[0_0_10px_rgba(157,78,221,0.4)]"
              : "bg-[#121622] text-slate-400 hover:text-slate-200 border border-white/[0.04]"
          }`}
        >
          Night Grid Import ➔ 100% to Load
        </button>

        <button
          type="button"
          onClick={() => setScenario("islanded_dg")}
          className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
            scenario === "islanded_dg"
              ? "bg-[#FF6B00] text-white font-bold shadow-[0_0_10px_rgba(255,107,0,0.4)]"
              : "bg-[#121622] text-slate-400 hover:text-slate-200 border border-white/[0.04]"
          }`}
        >
          Islanded Microgrid ➔ DG + Solar to Load
        </button>
      </div>

      {/* Mode Description Toast */}
      <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#121622]/60 border border-white/[0.04] text-[11px] font-mono text-slate-300 flex items-center gap-2">
        <span className="text-[#FF2A85] font-bold">PHYSICAL DISPATCH:</span>
        <span>{systemModeDescription}</span>
      </div>

      {/* Technical Schematic Canvas Container */}
      <div className="mt-6 relative bg-[#060709] rounded-xl border border-white/[0.06] p-4 sm:p-6 lg:p-8 overflow-hidden">
        {/* Engineering Dot Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Animated Directional SVG Conduits Layer (Desktop View) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-solar-load" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD600" />
                <stop offset="100%" stopColor="#FF2A85" />
              </linearGradient>
              <linearGradient id="grad-bess-load" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="100%" stopColor="#FF2A85" />
              </linearGradient>
              <linearGradient id="grad-solar-bess" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD600" />
                <stop offset="100%" stopColor="#00F0FF" />
              </linearGradient>
              <linearGradient id="grad-dg-load" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FF2A85" />
              </linearGradient>
              <linearGradient id="grad-grid-load" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9D4EDD" />
                <stop offset="100%" stopColor="#FF2A85" />
              </linearGradient>
            </defs>

            {/* Direct Conduits Connecting Generation Sources Directly to Facility Load */}

            {/* 1. Solar -> Load Conduit */}
            {conduits.solarToLoad.active && (
              <>
                <path
                  d="M 360 85 C 520 85, 540 220, 680 220"
                  fill="none"
                  stroke="rgba(255, 214, 0, 0.15)"
                  strokeWidth="4"
                />
                <path
                  d="M 360 85 C 520 85, 540 220, 680 220"
                  fill="none"
                  stroke="url(#grad-solar-load)"
                  strokeWidth="3.5"
                  strokeDasharray="6 8"
                  className="animate-flow-forward"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(255, 214, 0, 0.7))",
                    animationDuration: `${conduits.solarToLoad.speedSec}s`,
                  }}
                />
              </>
            )}

            {/* 2. BESS -> Load Conduit (Discharging) */}
            {conduits.bessToLoad.active && (
              <>
                <path
                  d="M 360 225 C 480 225, 540 240, 680 240"
                  fill="none"
                  stroke="rgba(0, 240, 255, 0.15)"
                  strokeWidth="4"
                />
                <path
                  d="M 360 225 C 480 225, 540 240, 680 240"
                  fill="none"
                  stroke="url(#grad-bess-load)"
                  strokeWidth="3.5"
                  strokeDasharray="6 8"
                  className="animate-flow-forward"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(0, 240, 255, 0.7))",
                    animationDuration: `${conduits.bessToLoad.speedSec}s`,
                  }}
                />
              </>
            )}

            {/* 3. Solar -> BESS Conduit (Charging) */}
            {conduits.solarToBess.active && (
              <>
                <path
                  d="M 210 135 L 210 185"
                  fill="none"
                  stroke="rgba(255, 214, 0, 0.15)"
                  strokeWidth="4"
                />
                <path
                  d="M 210 135 L 210 185"
                  fill="none"
                  stroke="url(#grad-solar-bess)"
                  strokeWidth="3.5"
                  strokeDasharray="6 8"
                  className="animate-flow-forward"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(255, 214, 0, 0.7))",
                    animationDuration: `${conduits.solarToBess.speedSec}s`,
                  }}
                />
              </>
            )}

            {/* 4. DG -> Load Conduit */}
            {conduits.dgToLoad.active && (
              <>
                <path
                  d="M 360 365 C 500 365, 540 260, 680 260"
                  fill="none"
                  stroke="rgba(255, 107, 0, 0.15)"
                  strokeWidth="4"
                />
                <path
                  d="M 360 365 C 500 365, 540 260, 680 260"
                  fill="none"
                  stroke="url(#grad-dg-load)"
                  strokeWidth="3.5"
                  strokeDasharray="6 8"
                  className="animate-flow-forward"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(255, 107, 0, 0.7))",
                    animationDuration: `${conduits.dgToLoad.speedSec}s`,
                  }}
                />
              </>
            )}

            {/* 5. Grid -> Load Conduit */}
            {conduits.gridToLoad.active && (
              <>
                <path
                  d="M 360 505 C 520 505, 560 280, 680 280"
                  fill="none"
                  stroke="rgba(157, 78, 221, 0.15)"
                  strokeWidth="4"
                />
                <path
                  d="M 360 505 C 520 505, 560 280, 680 280"
                  fill="none"
                  stroke="url(#grad-grid-load)"
                  strokeWidth="3.5"
                  strokeDasharray="6 8"
                  className="animate-flow-forward"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(157, 78, 221, 0.7))",
                    animationDuration: `${conduits.gridToLoad.speedSec}s`,
                  }}
                />
              </>
            )}
          </svg>
        </div>

        {/* SOURCE-TO-SINK 2-COLUMN TOPOLOGY */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Generation Sources & Storage (5 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Generation Sources & Storage
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Click Card for Telemetry Drawer
              </span>
            </div>

            {/* 1. Solar PV Node Card */}
            {site.has_solar && (
              <button
                type="button"
                onClick={() => setSelectedDrawerNode("solar")}
                className="w-full text-left p-4 rounded-xl bg-[#0B0D13] border border-amber-500/30 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(255,214,0,0.3)] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30">
                      <Sun className="size-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        Solar PV Generation
                      </span>
                      <div className="text-xl font-black font-mono text-white">
                        {sourceOutputs.solar.totalKw.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-400">kW</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#FFD600]">
                    {sourceOutputs.solar.totalKw > 0 ? "GENERATING" : "IDLE"}
                  </span>
                </div>

                {/* Explicit Destination Breakdown */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      ➔ Dispatched to Facility Load:
                    </span>
                    <strong className="text-[#FFD600]">
                      {directTransfers.solarToLoadKw.toLocaleString()} kW
                    </strong>
                  </div>

                  {directTransfers.solarToBessKw > 0 && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        ➔ Stored into BESS (Charging):
                      </span>
                      <strong className="text-[#00F0FF]">
                        +{directTransfers.solarToBessKw.toLocaleString()} kW
                      </strong>
                    </div>
                  )}

                  {directTransfers.solarToGridKw > 0 && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        ➔ Exported to Utility Grid:
                      </span>
                      <strong className="text-[#00E676]">
                        +{directTransfers.solarToGridKw.toLocaleString()} kW
                      </strong>
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* 2. BESS Storage Node Card */}
            {site.has_bess && (
              <button
                type="button"
                onClick={() => setSelectedDrawerNode("bess")}
                className="w-full text-left p-4 rounded-xl bg-[#0B0D13] border border-cyan-500/30 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                      <BatteryCharging className="size-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        BESS Storage Container
                      </span>
                      <div className="text-xl font-black font-mono text-white">
                        {flowState.details.bess.socPct.toFixed(1)}%{" "}
                        <span className="text-xs font-normal text-slate-400">SoC</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold ${
                      sourceOutputs.bess.direction === "charging"
                        ? "text-[#00F0FF]"
                        : sourceOutputs.bess.direction === "discharging"
                        ? "text-[#00E676]"
                        : "text-slate-400"
                    }`}
                  >
                    {sourceOutputs.bess.direction === "charging"
                      ? "CHARGING"
                      : sourceOutputs.bess.direction === "discharging"
                      ? "DISCHARGING"
                      : "STANDBY"}
                  </span>
                </div>

                {/* SoC Progress Bar */}
                <div className="mt-3 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.05]">
                  <div
                    className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0090FF] rounded-full shadow-[0_0_8px_#00F0FF]"
                    style={{ width: `${flowState.details.bess.socPct}%` }}
                  />
                </div>

                {/* Explicit Destination Breakdown */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-xs font-mono">
                  {sourceOutputs.bess.direction === "discharging" ? (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">
                        ➔ Powering Facility Load:
                      </span>
                      <strong className="text-[#00F0FF]">
                        +{directTransfers.bessToLoadKw.toLocaleString()} kW
                      </strong>
                    </div>
                  ) : sourceOutputs.bess.direction === "charging" ? (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">
                         Receiving from Solar PV:
                      </span>
                      <strong className="text-[#FFD600]">
                        +{sourceOutputs.bess.fromSolarKw.toLocaleString()} kW
                      </strong>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center">
                      Battery pack in standby (0 kW transfer)
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* 3. Diesel Generator Peaker Node Card */}
            {site.has_dg && (
              <button
                type="button"
                onClick={() => setSelectedDrawerNode("dg")}
                className="w-full text-left p-4 rounded-xl bg-[#0B0D13] border border-orange-500/30 hover:border-[#FF6B00] hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30">
                      <Flame className="size-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        DG Genset Peaker
                      </span>
                      <div className="text-xl font-black font-mono text-white">
                        {sourceOutputs.dg.totalKw.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-400">kW</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold ${
                      sourceOutputs.dg.running ? "text-[#FF6B00]" : "text-slate-400"
                    }`}
                  >
                    {sourceOutputs.dg.running ? "RUNNING" : "AUTO STANDBY"}
                  </span>
                </div>

                {/* Explicit Destination Breakdown */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-xs font-mono">
                  {sourceOutputs.dg.running ? (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">
                        ➔ Dispatched directly to Facility Load:
                      </span>
                      <strong className="text-[#FF6B00]">
                        +{directTransfers.dgToLoadKw.toLocaleString()} kW
                      </strong>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center">
                      Engine on standby (Ready for auto-crank)
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* 4. Utility Grid Intertie Node Card */}
            {site.has_grid ? (
              <button
                type="button"
                onClick={() => setSelectedDrawerNode("grid")}
                className="w-full text-left p-4 rounded-xl bg-[#0B0D13] border border-purple-500/30 hover:border-[#9D4EDD] hover:shadow-[0_0_20px_rgba(157,78,221,0.3)] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#9D4EDD]/10 text-[#9D4EDD] border border-[#9D4EDD]/30">
                      <Zap className="size-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        Utility Grid Intertie
                      </span>
                      <div className="text-xl font-black font-mono text-white">
                        {sourceOutputs.grid.totalKw.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-400">kW</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold ${
                      sourceOutputs.grid.direction === "export"
                        ? "text-[#00E676]"
                        : sourceOutputs.grid.direction === "import"
                        ? "text-[#9D4EDD]"
                        : "text-slate-400"
                    }`}
                  >
                    {sourceOutputs.grid.direction === "export"
                      ? "FEED-IN EXPORT"
                      : sourceOutputs.grid.direction === "import"
                      ? "IMPORTING"
                      : "ZERO NET"}
                  </span>
                </div>

                {/* Explicit Destination Breakdown */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-xs font-mono">
                  {sourceOutputs.grid.direction === "import" ? (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">
                        ➔ Powering Facility Load:
                      </span>
                      <strong className="text-[#9D4EDD]">
                        +{directTransfers.gridToLoadKw.toLocaleString()} kW
                      </strong>
                    </div>
                  ) : sourceOutputs.grid.direction === "export" ? (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">
                         Surplus Green Solar Feed-in:
                      </span>
                      <strong className="text-[#00E676]">
                        +{sourceOutputs.grid.fromSolarKw.toLocaleString()} kW
                      </strong>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center">
                      Grid in balance (0 kW net exchange)
                    </div>
                  )}
                </div>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#121622]/40 border border-white/[0.04] text-xs font-mono text-slate-500 flex items-center justify-between">
                <span>Utility Grid: ISLANDED (No Connection)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                  OFF-GRID
                </span>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Primary Destination (Facility Load) & Exact Energy Mix (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Primary Consumer: Facility Load & Energy Mix
              </span>
              <span className="text-[10px] font-mono text-[#00E676] flex items-center gap-1">
                <CheckCircle2 className="size-3 text-[#00E676]" />
                100% Demand Satisfied
              </span>
            </div>

            {/* Prominent Facility Load Hub Card */}
            <button
              type="button"
              onClick={() => setSelectedDrawerNode("load")}
              className="w-full text-left p-5 rounded-xl bg-[#0B0D13] border-2 border-[#FF2A85]/50 hover:border-[#FF2A85] hover:shadow-[0_0_25px_rgba(255,42,133,0.35)] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/40 shadow-[0_0_12px_rgba(255,42,133,0.3)]">
                    <Factory className="size-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      Active Facility Load Demand
                    </span>
                    <div className="text-3xl font-black font-mono text-white tracking-tight">
                      {loadEnergyMix.totalDemandKw.toLocaleString()}{" "}
                      <span className="text-base font-normal text-slate-400">kW</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#FF2A85]">ACTIVE SINK</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">Click for Power Quality</div>
                </div>
              </div>

              {/* Segmented Multi-Color Progress Bar showing Exact Supply Mix */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-bold uppercase">
                    Real-Time Supply Breakdown:
                  </span>
                  <span className="text-white font-bold">
                    {loadEnergyMix.totalDemandKw} kW Total
                  </span>
                </div>

                {/* Segmented Bar */}
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-white/[0.08]">
                  {/* Solar Share (Amber) */}
                  {loadEnergyMix.solarKw > 0 && (
                    <div
                      className="h-full bg-[#FFD600] transition-all shadow-[0_0_8px_#FFD600]"
                      style={{ width: `${loadEnergyMix.solarPct}%` }}
                      title={`Solar: ${loadEnergyMix.solarKw} kW (${loadEnergyMix.solarPct}%)`}
                    />
                  )}

                  {/* BESS Share (Cyan) */}
                  {loadEnergyMix.bessKw > 0 && (
                    <div
                      className="h-full bg-[#00F0FF] transition-all shadow-[0_0_8px_#00F0FF]"
                      style={{ width: `${loadEnergyMix.bessPct}%` }}
                      title={`BESS: ${loadEnergyMix.bessKw} kW (${loadEnergyMix.bessPct}%)`}
                    />
                  )}

                  {/* DG Share (Orange) */}
                  {loadEnergyMix.dgKw > 0 && (
                    <div
                      className="h-full bg-[#FF6B00] transition-all shadow-[0_0_8px_#FF6B00]"
                      style={{ width: `${loadEnergyMix.dgPct}%` }}
                      title={`DG: ${loadEnergyMix.dgKw} kW (${loadEnergyMix.dgPct}%)`}
                    />
                  )}

                  {/* Grid Share (Purple) */}
                  {loadEnergyMix.gridKw > 0 && (
                    <div
                      className="h-full bg-[#9D4EDD] transition-all shadow-[0_0_8px_#9D4EDD]"
                      style={{ width: `${loadEnergyMix.gridPct}%` }}
                      title={`Grid: ${loadEnergyMix.gridKw} kW (${loadEnergyMix.gridPct}%)`}
                    />
                  )}
                </div>
              </div>

              {/* Exact Power Source Breakdown Table */}
              <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-2.5">
                {/* 1. From Solar */}
                <div className="p-3 rounded-lg bg-[#121622]/90 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                      <Sun className="size-3 text-[#FFD600]" /> From Solar PV
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#FFD600]">
                      {loadEnergyMix.solarPct}%
                    </span>
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    +{loadEnergyMix.solarKw.toLocaleString()} kW
                  </div>
                </div>

                {/* 2. From BESS */}
                <div className="p-3 rounded-lg bg-[#121622]/90 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                      <BatteryCharging className="size-3 text-[#00F0FF]" /> From BESS Storage
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#00F0FF]">
                      {loadEnergyMix.bessPct}%
                    </span>
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    +{loadEnergyMix.bessKw.toLocaleString()} kW
                  </div>
                </div>

                {/* 3. From DG Peaker */}
                <div className="p-3 rounded-lg bg-[#121622]/90 border border-orange-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                      <Flame className="size-3 text-[#FF6B00]" /> From DG Genset
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#FF6B00]">
                      {loadEnergyMix.dgPct}%
                    </span>
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    +{loadEnergyMix.dgKw.toLocaleString()} kW
                  </div>
                </div>

                {/* 4. From Utility Grid */}
                <div className="p-3 rounded-lg bg-[#121622]/90 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                      <Zap className="size-3 text-[#9D4EDD]" /> From Utility Grid
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#9D4EDD]">
                      {loadEnergyMix.gridPct}%
                    </span>
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    +{loadEnergyMix.gridKw.toLocaleString()} kW
                  </div>
                </div>
              </div>
            </button>

            {/* Active Physical Conduits Transfer Table */}
            <div className="rounded-xl bg-[#121622]/60 border border-white/[0.06] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Active Direct Power Conduits
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Physical Transfer Rate
                </span>
              </div>

              <div className="space-y-2">
                {conduits.solarToLoad.active && (
                  <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-amber-500/20 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#FFD600] animate-ping" />
                      <span className="text-white font-bold">Solar PV ➔ Facility Load</span>
                    </div>
                    <span className="text-[#FFD600] font-bold">
                      {conduits.solarToLoad.kw.toLocaleString()} kW
                    </span>
                  </div>
                )}

                {conduits.bessToLoad.active && (
                  <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#00F0FF] animate-ping" />
                      <span className="text-white font-bold">BESS Discharge ➔ Facility Load</span>
                    </div>
                    <span className="text-[#00F0FF] font-bold">
                      {conduits.bessToLoad.kw.toLocaleString()} kW
                    </span>
                  </div>
                )}

                {conduits.solarToBess.active && (
                  <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-amber-500/20 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#FFD600] animate-ping" />
                      <span className="text-white font-bold">Solar PV ➔ BESS (Charging)</span>
                    </div>
                    <span className="text-[#00F0FF] font-bold">
                      +{conduits.solarToBess.kw.toLocaleString()} kW
                    </span>
                  </div>
                )}

                {conduits.dgToLoad.active && (
                  <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-orange-500/20 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#FF6B00] animate-ping" />
                      <span className="text-white font-bold">DG Genset Peaker ➔ Facility Load</span>
                    </div>
                    <span className="text-[#FF6B00] font-bold">
                      +{conduits.dgToLoad.kw.toLocaleString()} kW
                    </span>
                  </div>
                )}

                {conduits.gridToLoad.active && (
                  <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-purple-500/20 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#9D4EDD] animate-ping" />
                      <span className="text-white font-bold">Utility Grid Import ➔ Facility Load</span>
                    </div>
                    <span className="text-[#9D4EDD] font-bold">
                      +{conduits.gridToLoad.kw.toLocaleString()} kW
                    </span>
                  </div>
                )}

                {conduits.solarToGrid.active && (
                  <div className="p-2.5 rounded-lg bg-[#0B0D13] border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#00E676] animate-ping" />
                      <span className="text-white font-bold">Solar PV ➔ Utility Grid (Feed-in)</span>
                    </div>
                    <span className="text-[#00E676] font-bold">
                      +{conduits.solarToGrid.kw.toLocaleString()} kW
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Detailed Telemetry Drawer */}
      <TelemetryDrawer
        isOpen={selectedDrawerNode !== null}
        onClose={() => setSelectedDrawerNode(null)}
        nodeType={selectedDrawerNode}
        flowState={flowState}
        siteId={site.id}
      />
    </div>
  );
}
