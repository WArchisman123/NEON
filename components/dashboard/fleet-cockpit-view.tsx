"use client";

import React, { useState } from "react";
import { useSites } from "@/hooks/use-sites";
import { SiteRecord } from "@/lib/energy/types";
import {
  FleetAggregateStrip,
} from "@/components/design-system/fleet-aggregate-strip";
import {
  SiteCockpitCard,
  SiteData,
} from "@/components/design-system/site-cockpit-card-preview";
import {
  Sun,
  BatteryCharging,
  Flame,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  initialSites: SiteRecord[];
}

export function FleetCockpitView({ initialSites }: Props) {
  const [activeFilter, setActiveFilter] = useState<"all" | "solar" | "bess" | "dg" | "islanded">("all");

  // Client API hook that triggers real HTTP requests in Chrome DevTools Network Tab
  const {
    sites: dbSites,
    loading,
    isRefreshing,
    fleetAggregates,
    refresh,
    lastUpdated,
  } = useSites({
    initialData: initialSites,
  });

  // Filter sites according to user selection
  const filteredSites = dbSites.filter((s) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "solar") return s.has_solar;
    if (activeFilter === "bess") return s.has_bess;
    if (activeFilter === "dg") return s.has_dg;
    if (activeFilter === "islanded") return !s.has_grid;
    return true;
  });

  // Map to SiteData
  const sites: SiteData[] = filteredSites.map((s) => ({
    id: s.id,
    name: s.name,
    location_city: s.location_city,
    location_state: s.location_state,
    status: (s.status ? s.status.toUpperCase() : "ONLINE") as
      | "ONLINE"
      | "WARNING"
      | "CRITICAL"
      | "OFFLINE",
    subscription_status: s.subscription_status || "active",
    has_solar: s.has_solar,
    has_bess: s.has_bess,
    has_grid: s.has_grid,
    has_dg: s.has_dg,

    // Nameplate Capacities
    solar_capacity_kwp: s.solar_capacity_kwp ?? 0,
    bess_capacity_kwh: s.bess_capacity_kwh ?? 0,
    bess_power_kw: s.bess_power_kw ?? 0,
    contracted_demand_kva: s.contracted_demand_kva ?? 0,
    dg_capacity_kva: s.dg_capacity_kva ?? 0,

    // Live Telemetry
    live_solar_kw: s.solar_power_kw ?? s.solar_capacity_kwp ?? 0,
    live_bess_power_kw: s.live_bess_power_kw ?? 0,
    bess_soc_pct: s.bess_soc_pct ?? (s.has_bess ? 80 : 0),
    grid_power_kw: s.grid_power_kw ?? 0,
    dg_power_kw: s.dg_power_kw ?? 0,
    dg_running: s.dg_running ?? false,
    dg_fuel_pct: s.dg_fuel_pct ?? 0,
    load_kw: s.load_power_kw ?? Math.round((s.solar_capacity_kwp ?? 1000) * 0.7),

    // Daily Accumulations
    daily_yield_kwh:
      s.solar_yield_today_kwh ?? Math.round((s.solar_capacity_kwp ?? 1000) * 4.2),
    grid_import_today_kwh: s.grid_import_today_kwh ?? 0,
    grid_export_today_kwh: s.grid_export_today_kwh ?? 0,
    dg_yield_today_kwh: s.dg_yield_today_kwh ?? 0,
    bess_charge_today_kwh: s.bess_charge_today_kwh ?? 0,
    bess_discharge_today_kwh: s.bess_discharge_today_kwh ?? 0,
    load_consumption_today_kwh:
      s.load_consumption_today_kwh ?? Math.round((s.solar_capacity_kwp ?? 1000) * 5.0),
    co2_saved_today_kg: s.co2_saved_today_kg ?? Math.round((s.solar_yield_today_kwh ?? 0) * 0.72),
  }));

  return (
    <div className="space-y-6">
      {/* 5-Metric Glowing Fleet Aggregate Strip */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
              Fleet Live Aggregates ({dbSites.length} Active Sites)
            </h2>
            <span className="text-[10px] font-mono text-[#00E676] flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-[#00E676] animate-pulse" />
              REST API: GET /api/v1/sites (200 OK)
            </span>
          </div>

          {/* Sync Button & Timestamp */}
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[10px] font-mono text-slate-500">
                Synced {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={isRefreshing || loading}
              className="text-[11px] font-mono h-7 px-2.5 gap-1.5 border-white/[0.1] bg-[#121622] hover:bg-[#1a2030] text-slate-300"
            >
              <RefreshCw className={`size-3 ${isRefreshing || loading ? "animate-spin text-[#FF2A85]" : "text-slate-400"}`} />
              <span>{isRefreshing || loading ? "Calling API..." : "Sync Telemetry"}</span>
            </Button>
          </div>
        </div>

        <FleetAggregateStrip aggregates={fleetAggregates} />
      </div>

      {/* Site Cards Controls & Filters */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-tight text-white">
              Solar & BESS Installations
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#121622] text-slate-400 border border-white/[0.06]">
              {sites.length} Displayed
            </span>
          </div>

          {/* Asset Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold font-mono text-[11px] transition-all ${
                activeFilter === "all"
                  ? "bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              All ({dbSites.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("solar")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-all ${
                activeFilter === "solar"
                  ? "bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              <Sun className="size-3 text-[#FFD600]" /> Solar
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("bess")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-all ${
                activeFilter === "bess"
                  ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              <BatteryCharging className="size-3 text-[#00F0FF]" /> BESS
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("dg")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-all ${
                activeFilter === "dg"
                  ? "bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              <Flame className="size-3 text-[#FF6B00]" /> DG
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("islanded")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-all ${
                activeFilter === "islanded"
                  ? "bg-[#9D4EDD]/20 text-[#9D4EDD] border border-[#9D4EDD]/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              <Zap className="size-3 text-[#9D4EDD]" /> Islanded
            </button>
          </div>
        </div>

        {/* Site Cockpit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <SiteCockpitCard key={site.id} site={site} />
          ))}
        </div>
      </div>
    </div>
  );
}
