"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Sun,
  BatteryCharging,
  Zap,
  Flame,
  Factory,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface SiteAssetNavProps {
  site: SiteRecord;
  activeAsset: "solar" | "bess" | "grid" | "dg" | "load";
}

export function SiteAssetNav({ site, activeAsset }: SiteAssetNavProps) {
  const assets = [
    {
      id: "solar" as const,
      name: "Solar PV Array",
      shortName: "Solar PV",
      href: `/sites/${site.id}/solar`,
      icon: Sun,
      color: "text-[#FFD600]",
      border: "border-[#FFD600]/40",
      activeBg: "bg-[#FFD600]/15 text-[#FFD600] border-[#FFD600]",
      show: site.has_solar,
      metric: `${(site.solar_power_kw || site.solar_capacity_kwp).toLocaleString()} kW`,
    },
    {
      id: "bess" as const,
      name: "BESS Battery Storage",
      shortName: "BESS Storage",
      href: `/sites/${site.id}/bess`,
      icon: BatteryCharging,
      color: "text-[#00F0FF]",
      border: "border-[#00F0FF]/40",
      activeBg: "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]",
      show: site.has_bess,
      metric: `${(site.bess_soc_pct || 80).toFixed(0)}% SoC`,
    },
    {
      id: "grid" as const,
      name: "Utility Grid Intertie",
      shortName: "Utility Grid",
      href: `/sites/${site.id}/grid`,
      icon: Zap,
      color: "text-[#9D4EDD]",
      border: "border-[#9D4EDD]/40",
      activeBg: "bg-[#9D4EDD]/15 text-[#9D4EDD] border-[#9D4EDD]",
      show: site.has_grid,
      metric: `${(site.grid_power_kw || -120).toLocaleString()} kW`,
    },
    {
      id: "dg" as const,
      name: "Diesel Genset Peaker",
      shortName: "DG Genset",
      href: `/sites/${site.id}/dg`,
      icon: Flame,
      color: "text-[#FF6B00]",
      border: "border-[#FF6B00]/40",
      activeBg: "bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]",
      show: site.has_dg,
      metric: `${(site.dg_fuel_pct || 90).toFixed(0)}% Fuel`,
    },
    {
      id: "load" as const,
      name: "Facility Load & Demand",
      shortName: "Facility Load",
      href: `/sites/${site.id}/load`,
      icon: Factory,
      color: "text-[#FF2A85]",
      border: "border-[#FF2A85]/40",
      activeBg: "bg-[#FF2A85]/15 text-[#FF2A85] border-[#FF2A85]",
      show: true,
      metric: `${(site.load_power_kw || 620).toLocaleString()} kW`,
    },
  ];

  const currentAsset = assets.find((a) => a.id === activeAsset);

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Link
            href="/"
            className="hover:text-[#FF2A85] transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="size-3.5" />
            <span>Fleet Cockpit</span>
          </Link>
          <span className="text-slate-600">/</span>
          <Link
            href={`/sites/${site.id}`}
            className="hover:text-white transition-colors"
          >
            {site.name}
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-bold">{currentAsset?.shortName}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-full bg-[#121622] border border-white/[0.08]">
            <ShieldCheck className="size-3.5 text-[#00E676]" />
            <span>SCADA Modbus Real-Time</span>
          </div>

          <Link
            href={`/sites/${site.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-300 hover:text-white border border-white/[0.1] transition-all min-h-[36px]"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Site Flow</span>
          </Link>
        </div>
      </div>

      {/* Asset Quick-Switcher Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-mono uppercase text-slate-500 font-bold shrink-0 mr-1 hidden sm:inline">
          Switch Asset:
        </span>
        {assets.map((asset) => {
          if (!asset.show) return null;
          const isActive = asset.id === activeAsset;
          const Icon = asset.icon;

          return (
            <Link
              key={asset.id}
              href={asset.href}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all shrink-0 min-h-[44px] sm:min-h-[38px] ${
                isActive
                  ? `${asset.activeBg} font-bold shadow-lg border`
                  : "bg-[#0B0D13] hover:bg-[#121622] text-slate-400 hover:text-slate-200 border border-white/[0.06]"
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? "" : asset.color}`} />
              <span>{asset.shortName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isActive
                    ? "bg-black/40 text-white"
                    : "bg-[#121622] text-slate-400"
                }`}
              >
                {asset.metric}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
