import React from "react";
import { Sun, BatteryCharging, Zap, Flame } from "lucide-react";

export interface FleetAggregates {
  totalSolarMw?: number;
  totalBessMwh?: number;
  avgBessSoc?: number;
  activeLoadMw?: number;
  netGridKw?: number;
  activeGensets?: string;
}

export function FleetAggregateStrip({ aggregates }: { aggregates?: FleetAggregates }) {
  const solarMw = aggregates?.totalSolarMw !== undefined ? aggregates.totalSolarMw.toFixed(2) : "3.42";
  const bessMwh = aggregates?.totalBessMwh !== undefined ? aggregates.totalBessMwh.toFixed(1) : "12.8";
  const bessSoc = aggregates?.avgBessSoc !== undefined ? aggregates.avgBessSoc.toFixed(1) : "78.4";
  const loadMw = aggregates?.activeLoadMw !== undefined ? aggregates.activeLoadMw.toFixed(2) : "2.85";
  const gridKw = aggregates?.netGridKw !== undefined ? aggregates.netGridKw.toFixed(0) : "420";

  const kpis = [
    {
      title: "Total Live Solar",
      value: solarMw,
      unit: "MW",
      icon: Sun,
      iconColor: "text-[#FFD600]",
      glowColor: "group-hover:border-[#FFD600]/40",
      topStrip: "via-[#FFD600]",
      delta: "▲ +12.4%",
      deltaLabel: "vs yesterday",
      deltaColor: "text-[#00E676]",
    },
    {
      title: "Fleet BESS Capacity",
      value: bessMwh,
      unit: "MWh",
      icon: BatteryCharging,
      iconColor: "text-[#00F0FF]",
      glowColor: "group-hover:border-[#00F0FF]/40",
      topStrip: "via-[#00F0FF]",
      delta: `${bessSoc}%`,
      deltaLabel: "fleet avg SoC",
      deltaColor: "text-[#00F0FF]",
    },
    {
      title: "Active Facility Load",
      value: loadMw,
      unit: "MW",
      icon: Zap,
      iconColor: "text-[#FF2A85]",
      glowColor: "group-hover:border-[#FF2A85]/40",
      topStrip: "via-[#FF2A85]",
      delta: "64.2%",
      deltaLabel: "of 4.5 MW MD",
      deltaColor: "text-[#FF2A85]",
    },
    {
      title: "Net Grid Feed-In",
      value: gridKw,
      unit: "kW",
      icon: Zap,
      iconColor: "text-[#9D4EDD]",
      glowColor: "group-hover:border-[#9D4EDD]/40",
      topStrip: "via-[#9D4EDD]",
      delta: "+$84.20/hr",
      deltaLabel: "arbitrage velocity",
      deltaColor: "text-[#00E676]",
    },
    {
      title: "Genset & Alarms",
      value: aggregates?.activeGensets || "0 / 4",
      unit: "Gensets",
      icon: Flame,
      iconColor: "text-[#FF6B00]",
      glowColor: "group-hover:border-[#FF6B00]/40",
      topStrip: "via-[#FF6B00]",
      delta: "1 Warning",
      deltaLabel: "0 Trips / Tripped",
      deltaColor: "text-[#FFAB00]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.title}
            className={`rounded-xl bg-[#0B0D13] border border-white/[0.08] ${kpi.glowColor} transition-all p-4 relative overflow-hidden group shadow-md shadow-black/40`}
          >
            {/* Top Hover Accent Glow Strip */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${kpi.topStrip} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                {kpi.title}
              </span>
              <Icon className={`size-4 shrink-0 ${kpi.iconColor}`} />
            </div>

            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
              {kpi.value}{" "}
              <span className="text-xs sm:text-sm font-normal text-slate-400">
                {kpi.unit}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono">
              <span className={`font-bold ${kpi.deltaColor}`}>{kpi.delta}</span>
              <span className="text-slate-500 font-sans text-[10px] truncate">
                {kpi.deltaLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
