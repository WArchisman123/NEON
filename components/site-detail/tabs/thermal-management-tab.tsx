"use client";

import React, { useState } from "react";
import { SiteRecord } from "@/lib/energy/types";

interface ThermalManagementTabProps {
  site: SiteRecord;
}

export function ThermalManagementTab({ site: _site }: ThermalManagementTabProps) {
  void _site;
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const thermalKpis = [
    { label: "Avg Pack Temp", val: "35.0 °C", color: "text-amber-400" },
    { label: "Coolant Inlet", val: "17.3 °C", color: "text-cyan-400" },
    { label: "Coolant Outlet", val: "32.4 °C", color: "text-amber-400" },
    { label: "HVACs Online", val: "4 / 5", color: "text-[#00E676]" },
    { label: "Thermal Alarms", val: "2 Alerts", color: "text-[#FF1744]" },
    { label: "Humidity", val: "53 %RH", color: "text-cyan-400" },
    { label: "Cooling Power", val: "35 kW", color: "text-purple-400" },
    { label: "Thermal COP", val: "3.25 COP", color: "text-[#00E676]" },
  ];

  const rows = ["Row A", "Row B", "Row C", "Row D", "Row E", "Row F"];
  const cols = Array.from({ length: 12 }, (_, i) => `Rack ${i + 1}`);

  // Deterministic cell temperature matrix (6 x 12)
  const getCellTemp = (rIdx: number, cIdx: number) => {
    const base = 26.5 + (rIdx * 1.3) + ((cIdx % 4) * 0.9);
    // Introduce hotspot on Row B, Rack 8
    if (rIdx === 1 && cIdx === 7) return 36.2;
    if (rIdx === 4 && cIdx === 2) return 34.8;
    return Number(base.toFixed(1));
  };

  const getHeatmapColor = (temp: number) => {
    if (temp >= 36) return "bg-[#FF1744] text-white";
    if (temp >= 33) return "bg-[#FF6B00] text-white";
    if (temp >= 30) return "bg-amber-400 text-black";
    if (temp >= 27) return "bg-lime-400 text-black";
    if (temp >= 24) return "bg-[#00E676] text-black";
    return "bg-cyan-400 text-black";
  };

  const hvacAssets = [
    { name: "HVAC-1 (Container Left)", type: "Liquid Chiller", status: "Online", speed: "80%", load: "8.2 kW" },
    { name: "HVAC-2 (Container Center)", type: "Liquid Chiller", status: "Online", speed: "75%", load: "7.9 kW" },
    { name: "HVAC-3 (Container Right)", type: "Liquid Chiller", status: "Maintenance", speed: "0%", load: "0.0 kW" },
    { name: "HVAC-4 (PCS Enclosure)", type: "Direct Expansion", status: "Online", speed: "65%", load: "6.4 kW" },
    { name: "Coolant Loop Pump 1", type: "Variable Speed", status: "Online", speed: "85%", load: "4.1 kW" },
    { name: "Dehumidifier Unit", type: "Refrigerant Cycle", status: "Online", speed: "100%", load: "2.5 kW" },
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200 font-mono">
      {/* 1. Thermal KPI Banner (8 Items) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {thermalKpis.map((k, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
            <span className="text-[10px] text-theme-secondary uppercase truncate">{k.label}</span>
            <span className={`text-sm font-black mt-1 ${k.color}`}>{k.val}</span>
          </div>
        ))}
      </div>

      {/* 2. 72-Zone Rack Temperature Heatmap Matrix (6 Rows x 12 Columns) */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-subtle pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase">
              72-Zone Container Rack Heatmap Matrix
            </h3>
            <p className="text-[10px] text-theme-secondary">
              Real-time multi-level thermal gradient distribution across battery enclosures
            </p>
          </div>

          {/* Color scale legend */}
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-theme-muted">&lt; 24°C</span>
            <div className="flex h-3 w-32 rounded overflow-hidden">
              <span className="flex-1 bg-cyan-400" />
              <span className="flex-1 bg-[#00E676]" />
              <span className="flex-1 bg-lime-400" />
              <span className="flex-1 bg-amber-400" />
              <span className="flex-1 bg-[#FF6B00]" />
              <span className="flex-1 bg-[#FF1744]" />
            </div>
            <span className="text-theme-muted">&gt; 36°C</span>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[700px] flex flex-col gap-1.5">
            {/* Header Columns */}
            <div className="grid grid-cols-13 gap-1 text-[10px] text-theme-muted text-center pb-1">
              <div className="text-left font-bold pl-1">Zone</div>
              {cols.map((col, idx) => (
                <div key={idx} className="truncate">{col}</div>
              ))}
            </div>

            {/* Matrix Rows */}
            {rows.map((rowName, rIdx) => (
              <div key={rIdx} className="grid grid-cols-13 gap-1 items-center">
                <span className="text-[11px] font-bold text-theme-secondary pl-1 truncate">
                  {rowName}
                </span>
                {cols.map((_, cIdx) => {
                  const temp = getCellTemp(rIdx, cIdx);
                  const colorClass = getHeatmapColor(temp);
                  const isHotspot = temp >= 34.5;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setSelectedZone(`${rowName} - Rack ${cIdx + 1}: ${temp}°C`)}
                      className={`h-9 rounded flex flex-col items-center justify-center text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer relative ${colorClass} ${
                        isHotspot ? "ring-2 ring-rose-500 animate-pulse" : ""
                      }`}
                      title={`${rowName} - Rack ${cIdx + 1}: ${temp}°C`}
                    >
                      <span>{temp}°</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {selectedZone && (
          <div className="p-2.5 rounded bg-theme-elevated border border-theme-subtle text-xs text-theme-primary flex justify-between items-center">
            <span>Selected Probe: <strong className="text-cyan-400">{selectedZone}</strong></span>
            <button
              type="button"
              onClick={() => setSelectedZone(null)}
              className="text-[10px] text-theme-muted hover:text-white"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 3. Subsystem Actuation Status Pills */}
      <div className="p-3.5 rounded-xl bg-theme-elevated border border-theme-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary">Cooling Mode:</span>
          <span className="font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
            Active Closed Loop
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary">Compressor:</span>
          <span className="font-bold text-cyan-400">Modulating (74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary">Coolant Pump:</span>
          <span className="font-bold text-theme-primary">85% Speed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary">Airflow Volume:</span>
          <span className="font-bold text-theme-primary">5,175 CFM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary">Condensate:</span>
          <span className="font-bold text-[#00E676]">31% (Nominal)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary">Thermal Health:</span>
          <span className="font-bold text-[#00E676]">STABLE</span>
        </div>
      </div>

      {/* 4. Cooling Equipment Status & Ambient Temperature Regression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cooling Equipment Status Table */}
        <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
          <h3 className="text-xs font-bold text-theme-primary uppercase border-b border-theme-subtle pb-2">
            Active Cooling Infrastructure
          </h3>
          <div className="overflow-x-auto no-scrollbar rounded-lg border border-theme-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-elevated text-theme-muted uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Equipment</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Speed</th>
                  <th className="py-2 px-3">Cooling kW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle/30 bg-theme-card">
                {hvacAssets.map((h, i) => (
                  <tr key={i} className="hover:bg-theme-elevated/40">
                    <td className="py-2 px-3 font-bold text-theme-primary">{h.name}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          h.status === "Online"
                            ? "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-cyan-400">{h.speed}</td>
                    <td className="py-2 px-3 text-theme-primary">{h.load}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ambient Regression Scatter Plot */}
        <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
            <div>
              <h3 className="text-xs font-bold text-theme-primary uppercase">
                Cooling Load vs Ambient Temp Correlation
              </h3>
              <p className="text-[10px] text-theme-secondary">
                Fitted regression model: R² = 0.97
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              R² = 0.97
            </span>
          </div>

          <div className="h-48 w-full flex items-end justify-between gap-2 p-3 rounded-lg bg-theme-elevated/40 border border-theme-subtle relative">
            {[
              { ambient: 20, load: 15 },
              { ambient: 24, load: 21 },
              { ambient: 28, load: 28 },
              { ambient: 32, load: 35 },
              { ambient: 36, load: 44 },
              { ambient: 40, load: 56 },
            ].map((pt, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] text-purple-400 font-bold mb-1">{pt.load} kW</span>
                <div
                  className="w-4 bg-purple-500/80 rounded-t group-hover:bg-purple-400 transition-all"
                  style={{ height: `${(pt.load / 60) * 100}%` }}
                />
                <span className="text-[9px] text-theme-muted">{pt.ambient}°C</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-theme-muted">
            <span>Min Outdoor: 18°C</span>
            <span className="text-amber-400 font-bold">Ambient: 24.7°C (Peak Load 35 kW)</span>
            <span>Max Outdoor: 42°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
