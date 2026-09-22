"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Sun,
  BatteryCharging,
  Zap,
  Flame,
  Factory,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  Gauge,
  Layers,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { EnergyFlowState } from "@/lib/energy/flow-engine";

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nodeType: "solar" | "bess" | "dg" | "grid" | "load" | null;
  flowState: EnergyFlowState;
  siteId?: string;
}

export function TelemetryDrawer({
  isOpen,
  onClose,
  nodeType,
  flowState,
  siteId,
}: TelemetryDrawerProps) {
  if (!isOpen || !nodeType) return null;

  const { details } = flowState;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Click outside backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        aria-label="Close drawer"
      />

      {/* Slide-Over Drawer Container */}
      <div className="relative w-full sm:w-[520px] lg:w-[580px] h-full bg-[#0B0D13] border-l border-white/[0.08] p-5 sm:p-6 overflow-y-auto flex flex-col justify-between shadow-2xl z-10">
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              {nodeType === "solar" && (
                <div className="p-2.5 rounded-lg bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30">
                  <Sun className="size-5" />
                </div>
              )}
              {nodeType === "bess" && (
                <div className="p-2.5 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                  <BatteryCharging className="size-5" />
                </div>
              )}
              {nodeType === "dg" && (
                <div className="p-2.5 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30">
                  <Flame className="size-5" />
                </div>
              )}
              {nodeType === "grid" && (
                <div className="p-2.5 rounded-lg bg-[#9D4EDD]/10 text-[#9D4EDD] border border-[#9D4EDD]/30">
                  <Zap className="size-5" />
                </div>
              )}
              {nodeType === "load" && (
                <div className="p-2.5 rounded-lg bg-[#FF2A85]/10 text-[#FF2A85] border border-[#FF2A85]/30">
                  <Factory className="size-5" />
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  {nodeType === "solar" && "Solar Inverter & String Diagnostics"}
                  {nodeType === "bess" && "BESS BMS & Cell Thermal Matrix"}
                  {nodeType === "dg" && "Diesel Generator Peaker Telemetry"}
                  {nodeType === "grid" && "Utility Grid Intertie Substation"}
                  {nodeType === "load" && "Facility Load & Power Quality"}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Sub-second Modbus RTU / SCADA Diagnostic Feed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {siteId && (
                <Link
                  href={`/sites/${siteId}/${nodeType}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#FF2A85]/15 hover:bg-[#FF2A85]/25 text-[#FF2A85] border border-[#FF2A85]/30 transition-colors"
                >
                  <span className="hidden sm:inline">Deep Dive</span>
                  <ExternalLink className="size-3" />
                </Link>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121622] transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Subsystem Telemetry Details */}

          {/* 1. SOLAR SUBSYSTEM */}
          {nodeType === "solar" && (
            <div className="space-y-5">
              {/* Primary Inverter KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Active Power
                  </span>
                  <div className="text-base font-bold font-mono text-[#FFD600] mt-1">
                    {flowState.sourceOutputs.solar.totalKw.toLocaleString()} kW
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Efficiency (η)
                  </span>
                  <div className="text-base font-bold font-mono text-[#00E676] mt-1">
                    {details.solar.inverterEfficiencyPct}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Irradiance
                  </span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {details.solar.irradianceWpm2} W/m²
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Perf. Ratio
                  </span>
                  <div className="text-base font-bold font-mono text-[#FFD600] mt-1">
                    {details.solar.performanceRatioPct}%
                  </div>
                </div>
              </div>

              {/* 12-Channel MPPT String Current Table */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-[#FFD600]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      12-Channel MPPT String Current Matrix
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    String Inverter 100KTL
                  </span>
                </div>

                <div className="rounded-xl bg-[#121622]/60 border border-white/[0.06] overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#121622] text-[10px] text-slate-400 uppercase border-b border-white/[0.06]">
                      <tr>
                        <th className="py-2 px-3">String</th>
                        <th className="py-2 px-3">Voltage</th>
                        <th className="py-2 px-3">Current</th>
                        <th className="py-2 px-3">Power</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {details.solar.mpptChannels.map((ch) => (
                        <tr key={ch.channel} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-semibold text-white">
                            MPPT #{ch.channel}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {ch.voltageV} V
                          </td>
                          <td className="py-2 px-3 text-slate-200">
                            {ch.currentA} A
                          </td>
                          <td className="py-2 px-3 font-bold text-[#FFD600]">
                            {ch.powerKw} kW
                          </td>
                          <td className="py-2 px-3 text-right">
                            {ch.status === "normal" ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                                NORMAL
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                                <AlertTriangle className="size-2.5" /> SOILING
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. BESS SUBSYSTEM */}
          {nodeType === "bess" && (
            <div className="space-y-5">
              {/* Primary BESS KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    State of Charge
                  </span>
                  <div className="text-base font-bold font-mono text-[#00F0FF] mt-1">
                    {details.bess.socPct.toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    State of Health
                  </span>
                  <div className="text-base font-bold font-mono text-[#00E676] mt-1">
                    {details.bess.sohPct}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Pack Voltage
                  </span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {details.bess.packVoltageV} V
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Pack Current
                  </span>
                  <div className="text-base font-bold font-mono text-[#00F0FF] mt-1">
                    {details.bess.packCurrentA} A
                  </div>
                </div>
              </div>

              {/* Cell Delta-V & Coolant Loop Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#121622] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Cell Voltage Delta (ΔV)
                    </div>
                    <div className="text-lg font-bold font-mono text-[#00F0FF] mt-0.5">
                      {details.bess.cellDeltaVMv} mV
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                    BALANCED (&lt;50mV)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#121622] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Coolant Loop Loop Temp
                    </div>
                    <div className="text-lg font-bold font-mono text-[#00F0FF] mt-0.5 flex items-center gap-1">
                      <Thermometer className="size-4 text-[#00F0FF]" />
                      {details.bess.coolantTempC}°C
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    CHILLER RUNNING
                  </span>
                </div>
              </div>

              {/* 16-Cell Thermal Heatmap Matrix */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="size-4 text-[#00F0FF]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      16-Cell Thermal Heatmap Grid (4×4 Matrix)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Max: {details.bess.cellMaxTempC}°C
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {details.bess.thermalMatrix16.map((cell) => {
                    const isElevated = cell.status === "elevated";
                    const isHotspot = cell.status === "hotspot";

                    return (
                      <div
                        key={cell.cellId}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isHotspot
                            ? "bg-[#FF1744]/20 border-[#FF1744] text-white shadow-[0_0_10px_rgba(255,23,68,0.4)]"
                            : isElevated
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                            : "bg-[#121622] border-cyan-500/20 text-cyan-100 hover:border-cyan-500/50"
                        }`}
                      >
                        <div className="text-[9px] font-mono uppercase text-slate-400">
                          Cell #{cell.cellId}
                        </div>
                        <div className="text-sm font-bold font-mono mt-0.5">
                          {cell.tempC}°C
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                          {cell.voltageMv} mV
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. DIESEL GENERATOR SUBSYSTEM */}
          {nodeType === "dg" && (
            <div className="space-y-5">
              {/* Primary DG KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Genset State
                  </span>
                  <div className="text-sm font-bold font-mono text-[#FF6B00] mt-1">
                    {details.dg.state}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Engine Speed
                  </span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {details.dg.rpm} RPM
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Oil Pressure
                  </span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {details.dg.oilPressureBar} bar
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Coolant Temp
                  </span>
                  <div className="text-base font-bold font-mono text-[#FF6B00] mt-1">
                    {details.dg.coolantTempC}°C
                  </div>
                </div>
              </div>

              {/* Fuel Level & Burn Telemetry */}
              <div className="p-4 rounded-xl bg-[#121622] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4 text-[#FF6B00]" />
                    <span className="text-xs font-bold uppercase text-white">
                      Fuel Tank Reserve & Consumption
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-[#FF6B00]">
                    {details.dg.fuelPct}% Full
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.05]">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-[#FF6B00] h-full rounded-full"
                    style={{ width: `${details.dg.fuelPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400">Burn Rate</span>
                    <div className="font-bold text-white mt-0.5">
                      {details.dg.fuelBurnRateLph} L/hr
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400">Starter Battery</span>
                    <div className="font-bold text-[#00E676] mt-0.5">
                      {details.dg.starterBatteryV} V
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400">Total Run Hours</span>
                    <div className="font-bold text-slate-300 mt-0.5">
                      {details.dg.runHours} hrs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. UTILITY GRID SUBSYSTEM */}
          {nodeType === "grid" && (
            <div className="space-y-5">
              {/* Primary Grid KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Grid Frequency
                  </span>
                  <div className="text-base font-bold font-mono text-[#00E676] mt-1">
                    {details.grid.frequencyHz} Hz
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Power Factor (cos φ)
                  </span>
                  <div className="text-base font-bold font-mono text-[#9D4EDD] mt-1">
                    {details.grid.powerFactor}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    THD-V Distortion
                  </span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {details.grid.thdPct}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    TOU Tariff Slot
                  </span>
                  <div className="text-xs font-bold font-mono text-[#FF2A85] mt-1">
                    {details.grid.tariffSlot}
                  </div>
                </div>
              </div>

              {/* 3-Phase Line Voltages */}
              <div className="p-4 rounded-xl bg-[#121622] border border-white/[0.06] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  3-Phase Distribution Voltages (RMS)
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[9px] uppercase text-slate-400">V(L1-L2)</span>
                    <div className="text-base font-bold text-white mt-0.5">
                      {details.grid.voltageL1L2} V
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[9px] uppercase text-slate-400">V(L2-L3)</span>
                    <div className="text-base font-bold text-white mt-0.5">
                      {details.grid.voltageL2L3} V
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[9px] uppercase text-slate-400">V(L3-L1)</span>
                    <div className="text-base font-bold text-white mt-0.5">
                      {details.grid.voltageL3L1} V
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. FACILITY LOAD SUBSYSTEM */}
          {nodeType === "load" && (
            <div className="space-y-5">
              {/* Primary Demand KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Active Demand
                  </span>
                  <div className="text-base font-bold font-mono text-[#FF2A85] mt-1">
                    {details.load.activeDemandKw} kW
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Apparent Power
                  </span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {details.load.apparentPowerKva} kVA
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Reactive Power
                  </span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {details.load.reactivePowerKvar} kVAR
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Power Factor
                  </span>
                  <div className="text-base font-bold font-mono text-[#00E676] mt-1">
                    {details.load.powerFactor}
                  </div>
                </div>
              </div>

              {/* 3-Phase Phase Current Balance */}
              <div className="p-4 rounded-xl bg-[#121622] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Phase Load Currents (Phase Balance)
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                    BALANCED (&lt;2% I-unb)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[9px] uppercase text-slate-400">Phase L1</span>
                    <div className="text-base font-bold text-white mt-0.5">
                      {details.load.phaseL1CurrentA} A
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[9px] uppercase text-slate-400">Phase L2</span>
                    <div className="text-base font-bold text-white mt-0.5">
                      {details.load.phaseL2CurrentA} A
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[9px] uppercase text-slate-400">Phase L3</span>
                    <div className="text-base font-bold text-white mt-0.5">
                      {details.load.phaseL3CurrentA} A
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Bar */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="size-3.5 text-[#00E676]" />
            <span>Industrial SCADA Synced</span>
          </div>

          <div className="flex items-center gap-2">
            {siteId && (
              <Link
                href={`/sites/${siteId}/${nodeType}`}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF2A85] hover:bg-[#ff4297] text-white font-bold text-xs shadow-[0_0_15px_rgba(255,42,133,0.35)] transition-all min-h-[38px]"
              >
                <span>Full {nodeType.toUpperCase()} Analytics</span>
                <ArrowRight className="size-3.5" />
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-200 border border-white/[0.08] transition-colors min-h-[38px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
