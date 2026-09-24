import React from "react";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { SiteAssetNav } from "@/components/site-detail/site-asset-nav";
import { DgPerformanceChart } from "@/components/analytics/dg-performance-chart";
import {
  getOrCreateOrg,
  getSiteDetails,
  getSiteHourlyAnalytics,
} from "@/lib/energy/site-service";
import {
  Flame,
  Activity,
  Gauge,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DgSubsystemPage({ params }: Props) {
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

  const fuelPct = site.dg_fuel_pct || 91.5;
  const dgCapacityKva = site.dg_capacity_kva || 500;
  const isRunning = site.dg_running || false;
  const runHours = 384.5;
  const nextServiceHours = 500 - (runHours % 250);

  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Asset Switcher Bar */}
        <SiteAssetNav site={site} activeAsset="dg" />

        {/* DG Master Hero Banner */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF6B00] font-bold flex items-center gap-1.5">
                  <Flame className="size-3.5" />
                  Diesel Generator Peaker & Microgrid Backup
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-medium">
                  Prime Mover: Cummins QSK19 Turbocharged
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {site.name} — Genset Engine & Fuel Diagnostics
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Capacity: <span className="text-white font-bold">{dgCapacityKva} kVA</span> • Controller: DeepSea DSE 8610 Auto-Start
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border ${
                  isRunning
                    ? "bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/40 animate-pulse"
                    : "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isRunning ? "bg-[#FF6B00]" : "bg-[#00E676]"
                  }`}
                />
                {isRunning ? "RUNNING LOADED" : "AUTO-STANDBY READY"}
              </span>
            </div>
          </div>

          {/* Key Metric Strip (7 Parameters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-white/[0.06] font-mono">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Operating State
              </span>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  isRunning ? "text-[#FF6B00]" : "text-[#00E676]"
                }`}
              >
                {isRunning ? "420 kW" : "STANDBY"}
              </div>
              <span className="text-[10px] text-slate-500">
                {isRunning ? "1,500 RPM" : "0 RPM (Armed)"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Fuel Tank Level
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                {fuelPct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">1,830 Liters Left</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Fuel Burn Rate
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                {isRunning ? "84.2 L/h" : "0.0 L/h"}
              </div>
              <span className="text-[10px] text-slate-500">
                {isRunning ? "21.7 hrs remaining" : "Standby"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Oil Pressure
              </span>
              <div className="text-lg font-bold text-[#00E676] mt-0.5">
                4.8 bar
              </div>
              <span className="text-[10px] text-slate-500">Nominal 4-6 bar</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Coolant Temp
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                82.4°C
              </div>
              <span className="text-[10px] text-slate-500">Preheated jacket</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Battery Voltage
              </span>
              <div className="text-lg font-bold text-[#00E676] mt-0.5">
                27.4 V
              </div>
              <span className="text-[10px] text-slate-500">24V Float Charger</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Diesel Displaced
              </span>
              <div className="text-lg font-bold text-[#00E676] mt-0.5">
                428 Liters
              </div>
              <span className="text-[10px] text-slate-500">Clean Avoided</span>
            </div>
          </div>
        </div>

        {/* Primary Analytical Chart */}
        <DgPerformanceChart
          initialData={hourlyTelemetry}
          dgCapacityKva={dgCapacityKva}
        />

        {/* Engine Diagnostics & Service Interval */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mechanical Engine Telemetry */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="size-4 text-[#FF6B00]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  Engine Mechanical & Alternator Telemetry
                </h3>
              </div>
              <span className="text-xs font-mono text-[#00E676] flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                J1939 CANbus Synced
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Engine Speed</span>
                <div className="text-base font-bold text-white mt-1">1,500 RPM</div>
                <span className="text-[9px] text-slate-500">Isochronous Gov</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Alternator Volt</span>
                <div className="text-base font-bold text-white mt-1">480 V</div>
                <span className="text-[9px] text-[#00E676]">60.0 Hz</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Starter Battery</span>
                <div className="text-base font-bold text-[#00E676] mt-1">27.4 Vdc</div>
                <span className="text-[9px] text-slate-500">Trickle Ready</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Exhaust Temp</span>
                <div className="text-base font-bold text-white mt-1">410°C</div>
                <span className="text-[9px] text-slate-500">Turbo manifold</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Oil Level</span>
                <div className="text-base font-bold text-[#00E676] mt-1">OPTIMAL</div>
                <span className="text-[9px] text-slate-500">Sump sensor OK</span>
              </div>
              <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04]">
                <span className="text-[10px] uppercase text-slate-400">Crank Attempts</span>
                <div className="text-base font-bold text-white mt-1">1st Shot</div>
                <span className="text-[9px] text-[#00E676]">Auto-synced</span>
              </div>
            </div>
          </div>

          {/* O&M Service Countdown & Fuel Economics */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-[#FF6B00]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  Maintenance & Service Interval Tracking
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Cumulative Run Hours</span>
                  <span className="text-white font-bold">{runHours} hrs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Countdown to 250h Oil & Filter Service</span>
                  <span className="text-[#FFD600] font-bold">{nextServiceHours.toFixed(1)} hrs remaining</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Diesel Fuel Avoided by Solar/BESS</span>
                  <span className="text-[#00E676] font-bold">428 Liters (₹56,400 Saved today)</span>
                </div>
              </div>

              {/* Progress Bar to Service */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Lube Oil Service Interval</span>
                  <span className="text-[#00E676] font-bold">46% used</span>
                </div>
                <div className="h-2 w-full bg-[#121622] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E676] w-[46%]" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] border border-[#FF6B00]/20 font-mono text-xs space-y-1">
              <span className="font-bold text-[#FF6B00] flex items-center gap-1.5">
                <Activity className="size-3.5" />
                Microgrid Resilience Guaranteed
              </span>
              <p className="text-[11px] text-slate-400">
                In event of sudden grid blackout and depleted BESS reserve, DG controller initiates automated AMF cranking within 8.5 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </NeonAppShell>
  );
}
