"use client";

import React from "react";
import { TrendingUp, Clock } from "lucide-react";

interface DemandRollingCardProps {
  currentDemandKw?: number;
  contractedDemandKva?: number;
  className?: string;
}

export function DemandRollingCard({
  currentDemandKw = 116.0,
  contractedDemandKva = 180.0,
  className = "",
}: DemandRollingCardProps) {
  const utilizationPct = Math.min(100, Math.round((currentDemandKw / contractedDemandKva) * 100));

  // 24-hr simulated rolling demand steps
  const demandSteps = [
    26.1, 35.4, 42.0, 58.2, 85.0, 112.4, 116.0, 108.5, 94.2, 75.0, 68.0, 52.0, 44.0, 38.0, 32.0,
  ];

  const meterDevices = [
    {
      id: "mtr-1",
      name: "MTR-01 Grid Incomer",
      location: "PCC Panel",
      type: "Multifunction Meter",
      protocol: "Modbus TCP",
      status: "online",
    },
    {
      id: "mtr-2",
      name: "MTR-02 PCS AC Meter",
      location: "PCS Room",
      type: "Revenue Meter (0.2S)",
      protocol: "RS-485 RTU",
      status: "online",
    },
    {
      id: "mtr-3",
      name: "MTR-03 BESS DC Meter",
      location: "Battery Container",
      type: "DC Shunt Transducer",
      protocol: "CAN / Modbus",
      status: "online",
    },
  ];

  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle shadow-sm flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-subtle">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase tracking-wider">
                15-Min Rolling Demand & Meter Fleet
              </h3>
              <p className="text-[10px] text-theme-secondary font-mono">
                Utility sliding window demand & physical meter device supervision
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            <Clock className="size-3" />
            Rolling Window
          </span>
        </div>

        {/* Demand Meter Gauge */}
        <div className="p-3 rounded-lg bg-theme-elevated border border-theme-subtle mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-theme-secondary">Current Maximum Demand:</span>
            <span className="font-black text-theme-primary text-sm">
              {currentDemandKw} kW{" "}
              <span className="text-theme-secondary font-normal text-xs">
                / {contractedDemandKva} kVA
              </span>
            </span>
          </div>

          <div className="h-2 w-full bg-theme-input rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                utilizationPct > 85
                  ? "bg-[#FF1744]"
                  : utilizationPct > 70
                  ? "bg-[#FFAB00]"
                  : "bg-purple-500"
              }`}
              style={{ width: `${utilizationPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-theme-secondary">
            <span>Demand Utilization: {utilizationPct}%</span>
            <span>Contracted Headroom: {(contractedDemandKva - currentDemandKw).toFixed(1)} kW</span>
          </div>
        </div>

        {/* Miniature 24-hr Demand Step Chart */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-theme-secondary mb-1">
            <span>24-HR DEMAND PROFILE (KW)</span>
            <span className="text-xs text-purple-400 font-bold">Peak: 116.0 kW</span>
          </div>

          <div className="h-20 w-full flex items-end justify-between gap-1 p-2 rounded-lg bg-theme-elevated/40 border border-theme-subtle">
            {demandSteps.map((val, idx) => {
              const hPct = Math.min(100, (val / 120) * 100);
              return (
                <div
                  key={idx}
                  className="flex-1 bg-purple-500/70 hover:bg-[#FF2A85] rounded-t-sm transition-all"
                  style={{ height: `${hPct}%` }}
                  title={`Step ${idx + 1}: ${val} kW`}
                />
              );
            })}
          </div>
        </div>

        {/* Physical Meter Devices Table */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-theme-secondary uppercase tracking-wider block mb-1">
            PHYSICAL METER DEVICES INVENTORY
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-theme-subtle text-[10px] text-theme-secondary">
                  <th className="py-1">DEVICE</th>
                  <th className="py-1">LOCATION</th>
                  <th className="py-1">TYPE</th>
                  <th className="py-1 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle/30">
                {meterDevices.map((m) => (
                  <tr key={m.id}>
                    <td className="py-1.5 font-bold text-theme-primary">{m.name}</td>
                    <td className="py-1.5 text-theme-secondary">{m.location}</td>
                    <td className="py-1.5 text-theme-secondary">{m.type}</td>
                    <td className="py-1.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#00E676]">
                        <span className="size-1.5 rounded-full bg-[#00E676]" />
                        Online
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-theme-subtle flex items-center justify-between text-[11px] font-mono text-theme-secondary">
        <span>Demand Penalty Avoidance: Active</span>
        <span className="text-emerald-400 font-semibold">0 Breaches Today</span>
      </div>
    </div>
  );
}
