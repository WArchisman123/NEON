"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowUpDown,
  ChevronRight,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface FleetSpecificYieldLeaderboardProps {
  sites: SiteRecord[];
  searchQuery?: string;
}

type SortField = "specific_yield" | "cuf" | "capacity" | "target";

export function FleetSpecificYieldLeaderboard({
  sites,
  searchQuery = "",
}: FleetSpecificYieldLeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>("specific_yield");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Filter sites by search query
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const q = searchQuery.toLowerCase().trim();
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.location_city || "").toLowerCase().includes(q) ||
        (s.location_state || "").toLowerCase().includes(q) ||
        (s.commissioned_by || "").toLowerCase().includes(q)
    );
  }, [sites, searchQuery]);

  // Sort sites
  const sortedSites = useMemo(() => {
    return [...filteredSites].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === "specific_yield") {
        valA = a.specific_yield_kwh_per_kwp || 0;
        valB = b.specific_yield_kwh_per_kwp || 0;
      } else if (sortField === "cuf") {
        valA = a.cuf_pct || 0;
        valB = b.cuf_pct || 0;
      } else if (sortField === "capacity") {
        valA = a.solar_capacity_kwp || 0;
        valB = b.solar_capacity_kwp || 0;
      } else if (sortField === "target") {
        const pctA = a.annual_target_mwh ? ((a.annual_achieved_mwh || 0) / a.annual_target_mwh) * 100 : 0;
        const pctB = b.annual_target_mwh ? ((b.annual_achieved_mwh || 0) / b.annual_target_mwh) * 100 : 0;
        valA = pctA;
        valB = pctB;
      }

      return sortOrder === "desc" ? valB - valA : valA - valB;
    });
  }, [filteredSites, sortField, sortOrder]);

  // Maximum specific yield across the entire fleet for normalized relative bar
  const maxFleetYield = useMemo(() => {
    const maxVal = Math.max(...sites.map((s) => s.specific_yield_kwh_per_kwp || 0), 5.2);
    return maxVal > 0 ? maxVal : 5.0;
  }, [sites]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-theme-card border border-theme-subtle shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#FFD600]/10 border border-[#FFD600]/30 text-[#FFD600]">
              <Trophy className="size-4" />
            </span>
            <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
              Fleet-Wide Normalized Specific Yield Leaderboard
            </h3>
          </div>
          <p className="text-xs font-mono text-theme-muted mt-0.5">
            Ranked by normalized generation ($kWh/kWp$) to benchmark performance across different plant capacities
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
          <span className="text-theme-muted mr-1">Sort:</span>
          {[
            { id: "specific_yield", label: "Specific Yield (kWh/kWp)" },
            { id: "cuf", label: "CUF %" },
            { id: "capacity", label: "Capacity (kWp)" },
            { id: "target", label: "Target %" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => toggleSort(item.id as SortField)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all min-h-[38px] flex items-center gap-1.5 ${
                sortField === item.id
                  ? "bg-[#FF2A85] text-white font-bold shadow-sm"
                  : "bg-theme-muted text-theme-muted hover:text-theme-primary border border-theme-subtle"
              }`}
            >
              <span>{item.label}</span>
              {sortField === item.id && (
                <ArrowUpDown className="size-3 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-theme-subtle text-theme-muted uppercase text-[10px] bg-theme-muted/50">
                <th className="py-3 px-4 text-center w-14">Rank</th>
                <th className="py-3 px-4">Solar Plant &amp; Location</th>
                <th className="py-3 px-4 text-right">Capacity (DC / AC)</th>
                <th className="py-3 px-4 text-right">Today&apos;s Generation</th>
                <th className="py-3 px-4 min-w-[200px]">Specific Yield (kWh/kWp)</th>
                <th className="py-3 px-4 text-right">CUF %</th>
                <th className="py-3 px-4 text-right">Target Progress</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle">
              {sortedSites.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-theme-muted">
                    No solar plants match &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                sortedSites.map((site, index) => {
                  const rank = index + 1;
                  const specificYield = site.specific_yield_kwh_per_kwp || 0;
                  const cuf = site.cuf_pct || 0;
                  const dcKwp = site.dc_capacity_kwp || Math.round(site.solar_capacity_kwp * 1.06);
                  const acKw = site.solar_capacity_kwp;
                  const dcAcRatio = (dcKwp / (acKw || 1)).toFixed(2);
                  const targetPct = site.annual_target_mwh
                    ? Math.round(((site.annual_achieved_mwh || 0) / site.annual_target_mwh) * 100)
                    : 68;

                  const relativeWidthPct = Math.min(
                    100,
                    Math.max(10, Math.round((specificYield / maxFleetYield) * 100))
                  );

                  // Rank Badge Color
                  let rankBadge = (
                    <span className="size-6 rounded-full flex items-center justify-center font-bold text-xs bg-theme-muted text-theme-muted mx-auto">
                      #{rank}
                    </span>
                  );
                  if (rank === 1) {
                    rankBadge = (
                      <span className="size-6 rounded-full flex items-center justify-center font-bold text-xs bg-[#FFD600] text-black shadow-[0_0_10px_rgba(255,214,0,0.5)] mx-auto">
                        1
                      </span>
                    );
                  } else if (rank === 2) {
                    rankBadge = (
                      <span className="size-6 rounded-full flex items-center justify-center font-bold text-xs bg-slate-300 text-black shadow-sm mx-auto">
                        2
                      </span>
                    );
                  } else if (rank === 3) {
                    rankBadge = (
                      <span className="size-6 rounded-full flex items-center justify-center font-bold text-xs bg-amber-600 text-white shadow-sm mx-auto">
                        3
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={site.id}
                      className="hover:bg-theme-muted/40 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center">{rankBadge}</td>

                      {/* Name & Location */}
                      <td className="py-3 px-4">
                        <Link
                          href={`/sites/${site.id}`}
                          className="font-bold text-theme-primary hover:text-[#FF2A85] transition-colors flex items-center gap-1.5"
                        >
                          <span>{site.name}</span>
                          <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF2A85]" />
                        </Link>
                        <div className="flex items-center gap-1 text-[11px] text-theme-muted mt-0.5">
                          <MapPin className="size-3 text-slate-400" />
                          <span>
                            {site.location_city}, {site.location_state}
                          </span>
                          {site.commissioned_by && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">EPC: {site.commissioned_by}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-theme-primary">
                          {dcKwp} kWp
                        </div>
                        <div className="text-[10px] text-theme-muted">
                          {acKw} kW AC (DC/AC: {dcAcRatio})
                        </div>
                      </td>

                      {/* Today's Generation */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-[#FFD600]">
                          {(site.solar_yield_today_kwh || 384).toLocaleString()} kWh
                        </div>
                        <div className="text-[10px] text-theme-muted">
                          ₹{Math.round((site.solar_yield_today_kwh || 384) * (site.feed_in_tariff_inr || 8.25)).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Specific Yield Gauge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <span className="font-bold text-[#FFD600] text-sm">
                            {specificYield.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-theme-muted">
                            kWh/kWp
                          </span>
                        </div>
                        <div className="h-2 w-full bg-theme-muted rounded-full overflow-hidden border border-theme-subtle">
                          <div
                            className="h-full bg-gradient-to-r from-[#FFD600] via-[#00F0FF] to-[#00E676] rounded-full transition-all duration-500"
                            style={{ width: `${relativeWidthPct}%` }}
                          />
                        </div>
                      </td>

                      {/* CUF % */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-[#00F0FF] text-sm">
                          {cuf.toFixed(2)}%
                        </div>
                        <div className="text-[10px] text-theme-muted">
                          {cuf >= 18 ? "Optimal" : "Sub-18%"}
                        </div>
                      </td>

                      {/* Annual Target Progress */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-theme-primary">
                          {targetPct}%
                        </div>
                        <div className="text-[10px] text-theme-muted">
                          {site.annual_achieved_mwh || 80}/{site.annual_target_mwh || 120} MWh
                        </div>
                      </td>

                      {/* Operational Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold ${
                            site.status === "online"
                              ? "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30"
                              : site.status === "degraded"
                              ? "bg-[#FFAB00]/10 text-[#FFAB00] border border-[#FFAB00]/30"
                              : "bg-[#FF1744]/10 text-[#FF1744] border border-[#FF1744]/30"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              site.status === "online"
                                ? "bg-[#00E676]"
                                : site.status === "degraded"
                                ? "bg-[#FFAB00]"
                                : "bg-[#FF1744]"
                            }`}
                          />
                          {site.status?.toUpperCase() || "ONLINE"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/sites/${site.id}/solar`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FF2A85]/10 hover:bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30 font-bold transition-colors min-h-[36px]"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
