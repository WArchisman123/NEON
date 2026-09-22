"use client";

import React, { useState, useMemo } from "react";
import {
  Sun,
  BatteryCharging,
  Zap,
  Flame,
  Home,
  CheckCircle2,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import { calculateEnergyFlows } from "@/lib/energy/flow-engine";
import { TelemetryDrawer } from "./telemetry-drawer";

interface SchematicNodeFlowProps {
  site: SiteRecord;
}

export function SchematicNodeFlow({ site }: SchematicNodeFlowProps) {
  const [horizon, setHorizon] = useState<"realtime" | "daily" | "monthly" | "yearly">("realtime");
  const [selectedDrawerNode, setSelectedDrawerNode] = useState<
    "solar" | "bess" | "dg" | "grid" | "load" | null
  >(null);

  const flowState = useMemo(() => {
    return calculateEnergyFlows(site, "live");
  }, [site]);

  const { details, loadEnergyMix, directTransfers } = flowState;

  // Horizon multipliers for simulated aggregated energy numbers
  const multiplier = horizon === "daily" ? 7.5 : horizon === "monthly" ? 220 : horizon === "yearly" ? 2600 : 1;
  const unit = horizon === "realtime" ? "kW" : horizon === "daily" ? "kWh" : "MWh";

  const formatHorizonVal = (kw: number) => {
    if (horizon === "realtime") {
      return kw.toFixed(2);
    }
    const total = kw * multiplier;
    if (horizon === "daily") {
      return Math.round(total).toLocaleString();
    }
    return (total / 1000).toFixed(1);
  };

  // Values based on active horizon
  const solarVal = formatHorizonVal(directTransfers.solarToLoadKw);
  const bessVal = formatHorizonVal(directTransfers.bessToLoadKw);
  const dgVal = formatHorizonVal(directTransfers.dgToLoadKw);
  const gridVal = formatHorizonVal(directTransfers.gridToLoadKw);
  const loadVal = formatHorizonVal(loadEnergyMix.totalDemandKw);

  // Percentages of load
  const solarPct = loadEnergyMix.solarPct;
  const bessPct = loadEnergyMix.bessPct;
  const dgPct = loadEnergyMix.dgPct;
  const gridPct = loadEnergyMix.gridPct;

  // Node active states
  const isSolarActive = directTransfers.solarToLoadKw > 0;
  const isBessActive = directTransfers.bessToLoadKw > 0 || flowState.sourceOutputs.bess.direction === "charging";
  const isDgActive = directTransfers.dgToLoadKw > 0;
  const isGridActive = directTransfers.gridToLoadKw > 0;

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 relative overflow-hidden shadow-2xl space-y-6">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />

      {/* 1. ASSET TELEMETRY CARDS STRIP (1:1 with flow.jpg) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Solar */}
        <div className="rounded-xl bg-[#121622] border border-white/[0.06] overflow-hidden">
          <div className="bg-[#00F0FF]/15 px-3 py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold font-mono text-[#00F0FF] border-b border-white/[0.04]">
            <Sun className="size-3.5" />
            <span>Solar</span>
          </div>
          <div className="p-3 space-y-2 text-center text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Installed Capacity</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {site.solar_capacity_kwp} kW
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Specific Yield</div>
              <div className="text-sm font-bold text-[#FFD600] mt-0.5">
                {(
                  (site.solar_yield_today_kwh || site.solar_capacity_kwp * 4.2) /
                  (site.solar_capacity_kwp || 1)
                ).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Site Health</div>
              <div className="text-xs font-bold text-[#00E676] mt-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="size-3 text-[#00E676]" />
                {details.solar.performanceRatioPct}% PR
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Grid */}
        <div className="rounded-xl bg-[#121622] border border-white/[0.06] overflow-hidden">
          <div className="bg-[#FFAB00]/15 px-3 py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold font-mono text-[#FFAB00] border-b border-white/[0.04]">
            <Zap className="size-3.5" />
            <span>Grid</span>
          </div>
          <div className="p-3 space-y-2 text-center text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Sanctioned Load</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {site.has_grid ? `${site.contracted_demand_kva} kW` : "0 kW (Islanded)"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">MDI</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {site.has_grid ? `${details.load.peakDemandTodayKva} kVA` : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Phase 1/2/3 (kW)</div>
              <div className="text-xs font-bold text-slate-300 mt-0.5">
                {(loadEnergyMix.totalDemandKw * 0.33).toFixed(1)} /{" "}
                {(loadEnergyMix.totalDemandKw * 0.34).toFixed(1)} /{" "}
                {(loadEnergyMix.totalDemandKw * 0.33).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: DG */}
        <div className="rounded-xl bg-[#121622] border border-white/[0.06] overflow-hidden">
          <div className="bg-slate-700/30 px-3 py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold font-mono text-slate-300 border-b border-white/[0.04]">
            <Flame className="size-3.5 text-[#FF6B00]" />
            <span>DG</span>
          </div>
          <div className="p-3 space-y-2 text-center text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Installed Capacity</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {site.dg_capacity_kva ? `${site.dg_capacity_kva} KVA` : "0 KVA"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">No Of Gensets</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {site.has_dg ? "1" : "0"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Runtime</div>
              <div className="text-xs font-bold text-slate-300 mt-0.5">
                {site.has_dg ? `${details.dg.runHours} hrs` : "0 hrs"}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: BESS Storage */}
        <div className="rounded-xl bg-[#121622] border border-white/[0.06] overflow-hidden">
          <div className="bg-[#00F0FF]/15 px-3 py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold font-mono text-[#00F0FF] border-b border-white/[0.04]">
            <BatteryCharging className="size-3.5" />
            <span>BESS</span>
          </div>
          <div className="p-3 space-y-2 text-center text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Capacity</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {site.bess_capacity_kwh ? `${site.bess_capacity_kwh} kWh` : "0 kWh"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">State of Charge</div>
              <div className="text-sm font-bold text-[#00F0FF] mt-0.5">
                {site.has_bess ? `${details.bess.socPct.toFixed(1)}% SoC` : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Stored Energy</div>
              <div className="text-xs font-bold text-cyan-300 mt-0.5">
                {site.has_bess
                  ? `${Math.round((site.bess_capacity_kwh * details.bess.socPct) / 100)} kWh`
                  : "0 kWh"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TIME HORIZON TABS (Realtime | Daily | Monthly | Yearly) */}
      <div className="flex items-center justify-between border-b border-white/[0.08] text-sm font-mono">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
          {(["realtime", "daily", "monthly", "yearly"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setHorizon(tab)}
              className={`pb-1 text-xs font-bold uppercase transition-all relative ${
                horizon === tab ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>{tab}</span>
              {horizon === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF2A85] rounded-full shadow-[0_0_8px_#FF2A85]" />
              )}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Active Units: <strong className="text-white">{unit}</strong>
        </div>
      </div>

      {/* 3. ANIMATED CIRCULAR-NODE SCHEMATIC FLOW DIAGRAM (1:1 with flow.jpg) */}
      <div className="relative bg-[#060709] rounded-xl border border-white/[0.06] p-6 sm:p-10 flex flex-col items-center justify-center min-h-[520px]">
        {/* Engineering dot matrix background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* SVG Container: Central Spine & Orthogonal Dashed Branches */}
        <svg
          className="w-full max-w-lg h-[460px] relative z-10"
          viewBox="0 0 400 480"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Glow Filters */}
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFB300" floodOpacity="0.7" />
            </filter>
            <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFD600" floodOpacity="0.7" />
            </filter>
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00F0FF" floodOpacity="0.7" />
            </filter>
            <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FF6B00" floodOpacity="0.7" />
            </filter>
            <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#FF2A85" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* MAIN CENTRAL VERTICAL SPINE (Dashed Line) */}
          <line
            x1="280"
            y1="80"
            x2="280"
            y2="410"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />

          {/* BRANCH 1: Solar (Upper Left) -> Spine */}
          <path
            d="M 175 180 L 280 180"
            fill="none"
            stroke={isSolarActive ? "rgba(255,214,0,0.6)" : "rgba(255,255,255,0.2)"}
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          {/* BRANCH 2: BESS (Middle Right) <-> Spine */}
          {site.has_bess && (
            <path
              d="M 280 270 L 345 270"
              fill="none"
              stroke={isBessActive ? "rgba(0,240,255,0.6)" : "rgba(255,255,255,0.2)"}
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          )}

          {/* BRANCH 3: DG (Lower Left) -> Spine */}
          {site.has_dg && (
            <path
              d="M 175 330 L 280 330"
              fill="none"
              stroke={isDgActive ? "rgba(255,107,0,0.6)" : "rgba(255,255,255,0.2)"}
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          )}

          {/* ANIMATED TRAVELLING BEADS ALONG CONDUITS */}

          {/* Bead 1: Grid -> Load (along vertical spine) */}
          {isGridActive && (
            <circle r="4.5" fill="#FFB300" filter="url(#glow-gold)">
              <animateMotion
                path="M 280 80 L 280 410"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Bead 2: Solar -> Spine -> Load */}
          {isSolarActive && (
            <circle r="4.5" fill="#FFD600" filter="url(#glow-amber)">
              <animateMotion
                path="M 175 180 L 280 180 L 280 410"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Bead 3: BESS -> Load (discharging) or Spine -> BESS (charging) */}
          {isBessActive && (
            <circle r="4.5" fill="#00F0FF" filter="url(#glow-cyan)">
              {directTransfers.bessToLoadKw > 0 ? (
                <animateMotion
                  path="M 345 270 L 280 270 L 280 410"
                  dur="2.0s"
                  repeatCount="indefinite"
                />
              ) : (
                <animateMotion
                  path="M 175 180 L 280 180 L 280 270 L 345 270"
                  dur="2.0s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          )}

          {/* Bead 4: DG -> Spine -> Load */}
          {isDgActive && (
            <circle r="4.5" fill="#FF6B00" filter="url(#glow-orange)">
              <animateMotion
                path="M 175 330 L 280 330 L 280 410"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* CIRCULAR NODES */}

          {/* 1. TOP NODE: Utility Grid (or Off-Grid status) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedDrawerNode("grid")}
          >
            {/* Big circular bubble as shown in flow.jpg */}
            <circle
              cx="280"
              cy="55"
              r={isGridActive ? "38" : "24"}
              fill={isGridActive ? "#FFA000" : "#2A2E3D"}
              stroke={isGridActive ? "#FFE082" : "rgba(255,255,255,0.2)"}
              strokeWidth="4"
              filter={isGridActive ? "url(#glow-gold)" : undefined}
            />
            {/* Grid Pylon Icon */}
            <g transform="translate(270, 45)">
              <Zap className={`size-5 ${isGridActive ? "text-slate-950" : "text-slate-400"}`} />
            </g>
          </g>

          {/* Grid Label to the Left */}
          <g
            className="cursor-pointer font-mono"
            onClick={() => setSelectedDrawerNode("grid")}
          >
            <text x="210" y="45" fill="#F8FAFC" fontSize="13" fontWeight="bold" textAnchor="end">
              Grid
            </text>
            <text x="210" y="62" fill="#FFA000" fontSize="12" fontWeight="bold" textAnchor="end">
              {gridVal} {unit}
            </text>
            <text x="210" y="77" fill="#94A3B8" fontSize="11" textAnchor="end">
              {gridPct.toFixed(2)} %
            </text>
          </g>

          {/* 2. UPPER-LEFT NODE: Solar PV */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedDrawerNode("solar")}
          >
            <circle
              cx="175"
              cy="180"
              r={isSolarActive ? "22" : "14"}
              fill={isSolarActive ? "#FFD600" : "#2A2E3D"}
              stroke={isSolarActive ? "#FFF9C4" : "rgba(255,255,255,0.2)"}
              strokeWidth="3.5"
              filter={isSolarActive ? "url(#glow-amber)" : undefined}
            />
            {/* Solar Icon */}
            <g transform="translate(167, 172)">
              <Sun className={`size-4 ${isSolarActive ? "text-slate-950" : "text-slate-400"}`} />
            </g>
          </g>

          {/* Solar Label to the Left */}
          <g
            className="cursor-pointer font-mono"
            onClick={() => setSelectedDrawerNode("solar")}
          >
            <text x="135" y="170" fill="#F8FAFC" fontSize="13" fontWeight="bold" textAnchor="end">
              Solar
            </text>
            <text x="135" y="187" fill="#FFD600" fontSize="12" fontWeight="bold" textAnchor="end">
              {solarVal} {unit}
            </text>
            <text x="135" y="202" fill="#94A3B8" fontSize="11" textAnchor="end">
              {solarPct.toFixed(2)} %
            </text>
          </g>

          {/* 3. MIDDLE-RIGHT NODE: BESS Storage */}
          {site.has_bess && (
            <>
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedDrawerNode("bess")}
              >
                <circle
                  cx="345"
                  cy="270"
                  r={isBessActive ? "20" : "14"}
                  fill={isBessActive ? "#00F0FF" : "#2A2E3D"}
                  stroke={isBessActive ? "#E0F7FA" : "rgba(255,255,255,0.2)"}
                  strokeWidth="3.5"
                  filter={isBessActive ? "url(#glow-cyan)" : undefined}
                />
                <g transform="translate(337, 262)">
                  <BatteryCharging className={`size-4 ${isBessActive ? "text-slate-950" : "text-slate-400"}`} />
                </g>
              </g>

              {/* BESS Label to the Right */}
              <g
                className="cursor-pointer font-mono"
                onClick={() => setSelectedDrawerNode("bess")}
              >
                <text x="375" y="260" fill="#F8FAFC" fontSize="13" fontWeight="bold" textAnchor="start">
                  BESS
                </text>
                <text x="375" y="277" fill="#00F0FF" fontSize="12" fontWeight="bold" textAnchor="start">
                  {bessVal} {unit}
                </text>
                <text x="375" y="292" fill="#94A3B8" fontSize="11" textAnchor="start">
                  {bessPct.toFixed(2)} %
                </text>
              </g>
            </>
          )}

          {/* 4. LOWER-LEFT NODE: DG Genset */}
          {site.has_dg && (
            <>
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedDrawerNode("dg")}
              >
                <circle
                  cx="175"
                  cy="330"
                  r={isDgActive ? "22" : "14"}
                  fill={isDgActive ? "#FF6B00" : "#2A2E3D"}
                  stroke={isDgActive ? "#FFE0B2" : "rgba(255,255,255,0.2)"}
                  strokeWidth="3.5"
                  filter={isDgActive ? "url(#glow-orange)" : undefined}
                />
                <g transform="translate(167, 322)">
                  <Flame className={`size-4 ${isDgActive ? "text-slate-950" : "text-slate-400"}`} />
                </g>
              </g>

              {/* DG Label to the Left */}
              <g
                className="cursor-pointer font-mono"
                onClick={() => setSelectedDrawerNode("dg")}
              >
                <text x="135" y="320" fill="#F8FAFC" fontSize="13" fontWeight="bold" textAnchor="end">
                  DG
                </text>
                <text x="135" y="337" fill="#FF6B00" fontSize="12" fontWeight="bold" textAnchor="end">
                  {dgVal} {unit}
                </text>
                <text x="135" y="352" fill="#94A3B8" fontSize="11" textAnchor="end">
                  {dgPct.toFixed(2)} %
                </text>
              </g>
            </>
          )}

          {/* 5. BOTTOM TERMINAL HUB: Facility Load (Exact large circle as in flow.jpg) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedDrawerNode("load")}
          >
            {/* Outer Ring */}
            <circle
              cx="280"
              cy="435"
              r="44"
              fill="#1A1F2C"
              stroke="#FF2A85"
              strokeWidth="4"
              filter="url(#glow-pink)"
            />

            {/* Home/Building Icon inside */}
            <g transform="translate(269, 408)">
              <Home className="size-6 text-white" />
            </g>

            {/* Load Label inside circle (matches flow.jpg) */}
            <text x="280" y="445" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="middle">
              Load
            </text>
            <text x="280" y="462" fill="#FF2A85" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {loadVal} {unit}
            </text>
          </g>
        </svg>

        {/* Legend / Tap Hint */}
        <div className="mt-2 text-center text-xs font-mono text-slate-400">
          Tap any circular bubble to inspect deep Modbus diagnostic telemetry
        </div>
      </div>

      {/* Deep Component Telemetry Drawer */}
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
