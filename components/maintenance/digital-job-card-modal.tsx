"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  BatteryCharging,
  Sun,
  Loader2,
} from "lucide-react";
import { MaintenanceTicketRecord, TicketStatus } from "@/lib/energy/types";
import { CertifiedServiceReportModal } from "./certified-service-report-modal";

interface DigitalJobCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicketRecord;
  onTicketUpdated?: (updated: MaintenanceTicketRecord) => void;
}

const LIFECYCLE_STAGES: { key: TicketStatus; label: string; step: number }[] = [
  { key: "requested", label: "Requested", step: 1 },
  { key: "quote_accepted", label: "Quote Accepted", step: 2 },
  { key: "technician_assigned", label: "Crew Assigned", step: 3 },
  { key: "en_route", label: "En Route", step: 4 },
  { key: "on_site", label: "On Site", step: 5 },
  { key: "testing_and_verification", label: "Testing / Verification", step: 6 },
  { key: "completed", label: "Job Completed", step: 7 },
];

export function DigitalJobCardModal({
  isOpen,
  onClose,
  ticket,
  onTicketUpdated,
}: DigitalJobCardModalProps) {
  const [currentTicket, setCurrentTicket] = useState<MaintenanceTicketRecord>(ticket);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Digital checklist state
  const isBess = currentTicket.asset_type === "bess";
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    chk_loto: true,
    chk_ppe: true,
    chk_tools: currentTicket.status !== "requested",
    chk_pre_readings: ["on_site", "testing_and_verification", "completed"].includes(
      currentTicket.status
    ),
    chk_remediation: ["testing_and_verification", "completed"].includes(
      currentTicket.status
    ),
    chk_post_verify: currentTicket.status === "completed",
    chk_signoff: currentTicket.status === "completed",
  });

  if (!isOpen) return null;

  const currentStageIndex = LIFECYCLE_STAGES.findIndex(
    (s) => s.key === currentTicket.status
  );
  const effectiveStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  const nextStage =
    effectiveStageIndex < LIFECYCLE_STAGES.length - 1
      ? LIFECYCLE_STAGES[effectiveStageIndex + 1].key
      : null;

  const handleToggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAdvanceStatus = async () => {
    if (!nextStage || isUpdating) return;

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/v1/maintenance/tickets/${currentTicket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStage }),
      });

      if (!res.ok) throw new Error("Status update failed");

      const json = await res.json();
      if (json.success && json.data) {
        setCurrentTicket(json.data);
        if (onTicketUpdated) {
          onTicketUpdated(json.data);
        }
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 cursor-default"
          aria-label="Close modal"
        />

        <div className="relative w-full max-w-3xl bg-[#0B0D13] border border-white/[0.12] rounded-2xl p-5 sm:p-7 shadow-[0_0_35px_rgba(255,42,133,0.15)] space-y-6 z-10 text-white overflow-hidden my-6">
          {/* Header Strip */}
          <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/30 uppercase tracking-widest">
                  Digital Field Job Card
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono font-bold text-white">
                  {currentTicket.ticket_number}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                {currentTicket.service_title || "Specialized O&M Field Work Order"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121622] transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Ticket Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#121622] border border-white/[0.06] text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Site & Location</span>
              <div className="font-bold text-white mt-0.5 truncate">
                {currentTicket.site_name || "Assigned Plant"}
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Asset Class</span>
              <div className="flex items-center gap-1 font-bold mt-0.5">
                {isBess ? (
                  <>
                    <BatteryCharging className="size-3.5 text-[#00F0FF]" />
                    <span className="text-[#00F0FF]">BESS Storage</span>
                  </>
                ) : (
                  <>
                    <Sun className="size-3.5 text-[#FFD600]" />
                    <span className="text-[#FFD600]">Solar PV Array</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Scheduled Window</span>
              <div className="font-bold text-white mt-0.5 truncate">
                {currentTicket.scheduled_date} &bull; {currentTicket.time_window.split(" ")[0]}
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Assigned Crew</span>
              <div className="font-bold text-[#00E676] mt-0.5 truncate">
                {currentTicket.assigned_crew_name || "Alpha Field Ops"}
              </div>
            </div>
          </div>

          {/* 7-Stage Visual Lifecycle Progress Pipeline */}
          <div className="p-4 rounded-xl bg-[#060709] border border-white/[0.08] space-y-3 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 uppercase font-bold">
                Live Dispatch & Service Pipeline
              </span>
              <span className="text-xs font-bold text-[#FF2A85] uppercase">
                Stage {effectiveStageIndex + 1} of 7: {currentTicket.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Stepper Dots & Line */}
            <div className="relative pt-2 pb-1">
              <div className="absolute top-4 left-3 right-3 h-0.5 bg-white/[0.1] -z-0" />
              <div
                className="absolute top-4 left-3 h-0.5 bg-gradient-to-r from-[#FF2A85] via-[#00F0FF] to-[#00E676] transition-all duration-500 -z-0"
                style={{
                  width: `${(effectiveStageIndex / (LIFECYCLE_STAGES.length - 1)) * 100}%`,
                }}
              />

              <div className="flex items-center justify-between relative z-10">
                {LIFECYCLE_STAGES.map((stg, idx) => {
                  const isPast = idx < effectiveStageIndex;
                  const isCurrent = idx === effectiveStageIndex;

                  return (
                    <div
                      key={stg.key}
                      className="flex flex-col items-center group relative cursor-pointer"
                      title={stg.label}
                    >
                      <div
                        className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isCurrent
                            ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.8)] scale-110"
                            : isPast
                            ? "bg-[#00E676] text-black"
                            : "bg-[#121622] text-slate-500 border border-white/[0.1]"
                        }`}
                      >
                        {isPast ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] mt-1.5 hidden md:block text-center max-w-[65px] truncate ${
                          isCurrent
                            ? "text-[#FF2A85] font-bold"
                            : isPast
                            ? "text-[#00E676]"
                            : "text-slate-500"
                        }`}
                      >
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Status Advance Control */}
            {nextStage && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Field Technician Operational Control:
                </span>
                <button
                  type="button"
                  onClick={handleAdvanceStatus}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF2A85] hover:bg-[#ff1475] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(255,42,133,0.35)] min-h-[38px] cursor-pointer"
                >
                  {isUpdating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="size-3.5" />
                  )}
                  <span>Advance to {nextStage.replace(/_/g, " ")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Field Operations Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-[#00E676]" />
                Field Safety & Technical Verification Checklist
              </span>
              <span className="text-[11px] text-slate-500">
                Tap to toggle compliance state
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                {
                  id: "chk_loto",
                  label: "Lockout / Tagout (LOTO) Physical Isolation",
                  desc: "AC breaker trip verified, DC disconnect padlocked.",
                },
                {
                  id: "chk_ppe",
                  label: "PPE & Arc-Flash Safety Protocol",
                  desc: "NFPA 70E Category 4 suit & 1000V rated gloves inspected.",
                },
                {
                  id: "chk_tools",
                  label: "Calibrated Radiometric & Flushing Rig Deployed",
                  desc: isBess
                    ? "Dielectric vacuum pump, refilling manifold connected."
                    : "Calibrated FLIR thermal drone, pure DI water supply ready.",
                },
                {
                  id: "chk_pre_readings",
                  label: "Pre-Service SCADA Baseline Logged",
                  desc: isBess
                    ? "Cell delta V, loop pressure, rack thermals recorded."
                    : "String currents, open-circuit voltage Voc recorded.",
                },
                {
                  id: "chk_remediation",
                  label: "Service Remediation & Package Execution",
                  desc: "Deliverables executed strictly to OEM guidelines.",
                },
                {
                  id: "chk_post_verify",
                  label: "Post-Service SCADA Benchmark Passed",
                  desc: "Nominal operational delta restored, zero active alarms.",
                },
              ].map((item) => {
                const checked = checklist[item.id] || false;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleCheck(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 min-h-[48px] cursor-pointer ${
                      checked
                        ? "bg-[#121622] border-[#00E676]/30 text-slate-200"
                        : "bg-[#060709] border-white/[0.06] text-slate-400 hover:border-white/[0.15]"
                    }`}
                  >
                    <div
                      className={`size-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? "bg-[#00E676] text-black font-bold text-xs"
                          : "border border-slate-600 bg-transparent"
                      }`}
                    >
                      {checked && "✓"}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          checked ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Incident / Technician Notes */}
          {currentTicket.custom_notes && (
            <div className="p-3.5 rounded-xl bg-[#121622] border border-white/[0.06] text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Logged Work Scope / Technician Notes:
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {currentTicket.custom_notes}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Commercial Total:</span>
              <span className="text-white font-bold">₹{currentTicket.total_price.toLocaleString("en-IN")}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] font-bold uppercase">
                {currentTicket.payment_status}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-[#00E676] border border-[#00E676]/30 font-mono text-xs font-bold transition-all min-h-[42px] cursor-pointer"
              >
                <FileCheck2 className="size-4" />
                <span>View Certified Report</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-300 border border-white/[0.08] text-xs font-mono transition-colors min-h-[42px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Sign-Off Report Modal */}
      <CertifiedServiceReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        ticket={currentTicket}
      />
    </>
  );
}
