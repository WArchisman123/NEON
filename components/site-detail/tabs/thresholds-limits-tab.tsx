"use client";

import React, { useState } from "react";
import { SiteRecord } from "@/lib/energy/types";

interface ThresholdsLimitsTabProps {
  site: SiteRecord;
}

interface ThresholdRow {
  param: string;
  unit: string;
  minWarn: string;
  maxWarn: string;
  minCrit: string;
  maxCrit: string;
  alerts: boolean;
}

export function ThresholdsLimitsTab({ site: _site }: ThresholdsLimitsTabProps) {
  void _site;
  const [activeCategory, setActiveCategory] = useState<"bess" | "harmonics" | "power">("bess");
  const [isSaved, setIsSaved] = useState(false);

  const bessThresholds: ThresholdRow[] = [
    { param: "DC Pack Voltage", unit: "V", minWarn: "490.0", maxWarn: "540.0", minCrit: "480.0", maxCrit: "547.0", alerts: true },
    { param: "DC Pack Current", unit: "A", minWarn: "-180.0", maxWarn: "230.0", minCrit: "-210.0", maxCrit: "260.0", alerts: true },
    { param: "State of Charge (SoC)", unit: "%", minWarn: "15.0", maxWarn: "90.0", minCrit: "10.0", maxCrit: "95.0", alerts: true },
    { param: "Cell Voltage Delta (ΔV)", unit: "mV", minWarn: "0.0", maxWarn: "60.0", minCrit: "0.0", maxCrit: "100.0", alerts: true },
    { param: "Cell Temperature", unit: "°C", minWarn: "10.0", maxWarn: "38.0", minCrit: "0.0", maxCrit: "45.0", alerts: true },
    { param: "State of Health (SOH)", unit: "%", minWarn: "80.0", maxWarn: "100.0", minCrit: "70.0", maxCrit: "100.0", alerts: false },
  ];

  const harmonicsThresholds: ThresholdRow[] = [
    { param: "Voltage THD (L1)", unit: "%", minWarn: "0.0", maxWarn: "3.5", minCrit: "0.0", maxCrit: "5.0", alerts: true },
    { param: "Voltage THD (L2)", unit: "%", minWarn: "0.0", maxWarn: "3.5", minCrit: "0.0", maxCrit: "5.0", alerts: true },
    { param: "Voltage THD (L3)", unit: "%", minWarn: "0.0", maxWarn: "3.5", minCrit: "0.0", maxCrit: "5.0", alerts: true },
    { param: "Current THD (Total)", unit: "%", minWarn: "0.0", maxWarn: "5.0", minCrit: "0.0", maxCrit: "8.0", alerts: true },
    { param: "Phase Voltage Imbalance", unit: "%", minWarn: "0.0", maxWarn: "2.0", minCrit: "0.0", maxCrit: "3.0", alerts: true },
  ];

  const powerThresholds: ThresholdRow[] = [
    { param: "Grid Import Active Power", unit: "kW", minWarn: "0.0", maxWarn: "140.0", minCrit: "0.0", maxCrit: "160.0", alerts: true },
    { param: "Grid Export Active Power", unit: "kW", minWarn: "0.0", maxWarn: "100.0", minCrit: "0.0", maxCrit: "120.0", alerts: true },
    { param: "Reactive Power (Q)", unit: "kVAR", minWarn: "-50.0", maxWarn: "50.0", minCrit: "-80.0", maxCrit: "80.0", alerts: false },
    { param: "Inverter Conversion Eff.", unit: "%", minWarn: "92.0", maxWarn: "99.5", minCrit: "88.0", maxCrit: "100.0", alerts: true },
  ];

  const currentRows =
    activeCategory === "bess"
      ? bessThresholds
      : activeCategory === "harmonics"
      ? harmonicsThresholds
      : powerThresholds;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200 font-mono">
      {/* 1. Category Switcher & Action Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase">
            SCADA 4-Tier Threshold & Trip Limits Configuration
          </h3>
          <p className="text-[10px] text-theme-secondary mt-0.5">
            IEEE 519 and NFPA 855 certified automated trip and dispatch interlocks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 rounded border border-[#00E676]/30 animate-pulse">
              ✓ Saved to PLC
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#FF2A85] text-white text-xs font-bold hover:bg-[#FF2A85]/90 cursor-pointer shadow-[0_0_12px_rgba(255,42,133,0.35)]"
          >
            Apply Changes
          </button>
        </div>
      </div>

      {/* 2. Subsystem Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-theme-elevated border border-theme-subtle w-fit">
        <button
          type="button"
          onClick={() => setActiveCategory("bess")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === "bess"
              ? "bg-[#FF2A85] text-white"
              : "text-theme-secondary hover:text-theme-primary"
          }`}
        >
          BESS DC Pack
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("harmonics")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === "harmonics"
              ? "bg-[#FF2A85] text-white"
              : "text-theme-secondary hover:text-theme-primary"
          }`}
        >
          Power Quality & Harmonics
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("power")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === "power"
              ? "bg-[#FF2A85] text-white"
              : "text-theme-secondary hover:text-theme-primary"
          }`}
        >
          Power Flow & Inverter
        </button>
      </div>

      {/* 3. 4-Tier Industrial Setpoints Table */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
        <div className="overflow-x-auto no-scrollbar rounded-lg border border-theme-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-elevated text-theme-muted uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Parameter Name</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3 text-amber-400">Min Warning</th>
                <th className="py-2.5 px-3 text-amber-400">Max Warning</th>
                <th className="py-2.5 px-3 text-[#FF1744]">Min Critical Trip</th>
                <th className="py-2.5 px-3 text-[#FF1744]">Max Critical Trip</th>
                <th className="py-2.5 px-3 text-right">SMS / Push</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/30 bg-theme-card">
              {currentRows.map((r, i) => (
                <tr key={i} className="hover:bg-theme-elevated/40">
                  <td className="py-2.5 px-3 font-bold text-theme-primary">{r.param}</td>
                  <td className="py-2.5 px-3 text-theme-secondary">{r.unit}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-semibold">{r.minWarn}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-semibold">{r.maxWarn}</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{r.minCrit}</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{r.maxCrit}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        r.alerts
                          ? "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                      }`}
                    >
                      {r.alerts ? "Active" : "Disabled"}
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
