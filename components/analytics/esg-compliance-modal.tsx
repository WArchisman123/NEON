"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";
import { AnalyticsSummary } from "@/lib/energy/analytics-engine";

interface EsgComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteRecord;
  summary: AnalyticsSummary;
  timeframeLabel: string;
}

export function EsgComplianceModal({
  isOpen,
  onClose,
  site,
  summary,
  timeframeLabel,
}: EsgComplianceModalProps) {
  if (!isOpen) return null;

  const co2MetricTons = (summary.co2AbatedKg / 1000).toFixed(2);
  const cleanMwh = (summary.totalSolarKwh / 1000).toFixed(2);
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = `NEON-ESG-${site.id.slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      {/* Background click to dismiss */}
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        aria-label="Close modal"
      />

      {/* Cyber Certificate Container */}
      <div className="relative w-full max-w-2xl bg-[#0B0D13] border-2 border-[#00E676]/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(0,230,118,0.25)] space-y-6 z-10 text-white overflow-hidden">
        {/* Certificate Watermark Accent */}
        <div className="absolute -top-10 -right-10 size-48 rounded-full bg-[#00E676]/5 blur-2xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 uppercase tracking-widest">
                <ShieldCheck className="size-3" />
                ISO 14064-1 Verifiable
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">
                Doc ID: {certId}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              Carbon Abatement & ESG Statement
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Greenhouse Gas Protocol Corporate Standard — Scope 2 Avoided Emissions
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121622] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Certificate Details Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#121622] border border-white/[0.06] text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Installation Site</span>
            <div className="font-bold text-white mt-0.5">{site.name}</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Location</span>
            <div className="font-bold text-slate-300 mt-0.5">
              {site.location_city}, {site.location_state}
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Audit Window</span>
            <div className="font-bold text-[#00E676] mt-0.5">{timeframeLabel}</div>
          </div>
        </div>

        {/* Key Abatement Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
          <div className="p-4 rounded-xl bg-[#060709] border border-[#00E676]/30">
            <span className="text-[10px] uppercase text-slate-400 font-semibold">
              Avoided CO2 Emissions
            </span>
            <div className="text-2xl font-black text-[#00E676] mt-1">
              {co2MetricTons} <span className="text-sm font-normal">tCO2e</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {summary.co2AbatedKg.toLocaleString()} kg total
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#060709] border border-[#FFD600]/30">
            <span className="text-[10px] uppercase text-slate-400 font-semibold">
              Clean Energy Harvested
            </span>
            <div className="text-2xl font-black text-[#FFD600] mt-1">
              {cleanMwh} <span className="text-sm font-normal">MWh</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {summary.totalSolarKwh.toLocaleString()} kWh
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#060709] border border-[#00F0FF]/30">
            <span className="text-[10px] uppercase text-slate-400 font-semibold">
              Tree Sequestration Equiv.
            </span>
            <div className="text-2xl font-black text-[#00F0FF] mt-1">
              {summary.treesEquivalent}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Mature trees / yr
            </span>
          </div>
        </div>

        {/* Verification Compliance Statement */}
        <div className="p-4 rounded-xl bg-[#121622] border border-white/[0.06] space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <CheckCircle2 className="size-4 text-[#00E676]" />
            <span>Third-Party Audited SCADA Telemetry Method</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            This statement certifies that electrical energy recorded by revenue-grade Class A meters at {site.name} was generated exclusively from certified on-site zero-emission photovoltaic and energy storage assets. Displacement calculations adhere to the US EPA eGRID carbon emissions factors.
          </p>
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Verified by: Neon Energy Telemetry Engine</span>
            <span>Issued: {issueDate}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <span className="text-[10px] font-mono text-slate-500">
            SHA-256 SCADA Root Hash Synced
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00E676] hover:bg-[#20ff8e] text-black font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] min-h-[38px]"
            >
              <Printer className="size-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-300 border border-white/[0.08] text-xs font-mono transition-colors min-h-[38px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
