"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Layers,
  Building,
  ChevronDown,
} from "lucide-react";
import { SiteRecord, HourlyTelemetryRecord } from "@/lib/energy/types";
import { PowerConsumptionWorkspace } from "./power-consumption-workspace";
import { PlantGenerationComparativeHub } from "./plant-generation-comparative-hub";

interface AnalyticsMasterContainerProps {
  sites: SiteRecord[];
  initialSiteId: string;
  hourlyTelemetry: HourlyTelemetryRecord[];
}

export function AnalyticsMasterContainer({
  sites,
  initialSiteId,
  hourlyTelemetry,
}: AnalyticsMasterContainerProps) {
  const router = useRouter();
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId);
  const [analyticsMode, setAnalyticsMode] = useState<"dispatch" | "comparative">("dispatch");

  const currentSite = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    router.replace(`/analytics?siteId=${newSiteId}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: Site Selector & Mode Switcher */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-3 sm:p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
        {/* Site Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-theme-muted flex items-center gap-1.5 font-bold">
            <Building className="size-4 text-[#FF2A85]" />
            Active Asset:
          </span>
          <div className="relative inline-block">
            <select
              value={selectedSiteId}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="appearance-none bg-theme-muted hover:bg-theme-muted/80 text-theme-primary font-bold px-3 py-1.5 pr-8 rounded-lg border border-theme-subtle focus:outline-none focus:border-[#FF2A85] cursor-pointer transition-colors min-h-[38px]"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name} ({s.solar_capacity_kwp} kW Solar)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-theme-muted" />
          </div>
        </div>

        {/* Analytics Workspace Mode Switcher */}
        <div className="flex rounded-lg bg-theme-muted p-1 border border-theme-subtle">
          <button
            onClick={() => setAnalyticsMode("dispatch")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
              analyticsMode === "dispatch"
                ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                : "text-theme-muted hover:text-theme-primary"
            }`}
          >
            <Activity className="size-3.5" />
            <span>⚡ Power Mix &amp; Dispatch Balance</span>
          </button>

          <button
            onClick={() => setAnalyticsMode("comparative")}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
              analyticsMode === "comparative"
                ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                : "text-theme-muted hover:text-theme-primary"
            }`}
          >
            <Layers className="size-3.5 text-[#00F0FF]" />
            <span>📈 Plant Generation Comparative &amp; 4-Quadrant</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE MODE */}
      {analyticsMode === "dispatch" ? (
        <PowerConsumptionWorkspace
          site={currentSite}
          sites={sites}
          hourlyTelemetry={hourlyTelemetry}
        />
      ) : (
        <PlantGenerationComparativeHub site={currentSite} />
      )}
    </div>
  );
}
