import React from "react";
import Link from "next/link";
import {
  Sun,
  BatteryCharging,
  Zap,
  Flame,
  ArrowRight,
  AlertTriangle,
  Activity,
  Leaf,
} from "lucide-react";

export interface SiteData {
  id: string;
  name: string;
  location_city: string;
  location_state: string;
  status: "ONLINE" | "WARNING" | "CRITICAL" | "OFFLINE";
  subscription_status?: "active" | "past_due" | "expired";
  has_solar: boolean;
  has_bess: boolean;
  has_grid: boolean;
  has_dg: boolean;

  // Nameplate Capacities
  solar_capacity_kwp?: number;
  bess_capacity_kwh?: number;
  bess_power_kw?: number;
  contracted_demand_kva?: number;
  dg_capacity_kva?: number;

  // Live Telemetry Values
  live_solar_kw: number;
  live_bess_power_kw?: number;
  bess_soc_pct: number;
  grid_power_kw?: number;
  dg_power_kw?: number;
  dg_running?: boolean;
  dg_fuel_pct?: number;
  load_kw: number;

  // Daily Energy Totals (kWh)
  daily_yield_kwh: number; // solar generation today
  grid_import_today_kwh?: number;
  grid_export_today_kwh?: number;
  dg_yield_today_kwh?: number;
  bess_charge_today_kwh?: number;
  bess_discharge_today_kwh?: number;
  load_consumption_today_kwh?: number;
  co2_saved_today_kg?: number;
}

// Industrial formatting helpers
function formatKwOrMw(kw?: number): string {
  if (kw == null || isNaN(kw)) return "0 kW";
  if (Math.abs(kw) >= 1000) {
    return `${(kw / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MW`;
  }
  return `${kw.toLocaleString()} kW`;
}

function formatKwhOrMwh(kwh?: number): string {
  if (kwh == null || isNaN(kwh)) return "0 kWh";
  if (Math.abs(kwh) >= 10000) {
    return `${(kwh / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MWh`;
  }
  return `${kwh.toLocaleString()} kWh`;
}

function formatKvaOrMva(kva?: number): string {
  if (kva == null || isNaN(kva)) return "0 kVA";
  if (Math.abs(kva) >= 1000) {
    return `${(kva / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MVA`;
  }
  return `${kva.toLocaleString()} kVA`;
}

function formatKwpOrMwp(kwp?: number): string {
  if (kwp == null || isNaN(kwp)) return "0 kWp";
  if (Math.abs(kwp) >= 1000) {
    return `${(kwp / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MWp`;
  }
  return `${kwp.toLocaleString()} kWp`;
}

export function SiteCockpitCard({
  site,
  onRenew,
}: {
  site: SiteData;
  onRenew?: (site: SiteData) => void;
}) {
  const isExpired = site.subscription_status === "expired";
  const isIslanded = !site.has_grid;

  // Specific Yield calculation (kWh / kWp)
  const solarCapacity = site.solar_capacity_kwp || 0;
  const solarGenToday = site.daily_yield_kwh || 0;
  const specificYield =
    solarCapacity > 0 ? (solarGenToday / solarCapacity).toFixed(2) : "0.00";

  // Stored BESS Energy calculation
  const bessCapacity = site.bess_capacity_kwh || 0;
  const storedBessKwh = Math.round((bessCapacity * (site.bess_soc_pct || 0)) / 100);

  const gridKw = site.grid_power_kw ?? 0;

  return (
    <div
      className={`rounded-xl bg-[#0B0D13] border transition-all p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden shadow-lg shadow-black/40 ${
        isExpired
          ? "border-amber-500/30 opacity-80 hover:border-amber-500/60"
          : "border-white/[0.08] hover:border-[#FF2A85]/50"
      }`}
    >
      {/* Top Accent Gradient Border */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${
          isExpired ? "via-amber-500" : "via-[#FF2A85]"
        } to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      <div className="space-y-4">
        {/* Card Top: Name, Location, Status & Hardware Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-base font-bold text-white group-hover:text-[#FF2A85] transition-colors">
                {site.name}
              </h3>

              {/* Status Badge */}
              {isExpired ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <AlertTriangle className="size-2.5" />
                  EXPIRED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                  <span className="size-1.5 rounded-full bg-[#00E676] animate-pulse" />
                  {site.status}
                </span>
              )}

              {/* Islanded Badge */}
              {isIslanded && (
                <span className="inline-flex items-center text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#9D4EDD]/20 text-[#9D4EDD] border border-[#9D4EDD]/40">
                  ISLANDED
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 font-medium">
              {site.location_city}, {site.location_state}
            </p>
          </div>

          {/* Asset Hardware Badges */}
          <div className="flex items-center gap-1.5 bg-[#121622] px-2.5 py-1 rounded-md border border-white/[0.04] text-xs shrink-0">
            {site.has_solar && (
              <span title="Solar PV Array">
                <Sun className="size-3.5 text-[#FFD600]" />
              </span>
            )}
            {site.has_bess && (
              <span title="BESS Storage Container">
                <BatteryCharging className="size-3.5 text-[#00F0FF]" />
              </span>
            )}
            {site.has_grid ? (
              <span title="Utility Grid Intertie">
                <Zap className="size-3.5 text-[#9D4EDD]" />
              </span>
            ) : (
              <span
                title="Islanded Off-Grid"
                className="text-[10px] font-mono text-slate-500 line-through"
              >
                GRID
              </span>
            )}
            {site.has_dg && (
              <span title="Diesel Generator Peaker">
                <Flame className="size-3.5 text-[#FF6B00]" />
              </span>
            )}
          </div>
        </div>

        {/* Expired Warning Banner */}
        {isExpired && (
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-mono flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-3.5 shrink-0 text-amber-400" />
              <span>Telemetry feed paused. Renew subscription to reactivate live Modbus sync.</span>
            </div>
            {onRenew && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRenew(site);
                }}
                className="shrink-0 px-2 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px] hover:bg-amber-400 transition-colors"
              >
                Renew Now
              </button>
            )}
          </div>
        )}

        {/* Industrial Subsystem Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* 1. Solar PV Subsystem */}
          {site.has_solar && (
            <div className="rounded-lg bg-[#121622]/80 border border-amber-500/20 p-2.5 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Sun className="size-3.5 text-[#FFD600]" />
                  <span>SOLAR PV</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#FFD600]">
                  {formatKwOrMw(site.live_solar_kw)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-2 text-center">
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Installed
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-200 mt-0.5">
                    {formatKwpOrMwp(site.solar_capacity_kwp)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Gen Today
                  </div>
                  <div className="text-[11px] font-mono font-bold text-white mt-0.5">
                    {formatKwhOrMwh(site.daily_yield_kwh)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Spec. Yield
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#FFD600] mt-0.5">
                    {specificYield}{" "}
                    <span className="text-[8px] font-normal text-slate-400">kWh/kWp</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Utility Grid Subsystem */}
          <div
            className={`rounded-lg bg-[#121622]/80 border ${
              isIslanded
                ? "border-purple-500/10 opacity-70"
                : "border-purple-500/20 hover:border-purple-500/40"
            } p-2.5 flex flex-col justify-between transition-colors`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Zap className="size-3.5 text-[#9D4EDD]" />
                <span>UTILITY GRID</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#9D4EDD]">
                {isIslanded ? (
                  <span className="text-slate-400">OFF-GRID</span>
                ) : gridKw > 0 ? (
                  <span>+{formatKwOrMw(gridKw)} In</span>
                ) : gridKw < 0 ? (
                  <span>-{formatKwOrMw(Math.abs(gridKw))} Feed</span>
                ) : (
                  <span>0 kW</span>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-2 text-center">
              <div>
                <div className="text-[9px] uppercase font-semibold text-slate-400">
                  Sanctioned
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-200 mt-0.5">
                  {isIslanded ? "0 kVA" : formatKvaOrMva(site.contracted_demand_kva)}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-semibold text-slate-400">
                  Drawn Today
                </div>
                <div className="text-[11px] font-mono font-bold text-white mt-0.5">
                  {isIslanded ? "0 kWh" : formatKwhOrMwh(site.grid_import_today_kwh)}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-semibold text-slate-400">
                  {isIslanded ? "Mode" : "Feed Today"}
                </div>
                <div className="text-[11px] font-mono font-bold text-[#00E676] mt-0.5">
                  {isIslanded ? "Islanded" : formatKwhOrMwh(site.grid_export_today_kwh)}
                </div>
              </div>
            </div>
          </div>

          {/* 3. BESS Subsystem */}
          {site.has_bess && (
            <div className="rounded-lg bg-[#121622]/80 border border-cyan-500/20 p-2.5 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <BatteryCharging className="size-3.5 text-[#00F0FF]" />
                  <span>BESS STORAGE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[#00F0FF]">
                    {site.bess_soc_pct.toFixed(1)}% SoC
                  </span>
                </div>
              </div>

              {/* Mini SoC Progress Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-600 to-[#00F0FF] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, site.bess_soc_pct))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 text-center">
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Installed
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-200 mt-0.5">
                    {formatKwhOrMwh(site.bess_capacity_kwh)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Stored Usable
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#00F0FF] mt-0.5">
                    {formatKwhOrMwh(storedBessKwh)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Cycled Today
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-300 mt-0.5">
                    +{formatKwhOrMwh(site.bess_charge_today_kwh)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. DG Genset Subsystem */}
          {site.has_dg && (
            <div className="rounded-lg bg-[#121622]/80 border border-orange-500/20 p-2.5 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Flame className="size-3.5 text-[#FF6B00]" />
                  <span>DG BACKUP</span>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    site.dg_running
                      ? "bg-[#FF6B00]/20 text-[#FF6B00] animate-pulse"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {site.dg_running
                    ? `RUNNING (${site.dg_power_kw || 0} kW)`
                    : "STANDBY"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-2 text-center">
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Installed
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-200 mt-0.5">
                    {formatKvaOrMva(site.dg_capacity_kva)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Gen Today
                  </div>
                  <div className="text-[11px] font-mono font-bold text-white mt-0.5">
                    {formatKwhOrMwh(site.dg_yield_today_kwh)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    Fuel Level
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#FF6B00] mt-0.5">
                    {site.dg_fuel_pct != null ? `${site.dg_fuel_pct.toFixed(0)}%` : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Facility Demand & Daily Consumption Bar */}
        <div className="rounded-lg bg-[#121622]/50 border border-pink-500/20 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-[#FF2A85]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Facility Demand
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] mr-1">ACTIVE:</span>
              <strong className="text-[#FF2A85]">{formatKwOrMw(site.load_kw)}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] mr-1">TODAY:</span>
              <strong className="text-white">
                {formatKwhOrMwh(site.load_consumption_today_kwh)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Card Bottom: Carbon Offset & CTA */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Leaf className="size-3 text-[#00E676]" />
          <span>CO₂ Avoided:</span>
          <strong className="text-[#00E676]">
            {site.co2_saved_today_kg
              ? `${site.co2_saved_today_kg.toLocaleString()} kg`
              : `${Math.round((site.daily_yield_kwh || 0) * 0.72).toLocaleString()} kg`}
          </strong>
        </div>

        {isExpired && onRenew ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRenew(site);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors group/link text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            <span>Renew Subscription</span>
            <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </button>
        ) : (
          <Link
            href={`/sites/${site.id}`}
            className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors group/link ${
              isExpired
                ? "text-amber-400 hover:text-amber-300"
                : "text-[#FF2A85] hover:text-[#ff559f]"
            }`}
          >
            <span>{isExpired ? "Renew Subscription" : "View Energy Flow"}</span>
            <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
