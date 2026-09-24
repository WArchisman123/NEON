"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
  Search,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RenewalSubscriptionModal,
  RenewalModalSite,
} from "@/components/subscription/renewal-subscription-modal";
import { AddSiteModal } from "@/components/dashboard/add-site-modal";

interface Props {
  initialSites: SiteRecord[];
  userName?: string;
  orgName?: string;
  role?: string;
  clerkOrgId?: string;
}

export function FleetCockpitView({
  initialSites,
  userName,
  orgName,
  role,
  clerkOrgId,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<"all" | "solar" | "bess" | "dg" | "islanded">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSiteForRenewal, setSelectedSiteForRenewal] = useState<RenewalModalSite | null>(null);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Support keyboard shortcut (⌘K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter sites according to user selection and real-time search query
  const filteredSites = dbSites.filter((s) => {
    // 1. Asset type filter
    if (activeFilter === "solar" && !s.has_solar) return false;
    if (activeFilter === "bess" && !s.has_bess) return false;
    if (activeFilter === "dg" && !s.has_dg) return false;
    if (activeFilter === "islanded" && s.has_grid) return false;

    // 2. Real-time Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = s.name.toLowerCase().includes(q);
      const cityMatch = (s.location_city || "").toLowerCase().includes(q);
      const stateMatch = (s.location_state || "").toLowerCase().includes(q);
      const statusMatch = (s.status || "").toLowerCase().includes(q);
      const subStatusMatch = (s.subscription_status || "").toLowerCase().includes(q);
      const plantTypeMatch = (s.plant_type || "").toLowerCase().includes(q);

      const capacityMatch =
        (s.solar_capacity_kwp && s.solar_capacity_kwp.toString().includes(q)) ||
        (s.bess_capacity_kwh && s.bess_capacity_kwh.toString().includes(q)) ||
        (s.contracted_demand_kva && s.contracted_demand_kva.toString().includes(q));

      const keywordMatch =
        (q === "solar" && s.has_solar) ||
        ((q === "bess" || q === "battery") && s.has_bess) ||
        ((q === "dg" || q === "generator") && s.has_dg) ||
        (q === "grid" && s.has_grid) ||
        (q === "islanded" && !s.has_grid) ||
        (q === "expired" && s.subscription_status === "expired") ||
        (q === "active" && s.subscription_status !== "expired");

      if (
        !nameMatch &&
        !cityMatch &&
        !stateMatch &&
        !statusMatch &&
        !subStatusMatch &&
        !plantTypeMatch &&
        !capacityMatch &&
        !keywordMatch
      ) {
        return false;
      }
    }

    return true;
  });

  // Handle open renewal modal
  const handleOpenRenew = (site: SiteData) => {
    setSelectedSiteForRenewal({
      id: site.id,
      name: site.name,
      location_city: site.location_city,
      location_state: site.location_state,
      solar_capacity_kwp: site.solar_capacity_kwp,
      bess_capacity_kwh: site.bess_capacity_kwh,
      bess_power_kw: site.bess_power_kw,
      has_solar: site.has_solar,
      has_bess: site.has_bess,
      has_dg: site.has_dg,
      has_grid: site.has_grid,
      subscription_status: site.subscription_status,
    });
    setIsRenewalModalOpen(true);
  };

  const handleRenewSuccess = () => {
    refresh();
  };

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
      {/* Welcome & Session Status Banner */}
      {userName && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />

          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Authenticated Operator Session
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40 text-[10px] font-mono font-bold uppercase">
                {(role || "org:member").replace("org:", "").toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Welcome back,{" "}
              <span className="text-[#FF2A85]">{userName}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-2">
              <span className="text-white font-semibold">{orgName || "iRasus Technologies"}</span>
              <span className="text-slate-600">•</span>
              <span>Fleet Dispatch &amp; Substation Telemetry Dashboard</span>
              {clerkOrgId && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 font-mono text-[10px]">ID: {clerkOrgId}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/design-system">
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs border-white/[0.1] bg-[#121622] hover:bg-[#1a2030] text-slate-300 min-h-[38px]"
              >
                Design System
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddSiteModalOpen(true)}
              className="font-mono text-xs gap-1.5 shadow-[0_0_15px_rgba(255,42,133,0.35)] min-h-[38px]"
            >
              <Plus className="size-3.5" />
              <span>Add Solar / BESS Site</span>
            </Button>
          </div>
        </div>
      )}

      {/* 5-Metric Glowing Fleet Aggregate Strip */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
              Fleet Live Aggregates ({dbSites.length} Active Sites)
            </h2>
          </div>

          {/* Sync Button & Timestamp */}
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[10px] font-mono text-slate-500" suppressHydrationWarning>
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

      {/* Real-time Search Input & Site Controls */}
      <div className="space-y-4 pt-4">
        {/* Search Bar + Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Real-time Search Box */}
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="size-4" />
            </div>
            <input
              id="fleet-search-input"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sites by name, city, state, or capacity (e.g. Bakersfield, Fresno, 940 kWp)..."
              className="w-full pl-9 pr-20 py-2 rounded-xl bg-[#121622] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2A85]/50 focus:ring-1 focus:ring-[#FF2A85]/40 transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-2 pr-2 flex items-center text-slate-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <kbd className="px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-slate-400 border border-white/[0.1]">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Asset Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg font-semibold font-mono text-[11px] transition-all ${
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
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-all ${
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
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-all ${
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
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-all ${
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
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-all ${
                activeFilter === "islanded"
                  ? "bg-[#9D4EDD]/20 text-[#9D4EDD] border border-[#9D4EDD]/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              <Zap className="size-3 text-[#9D4EDD]" /> Islanded
            </button>

            {/* Add Site CTA in Controls Bar */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAddSiteModalOpen(true)}
              className="px-2.5 py-1.5 h-auto rounded-lg font-mono text-[11px] flex items-center gap-1 shadow-[0_0_12px_rgba(255,42,133,0.3)] shrink-0 ml-auto sm:ml-2"
            >
              <Plus className="size-3" />
              <span>Add Installation</span>
            </Button>
          </div>
        </div>

        {/* Results Counter Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold uppercase tracking-tight text-sm">
              Installations
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#121622] text-slate-300 border border-white/[0.08]">
              {sites.length} of {dbSites.length} Displayed
            </span>
            {searchQuery && (
              <span className="text-[11px] font-mono text-[#FF2A85] flex items-center gap-1">
                Matching: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          {(searchQuery || activeFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-white underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Site Cockpit Cards Grid or Empty State */}
        {sites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sites.map((site) => (
              <SiteCockpitCard
                key={site.id}
                site={site}
                onRenew={handleOpenRenew}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-xl bg-[#0B0D13] border border-white/[0.08] flex flex-col items-center justify-center text-center space-y-3">
            <div className="size-12 rounded-full bg-[#121622] border border-white/[0.1] flex items-center justify-center text-slate-400">
              <Search className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No installations found</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                No site matched &quot;{searchQuery}&quot; with current filter settings. Try clearing the search query or selecting &quot;All&quot;.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="text-xs font-mono border-white/[0.1] bg-[#121622] text-slate-200"
              >
                Reset Search & Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddSiteModalOpen(true)}
                className="text-xs font-mono gap-1.5 shadow-[0_0_12px_rgba(255,42,133,0.3)]"
              >
                <Plus className="size-3.5" />
                <span>Add Installation</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Renewal Subscription Modal */}
      <RenewalSubscriptionModal
        site={selectedSiteForRenewal}
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        onRenewSuccess={handleRenewSuccess}
      />

      {/* Add Site Modal */}
      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
}
