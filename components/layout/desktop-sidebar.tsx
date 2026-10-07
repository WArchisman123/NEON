"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Wrench,
  Palette,
  Settings,
  Radio,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  className?: string;
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Fleet Cockpit", href: "/", icon: LayoutDashboard },
    { name: "Analytics & Yield", href: "/analytics", icon: BarChart3 },
    { name: "Subscriptions", href: "/subscription", icon: CreditCard },
    { name: "Maintenance Hub", href: "/maintenance", icon: Wrench },
    { name: "Design System", href: "/design-system", icon: Palette },
    { name: "System Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "w-60 shrink-0 bg-theme-card border-r border-theme-subtle flex flex-col justify-between p-4 transition-colors duration-200",
        className
      )}
    >
      <div className="space-y-6">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-theme-secondary px-3">
          Navigation Control
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-[#FF2A85]/10 text-theme-primary border border-[#FF2A85]/40 shadow-[0_0_12px_rgba(255,42,133,0.2)]"
                    : "text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-colors",
                    isActive
                      ? "text-[#FF2A85] drop-shadow-[0_0_6px_rgba(255,42,133,0.7)]"
                      : "text-theme-secondary group-hover:text-theme-primary"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry Gateway Status */}
      <div className="p-3 rounded-lg bg-theme-elevated border border-theme-subtle space-y-2 font-mono">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-theme-secondary">
            <Radio className="size-3 text-[#00E676] animate-pulse" />
            MQTT Gateway
          </span>
          <span className="text-[10px] text-[#00E676] font-bold">ONLINE</span>
        </div>
        <div className="text-[10px] text-theme-secondary flex justify-between">
          <span>Latency</span>
          <span className="text-theme-primary">14 ms</span>
        </div>
        <div className="text-[10px] text-theme-secondary flex justify-between">
          <span>Poll Interval</span>
          <span className="text-theme-primary">1.0 s</span>
        </div>
      </div>
    </aside>
  );
}
