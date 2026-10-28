"use client";

import React from "react";
import { Coins, Calendar, Zap, Layers } from "lucide-react";
import { NormalizedEdgeMetrics } from "@/lib/energy/edge-telemetry-adapter";

interface EnergyCountersBillingCardProps {
  metrics: NormalizedEdgeMetrics;
  className?: string;
}

export function EnergyCountersBillingCard({
  metrics,
  className = "",
}: EnergyCountersBillingCardProps) {
  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle shadow-sm flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-subtle">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-emerald-500/10 text-[#00E676] flex items-center justify-center">
              <Coins className="size-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase tracking-wider">
                Energy Counters (Revenue Grade)
              </h3>
              <p className="text-[10px] text-theme-secondary font-mono">
                Diurnal vs cumulative lifetime billing accumulators
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-theme-secondary bg-theme-elevated px-2 py-0.5 rounded border border-theme-subtle">
            <Calendar className="size-3 text-[#FF2A85]" />
            Monthly Billing Cycle
          </span>
        </div>

        {/* Primary Meter Counters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          {/* Total Active Energy */}
          <div className="p-3 rounded-lg bg-theme-elevated border border-theme-subtle flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-theme-secondary uppercase tracking-wider block">
                Total Active Energy
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-theme-primary truncate block">
                {metrics.totalActiveMwh.toLocaleString()} <span className="text-xs font-normal text-theme-secondary">MWh</span>
              </span>
            </div>
            <div className="size-8 rounded-lg bg-[#FF2A85]/10 text-[#FF2A85] flex items-center justify-center shrink-0">
              <Zap className="size-4" />
            </div>
          </div>

          {/* Meter Active Power (Master Grid Incomer) */}
          <div className="p-3 rounded-lg bg-theme-elevated border border-theme-subtle flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-theme-secondary uppercase tracking-wider block">
                Master Meter Active Accumulator
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-cyan-400 truncate block">
                {metrics.meterActiveMwh.toLocaleString()} <span className="text-xs font-normal text-theme-secondary">MWh</span>
              </span>
            </div>
            <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Layers className="size-4" />
            </div>
          </div>
        </div>

        {/* Detailed Subsystem Daily vs Cumulative Accumulators Table */}
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle/50">
            <span className="text-theme-secondary font-medium">Solar PV Generation:</span>
            <div className="text-right">
              <span className="font-bold text-amber-400">{metrics.dayPvKwh} kWh</span>
              <span className="text-theme-secondary text-[11px] ml-2">({metrics.historyPvMwh} MWh total)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle/50">
            <span className="text-theme-secondary font-medium">Grid Export (Sell):</span>
            <div className="text-right">
              <span className="font-bold text-[#00E676]">{metrics.dayGridSellKwh} kWh</span>
              <span className="text-theme-secondary text-[11px] ml-2">({metrics.historyGridSellKwh} kWh total)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle/50">
            <span className="text-theme-secondary font-medium">Grid Import (Buy):</span>
            <div className="text-right">
              <span className="font-bold text-sky-400">{metrics.dayGridBuyKwh} kWh</span>
              <span className="text-theme-secondary text-[11px] ml-2">({metrics.historyGridBuyKwh} kWh total)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle/50">
            <span className="text-theme-secondary font-medium">Facility Load Consumption:</span>
            <div className="text-right">
              <span className="font-bold text-purple-400">{metrics.dayLoadKwh} kWh</span>
              <span className="text-theme-secondary text-[11px] ml-2">({metrics.historyLoadMwh} MWh total)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle/50">
            <span className="text-theme-secondary font-medium">Reactive Energy (Day):</span>
            <div className="text-right">
              <span className="font-bold text-theme-primary">{metrics.dayReactiveKvarh} kVARh</span>
              <span className="text-theme-secondary text-[11px] ml-2">({metrics.totalReactiveKvarh} kVARh total)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-theme-subtle flex items-center justify-between text-[11px] font-mono text-theme-secondary">
        <span>Work time: <strong className="text-theme-primary">{metrics.totalWorkHours} hrs</strong></span>
        <span className="text-emerald-400 font-semibold">Net Metering Active</span>
      </div>
    </div>
  );
}
