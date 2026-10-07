"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  Wrench,
  Layers,
  Cpu,
  Activity,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { SiteRecord, SiteDeviceRecord, HourlyTelemetryRecord } from "@/lib/energy/types";
import { SolarWeatherForecastCard } from "@/components/weather/solar-weather-forecast-card";
import { SolarPerformanceChart } from "@/components/analytics/solar-performance-chart";
import { MpptStringScatterPlot } from "@/components/solar/mppt-string-scatter-plot";
import { StringCurrentHeatmapMatrix } from "@/components/solar/string-current-heatmap-matrix";
import { MpptDiagnosticStack } from "@/components/solar/mppt-diagnostic-stack";
import { ModbusRegisterMap } from "@/components/solar/modbus-register-map";
import { SolarSubViewTabs, SolarTabType } from "@/components/solar/solar-sub-view-tabs";

interface SolarSubsystemContainerProps {
  site: SiteRecord;
  devices: SiteDeviceRecord[];
  hourlyTelemetry: HourlyTelemetryRecord[];
  initialTab?: string;
}

export function SolarSubsystemContainer({
  site,
  devices,
  hourlyTelemetry,
  initialTab = "overview",
}: SolarSubsystemContainerProps) {
  const validInitialTab: SolarTabType =
    initialTab === "mppt" || initialTab === "modbus" || initialTab === "heatmap"
      ? (initialTab as SolarTabType)
      : "overview";

  const [activeTab, setActiveTab] = useState<SolarTabType>(validInitialTab);

  // Inverter devices for this site
  const solarInverters = devices.filter((d) => d.category === "solar_inverter");
  const liveSolarKw = site.solar_power_kw || site.solar_capacity_kwp * 0.88;
  const specificYield =
    site.solar_capacity_kwp > 0
      ? ((site.solar_yield_today_kwh || 4820) / site.solar_capacity_kwp).toFixed(2)
      : "4.85";

  // Simulated 24-channel MPPT string data based on site capacity
  const nominalStringCurrent = 11.2; // Amps
  const nominalStringVoltage = 645; // Volts
  const mpptChannels = Array.from({ length: 24 }, (_, i) => {
    const channelNum = i + 1;
    const isDegraded = channelNum === 7 || channelNum === 19;
    const current = isDegraded
      ? nominalStringCurrent * (channelNum === 7 ? 0.68 : 0.76)
      : nominalStringCurrent * (0.97 + ((channelNum * 3) % 7) * 0.01);
    const voltage =
      channelNum === 19 ? nominalStringVoltage * 0.94 : nominalStringVoltage;
    const powerKw = (voltage * current) / 1000;
    const status = isDegraded
      ? channelNum === 7
        ? ("soiling_warning" as const)
        : ("fuse_check" as const)
      : ("optimal" as const);

    return {
      channel: channelNum,
      voltageV: Math.round(voltage),
      currentA: parseFloat(current.toFixed(1)),
      powerKw: parseFloat(powerKw.toFixed(2)),
      status,
    };
  });

  return (
    <div className="space-y-6">
      {/* Solar Master Hero Banner */}
      <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD600] to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFD600] font-bold flex items-center gap-1.5">
                <Sun className="size-3.5" />
                Solar Photovoltaic Generation Subsystem
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-medium">
                {site.location_city}, {site.location_state}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-theme-primary tracking-tight mt-1">
              {site.name} — Solar PV Analytics & String Telemetry
            </h1>
            <p className="text-xs text-theme-muted mt-1 font-mono">
              Installed Capacity:{" "}
              <span className="text-theme-primary font-bold">
                {site.solar_capacity_kwp} kWp
              </span>{" "}
              • Grid-Tied Inverter Fleet
            </p>
          </div>

          {/* Quick Action: Book Certified Maintenance */}
          <div className="flex items-center gap-3">
            <Link
              href="/maintenance"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFD600] hover:bg-[#ffe033] text-black font-bold text-xs shadow-[0_0_15px_rgba(255,214,0,0.3)] transition-all min-h-[44px]"
            >
              <Wrench className="size-4" />
              <span>Book Solar Service</span>
            </Link>
          </div>
        </div>

        {/* Key Metric Strip (7 Electrical & Environmental Parameters) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-theme-subtle font-mono">
          <div>
            <span className="text-[10px] uppercase font-semibold text-theme-muted">
              Active Solar
            </span>
            <div className="text-lg font-bold text-[#FFD600] mt-0.5">
              {liveSolarKw.toLocaleString()} kW
            </div>
            <span className="text-[10px] text-theme-muted">Instantaneous</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-theme-muted">
              Today&apos;s Yield
            </span>
            <div className="text-lg font-bold text-theme-primary mt-0.5">
              {(site.solar_yield_today_kwh || 4820).toLocaleString()} kWh
            </div>
            <span className="text-[10px] text-theme-muted">
              {specificYield} kWh/kWp
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-theme-muted">
              Perf. Ratio (PR)
            </span>
            <div className="text-lg font-bold text-[#00E676] mt-0.5">
              82.4%
            </div>
            <span className="text-[10px] text-theme-muted">IEC 61724 Std</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-theme-muted">
              Inverter η
            </span>
            <div className="text-lg font-bold text-[#00E676] mt-0.5">
              98.6%
            </div>
            <span className="text-[10px] text-theme-muted">Weighted Fleet</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-theme-muted">
              POA Irradiance
            </span>
            <div className="text-lg font-bold text-theme-primary mt-0.5">
              885 W/m²
            </div>
            <span className="text-[10px] text-theme-muted">GHI: 830 W/m²</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-theme-muted">
              Module Temp
            </span>
            <div className="text-lg font-bold text-[#FF6B00] mt-0.5">
              48.2°C
            </div>
            <span className="text-[10px] text-theme-muted">Amb: 29.5°C</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-theme-muted">
              CO2 Avoided
            </span>
            <div className="text-lg font-bold text-[#00F0FF] mt-0.5">
              {(site.co2_saved_today_kg || 2480).toLocaleString()} kg
            </div>
            <span className="text-[10px] text-theme-muted">Clean Offset</span>
          </div>
        </div>
      </div>

      {/* Subsystem Interactive Tab Navigation */}
      <SolarSubViewTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* VIEW 1: FLEET OVERVIEW & STRING SCATTER */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Meteorological Forecast & Yield Prediction Engine */}
          <SolarWeatherForecastCard site={site} />

          {/* Primary Analytical Chart: Predicted vs Actual vs Load */}
          <SolarPerformanceChart
            initialData={hourlyTelemetry}
            solarCapacityKwp={site.solar_capacity_kwp}
          />

          {/* 24-Channel MPPT String Matrix & Mismatch Detector */}
          <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-[#FFD600]" />
                  <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
                    24-Channel MPPT String Current & Voltage Matrix
                  </h3>
                </div>
                <p className="text-xs font-mono text-theme-muted mt-0.5">
                  Automated mismatch detection flagging string currents running &lt;85% of peer average
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#00E676]">
                  <span className="size-2 rounded-full bg-[#00E676]" />
                  22 Optimal
                </span>
                <span className="flex items-center gap-1.5 text-[#FFAB00]">
                  <span className="size-2 rounded-full bg-[#FFAB00]" />
                  1 Soiling Flag
                </span>
                <span className="flex items-center gap-1.5 text-[#FF1744]">
                  <span className="size-2 rounded-full bg-[#FF1744]" />
                  1 Fuse Check
                </span>
              </div>
            </div>

            {/* Grid of 24 MPPT String Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {mpptChannels.map((str) => {
                const isWarning = str.status === "soiling_warning";
                const isError = str.status === "fuse_check";

                return (
                  <div
                    key={str.channel}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isError
                        ? "bg-[#FF1744]/10 border-[#FF1744]/40"
                        : isWarning
                        ? "bg-[#FFAB00]/10 border-[#FFAB00]/40"
                        : "bg-theme-muted border-theme-subtle hover:border-theme-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-theme-muted">
                        String #{str.channel.toString().padStart(2, "0")}
                      </span>
                      {isError ? (
                        <span className="text-[9px] font-mono px-1 rounded bg-[#FF1744]/20 text-[#FF1744] font-bold">
                          FUSE CHECK
                        </span>
                      ) : isWarning ? (
                        <span className="text-[9px] font-mono px-1 rounded bg-[#FFAB00]/20 text-[#FFAB00] font-bold">
                          SOILING
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-[#00E676]">98%</span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-theme-muted">Current</span>
                        <span
                          className={`font-bold ${
                            isError
                              ? "text-[#FF1744]"
                              : isWarning
                              ? "text-[#FFAB00]"
                              : "text-[#FFD600]"
                          }`}
                        >
                          {str.currentA} A
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-theme-muted">Voltage</span>
                        <span className="text-theme-primary font-medium">{str.voltageV} V</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-theme-subtle">
                        <span className="text-theme-muted">Power</span>
                        <span className="text-theme-primary font-bold">{str.powerKw} kW</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 24-Channel MPPT String Scatter Plot & Outlier Analyzer */}
          <MpptStringScatterPlot channels={mpptChannels} />

          {/* Inverter Fleet Telemetry & Losses Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inverter Table (2 cols) */}
            <div className="lg:col-span-2 rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="size-4 text-[#FFD600]" />
                  <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
                    String Inverter Telemetry Matrix ({solarInverters.length || 3} Units)
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#00E676] flex items-center gap-1">
                  <Activity className="size-3.5" />
                  All Inverters Synchronized
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-theme-subtle text-theme-muted uppercase text-[10px]">
                      <th className="pb-2.5">Inverter Name</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">DC Input</th>
                      <th className="pb-2.5 text-right">AC Output</th>
                      <th className="pb-2.5 text-right">Efficiency</th>
                      <th className="pb-2.5 text-right">IGBT Temp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-subtle">
                    {[1, 2, 3].map((idx) => (
                      <tr key={idx} className="hover:bg-theme-muted/50 transition-colors">
                        <td className="py-3 font-bold text-theme-primary">
                          Inverter #{idx} (Sungrow SG110CX)
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/25 font-bold">
                            <span className="size-1 rounded-full bg-[#00E676]" />
                            RUNNING
                          </span>
                        </td>
                        <td className="py-3 text-right text-theme-secondary">
                          {Math.round(liveSolarKw / 3 + idx * 4)} kW
                        </td>
                        <td className="py-3 text-right text-[#FFD600] font-bold">
                          {Math.round((liveSolarKw / 3) * 0.986)} kW
                        </td>
                        <td className="py-3 text-right text-[#00E676] font-bold">
                          98.6%
                        </td>
                        <td className="py-3 text-right text-theme-secondary">
                          {52 + idx * 2.1}°C
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plant Losses & O&M Diagnostic Card */}
            <div className="rounded-xl bg-theme-card border border-theme-subtle p-4 sm:p-6 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-[#FFD600]" />
                  <h3 className="text-sm font-bold uppercase tracking-tight text-theme-primary">
                    Generation Losses Breakdown
                  </h3>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-theme-muted mb-1">
                      <span>Thermal Derating (-0.38%/°C)</span>
                      <span className="text-[#FF6B00] font-bold">-3.8%</span>
                    </div>
                    <div className="h-1.5 w-full bg-theme-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6B00] w-[38%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-theme-muted mb-1">
                      <span>Soiling Loss (Dust / Bird Mismatch)</span>
                      <span className="text-[#FFAB00] font-bold">-2.1%</span>
                    </div>
                    <div className="h-1.5 w-full bg-theme-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFAB00] w-[21%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-theme-muted mb-1">
                      <span>Inverter Conversion Losses (1 - η)</span>
                      <span className="text-theme-muted font-bold">-1.4%</span>
                    </div>
                    <div className="h-1.5 w-full bg-theme-muted rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 w-[14%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-theme-muted mb-1">
                      <span>Ohmic DC Wiring Drop</span>
                      <span className="text-theme-muted font-bold">-0.8%</span>
                    </div>
                    <div className="h-1.5 w-full bg-theme-muted rounded-full overflow-hidden">
                      <div className="h-full bg-slate-600 w-[8%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Service Dispatch Box */}
              <div className="p-3 rounded-lg bg-theme-muted border border-[#FFD600]/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-theme-primary">
                  <AlertTriangle className="size-3.5 text-[#FFAB00]" />
                  <span>Automated Recommendation</span>
                </div>
                <p className="text-[11px] font-mono text-theme-muted">
                  String #07 &amp; #19 indicate severe soiling variance. Scheduling robotic wash or drone IR scan will recover ~18 kW of clipped capacity.
                </p>
                <Link
                  href="/maintenance"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFD600] hover:underline pt-1"
                >
                  <span>Dispatch Wash Crew →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 12-CHANNEL MPPT DIAGNOSTIC STACK (ref_img_4) */}
      {activeTab === "mppt" && (
        <MpptDiagnosticStack
          inverterCount={solarInverters.length || 3}
          siteName={site.name}
        />
      )}

      {/* VIEW 3: LIVE MODBUS PARAMETER REGISTER MAP (ref_img_3) */}
      {activeTab === "modbus" && (
        <ModbusRegisterMap
          inverterCount={solarInverters.length || 3}
          siteName={site.name}
        />
      )}

      {/* VIEW 4: 24-STRING CURRENT HEATMAP MATRIX (ref_img_5) */}
      {activeTab === "heatmap" && (
        <div id="heatmap">
          <StringCurrentHeatmapMatrix
            inverterCount={solarInverters.length || 3}
            nominalCurrent={11.2}
          />
        </div>
      )}
    </div>
  );
}
