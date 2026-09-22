"use client";

import React, { useState, useMemo } from "react";
import {
  Sun,
  BatteryCharging,
  Flame,
  DollarSign,
  TrendingUp,
  Leaf,
  Download,
  FileCheck2,
  ChevronDown,
  Building,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { SiteRecord, HourlyTelemetryRecord } from "@/lib/energy/types";
import {
  calculateAnalyticsSummary,
  generateDispatchCsv,
  AnalyticsSummary,
} from "@/lib/energy/analytics-engine";
import { EsgComplianceModal } from "./esg-compliance-modal";

interface PowerConsumptionWorkspaceProps {
  site: SiteRecord;
  sites?: SiteRecord[]; // When provided (e.g. on /analytics), enables site selector dropdown
  hourlyTelemetry: HourlyTelemetryRecord[];
}

interface DispatchPoint {
  timestamp: string;
  timeLabel: string;
  solarKw: number;
  bessDischargeKw: number;
  gridImportKw: number;
  dgKw: number;
  loadKw: number;
  bessChargeKw: number;
}

export function PowerConsumptionWorkspace({
  site,
  sites,
  hourlyTelemetry,
}: PowerConsumptionWorkspaceProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(site.id);
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d" | "ytd">("today");
  const [hoveredPoint, setHoveredPoint] = useState<DispatchPoint | null>(null);
  const [isEsgModalOpen, setIsEsgModalOpen] = useState<boolean>(false);

  // Active site reference
  const currentSite = useMemo(() => {
    if (!sites || sites.length === 0) return site;
    return sites.find((s) => s.id === selectedSiteId) || site;
  }, [sites, selectedSiteId, site]);

  // Downsample/filter telemetry according to timeframe
  const displayData = useMemo(() => {
    let source = [...hourlyTelemetry];
    if (timeframe === "today") {
      source = source.slice(-24);
    } else if (timeframe === "7d") {
      source = source.slice(-168);
    } else if (timeframe === "30d") {
      source = source.slice(-720);
    } else {
      // YTD: expand with full buffer
      source = source.slice(-720);
    }

    const step =
      timeframe === "today" ? 1 : timeframe === "7d" ? 4 : timeframe === "30d" ? 12 : 24;
    const sampled: DispatchPoint[] = [];

    for (let i = 0; i < source.length; i += step) {
      const item = source[i];
      const hour = new Date(item.bucket_timestamp).getHours();

      const solarKw = item.avg_solar_kw || 0;
      const bessKw = item.avg_bess_kw || 0;
      const bessDischargeKw = item.bess_discharge_kwh || (bessKw > 0 ? bessKw : 0);
      const bessChargeKw = item.bess_charge_kwh || (bessKw < 0 ? Math.abs(bessKw) : 0);
      const gridImportKw = item.grid_import_kwh || 0;
      const dgKw = item.dg_energy_kwh || 0;
      const loadKw = item.avg_load_kw || 600;

      sampled.push({
        timestamp: item.bucket_timestamp,
        timeLabel:
          timeframe === "today"
            ? `${hour.toString().padStart(2, "0")}:00`
            : new Date(item.bucket_timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: timeframe === "7d" ? "numeric" : undefined,
              }),
        solarKw,
        bessDischargeKw,
        gridImportKw,
        dgKw,
        loadKw,
        bessChargeKw,
      });
    }

    return sampled;
  }, [hourlyTelemetry, timeframe]);

  // Compute analytics summary economics
  const summary: AnalyticsSummary = useMemo(() => {
    return calculateAnalyticsSummary(hourlyTelemetry, currentSite);
  }, [hourlyTelemetry, currentSite]);

  // Max kW scale for SVG
  const maxScaleKw = useMemo(() => {
    const highest = Math.max(
      ...displayData.map((d) =>
        Math.max(d.solarKw + d.bessDischargeKw + d.gridImportKw + d.dgKw, d.loadKw, 100)
      ),
      currentSite.solar_capacity_kwp || 800
    );
    return Math.ceil((highest * 1.15) / 100) * 100;
  }, [displayData, currentSite]);

  // CSV Exporter
  const handleDownloadCsv = () => {
    const csvData = generateDispatchCsv(hourlyTelemetry, currentSite.name);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${currentSite.slug || "site"}-energy-dispatch-${timeframe}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Dimensions
  const width = 850;
  const height = 320;
  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (displayData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (displayData.length - 1)) * chartW;
  };

  const getY = (kw: number) => {
    const clamped = Math.max(0, Math.min(maxScaleKw, kw));
    return paddingTop + chartH - (clamped / maxScaleKw) * chartH;
  };

  // Generate SVG area paths
  const makeStackedArea = (getTopKw: (d: DispatchPoint) => number) => {
    if (displayData.length === 0) return "";
    const topPoints = displayData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(getTopKw(d)).toFixed(1)}`)
      .join(" ");
    const bottomY = (paddingTop + chartH).toFixed(1);
    const lastX = getX(displayData.length - 1).toFixed(1);
    const firstX = getX(0).toFixed(1);
    return `${topPoints} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const makeLinePath = (getValue: (d: DispatchPoint) => number) => {
    if (displayData.length === 0) return "";
    return displayData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(getValue(d)).toFixed(1)}`)
      .join(" ");
  };

  const timeframeLabels = {
    today: "Today (24-Hour Cycle)",
    "7d": "Last 7 Days (Hourly Profile)",
    "30d": "Last 30 Days (Monthly Yield)",
    ytd: "Year-to-Date (YTD Aggregate)",
  };

  return (
    <div className="space-y-6">
      {/* Workspace Top Controls Bar: Site Switcher & Timeframe Selector */}
      <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Site Selector Dropdown (if multiple sites provided) */}
          {sites && sites.length > 0 ? (
            <div className="relative">
              <label htmlFor="site-switcher" className="sr-only">
                Select Site
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-500 font-bold">
                  Site:
                </span>
                <div className="relative">
                  <select
                    id="site-switcher"
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="appearance-none bg-[#121622] hover:bg-[#1a2030] text-white font-bold font-mono text-xs px-3.5 py-2 pr-8 rounded-lg border border-white/[0.1] focus:outline-none focus:border-[#FF2A85] transition-colors cursor-pointer min-h-[38px]"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.location_city}, {s.location_state})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Building className="size-4 text-[#FF2A85]" />
              <h2 className="text-sm font-bold uppercase tracking-tight text-white font-mono">
                {currentSite.name} — Power Consumption Workspace
              </h2>
            </div>
          )}

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="text-xs font-mono text-slate-400">
            {timeframeLabels[timeframe]}
          </span>
        </div>

        {/* Timeframe Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="inline-flex rounded-lg bg-[#121622] p-1 border border-white/[0.06]">
            {(["today", "7d", "30d", "ytd"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeframe === tf
                    ? "bg-[#FF2A85] text-white font-bold shadow-[0_0_10px_rgba(255,42,133,0.35)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf === "today" ? "Today" : tf === "7d" ? "7D" : tf === "30d" ? "30D" : "YTD"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-200 border border-white/[0.08] transition-colors min-h-[36px]"
          >
            <Download className="size-3.5 text-[#00F0FF]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEsgModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E676]/15 hover:bg-[#00E676]/25 text-[#00E676] border border-[#00E676]/30 font-bold transition-colors min-h-[36px]"
          >
            <FileCheck2 className="size-3.5" />
            <span>ESG Statement</span>
          </button>
        </div>
      </div>

      {/* 4-Card Aggregate KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Solar Self-Consumption</span>
            <Sun className="size-4 text-[#FFD600]" />
          </div>
          <div className="text-xl font-bold text-[#FFD600]">
            {summary.solarSelfConsumptionPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(100 - summary.solarSelfConsumptionPct).toFixed(1)}% fed into grid
          </div>
        </div>

        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>BESS Peak Shaved</span>
            <BatteryCharging className="size-4 text-[#00F0FF]" />
          </div>
          <div className="text-xl font-bold text-[#00F0FF]">
            {summary.peakDemandShavedKw} kW
          </div>
          <div className="text-[11px] text-[#00E676] mt-0.5">
            ${summary.avoidedMdPenalties.toLocaleString()} MD penalty cut
          </div>
        </div>

        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Diesel Fuel Avoided</span>
            <Flame className="size-4 text-[#FF6B00]" />
          </div>
          <div className="text-xl font-bold text-[#FF6B00]">
            {summary.dieselFuelDisplacedLiters.toLocaleString()} L
          </div>
          <div className="text-[11px] text-[#00E676] mt-0.5">
            ${summary.dieselCostSaved.toLocaleString()} fuel cost saved
          </div>
        </div>

        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Carbon Abated</span>
            <Leaf className="size-4 text-[#00E676]" />
          </div>
          <div className="text-xl font-bold text-[#00E676]">
            {summary.co2AbatedKg.toLocaleString()} kg
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Equiv. {summary.treesEquivalent} mature trees
          </div>
        </div>
      </div>

      {/* Main Stacked Area Energy Balance & Dispatch Chart */}
      <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[#FF2A85]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                Stacked Energy Balance & Source-to-Sink Dispatch Profile
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Power mix serving factory load: Solar, BESS storage discharge, Grid import, and DG backup
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[#FFD600]" />
              <span className="text-white">Solar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[#00F0FF]" />
              <span className="text-white">BESS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[#9D4EDD]" />
              <span className="text-white">Grid</span>
            </div>
            {currentSite.has_dg && (
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-[#FF6B00]" />
                <span className="text-white">DG</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-[#FF2A85]" />
              <span className="text-[#FF2A85] font-bold">Facility Load</span>
            </div>
          </div>
        </div>

        {/* Responsive SVG Canvas */}
        <div className="relative overflow-x-auto">
          <div className="min-w-[650px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none overflow-visible"
            >
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD600" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FFD600" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="bessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9D4EDD" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const yVal = paddingTop + chartH * (1 - pct);
                const kwVal = Math.round(maxScaleKw * pct);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={yVal}
                      x2={width - paddingRight}
                      y2={yVal}
                      stroke="rgba(255,255,255,0.05)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={yVal + 3.5}
                      textAnchor="end"
                      fill="#64748B"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {kwVal} kW
                    </text>
                  </g>
                );
              })}

              {/* Grid Import Area */}
              <path
                d={makeStackedArea((d) => d.gridImportKw)}
                fill="url(#gridGrad)"
              />

              {/* BESS Discharge Area */}
              <path
                d={makeStackedArea((d) => d.bessDischargeKw)}
                fill="url(#bessGrad)"
              />

              {/* Solar Area */}
              <path
                d={makeStackedArea((d) => d.solarKw)}
                fill="url(#solarGrad)"
              />

              {/* Solar Contour Line */}
              <path
                d={makeLinePath((d) => d.solarKw)}
                fill="none"
                stroke="#FFD600"
                strokeWidth="2"
              />

              {/* Facility Load Line (Pink Overlay with drop shadow) */}
              <path
                d={makeLinePath((d) => d.loadKw)}
                fill="none"
                stroke="#FF2A85"
                strokeWidth="3"
                filter="drop-shadow(0 0 6px rgba(255, 42, 133, 0.5))"
              />

              {/* Time Axis Labels */}
              {displayData.map((d, i) => {
                const step = Math.ceil(displayData.length / 6);
                if (i % step !== 0 && i !== displayData.length - 1) return null;
                return (
                  <text
                    key={i}
                    x={getX(i)}
                    y={height - 12}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {d.timeLabel}
                  </text>
                );
              })}

              {/* Hover Tooltip Hotspots */}
              {displayData.map((d, i) => (
                <rect
                  key={i}
                  x={getX(i) - (chartW / displayData.length) / 2}
                  y={paddingTop}
                  width={chartW / displayData.length}
                  height={chartH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {hoveredPoint && (
                <line
                  x1={getX(displayData.indexOf(hoveredPoint))}
                  y1={paddingTop}
                  x2={getX(displayData.indexOf(hoveredPoint))}
                  y2={paddingTop + chartH}
                  stroke="#FF2A85"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Hover Inspection Panel */}
        {hoveredPoint ? (
          <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Timestamp</span>
              <div className="font-bold text-white mt-0.5">{hoveredPoint.timeLabel}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Solar PV</span>
              <div className="font-bold text-[#FFD600] mt-0.5">
                {hoveredPoint.solarKw.toLocaleString()} kW
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">BESS Discharge</span>
              <div className="font-bold text-[#00F0FF] mt-0.5">
                {hoveredPoint.bessDischargeKw.toLocaleString()} kW
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Grid Import</span>
              <div className="font-bold text-[#9D4EDD] mt-0.5">
                {hoveredPoint.gridImportKw.toLocaleString()} kW
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Facility Load</span>
              <div className="font-bold text-[#FF2A85] mt-0.5">
                {hoveredPoint.loadKw.toLocaleString()} kW
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-[#121622]/50 border border-white/[0.04] text-[11px] font-mono text-slate-400 text-center">
            Hover over the dispatch curve to inspect the source-to-sink kilowatt balance
          </div>
        )}
      </div>

      {/* TOU Tariff Arbitrage, Peak Shaving & BESS RTE% Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOU Tariff Arbitrage & Peak Shaving Card */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-[#00E676]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-white font-mono">
                TOU Tariff Arbitrage & Peak Shaving Economics
              </h3>
            </div>
            <span className="text-xs font-mono text-[#00E676] flex items-center gap-1 font-bold">
              <CheckCircle2 className="size-3.5" />
              Optimal Arbitrage
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#121622] flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Peak Tariff Rate Window</span>
                <span className="text-white font-bold">18:00 — 22:00 Daily</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Tariff Delta</span>
                <span className="text-[#FF2A85] font-bold">
                  +${((currentSite.peak_tariff_rate || 0.18) - (currentSite.offpeak_tariff_rate || 0.07)).toFixed(2)}/kWh
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Arbitrage Revenue Harvested</span>
                <span className="text-slate-500 text-[10px]">Charging off-peak, discharging peak</span>
              </div>
              <span className="text-base font-bold text-[#00E676]">
                +${summary.touArbitrageSavings.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Avoided Peak Demand Penalties</span>
                <span className="text-slate-500 text-[10px]">Capping utility MD below sanctioned limit</span>
              </div>
              <span className="text-base font-bold text-[#00E676]">
                +${summary.avoidedMdPenalties.toLocaleString()} / mo
              </span>
            </div>
          </div>
        </div>

        {/* BESS Round-Trip Efficiency & Health Degradation Card */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryCharging className="size-4 text-[#00F0FF]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-white font-mono">
                BESS Round-Trip Efficiency (RTE) & Degradation
              </h3>
            </div>
            <span className="text-xs font-mono text-[#00E676] flex items-center gap-1 font-bold">
              <ShieldCheck className="size-3.5" />
              LFP Covenants OK
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#121622] flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Measured Round-Trip Efficiency (RTE)</span>
                <span className="text-slate-500 text-[10px]">Threshold limit &gt;85%</span>
              </div>
              <span className="text-base font-bold text-[#00F0FF]">
                {summary.bessRtePct}% RTE
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Current State of Health (SoH)</span>
                <span className="text-slate-500 text-[10px]">Capacity fade vs 10-year warranty</span>
              </div>
              <span className="text-base font-bold text-[#00E676]">
                96.8% SoH
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Cumulative Energy Cycled</span>
                <span className="text-slate-500 text-[10px]">Charge vs discharge MWh</span>
              </div>
              <span className="text-white font-bold">
                {(summary.bessDischargeKwh / 1000).toFixed(1)} / {(summary.bessChargeKwh / 1000).toFixed(1)} MWh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ESG Statement Modal Dialog */}
      <EsgComplianceModal
        isOpen={isEsgModalOpen}
        onClose={() => setIsEsgModalOpen(false)}
        site={currentSite}
        summary={summary}
        timeframeLabel={timeframeLabels[timeframe]}
      />
    </div>
  );
}
