"use client";

import React from "react";
import { useOrganization } from "@clerk/nextjs";
import {
  Activity,
  Shield,
  TrendingDown,
  TrendingUp,
  Target,
  Calendar,
  Tag,
  Wallet,
  Coins,
  Radio,
  Sun,
  Server,
  Gauge,
  HeartPulse,
  BatteryCharging,
  Bell,
  Thermometer,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import { SystemTopologyVisualizer } from "@/components/energy-flow/system-topology-visualizer";
import { SystemVoltageChart } from "@/components/site-detail/charts/system-voltage-chart";
import { LoadVsCurrentChart } from "@/components/site-detail/charts/load-vs-current-chart";
import { CompanyBrandingBanner } from "@/components/site-detail/dashboard/company-branding-banner";
import { AnnualTargetCard } from "@/components/site-detail/dashboard/annual-target-card";
import { ThreeSourceYieldCard } from "@/components/site-detail/dashboard/three-source-yield-card";
import { SolarRevenueCard } from "@/components/site-detail/dashboard/solar-revenue-card";
import { InverterBreakdownCard } from "@/components/site-detail/dashboard/inverter-breakdown-card";
import { InverterAlarmCard } from "@/components/site-detail/dashboard/inverter-alarm-card";

interface DashboardTabProps {
  site: SiteRecord;
}

export function DashboardTab({ site }: DashboardTabProps) {
  const { organization: clerkOrg } = useOrganization();

  // Top 8 Financial Cards matching 01_dashboard_overview_financial.png
  const financialCards = [
    {
      label: "Energy Cost To...",
      val: "11.33 ₹",
      icon: (
        <div className="size-8 rounded-lg bg-emerald-500/10 text-[#00E676] flex items-center justify-center font-black text-sm shrink-0">
          ₹
        </div>
      ),
    },
    {
      label: "Savings Today",
      val: "120 ₹",
      icon: (
        <div className="size-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
          <Wallet className="size-4" />
        </div>
      ),
    },
    {
      label: "Monthly Savings",
      val: "3850 ₹",
      icon: (
        <div className="size-8 rounded-lg bg-emerald-500/10 text-[#00E676] flex items-center justify-center shrink-0">
          <Coins className="size-4" />
        </div>
      ),
    },
    {
      label: "Demand Char...",
      val: "980 ₹",
      icon: (
        <div className="size-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
          <TrendingDown className="size-4" />
        </div>
      ),
    },
    {
      label: "Arbitrary Reve...",
      val: "420 ₹",
      icon: (
        <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
          <TrendingUp className="size-4" />
        </div>
      ),
    },
    {
      label: "Projected ROI",
      val: "18.40 %",
      icon: (
        <div className="size-8 rounded-lg bg-pink-500/10 text-[#FF2A85] flex items-center justify-center shrink-0">
          <Target className="size-4" />
        </div>
      ),
    },
    {
      label: "Operating Ben...",
      val: "5200 ₹",
      icon: (
        <div className="size-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
          <Calendar className="size-4" />
        </div>
      ),
    },
    {
      label: "Tariff (AVG.)",
      val: "0.18 ₹/kWh",
      icon: (
        <div className="size-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
          <Tag className="size-4" />
        </div>
      ),
    },
  ];

  // Subsystem Status 8 Cards matching 01_dashboard_overview_financial.png
  const subsystemStatusCards = [
    {
      label: "Grid Status",
      val: "Connected",
      icon: <Radio className="size-4 text-theme-primary" />,
      color: "text-theme-primary font-bold",
    },
    {
      label: "Grid Power In",
      val: "76.87 kW",
      icon: <Sun className="size-4 text-[#FFD600]" />,
      color: "text-theme-primary font-bold",
    },
    {
      label: "System Status",
      val: "Charging",
      icon: <Server className="size-4 text-cyan-400" />,
      color: "text-cyan-400 font-bold",
    },
    {
      label: "Sys. Efficiency",
      val: "96.80 %",
      icon: <Gauge className="size-4 text-[#00E676]" />,
      color: "text-theme-primary font-bold",
    },
    {
      label: "System Health",
      val: "Normal",
      icon: <HeartPulse className="size-4 text-[#FF1744]" />,
      color: "text-[#00E676] font-bold",
    },
    {
      label: "Rem. Energy",
      val: "54 kWh",
      icon: <BatteryCharging className="size-4 text-[#00E676]" />,
      color: "text-theme-primary font-bold",
    },
    {
      label: "Critical Alerts",
      val: "0",
      icon: <Bell className="size-4 text-amber-400" />,
      color: "text-[#00E676] font-bold",
    },
    {
      label: "Ambient Temp.",
      val: "24.90 °C",
      icon: <Thermometer className="size-4 text-rose-400" />,
      color: "text-theme-primary font-bold",
    },
  ];

  return (
    <div className="flex flex-col gap-3.5 w-full font-mono animate-in fade-in-50 duration-200">
      {/* =========================================================================
          PHASE 1 UPGRADE: Dedicated Company Branding, Logo Slot & Site Header
          ========================================================================= */}
      <CompanyBrandingBanner
        site={site}
        companyName={clerkOrg?.name || "iRasus Technologies"}
        logoUrl={clerkOrg?.imageUrl || null}
      />

      {/* =========================================================================
          PHASE 1 UPGRADE: Annual Target Progress & Solar Generation Revenue (₹)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        <AnnualTargetCard site={site} className="h-full" />
        <SolarRevenueCard site={site} className="h-full" />
      </div>

      {/* =========================================================================
          PHASE 1 UPGRADE: 3-Source Energy Yield Matrix (Solar, Grid, DG in kWh)
          ========================================================================= */}
      <ThreeSourceYieldCard site={site} />

      {/* =========================================================================
          PHASE 1 UPGRADE: Inverter-Wise kW Breakdown & Inverter Alarm Supervisor
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        <InverterBreakdownCard site={site} className="h-full" />
        <InverterAlarmCard site={site} className="h-full" />
      </div>

      {/* =========================================================================
          1. Top Financial & TOU Arbitrage Strip (8 Compact Cards)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {financialCards.map((card, idx) => (
          <div
            key={idx}
            className="h-[54px] p-2 rounded-xl bg-theme-card border border-theme-subtle flex items-center gap-2 shadow-xs"
          >
            {card.icon}
            <div className="min-w-0 flex flex-col justify-center">
              <span className="text-[10px] text-theme-secondary truncate leading-none mb-1">
                {card.label}
              </span>
              <span className="text-xs font-black text-theme-primary truncate leading-none">
                {card.val}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          2. Main 3-Column Core (Synchronized Equal Height: 340px)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5 items-stretch">
        {/* Left Card: System Stats (DC Pack) */}
        <div className="h-[340px] p-3 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-theme-subtle/50">
            <div className="flex items-center gap-1.5">
              <Activity className="size-3.5 text-[#00E676]" />
              <h3 className="text-xs font-bold text-theme-primary uppercase">
                System Stats
              </h3>
            </div>
            <span className="text-[9px] text-theme-muted">
              Updated: 14 Jul, 2026, 12:09:08
            </span>
          </div>

          {/* Row 1: State of Charge (SoC) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-theme-secondary">State of Charge (SoC)</span>
              <span className="font-bold text-[#00E676]">21.60 %</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#00E676] rounded-full w-[21.6%]" />
            </div>
          </div>

          {/* Key-Value Telemetry Rows */}
          <div className="flex flex-col gap-1 text-[11px] divide-y divide-theme-subtle/25">
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Cycle Count</span>
              <span className="font-bold text-[#00E676]">10666 cycles</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Maximum Voltage</span>
              <span className="font-bold text-[#00E676]">3.08 v</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Average Voltage</span>
              <span className="font-bold text-[#00E676]">3.06 v</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Maximum Temperature</span>
              <span className="font-bold text-[#00E676]">38.80 °C</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Average Temperature</span>
              <span className="font-bold text-[#00E676]">35 °C</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Charge Overtemp</span>
              <span className="font-bold text-[#00E676]">0</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Cell Overvoltage</span>
              <span className="font-bold text-[#00E676]">0</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Pack Overvoltage</span>
              <span className="font-bold text-[#00E676]">0</span>
            </div>
          </div>
        </div>

        {/* Center: System Topology Visualizer (2 Columns, Height 340px) */}
        <div className="lg:col-span-2 h-[340px]">
          <SystemTopologyVisualizer site={site} className="h-full" />
        </div>

        {/* Right Card: Power Stats & Relays */}
        <div className="h-[340px] p-3 rounded-xl bg-theme-card border border-theme-subtle flex flex-col justify-between shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-theme-subtle/50">
            <div className="flex items-center gap-1.5">
              <Shield className="size-3.5 text-cyan-400" />
              <h3 className="text-xs font-bold text-theme-primary uppercase">
                Power Stats
              </h3>
            </div>
            <span className="text-[9px] text-theme-muted">
              Updated: 14 Jul, 2026, 12:09:08
            </span>
          </div>

          {/* Row 1: State of Health (SoH) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-theme-secondary">State of Health (SoH)</span>
              <span className="font-bold text-[#00E676]">98.30 %</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#00E676] rounded-full w-[98.3%]" />
            </div>
          </div>

          {/* Key-Value Telemetry Rows */}
          <div className="flex flex-col gap-1 text-[11px] divide-y divide-theme-subtle/25">
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Charged / Discharg...</span>
              <span className="font-bold text-theme-primary">107230.40 / 94567 Ah</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">High Side Contactor</span>
              <span className="font-bold text-[#00E676]">ON</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Low Side Contactor</span>
              <span className="font-bold text-[#00E676]">ON</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Pre-Charge Contactor</span>
              <span className="font-bold text-theme-muted">OFF</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">DC/DC Contactor</span>
              <span className="font-bold text-[#00E676]">ON</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Discharge Overtemp</span>
              <span className="font-bold text-[#00E676]">0</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Short Circuit</span>
              <span className="font-bold text-[#00E676]">0</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-theme-secondary">Voltage Difference</span>
              <span className="font-bold text-[#00E676]">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. Subsystem Status Strip (8 Compact Cards Directly Below)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {subsystemStatusCards.map((card, idx) => (
          <div
            key={idx}
            className="h-[52px] p-2 rounded-xl bg-theme-card border border-theme-subtle flex items-center gap-2 shadow-xs"
          >
            <div className="size-7 rounded-lg bg-theme-elevated flex items-center justify-center shrink-0">
              {card.icon}
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <span className="text-[10px] text-theme-secondary truncate leading-none mb-1">
                {card.label}
              </span>
              <span className={`text-xs truncate leading-none ${card.color}`}>
                {card.val}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          4. Bottom Analytical Waveforms: System Voltage & Load vs. Current Draw
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pb-4">
        <SystemVoltageChart currentVoltage={489.6} />
        <LoadVsCurrentChart currentA={-151.7} loadKw={112.4} />
      </div>
    </div>
  );
}
