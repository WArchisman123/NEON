"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  BatteryCharging,
  Zap,
  Flame,
  Factory,
  ChevronLeft,
  Server,
  Activity,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Wrench,
  CreditCard,
} from "lucide-react";
import { SiteRecord, SiteDeviceRecord, HourlyTelemetryRecord } from "@/lib/energy/types";
import { SchematicNodeFlow } from "@/components/energy-flow/schematic-node-flow";
import { EnergyFlowVisualizer } from "@/components/energy-flow/energy-flow-visualizer";
import { PowerConsumptionWorkspace } from "@/components/analytics/power-consumption-workspace";
import { RenewalSubscriptionModal } from "@/components/subscription/renewal-subscription-modal";
import { SiteWeatherWidget } from "@/components/weather/site-weather-widget";
import { Button } from "@/components/ui/button";

interface SiteDetailViewProps {
  site: SiteRecord;
  devices: SiteDeviceRecord[];
  hourlyTelemetry: HourlyTelemetryRecord[];
}

export function SiteDetailView({
  site,
  devices,
  hourlyTelemetry,
}: SiteDetailViewProps) {
  const [currentSite, setCurrentSite] = useState(site);
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "flow" | "analytics" | "alarms"
  >("flow");

  // Simulated alarms for this site
  const siteAlarms = [
    {
      id: "alm-1",
      severity: "warning" as const,
      asset: "Solar PV Subsystem",
      code: "STR_MISMATCH_WARN",
      message: "MPPT String #07 current output 32% below peer array average (soiling alert)",
      timestamp: "12m ago",
      acknowledged: false,
    },
    {
      id: "alm-2",
      severity: "info" as const,
      asset: "BESS BMS Subsystem",
      code: "BMS_CELL_BAL_COMPLETED",
      message: "Passive cell voltage balancing cycle successfully completed (delta V: 14 mV)",
      timestamp: "1h 45m ago",
      acknowledged: true,
    },
    {
      id: "alm-3",
      severity: "info" as const,
      asset: "Utility Grid Intertie",
      code: "TOU_PEAK_ENTERED",
      message: "Switched to Peak TOU tariff slot (₹8.50/kWh); BESS peak-shaving dispatch engaged",
      timestamp: "2h 10m ago",
      acknowledged: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Online Badge */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-[#FF2A85] transition-colors group"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Fleet Cockpit</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-bold">{site.name}</span>
        </Link>

        {currentSite.subscription_status === "expired" ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="size-3" />
            EXPIRED LICENSE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/25">
            <span className="size-1.5 rounded-full bg-[#00E676] animate-pulse" />
            {currentSite.status.toUpperCase()}
          </span>
        )}
      </div>

      {/* Expired Subscription Warning Banner */}
      {currentSite.subscription_status === "expired" && (
        <div className="p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertTriangle className="size-5 shrink-0 text-amber-400" />
            <div>
              <strong className="text-amber-200 block sm:inline">Telemetry Feed Suspended: </strong>
              <span>This site subscription has expired. Live Modbus ingestion and automated dispatch optimization are paused.</span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRenewalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-8 px-4 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0"
          >
            <CreditCard className="size-3.5 mr-1.5" />
            Renew Subscription Now
          </Button>
        </div>
      )}

      {/* Site Master Hero Card */}
      <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF2A85] font-bold">
                {site.plant_type.replace("_", " ")}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-medium">
                {site.location_city}, {site.location_state}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {site.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Site ID: <span className="text-slate-300">{site.id}</span>
            </p>
          </div>

          {/* Asset Badges & Capacities Strip */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {site.has_solar && (
              <Link
                href={`/sites/${site.id}/solar`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2030] border border-[#FFD600]/30 text-[#FFD600] transition-colors group"
              >
                <Sun className="size-3.5" />
                <span>{site.solar_capacity_kwp} kWp Solar</span>
                <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {site.has_bess && (
              <Link
                href={`/sites/${site.id}/bess`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2030] border border-[#00F0FF]/30 text-[#00F0FF] transition-colors group"
              >
                <BatteryCharging className="size-3.5" />
                <span>{site.bess_capacity_kwh} kWh BESS</span>
                <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {site.has_dg && (
              <Link
                href={`/sites/${site.id}/dg`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2030] border border-[#FF6B00]/30 text-[#FF6B00] transition-colors group"
              >
                <Flame className="size-3.5" />
                <span>{site.dg_capacity_kva} kVA DG</span>
                <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {site.has_grid && (
              <Link
                href={`/sites/${site.id}/grid`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2030] border border-[#9D4EDD]/30 text-[#9D4EDD] transition-colors group"
              >
                <Zap className="size-3.5" />
                <span>{site.contracted_demand_kva} kVA Grid MD</span>
                <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            <Link
              href={`/sites/${site.id}/load`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2030] border border-[#FF2A85]/30 text-[#FF2A85] transition-colors group"
            >
              <Factory className="size-3.5" />
              <span>Facility Load Hub</span>
              <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href={`/maintenance?siteId=${site.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF2A85]/15 hover:bg-[#FF2A85]/25 border border-[#FF2A85]/50 text-white font-bold transition-all shadow-[0_0_12px_rgba(255,42,133,0.25)] group"
            >
              <Wrench className="size-3.5 text-[#FF2A85]" />
              <span>Schedule Certified O&amp;M</span>
              <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Live Telemetry KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/[0.06]">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              Live Solar Generation
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#FFD600] mt-0.5">
              {(site.solar_power_kw || site.solar_capacity_kwp).toLocaleString()} kW
            </div>
          </div>

          {site.has_bess && (
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">
                BESS Storage Flow
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#00F0FF] mt-0.5">
                {site.live_bess_power_kw || 0} kW ({(site.bess_soc_pct || 80).toFixed(1)}%)
              </div>
            </div>
          )}

          {site.has_dg && (
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">
                DG Fuel Level
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#FF6B00] mt-0.5">
                {(site.dg_fuel_pct || 90).toFixed(1)}% (STANDBY)
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              Net Grid Transfer
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#9D4EDD] mt-0.5">
              {(site.grid_power_kw || -120).toLocaleString()} kW
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              Facility Load
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#FF2A85] mt-0.5">
              {(site.load_power_kw || 620).toLocaleString()} kW
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] overflow-x-auto pb-px scrollbar-none gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("flow")}
            className={`px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "flow"
                ? "bg-[#121622] text-[#FF2A85] border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.02]"
            }`}
          >
            <Activity className="size-3.5" />
            <span>⚡ Energy Flow & Topology</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "analytics"
                ? "bg-[#121622] text-[#FF2A85] border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.02]"
            }`}
          >
            <TrendingUp className="size-3.5" />
            <span>📊 History and analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("alarms")}
            className={`px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "alarms"
                ? "bg-[#121622] text-[#FF2A85] border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                : "text-slate-400 hover:text-white border-transparent hover:bg-white/[0.02]"
            }`}
          >
            <AlertTriangle className="size-3.5" />
            <span>🚨 Active Alarms ({siteAlarms.length})</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. ENERGY FLOW & TOPOLOGY TAB */}
      {activeTab === "flow" && (
        <div className="space-y-6">
          {/* Quick-Pill Shortcut Bar to Sub-pages */}
          <div className="p-3 rounded-lg bg-[#0B0D13] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <span className="text-[11px] text-slate-400 font-bold uppercase">
              Component Deep-Dive Hubs:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {site.has_solar && (
                <Link
                  href={`/sites/${site.id}/solar`}
                  className="px-2.5 py-1 rounded bg-[#FFD600]/10 hover:bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/30 transition-colors flex items-center gap-1 font-bold"
                >
                  <Sun className="size-3" />
                  <span>Solar Hub ➔</span>
                </Link>
              )}
              {site.has_bess && (
                <Link
                  href={`/sites/${site.id}/bess`}
                  className="px-2.5 py-1 rounded bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 transition-colors flex items-center gap-1 font-bold"
                >
                  <BatteryCharging className="size-3" />
                  <span>BESS Hub ➔</span>
                </Link>
              )}
              {site.has_grid && (
                <Link
                  href={`/sites/${site.id}/grid`}
                  className="px-2.5 py-1 rounded bg-[#9D4EDD]/10 hover:bg-[#9D4EDD]/20 text-[#9D4EDD] border border-[#9D4EDD]/30 transition-colors flex items-center gap-1 font-bold"
                >
                  <Zap className="size-3" />
                  <span>Grid Hub ➔</span>
                </Link>
              )}
              {site.has_dg && (
                <Link
                  href={`/sites/${site.id}/dg`}
                  className="px-2.5 py-1 rounded bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 transition-colors flex items-center gap-1 font-bold"
                >
                  <Flame className="size-3" />
                  <span>DG Hub ➔</span>
                </Link>
              )}
              <Link
                href={`/sites/${site.id}/load`}
                className="px-2.5 py-1 rounded bg-[#FF2A85]/10 hover:bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30 transition-colors flex items-center gap-1 font-bold"
              >
                <Factory className="size-3" />
                <span>Load Hub ➔</span>
              </Link>
            </div>
          </div>

          {/* 5-Node Direct Point-to-Point Flow Canvas */}
          <EnergyFlowVisualizer site={site} />

          {/* Schematic Conduit View */}
          <SchematicNodeFlow site={site} />

          {/* Meteorological Intelligence & BESS Automation Directives */}
          <SiteWeatherWidget site={currentSite} />

          {/* Hardware Bundle */}
          <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-[#FF2A85]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  Hardware Bundle ({devices.length} Devices)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-[#00E676]" />
                Modbus RTU / TCP Synced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">
                      {device.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {device.manufacturer} • {device.model}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
                      Type: {device.category.replace("_", " ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                    <Activity className="size-3" />
                    ONLINE
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. HISTORY AND ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <PowerConsumptionWorkspace
            site={site}
            hourlyTelemetry={hourlyTelemetry}
          />
        </div>
      )}

      {/* 4. ACTIVE ALARMS & EVENTS TAB */}
      {activeTab === "alarms" && (
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-[#FFAB00]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                Site Fault & Alarm Ticker ({siteAlarms.length} Active Events)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Real-Time SCADA Trap</span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {siteAlarms.map((alm) => {
              const isWarning = alm.severity === "warning";

              return (
                <div
                  key={alm.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isWarning
                            ? "bg-[#FFAB00]/15 text-[#FFAB00] border border-[#FFAB00]/30"
                            : "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
                        }`}
                      >
                        {alm.severity}
                      </span>
                      <span className="text-white font-bold">{alm.asset}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-bold">{alm.code}</span>
                    </div>
                    <p className="text-slate-300 text-xs">{alm.message}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="size-3" />
                      {alm.timestamp}
                    </span>
                    {alm.acknowledged ? (
                      <span className="text-[#00E676] text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        ACKNOWLEDGED
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded bg-[#FFAB00]/15 hover:bg-[#FFAB00]/25 text-[#FFAB00] border border-[#FFAB00]/30 text-[10px] font-bold transition-colors"
                      >
                        ACKNOWLEDGE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Renewal Subscription Modal */}
      <RenewalSubscriptionModal
        site={currentSite}
        isOpen={isRenewalOpen}
        onClose={() => setIsRenewalOpen(false)}
        onRenewSuccess={() => {
          setCurrentSite((prev) => ({
            ...prev,
            subscription_status: "active",
            status: "online",
          }));
        }}
      />
    </div>
  );
}
