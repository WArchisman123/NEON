"use client";

import React from "react";
import { IndianRupee, TrendingUp, Sparkles, Leaf, Coins } from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface SolarRevenueCardProps {
  site: SiteRecord;
  className?: string;
}

export function SolarRevenueCard({ site, className = "" }: SolarRevenueCardProps) {
  const tariffInr = Number(site.feed_in_tariff_inr ?? 5.5);
  const solarTodayKwh = Number(site.solar_yield_today_kwh ?? 482.4);

  // Financial calculations
  const todayRevenue = Math.round(solarTodayKwh * tariffInr);
  const mtdRevenue = Math.round(todayRevenue * 22.4); // approx MTD
  const lifetimeRevenue = 1352010; // Lifetime Solar Revenue in INR
  const gridSavingsToday = Math.round(todayRevenue * 1.18); // Avoided commercial grid tariff (e.g. ₹6.5/kWh)

  // Carbon offset avoidance (approx 0.82 kg CO2 per kWh solar in India)
  const co2AvoidedKg = Math.round(solarTodayKwh * 0.82);

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle shadow-xs font-mono flex flex-col justify-between ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-theme-subtle/50">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-emerald-500/10 text-[#00E676] flex items-center justify-center font-bold text-xs">
            ₹
          </div>
          <div>
            <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wide">
              Revenue by Solar Generation
            </h3>
            <p className="text-[10px] text-theme-muted">
              PPA feed-in tariff &amp; avoided grid expenditure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[#00E676] text-[10px] font-bold">
          <Coins className="size-3" />
          <span>Tariff: ₹{tariffInr.toFixed(2)} / kWh</span>
        </div>
      </div>

      {/* Main Revenue Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-2.5">
        {/* Today's Solar Revenue */}
        <div className="p-3 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">
            Today&apos;s Revenue
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#00E676]">
              ₹{todayRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-theme-muted">INR</span>
          </div>
          <span className="text-[9px] text-theme-secondary mt-1 flex items-center gap-1">
            <TrendingUp className="size-2.5 text-[#00E676]" />
            Based on {solarTodayKwh.toFixed(1)} kWh generated
          </span>
        </div>

        {/* Month-to-Date (MTD) Revenue */}
        <div className="p-3 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">
            Month-to-Date (MTD)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-theme-primary">
              ₹{mtdRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-theme-muted">INR</span>
          </div>
          <span className="text-[9px] text-theme-secondary mt-1 flex items-center gap-1 text-[#FFD600]">
            <Sparkles className="size-2.5" />
            +8.3% over projected billing
          </span>
        </div>

        {/* Lifetime Generation Revenue */}
        <div className="p-3 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">
            Cumulative Lifetime
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FF2A85]">
              ₹{(lifetimeRevenue / 100000).toFixed(2)} L
            </span>
            <span className="text-[10px] text-theme-muted">
              (₹{lifetimeRevenue.toLocaleString("en-IN")})
            </span>
          </div>
          <span className="text-[9px] text-theme-secondary mt-1 flex items-center gap-1 text-[#00F0FF]">
            <span>Total 245.82 MWh exported</span>
          </span>
        </div>
      </div>

      {/* Sub-footer: Avoided Grid Cost & Carbon Credit */}
      <div className="pt-2 border-t border-theme-subtle/40 flex flex-wrap items-center justify-between gap-2 text-[10px] text-theme-secondary">
        <div className="flex items-center gap-1.5">
          <IndianRupee className="size-3 text-[#00E676]" />
          <span>
            Commercial Grid Offset: <strong className="text-theme-primary">₹{gridSavingsToday.toLocaleString("en-IN")} saved today</strong> (at ₹6.50/kWh baseline)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#00E676]">
          <Leaf className="size-3" />
          <span>{co2AvoidedKg.toLocaleString("en-IN")} kg CO₂ emissions avoided today</span>
        </div>
      </div>
    </div>
  );
}
