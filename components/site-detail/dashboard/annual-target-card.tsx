"use client";

import React from "react";
import { Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface AnnualTargetCardProps {
  site: SiteRecord;
  className?: string;
}

export function AnnualTargetCard({ site, className = "" }: AnnualTargetCardProps) {
  const targetMwh = Number(site.annual_target_mwh ?? 1250);
  const achievedMwh = Number(site.annual_achieved_mwh ?? 842.5);
  const percentAchieved = Math.min(100, Number(((achievedMwh / targetMwh) * 100).toFixed(1)));
  const remainingMwh = Math.max(0, targetMwh - achievedMwh);

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle shadow-xs flex flex-col justify-between font-mono ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-pink-500/10 text-[#FF2A85] flex items-center justify-center">
            <Target className="size-3.5" />
          </div>
          <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wide">
            Annual Target vs. Achieved
          </h3>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 flex items-center gap-1">
          <CheckCircle2 className="size-2.5" />
          On Track
        </span>
      </div>

      {/* Main KPI Figures */}
      <div className="my-2 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] text-theme-secondary uppercase">Generation Achieved</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-[#00E676]">
              {achievedMwh.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-theme-muted">MWh</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-theme-secondary uppercase">Target P50</span>
          <div className="flex items-baseline justify-end gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black text-theme-primary">
              {targetMwh.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-theme-muted">MWh</span>
          </div>
        </div>
      </div>

      {/* Progress Bar with Dual Markers */}
      <div className="space-y-1.5 my-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-theme-secondary">Annual Completion</span>
          <span className="font-bold text-[#FF2A85]">{percentAchieved}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#FFD600] via-[#00F0FF] to-[#FF2A85] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,42,133,0.5)]"
            style={{ width: `${percentAchieved}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-theme-muted">
          <span>0 MWh</span>
          <span>Remaining: {remainingMwh.toFixed(1)} MWh</span>
          <span>{targetMwh} MWh</span>
        </div>
      </div>

      {/* Footer Sub-metric Insight */}
      <div className="pt-2 border-t border-theme-subtle/40 flex items-center justify-between text-[10px] text-theme-secondary">
        <span className="flex items-center gap-1 text-[#00E676]">
          <TrendingUp className="size-3" />
          Pacing: +4.2% above contractual baseline
        </span>
        <span className="text-theme-muted">CY 2026</span>
      </div>
    </div>
  );
}
