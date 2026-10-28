"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LayoutGrid,
  Wrench,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmsTab, EmsTabId } from "@/lib/energy/ems-tab-context";

interface DesktopSidebarProps {
  className?: string;
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTab, setActiveTab } = useEmsTab();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("neon_sidebar_collapsed") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("neon_sidebar_collapsed", String(next));
    } catch {
      // ignore
    }
  };

  const isSiteEmsRoute = pathname === "/" || pathname.startsWith("/sites/");

  const emsSubsystems: {
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

  const platformLinks = [
    { name: "Fleet Cockpit", href: "/fleet", icon: LayoutGrid },
    { name: "Maintenance Hub", href: "/maintenance", icon: Wrench },
    { name: "Subscriptions", href: "/subscription", icon: CreditCard },
  ];

  const handleSubsystemClick = (id: EmsTabId) => {
    setActiveTab(id);
    if (!isSiteEmsRoute) {
      router.push("/");
    }
  };

  return (
    <aside
      className={cn(
        "shrink-0 bg-theme-card border-r border-theme-subtle flex flex-col justify-between transition-all duration-300 relative h-full overflow-y-auto no-scrollbar",
        isCollapsed ? "w-16 p-2" : "w-60 p-3.5",
        className
      )}
    >
      <div className="flex flex-col gap-3 min-w-0">
        {/* Header & Collapse Toggle */}
        <div
          className={cn(
            "flex items-center pb-2.5 border-b border-theme-subtle/50",
            isCollapsed ? "justify-center" : "justify-between px-1"
          )}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-2 rounded-full bg-[#00E676] animate-pulse shrink-0" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-theme-secondary truncate">
                Site Subsystems
              </span>
            </div>
          ) : (
            <span className="size-2 rounded-full bg-[#00E676] animate-pulse" />
          )}

          <button
            type="button"
            onClick={toggleCollapse}
            className="size-7 rounded-lg bg-theme-elevated hover:bg-theme-card border border-theme-subtle hover:border-[#FF2A85]/40 text-theme-secondary hover:text-[#FF2A85] flex items-center justify-center transition-all cursor-pointer shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>

        {/* 10 EMS Subsystem Navigation Buttons */}
        <nav className="flex flex-col gap-1 font-mono">
          {emsSubsystems.map((sub) => {
            const Icon = sub.icon;
            const isActive = isSiteEmsRoute && activeTab === sub.id;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSubsystemClick(sub.id)}
                className={cn(
                  "flex items-center rounded-lg text-xs font-semibold transition-all cursor-pointer group relative min-h-[38px]",
                  isCollapsed ? "justify-center p-2" : "justify-between px-2.5 py-2",
                  isActive
                    ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)] font-bold"
                    : "text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="size-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate text-left">{sub.label}</span>
                  )}
                </div>

                {!isCollapsed && sub.badge && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#FF2A85]/20 text-[#FF2A85]"
                    )}
                  >
                    {sub.badge}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <span className="absolute left-full ml-2 px-2.5 py-1 rounded bg-[#121622] light:bg-[#EAEFF8] text-theme-primary text-xs font-mono font-bold whitespace-nowrap shadow-xl border border-theme-subtle opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {sub.label} {sub.badge ? `(${sub.badge})` : ""}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Platform Tools (Fleet, Maintenance, Subscriptions) */}
      <div className="pt-3 border-t border-theme-subtle/50 flex flex-col gap-1 font-mono">
        {!isCollapsed && (
          <span className="text-[9px] uppercase tracking-wider text-theme-muted px-2.5 mb-1 font-bold">
            Platform Hub
          </span>
        )}

        {platformLinks.map((link) => {
          const Icon = link.icon;
          const isLinkActive = pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg text-xs font-semibold transition-all group relative min-h-[36px]",
                isCollapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-2",
                isLinkActive
                  ? "bg-theme-elevated text-[#FF2A85] border border-[#FF2A85]/30 font-bold"
                  : "text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{link.name}</span>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 rounded bg-[#121622] light:bg-[#EAEFF8] text-theme-primary text-xs font-mono font-bold whitespace-nowrap shadow-xl border border-theme-subtle opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {link.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
