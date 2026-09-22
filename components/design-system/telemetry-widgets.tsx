"use client";

import React from "react";
import { Battery, Sun, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TelemetryWidgetsShowcase() {
  // 16 BESS cells mock data with varying temperatures
  const cells = [
    { id: 1, temp: 24.2, v: 3.28 },
    { id: 2, temp: 24.5, v: 3.29 },
    { id: 3, temp: 25.1, v: 3.28 },
    { id: 4, temp: 24.8, v: 3.27 },
    { id: 5, temp: 25.4, v: 3.29 },
    { id: 6, temp: 26.0, v: 3.28 },
    { id: 7, temp: 28.3, v: 3.26 },
    { id: 8, temp: 31.2, v: 3.25 },
    { id: 9, temp: 24.9, v: 3.28 },
    { id: 10, temp: 25.0, v: 3.28 },
    { id: 11, temp: 25.6, v: 3.29 },
    { id: 12, temp: 27.1, v: 3.27 },
    { id: 13, temp: 37.8, v: 3.24 }, // Elevated / Warning
    { id: 14, temp: 26.2, v: 3.28 },
    { id: 15, temp: 25.3, v: 3.29 },
    { id: 16, temp: 24.7, v: 3.28 },
  ];

  // 12-channel MPPT string currents
  const mpptStrings = [
    { str: "STR-01", current: 9.8, status: "normal" },
    { str: "STR-02", current: 9.7, status: "normal" },
    { str: "STR-03", current: 9.9, status: "normal" },
    { str: "STR-04", current: 6.2, status: "warning" }, // Soiling / Fuse warning (<85%)
    { str: "STR-05", current: 9.8, status: "normal" },
    { str: "STR-06", current: 9.6, status: "normal" },
    { str: "STR-07", current: 9.8, status: "normal" },
    { str: "STR-08", current: 9.7, status: "normal" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Widget 1: BESS BMS Cell Thermal Matrix & Delta-V */}
      <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
                <Battery className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                  BESS BMS Rack 01 Telemetry
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  16S LiFePO4 Pack • 51.2V Nominal
                </span>
              </div>
            </div>
            <Badge variant="bess">RACK ONLINE</Badge>
          </div>

          {/* Key BMS Electrical Gauges */}
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Pack SoC
              </span>
              <div className="text-lg font-bold font-mono text-[#00F0FF] mt-0.5">
                84.2%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                State of Health
              </span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                96.8%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Cell Delta-V
              </span>
              <div className="text-lg font-bold font-mono text-[#00E676] mt-0.5">
                18 mV
              </div>
            </div>
          </div>

          {/* 16-Cell Thermal Heatmap Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                16-Cell Thermal Heatmap Matrix
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Range: 24.2°C – 37.8°C
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {cells.map((cell) => {
                const isWarning = cell.temp > 35;
                const isWarm = cell.temp > 28 && cell.temp <= 35;

                return (
                  <div
                    key={cell.id}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      isWarning
                        ? "bg-[#FFAB00]/15 border-[#FFAB00]/50 shadow-[0_0_10px_rgba(255,171,0,0.3)]"
                        : isWarm
                        ? "bg-[#FFD600]/10 border-[#FFD600]/30"
                        : "bg-[#121622] border-white/[0.06] hover:border-[#00F0FF]/40"
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 font-mono">
                      C{cell.id.toString().padStart(2, "0")}
                    </div>
                    <div
                      className={`text-xs font-black font-mono mt-0.5 ${
                        isWarning
                          ? "text-[#FFAB00]"
                          : isWarm
                          ? "text-[#FFD600]"
                          : "text-[#00F0FF]"
                      }`}
                    >
                      {cell.temp.toFixed(1)}°C
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      {cell.v.toFixed(2)}V
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Coolant Loop Inlet/Outlet:</span>
          <span className="text-white font-bold">22.4°C / 26.8°C (Normal)</span>
        </div>
      </div>

      {/* Widget 2: Solar Inverter MPPT String Table */}
      <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#FFD600]/10 text-[#FFD600]">
                <Sun className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                  Inverter 01 MPPT String Table
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  125 kW String Inverter • η = 98.4%
                </span>
              </div>
            </div>
            <Badge variant="solar">GENERATING</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                DC Voltage
              </span>
              <div className="text-lg font-bold font-mono text-[#FFD600] mt-0.5">
                680 V
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                AC Frequency
              </span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                50.01 Hz
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Daily PR %
              </span>
              <div className="text-lg font-bold font-mono text-[#00E676] mt-0.5">
                83.4%
              </div>
            </div>
          </div>

          {/* MPPT Channels Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Active MPPT String Currents
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Group Median: 9.8 A
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mpptStrings.map((item) => (
                <div
                  key={item.str}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    item.status === "warning"
                      ? "bg-[#FFAB00]/10 border-[#FFAB00]/40 shadow-[0_0_8px_rgba(255,171,0,0.2)]"
                      : "bg-[#121622] border-white/[0.06]"
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400">
                    {item.str}
                  </div>
                  <div
                    className={`text-base font-black font-mono mt-0.5 ${
                      item.status === "warning"
                        ? "text-[#FFAB00]"
                        : "text-white"
                    }`}
                  >
                    {item.current} A
                  </div>
                  <div className="mt-1">
                    {item.status === "warning" ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FFAB00]/20 text-[#FFAB00] font-bold">
                        SOILING WARN
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00E676]/10 text-[#00E676]">
                        OPTIMAL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Active Warning:</span>
          <span className="text-[#FFAB00] font-bold flex items-center gap-1">
            <AlertTriangle className="size-3.5" /> String 04 Current &lt; 85% of Median
          </span>
        </div>
      </div>
    </div>
  );
}
