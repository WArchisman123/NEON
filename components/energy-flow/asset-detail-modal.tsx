"use client";

import React from "react";
import {
  X,
  Zap,
  Sun,
  BatteryCharging,
  Factory,
  Flame,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Activity,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import { useEmsTab, EmsTabId } from "@/lib/energy/ems-tab-context";

export type TopologyNodeType = "solar" | "pcs" | "grid" | "dg" | "bess" | "load" | null;

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeType: TopologyNodeType;
  site: SiteRecord;
}

export function AssetDetailModal({
  isOpen,
  onClose,
  nodeType,
  site,
}: AssetDetailModalProps) {
  const { setActiveTab } = useEmsTab();

  if (!isOpen || !nodeType) return null;

  const solarKw = Number(site.solar_power_kw ?? 89.3);
  const bessKw = Number(site.live_bess_power_kw ?? -74.4);
  const isBessCharging = bessKw < 0;
  const bessSoc = Number(site.bess_soc_pct ?? 21.7);
  const gridKw = Number(site.grid_power_kw ?? 76.6);
  const isGridImport = gridKw >= 0;
  const dgKw = Number(site.dg_power_kw ?? 0.0);
  const isDgRunning = site.dg_running || dgKw > 0;
  const loadKw = Number(site.load_power_kw ?? 100.4);

  // Asset Metadata configurations
  const assetConfigs = {
    solar: {
      title: "Solar Photovoltaic Array",
      category: "Renewable Generation",
      tagColor: "#FFD600",
      accentBg: "bg-[#FFD600]/10",
      accentBorder: "border-[#FFD600]/40",
      icon: Sun,
      status: "Active Generation",
      statusColor: "text-[#00E676]",
      activeKw: solarKw,
      targetTab: "inverter" as EmsTabId,
      tabLabel: "View Inverter & Strings",
    },
    pcs: {
      title: "Bi-Directional PCS / Inverter",
      category: "Power Conversion System",
      tagColor: "#38BDF8",
      accentBg: "bg-sky-500/10",
      accentBorder: "border-sky-500/40",
      icon: Cpu,
      status: isBessCharging ? "Rectifying (AC → DC)" : "Inverting (DC → AC)",
      statusColor: "text-[#00E676]",
      activeKw: Math.abs(bessKw) > 0 ? Math.abs(bessKw) : 74.4,
      targetTab: "inverter" as EmsTabId,
      tabLabel: "View PCS Management Tab",
    },
    grid: {
      title: "Utility Interconnection (Grid)",
      category: "Main Substation Bus",
      tagColor: "#9D4EDD",
      accentBg: "bg-purple-500/10",
      accentBorder: "border-purple-500/40",
      icon: Zap,
      status: isGridImport ? "Grid Import Active" : "Exporting to Grid",
      statusColor: "text-purple-400",
      activeKw: Math.abs(gridKw),
      targetTab: "metering" as EmsTabId,
      tabLabel: "View Metering & Power Quality",
    },
    dg: {
      title: "Diesel Generator Backup",
      category: "Emergency Auxiliary Source",
      tagColor: "#FF6B00",
      accentBg: "bg-orange-500/10",
      accentBorder: "border-orange-500/40",
      icon: Flame,
      status: isDgRunning ? "Generator Running" : "Standby (Ready)",
      statusColor: isDgRunning ? "text-orange-400" : "text-slate-400",
      activeKw: dgKw,
      targetTab: "controls" as EmsTabId,
      tabLabel: "View Generator Controls",
    },
    bess: {
      title: "10kWh Lithium BESS Container",
      category: "Energy Storage Subsystem",
      tagColor: "#00F0FF",
      accentBg: "bg-cyan-500/10",
      accentBorder: "border-cyan-500/40",
      icon: BatteryCharging,
      status: isBessCharging ? "Bulk Charging (Absorption)" : "Discharging to Load",
      statusColor: "text-cyan-400",
      activeKw: Math.abs(bessKw),
      targetTab: "bess" as EmsTabId,
      tabLabel: "View Battery Health Diagnostics",
    },
    load: {
      title: "Commercial Facility Load",
      category: "Facility Demand & EV Station",
      tagColor: "#FF2A85",
      accentBg: "bg-[#FF2A85]/10",
      accentBorder: "border-[#FF2A85]/40",
      icon: Factory,
      status: "Online Demand Normal",
      statusColor: "text-[#00E676]",
      activeKw: loadKw,
      targetTab: "metering" as EmsTabId,
      tabLabel: "View Facility Metering",
    },
  };

  const current = assetConfigs[nodeType];
  const Icon = current.icon;

  const handleNavigate = () => {
    setActiveTab(current.targetTab);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-theme-card border border-theme-subtle shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-4 border-b border-theme-subtle flex items-start justify-between ${current.accentBg}`}>
          <div className="flex items-center gap-3">
            <div
              className={`size-11 rounded-xl flex items-center justify-center border shadow-md ${current.accentBorder}`}
              style={{ color: current.tagColor }}
            >
              <Icon className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-theme-primary tracking-wide">
                  {current.title}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${current.accentBorder} ${current.statusColor} bg-theme-card/60`}>
                  {current.status}
                </span>
              </div>
              <p className="text-[11px] font-mono text-theme-secondary mt-0.5">
                {current.category} • Site: {site.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
          {/* 4-KPI Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            <div className="p-2.5 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
              <span className="text-[10px] text-theme-secondary uppercase">Active Power</span>
              <span className="text-base font-black mt-1" style={{ color: current.tagColor }}>
                {current.activeKw.toFixed(1)} kW
              </span>
              <span className="text-[9px] text-theme-muted">3-Phase Real</span>
            </div>

            <div className="p-2.5 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
              <span className="text-[10px] text-theme-secondary uppercase">Bus Voltage</span>
              <span className="text-base font-black text-theme-primary mt-1">
                {nodeType === "bess" ? "871.3 V" : nodeType === "solar" ? "612.4 V" : "415.0 V"}
              </span>
              <span className="text-[9px] text-theme-muted">
                {nodeType === "bess" || nodeType === "solar" ? "DC Bus" : "Line-to-Line AC"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
              <span className="text-[10px] text-theme-secondary uppercase">Power Factor</span>
              <span className="text-base font-black text-theme-primary mt-1">
                {nodeType === "grid" ? "0.99" : nodeType === "load" ? "0.96" : "0.98"}
              </span>
              <span className="text-[9px] text-[#00E676]">Displacement (Lead)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-theme-elevated/40 border border-theme-subtle flex flex-col justify-between">
              <span className="text-[10px] text-theme-secondary uppercase">Operating Temp</span>
              <span className="text-base font-black text-amber-400 mt-1">
                {nodeType === "bess" ? "34.8°C" : nodeType === "solar" ? "42.1°C" : "38.2°C"}
              </span>
              <span className="text-[9px] text-[#00E676]">Thermal Loop: Nominal</span>
            </div>
          </div>

          {/* Subsystem Specific Deep Telemetry Breakdown */}
          {nodeType === "bess" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="size-3.5 text-cyan-400" />
                BESS Storage State & Contactor Matrix
              </h4>

              {/* SoC Progress Bar */}
              <div className="p-3 rounded-xl bg-theme-elevated/30 border border-theme-subtle space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-theme-secondary">State of Charge (SoC)</span>
                  <span className="font-bold text-cyan-400">{bessSoc.toFixed(1)}% ({bessKw < 0 ? "Charging" : "Discharging"})</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-[#00F0FF] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, bessSoc))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-theme-muted">
                  <span>Available: 135.4 kWh</span>
                  <span>State of Health: 98.3%</span>
                </div>
              </div>

              {/* Contactor Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div className="p-2 rounded bg-theme-elevated/40 border border-theme-subtle flex justify-between items-center">
                  <span className="text-theme-secondary text-[11px]">High Side:</span>
                  <span className="font-bold text-[#00E676]">ON</span>
                </div>
                <div className="p-2 rounded bg-theme-elevated/40 border border-theme-subtle flex justify-between items-center">
                  <span className="text-theme-secondary text-[11px]">Low Side:</span>
                  <span className="font-bold text-[#00E676]">ON</span>
                </div>
                <div className="p-2 rounded bg-theme-elevated/40 border border-theme-subtle flex justify-between items-center">
                  <span className="text-theme-secondary text-[11px]">Pre-Charge:</span>
                  <span className="font-bold text-slate-500">OFF</span>
                </div>
                <div className="p-2 rounded bg-theme-elevated/40 border border-theme-subtle flex justify-between items-center">
                  <span className="text-theme-secondary text-[11px]">DC/DC:</span>
                  <span className="font-bold text-[#00E676]">ON</span>
                </div>
              </div>

              {/* Cell Telemetry Details */}
              <div className="p-3 rounded-xl bg-theme-elevated/30 border border-theme-subtle grid grid-cols-3 gap-2 font-mono text-center">
                <div>
                  <span className="text-[10px] text-theme-secondary">Max Cell V</span>
                  <p className="text-xs font-bold text-theme-primary">3.09 V</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Avg Cell V</span>
                  <p className="text-xs font-bold text-theme-primary">3.06 V</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Cycle Count</span>
                  <p className="text-xs font-bold text-theme-primary">10,666</p>
                </div>
              </div>
            </div>
          )}

          {nodeType === "pcs" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Cpu className="size-3.5 text-sky-400" />
                Inverter Dual-Side Electrical Telemetry
              </h4>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                {/* AC Grid Side */}
                <div className="p-3 rounded-xl bg-theme-elevated/30 border border-theme-subtle space-y-1.5">
                  <span className="text-[10px] font-bold text-sky-400 uppercase">AC Side (Grid-Facing)</span>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-theme-secondary">Voltage (VLL):</span>
                    <span className="font-bold text-theme-primary">415.2 / 414.8 V</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-theme-secondary">Current (IL):</span>
                    <span className="font-bold text-theme-primary">14.4 / 14.2 A</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-theme-secondary">Frequency:</span>
                    <span className="font-bold text-theme-primary">50.02 Hz</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-theme-secondary">Apparent:</span>
                    <span className="font-bold text-theme-primary">76.2 kVA</span>
                  </div>
                </div>

                {/* DC BESS Side */}
                <div className="p-3 rounded-xl bg-theme-elevated/30 border border-theme-subtle space-y-1.5">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">DC Side (BESS-Facing)</span>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-theme-secondary">DC Bus Voltage:</span>
                    <span className="font-bold text-theme-primary">871.3 V</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-theme-secondary">DC Current:</span>
                    <span className="font-bold text-theme-primary">12.11 A</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-theme-secondary">Efficiency:</span>
                    <span className="font-bold text-[#00E676]">98.4%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-theme-secondary">Operating State:</span>
                    <span className="font-bold text-cyan-400">Charging</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {nodeType === "grid" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Zap className="size-3.5 text-purple-400" />
                Interconnection Substation Metrics
              </h4>

              <div className="p-3 rounded-xl bg-theme-elevated/30 border border-theme-subtle grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-theme-secondary">Grid Frequency</span>
                  <p className="text-xs font-bold text-theme-primary">49.97 Hz</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Line Voltage</span>
                  <p className="text-xs font-bold text-theme-primary">414.0 V</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Total Current</span>
                  <p className="text-xs font-bold text-theme-primary">106.8 A</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">THD-V / THD-I</span>
                  <p className="text-xs font-bold text-[#00E676]">1.8% / 2.4%</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">TOU Slot</span>
                  <p className="text-xs font-bold text-amber-400">Normal (₹6.80/kWh)</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Power Direction</span>
                  <p className="text-xs font-bold text-purple-400">
                    {isGridImport ? "Importing (+)" : "Exporting (-)"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {nodeType === "solar" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sun className="size-3.5 text-amber-400" />
                Solar Array & Irradiance Performance
              </h4>

              <div className="p-3 rounded-xl bg-theme-elevated/30 border border-theme-subtle grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-theme-secondary">Solar Irradiance</span>
                  <p className="text-xs font-bold text-[#FFD600]">842 W/m²</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Module Temp</span>
                  <p className="text-xs font-bold text-amber-400">42.1°C</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Performance Ratio</span>
                  <p className="text-xs font-bold text-[#00E676]">82.4% PR</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Today&apos;s Generation</span>
                  <p className="text-xs font-bold text-theme-primary">486.2 kWh</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Active Strings</span>
                  <p className="text-xs font-bold text-theme-primary">16 / 16 Online</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Soiling Loss Est.</span>
                  <p className="text-xs font-bold text-[#00E676]">0.4% (Clean)</p>
                </div>
              </div>
            </div>
          )}

          {nodeType === "dg" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Flame className="size-3.5 text-orange-400" />
                Genset Controller Supervisory Telemetry
              </h4>

              <div className="p-3 rounded-xl bg-theme-elevated/30 border border-theme-subtle grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-theme-secondary">Engine Speed</span>
                  <p className="text-xs font-bold text-theme-primary">{isDgRunning ? "1,500 RPM" : "0 RPM"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Fuel Level</span>
                  <p className="text-xs font-bold text-orange-400">84% (420 L)</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Coolant Temp</span>
                  <p className="text-xs font-bold text-theme-primary">28.4°C</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Oil Pressure</span>
                  <p className="text-xs font-bold text-theme-primary">{isDgRunning ? "4.2 bar" : "0.0 bar"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Starter Battery</span>
                  <p className="text-xs font-bold text-[#00E676]">26.8 V (Ready)</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Total Run Hours</span>
                  <p className="text-xs font-bold text-theme-primary">142.5 hrs</p>
                </div>
              </div>
            </div>
          )}

          {nodeType === "load" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Factory className="size-3.5 text-[#FF2A85]" />
                Building Demand & Contracted Thresholds
              </h4>

              <div className="p-3 rounded-xl bg-theme-elevated/30 border border-theme-subtle grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-theme-secondary">Building Baseline</span>
                  <p className="text-xs font-bold text-theme-primary">88.4 kW</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">EV Station Demand</span>
                  <p className="text-xs font-bold text-cyan-400">12.0 kW</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Peak Demand Today</span>
                  <p className="text-xs font-bold text-amber-400">142.0 kW</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Max Demand Limit</span>
                  <p className="text-xs font-bold text-theme-primary">250 kVA (56% MD)</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Phase Imbalance</span>
                  <p className="text-xs font-bold text-[#00E676]">1.2% (Balanced)</p>
                </div>
                <div>
                  <span className="text-[10px] text-theme-secondary">Apparent kVA</span>
                  <p className="text-xs font-bold text-purple-400">104.6 kVA</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Direct Tab CTA */}
        <div className="p-3 border-t border-theme-subtle bg-theme-elevated/40 flex items-center justify-between">
          <span className="text-[10px] font-mono text-theme-muted flex items-center gap-1.5">
            <CheckCircle2 className="size-3 text-[#00E676]" />
            SCADA Modbus Register Stream Online
          </span>

          <button
            type="button"
            onClick={handleNavigate}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:opacity-95"
            style={{ backgroundColor: current.tagColor }}
          >
            <span>{current.tabLabel}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
