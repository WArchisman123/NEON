"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  Wrench,
  Download,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface FleetWarrantyWatchlistProps {
  sites: SiteRecord[];
  searchQuery?: string;
}

interface WarrantyItem {
  site: SiteRecord;
  vendor: string;
  commissionedDate: string;
  expiryDate: string;
  daysRemaining: number;
  urgency: "critical" | "warning" | "info" | "expired";
  coverageType: string;
}

export function FleetWarrantyWatchlist({
  sites,
  searchQuery = "",
}: FleetWarrantyWatchlistProps) {
  const [filterWindow, setFilterWindow] = useState<"all" | "30" | "60" | "90">("all");

  // Calculate warranty expiration details for each site
  const watchlist: WarrantyItem[] = useMemo(() => {
    const today = new Date();

    return sites
      .map((site, index) => {
        const vendor =
          site.commissioned_by ||
          (index % 3 === 0
            ? "Tata Power Solar EPC"
            : index % 3 === 1
            ? "Sterling & Wilson Renewable"
            : "L&T Solar & Microgrids");

        const commDate = site.commissioned_date || "2024-03-15";
        // Deterministic expiration: some expiring soon (e.g. 18 days, 42 days, 75 days)
        const expDate =
          site.warranty_expiry_date ||
          (index === 0
            ? "2026-10-26" // 18 days left
            : index === 1
            ? "2026-11-20" // 43 days left
            : index === 2
            ? "2026-12-28" // 81 days left
            : "2027-04-15");

        const expMs = new Date(expDate).getTime();
        const diffDays = Math.round((expMs - today.getTime()) / (1000 * 60 * 60 * 24));

        let urgency: WarrantyItem["urgency"] = "info";
        if (diffDays <= 0) {
          urgency = "expired";
        } else if (diffDays <= 30) {
          urgency = "critical";
        } else if (diffDays <= 60) {
          urgency = "warning";
        } else {
          urgency = "info";
        }

        const coverageType =
          index % 3 === 0
            ? "Comprehensive EPC Workmanship & PR Guarantee"
            : index % 3 === 1
            ? "Inverter Fleet Manufacturer Warranty"
            : "BESS & PCS Liquid Loop Service Contract";

        return {
          site,
          vendor,
          commissionedDate: commDate,
          expiryDate: expDate,
          daysRemaining: diffDays,
          urgency,
          coverageType,
        };
      })
      .filter((item) => {
        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.site.name.toLowerCase().includes(q);
          const matchVendor = item.vendor.toLowerCase().includes(q);
          const matchCity = (item.site.location_city || "").toLowerCase().includes(q);
          if (!matchName && !matchVendor && !matchCity) return false;
        }

        // Window filter
        if (filterWindow === "30") return item.daysRemaining <= 30;
        if (filterWindow === "60") return item.daysRemaining <= 60;
        if (filterWindow === "90") return item.daysRemaining <= 90;
        return true;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [sites, searchQuery, filterWindow]);

  // Export CSV
  const handleExportCsv = () => {
    let csv =
      "Site_Name,City,State,EPC_Vendor,Commissioned_Date,Warranty_Expiry,Days_Remaining,Coverage_Type,Urgency\n";
    watchlist.forEach((w) => {
      csv += `"${w.site.name}",${w.site.location_city},${w.site.location_state},"${w.vendor}",${w.commissionedDate},${w.expiryDate},${w.daysRemaining},"${w.coverageType}",${w.urgency}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `EPC_Warranty_Watchlist_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header & Window Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-theme-card border border-theme-subtle shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00]">
              <ShieldAlert className="size-4" />
            </span>
            <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
              EPC Commissioning &amp; Warranty Expiration Watchlist
            </h3>
          </div>
          <p className="text-xs font-mono text-theme-muted mt-0.5">
            Proactive O&amp;M monitoring flagging equipment warranties expiring within 30, 60, or 90 days
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
          <span className="text-theme-muted mr-1">Window:</span>
          {[
            { id: "all", label: "All Sites" },
            { id: "30", label: "Urgent (< 30d)" },
            { id: "60", label: "< 60 Days" },
            { id: "90", label: "< 90 Days" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterWindow(item.id as typeof filterWindow)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all min-h-[38px] ${
                filterWindow === item.id
                  ? "bg-[#FF2A85] text-white font-bold shadow-sm"
                  : "bg-theme-muted text-theme-muted hover:text-theme-primary border border-theme-subtle"
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-theme-muted border border-theme-subtle hover:border-theme-primary/30 text-xs font-mono text-theme-primary transition-all min-h-[38px] ml-2"
          >
            <Download className="size-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Watchlist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-xl bg-theme-card border border-theme-subtle font-mono text-theme-muted">
            <CheckCircle2 className="size-8 text-[#00E676] mx-auto mb-2 opacity-60" />
            <p className="font-bold text-sm text-theme-primary">
              No warranty expirations detected in this window
            </p>
            <p className="text-xs mt-1">
              All portfolio plant warranties and service contracts are in good standing.
            </p>
          </div>
        ) : (
          watchlist.map((item) => {
            const isCritical = item.urgency === "critical";
            const isWarning = item.urgency === "warning";
            const isExpired = item.urgency === "expired";

            return (
              <div
                key={item.site.id}
                className={`rounded-xl border p-4 flex flex-col justify-between space-y-4 transition-all ${
                  isCritical
                    ? "bg-[#FF1744]/10 border-[#FF1744]/40"
                    : isWarning
                    ? "bg-[#FFAB00]/10 border-[#FFAB00]/40"
                    : "bg-theme-card border-theme-subtle hover:border-theme-primary/30"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Site Name & Countdown Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/sites/${item.site.id}`}
                        className="font-bold text-sm text-theme-primary hover:text-[#FF2A85] transition-colors flex items-center gap-1.5"
                      >
                        <span>{item.site.name}</span>
                        <ExternalLink className="size-3 text-theme-muted" />
                      </Link>
                      <div className="text-xs font-mono text-theme-muted mt-0.5">
                        {item.site.location_city}, {item.site.location_state}
                      </div>
                    </div>

                    {isExpired ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/40 shrink-0">
                        EXPIRED
                      </span>
                    ) : isCritical ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/40 shrink-0 animate-pulse flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.daysRemaining}d Left
                      </span>
                    ) : isWarning ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFAB00]/20 text-[#FFAB00] border border-[#FFAB00]/40 shrink-0 flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.daysRemaining}d Left
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shrink-0 flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.daysRemaining}d Left
                      </span>
                    )}
                  </div>

                  {/* Coverage Type & Vendor */}
                  <div className="p-2.5 rounded-lg bg-theme-muted border border-theme-subtle font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-theme-muted text-[10px]">
                      <span>EPC CONTRACTOR</span>
                      <span className="font-bold text-theme-primary">{item.vendor}</span>
                    </div>
                    <div className="text-[11px] font-bold text-theme-secondary">
                      {item.coverageType}
                    </div>
                  </div>

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div>
                      <span className="text-[10px] text-theme-muted block">
                        Commissioned
                      </span>
                      <span className="text-theme-secondary font-medium">
                        {item.commissionedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-theme-muted block">
                        Warranty Expiry
                      </span>
                      <span
                        className={`font-bold ${
                          isCritical || isExpired
                            ? "text-[#FF1744]"
                            : isWarning
                            ? "text-[#FFAB00]"
                            : "text-[#00F0FF]"
                        }`}
                      >
                        {item.expiryDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA to Book Certified Service */}
                <div className="pt-3 border-t border-theme-subtle">
                  <Link
                    href={`/maintenance?siteId=${item.site.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF2A85] hover:bg-[#e02073] text-white text-xs font-mono font-bold shadow-[0_0_12px_rgba(255,42,133,0.3)] transition-all min-h-[42px]"
                  >
                    <Wrench className="size-3.5" />
                    <span>Schedule Warranty Audit &amp; Wash ➔</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
