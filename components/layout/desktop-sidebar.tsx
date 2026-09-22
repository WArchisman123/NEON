"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  Wrench,
  Palette,
  Settings,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  className?: string;
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Fleet Cockpit", href: "/", icon: LayoutDashboard },
    { name: "Energy Flow", href: "/flow", icon: Zap },
    { name: "Analytics & Yield", href: "/analytics", icon: BarChart3 },
    { name: "Maintenance Hub", href: "/maintenance", icon: Wrench },
    { name: "Design System", href: "/design-system", icon: Palette },
    { name: "System Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "w-60 shrink-0 bg-[#0B0D13] border-r border-white/[0.08] flex flex-col justify-between p-4",
        className
      )}
    >
      <div className="space-y-6">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3">
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
                    ? "bg-[#FF2A85]/10 text-white border border-[#FF2A85]/40 shadow-[0_0_12px_rgba(255,42,133,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-colors",
                    isActive
                      ? "text-[#FF2A85] drop-shadow-[0_0_6px_rgba(255,42,133,0.7)]"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry Gateway Status */}
      <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06] space-y-2 font-mono">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Radio className="size-3 text-[#00E676] animate-pulse" />
            MQTT Gateway
          </span>
          <span className="text-[10px] text-[#00E676] font-bold">ONLINE</span>
        </div>
        <div className="text-[10px] text-slate-500 flex justify-between">
          <span>Latency</span>
          <span className="text-slate-300">14 ms</span>
        </div>
        <div className="text-[10px] text-slate-500 flex justify-between">
          <span>Poll Interval</span>
          <span className="text-slate-300">1.0 s</span>
        </div>
      </div>
    </aside>
  );
}
