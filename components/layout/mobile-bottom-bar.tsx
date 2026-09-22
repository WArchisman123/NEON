"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Zap, BarChart3, Wrench, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomBarProps {
  className?: string;
}

export function MobileBottomBar({ className }: MobileBottomBarProps) {
  const pathname = usePathname();

  const items = [
    { label: "Sites", href: "/", icon: LayoutDashboard },
    { label: "Flow", href: "/flow", icon: Zap },
    { label: "Power", href: "/analytics", icon: BarChart3 },
    { label: "Service", href: "/maintenance", icon: Wrench },
    { label: "System", href: "/design-system", icon: Palette },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-16 z-40 bg-[#0B0D13]/95 backdrop-blur-lg border-t border-white/[0.1] px-2 flex items-center justify-around",
        className
      )}
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all min-w-[48px] min-h-[48px] select-none",
              isActive
                ? "text-[#FF2A85] drop-shadow-[0_0_8px_rgba(255,42,133,0.6)]"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-semibold tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
