"use client";

import React, { useState } from "react";
import {
  Sun,
  BatteryCharging,
  Zap,
  Flame,
  Factory,
  ArrowUpRight,
} from "lucide-react";

export function EnergyFlowPreview() {
  const [selectedNode, setSelectedNode] = useState<string>("bess");

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 relative overflow-hidden shadow-2xl">
      {/* Header with System Operational Mode Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              5-Node Real-Time Energy Flow Visualizer
            </h3>
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
              <span className="size-1.5 rounded-full bg-[#00E676] animate-pulse" />
              STREAMING (1.0s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Directional electrical transfer physics with speed proportional to kilowatt volume
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121622] border border-[#FF2A85]/30 text-xs font-mono shadow-[0_0_12px_rgba(255,42,133,0.15)]">
          <span className="size-2 rounded-full bg-[#FF2A85] animate-pulse" />
          <span className="text-slate-300">Mode:</span>
          <strong className="text-white">Grid-Tied Self-Consumption</strong>
        </div>
      </div>

      {/* Interactive 5-Node Grid Canvas */}
      <div className="mt-6 relative">
        {/* Animated Background Conduits (SVG) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="flow-solar-bess" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD600" />
                <stop offset="100%" stopColor="#00F0FF" />
              </linearGradient>
              <linearGradient id="flow-solar-load" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD600" />
                <stop offset="100%" stopColor="#FF2A85" />
              </linearGradient>
            </defs>

            {/* Static Busbar Conduit lines */}
            <path
              d="M 50% 100 L 50% 220"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M 25% 220 L 75% 220"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="4"
              fill="none"
            />

            {/* Pulsing Animated Particle Conduits */}
            <line
              x1="50%"
              y1="80"
              x2="50%"
              y2="180"
              stroke="url(#flow-solar-bess)"
              strokeWidth="3"
              strokeDasharray="6 8"
              className="animate-flow-forward"
              style={{ filter: "drop-shadow(0 0 6px rgba(255, 214, 0, 0.6))" }}
            />
          </svg>
        </div>

        {/* Nodes Structure */}
        <div className="space-y-4 relative z-10">
          {/* Top Tier: Solar PV Generation Node */}
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setSelectedNode("solar")}
              className={`w-full text-left p-4 rounded-xl bg-[#0B0D13] border transition-all cursor-pointer ${
                selectedNode === "solar"
                  ? "border-[#FFD600] shadow-[0_0_20px_rgba(255,214,0,0.35)]"
                  : "border-white/[0.08] hover:border-[#FFD600]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/20">
                    <Sun className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Solar PV Array
                    </span>
                    <div className="text-xl font-black font-mono text-white">
                      940.5 <span className="text-xs font-normal text-slate-400">kW</span>
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-[#FFD600]">98.2% Eff</div>
                  <div className="text-[10px] text-slate-500 uppercase">820 W/m² Irrad</div>
                </div>
              </div>
            </button>
          </div>

          {/* Middle Tier: BESS (Left) <---> Facility Load (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* BESS Node */}
            <button
              type="button"
              onClick={() => setSelectedNode("bess")}
              className={`text-left p-4 rounded-xl bg-[#0B0D13] border transition-all cursor-pointer ${
                selectedNode === "bess"
                  ? "border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.35)]"
                  : "border-white/[0.08] hover:border-[#00F0FF]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20">
                    <BatteryCharging className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      BESS Storage
                    </span>
                    <div className="text-xl font-black font-mono text-white">
                      84.2% <span className="text-xs font-normal text-slate-400">SoC</span>
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-[#00F0FF]">-320 kW</div>
                  <div className="text-[10px] text-slate-500 uppercase">Charging</div>
                </div>
              </div>

              {/* SoC Progress Bar */}
              <div className="mt-3 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0090FF] rounded-full shadow-[0_0_8px_#00F0FF]"
                  style={{ width: "84.2%" }}
                />
              </div>
            </button>

            {/* Facility Load Node */}
            <button
              type="button"
              onClick={() => setSelectedNode("load")}
              className={`text-left p-4 rounded-xl bg-[#0B0D13] border transition-all cursor-pointer ${
                selectedNode === "load"
                  ? "border-[#FF2A85] shadow-[0_0_20px_rgba(255,42,133,0.35)]"
                  : "border-white/[0.08] hover:border-[#FF2A85]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#FF2A85]/10 text-[#FF2A85] border border-[#FF2A85]/20">
                    <Factory className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Facility Load
                    </span>
                    <div className="text-xl font-black font-mono text-white">
                      620.5 <span className="text-xs font-normal text-slate-400">kW</span>
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-[#FF2A85]">Active</div>
                  <div className="text-[10px] text-slate-500 uppercase">0.98 PF</div>
                </div>
              </div>

              {/* Peak Demand Progress Bar */}
              <div className="mt-3 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full bg-gradient-to-r from-[#FF2A85] to-[#B00055] rounded-full shadow-[0_0_8px_#FF2A85]"
                  style={{ width: "52%" }}
                />
              </div>
            </button>
          </div>

          {/* Bottom Tier: DG Genset (Left) <---> Utility Grid (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* DG Node */}
            <button
              type="button"
              onClick={() => setSelectedNode("dg")}
              className={`text-left p-4 rounded-xl bg-[#0B0D13] border transition-all cursor-pointer ${
                selectedNode === "dg"
                  ? "border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.35)]"
                  : "border-white/[0.08] hover:border-[#FF6B00]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                    <Flame className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Diesel Generator
                    </span>
                    <div className="text-xl font-black font-mono text-white">
                      0.0 <span className="text-xs font-normal text-slate-400">kW</span>
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-[#00E676]">STANDBY</div>
                  <div className="text-[10px] text-slate-500 uppercase">94% Fuel</div>
                </div>
              </div>
            </button>

            {/* Utility Grid Node */}
            <button
              type="button"
              onClick={() => setSelectedNode("grid")}
              className={`text-left p-4 rounded-xl bg-[#0B0D13] border transition-all cursor-pointer ${
                selectedNode === "grid"
                  ? "border-[#9D4EDD] shadow-[0_0_20px_rgba(157,78,221,0.35)]"
                  : "border-white/[0.08] hover:border-[#9D4EDD]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#9D4EDD]/10 text-[#9D4EDD] border border-[#9D4EDD]/20">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Utility Grid
                    </span>
                    <div className="text-xl font-black font-mono text-white">
                      -180.0 <span className="text-xs font-normal text-slate-400">kW</span>
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-[#00E676] flex items-center justify-end gap-1">
                    <ArrowUpRight className="size-3.5" /> FEED-IN
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">50.02 Hz</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
