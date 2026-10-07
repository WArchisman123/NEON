"use client";

import React, { useEffect } from "react";
import {
  Layers,
  Cpu,
  BarChart3,
  Grid3X3,
} from "lucide-react";

export type SolarTabType = "overview" | "mppt" | "modbus" | "heatmap";

interface SolarSubViewTabsProps {
  activeTab: SolarTabType;
  onTabChange: (tab: SolarTabType) => void;
}

export function SolarSubViewTabs({
  activeTab,
  onTabChange,
}: SolarSubViewTabsProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") as SolarTabType | null;
      if (tabParam && ["overview", "mppt", "modbus", "heatmap"].includes(tabParam)) {
        onTabChange(tabParam);
      }
    }
  }, [onTabChange]);

  const handleTabClick = (tab: SolarTabType) => {
    onTabChange(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const tabs: {
    id: SolarTabType;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: "overview",
      label: "Fleet Overview & Losses",
      sublabel: "IEC 61724 PR & Losses",
      icon: BarChart3,
    },
    {
      id: "mppt",
      label: "12-Channel MPPT Stack",
      sublabel: "Diurnal Overlay & 12 Trackers",
      icon: Layers,
      badge: "NEW",
    },
    {
      id: "modbus",
      label: "Modbus Register Map",
      sublabel: "Live Parameter SCADA",
      icon: Cpu,
      badge: "LIVE",
    },
    {
      id: "heatmap",
      label: "24-String Heatmap Matrix",
      sublabel: "5-min 2D Audit Grid",
      icon: Grid3X3,
    },
  ];

  return (
    <div className="w-full bg-theme-card border border-theme-subtle rounded-xl p-1.5 shadow-lg">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 min-w-[200px] sm:min-w-[220px] px-3.5 py-2.5 rounded-lg text-left transition-all font-mono min-h-[48px] flex items-center justify-between gap-2.5 ${
                isActive
                  ? "bg-[#FF2A85] text-white shadow-[0_0_15px_rgba(255,42,133,0.35)]"
                  : "bg-theme-muted text-theme-muted hover:text-theme-primary hover:bg-theme-muted/80 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`size-4 shrink-0 ${
                    isActive ? "text-white" : "text-theme-muted"
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate leading-tight">
                    {tab.label}
                  </div>
                  <div
                    className={`text-[10px] truncate leading-tight mt-0.5 ${
                      isActive ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {tab.sublabel}
                  </div>
                </div>
              </div>

              {tab.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.badge === "LIVE"
                      ? "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30"
                      : "bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/30"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
