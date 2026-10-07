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
  cuf_pct?: number;
  specific_yield?: number;
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
      className={`rounded-xl bg-theme-card border transition-all p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden shadow-md shadow-black/10 dark:shadow-black/40 ${
        isExpired
          ? "border-amber-500/30 opacity-80 hover:border-amber-500/60"
          : "border-theme-subtle hover:border-[#FF2A85]/50"
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
              <h3 className="text-base font-bold text-theme-primary group-hover:text-[#FF2A85] transition-colors">
                {site.name}
              </h3>

              {/* Status Badge */}
              {isExpired ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40">
                  <AlertTriangle className="size-2.5" />
                  EXPIRED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#059669] dark:text-[#00E676] border border-[#00E676]/20">
                  <span className="size-1.5 rounded-full bg-[#059669] dark:bg-[#00E676] animate-pulse" />
                  {site.status}
                </span>
              )}

              {/* Islanded Badge */}
              {isIslanded && (
                <span className="inline-flex items-center text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#9D4EDD]/20 text-[#7C3AED] dark:text-[#9D4EDD] border border-[#9D4EDD]/40">
                  ISLANDED
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-theme-secondary font-medium">
                {site.location_city}, {site.location_state}
              </span>
              {site.has_solar && (
                <>
                  <span className="text-theme-secondary/40">•</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00F0FF]/10 text-[#0284C7] dark:text-[#00F0FF] border border-[#00F0FF]/25 font-bold">
                    CUF: {site.cuf_pct ? site.cuf_pct.toFixed(1) : ((solarGenToday / (solarCapacity * 24 || 1)) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF2A85]/10 text-[#FF2A85] border border-[#FF2A85]/25 font-bold">
                    {specificYield} kWh/kWp
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Asset Hardware Badges */}
          <div className="flex items-center gap-1.5 bg-theme-elevated px-2.5 py-1 rounded-md border border-theme-subtle text-xs shrink-0">
            {site.has_solar && (
              <span title="Solar PV Array">
                <Sun className="size-3.5 text-[#D97706] dark:text-[#FFD600]" />
              </span>
            )}
            {site.has_bess && (
              <span title="BESS Storage Container">
                <BatteryCharging className="size-3.5 text-[#0284C7] dark:text-[#00F0FF]" />
              </span>
            )}
            {site.has_grid ? (
              <span title="Utility Grid Intertie">
                <Zap className="size-3.5 text-[#7C3AED] dark:text-[#9D4EDD]" />
              </span>
            ) : (
              <span
                title="Islanded Off-Grid"
                className="text-[10px] font-mono text-theme-secondary line-through"
              >
                GRID
              </span>
            )}
            {site.has_dg && (
              <span title="Diesel Generator Peaker">
                <Flame className="size-3.5 text-[#EA580C] dark:text-[#FF6B00]" />
              </span>
            )}
          </div>
        </div>

        {/* Expired Warning Banner */}
        {isExpired && (
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-300 font-mono flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
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
            <div className="rounded-lg bg-theme-elevated/70 dark:bg-[#121622]/80 border border-amber-500/25 p-2.5 flex flex-col justify-between hover:border-amber-500/50 transition-colors shadow-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-theme-subtle">
                <div className="flex items-center gap-1.5 text-xs font-bold text-theme-primary">
                  <Sun className="size-3.5 text-[#D97706] dark:text-[#FFD600]" />
                  <span>SOLAR PV</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#D97706] dark:text-[#FFD600]">
                  {formatKwOrMw(site.live_solar_kw)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-2 text-center">
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Installed
                  </div>
                  <div className="text-[11px] font-mono font-bold text-theme-primary mt-0.5">
                    {formatKwpOrMwp(site.solar_capacity_kwp)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Gen Today
                  </div>
                  <div className="text-[11px] font-mono font-bold text-theme-primary mt-0.5">
                    {formatKwhOrMwh(site.daily_yield_kwh)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Spec. Yield
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#D97706] dark:text-[#FFD600] mt-0.5">
                    {specificYield}{" "}
                    <span className="text-[8px] font-normal text-theme-secondary">kWh/kWp</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Utility Grid Subsystem */}
          <div
            className={`rounded-lg bg-theme-elevated/70 dark:bg-[#121622]/80 border ${
              isIslanded
                ? "border-purple-500/10 opacity-70"
                : "border-purple-500/25 hover:border-purple-500/50"
            } p-2.5 flex flex-col justify-between transition-colors shadow-xs`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-theme-subtle">
              <div className="flex items-center gap-1.5 text-xs font-bold text-theme-primary">
                <Zap className="size-3.5 text-[#7C3AED] dark:text-[#9D4EDD]" />
                <span>UTILITY GRID</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#7C3AED] dark:text-[#9D4EDD]">
                {isIslanded ? (
                  <span className="text-theme-secondary">OFF-GRID</span>
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
                <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                  Sanctioned
                </div>
                <div className="text-[11px] font-mono font-bold text-theme-primary mt-0.5">
                  {isIslanded ? "0 kVA" : formatKvaOrMva(site.contracted_demand_kva)}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                  Drawn Today
                </div>
                <div className="text-[11px] font-mono font-bold text-theme-primary mt-0.5">
                  {isIslanded ? "0 kWh" : formatKwhOrMwh(site.grid_import_today_kwh)}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                  {isIslanded ? "Mode" : "Feed Today"}
                </div>
                <div className="text-[11px] font-mono font-bold text-[#059669] dark:text-[#00E676] mt-0.5">
                  {isIslanded ? "Islanded" : formatKwhOrMwh(site.grid_export_today_kwh)}
                </div>
              </div>
            </div>
          </div>

          {/* 3. BESS Subsystem */}
          {site.has_bess && (
            <div className="rounded-lg bg-theme-elevated/70 dark:bg-[#121622]/80 border border-cyan-500/25 p-2.5 flex flex-col justify-between hover:border-cyan-500/50 transition-colors shadow-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-theme-subtle">
                <div className="flex items-center gap-1.5 text-xs font-bold text-theme-primary">
                  <BatteryCharging className="size-3.5 text-[#0284C7] dark:text-[#00F0FF]" />
                  <span>BESS STORAGE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[#0284C7] dark:text-[#00F0FF]">
                    {site.bess_soc_pct.toFixed(1)}% SoC
                  </span>
                </div>
              </div>

              {/* Mini SoC Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-[#0284C7] dark:from-cyan-600 dark:to-[#00F0FF] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, site.bess_soc_pct))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 text-center">
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Installed
                  </div>
                  <div className="text-[11px] font-mono font-bold text-theme-primary mt-0.5">
                    {formatKwhOrMwh(site.bess_capacity_kwh)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Stored Usable
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#0284C7] dark:text-[#00F0FF] mt-0.5">
                    {formatKwhOrMwh(storedBessKwh)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Cycled Today
                  </div>
                  <div className="text-[10px] font-mono font-bold text-theme-primary mt-0.5">
                    +{formatKwhOrMwh(site.bess_charge_today_kwh)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. DG Genset Subsystem */}
          {site.has_dg && (
            <div className="rounded-lg bg-theme-elevated/70 dark:bg-[#121622]/80 border border-orange-500/25 p-2.5 flex flex-col justify-between hover:border-orange-500/50 transition-colors shadow-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-theme-subtle">
                <div className="flex items-center gap-1.5 text-xs font-bold text-theme-primary">
                  <Flame className="size-3.5 text-[#EA580C] dark:text-[#FF6B00]" />
                  <span>DG BACKUP</span>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    site.dg_running
                      ? "bg-[#EA580C]/15 text-[#EA580C] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00] animate-pulse"
                      : "bg-slate-200 dark:bg-slate-800 text-theme-secondary"
                  }`}
                >
                  {site.dg_running
                    ? `RUNNING (${site.dg_power_kw || 0} kW)`
                    : "STANDBY"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-2 text-center">
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Installed
                  </div>
                  <div className="text-[11px] font-mono font-bold text-theme-primary mt-0.5">
                    {formatKvaOrMva(site.dg_capacity_kva)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Gen Today
                  </div>
                  <div className="text-[11px] font-mono font-bold text-theme-primary mt-0.5">
                    {formatKwhOrMwh(site.dg_yield_today_kwh)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold text-theme-secondary">
                    Fuel Level
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#EA580C] dark:text-[#FF6B00] mt-0.5">
                    {site.dg_fuel_pct != null ? `${site.dg_fuel_pct.toFixed(0)}%` : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Facility Demand & Daily Consumption Bar */}
        <div className="rounded-lg bg-pink-500/[0.06] dark:bg-[#121622]/60 border border-pink-500/25 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-[#FF2A85]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-primary">
              Facility Demand
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-theme-secondary text-[10px] mr-1">ACTIVE:</span>
              <strong className="text-[#FF2A85]">{formatKwOrMw(site.load_kw)}</strong>
            </div>
            <div>
              <span className="text-theme-secondary text-[10px] mr-1">TODAY:</span>
              <strong className="text-theme-primary">
                {formatKwhOrMwh(site.load_consumption_today_kwh)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Card Bottom: Carbon Offset & CTA */}
      <div className="mt-4 pt-3 border-t border-theme-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-theme-secondary font-mono text-[11px]">
          <Leaf className="size-3 text-[#059669] dark:text-[#00E676]" />
          <span>CO₂ Avoided:</span>
          <strong className="text-[#059669] dark:text-[#00E676]">
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
