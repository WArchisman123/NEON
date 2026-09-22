"use client";

import React, { useState } from "react";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { SwatchCard } from "@/components/design-system/swatch-card";
import { FleetAggregateStrip } from "@/components/design-system/fleet-aggregate-strip";
import {
  SiteCockpitCard,
  SiteData,
} from "@/components/design-system/site-cockpit-card-preview";
import { EnergyFlowPreview } from "@/components/design-system/energy-flow-preview";
import { TelemetryWidgetsShowcase } from "@/components/design-system/telemetry-widgets";
import { MaintenanceCatalogPreview } from "@/components/design-system/maintenance-catalog-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Palette,
  Type,
  Component,
  Activity,
  Zap,
  Wrench,
  Search,
  Sparkles,
} from "lucide-react";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<string>("tokens");

  // Core Swatches from ui_doc.md Section 1.1
  const swatches = [
    {
      name: "Void Black",
      hex: "#060709",
      tailwind: "bg-[#060709]",
      role: "Page background, root full-screen canvas wrapper",
      textColor: "text-slate-300",
      border: "border border-white/[0.15]",
    },
    {
      name: "Obsidian Card",
      hex: "#0B0D13",
      tailwind: "bg-[#0B0D13]",
      role: "Dashboard cards, telemetry containers, table rows",
      textColor: "text-slate-300",
      border: "border border-white/[0.15]",
    },
    {
      name: "Elevated Surface",
      hex: "#121622",
      tailwind: "bg-[#121622]",
      role: "Modals, slide-over telemetry drawers, dropdowns",
      textColor: "text-slate-300",
      border: "border border-white/[0.15]",
    },
    {
      name: "Neon Pink",
      hex: "#FF2A85",
      tailwind: "bg-[#FF2A85] / text-[#FF2A85]",
      role: "Brand Primary CTA, active nav glow, Load node",
      textColor: "text-white",
      glowClass: "glow-pink",
    },
    {
      name: "Solar Amber",
      hex: "#FFD600",
      tailwind: "bg-[#FFD600] / text-[#FFD600]",
      role: "Solar PV active power, irradiance, yield charts",
      textColor: "text-black",
      glowClass: "glow-yellow",
    },
    {
      name: "BESS Cyan",
      hex: "#00F0FF",
      tailwind: "bg-[#00F0FF] / text-[#00F0FF]",
      role: "Battery storage, SoC gauge, charge/discharge flow",
      textColor: "text-black",
      glowClass: "glow-cyan",
    },
    {
      name: "Grid Violet",
      hex: "#9D4EDD",
      tailwind: "bg-[#9D4EDD] / text-[#9D4EDD]",
      role: "Utility grid interconnection, import/export meters",
      textColor: "text-white",
      glowClass: "glow-purple",
    },
    {
      name: "DG Hi-Viz Orange",
      hex: "#FF6B00",
      tailwind: "bg-[#FF6B00] / text-[#FF6B00]",
      role: "Diesel generator backup, engine running state",
      textColor: "text-white",
      glowClass: "glow-orange",
    },
    {
      name: "Online Green",
      hex: "#00E676",
      tailwind: "bg-[#00E676] / text-[#00E676]",
      role: "Plant healthy, telemetry connected, normal state",
      textColor: "text-black",
      glowClass: "glow-green",
    },
    {
      name: "Warning Amber",
      hex: "#FFAB00",
      tailwind: "bg-[#FFAB00] / text-[#FFAB00]",
      role: "Derating, minor cell delta-V, string soiling alert",
      textColor: "text-black",
    },
    {
      name: "Critical Alarm",
      hex: "#FF1744",
      tailwind: "bg-[#FF1744] / text-[#FF1744]",
      role: "Tripped contactor, thermal runaway, plant offline",
      textColor: "text-white",
    },
    {
      name: "Active Pink Glass",
      hex: "#FF2A85",
      tailwind: "border-[#FF2A85]/40",
      role: "Card active hover border, selected input halo",
      textColor: "text-white",
      glowClass: "glow-border-pink",
    },
  ];

  // Mock sites for SiteCockpitCard demonstration
  const mockSites: SiteData[] = [
    {
      id: "site-01",
      name: "Apex Solar & BESS Hub 01",
      location_city: "Bakersfield",
      location_state: "CA",
      status: "ONLINE",
      has_solar: true,
      has_bess: true,
      has_grid: true,
      has_dg: false,
      solar_capacity_kwp: 1200,
      bess_capacity_kwh: 2400,
      contracted_demand_kva: 1500,
      live_solar_kw: 940,
      bess_soc_pct: 84.2,
      grid_power_kw: 320,
      grid_import_today_kwh: 2450,
      grid_export_today_kwh: 1100,
      bess_charge_today_kwh: 1200,
      bess_discharge_today_kwh: 850,
      load_kw: 620,
      load_consumption_today_kwh: 5800,
      daily_yield_kwh: 4820,
      co2_saved_today_kg: 3470,
    },
    {
      id: "site-02",
      name: "Mojave Microgrid Alpha",
      location_city: "Barstow",
      location_state: "CA",
      status: "ONLINE",
      has_solar: true,
      has_bess: true,
      has_grid: true,
      has_dg: true,
      solar_capacity_kwp: 2000,
      bess_capacity_kwh: 4000,
      contracted_demand_kva: 2500,
      dg_capacity_kva: 1000,
      live_solar_kw: 1450,
      bess_soc_pct: 71.0,
      grid_power_kw: 210,
      grid_import_today_kwh: 1850,
      grid_export_today_kwh: 3400,
      bess_charge_today_kwh: 2100,
      bess_discharge_today_kwh: 1600,
      dg_running: true,
      dg_power_kw: 150,
      dg_fuel_pct: 85.0,
      dg_yield_today_kwh: 450,
      load_kw: 1180,
      load_consumption_today_kwh: 8900,
      daily_yield_kwh: 7390,
      co2_saved_today_kg: 5320,
    },
  ];

  const tabs = [
    { id: "tokens", label: "Colors & Tokens", icon: Palette },
    { id: "typography", label: "Typography & Monospace", icon: Type },
    { id: "controls", label: "Buttons & Inputs", icon: Component },
    { id: "fleet", label: "Fleet & Site Cards", icon: Activity },
    { id: "flow", label: "5-Node Energy Flow", icon: Zap },
    { id: "telemetry", label: "Subsystem Telemetry", icon: Sparkles },
    { id: "maintenance", label: "Maintenance Hub", icon: Wrench },
  ];

  return (
    <NeonAppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-[#FF2A85] to-[#790038] flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(255,42,133,0.5)]">
                ⚡
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                  Neon Energy Design System
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Industrial Cyber Black Neon / Pink Living Component Specification
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121622] text-[11px] font-mono font-bold text-[#00E676] border border-[#00E676]/30">
              <span className="size-2 rounded-full bg-[#00E676] animate-pulse" />
              v1.0.0 Production Spec
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FF2A85]/10 text-[11px] font-mono font-bold text-[#FF2A85] border border-[#FF2A85]/30">
              Zero Light Mode
            </span>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/[0.06]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer select-none min-h-[44px] ${
                  isActive
                    ? "bg-[#FF2A85] text-white shadow-[0_0_15px_rgba(255,42,133,0.45)] border border-[#FF2A85]"
                    : "bg-[#0B0D13] text-slate-400 hover:text-white hover:bg-[#121622] border border-white/[0.08]"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT 1: COLORS & TOKENS */}
        {activeTab === "tokens" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                1. Cyberpunk Color Palette & Tokens
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Deep void blacks, obsidian glassmorphism, and radiant neon luminescence optimized for high ambient sunlight legibility.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {swatches.map((s) => (
                <SwatchCard key={s.name} {...s} />
              ))}
            </div>

            {/* Custom Glow Utilities Demonstration */}
            <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Glow Shadow Utilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#121622] border border-[#FF2A85]/50 glow-pink text-center">
                  <div className="text-xs font-mono font-bold text-[#FF2A85]">.glow-pink</div>
                  <div className="text-[10px] text-slate-400 mt-1">Brand CTA & Load Node</div>
                </div>

                <div className="p-4 rounded-xl bg-[#121622] border border-[#00F0FF]/50 glow-cyan text-center">
                  <div className="text-xs font-mono font-bold text-[#00F0FF]">.glow-cyan</div>
                  <div className="text-[10px] text-slate-400 mt-1">BESS Storage & SoC</div>
                </div>

                <div className="p-4 rounded-xl bg-[#121622] border border-[#FFD600]/50 glow-yellow text-center">
                  <div className="text-xs font-mono font-bold text-[#FFD600]">.glow-yellow</div>
                  <div className="text-[10px] text-slate-400 mt-1">Solar PV Generation</div>
                </div>

                <div className="p-4 rounded-xl bg-[#121622] glow-border-pink text-center">
                  <div className="text-xs font-mono font-bold text-white">.glow-border-pink</div>
                  <div className="text-[10px] text-slate-400 mt-1">Selected Card Inset Ring</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB CONTENT 2: TYPOGRAPHY & MONOSPACE */}
        {activeTab === "typography" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                2. Typography & Monospace Precision Rules
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                To convey industrial control-room legibility, all electrical metrics (<code className="text-[#FF2A85]">kW, MW, V, A, Hz, %, kWh, °C</code>) strictly adhere to <code className="text-[#00F0FF]">font-mono</code>.
              </p>
            </div>

            <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] divide-y divide-white/[0.06]">
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="w-56 text-xs text-slate-400 uppercase font-semibold">
                  Fleet KPI Mega Value
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                  3,420.5 <span className="text-sm font-normal text-slate-400">kW</span>
                </div>
                <code className="text-[10px] font-mono text-slate-500 bg-[#121622] px-2 py-1 rounded">
                  text-3xl font-black font-mono tracking-tight text-white
                </code>
              </div>

              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="w-56 text-xs text-slate-400 uppercase font-semibold">
                  Card Telemetry Value
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  84.2% <span className="text-xs font-normal text-slate-400">SoC</span>
                </div>
                <code className="text-[10px] font-mono text-slate-500 bg-[#121622] px-2 py-1 rounded">
                  text-2xl font-bold font-mono text-white
                </code>
              </div>

              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="w-56 text-xs text-slate-400 uppercase font-semibold">
                  Secondary Readout
                </div>
                <div className="text-sm sm:text-base font-semibold font-mono text-slate-300">
                  50.02 Hz • 415.2 V • 0.98 PF
                </div>
                <code className="text-[10px] font-mono text-slate-500 bg-[#121622] px-2 py-1 rounded">
                  text-base font-semibold font-mono text-slate-300
                </code>
              </div>

              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="w-56 text-xs text-slate-400 uppercase font-semibold">
                  Section Heading
                </div>
                <div className="text-base sm:text-lg font-bold text-white tracking-tight uppercase">
                  BESS BMS Rack 01 Thermal Gradient
                </div>
                <code className="text-[10px] font-mono text-slate-500 bg-[#121622] px-2 py-1 rounded">
                  text-lg font-bold text-white uppercase tracking-tight
                </code>
              </div>

              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="w-56 text-xs text-slate-400 uppercase font-semibold">
                  Field / Unit Label
                </div>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Instantaneous Active Generation
                </div>
                <code className="text-[10px] font-mono text-slate-500 bg-[#121622] px-2 py-1 rounded">
                  text-xs font-semibold uppercase tracking-wider text-slate-400
                </code>
              </div>
            </div>
          </section>
        )}

        {/* TAB CONTENT 3: BUTTONS & INPUTS */}
        {activeTab === "controls" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                3. Buttons, Badges & Form Controls
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Touch-safe ergonomic primitives with minimum 44px mobile height and glowing active states.
              </p>
            </div>

            <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-6">
              {/* Button Variants */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Button Variants
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Brand Action</Button>
                  <Button variant="secondary">Secondary Glass</Button>
                  <Button variant="destructive">Emergency Trip / E-Stop</Button>
                  <Button variant="outline">Outline Action</Button>
                  <Button variant="ghost">Ghost Link</Button>
                </div>
              </div>

              {/* Status Badges */}
              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Status & Asset Badges
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="online" pulsing>
                    Online / Connected
                  </Badge>
                  <Badge variant="warning">Derating Warning</Badge>
                  <Badge variant="critical">Tripped Contactor</Badge>
                  <Badge variant="solar">Solar PV</Badge>
                  <Badge variant="bess">BESS Storage</Badge>
                  <Badge variant="grid">Grid Intertie</Badge>
                  <Badge variant="dg">DG Genset</Badge>
                  <Badge variant="brand">Enterprise Tier</Badge>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 pt-4 border-t border-white/[0.06] max-w-xl">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Search & Form Input Controls
                </h3>
                <Input
                  icon={<Search className="size-4" />}
                  placeholder="Search inverters, serial numbers, alarms (e.g. INV-04)..."
                />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Input type="number" placeholder="Set SoC Target %" defaultValue={85} />
                  <Input type="text" placeholder="Modbus IP Address" defaultValue="192.168.1.120" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB CONTENT 4: FLEET & SITE CARDS */}
        {activeTab === "fleet" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                4. Fleet Aggregate Strip & Site Cockpit Cards
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                The 5-metric glowing fleet aggregate strip and obsidian site cards from Screen 1.
              </p>
            </div>

            {/* 5-Metric Strip */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Fleet 5-Metric Aggregation Strip
              </h3>
              <FleetAggregateStrip />
            </div>

            {/* Site Cards Grid */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Site Cockpit Card Grid
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockSites.map((site) => (
                  <SiteCockpitCard key={site.id} site={site} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB CONTENT 5: 5-NODE ENERGY FLOW */}
        {activeTab === "flow" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                5. 5-Node Interactive Energy Flow Visualizer
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Animated electrical power transfer canvas connecting Solar PV, BESS, Grid, DG, and Facility Load.
              </p>
            </div>

            <EnergyFlowPreview />
          </section>
        )}

        {/* TAB CONTENT 6: TELEMETRY DRAWERS */}
        {activeTab === "telemetry" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                6. Component Telemetry Drawers & Heatmaps
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                16-cell BESS thermal heatmap matrix, cell delta-V indicator, and Solar MPPT string current table.
              </p>
            </div>

            <TelemetryWidgetsShowcase />
          </section>
        )}

        {/* TAB CONTENT 7: MAINTENANCE HUB */}
        {activeTab === "maintenance" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                7. Certified Solar & BESS Maintenance Engine
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Specialized service catalog packages exclusively for Solar PV and BESS assets, with 4-step scheduling wizard.
              </p>
            </div>

            <MaintenanceCatalogPreview />
          </section>
        )}
      </div>
    </NeonAppShell>
  );
}
