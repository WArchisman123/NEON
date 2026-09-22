import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "online"
    | "warning"
    | "critical"
    | "solar"
    | "bess"
    | "grid"
    | "dg"
    | "brand"
    | "neutral";
  pulsing?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  pulsing = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    online: "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/25 shadow-[0_0_8px_rgba(0,230,118,0.15)]",
    warning: "bg-[#FFAB00]/10 text-[#FFAB00] border border-[#FFAB00]/25 shadow-[0_0_8px_rgba(255,171,0,0.15)]",
    critical: "bg-[#FF1744]/15 text-[#FF1744] border border-[#FF1744]/30 shadow-[0_0_10px_rgba(255,23,68,0.2)]",
    solar: "bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/25 shadow-[0_0_8px_rgba(255,214,0,0.15)]",
    bess: "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25 shadow-[0_0_8px_rgba(0,240,255,0.15)]",
    grid: "bg-[#9D4EDD]/10 text-[#9D4EDD] border border-[#9D4EDD]/25 shadow-[0_0_8px_rgba(157,78,221,0.15)]",
    dg: "bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/25 shadow-[0_0_8px_rgba(255,107,0,0.15)]",
    brand: "bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/35 shadow-[0_0_8px_rgba(255,42,133,0.25)]",
    neutral: "bg-[#121622] text-slate-300 border border-white/[0.08]",
  };

  const pulseDotColors = {
    online: "bg-[#00E676]",
    warning: "bg-[#FFAB00]",
    critical: "bg-[#FF1744]",
    solar: "bg-[#FFD600]",
    bess: "bg-[#00F0FF]",
    grid: "bg-[#9D4EDD]",
    dg: "bg-[#FF6B00]",
    brand: "bg-[#FF2A85]",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {pulsing && (
        <span
          className={cn("size-1.5 rounded-full animate-pulse", pulseDotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
