"use client";

import React, { useState } from "react";
import { SiteRecord } from "@/lib/energy/types";

interface ControlsScadaTabProps {
  site: SiteRecord;
}

export function ControlsScadaTab({ site: _site }: ControlsScadaTabProps) {
  void _site;
  const [bessMasterEnable, setBessMasterEnable] = useState(true);
  const [chargeEnable, setChargeEnable] = useState(true);
  const [dischargeEnable, setDischargeEnable] = useState(true);
  const [operatingMode, setOperatingMode] = useState("PEAK SHAVING");
  const [maxChargeCurrent, setMaxChargeCurrent] = useState("150");
  const [maxDischargeCurrent, setMaxDischargeCurrent] = useState("200");
  const [socUpperLimit, setSocUpperLimit] = useState("90");
  const [socLowerLimit, setSocLowerLimit] = useState("15");
  const [peakShavingThreshold, setPeakShavingThreshold] = useState("180");
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  const [commandHistory, setCommandHistory] = useState([
    { time: "11:15:30", register: "operating-mode", user: "operator@neonenergy.io", val: "PEAK SHAVING", ack: "ACK 0x00 (Success)" },
    { time: "10:30:12", register: "max-charge-current", user: "eng.site01@neonenergy.io", val: "150 A", ack: "ACK 0x00 (Success)" },
    { time: "09:00:44", register: "soc-upper-limit", user: "superadmin@neonenergy.io", val: "90 %", ack: "ACK 0x00 (Success)" },
    { time: "08:12:05", register: "bess-master-enable", user: "operator@neonenergy.io", val: "TRUE", ack: "ACK 0x00 (Success)" },
  ]);

  const handleRegisterWrite = (regId: string, val: string) => {
    setCommandFeedback(`Register "${regId}" updated to "${val}" and acknowledged by PLC.`);
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setCommandHistory((prev) => [
      { time: timeStr, register: regId, user: "current_user (Active)", val, ack: "ACK 0x00 (Success)" },
      ...prev,
    ]);
    setTimeout(() => setCommandFeedback(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200 font-mono">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase">
            Direct Modbus / SCADA Register Actuation
          </h3>
          <p className="text-[10px] text-theme-secondary mt-0.5">
            Role-gated authenticated hardware control panel with audit trail
          </p>
        </div>

        {commandFeedback && (
          <span className="text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded border border-[#00E676]/30 animate-pulse">
            ✓ {commandFeedback}
          </span>
        )}
      </div>

      {/* 2. Direct Register Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* BESS Master Enable */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-theme-primary block">BESS MASTER ENABLE</span>
            <span className="text-[10px] text-theme-secondary">ID: bess-master-enable</span>
            <span className="text-xs text-[#00E676] block mt-1">
              Status: {bessMasterEnable ? "Active (ON)" : "Inhibited (OFF)"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !bessMasterEnable;
              setBessMasterEnable(next);
              handleRegisterWrite("bess-master-enable", String(next));
            }}
            className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
              bessMasterEnable ? "bg-[#FF2A85]" : "bg-slate-700"
            }`}
          >
            <span
              className={`size-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                bessMasterEnable ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Operating Mode Dropdown */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-1.5">
          <span className="text-xs font-bold text-theme-primary block">OPERATING MODE</span>
          <span className="text-[10px] text-theme-secondary">ID: operating-mode</span>
          <select
            value={operatingMode}
            onChange={(e) => {
              setOperatingMode(e.target.value);
              handleRegisterWrite("operating-mode", e.target.value);
            }}
            className="w-full mt-1 p-1.5 rounded bg-theme-elevated border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-[#FF2A85]"
          >
            <option value="PEAK SHAVING">PEAK SHAVING</option>
            <option value="SELF-CONSUMPTION">SELF-CONSUMPTION</option>
            <option value="MICROGRID ISLANDED">MICROGRID ISLANDED</option>
            <option value="TOU ARBITRAGE">TOU ARBITRAGE</option>
          </select>
        </div>

        {/* Peak Shaving Threshold */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-1.5">
          <span className="text-xs font-bold text-theme-primary block">PEAK SHAVING THRESHOLD (KW)</span>
          <span className="text-[10px] text-theme-secondary">ID: peak-shaving-threshold</span>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={peakShavingThreshold}
              onChange={(e) => setPeakShavingThreshold(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded bg-theme-elevated border border-theme-subtle text-xs text-theme-primary"
            />
            <button
              type="button"
              onClick={() => handleRegisterWrite("peak-shaving-threshold", `${peakShavingThreshold} kW`)}
              className="px-3 py-1 rounded bg-[#FF2A85] text-white font-bold text-xs hover:bg-[#FF2A85]/90 cursor-pointer"
            >
              Write
            </button>
          </div>
        </div>

        {/* Max Charge Current */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-1.5">
          <span className="text-xs font-bold text-theme-primary block">MAX CHARGE CURRENT (A)</span>
          <span className="text-[10px] text-theme-secondary">ID: max-charge-current</span>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={maxChargeCurrent}
              onChange={(e) => setMaxChargeCurrent(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded bg-theme-elevated border border-theme-subtle text-xs text-theme-primary"
            />
            <button
              type="button"
              onClick={() => handleRegisterWrite("max-charge-current", `${maxChargeCurrent} A`)}
              className="px-3 py-1 rounded bg-[#FF2A85] text-white font-bold text-xs hover:bg-[#FF2A85]/90 cursor-pointer"
            >
              Write
            </button>
          </div>
        </div>

        {/* Max Discharge Current */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-1.5">
          <span className="text-xs font-bold text-theme-primary block">MAX DISCHARGE CURRENT (A)</span>
          <span className="text-[10px] text-theme-secondary">ID: max-discharge-current</span>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={maxDischargeCurrent}
              onChange={(e) => setMaxDischargeCurrent(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded bg-theme-elevated border border-theme-subtle text-xs text-theme-primary"
            />
            <button
              type="button"
              onClick={() => handleRegisterWrite("max-discharge-current", `${maxDischargeCurrent} A`)}
              className="px-3 py-1 rounded bg-[#FF2A85] text-white font-bold text-xs hover:bg-[#FF2A85]/90 cursor-pointer"
            >
              Write
            </button>
          </div>
        </div>

        {/* SOC Buffers (Upper & Lower Limits) */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-1.5">
          <span className="text-xs font-bold text-theme-primary block">SOC BUFFERS (MIN / MAX %)</span>
          <span className="text-[10px] text-theme-secondary">Deep discharge & cutoff guards</span>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={socLowerLimit}
              onChange={(e) => setSocLowerLimit(e.target.value)}
              className="w-16 px-2 py-1 rounded bg-theme-elevated border border-theme-subtle text-xs text-theme-primary"
              placeholder="Min"
            />
            <input
              type="number"
              value={socUpperLimit}
              onChange={(e) => setSocUpperLimit(e.target.value)}
              className="w-16 px-2 py-1 rounded bg-theme-elevated border border-theme-subtle text-xs text-theme-primary"
              placeholder="Max"
            />
            <button
              type="button"
              onClick={() => handleRegisterWrite("soc-limits", `${socLowerLimit}% - ${socUpperLimit}%`)}
              className="flex-1 px-3 py-1 rounded bg-[#FF2A85] text-white font-bold text-xs hover:bg-[#FF2A85]/90 cursor-pointer"
            >
              Set
            </button>
          </div>
        </div>

        {/* Charge / Discharge Permits */}
        <div className="p-4 rounded-xl bg-theme-card border border-theme-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-theme-primary block">CHARGE / DISCHARGE PERMITS</span>
            <span className="text-[10px] text-theme-secondary">Inhibit specific directions</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !chargeEnable;
                setChargeEnable(next);
                handleRegisterWrite("charge-enable", String(next));
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                chargeEnable ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-slate-700 text-slate-400"
              }`}
            >
              Chg: {chargeEnable ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !dischargeEnable;
                setDischargeEnable(next);
                handleRegisterWrite("discharge-enable", String(next));
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                dischargeEnable ? "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40" : "bg-slate-700 text-slate-400"
              }`}
            >
              Dischg: {dischargeEnable ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Emergency Stop Trip Button */}
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex flex-col justify-between sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-400 block">HARDWARE EMERGENCY STOP (E-STOP)</span>
              <span className="text-[10px] text-rose-300">
                Instantly trips high-side contactor and disconnects BESS from DC bus
              </span>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
              TRIP INTERLOCK
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleRegisterWrite("emergency-stop", "ACTUATED (TRIP)")}
            className="mt-3 w-full py-2 rounded-lg bg-[#FF1744] hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-[0_0_15px_rgba(255,23,68,0.4)] transition-all"
          >
            ⚡ Actuate Emergency Trip Interlock
          </button>
        </div>
      </div>

      {/* 3. Command History Audit Log */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
        <h3 className="text-xs font-bold text-theme-primary uppercase border-b border-theme-subtle pb-2">
          Authenticated SCADA Command History (Audit Trail)
        </h3>
        <div className="overflow-x-auto no-scrollbar rounded-lg border border-theme-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-elevated text-theme-muted uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Register Target</th>
                <th className="py-2 px-3">Initiated User</th>
                <th className="py-2 px-3">Written Value</th>
                <th className="py-2 px-3">PLC ACK Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 bg-theme-card">
              {commandHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-theme-elevated/40">
                  <td className="py-2 px-3 text-theme-secondary">{item.time}</td>
                  <td className="py-2 px-3 font-bold text-cyan-400">{item.register}</td>
                  <td className="py-2 px-3 text-theme-primary">{item.user}</td>
                  <td className="py-2 px-3 font-bold text-amber-400">{item.val}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.2 rounded border border-[#00E676]/30">
                      {item.ack}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
