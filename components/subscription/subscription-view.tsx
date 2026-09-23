"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiteRecord, OrganizationRecord } from "@/lib/energy/types";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RenewalSubscriptionModal,
  RenewalModalSite,
} from "./renewal-subscription-modal";

interface SubscriptionViewProps {
  initialSites: SiteRecord[];
  organization: OrganizationRecord | null;
  clerkOrgId: string;
}

export function SubscriptionView({
  initialSites,
  organization,
  clerkOrgId,
}: SubscriptionViewProps) {
  const [sites, setSites] = useState<SiteRecord[]>(initialSites);
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [selectedSiteForRenewal, setSelectedSiteForRenewal] = useState<RenewalModalSite | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute statistics
  const totalSites = sites.length;
  const expiredSites = sites.filter((s) => s.subscription_status === "expired");
  const activeSites = sites.filter((s) => s.subscription_status !== "expired");

  const totalSolarKwp = sites.reduce((sum, s) => sum + (s.solar_capacity_kwp || 0), 0);
  const totalBessKwh = sites.reduce((sum, s) => sum + (s.bess_capacity_kwh || 0), 0);

  // Filtered sites
  const displayedSites = sites.filter((s) => {
    if (filter === "active") return s.subscription_status !== "expired";
    if (filter === "expired") return s.subscription_status === "expired";
    return true;
  });

  const handleOpenRenew = (site: SiteRecord) => {
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
    setIsModalOpen(true);
  };

  const handleRenewSuccess = (siteId: string) => {
    setSites((prev) =>
      prev.map((s) =>
        s.id === siteId
          ? { ...s, subscription_status: "active", status: "online" }
          : s
      )
    );
  };

  const getTierForSite = (site: SiteRecord) => {
    const cap = (site.solar_capacity_kwp || 0) + (site.bess_power_kw || 0);
    if (cap <= 500) return { name: "Starter", rate: "$199 / mo" };
    if (cap <= 2500) return { name: "Pro Commercial", rate: "$599 / mo" };
    return { name: "Utility Enterprise", rate: "$1,499 / mo" };
  };

  return (
    <div className="space-y-8">
      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Organization Plan Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Account Subscription Tier
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">PRO COMMERCIAL</h2>
              <span className="px-1.5 py-0.5 rounded bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40 text-[9px] font-mono font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {organization?.name || "iRasus Technologies"}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Org ID:</span>
            <span className="text-slate-300 truncate max-w-[120px]">{clerkOrgId}</span>
          </div>
        </div>

        {/* Site License Quota */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Active Installations Quota
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {totalSites} <span className="text-sm font-normal text-slate-400">/ 10 Included</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#00E676] h-full rounded-full transition-all"
                style={{ width: `${(totalSites / 10) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Available Slots</span>
            <span className="text-[#00E676] font-bold">{10 - totalSites} Slots Available</span>
          </div>
        </div>

        {/* Expired / Action Needed */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Compliance & Action Required
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black font-mono ${expiredSites.length > 0 ? "text-amber-400" : "text-[#00E676]"}`}>
                {expiredSites.length}
              </span>
              <span className="text-xs text-slate-400">
                {expiredSites.length === 1 ? "Site Expired" : "Sites Expired"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {expiredSites.length > 0
                ? "Telemetry paused on expired sites. Renewal restores live Modbus sync."
                : "All site telemetry feeds are actively authorized."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Active Licenses</span>
            <span className="text-[#00E676] font-bold">{activeSites.length} of {totalSites} Online</span>
          </div>
        </div>

        {/* Aggregate Managed Capacity */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Total Fleet Capacity
            </span>
            <div className="text-xl font-black text-white font-mono truncate">
              {(totalSolarKwp / 1000).toFixed(2)} MWp <span className="text-xs text-[#FFD600] font-normal">PV</span>
            </div>
            <div className="text-sm font-bold text-[#00F0FF] font-mono">
              {(totalBessKwh / 1000).toFixed(2)} MWh <span className="text-xs text-slate-400 font-normal">Storage</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Polling Cycle</span>
            <span className="text-[#FF2A85] font-bold">5s High-Speed</span>
          </div>
        </div>
      </div>

      {/* Sites Subscription Matrix Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold uppercase tracking-tight text-white">
              Site Telemetry Licenses
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#121622] text-slate-400 border border-white/[0.06]">
              {displayedSites.length} Sites
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                filter === "all"
                  ? "bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              All Sites ({totalSites})
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                filter === "active"
                  ? "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              Active ({activeSites.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("expired")}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                filter === "expired"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-[#121622] text-slate-400 border border-white/[0.08] hover:text-white"
              }`}
            >
              Expired / Action Required ({expiredSites.length})
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0B0D13] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#121622] border-b border-white/[0.08] text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Installation & Location</th>
                  <th className="py-3 px-4">Assets & Nameplate</th>
                  <th className="py-3 px-4">License Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Calculated Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {displayedSites.map((site) => {
                  const isExpired = site.subscription_status === "expired";
                  const tier = getTierForSite(site);

                  return (
                    <tr
                      key={site.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isExpired ? "bg-amber-500/[0.03]" : ""
                      }`}
                    >
                      {/* Name & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm font-sans">
                          <Link href={`/sites/${site.id}`} className="hover:text-[#FF2A85] transition-colors">
                            {site.name}
                          </Link>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {site.location_city}, {site.location_state}
                        </div>
                      </td>

                      {/* Assets */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex flex-wrap gap-1.5">
                          {site.has_solar && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/20 text-[10px]">
                              {site.solar_capacity_kwp} kWp Solar
                            </span>
                          )}
                          {site.has_bess && (
                            <span className="px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 text-[10px]">
                              {site.bess_capacity_kwh} kWh BESS
                            </span>
                          )}
                          {site.has_dg && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 text-[10px]">
                              DG Backup
                            </span>
                          )}
                          {!site.has_grid && (
                            <span className="px-1.5 py-0.5 rounded bg-[#9D4EDD]/10 text-[#9D4EDD] border border-[#9D4EDD]/20 text-[10px]">
                              Islanded
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-200 font-semibold">{tier.name}</span>
                        <span className="text-[10px] text-slate-500 block">5s telemetry streaming</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                            <AlertTriangle className="size-3" />
                            EXPIRED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-bold">
                            <span className="size-1.5 rounded-full bg-[#00E676] animate-pulse" />
                            ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-4 text-white font-bold">
                        {tier.rate}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isExpired ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenRenew(site)}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-8 px-3 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                          >
                            Renew Now
                            <ArrowRight className="size-3 ml-1" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRenew(site)}
                            className="text-xs h-8 px-3 border-white/[0.1] bg-[#121622] hover:bg-[#1a2030] text-slate-300"
                          >
                            Manage Plan
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subscription Tier Architecture Reference */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-tight text-white">
            Available Capacity Tiers & Ingestion Rates
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Subscriptions scale automatically based on aggregate site nameplate generation and storage rating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter */}
          <div className="p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Small Commercial / Micro
              </span>
              <h4 className="text-lg font-black text-white">Starter Tier</h4>
              <div className="text-2xl font-black text-white font-mono">
                $199 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-400">
                Ideal for rooftop arrays and behind-the-meter batteries up to 500 kWp / 500 kWh.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#00E676]" /> 15-second polling interval
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#00E676]" /> 30-day historical retention
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#00E676]" /> Standard email/SMS alerts
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Commercial */}
          <div className="p-5 rounded-xl bg-[#0B0D13] border border-[#FF2A85]/40 shadow-[0_0_20px_rgba(255,42,133,0.15)] space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FF2A85]" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF2A85] font-bold">
                  Industrial Microgrid (Current)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#FF2A85]/20 text-[#FF2A85] text-[9px] font-mono font-bold">
                  POPULAR
                </span>
              </div>
              <h4 className="text-lg font-black text-white">Pro Commercial</h4>
              <div className="text-2xl font-black text-white font-mono">
                $599 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-400">
                Engineered for multi-MW microgrids and utility-feeder storage up to 2.5 MWp / 5 MWh.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#FF2A85]" /> 5-second real-time streaming
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#FF2A85]" /> 1-year historical analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#FF2A85]" /> Automated peak-shaving dispatch
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#FF2A85]" /> 5% maintenance service discount
                </li>
              </ul>
            </div>
          </div>

          {/* Utility Enterprise */}
          <div className="p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Utility Scale / Independent Power Producer
              </span>
              <h4 className="text-lg font-black text-white">Utility Enterprise</h4>
              <div className="text-2xl font-black text-white font-mono">
                $1,499 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-400">
                Designed for large-scale utility solar farms and gigawatt-hour battery systems with custom SLA.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#00F0FF]" /> 1-second sub-cycle streaming
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#00F0FF]" /> Multi-year raw Modbus export
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#00F0FF]" /> Custom SCADA & API integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#00F0FF]" /> 15% maintenance marketplace discount
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Subscription Modal */}
      <RenewalSubscriptionModal
        site={selectedSiteForRenewal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRenewSuccess={handleRenewSuccess}
      />
    </div>
  );
}
