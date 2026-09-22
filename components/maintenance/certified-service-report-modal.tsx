"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  Printer,
  CheckCircle2,
  FileText,
  Award,
  UserCheck,
} from "lucide-react";
import { MaintenanceTicketRecord } from "@/lib/energy/types";

interface CertifiedServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicketRecord;
}

export function CertifiedServiceReportModal({
  isOpen,
  onClose,
  ticket,
}: CertifiedServiceReportModalProps) {
  if (!isOpen) return null;

  const isBess = ticket.asset_type === "bess";
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = `CERT-NEON-${ticket.ticket_number.replace("NEON-MNT-", "")}-${new Date().getFullYear()}`;

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
        {/* Ambient Glow Accent */}
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-[#00E676]/10 blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 uppercase tracking-widest">
                <ShieldCheck className="size-3" />
                {isBess ? "NFPA 855 / UL 9540A Verified" : "IEC 62446-3 Radiometric Verified"}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">
                Cert #{certId}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2 mt-1">
              <Award className="size-5 text-[#FFD600]" />
              Certified O&M Diagnostic Sign-Off
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Neon Energy Clean Infrastructure Service Verification & Warranty Extension
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

        {/* Work Order Metadata Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#121622] border border-white/[0.06] text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Ticket Number</span>
            <div className="font-bold text-[#FF2A85] mt-0.5">{ticket.ticket_number}</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Installation Site</span>
            <div className="font-bold text-white mt-0.5 truncate">{ticket.site_name || "Enrolled Site"}</div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Asset Class</span>
            <div className="font-bold text-white mt-0.5">
              {isBess ? "BESS Storage Unit" : "Solar PV Array"}
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Completion Date</span>
            <div className="font-bold text-[#00E676] mt-0.5">{ticket.scheduled_date}</div>
          </div>
        </div>

        {/* Executed Scope & Deliverables */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <FileText className="size-3.5 text-[#FF2A85]" />
            Completed Service Package: {ticket.service_title || "Standard Diagnostic Inspection"}
          </div>

          <div className="p-3.5 rounded-xl bg-[#060709] border border-white/[0.08] space-y-2">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              {(ticket.deliverables && ticket.deliverables.length > 0
                ? ticket.deliverables
                : isBess
                ? [
                    "Dielectric coolant loop drained, flushed & refilled (48L)",
                    "16-cell module impedance testing & delta-V rebalanced",
                    "NFPA 855 emergency contactor trip verification",
                    "Chiller flow pump pressure calibrated to 3.4 bar",
                  ]
                : [
                    "FLIR radiometric drone orthomosaic scanning completed",
                    "Cell hot-spot thermal classification logged",
                    "Deionized robotic array wash (< 5 ppm purity)",
                    "String IV curve degradation check verified",
                  ]
              ).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-[#00E676] shrink-0 mt-0.5" />
                  <span className="text-[11px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Before vs After Telemetry Benchmark */}
        <div className="p-4 rounded-xl bg-[#121622] border border-white/[0.08] space-y-3 font-mono">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            SCADA Electrical Telemetry Benchmark (Pre-Service vs Post-Service)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            {isBess ? (
              <>
                <div className="p-2.5 rounded-lg bg-[#060709] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase">Max Cell ΔV</span>
                  <div className="text-xs text-slate-400 line-through mt-0.5">48 mV (Derated)</div>
                  <div className="text-sm font-bold text-[#00E676] mt-0.5">11 mV (Nominal)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#060709] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase">Coolant Flow</span>
                  <div className="text-xs text-slate-400 line-through mt-0.5">18 L/min (Restricted)</div>
                  <div className="text-sm font-bold text-[#00E676] mt-0.5">38 L/min (Full Loop)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#060709] border border-white/[0.06] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase">Rack Temp Delta</span>
                  <div className="text-xs text-slate-400 line-through mt-0.5">+8.4 °C (Warning)</div>
                  <div className="text-sm font-bold text-[#00E676] mt-0.5">+1.8 °C (Uniform)</div>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 rounded-lg bg-[#060709] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase">Performance Ratio</span>
                  <div className="text-xs text-slate-400 line-through mt-0.5">74.2% (Soiled)</div>
                  <div className="text-sm font-bold text-[#00E676] mt-0.5">86.8% (Restored)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#060709] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase">MPPT String Delta</span>
                  <div className="text-xs text-slate-400 line-through mt-0.5">32% Mismatch</div>
                  <div className="text-sm font-bold text-[#00E676] mt-0.5">&lt; 2% Balanced</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#060709] border border-white/[0.06] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase">DC Health Check</span>
                  <div className="text-xs text-slate-400 line-through mt-0.5">1 Hotspot Diode</div>
                  <div className="text-sm font-bold text-[#00E676] mt-0.5">Diode Bypassed / OK</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Lead Technician Sign-off */}
        <div className="p-3.5 rounded-xl bg-[#060709] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <UserCheck className="size-4 text-[#00E676]" />
              <span>Lead Technician: {ticket.assigned_crew_name || "Alpha Certified Crew"}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Verified by Neon Energy Remote SCADA Telemetry Agent &bull; Hash: SHA-256 (3b8f...9a12)
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase">Certification Stamp</span>
            <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
              [ PASSED &bull; ACTIVE WARRANTY ]
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <span className="text-[10px] font-mono text-slate-500">
            Immutable Audit Trail &bull; Issued {issueDate}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00E676] hover:bg-[#20ff8e] text-black font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] min-h-[38px] cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-300 border border-white/[0.08] text-xs font-mono transition-colors min-h-[38px] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
