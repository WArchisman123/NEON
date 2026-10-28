"use client";

import React, { useState } from "react";
import {
  Info,
  Maximize2,
  Minimize2,
  Network,
  Sun,
  Zap,
  BatteryCharging,
  Flame,
  Factory,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import { AssetDetailModal, TopologyNodeType } from "./asset-detail-modal";

interface SystemTopologyVisualizerProps {
  site: SiteRecord;
  className?: string;
}

export function SystemTopologyVisualizer({
  site,
  className = "",
}: SystemTopologyVisualizerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TopologyNodeType>(null);
  const [flowMode, setFlowMode] = useState<"day" | "night" | "excess" | "islanded">("day");

  // Dynamic telemetry based on site data and selectable flow mode
  const solarKw =
    flowMode === "night"
      ? 0.0
      : Number(site.solar_power_kw ?? 89.3);

  const bessKw =
    flowMode === "night"
      ? 64.2
      : flowMode === "excess"
      ? -85.0
      : Number(site.live_bess_power_kw ?? -74.4);
  const isBessCharging = bessKw < 0;
  const bessSoc = Number(site.bess_soc_pct ?? 21.7);

  const gridKw =
    flowMode === "excess"
      ? -35.0
      : flowMode === "islanded"
      ? 0.0
      : Number(site.grid_power_kw ?? 76.6);
  const isGridImport = gridKw >= 0;

  const dgKw =
    flowMode === "islanded"
      ? 110.0
      : Number(site.dg_power_kw ?? 0.0);
  const isDgRunning = site.dg_running || dgKw > 0;

  const loadKw = Number(site.load_power_kw ?? 100.4);

  return (
    <>
      <div
        className={`rounded-xl bg-theme-card border border-theme-subtle shadow-sm flex flex-col justify-between transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-2 sm:inset-4 z-50 p-4 sm:p-6 bg-theme-card/98 backdrop-blur-2xl border-[#FF2A85]/50 shadow-2xl"
            : `p-3 h-[340px] ${className}`
        }`}
      >
        {/* Topology Header */}
        <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-[#FF2A85]/10 border border-[#FF2A85]/30 flex items-center justify-center">
              <Network className="size-3.5 text-[#FF2A85]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono">
                  System Topology & 3D Asset Matrix
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                  <span className="size-1 rounded-full bg-[#00E676] animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>
          </div>

          {/* Operating Mode Selector (Visible in Fullscreen or Header) */}
          <div className="flex items-center gap-1.5">
            {isFullscreen && (
              <div className="flex items-center gap-1 bg-theme-elevated/80 p-0.5 rounded-lg border border-theme-subtle text-[10px] font-mono mr-2">
                <button
                  type="button"
                  onClick={() => setFlowMode("day")}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    flowMode === "day"
                      ? "bg-[#FFD600] text-black font-bold shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                >
                  Day Mode
                </button>
                <button
                  type="button"
                  onClick={() => setFlowMode("night")}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    flowMode === "night"
                      ? "bg-cyan-500 text-black font-bold shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                >
                  Night Mode
                </button>
                <button
                  type="button"
                  onClick={() => setFlowMode("excess")}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    flowMode === "excess"
                      ? "bg-[#00E676] text-black font-bold shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                >
                  Solar Excess
                </button>
                <button
                  type="button"
                  onClick={() => setFlowMode("islanded")}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    flowMode === "islanded"
                      ? "bg-orange-500 text-black font-bold shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                >
                  DG Backup
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="size-7 rounded-lg hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-theme-subtle"
              title="Electrical Bus Details"
            >
              <Info className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="size-7 rounded-lg hover:bg-theme-elevated text-theme-secondary hover:text-[#FF2A85] flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-[#FF2A85]/30"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Command View"}
            >
              {isFullscreen ? (
                <Minimize2 className="size-3.5" />
              ) : (
                <Maximize2 className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="p-2.5 rounded-lg bg-theme-elevated border border-theme-subtle text-[11px] font-mono text-theme-secondary flex flex-wrap items-center justify-between gap-2 my-1 animate-in fade-in-0 duration-150">
            <span>Substation Bus: 415V AC 3-Phase • DC Bus: 871.3V • Grid Frequency: 50.02 Hz</span>
            <span className="text-[#00E676] font-bold flex items-center gap-1">
              <ShieldCheck className="size-3 text-[#00E676]" />
              Conduits: 5 Dynamic Paths Active (Click any asset to inspect)
            </span>
          </div>
        )}

        {/* Compact / Fullscreen Isometric Topology Canvas with SVG Conduits */}
        <div className="relative w-full flex-1 rounded-xl bg-theme-elevated/20 border border-theme-subtle/40 overflow-hidden flex items-center justify-center p-2 sm:p-3 my-1">
          {/* Subtle Cyber Grid Pattern */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-15 dark:opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="isometric-cyber-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#isometric-cyber-grid)" />
          </svg>

          {/* Animated SVG Conduits Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 600 260"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="topo-glow-strong" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Solar (x: 100, y: 70) -> PCS (x: 300, y: 70) */}
            <path
              d="M 140 70 L 260 70"
              stroke="#FFD600"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className={solarKw > 0 ? "animate-conduit-flow" : "opacity-30"}
            />
            {solarKw > 0 && (
              <circle r="3.5" fill="#FFD600" filter="url(#topo-glow-strong)">
                <animateMotion path="M 140 70 L 260 70" dur="2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* 2. PCS (x: 300, y: 70) <-> Grid (x: 500, y: 70) */}
            <path
              d="M 340 70 L 460 70"
              stroke="#9D4EDD"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-conduit-flow"
            />
            <circle r="3.5" fill="#9D4EDD" filter="url(#topo-glow-strong)">
              <animateMotion
                path={isGridImport ? "M 460 70 L 340 70" : "M 340 70 L 460 70"}
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* 3. PCS (x: 300, y: 70) <-> BESS (x: 300, y: 190) */}
            <path
              d="M 300 95 L 300 165"
              stroke="#00F0FF"
              strokeWidth="3"
              strokeDasharray="4 4"
              className="animate-conduit-flow"
            />
            <circle r="4" fill="#00F0FF" filter="url(#topo-glow-strong)">
              <animateMotion
                path={isBessCharging ? "M 300 95 L 300 165" : "M 300 165 L 300 95"}
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>

            {/* 4. DG Set (x: 100, y: 190) -> BESS (x: 300, y: 190) */}
            <path
              d="M 140 190 L 260 190"
              stroke={isDgRunning ? "#FF6B00" : "rgba(148, 163, 184, 0.25)"}
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className={isDgRunning ? "animate-conduit-flow" : ""}
            />
            {isDgRunning && (
              <circle r="3.5" fill="#FF6B00" filter="url(#topo-glow-strong)">
                <animateMotion path="M 140 190 L 260 190" dur="2.2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* 5. BESS (x: 300, y: 190) -> Building Load (x: 500, y: 190) */}
            <path
              d="M 340 190 L 460 190"
              stroke="#FF2A85"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-conduit-flow"
            />
            <circle r="3.5" fill="#FF2A85" filter="url(#topo-glow-strong)">
              <animateMotion path="M 340 190 L 460 190" dur="1.8s" repeatCount="indefinite" />
            </circle>

            {/* 6. Grid (x: 500, y: 70) -> Building Load (x: 500, y: 190) */}
            <path
              d="M 500 95 L 500 165"
              stroke="#9D4EDD"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-conduit-flow"
            />
            <circle r="3.5" fill="#9D4EDD" filter="url(#topo-glow-strong)">
              <animateMotion path="M 500 95 L 500 165" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Glowing Busbar Junction Nodes */}
            <circle cx="300" cy="70" r="4.5" fill="#FFD600" />
            <circle cx="500" cy="70" r="4.5" fill="#9D4EDD" />
            <circle cx="300" cy="190" r="4.5" fill="#00F0FF" />
            <circle cx="500" cy="190" r="4.5" fill="#FF2A85" />
          </svg>

          {/* 6 Rich Asset Nodes Grid Layout (3 Columns x 2 Rows) */}
          <div className="relative z-10 w-full h-full grid grid-cols-3 grid-rows-2 items-center justify-items-center gap-2 sm:gap-4">
            {/* NODE 1: SOLAR PV (Top-Left) */}
            <div
              onClick={() => setSelectedNode("solar")}
              className="w-full max-w-[170px] p-2 rounded-xl bg-theme-card/90 backdrop-blur-md border border-theme-subtle hover:border-[#FFD600]/60 hover:shadow-[0_0_15px_rgba(255,214,0,0.2)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-theme-primary font-mono flex items-center gap-1">
                  <Sun className="size-3 text-[#FFD600]" />
                  Solar PV
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                  {solarKw > 0 ? "Active" : "Idle"}
                </span>
              </div>

              {/* 3D Isometric Solar Illustration */}
              <div className="my-1 size-10 sm:size-11 mx-auto flex items-center justify-center transition-transform group-hover:scale-105">
                <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
                  <polygon points="6,25 30,12 54,25 30,38" fill="#1E293B" stroke="#FFD600" strokeWidth="1.2" />
                  <line x1="18" y1="18" x2="42" y2="31" stroke="#38BDF8" strokeWidth="0.8" />
                  <line x1="30" y1="12" x2="30" y2="38" stroke="#38BDF8" strokeWidth="0.8" />
                  <line x1="6" y1="25" x2="54" y2="25" stroke="#38BDF8" strokeWidth="0.8" />
                  <polygon points="30,38 54,25 54,32 30,45" fill="#0F172A" />
                  <polygon points="6,25 30,38 30,45 6,32" fill="#334155" />
                  <rect x="42" y="30" width="10" height="13" rx="1.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.8" />
                </svg>
              </div>

              {/* Kilowatt Badge & Sub-metric */}
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs font-black text-[#FFD600]">{solarKw.toFixed(1)} kW</span>
                <span className="text-[9px] text-theme-muted">842 W/m²</span>
              </div>
            </div>

            {/* NODE 2: PCS / INVERTER (Top-Center) */}
            <div
              onClick={() => setSelectedNode("pcs")}
              className="w-full max-w-[170px] p-2 rounded-xl bg-theme-card/90 backdrop-blur-md border border-theme-subtle hover:border-sky-400/60 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-theme-primary font-mono flex items-center gap-1">
                  <Cpu className="size-3 text-sky-400" />
                  PCS Inverter
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {isBessCharging ? "Rectifying" : "Inverting"}
                </span>
              </div>

              {/* 3D Isometric Cabinet */}
              <div className="my-1 size-10 sm:size-11 mx-auto flex items-center justify-center transition-transform group-hover:scale-105">
                <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
                  <polygon points="12,16 30,7 48,16 30,25" fill="#475569" stroke="#94A3B8" strokeWidth="0.8" />
                  <polygon points="30,25 48,16 48,42 30,49" fill="#1E293B" stroke="#64748B" strokeWidth="0.8" />
                  <polygon points="12,16 30,25 30,49 12,42" fill="#334155" stroke="#64748B" strokeWidth="0.8" />
                  <line x1="16" y1="25" x2="26" y2="30" stroke="#94A3B8" strokeWidth="0.75" />
                  <line x1="16" y1="31" x2="26" y2="36" stroke="#94A3B8" strokeWidth="0.75" />
                  <line x1="34" y1="30" x2="44" y2="25" stroke="#94A3B8" strokeWidth="0.75" />
                  <line x1="34" y1="36" x2="44" y2="31" stroke="#94A3B8" strokeWidth="0.75" />
                  <circle cx="30" cy="18" r="1.5" fill="#00E676" />
                </svg>
              </div>

              {/* Kilowatt Badge & Sub-metric */}
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs font-black text-sky-400">
                  {Math.abs(bessKw) > 0 ? Math.abs(bessKw).toFixed(1) : "74.4"} kW
                </span>
                <span className="text-[9px] text-[#00E676]">Eff 98.4%</span>
              </div>
            </div>

            {/* NODE 3: GRID BUS (Top-Right) */}
            <div
              onClick={() => setSelectedNode("grid")}
              className="w-full max-w-[170px] p-2 rounded-xl bg-theme-card/90 backdrop-blur-md border border-theme-subtle hover:border-purple-400/60 hover:shadow-[0_0_15px_rgba(157,78,221,0.2)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-theme-primary font-mono flex items-center gap-1">
                  <Zap className="size-3 text-purple-400" />
                  Utility Grid
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {isGridImport ? "Importing" : "Exporting"}
                </span>
              </div>

              {/* 3D Isometric Transmission Pylon */}
              <div className="my-1 size-10 sm:size-11 mx-auto flex items-center justify-center transition-transform group-hover:scale-105">
                <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
                  <line x1="30" y1="6" x2="30" y2="46" stroke="#94A3B8" strokeWidth="1.2" />
                  <line x1="16" y1="16" x2="44" y2="16" stroke="#94A3B8" strokeWidth="1.2" />
                  <line x1="20" y1="26" x2="40" y2="26" stroke="#94A3B8" strokeWidth="1.2" />
                  <line x1="24" y1="36" x2="36" y2="36" stroke="#94A3B8" strokeWidth="1.2" />
                  <line x1="16" y1="16" x2="30" y2="6" stroke="#64748B" strokeWidth="0.8" />
                  <line x1="44" y1="16" x2="30" y2="6" stroke="#64748B" strokeWidth="0.8" />
                  <line x1="16" y1="16" x2="30" y2="26" stroke="#64748B" strokeWidth="0.8" />
                  <line x1="44" y1="16" x2="30" y2="26" stroke="#64748B" strokeWidth="0.8" />
                  <circle cx="16" cy="16" r="1.5" fill="#9D4EDD" />
                  <circle cx="44" cy="16" r="1.5" fill="#9D4EDD" />
                </svg>
              </div>

              {/* Kilowatt Badge & Sub-metric */}
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs font-black text-purple-400">{Math.abs(gridKw).toFixed(1)} kW</span>
                <span className="text-[9px] text-theme-muted">415V • 50Hz</span>
              </div>
            </div>

            {/* NODE 4: DG SET (Bottom-Left) */}
            <div
              onClick={() => setSelectedNode("dg")}
              className="w-full max-w-[170px] p-2 rounded-xl bg-theme-card/90 backdrop-blur-md border border-theme-subtle hover:border-orange-400/60 hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-theme-primary font-mono flex items-center gap-1">
                  <Flame className="size-3 text-orange-400" />
                  DG Backup
                </span>
                <span className={`text-[8px] font-mono px-1 py-0.2 rounded border ${
                  isDgRunning
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                }`}>
                  {isDgRunning ? "Running" : "Standby"}
                </span>
              </div>

              {/* 3D Isometric Generator */}
              <div className="my-1 size-10 sm:size-11 mx-auto flex items-center justify-center transition-transform group-hover:scale-105">
                <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
                  <polygon points="12,18 30,9 48,18 30,27" fill="#64748B" stroke="#94A3B8" strokeWidth="0.8" />
                  <polygon points="30,27 48,18 48,40 30,47" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
                  <polygon points="12,18 30,27 30,47 12,40" fill="#334155" stroke="#475569" strokeWidth="0.8" />
                  <circle cx="21" cy="33" r="5" fill="#0F172A" stroke={isDgRunning ? "#FF6B00" : "#64748B"} strokeWidth="1" />
                  <rect x="34" y="27" width="10" height="9" rx="1" fill={isDgRunning ? "#EA580C" : "#475569"} />
                  <rect x="36" y="8" width="3" height="7" rx="0.5" fill="#475569" />
                </svg>
              </div>

              {/* Kilowatt Badge & Sub-metric */}
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs font-black text-orange-400">{dgKw.toFixed(1)} kW</span>
                <span className="text-[9px] text-theme-muted">84% Fuel</span>
              </div>
            </div>

            {/* NODE 5: 10KWH BESS (Bottom-Center) */}
            <div
              onClick={() => setSelectedNode("bess")}
              className="w-full max-w-[170px] p-2 rounded-xl bg-theme-card/90 backdrop-blur-md border border-theme-subtle hover:border-[#00F0FF]/60 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-theme-primary font-mono flex items-center gap-1">
                  <BatteryCharging className="size-3 text-[#00F0FF]" />
                  10kWh BESS
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-500/10 text-[#00F0FF] border border-cyan-500/20">
                  {isBessCharging ? "Charging" : "Discharging"}
                </span>
              </div>

              {/* 3D Isometric BESS Container */}
              <div className="my-1 size-10 sm:size-11 mx-auto flex items-center justify-center transition-transform group-hover:scale-105">
                <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
                  <polygon points="10,16 30,6 50,16 30,26" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                  <polygon points="30,26 50,16 50,42 30,50" fill="#0F172A" stroke="#0284C7" strokeWidth="0.8" />
                  <polygon points="10,16 30,26 30,50 10,42" fill="#1E293B" stroke="#0284C7" strokeWidth="0.8" />
                  <line x1="15" y1="25" x2="15" y2="43" stroke="#38BDF8" strokeWidth="0.75" />
                  <line x1="20" y1="28" x2="20" y2="45" stroke="#38BDF8" strokeWidth="0.75" />
                  <line x1="25" y1="30" x2="25" y2="47" stroke="#38BDF8" strokeWidth="0.75" />
                  <rect x="35" y="27" width="10" height="15" rx="1" fill="#0369A1" stroke="#00F0FF" strokeWidth="0.75" />
                  <circle cx="40" cy="31" r="1.5" fill="#00E676" />
                </svg>
              </div>

              {/* Kilowatt Badge & Mini SoC Bar */}
              <div className="space-y-1 font-mono">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-black text-[#00F0FF]">{bessKw.toFixed(1)} kW</span>
                  <span className="text-[9px] text-cyan-400">{bessSoc.toFixed(1)}% SoC</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, bessSoc))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* NODE 6: BUILDING LOAD (Bottom-Right) */}
            <div
              onClick={() => setSelectedNode("load")}
              className="w-full max-w-[170px] p-2 rounded-xl bg-theme-card/90 backdrop-blur-md border border-theme-subtle hover:border-[#FF2A85]/60 hover:shadow-[0_0_15px_rgba(255,42,133,0.2)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-theme-primary font-mono flex items-center gap-1">
                  <Factory className="size-3 text-[#FF2A85]" />
                  Facility Load
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#FF2A85]/10 text-[#FF2A85] border border-[#FF2A85]/20">
                  Demand
                </span>
              </div>

              {/* 3D Isometric Commercial Facility */}
              <div className="my-1 size-10 sm:size-11 mx-auto flex items-center justify-center transition-transform group-hover:scale-105">
                <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
                  <polygon points="14,16 30,7 46,16 30,25" fill="#64748B" stroke="#94A3B8" strokeWidth="0.8" />
                  <polygon points="30,25 46,16 46,45 30,51" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
                  <polygon points="14,16 30,25 30,51 14,45" fill="#334155" stroke="#475569" strokeWidth="0.8" />
                  <rect x="18" y="24" width="3" height="4" fill="#38BDF8" />
                  <rect x="24" y="27" width="3" height="4" fill="#38BDF8" />
                  <rect x="18" y="32" width="3" height="4" fill="#38BDF8" />
                  <rect x="24" y="35" width="3" height="4" fill="#38BDF8" />
                  <rect x="34" y="27" width="3" height="4" fill="#38BDF8" />
                  <rect x="40" y="24" width="3" height="4" fill="#38BDF8" />
                  <rect x="34" y="35" width="3" height="4" fill="#38BDF8" />
                  <rect x="40" y="32" width="3" height="4" fill="#38BDF8" />
                </svg>
              </div>

              {/* Kilowatt Badge & Sub-metric */}
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs font-black text-[#FF2A85]">{loadKw.toFixed(1)} kW</span>
                <span className="text-[9px] text-theme-muted">PF 0.96</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Extended Energy Balance Strip */}
        {isFullscreen && (
          <div className="pt-3 border-t border-theme-subtle grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono animate-in fade-in-0 duration-200">
            <div className="p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
              <span className="text-[10px] text-theme-secondary uppercase">Solar Generation</span>
              <span className="text-sm font-bold text-[#FFD600]">{solarKw.toFixed(1)} kW</span>
            </div>
            <div className="p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
              <span className="text-[10px] text-theme-secondary uppercase">Total Facility Load</span>
              <span className="text-sm font-bold text-[#FF2A85]">{loadKw.toFixed(1)} kW</span>
            </div>
            <div className="p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
              <span className="text-[10px] text-theme-secondary uppercase">Battery Net Power</span>
              <span className="text-sm font-bold text-[#00F0FF]">{bessKw.toFixed(1)} kW</span>
            </div>
            <div className="p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
              <span className="text-[10px] text-theme-secondary uppercase">Grid Net Flow</span>
              <span className="text-sm font-bold text-purple-400">{gridKw.toFixed(1)} kW</span>
            </div>
            <div className="p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] text-theme-secondary uppercase">Round-Trip RTE</span>
              <span className="text-sm font-bold text-[#00E676]">89.4% Efficiency</span>
            </div>
          </div>
        )}
      </div>

      {/* Asset Deep-Dive Telemetry Modal */}
      <AssetDetailModal
        isOpen={selectedNode !== null}
        onClose={() => setSelectedNode(null)}
        nodeType={selectedNode}
        site={site}
      />
    </>
  );
}
