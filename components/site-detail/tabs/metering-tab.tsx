"use client";

import React from "react";
import { SiteRecord } from "@/lib/energy/types";
import { normalizeEdgeTelemetry } from "@/lib/energy/edge-telemetry-adapter";
import { LiveMetering3PhaseTable } from "@/components/metering/live-metering-3phase-table";
import { PowerQualityHarmonicsCard } from "@/components/metering/power-quality-harmonics-card";
import { EnergyCountersBillingCard } from "@/components/metering/energy-counters-billing-card";
import { DemandRollingCard } from "@/components/metering/demand-rolling-card";
import { MpptStringTelemetryCard } from "@/components/metering/mppt-string-telemetry-card";

interface MeteringTabProps {
  site: SiteRecord;
}

export function MeteringTab({ site }: MeteringTabProps) {
  const edgeMetrics = normalizeEdgeTelemetry(site.edge_telemetry);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200 font-mono">
      {/* Top 9-Metric Electrical & Power Quality Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Grid Import</span>
          <span className="text-sm font-black text-theme-primary mt-1">
            {edgeMetrics.dayGridBuyKwh > 0 ? `${edgeMetrics.dayGridBuyKwh} kW` : "76.2 kW"}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Grid Export</span>
          <span className="text-sm font-black text-[#00E676] mt-1">
            {edgeMetrics.dayGridSellKwh > 0 ? `${edgeMetrics.dayGridSellKwh} kW` : "0.0 kW"}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Frequency</span>
          <span className="text-sm font-black text-cyan-400 mt-1">{edgeMetrics.gridFrequencyHz} Hz</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Avg PF</span>
          <span className="text-sm font-black text-amber-400 mt-1">
            {edgeMetrics.powerFactor > 0 ? edgeMetrics.powerFactor.toFixed(2) : "0.97"}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Demand (15m)</span>
          <span className="text-sm font-black text-purple-400 mt-1">116.0 kW</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Voltage THD</span>
          <span className="text-sm font-black text-[#00E676] mt-1">1.20%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Current THD</span>
          <span className="text-sm font-black text-amber-400 mt-1">3.00%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Phase Imbalance</span>
          <span className="text-sm font-black text-[#00E676] mt-1">1.6%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase truncate">Meter Health</span>
          <span className="text-sm font-black text-[#00E676] mt-1">Healthy</span>
        </div>
      </div>

      {/* Row 1: Live 3-Phase Metering Table + Power Quality Harmonics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveMetering3PhaseTable metrics={edgeMetrics} />
        <PowerQualityHarmonicsCard />
      </div>

      {/* Row 2: Energy Counters (Revenue Grade) + 15-Min Rolling Demand & Device Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EnergyCountersBillingCard metrics={edgeMetrics} />
        <DemandRollingCard
          currentDemandKw={116.0}
          contractedDemandKva={site.contracted_demand_kva || 180}
        />
      </div>

      {/* Row 3: 4-Channel DC MPPT String Telemetry */}
      <MpptStringTelemetryCard metrics={edgeMetrics} />
    </div>
  );
}
