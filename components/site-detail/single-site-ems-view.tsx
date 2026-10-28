"use client";

import React from "react";
import {
  Activity,
  Zap,
  Sun,
  Gauge,
  BatteryCharging,
  Thermometer,
  Flame,
  LineChart,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";
import { SiteRecord, SiteDeviceRecord, HourlyTelemetryRecord } from "@/lib/energy/types";
import { useEmsTab, EmsTabId } from "@/lib/energy/ems-tab-context";
import { DashboardTab } from "./tabs/dashboard-tab";
import { EnergyFlowTab } from "./tabs/energy-flow-tab";
import { PcsManagementTab } from "./tabs/pcs-management-tab";
import { MeteringTab } from "./tabs/metering-tab";
import { BatteryHealthTab } from "./tabs/battery-health-tab";
import { ThermalManagementTab } from "./tabs/thermal-management-tab";
import { FireSafetyTab } from "./tabs/fire-safety-tab";
import { HistorianTab } from "./tabs/historian-tab";
import { ThresholdsLimitsTab } from "./tabs/thresholds-limits-tab";
import { ControlsScadaTab } from "./tabs/controls-scada-tab";

interface SingleSiteEmsViewProps {
  site: SiteRecord;
  sites?: SiteRecord[];
  devices?: SiteDeviceRecord[];
  hourlyTelemetry?: HourlyTelemetryRecord[];
}

export function SingleSiteEmsView({
  site,
}: SingleSiteEmsViewProps) {
  const { activeTab, setActiveTab } = useEmsTab();

  const tabs: {
    id: EmsTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "flow", label: "Energy Flow", icon: Zap },
    { id: "inverter", label: "PCS / Inverter", icon: Sun },
    { id: "metering", label: "Metering & SCADA", icon: Gauge, badge: "CORE" },
    { id: "bess", label: "Battery Health", icon: BatteryCharging },
    { id: "thermal", label: "Thermal Mgmt", icon: Thermometer },
    { id: "fire-safety", label: "Fire Safety", icon: Flame, badge: "NFPA 855" },
    { id: "historian", label: "Historian", icon: LineChart },
    { id: "thresholds", label: "Thresholds & Limits", icon: SlidersHorizontal },
    { id: "controls", label: "Controls & SCADA", icon: Terminal },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* =========================================================================
          Mobile Subsystem Dock (< 1024px)
          Allows quick touch navigation on phones/tablets where DesktopSidebar is hidden
          ========================================================================= */}
      <div className="lg:hidden flex items-center gap-1.5 p-1.5 rounded-xl bg-theme-elevated border border-theme-subtle overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer min-h-[44px] ${
                isActive
                  ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                  : "text-theme-secondary hover:text-theme-primary hover:bg-theme-card"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isActive ? "bg-white/20 text-white" : "bg-[#FF2A85]/20 text-[#FF2A85]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          Primary Viewport: Active Subsystem Tab Content (100% Width)
          ========================================================================= */}
      <div className="w-full">
        {activeTab === "dashboard" && <DashboardTab site={site} />}
        {activeTab === "flow" && <EnergyFlowTab site={site} />}
        {activeTab === "inverter" && <PcsManagementTab site={site} />}
        {activeTab === "metering" && <MeteringTab site={site} />}
        {activeTab === "bess" && <BatteryHealthTab site={site} />}
        {activeTab === "thermal" && <ThermalManagementTab site={site} />}
        {activeTab === "fire-safety" && <FireSafetyTab site={site} />}
        {activeTab === "historian" && <HistorianTab site={site} />}
        {activeTab === "thresholds" && <ThresholdsLimitsTab site={site} />}
        {activeTab === "controls" && <ControlsScadaTab site={site} />}
      </div>
    </div>
  );
}
