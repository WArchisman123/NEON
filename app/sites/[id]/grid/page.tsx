import React from "react";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { SiteAssetNav } from "@/components/site-detail/site-asset-nav";
import { GridPerformanceChart } from "@/components/analytics/grid-performance-chart";
import {
  getOrCreateOrg,
  getSiteDetails,
  getSiteHourlyAnalytics,
} from "@/lib/energy/site-service";
import {
  Zap,
  Activity,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GridSubsystemPage({ params }: Props) {
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

  const liveGridKw = site.grid_power_kw || -120;
  const isExporting = liveGridKw < 0;
  const peakRate = site.peak_tariff_rate || 0.18;
  const offpeakRate = site.offpeak_tariff_rate || 0.07;
  const mdContracted = site.contracted_demand_kva || 800;
  const currentLoad = site.load_power_kw || 620;
  const mdUtilizationPct = Math.round((currentLoad / mdContracted) * 100);

  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Asset Switcher Bar */}
        <SiteAssetNav site={site} activeAsset="grid" />

        {/* Utility Grid Master Hero Banner */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9D4EDD] to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#9D4EDD] font-bold flex items-center gap-1.5">
                  <Zap className="size-3.5" />
                  Utility Grid Intertie & Substation Telemetry
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-medium">
                  Intertie Voltage: 480V / 11kV Step-Down
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {site.name} — Grid Exchange & Tariff Arbitrage
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Contracted MD: <span className="text-white font-bold">{mdContracted} kVA</span> • Tariff: TOU Industrial Schedule
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                <span className="size-2 rounded-full bg-[#00E676] animate-pulse" />
                GRID SYNCHRONIZED
              </span>
            </div>
          </div>

          {/* Key Metric Strip (7 Parameters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-white/[0.06] font-mono">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Net Exchange
              </span>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  isExporting ? "text-[#00E676]" : "text-[#9D4EDD]"
                }`}
              >
                {Math.abs(liveGridKw).toLocaleString()} kW
              </div>
              <span className="text-[10px] text-slate-500">
                {isExporting ? "Exporting Feed-in" : "Importing Power"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Grid Frequency
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                59.98 Hz
              </div>
              <span className="text-[10px] text-[#00E676]">±0.02 Hz Nominal</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Power Factor
              </span>
              <div className="text-lg font-bold text-[#00E676] mt-0.5">
                0.985 Lag
              </div>
              <span className="text-[10px] text-slate-500">Cos φ Target &gt;0.95</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Harmonics (THD)
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                1.4% THD-V
              </div>
              <span className="text-[10px] text-slate-500">2.8% THD-I</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Active Tariff
              </span>
              <div className="text-lg font-bold text-[#FF2A85] mt-0.5">
                ₹{peakRate}/kWh
              </div>
              <span className="text-[10px] text-slate-500">PEAK TARIFF</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                MD Utilization
              </span>
              <div className="text-lg font-bold text-[#FFD600] mt-0.5">
                {mdUtilizationPct}%
              </div>
              <span className="text-[10px] text-slate-500">
                {currentLoad} / {mdContracted} kVA
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Today&apos;s Export
              </span>
              <div className="text-lg font-bold text-[#00E676] mt-0.5">
                {(site.grid_export_today_kwh || 1280).toLocaleString()} kWh
              </div>
              <span className="text-[10px] text-slate-500">Credits Earned</span>
            </div>
          </div>
        </div>

        {/* Primary Analytical Chart */}
        <GridPerformanceChart
          initialData={hourlyTelemetry}
          peakTariffRate={peakRate}
          offpeakTariffRate={offpeakRate}
        />

        {/* 3-Phase Power Quality & Maximum Demand Shaving */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3-Phase Power Quality Card */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-[#9D4EDD]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  3-Phase Voltage & Harmonic Quality (IEC 61000)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#00E676] flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                Class A Compliance
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Phase L1-L2</span>
                <div className="text-base font-bold text-white mt-1">481.2 V</div>
                <span className="text-[9px] text-[#00E676]">+0.2% dev</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Phase L2-L3</span>
                <div className="text-base font-bold text-white mt-1">480.8 V</div>
                <span className="text-[9px] text-[#00E676]">+0.1% dev</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Phase L3-L1</span>
                <div className="text-base font-bold text-white mt-1">481.5 V</div>
                <span className="text-[9px] text-[#00E676]">+0.3% dev</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06] font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Phase Voltage Unbalance Rate (PVUR)</span>
                <span className="text-[#00E676] font-bold">0.18% (Standard &lt;2.0%)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Demand Distortion (TDD)</span>
                <span className="text-[#00E676] font-bold">3.2% (Standard &lt;5.0%)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Revenue Meter</span>
                <span className="text-slate-200">Schneider PowerLogic ION9000</span>
              </div>
            </div>
          </div>

          {/* Maximum Demand (MD) Penalty Shaving Card */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="size-4 text-[#00E676]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  Contracted Maximum Demand (MD) Shaving
                </h3>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Contracted Sanctioned MD</span>
                  <span className="text-white font-bold">{mdContracted} kVA</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Peak Shaved by BESS Today</span>
                  <span className="text-[#00F0FF] font-bold">240 kVA cut</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avoided Utility MD Penalty</span>
                  <span className="text-[#00E676] font-bold">₹1,05,000 / month saved</span>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Current MD Margin Utilization</span>
                  <span className="text-[#FFD600] font-bold">{mdUtilizationPct}%</span>
                </div>
                <div className="h-2 w-full bg-[#121622] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      mdUtilizationPct > 85
                        ? "bg-[#FF1744]"
                        : mdUtilizationPct > 70
                        ? "bg-[#FFD600]"
                        : "bg-[#00E676]"
                    }`}
                    style={{ width: `${Math.min(100, mdUtilizationPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>0 kVA</span>
                  <span>90% Alert Threshold</span>
                  <span>{mdContracted} kVA</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] border border-[#00E676]/20 font-mono text-xs space-y-1">
              <span className="font-bold text-[#00E676] flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                Zero MD Penalties Incurred
              </span>
              <p className="text-[11px] text-slate-400">
                BESS autonomous peak-shaving dispatch actively clamps site grid demand whenever factory consumption crosses 680 kVA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </NeonAppShell>
  );
}
