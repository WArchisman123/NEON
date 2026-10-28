"use client";

import React from "react";
import { Building2, Calendar, Radio, Sparkles } from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface CompanyBrandingBannerProps {
  site: SiteRecord;
  companyName?: string;
  logoUrl?: string | null;
}

export function CompanyBrandingBanner({
  site,
  companyName = "iRasus Technologies",
  logoUrl = null,
}: CompanyBrandingBannerProps) {
  const commissionedDate = site.commissioned_date || "15 May 2026";
  const commissionedBy = site.commissioned_by || "iRasus EPC Energy Solutions";

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
      {/* Left: Company Logo Space & Name */}
      <div className="flex items-center gap-3">
        {/* Company Logo Space */}
        <div className="size-12 rounded-xl bg-gradient-to-br from-[#FF2A85] to-[#B00055] p-0.5 shadow-[0_0_15px_rgba(255,42,133,0.35)] shrink-0 flex items-center justify-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={companyName}
              className="w-full h-full object-contain rounded-lg bg-black/40 p-1"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-black/60 flex items-center justify-center text-white font-black text-xl">
              ⚡
            </div>
          )}
        </div>

        {/* Company & Site Title */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15 flex items-center gap-1">
              <Building2 className="size-3 text-[#FF2A85]" />
              {companyName}
            </span>
            <span className="text-[10px] text-theme-muted">
              Partner Enterprise Portal
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-base sm:text-lg font-black text-theme-primary tracking-tight truncate">
              {site.name}
            </h2>
            <span className="text-[11px] text-[#00E676] font-semibold">
              • {site.plant_type?.replace(/_/g, " ").toUpperCase() || "COMMERCIAL & INDUSTRIAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Operational Status Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Commissioning Info */}
        <div className="px-2.5 py-1.5 rounded-lg bg-theme-elevated/40 border border-theme-subtle text-[10px] flex items-center gap-1.5">
          <Calendar className="size-3 text-theme-secondary" />
          <span className="text-theme-secondary">Commissioned:</span>
          <span className="font-bold text-theme-primary">{commissionedDate}</span>
          <span className="text-theme-muted hidden xl:inline">({commissionedBy})</span>
        </div>

        {/* Grid Synchronization State */}
        <div className="px-2.5 py-1.5 rounded-lg bg-theme-elevated/40 border border-theme-subtle text-[10px] flex items-center gap-1.5">
          <Radio className="size-3 text-[#00E676] animate-pulse" />
          <span className="text-theme-secondary">Grid Sync:</span>
          <span className="font-bold text-[#00E676]">Synchronized (50.0Hz)</span>
        </div>

        {/* Target Pacing Badge */}
        <div className="px-2.5 py-1.5 rounded-lg bg-[#FFD600]/10 border border-[#FFD600]/30 text-[10px] flex items-center gap-1.5 text-[#FFD600] font-bold">
          <Sparkles className="size-3" />
          <span>P50 Yield: On Track (+4.2%)</span>
        </div>
      </div>
    </div>
  );
}
