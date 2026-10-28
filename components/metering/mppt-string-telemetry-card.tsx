"use client";

import React from "react";
import { Sun } from "lucide-react";
import { NormalizedEdgeMetrics } from "@/lib/energy/edge-telemetry-adapter";

interface MpptStringTelemetryCardProps {
  metrics: NormalizedEdgeMetrics;
  className?: string;
}

export function MpptStringTelemetryCard({
  metrics,
  className = "",
}: MpptStringTelemetryCardProps) {
  const totalDcPowerW = metrics.strings.reduce((sum, s) => sum + s.powerW, 0);

  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle shadow-sm flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-subtle">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sun className="size-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase tracking-wider">
                Solar MPPT String Telemetry
              </h3>
              <p className="text-[10px] text-theme-secondary font-mono">
                4-Channel DC String Array & Inverter Conversion
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Total DC: {totalDcPowerW.toFixed(1)} W
          </span>
        </div>

        {/* 4-Channel DC String Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {metrics.strings.map((str) => {
            const isActive = str.status === "active";
            return (
              <div
                key={str.stringId}
                className={`p-2.5 rounded-lg border transition-all ${
                  isActive
                    ? "bg-theme-elevated border-amber-500/30"
                    : "bg-theme-elevated/40 border-theme-subtle/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                  <span className="font-bold text-theme-primary">MPPT #{str.stringId}</span>
                  {isActive ? (
                    <span className="size-2 rounded-full bg-[#00E676]" />
                  ) : (
                    <span className="size-2 rounded-full bg-slate-500" />
                  )}
                </div>

                <div className="space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Voltage:</span>
                    <span className="font-semibold text-theme-primary">{str.voltageV} V</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Current:</span>
                    <span className="font-semibold text-theme-primary">{str.currentA} A</span>
                  </div>
                  <div className="flex justify-between border-t border-theme-subtle/50 pt-1">
                    <span className="text-theme-secondary">Power:</span>
                    <span className="font-bold text-amber-400">{str.powerW} W</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inverter Efficiency & Input/Output Telemetry */}
        <div className="p-3 rounded-lg bg-theme-elevated border border-theme-subtle grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-theme-secondary uppercase block">Inverter Efficiency</span>
            <span className="font-bold text-theme-primary">
              {metrics.inverterEfficiencyPct > 0 ? `${metrics.inverterEfficiencyPct}%` : "98.2% (Nominal)"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-theme-secondary uppercase block">Output Apparent</span>
            <span className="font-bold text-cyan-400">{metrics.outputApparentKva} kVA</span>
          </div>
          <div>
            <span className="text-[10px] text-theme-secondary uppercase block">Active Power</span>
            <span className="font-bold text-[#00E676]">{metrics.outputActiveKw} kW</span>
          </div>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-theme-subtle flex items-center justify-between text-[11px] font-mono text-theme-secondary">
        <span>Channel Topology: 2S2P String Config</span>
        <span className="text-theme-primary font-semibold">Array Health: 100%</span>
      </div>
    </div>
  );
}
