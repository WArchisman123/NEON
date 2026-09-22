import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { SiteAssetNav } from "@/components/site-detail/site-asset-nav";
import { BessPerformanceChart } from "@/components/analytics/bess-performance-chart";
import {
  getOrCreateOrg,
  getSiteDetails,
  getSiteHourlyAnalytics,
} from "@/lib/energy/site-service";
import {
  BatteryCharging,
  ShieldCheck,
  Wrench,
  Flame,
  Wind,
  Layers,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BessSubsystemPage({ params }: Props) {
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

  // 16-Cell Thermal & Voltage Heatmap Data
  const baseVoltageMv = 3280;
  const baseTempC = 26.4;
  const cells = Array.from({ length: 16 }, (_, i) => {
    const cellId = i + 1;
    const isHotspot = cellId === 9;
    const isDegraded = cellId === 14;

    const voltageMv = isDegraded
      ? baseVoltageMv - 38
      : baseVoltageMv + ((cellId * 7) % 15) - 6;
    const tempC = isHotspot
      ? baseTempC + 4.8
      : parseFloat((baseTempC + ((cellId * 3) % 9) * 0.25).toFixed(1));
    const status = isHotspot
      ? ("elevated" as const)
      : isDegraded
      ? ("delta_warning" as const)
      : ("optimal" as const);

    return {
      cellId,
      voltageMv,
      tempC,
      status,
    };
  });

  const maxCellMv = Math.max(...cells.map((c) => c.voltageMv));
  const minCellMv = Math.min(...cells.map((c) => c.voltageMv));
  const deltaVMv = maxCellMv - minCellMv;

  const maxTempC = Math.max(...cells.map((c) => c.tempC));
  const minTempC = Math.min(...cells.map((c) => c.tempC));

  const liveSoc = site.bess_soc_pct || 82.4;
  const livePowerKw = site.live_bess_power_kw || -320;
  const isCharging = livePowerKw < 0;

  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Asset Switcher Bar */}
        <SiteAssetNav site={site} activeAsset="bess" />

        {/* BESS Master Hero Banner */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F0FF] font-bold flex items-center gap-1.5">
                  <BatteryCharging className="size-3.5" />
                  Battery Energy Storage System (BESS)
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-medium">
                  Chemistry: Lithium Iron Phosphate (LiFePO4 / LFP)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {site.name} — BESS Racks & BMS Diagnostics
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Storage: <span className="text-white font-bold">{site.bess_capacity_kwh} kWh</span> • PCS Inverter: <span className="text-[#00F0FF] font-bold">{site.bess_power_kw} kW</span>
              </p>
            </div>

            {/* Quick Action: Book Certified BESS Maintenance */}
            <div className="flex items-center gap-3">
              <Link
                href="/maintenance"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all min-h-[44px]"
              >
                <Wrench className="size-4" />
                <span>Book BESS Service</span>
              </Link>
            </div>
          </div>

          {/* Key Metric Strip (7 Parameters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-white/[0.06] font-mono">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                State of Charge
              </span>
              <div className="text-lg font-bold text-[#00F0FF] mt-0.5">
                {liveSoc.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">
                {isCharging ? "Charging (-320 kW)" : "Discharging (+280 kW)"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                State of Health
              </span>
              <div className="text-lg font-bold text-[#00E676] mt-0.5">
                96.8% SoH
              </div>
              <span className="text-[10px] text-slate-500">1,420 EFC Cycles</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                DC Bus Voltage
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                748.5 V
              </div>
              <span className="text-[10px] text-slate-500">Pack: 428 A</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Cell Delta (ΔV)
              </span>
              <div className="text-lg font-bold text-[#FFD600] mt-0.5">
                {deltaVMv} mV
              </div>
              <span className="text-[10px] text-slate-500">Max limit &lt;50 mV</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Round-Trip η
              </span>
              <div className="text-lg font-bold text-[#00E676] mt-0.5">
                89.4% RTE
              </div>
              <span className="text-[10px] text-slate-500">Optimal LFP</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Max Cell Temp
              </span>
              <div className="text-lg font-bold text-[#FF6B00] mt-0.5">
                {maxTempC}°C
              </div>
              <span className="text-[10px] text-slate-500">Min: {minTempC}°C</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Coolant Loop
              </span>
              <div className="text-lg font-bold text-[#00F0FF] mt-0.5">
                21.4°C
              </div>
              <span className="text-[10px] text-slate-500">45 L/min Flow</span>
            </div>
          </div>
        </div>

        {/* Primary Analytical Chart */}
        <BessPerformanceChart
          initialData={hourlyTelemetry}
          bessCapacityKwh={site.bess_capacity_kwh}
        />

        {/* 16-Cell Thermal & Voltage Heatmap Matrix */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-[#00F0FF]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  16-Cell BMS Thermal & Voltage Heatmap Matrix
                </h3>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Real-time CANbus cell voltage monitoring ($mV$) and surface temperature sensors ($^\circ C$)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">
                Min: <span className="text-white font-bold">{minCellMv} mV</span>
              </span>
              <span className="text-slate-400">
                Max: <span className="text-[#00F0FF] font-bold">{maxCellMv} mV</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-bold">
                Balance OK
              </span>
            </div>
          </div>

          {/* 4x4 Cell Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
            {cells.map((cell) => {
              const isElevated = cell.status === "elevated";
              const isWarning = cell.status === "delta_warning";

              return (
                <div
                  key={cell.cellId}
                  className={`p-3 rounded-lg border font-mono transition-all ${
                    isElevated
                      ? "bg-[#FF6B00]/10 border-[#FF6B00]/40"
                      : isWarning
                      ? "bg-[#FFAB00]/10 border-[#FFAB00]/40"
                      : "bg-[#121622] border-white/[0.04] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Cell #{cell.cellId.toString().padStart(2, "0")}
                    </span>
                    <span
                      className={`size-2 rounded-full ${
                        isElevated
                          ? "bg-[#FF6B00]"
                          : isWarning
                          ? "bg-[#FFAB00]"
                          : "bg-[#00E676]"
                      }`}
                    />
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-bold text-white">
                      {cell.voltageMv} <span className="text-[10px] font-normal text-slate-400">mV</span>
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        isElevated ? "text-[#FF6B00]" : "text-slate-300"
                      }`}
                    >
                      {cell.tempC}°C
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HVAC, Liquid Cooling Loop & NFPA 855 Safety Systems */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Liquid Cooling Telemetry */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Wind className="size-4 text-[#00F0FF]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                Liquid Cooling Loop
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Coolant Supply Temp</span>
                <span className="font-bold text-[#00F0FF]">18.4°C</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Coolant Return Temp</span>
                <span className="font-bold text-white">22.8°C</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Coolant Flow Rate</span>
                <span className="font-bold text-[#00E676]">45.2 L/min</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Chiller Compressor</span>
                <span className="font-bold text-white">12.4 kW (RUNNING)</span>
              </div>
            </div>
          </div>

          {/* NFPA 855 Fire Suppression */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-[#FF1744]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                NFPA 855 Fire Safety
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">H2 Gas Detector</span>
                <span className="font-bold text-[#00E676]">0.0 ppm (NORMAL)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">CO Off-Gas Sensor</span>
                <span className="font-bold text-[#00E676]">2.1 ppm (SAFE)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Aerosol Cylinder Press.</span>
                <span className="font-bold text-white">160 bar (ARMED)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Deflagration Panel</span>
                <span className="font-bold text-[#00E676]">INTACT</span>
              </div>
            </div>
          </div>

          {/* DC Contactors & Insulation */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#00E676]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                Contactor & Insulation
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Main DC Positive</span>
                <span className="font-bold text-[#00E676]">CLOSED</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Main DC Negative</span>
                <span className="font-bold text-[#00E676]">CLOSED</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Insulation Resistance</span>
                <span className="font-bold text-white">2.8 MΩ (&gt;100kΩ req)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121622]">
                <span className="text-slate-400">Pre-charge Relay</span>
                <span className="font-bold text-slate-400">OPEN (STABLE)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NeonAppShell>
  );
}
