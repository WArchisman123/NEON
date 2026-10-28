"use client";

import React, { useState } from "react";
import { Info, Maximize2, Minimize2, Network } from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

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

  const gridKw = Number(site.grid_power_kw ?? 74.9);
  const isGridImport = gridKw >= 0;
  const dgKw = Number(site.dg_power_kw ?? 0.0);
  const isDgRunning = site.dg_running || dgKw > 0;
  const bessKw = Number(site.live_bess_power_kw ?? -72.7);
  const isBessCharging = bessKw < 0;

  return (
    <div
      className={`rounded-xl bg-theme-card border border-theme-subtle shadow-sm flex flex-col justify-between transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-4 z-50 p-6 bg-theme-card/98 backdrop-blur-2xl border-[#FF2A85]/50 shadow-2xl"
          : `p-3 h-[340px] ${className}`
      }`}
    >
      {/* Topology Header */}
      <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50">
        <div className="flex items-center gap-2">
          <Network className="size-3.5 text-[#FF2A85]" />
          <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono">
            System Topology
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="size-6 rounded hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary flex items-center justify-center transition-all cursor-pointer"
            title="Topology Details"
          >
            <Info className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="size-6 rounded hover:bg-theme-elevated text-theme-secondary hover:text-[#FF2A85] flex items-center justify-center transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
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
        <div className="p-2 rounded bg-theme-elevated border border-theme-subtle text-[11px] font-mono text-theme-secondary flex items-center justify-between animate-in fade-in-0 duration-150">
          <span>Bus: 415V AC / 871V DC • Frequency: 50.0 Hz</span>
          <span className="text-[#00E676] font-bold">Dynamic Conduits Active</span>
        </div>
      )}

      {/* Compact Isometric Topology Canvas with SVG Conduits */}
      <div className="relative w-full flex-1 rounded-lg bg-theme-elevated/20 border border-theme-subtle/40 overflow-hidden flex items-center justify-center p-2">
        {/* Subtle Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-10 dark:opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="compact-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#compact-grid)" />
        </svg>

        {/* Animated Connecting Conduits Layer (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 600 240"
          preserveAspectRatio="none"
        >
          {/* Conduit Glow Filter */}
          <defs>
            <filter id="topo-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Solar (x: 100, y: 65) -> PCS (x: 300, y: 65) */}
          <path
            d="M 125 65 L 275 65"
            stroke="#FFD600"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-conduit-flow"
          />
          <circle r="3" fill="#FFD600" filter="url(#topo-glow)">
            <animateMotion path="M 125 65 L 275 65" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* 2. PCS (x: 300, y: 65) <-> Grid (x: 500, y: 65) */}
          <path
            d="M 325 65 L 475 65"
            stroke="#9D4EDD"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-conduit-flow"
          />
          <circle r="3" fill="#9D4EDD" filter="url(#topo-glow)">
            <animateMotion
              path={isGridImport ? "M 475 65 L 325 65" : "M 325 65 L 475 65"}
              dur="2.8s"
              repeatCount="indefinite"
            />
          </circle>

          {/* 3. PCS (x: 300, y: 65) <-> 10kWh BESS (x: 300, y: 175) */}
          <path
            d="M 300 85 L 300 155"
            stroke="#00F0FF"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            className="animate-conduit-flow"
          />
          <circle r="3" fill="#00F0FF" filter="url(#topo-glow)">
            <animateMotion
              path={isBessCharging ? "M 300 85 L 300 155" : "M 300 155 L 300 85"}
              dur="2.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* 4. DG Set (x: 100, y: 175) -> 10kWh BESS (x: 300, y: 175) */}
          <path
            d="M 125 175 L 275 175"
            stroke={isDgRunning ? "#FF6B00" : "rgba(148, 163, 184, 0.25)"}
            strokeWidth="2"
            strokeDasharray="4 4"
            className={isDgRunning ? "animate-conduit-flow" : ""}
          />
          {isDgRunning && (
            <circle r="3" fill="#FF6B00" filter="url(#topo-glow)">
              <animateMotion path="M 125 175 L 275 175" dur="3s" repeatCount="indefinite" />
            </circle>
          )}

          {/* 5. 10kWh BESS (x: 300, y: 175) -> Building Load (x: 500, y: 175) */}
          <path
            d="M 325 175 L 475 175"
            stroke="#FF2A85"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-conduit-flow"
          />
          <circle r="3" fill="#FF2A85" filter="url(#topo-glow)">
            <animateMotion path="M 325 175 L 475 175" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* 6. Grid (x: 500, y: 65) -> Building Load (x: 500, y: 175) */}
          <path
            d="M 500 85 L 500 155"
            stroke="#9D4EDD"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-conduit-flow"
          />
          <circle r="3" fill="#9D4EDD" filter="url(#topo-glow)">
            <animateMotion path="M 500 85 L 500 155" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Junction Dots */}
          <circle cx="300" cy="65" r="3.5" fill="#FFD600" />
          <circle cx="500" cy="65" r="3.5" fill="#9D4EDD" />
          <circle cx="300" cy="175" r="3.5" fill="#00F0FF" />
          <circle cx="500" cy="175" r="3.5" fill="#FF2A85" />
        </svg>

        {/* 6 Isometric Nodes Grid Layout (3 Columns x 2 Rows) */}
        <div className="relative z-10 w-full h-full grid grid-cols-3 grid-rows-2 items-center justify-items-center">
          {/* NODE 1: SOLAR PV (Top-Left) */}
          <div className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-0.5">
            <span className="text-[11px] font-bold text-theme-primary font-mono leading-none">
              Solar PV
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00E676] my-0.5">
              <span className="size-1 rounded-full bg-[#00E676]" />
              Online
            </span>
            {/* 3D Isometric Solar Illustration */}
            <div className="size-12 flex items-center justify-center">
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
          </div>

          {/* NODE 2: PCS / INVERTER (Top-Center) */}
          <div className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-0.5">
            <span className="text-[11px] font-bold text-theme-primary font-mono leading-none">
              PCS / Inverter
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00E676] my-0.5">
              <span className="size-1 rounded-full bg-[#00E676]" />
              Online
            </span>
            {/* 3D Isometric Cabinet */}
            <div className="size-12 flex items-center justify-center">
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
          </div>

          {/* NODE 3: GRID (Top-Right) */}
          <div className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-0.5">
            <span className="text-[11px] font-bold text-theme-primary font-mono leading-none">
              Grid
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00E676] my-0.5">
              <span className="size-1 rounded-full bg-[#00E676]" />
              Online
            </span>
            {/* 3D Isometric Transmission Pylon */}
            <div className="size-12 flex items-center justify-center">
              <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
                <line x1="30" y1="6" x2="30" y2="46" stroke="#94A3B8" strokeWidth="1.2" />
                <line x1="16" y1="16" x2="44" y2="16" stroke="#94A3B8" strokeWidth="1.2" />
                <line x1="20" y1="26" x2="40" y2="26" stroke="#94A3B8" strokeWidth="1.2" />
                <line x1="24" y1="36" x2="36" y2="36" stroke="#94A3B8" strokeWidth="1.2" />
                <line x1="16" y1="16" x2="30" y2="6" stroke="#64748B" strokeWidth="0.8" />
                <line x1="44" y1="16" x2="30" y2="6" stroke="#64748B" strokeWidth="0.8" />
                <line x1="16" y1="16" x2="30" y2="26" stroke="#64748B" strokeWidth="0.8" />
                <line x1="44" y1="16" x2="30" y2="26" stroke="#64748B" strokeWidth="0.8" />
                <line x1="20" y1="26" x2="30" y2="46" stroke="#64748B" strokeWidth="0.8" />
                <line x1="40" y1="26" x2="30" y2="46" stroke="#64748B" strokeWidth="0.8" />
                <circle cx="16" cy="16" r="1.5" fill="#9D4EDD" />
                <circle cx="44" cy="16" r="1.5" fill="#9D4EDD" />
              </svg>
            </div>
          </div>

          {/* NODE 4: DG SET (Bottom-Left) */}
          <div className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-0.5">
            <span className="text-[11px] font-bold text-theme-primary font-mono leading-none">
              DG Set
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00E676] my-0.5">
              <span className="size-1 rounded-full bg-[#00E676]" />
              Online
            </span>
            {/* 3D Isometric Generator */}
            <div className="size-12 flex items-center justify-center">
              <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow">
                <polygon points="12,18 30,9 48,18 30,27" fill="#64748B" stroke="#94A3B8" strokeWidth="0.8" />
                <polygon points="30,27 48,18 48,40 30,47" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
                <polygon points="12,18 30,27 30,47 12,40" fill="#334155" stroke="#475569" strokeWidth="0.8" />
                <circle cx="21" cy="33" r="5" fill="#0F172A" stroke="#FF6B00" strokeWidth="1" />
                <rect x="34" y="27" width="10" height="9" rx="1" fill="#EA580C" />
                <rect x="36" y="8" width="3" height="7" rx="0.5" fill="#475569" />
              </svg>
            </div>
          </div>

          {/* NODE 5: 10KWH BESS (Bottom-Center) */}
          <div className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-0.5">
            <span className="text-[11px] font-bold text-theme-primary font-mono leading-none">
              10kWh BESS
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00E676] my-0.5">
              <span className="size-1 rounded-full bg-[#00E676]" />
              Online
            </span>
            {/* 3D Isometric BESS Container */}
            <div className="size-12 flex items-center justify-center">
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
          </div>

          {/* NODE 6: BUILDING LOAD (Bottom-Right) */}
          <div className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-0.5">
            <span className="text-[11px] font-bold text-theme-primary font-mono leading-none">
              Building Load
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00E676] my-0.5">
              <span className="size-1 rounded-full bg-[#00E676]" />
              Online
            </span>
            {/* 3D Isometric Commercial Facility */}
            <div className="size-12 flex items-center justify-center">
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
          </div>
        </div>
      </div>
    </div>
  );
}
