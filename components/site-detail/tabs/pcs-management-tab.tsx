"use client";

import React, { useState } from "react";
import { SiteRecord } from "@/lib/energy/types";

interface PcsManagementTabProps {
  site: SiteRecord;
}

export function PcsManagementTab({ site: _site }: PcsManagementTabProps) {
  void _site;
  const [operatingMode, setOperatingMode] = useState<"following" | "forming" | "standby">("following");
  const [activeUnit, setActiveUnit] = useState("PCS-02");
  const [chargePowerSetpoint, setChargePowerSetpoint] = useState("2000");
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  const handleCommand = (action: string) => {
    setCommandFeedback(`Command "${action}" acknowledged by Modbus PLC.`);
    setTimeout(() => setCommandFeedback(null), 3000);
  };

  const eventLogs = [
    { time: "11:02:14", unit: "PCS-02", type: "Power Setpoint", severity: "INFO", desc: "Target 2,000 kW set by EMS auto-dispatch" },
    { time: "10:45:00", unit: "PCS-01", type: "Mode Changed", severity: "INFO", desc: "Operating mode set to Grid Following" },
    { time: "09:30:12", unit: "PCS-02", type: "Overtemp Warning Cleared", severity: "INFO", desc: "Coolant loop stabilized at 32.1°C" },
    { time: "08:15:40", unit: "PCS-03", type: "Communication OK", severity: "INFO", desc: "Modbus TCP heartbeat verified at 10ms" },
    { time: "06:00:00", unit: "PCS-02", type: "Black Start Self-Check", severity: "INFO", desc: "Passed 100% pre-charge diagnostic sequence" },
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200 font-mono">
      {/* 1. PCS Fleet Aggregate KPI Banner (7 Items) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Availability</span>
          <span className="text-sm font-black text-[#00E676] mt-1">98.4%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Running Units</span>
          <span className="text-sm font-black text-theme-primary mt-1">15 Units</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Fleet AC Power</span>
          <span className="text-sm font-black text-cyan-400 mt-1">1.96 MW</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Fleet DC Power</span>
          <span className="text-sm font-black text-[#FFD600] mt-1">9.84 MW</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Conversion Eff.</span>
          <span className="text-sm font-black text-[#00E676] mt-1">97.8%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Reactive Power</span>
          <span className="text-sm font-black text-purple-400 mt-1">-0.08 MVAR</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Faulted Units</span>
          <span className="text-sm font-black text-[#00E676] mt-1">0</span>
        </div>
      </div>

      {commandFeedback && (
        <div className="p-3 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 text-xs text-[#00E676] font-bold animate-pulse">
          ✓ {commandFeedback}
        </div>
      )}

      {/* 2. Device Master Record & Selected Unit Switcher */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme-subtle pb-3">
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full bg-[#00E676] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-theme-primary uppercase">
                  Device Record: {activeUnit}
                </h3>
                <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
                  Running (Healthy)
                </span>
              </div>
              <p className="text-[11px] text-theme-secondary mt-0.5">
                Model: VT-PCS-2500 • Rated: 2,500 kVA • S/N: VTPCS2500-02-0007 • Firmware: 7.3.2.14
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-theme-secondary">Select Unit:</span>
            <select
              value={activeUnit}
              onChange={(e) => setActiveUnit(e.target.value)}
              className="p-1.5 rounded bg-theme-elevated border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-[#FF2A85]"
            >
              <option value="PCS-01">PCS-01 (2,500 kVA)</option>
              <option value="PCS-02">PCS-02 (2,500 kVA)</option>
              <option value="PCS-03">PCS-03 (2,500 kVA)</option>
              <option value="PCS-04">PCS-04 (2,500 kVA)</option>
            </select>
          </div>
        </div>

        {/* 3. Dual-Side Electrical Telemetry Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AC Side (Grid-Facing) */}
          <div className="p-4 rounded-xl bg-theme-elevated border border-theme-subtle flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
              <span className="font-bold text-cyan-400 uppercase">AC Side (Grid-Facing)</span>
              <span className="text-[10px] text-theme-secondary">Class 0.2S</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">3-Phase Voltage (VLL):</span>
              <span className="font-bold text-theme-primary">415.2 / 414.8 / 415.0 V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">3-Phase Current (IL):</span>
              <span className="font-bold text-theme-primary">14.4 / 14.2 / 14.1 A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">Grid Frequency:</span>
              <span className="font-bold text-cyan-400">50.02 Hz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">Power Factor:</span>
              <span className="font-bold text-[#00E676]">0.96 (Lead)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">Active Power (P):</span>
              <span className="font-bold text-theme-primary">1.96 MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">Reactive Power (Q):</span>
              <span className="font-bold text-purple-400">-0.08 MVAR</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-theme-subtle/40">
              <span className="text-theme-secondary font-bold">Apparent Power (S):</span>
              <span className="font-black text-theme-primary">2.01 MVA</span>
            </div>
          </div>

          {/* DC Side (BESS-Facing) */}
          <div className="p-4 rounded-xl bg-theme-elevated border border-theme-subtle flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
              <span className="font-bold text-[#FFD600] uppercase">DC Side (BESS-Facing)</span>
              <span className="text-[10px] text-theme-secondary">DC Shunt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">DC Bus Voltage:</span>
              <span className="font-bold text-theme-primary">871.3 V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">DC Current:</span>
              <span className="font-bold text-theme-primary">12.11 A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">Total DC Power:</span>
              <span className="font-bold text-[#FFD600]">9.84 MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">Charge Power:</span>
              <span className="font-bold text-cyan-400">9.84 MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">Discharge Power:</span>
              <span className="font-bold text-slate-400">0.00 MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-secondary">Operating State:</span>
              <span className="font-bold text-[#00E676]">Charging Active</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-theme-subtle/40">
              <span className="text-theme-secondary font-bold">Conversion Efficiency:</span>
              <span className="font-black text-[#00E676]">97.8%</span>
            </div>
          </div>
        </div>

        {/* 4. Command & Mode Control Panel + Protection States */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Actuation Controls */}
          <div className="p-4 rounded-xl bg-theme-elevated border border-theme-subtle flex flex-col gap-3 text-xs">
            <span className="font-bold text-theme-primary uppercase">
              PCS SCADA Command Dispatch
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCommand("Start PCS")}
                className="px-3 py-1.5 rounded bg-[#00E676] text-black font-bold hover:bg-[#00E676]/90 cursor-pointer"
              >
                Start PCS
              </button>
              <button
                type="button"
                onClick={() => handleCommand("Stop PCS")}
                className="px-3 py-1.5 rounded bg-transparent border border-rose-500 text-rose-400 font-bold hover:bg-rose-500/10 cursor-pointer"
              >
                Stop PCS
              </button>
              <button
                type="button"
                onClick={() => handleCommand("Reset Faults")}
                className="px-3 py-1.5 rounded bg-theme-card border border-theme-subtle text-theme-secondary hover:text-theme-primary cursor-pointer"
              >
                Reset Faults
              </button>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[10px] text-theme-secondary uppercase">
                Grid Mode Selection
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOperatingMode("following")}
                  className={`flex-1 py-1 rounded text-xs transition-all ${
                    operatingMode === "following"
                      ? "bg-[#FF2A85] text-white font-bold"
                      : "bg-theme-card text-theme-secondary"
                  }`}
                >
                  Grid Following
                </button>
                <button
                  type="button"
                  onClick={() => setOperatingMode("forming")}
                  className={`flex-1 py-1 rounded text-xs transition-all ${
                    operatingMode === "forming"
                      ? "bg-[#FF2A85] text-white font-bold"
                      : "bg-theme-card text-theme-secondary"
                  }`}
                >
                  Grid Forming
                </button>
                <button
                  type="button"
                  onClick={() => setOperatingMode("standby")}
                  className={`flex-1 py-1 rounded text-xs transition-all ${
                    operatingMode === "standby"
                      ? "bg-[#FF2A85] text-white font-bold"
                      : "bg-theme-card text-theme-secondary"
                  }`}
                >
                  Standby
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={chargePowerSetpoint}
                onChange={(e) => setChargePowerSetpoint(e.target.value)}
                className="w-32 px-2.5 py-1 rounded bg-theme-input border border-theme-subtle text-theme-primary text-xs"
                placeholder="kW"
              />
              <button
                type="button"
                onClick={() => handleCommand(`Set Power to ${chargePowerSetpoint} kW`)}
                className="px-3 py-1 rounded bg-[#FF2A85] text-white font-bold text-xs cursor-pointer hover:bg-[#FF2A85]/90"
              >
                Set Power
              </button>
            </div>
          </div>

          {/* Protection Interlocks */}
          <div className="p-4 rounded-xl bg-theme-elevated border border-theme-subtle flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-theme-primary uppercase">
              Protection Interlock Matrix
            </span>
            <div className="flex justify-between items-center">
              <span className="text-theme-secondary">DC Overvoltage Protection:</span>
              <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
                NORMAL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-secondary">AC Underfrequency Protection:</span>
              <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
                NORMAL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-secondary">IGBT Thermal Overload:</span>
              <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
                NORMAL (68.4°C)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-secondary">Modbus Communication:</span>
              <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
                NORMAL (10ms)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-secondary">Liquid Cooling Loop:</span>
              <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
                NORMAL (32.4°C)
              </span>
            </div>
          </div>
        </div>

        {/* 5. Latest Event Log Table */}
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-xs font-bold text-theme-primary uppercase">
            Hardware Event Log (Latest 5 Sequence Events)
          </span>
          <div className="overflow-x-auto no-scrollbar rounded-lg border border-theme-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-elevated text-theme-muted uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Unit</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Event Type</th>
                  <th className="py-2 px-3">Payload Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle/30 bg-theme-card">
                {eventLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-theme-elevated/40">
                    <td className="py-2 px-3 text-theme-secondary">{log.time}</td>
                    <td className="py-2 px-3 font-bold text-theme-primary">{log.unit}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.2 rounded border border-[#00E676]/30 font-bold">
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-cyan-400 font-semibold">{log.type}</td>
                    <td className="py-2 px-3 text-theme-muted">{log.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
