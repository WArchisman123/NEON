"use client";

import React, { useState } from "react";
import { SiteRecord } from "@/lib/energy/types";

interface FireSafetyTabProps {
  site: SiteRecord;
}

export function FireSafetyTab({ site: _site }: FireSafetyTabProps) {
  void _site;
  const [isAlarmAcknowledged, setIsAlarmAcknowledged] = useState(false);

  const zones = [
    { id: 1, name: "Battery Rack 1", status: "Armed", hasAlarm: false },
    { id: 2, name: "Battery Rack 2", status: "Armed", hasAlarm: false },
    { id: 3, name: "Battery Rack 3", status: "Armed", hasAlarm: false },
    { id: 4, name: "PCS Room", status: "FIRE ALARM", hasAlarm: true },
    { id: 5, name: "Switchgear Room", status: "Armed", hasAlarm: false },
    { id: 6, name: "BBU / Aux Room", status: "Armed", hasAlarm: false },
  ];

  const safetyTimeline = [
    { time: "12:06:25", event: "Smoke Detector SD-4-03 Triggered", severity: "CRITICAL", zone: "Zone 4 - PCS Room" },
    { time: "12:06:26", event: "Automated HVAC Damper Interlock Closed", severity: "WARN", zone: "Enclosure Dampers" },
    { time: "12:06:28", event: "Audible & Visual Evacuation Beacons Active", severity: "CRITICAL", zone: "Facility All" },
    { time: "12:06:30", event: "Hydrogen Sensor Off-gas 141 ppm Elevated", severity: "WARN", zone: "Zone 4 Sensor G-4-01" },
    { time: "12:05:00", event: "System Armed & Pre-check Normal", severity: "INFO", zone: "FPDS Master Panel" },
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200 font-mono">
      {/* 1. NFPA 855 Safety Interlock Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Smoke Detectors</span>
          <span className="text-sm font-black text-[#00E676] mt-1">24 / 24 Online</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Gas Detectors</span>
          <span className="text-sm font-black text-[#00E676] mt-1">12 / 12 Online</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Cylinders Ready</span>
          <span className="text-sm font-black text-[#00E676] mt-1">12 / 12 (180 bar)</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Armed Zones</span>
          <span className="text-sm font-black text-[#00E676] mt-1">6 / 6 Armed</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">H₂ Off-Gas (BMS)</span>
          <span className="text-sm font-black text-amber-400 mt-1">141 ppm (Elev.)</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">CO Off-Gas</span>
          <span className="text-sm font-black text-cyan-400 mt-1">116 ppm</span>
        </div>
        <div className="p-2.5 rounded-lg bg-theme-card border border-theme-subtle flex flex-col justify-between">
          <span className="text-[10px] text-theme-secondary uppercase">Active Alarms</span>
          <span className={`text-sm font-black mt-1 ${isAlarmAcknowledged ? "text-[#00E676]" : "text-[#FF1744] animate-pulse"}`}>
            {isAlarmAcknowledged ? "Acknowledged" : "1 ACTIVE"}
          </span>
        </div>
      </div>

      {/* 2. 4-Stage Emergency Suppression Sequence & Active Incident Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-[#FF1744]/40 shadow-[0_0_20px_rgba(255,23,68,0.15)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme-subtle pb-3">
          <div className="flex items-center gap-3">
            <span className="size-3.5 rounded-full bg-[#FF1744] animate-ping" />
            <div>
              <h3 className="text-sm font-bold text-rose-400 uppercase">
                Active Fire Event: Zone 4 (PCS Room)
              </h3>
              <p className="text-[11px] text-theme-secondary">
                Trigger: Smoke Detector SD-4-03 • Timestamp: 12:06:25 • Clean Agent: Novec 1230
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAlarmAcknowledged(true)}
            disabled={isAlarmAcknowledged}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isAlarmAcknowledged
                ? "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40 cursor-default"
                : "bg-[#FF2A85] text-white hover:bg-[#FF2A85]/90 shadow-[0_0_15px_rgba(255,42,133,0.4)]"
            }`}
          >
            {isAlarmAcknowledged ? "✓ Alarm Acknowledged" : "⚡ Acknowledge Alarm"}
          </button>
        </div>

        {/* 4-Stage Sequence Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 flex flex-col gap-1">
            <span className="text-[10px] text-rose-300 font-bold">STAGE 1</span>
            <span className="text-xs font-bold text-rose-400">1. Alarm Active</span>
            <span className="text-[10px] text-theme-muted">Detector Confirmed</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/40 flex flex-col gap-1">
            <span className="text-[10px] text-amber-300 font-bold">STAGE 2</span>
            <span className="text-xs font-bold text-amber-400">2. Pre-Alarm (30s)</span>
            <span className="text-[10px] text-theme-muted">Dampers Closed</span>
          </div>
          <div className="p-3 rounded-lg bg-theme-elevated border border-theme-subtle flex flex-col gap-1">
            <span className="text-[10px] text-theme-muted font-bold">STAGE 3</span>
            <span className="text-xs font-bold text-theme-secondary">3. Suppression Release</span>
            <span className="text-[10px] text-theme-muted">Novec Injection (Pending)</span>
          </div>
          <div className="p-3 rounded-lg bg-theme-elevated border border-theme-subtle flex flex-col gap-1">
            <span className="text-[10px] text-theme-muted font-bold">STAGE 4</span>
            <span className="text-xs font-bold text-theme-secondary">4. Post-Release Hold</span>
            <span className="text-[10px] text-theme-muted">10-Min Soak Hold</span>
          </div>
        </div>
      </div>

      {/* 3. Container Fire Zones Map & Sensor Status */}
      <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
        <h3 className="text-xs font-bold text-theme-primary uppercase border-b border-theme-subtle pb-2">
          6-Zone Container Enclosure Sensor Grid
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {zones.map((z) => (
            <div
              key={z.id}
              className={`p-3.5 rounded-lg border flex flex-col gap-2 ${
                z.hasAlarm
                  ? "bg-rose-500/10 border-rose-500/40 shadow-[0_0_12px_rgba(255,23,68,0.2)]"
                  : "bg-theme-elevated border-theme-subtle"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-theme-primary">{z.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    z.hasAlarm
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                      : "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                  }`}
                >
                  {z.status}
                </span>
              </div>

              {/* Sensor icons */}
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="size-6 rounded bg-theme-card flex items-center justify-center border border-theme-subtle text-cyan-400 font-bold" title="Smoke">
                  S
                </span>
                <span className="size-6 rounded bg-theme-card flex items-center justify-center border border-theme-subtle text-amber-400 font-bold" title="Heat">
                  H
                </span>
                <span className="size-6 rounded bg-theme-card flex items-center justify-center border border-theme-subtle text-[#00E676] font-bold" title="Gas">
                  G
                </span>
                <span className="size-6 rounded bg-theme-card flex items-center justify-center border border-theme-subtle text-theme-secondary font-bold" title="Manual Pull">
                  M
                </span>
                <span className="size-6 rounded bg-theme-card flex items-center justify-center border border-theme-subtle text-purple-400 font-bold" title="Nozzle">
                  N
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Cylinder Pressure & Gas PPM Trend + Timestamped Safety Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Off-gas PPM Trend & Cylinder Pressure */}
        <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
            <h3 className="text-xs font-bold text-theme-primary uppercase">
              Precursor Off-Gas Concentration (PPM)
            </h3>
            <span className="text-xs font-bold text-cyan-400">180 Bar Cylinder Pressure</span>
          </div>

          <div className="h-36 w-full flex items-end justify-between gap-2 p-3 rounded-lg bg-theme-elevated/40 border border-theme-subtle">
            {[20, 25, 32, 45, 60, 95, 141].map((ppm, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] text-amber-400 font-bold">{ppm}</span>
                <div
                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t"
                  style={{ height: `${(ppm / 160) * 100}%` }}
                />
                <span className="text-[9px] text-theme-muted">T-{6 - i}m</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-theme-muted">
            <span>Normal Baseline: &lt; 25 ppm</span>
            <span className="text-rose-400 font-bold">H₂ Spike: 141 ppm</span>
            <span>Trip Cutoff: 200 ppm</span>
          </div>
        </div>

        {/* Safety Audit Timeline */}
        <div className="p-4 sm:p-5 rounded-xl bg-theme-card border border-theme-subtle flex flex-col gap-3">
          <h3 className="text-xs font-bold text-theme-primary uppercase border-b border-theme-subtle pb-2">
            NFPA 855 Safety Interlock Audit Trail
          </h3>
          <div className="flex flex-col gap-2">
            {safetyTimeline.map((item, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-theme-elevated/60 border border-theme-subtle flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-theme-muted">{item.time}</span>
                  <div>
                    <span className="font-bold text-theme-primary block">{item.event}</span>
                    <span className="text-[10px] text-theme-secondary">{item.zone}</span>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    item.severity === "CRITICAL"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : item.severity === "WARN"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30"
                  }`}
                >
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
