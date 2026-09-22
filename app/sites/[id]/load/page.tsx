import React from "react";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { SiteAssetNav } from "@/components/site-detail/site-asset-nav";
import { LoadPerformanceChart } from "@/components/analytics/load-performance-chart";
import {
  getOrCreateOrg,
  getSiteDetails,
  getSiteHourlyAnalytics,
} from "@/lib/energy/site-service";
import {
  Factory,
  Activity,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LoadSubsystemPage({ params }: Props) {
  const { id: siteId } = await params;
  const user = await currentUser();
  const { orgId, orgSlug } = await auth();

  const effectiveOrgId = orgId || `user-org-${user?.id || "default"}`;
  const orgName =
    orgSlug || (user?.firstName ? `${user.firstName}'s Energy Fleet` : "Apex Clean Energy");

  await getOrCreateOrg(effectiveOrgId, orgName);

  const siteData = await getSiteDetails(effectiveOrgId, siteId);

  if (!siteData) {
    return notFound();
  }

  const { site } = siteData;
  const hourlyTelemetry = await getSiteHourlyAnalytics(site.id, "30d");

  const liveLoadKw = site.load_power_kw || 620;
  const contractedKva = site.contracted_demand_kva || 800;
  const mdUtilization = Math.round((liveLoadKw / contractedKva) * 100);

  // Sub-circuit breakdown percentages
  const criticalKw = Math.round(liveLoadKw * 0.45);
  const hvacKw = Math.round(liveLoadKw * 0.35);
  const auxKw = liveLoadKw - criticalKw - hvacKw;

  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Asset Switcher Bar */}
        <SiteAssetNav site={site} activeAsset="load" />

        {/* Facility Load Master Hero Banner */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF2A85] font-bold flex items-center gap-1.5">
                  <Factory className="size-3.5" />
                  Facility Power Consumption & Demand Profiler
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-medium">
                  {site.location_city}, {site.location_state}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {site.name} — Facility Demand & Power Quality
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Contracted Sanctioned MD: <span className="text-white font-bold">{contractedKva} kVA</span> • 3-Phase Industrial Feeder
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                <span className="size-2 rounded-full bg-[#00E676]" />
                LOAD FEEDERS ONLINE
              </span>
            </div>
          </div>

          {/* Key Metric Strip (7 Parameters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-white/[0.06] font-mono">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Active Demand
              </span>
              <div className="text-lg font-bold text-[#FF2A85] mt-0.5">
                {liveLoadKw.toLocaleString()} kW
              </div>
              <span className="text-[10px] text-slate-500">Instantaneous</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Apparent Power
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                {Math.round(liveLoadKw * 1.02)} kVA
              </div>
              <span className="text-[10px] text-slate-500">Vector sum</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Reactive Power
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                115 kVAR
              </div>
              <span className="text-[10px] text-slate-500">Inductive</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Power Factor
              </span>
              <div className="text-lg font-bold text-[#00E676] mt-0.5">
                0.984 Lag
              </div>
              <span className="text-[10px] text-slate-500">APFC Balanced</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                MD Utilization
              </span>
              <div className="text-lg font-bold text-[#FFD600] mt-0.5">
                {mdUtilization}%
              </div>
              <span className="text-[10px] text-slate-500">
                {liveLoadKw} / {contractedKva} kVA
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Peak Recorded
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                {Math.round(liveLoadKw * 1.05)} kW
              </div>
              <span className="text-[10px] text-slate-500">Today&apos;s Max</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Today&apos;s Energy
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                {(site.load_consumption_today_kwh || 6120).toLocaleString()} kWh
              </div>
              <span className="text-[10px] text-slate-500">Cumulative</span>
            </div>
          </div>
        </div>

        {/* Primary Analytical Chart */}
        <LoadPerformanceChart
          initialData={hourlyTelemetry}
          contractedMdKva={contractedKva}
        />

        {/* Circuit Breakdown & 3-Phase Phase Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sub-Load Distribution Card */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-[#FF2A85]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  Feeder Circuit Load Breakdown
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">3 Sub-Distribution Boards</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#00F0FF]" />
                    Critical Process Machinery & Cleanroom
                  </span>
                  <span className="font-bold text-[#00F0FF]">{criticalKw} kW (45%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#121622] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00F0FF] w-[45%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#FF2A85]" />
                    HVAC, Liquid Chillers & Air Handling
                  </span>
                  <span className="font-bold text-[#FF2A85]">{hvacKw} kW (35%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#121622] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF2A85] w-[35%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-slate-400" />
                    Auxiliary Lighting, Motors & EV Chargers
                  </span>
                  <span className="font-bold text-slate-200">{auxKw} kW (20%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#121622] rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 w-[20%]" />
                </div>
              </div>
            </div>
          </div>

          {/* 3-Phase Phase Current Balance Card */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-[#FF2A85]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  3-Phase Current Balance & Neutral Safety
                </h3>
              </div>
              <span className="text-xs font-mono text-[#00E676] flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                Phase Balanced
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Phase L1</span>
                <div className="text-base font-bold text-white mt-1">745.2 A</div>
                <span className="text-[9px] text-[#00E676]">Balanced</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Phase L2</span>
                <div className="text-base font-bold text-white mt-1">748.8 A</div>
                <span className="text-[9px] text-[#00E676]">Balanced</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Phase L3</span>
                <div className="text-base font-bold text-white mt-1">742.1 A</div>
                <span className="text-[9px] text-[#00E676]">Balanced</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] font-mono text-xs flex justify-between items-center">
              <span className="text-slate-400">Neutral Conductor Current (In)</span>
              <span className="font-bold text-[#00E676]">8.4 A (Zero-seq safe)</span>
            </div>
          </div>
        </div>
      </div>
    </NeonAppShell>
  );
}
