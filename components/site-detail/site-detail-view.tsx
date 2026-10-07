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
  TreePine,
  Coins,
  FileSpreadsheet,
  Layers,
  Award,
  Cpu,
} from "lucide-react";
import { SiteRecord, SiteDeviceRecord, HourlyTelemetryRecord } from "@/lib/energy/types";
import { SchematicNodeFlow } from "@/components/energy-flow/schematic-node-flow";
import { EnergyFlowVisualizer } from "@/components/energy-flow/energy-flow-visualizer";
import { PowerConsumptionWorkspace } from "@/components/analytics/power-consumption-workspace";
import { DgrHorizontalReport } from "@/components/analytics/dgr-horizontal-report";
import { PlantGenerationComparativeHub } from "@/components/analytics/plant-generation-comparative-hub";
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
    "flow" | "dgr" | "comparative" | "analytics" | "alarms"
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

      {/* Site Master Hero Card (Competitor Benchmarked with Commissioning & Contract Targets) */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 relative overflow-hidden shadow-xl space-y-5">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />

        {/* 1. Top EPC Commissioning & Asset Ownership Strip (Matches ref_img_1) */}
        <div className="p-3 rounded-lg bg-theme-muted border border-theme-subtle flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-theme-primary">
              <span className="font-bold text-[#FFD600] flex items-center gap-1">
                <Sun className="size-3.5" />
                Plant AC: {currentSite.solar_capacity_kwp} kW
              </span>
              <span className="text-theme-muted">•</span>
              <span className="font-bold text-theme-primary">
                Plant DC: {currentSite.dc_capacity_kwp || Math.round(currentSite.solar_capacity_kwp * 1.06)} kWp
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                DC/AC: {((currentSite.dc_capacity_kwp || Math.round(currentSite.solar_capacity_kwp * 1.06)) / (currentSite.solar_capacity_kwp || 1)).toFixed(2)}
              </span>
              <span className="text-theme-muted">•</span>
              <span className="text-theme-muted">
                {currentSite.location_city}, {currentSite.location_state}
              </span>
            </div>
            <div className="text-[11px] text-theme-muted flex flex-wrap items-center gap-2">
              <span>Commissioned By: <strong className="text-theme-primary">{currentSite.commissioned_by || "Pratual Clean Energy EPC"}</strong></span>
              <span>•</span>
              <span>Date: <strong className="text-theme-primary">{currentSite.commissioned_date || "30-Apr-2024"}</strong></span>
              <span>•</span>
              <span>Subscription Expiry: <strong className="text-[#00E676]">{currentSite.warranty_expiry_date || "30-Apr-2027"}</strong></span>
            </div>
          </div>

          {/* Equipment Inventory Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded bg-theme-card border border-theme-subtle text-[11px] font-bold text-theme-primary">
              Inverters: <span className="text-[#FFD600]">{devices.filter((d) => d.category === "solar_inverter").length || 1}</span>
            </span>
            {currentSite.has_dg && (
              <span className="px-2.5 py-1 rounded bg-theme-card border border-theme-subtle text-[11px] font-bold text-theme-primary">
                DGs: <span className="text-[#FF6B00]">{devices.filter((d) => d.category === "diesel_generator").length || 1}</span>
              </span>
            )}
            {currentSite.has_bess && (
              <span className="px-2.5 py-1 rounded bg-theme-card border border-theme-subtle text-[11px] font-bold text-theme-primary">
                BESS: <span className="text-[#00F0FF]">1</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Site Title & Asset Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF2A85] font-bold">
                {currentSite.plant_type.replace("_", " ")}
              </span>
              <span className="text-theme-muted">•</span>
              <span className="text-xs text-theme-muted font-medium">
                {currentSite.location_city}, {currentSite.location_state}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-theme-primary tracking-tight mt-1">
              {currentSite.name}
            </h1>
            <p className="text-xs text-theme-muted mt-1 font-mono">
              Site ID: <span className="text-theme-secondary">{currentSite.id}</span>
            </p>
          </div>

          {/* Asset Badges & Capacities Strip */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {currentSite.has_solar && (
              <Link
                href={`/sites/${currentSite.id}/solar`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted hover:bg-theme-subtle border border-[#FFD600]/30 text-[#FFD600] transition-colors group"
              >
                <Sun className="size-3.5" />
                <span>{currentSite.solar_capacity_kwp} kWp Solar</span>
                <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {currentSite.has_bess && (
              <Link
                href={`/sites/${currentSite.id}/bess`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted hover:bg-theme-subtle border border-[#00F0FF]/30 text-[#00F0FF] transition-colors group"
              >
                <BatteryCharging className="size-3.5" />
                <span>{currentSite.bess_capacity_kwh} kWh BESS</span>
                <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {currentSite.has_dg && (
              <Link
                href={`/sites/${currentSite.id}/dg`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted hover:bg-theme-subtle border border-[#FF6B00]/30 text-[#FF6B00] transition-colors group"
              >
                <Flame className="size-3.5" />
                <span>{currentSite.dg_capacity_kva} kVA DG</span>
                <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {currentSite.has_grid && (
              <Link
                href={`/sites/${currentSite.id}/grid`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-muted hover:bg-theme-subtle border border-[#9D4EDD]/30 text-[#9D4EDD] transition-colors group"
              >
                <Zap className="size-3.5" />
                <span>{currentSite.contracted_demand_kva} kVA Grid MD</span>
                <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            <Link
              href={`/maintenance?siteId=${currentSite.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF2A85]/15 hover:bg-[#FF2A85]/25 border border-[#FF2A85]/50 text-theme-primary font-bold transition-all shadow-[0_0_12px_rgba(255,42,133,0.25)] group"
            >
              <Wrench className="size-3.5 text-[#FF2A85]" />
              <span>Schedule Certified O&amp;M</span>
              <ArrowUpRight className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* 3. Contractual Target Progress, Financial Revenue & Extended ESG (Matches ref_img_1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-theme-muted border border-theme-subtle font-mono text-xs">
          {/* Target Achieved Gauge */}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full border-4 border-[#00E676]/30 border-t-[#00E676] flex items-center justify-center font-bold text-xs text-[#00E676]">
              {Math.round(((currentSite.annual_achieved_mwh || 71) / (currentSite.annual_target_mwh || 105)) * 100)}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-theme-muted">Annual PPA Generation Target</div>
              <div className="text-sm font-bold text-theme-primary mt-0.5">
                {currentSite.annual_achieved_mwh || 71.07} / {currentSite.annual_target_mwh || 105.00} MWh
              </div>
              <div className="text-[10px] text-[#00E676] font-semibold mt-0.5">
                ● Target Achieved ({Math.round(((currentSite.annual_achieved_mwh || 71) / (currentSite.annual_target_mwh || 105)) * 100)}%)
              </div>
            </div>
          </div>

          {/* Revenue Gains in INR */}
          <div>
            <div className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
              <Coins className="size-3 text-[#FFD600]" />
              <span>Revenue Gains (Feed-in Tariff: ₹{currentSite.feed_in_tariff_inr || 8.25}/kWh)</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <span className="text-[10px] text-theme-muted block">Day</span>
                <span className="text-xs font-bold text-theme-primary">
                  ₹{Math.round((currentSite.solar_yield_today_kwh || 384) * (currentSite.feed_in_tariff_inr || 8.25)).toLocaleString()}
                </span>
              </div>
              <div className="border-l border-theme-subtle pl-3">
                <span className="text-[10px] text-theme-muted block">Month</span>
                <span className="text-xs font-bold text-theme-primary">
                  ₹{Math.round((currentSite.solar_yield_today_kwh || 384) * 26 * (currentSite.feed_in_tariff_inr || 8.25)).toLocaleString()}
                </span>
              </div>
              <div className="border-l border-theme-subtle pl-3">
                <span className="text-[10px] text-theme-muted block">Year</span>
                <span className="text-xs font-bold text-[#00E676]">
                  ₹{(Math.round((currentSite.solar_yield_today_kwh || 384) * 310 * (currentSite.feed_in_tariff_inr || 8.25)) / 100000).toFixed(2)} Lacs
                </span>
              </div>
            </div>
          </div>

          {/* Extended ESG: CO2, Coal Saved, Trees Planted */}
          <div>
            <div className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
              <TreePine className="size-3 text-[#00E676]" />
              <span>Environmental Compliance Offset</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <span className="text-[10px] text-theme-muted block">CO₂ Reduced</span>
                <span className="text-xs font-bold text-theme-primary">
                  {((currentSite.co2_saved_today_kg || 2530) / 1000).toFixed(1)}k Tons
                </span>
              </div>
              <div className="border-l border-theme-subtle pl-3">
                <span className="text-[10px] text-theme-muted block">Coal Saved</span>
                <span className="text-xs font-bold text-[#FFD600]">
                  {((currentSite.coal_saved_today_kg || 886) / 1000).toFixed(1)}k Tons
                </span>
              </div>
              <div className="border-l border-theme-subtle pl-3">
                <span className="text-[10px] text-theme-muted block">Trees Planted</span>
                <span className="text-xs font-bold text-[#00E676]">
                  {(currentSite.trees_planted_today || 11997).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Live Telemetry KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 border-t border-theme-subtle">
          <div>
            <div className="text-[10px] uppercase font-semibold text-theme-muted">
              Live Solar Generation
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#FFD600] mt-0.5">
              {(currentSite.solar_power_kw || currentSite.solar_capacity_kwp).toLocaleString()} kW
            </div>
            <div className="text-[10px] font-mono text-theme-muted">
              Today: {(currentSite.solar_yield_today_kwh || 384).toFixed(0)} kWh
            </div>
          </div>

          {currentSite.has_bess && (
            <div>
              <div className="text-[10px] uppercase font-semibold text-theme-muted">
                BESS Storage Flow
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#00F0FF] mt-0.5">
                {currentSite.live_bess_power_kw || 0} kW ({(currentSite.bess_soc_pct || 80).toFixed(1)}%)
              </div>
              <div className="text-[10px] font-mono text-theme-muted">
                State of Health: 98.4%
              </div>
            </div>
          )}

          {currentSite.has_dg && (
            <div>
              <div className="text-[10px] uppercase font-semibold text-theme-muted">
                DG Genset Controller
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#FF6B00] mt-0.5">
                {(currentSite.dg_fuel_pct || 90).toFixed(1)}% (STANDBY)
              </div>
              <div className="text-[10px] font-mono text-theme-muted">
                Live: {currentSite.dg_power_kw || 0} kW
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase font-semibold text-theme-muted">
              Net Grid Transfer
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#9D4EDD] mt-0.5">
              {(currentSite.grid_power_kw || -120).toLocaleString()} kW
            </div>
            <div className="text-[10px] font-mono text-theme-muted">
              Today Import: {(currentSite.grid_import_today_kwh || 0).toFixed(0)} kWh
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-theme-muted">
              Facility Demand
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#FF2A85] mt-0.5">
              {(currentSite.load_power_kw || 620).toLocaleString()} kW
            </div>
            <div className="text-[10px] font-mono text-theme-muted">
              Demand: {Math.round(((currentSite.load_power_kw || 620) / (currentSite.contracted_demand_kva || 800)) * 100)}% of MD
            </div>
          </div>
        </div>

        {/* 5. Today's Operational Performance Strip (Matches ref_img_1 "Today's Performance") */}
        <div className="p-3 rounded-lg bg-theme-muted border border-theme-subtle flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-[#FFD600]" />
            <span className="text-[11px] uppercase font-bold text-theme-primary">
              Today&apos;s Performance Telemetry:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-theme-muted">CUF:</span>
              <span className="font-bold text-[#00F0FF]">
                {(currentSite.cuf_pct || 16.01).toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-theme-muted">PR:</span>
              <span className="font-bold text-[#00E676]">81.4%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-theme-muted">Specific Yield:</span>
              <span className="font-bold text-[#FF2A85]">
                {(currentSite.specific_yield_kwh_per_kwp || 3.84).toFixed(2)} kWh/kWp
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-theme-muted">Peak Irradiance:</span>
              <span className="font-bold text-[#FFD600]">
                {currentSite.peak_irradiance_wm2 || 792.8} W/m²
              </span>
              <span className="text-[10px] text-theme-muted">
                ({currentSite.peak_irradiance_time || "12:45 PM"})
              </span>
            </div>

            {currentSite.has_dg && (
              <div className="flex items-center gap-1.5">
                <span className="text-theme-muted">PV-DG Saved:</span>
                <span className="font-bold text-[#00E676]">
                  {currentSite.pv_dg_fuel_saved_kwh || 69} kWh ({currentSite.pv_dg_fuel_saved_liters || 21}L fuel)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cyber Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-theme-subtle overflow-x-auto pb-px scrollbar-none gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("flow")}
            className={`px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "flow"
                ? "bg-theme-card text-[#FF2A85] border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                : "text-theme-muted hover:text-theme-primary border-transparent hover:bg-theme-muted"
            }`}
          >
            <Activity className="size-3.5" />
            <span>⚡ Energy Flow &amp; Topology</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dgr")}
            className={`px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "dgr"
                ? "bg-theme-card text-[#FF2A85] border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                : "text-theme-muted hover:text-theme-primary border-transparent hover:bg-theme-muted"
            }`}
          >
            <FileSpreadsheet className="size-3.5 text-[#00E676]" />
            <span>📋 DGR Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("comparative")}
            className={`px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "comparative"
                ? "bg-theme-card text-[#FF2A85] border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                : "text-theme-muted hover:text-theme-primary border-transparent hover:bg-theme-muted"
            }`}
          >
            <TrendingUp className="size-3.5 text-[#FFD600]" />
            <span>📈 Plant Generation &amp; 4-Quadrant</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "analytics"
                ? "bg-theme-card text-[#FF2A85] border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                : "text-theme-muted hover:text-theme-primary border-transparent hover:bg-theme-muted"
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
                ? "bg-theme-card text-[#FF2A85] border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                : "text-theme-muted hover:text-theme-primary border-transparent hover:bg-theme-muted"
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
          <div className="p-3 rounded-lg bg-theme-card border border-theme-subtle flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <span className="text-[11px] text-theme-muted font-bold uppercase">
              Component Deep-Dive Hubs:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {currentSite.has_solar && (
                <>
                  <Link
                    href={`/sites/${currentSite.id}/solar`}
                    className="px-2.5 py-1 rounded bg-[#FFD600]/10 hover:bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/30 transition-colors flex items-center gap-1 font-bold"
                  >
                    <Sun className="size-3" />
                    <span>Solar Hub ➔</span>
                  </Link>
                  <Link
                    href={`/sites/${currentSite.id}/solar?tab=mppt`}
                    className="px-2.5 py-1 rounded bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 transition-colors flex items-center gap-1 font-bold"
                  >
                    <Layers className="size-3" />
                    <span>12-MPPT Stack ➔</span>
                  </Link>
                  <Link
                    href={`/sites/${currentSite.id}/solar?tab=modbus`}
                    className="px-2.5 py-1 rounded bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30 transition-colors flex items-center gap-1 font-bold"
                  >
                    <Cpu className="size-3" />
                    <span>Modbus Registers ➔</span>
                  </Link>
                  <Link
                    href={`/sites/${currentSite.id}/solar?tab=heatmap`}
                    className="px-2.5 py-1 rounded bg-[#FF2A85]/10 hover:bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30 transition-colors flex items-center gap-1 font-bold"
                  >
                    <Layers className="size-3" />
                    <span>24-String Heatmap ➔</span>
                  </Link>
                </>
              )}
              {currentSite.has_bess && (
                <Link
                  href={`/sites/${currentSite.id}/bess`}
                  className="px-2.5 py-1 rounded bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 transition-colors flex items-center gap-1 font-bold"
                >
                  <BatteryCharging className="size-3" />
                  <span>BESS Hub ➔</span>
                </Link>
              )}
              {currentSite.has_grid && (
                <Link
                  href={`/sites/${currentSite.id}/grid`}
                  className="px-2.5 py-1 rounded bg-[#9D4EDD]/10 hover:bg-[#9D4EDD]/20 text-[#9D4EDD] border border-[#9D4EDD]/30 transition-colors flex items-center gap-1 font-bold"
                >
                  <Zap className="size-3" />
                  <span>Grid Hub ➔</span>
                </Link>
              )}
              {currentSite.has_dg && (
                <Link
                  href={`/sites/${currentSite.id}/dg`}
                  className="px-2.5 py-1 rounded bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 transition-colors flex items-center gap-1 font-bold"
                >
                  <Flame className="size-3" />
                  <span>DG Hub ➔</span>
                </Link>
              )}
              <Link
                href={`/sites/${currentSite.id}/load`}
                className="px-2.5 py-1 rounded bg-[#FF2A85]/10 hover:bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30 transition-colors flex items-center gap-1 font-bold"
              >
                <Factory className="size-3" />
                <span>Load Hub ➔</span>
              </Link>
            </div>
          </div>

          {/* 5-Node Direct Point-to-Point Flow Canvas */}
          <EnergyFlowVisualizer site={currentSite} />

          {/* Schematic Conduit View */}
          <SchematicNodeFlow site={currentSite} />

          {/* Meteorological Intelligence & BESS Automation Directives */}
          <SiteWeatherWidget site={currentSite} />

          {/* Hardware Bundle */}
          <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-[#FF2A85]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
                  Hardware Bundle ({devices.length} Devices)
                </h3>
              </div>
              <span className="text-xs font-mono text-theme-muted flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-[#00E676]" />
                Modbus RTU / TCP Synced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="p-3.5 rounded-lg bg-theme-muted border border-theme-subtle flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-theme-primary">
                      {device.name}
                    </div>
                    <div className="text-[11px] font-mono text-theme-muted">
                      {device.manufacturer} • {device.model}
                    </div>
                    <div className="text-[10px] font-mono text-theme-muted mt-1 uppercase">
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

      {/* 2. DAILY GENERATION REPORT (DGR) TAB (Matches ref_img_6 & ref_img_7) */}
      {activeTab === "dgr" && (
        <div className="space-y-6">
          <DgrHorizontalReport site={currentSite} />
        </div>
      )}

      {/* 3. PLANT GENERATION COMPARATIVE & 4-QUADRANT TAB (Matches ref_img_2 & ref_img_8) */}
      {activeTab === "comparative" && (
        <div className="space-y-6">
          <PlantGenerationComparativeHub site={currentSite} />
        </div>
      )}

      {/* 4. HISTORY AND POWER CONSUMPTION TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <PowerConsumptionWorkspace
            site={currentSite}
            hourlyTelemetry={hourlyTelemetry}
          />
        </div>
      )}

      {/* 4. ACTIVE ALARMS & EVENTS TAB */}
      {activeTab === "alarms" && (
        <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-[#FFAB00]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
                Site Fault &amp; Alarm Ticker ({siteAlarms.length} Active Events)
              </h3>
            </div>
            <span className="text-xs font-mono text-theme-muted">Real-Time SCADA Trap</span>
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
                      <span className="text-theme-primary font-bold">{alm.asset}</span>
                      <span className="text-theme-muted">•</span>
                      <span className="text-theme-muted font-bold">{alm.code}</span>
                    </div>
                    <p className="text-theme-secondary text-xs">{alm.message}</p>
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
