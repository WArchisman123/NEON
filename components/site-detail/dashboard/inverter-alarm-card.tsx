"use client";

import React from "react";
import { AlertTriangle, ShieldCheck, CheckCircle2, ShieldAlert, Bell, Activity } from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface InverterAlarmCardProps {
  site: SiteRecord;
  className?: string;
}

export function InverterAlarmCard({ site, className = "" }: InverterAlarmCardProps) {
  const isSiteOnline = site.status === "online";
  const protectionChannels = [
    {
      code: "F-101",
      name: "Grid Over / Undervoltage (OVR/UVR)",
      status: "Normal",
      detail: "415.2 V (Within ±10% IEEE 1547)",
      isWarning: false,
      isCritical: false,
    },
    {
      code: "F-102",
      name: "DC Insulation & Ground Fault (ISO)",
      status: "Normal",
      detail: "14.8 MΩ (Pass > 1.0 MΩ threshold)",
      isWarning: false,
      isCritical: false,
    },
    {
      code: "F-103",
      name: "DC Arc Fault Detection (AFCI)",
      status: "Normal",
      detail: "UL 1699B Active (0 Arc Events)",
      isWarning: false,
      isCritical: false,
    },
    {
      code: "F-104",
      name: "Internal Inverter Heatsink Temp",
      status: "Normal",
      detail: "46.2 °C (Trip setpoint: 85.0 °C)",
      isWarning: false,
      isCritical: false,
    },
    {
      code: "F-105",
      name: "MPPT String Current Imbalance",
      status: "Advisory",
      detail: "String 12 current 8.9A (Avg 9.6A)",
      isWarning: true,
      isCritical: false,
    },
    {
      code: "F-106",
      name: "Anti-Islanding Vector Surge",
      status: "Armed & Normal",
      detail: "RoCoF: 0.04 Hz/s (Limit: 0.50 Hz/s)",
      isWarning: false,
      isCritical: false,
    },
  ];

  const criticalCount = protectionChannels.filter((c) => c.isCritical).length;
  const warningCount = protectionChannels.filter((c) => c.isWarning).length;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl bg-theme-card border border-theme-subtle shadow-xs font-mono flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-theme-subtle/50">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-pink-500/10 text-[#FF2A85] flex items-center justify-center">
            <Bell className="size-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wide">
              Inverter Alarm &amp; Protection Status
            </h3>
            <p className="text-[10px] text-theme-muted">
              Continuous supervisory scan of inverter protection registers
            </p>
          </div>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-[10px] font-bold">
            <ShieldCheck className="size-3" />
            <span>{criticalCount} Critical Trips</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFD600]/10 border border-[#FFD600]/30 text-[#FFD600] text-[10px] font-bold">
            <AlertTriangle className="size-3" />
            <span>{warningCount} Advisory Warning</span>
          </div>
        </div>
      </div>

      {/* Grid of Protection Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 my-2.5">
        {protectionChannels.map((channel) => (
          <div
            key={channel.code}
            className={`p-2.5 rounded-lg border flex flex-col justify-between gap-1.5 ${
              channel.isWarning
                ? "bg-[#FFD600]/5 border-[#FFD600]/30"
                : channel.isCritical
                ? "bg-[#FF1744]/10 border-[#FF1744]/40"
                : "bg-theme-elevated/40 border-theme-subtle"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-theme-muted px-1 rounded bg-white/5">
                {channel.code}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                  channel.isWarning
                    ? "text-[#FFD600] bg-[#FFD600]/10 border-[#FFD600]/30"
                    : channel.isCritical
                    ? "text-[#FF1744] bg-[#FF1744]/10 border-[#FF1744]/30"
                    : "text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30"
                }`}
              >
                {channel.isWarning ? (
                  <AlertTriangle className="size-2.5" />
                ) : channel.isCritical ? (
                  <ShieldAlert className="size-2.5" />
                ) : (
                  <CheckCircle2 className="size-2.5" />
                )}
                {channel.status}
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-xs font-bold text-theme-primary truncate block">
                {channel.name}
              </span>
              <span className="text-[10px] text-theme-secondary mt-0.5 block truncate">
                {channel.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info Strip */}
      <div className="pt-2 border-t border-theme-subtle/40 flex items-center justify-between text-[10px] text-theme-secondary">
        <span className="flex items-center gap-1 text-[#00E676]">
          <Activity className="size-3" />
          All string contactors energized • Grid compliance status: {isSiteOnline ? "Pass" : "Telemetry Standby"}
        </span>
        <span className="text-theme-muted">
          Last Protective Scan: 14 Jul, 2026, 12:09:08 (Synced)
        </span>
      </div>
    </div>
  );
}
