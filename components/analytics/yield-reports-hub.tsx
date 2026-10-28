"use client";

import React, { useState } from "react";
import {
  Sun,
  Radio,
  Flame,
  Calendar,
  CalendarDays,
  CalendarRange,
  FileSpreadsheet,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import { CyberDatetimePicker, DateTimeRange, getDefaultDateTimeRange } from "./cyber-datetime-picker";
import { InverterWiseReport } from "./reports/inverter-wise-report";
import { GridMfmReport } from "./reports/grid-mfm-report";
import { DgGenerationReport } from "./reports/dg-generation-report";
import { MonthlyGenerationTable } from "./reports/monthly-generation-table";
import { YearlyGenerationTable } from "./reports/yearly-generation-table";

interface YieldReportsHubProps {
  site: SiteRecord;
  className?: string;
}

export type ReportTimeHorizon = "range" | "monthly" | "yearly";
export type ReportAssetType = "inverter" | "grid" | "dg";

export function YieldReportsHub({
  site,
  className = "",
}: YieldReportsHubProps) {
  const [horizon, setHorizon] = useState<ReportTimeHorizon>("range");
  const [assetType, setAssetType] = useState<ReportAssetType>("inverter");
  const [dateTimeRange, setDateTimeRange] = useState<DateTimeRange>(() => getDefaultDateTimeRange(14));

  return (
    <div className={`space-y-4 font-mono ${className}`}>
      {/* Top Controls: Horizon Selector + Calendar Picker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle shadow-md">
        {/* Left: Time Horizon Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-theme-muted uppercase mr-1">
            <FileSpreadsheet className="size-4 text-[#FF2A85]" />
            <span>Report Horizon:</span>
          </div>

          <div className="flex rounded-lg bg-theme-elevated p-1 border border-theme-subtle">
            <button
              onClick={() => setHorizon("range")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                horizon === "range"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              <Calendar className="size-3.5" />
              <span>Date-Wise / Range</span>
            </button>

            <button
              onClick={() => setHorizon("monthly")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                horizon === "monthly"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              <CalendarDays className="size-3.5" />
              <span>Monthly Report</span>
            </button>

            <button
              onClick={() => setHorizon("yearly")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                horizon === "yearly"
                  ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              <CalendarRange className="size-3.5" />
              <span>Yearly Report</span>
            </button>
          </div>
        </div>

        {/* Right: Calendar Range Picker (Visible when in date-wise range mode) */}
        {horizon === "range" && (
          <div className="flex items-center gap-2">
            <CyberDatetimePicker
              value={dateTimeRange}
              onChange={setDateTimeRange}
              accentColor="#FF2A85"
              compact={false}
              align="right"
            />
          </div>
        )}
      </div>

      {/* Asset Sub-Report Switcher (Only in Date-Wise / Range Mode) */}
      {horizon === "range" && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-theme-elevated/40 border border-theme-subtle overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-theme-muted uppercase px-2 shrink-0">
            Asset Breakdown:
          </span>

          <button
            onClick={() => setAssetType("inverter")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              assetType === "inverter"
                ? "bg-[#FFD600] text-black shadow-xs font-black"
                : "text-theme-secondary hover:text-theme-primary hover:bg-theme-card"
            }`}
          >
            <Sun className="size-3.5" />
            <span>☀️ Inverter-Wise Generation</span>
          </button>

          <button
            onClick={() => setAssetType("grid")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              assetType === "grid"
                ? "bg-[#9D4EDD] text-white shadow-xs font-black"
                : "text-theme-secondary hover:text-theme-primary hover:bg-theme-card"
            }`}
          >
            <Radio className="size-3.5" />
            <span>⚡ Grid MFM (Export &amp; Import)</span>
          </button>

          <button
            onClick={() => setAssetType("dg")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              assetType === "dg"
                ? "bg-[#FF6B00] text-white shadow-xs font-black"
                : "text-theme-secondary hover:text-theme-primary hover:bg-theme-card"
            }`}
          >
            <Flame className="size-3.5" />
            <span>⛽ Diesel Generator (DG) Backup</span>
          </button>
        </div>
      )}

      {/* Content Viewport */}
      <div className="animate-in fade-in-50 duration-200">
        {horizon === "range" && assetType === "inverter" && (
          <InverterWiseReport
            site={site}
            startDate={dateTimeRange.startDate}
            endDate={dateTimeRange.endDate}
          />
        )}

        {horizon === "range" && assetType === "grid" && (
          <GridMfmReport
            site={site}
            startDate={dateTimeRange.startDate}
            endDate={dateTimeRange.endDate}
          />
        )}

        {horizon === "range" && assetType === "dg" && (
          <DgGenerationReport
            site={site}
            startDate={dateTimeRange.startDate}
            endDate={dateTimeRange.endDate}
          />
        )}

        {horizon === "monthly" && (
          <MonthlyGenerationTable site={site} />
        )}

        {horizon === "yearly" && (
          <YearlyGenerationTable site={site} />
        )}
      </div>
    </div>
  );
}
