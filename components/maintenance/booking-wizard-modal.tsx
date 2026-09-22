"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  BatteryCharging,
  Sun,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Building,
  Check,
  Loader2,
} from "lucide-react";
import {
  SiteRecord,
  MaintenanceServiceRecord,
  MaintenanceTicketRecord,
  MaintenanceAssetType,
} from "@/lib/energy/types";

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: SiteRecord[];
  services: MaintenanceServiceRecord[];
  initialSiteId?: string;
  initialServiceId?: string;
  onBookingSuccess: (newTicket: MaintenanceTicketRecord) => void;
}

export function BookingWizardModal({
  isOpen,
  onClose,
  sites,
  services,
  initialSiteId,
  initialServiceId,
  onBookingSuccess,
}: BookingWizardModalProps) {
  // Wizard Step (1 to 4)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSiteId || (sites[0]?.id ?? "")
  );
  const [assetType, setAssetType] = useState<MaintenanceAssetType>("bess");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || ""
  );
  const [customNotes, setCustomNotes] = useState<string>("");
  
  // Date default to 3 days from now
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  }, []);

  const [scheduledDate, setScheduledDate] = useState<string>(defaultDate);
  const [timeWindow, setTimeWindow] = useState<string>("08:00 AM - 12:00 PM PST");
  const [isUrgentSla, setIsUrgentSla] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe_card" | "corporate_po">("stripe_card");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Active site
  const currentSite = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  // Filtered services strictly for Solar or BESS
  const eligibleServices = useMemo(() => {
    return services.filter((s) => s.asset_type === assetType);
  }, [services, assetType]);

  // Active selected service
  const currentService = useMemo(() => {
    if (selectedServiceId) {
      const match = services.find((s) => s.id === selectedServiceId);
      if (match && match.asset_type === assetType) return match;
    }
    return eligibleServices[0] || null;
  }, [services, selectedServiceId, assetType, eligibleServices]);

  // Quote calculations
  const basePrice = currentService ? currentService.base_price : 1250;
  const environmentalFee = 120;
  const urgentFee = isUrgentSla ? 350 : 0;
  const totalPrice = basePrice + environmentalFee + urgentFee;

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleSubmitBooking = async () => {
    if (!currentSite || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload = {
        siteId: currentSite.id,
        assetType,
        serviceId: currentService?.id,
        scheduledDate,
        timeWindow,
        customNotes: customNotes.trim() || undefined,
        totalPrice,
        paymentStatus: "paid",
      };

      const res = await fetch("/api/v1/maintenance/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to book service window");
      }

      const json = await res.json();
      if (json.success && json.data) {
        onBookingSuccess(json.data);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating booking";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-2xl bg-[#0B0D13] border border-white/[0.12] rounded-2xl p-5 sm:p-7 shadow-[0_0_35px_rgba(255,42,133,0.2)] space-y-6 z-10 text-white overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/30 uppercase tracking-widest">
                Certified Service Engine
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">
                Step {step} of 4
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
              Book Certified Maintenance Window
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

        {/* 4-Step Stepper Header */}
        <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
          {[
            { s: 1, title: "1. Asset & Site" },
            { s: 2, title: "2. Package" },
            { s: 3, title: "3. Schedule" },
            { s: 4, title: "4. Quote & Pay" },
          ].map((item) => (
            <div
              key={item.s}
              className={`p-2 rounded-lg border text-center transition-all ${
                step === item.s
                  ? "bg-[#FF2A85]/15 border-[#FF2A85] text-white font-bold shadow-[0_0_10px_rgba(255,42,133,0.3)]"
                  : step > item.s
                  ? "bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]"
                  : "bg-[#121622] border-white/[0.06] text-slate-500"
              }`}
            >
              <div className="truncate">{item.title}</div>
            </div>
          ))}
        </div>

        {/* STEP 1: SELECT SITE & TARGET ASSET */}
        {step === 1 && (
          <div className="space-y-4 font-mono">
            <div>
              <label className="text-xs uppercase font-bold text-slate-400 block mb-1.5">
                Select Installation Site:
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full bg-[#121622] border border-white/[0.1] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location_city}, {s.location_state})
                  </option>
                ))}
              </select>
            </div>

            {/* Strict Asset Selection: Solar PV vs BESS */}
            <div>
              <label className="text-xs uppercase font-bold text-slate-400 block mb-2">
                Target Subsystem (Solar PV &amp; BESS Exclusive):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAssetType("bess")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    assetType === "bess"
                      ? "bg-[#00F0FF]/10 border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                      : "bg-[#121622] border-white/[0.08] hover:border-white/[0.2]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <BatteryCharging className="size-5 text-[#00F0FF]" />
                    {assetType === "bess" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] font-bold">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-white">BESS Storage Container</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Liquid coolant flushing, BMS cell balancing, and NFPA 855 fire suppression checks.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAssetType("solar_pv")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    assetType === "solar_pv"
                      ? "bg-[#FFD600]/10 border-[#FFD600] shadow-[0_0_15px_rgba(255,214,0,0.25)]"
                      : "bg-[#121622] border-white/[0.08] hover:border-white/[0.2]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Sun className="size-5 text-[#FFD600]" />
                    {assetType === "solar_pv" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFD600]/20 text-[#FFD600] font-bold">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-white">Solar PV Array &amp; Inverters</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Radiometric drone IR scanning, IV curve string tracing, and robotic deionized wash.
                  </p>
                </button>
              </div>
            </div>

            {/* Smart Alarm Diagnostic Recommendation */}
            <div className="p-3.5 rounded-xl bg-[#121622] border border-[#FFAB00]/30 flex items-start gap-3">
              <AlertTriangle className="size-4 text-[#FFAB00] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#FFAB00]">
                  SCADA Telemetry Diagnostic Assistant:
                </span>
                <p className="text-slate-300 text-[11px]">
                  {assetType === "bess"
                    ? "Site telemetry indicates cell voltage delta (14 mV) following fast discharge cycle. Recommended package: Liquid Coolant Flush & BMS Calibration."
                    : "Site telemetry flags 32% string output variance on MPPT #07. Recommended package: Drone IR Thermography & String Analysis."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SERVICE PACKAGE & SCOPE */}
        {step === 2 && (
          <div className="space-y-4 font-mono">
            <label className="text-xs uppercase font-bold text-slate-400 block">
              Choose Specialized Service Package:
            </label>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {eligibleServices.map((srv) => {
                const isSelected = (currentService?.id || "") === srv.id;

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-[#FF2A85]/10 border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                        : "bg-[#121622] border-white/[0.06] hover:border-white/[0.15]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{srv.title}</span>
                        <span className="text-[10px] text-slate-500">
                          &bull; {srv.estimated_duration_hours}h on-site
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {srv.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-white">
                        ${srv.base_price.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#00E676] mt-0.5">Fixed Rate</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-slate-400 block mb-1">
                Custom Scope / Specific Inverter / BMS Fault Codes:
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Inverter #02 reporting ground fault alarm, or BMS reporting cell #09 over-temp during C/2 discharge rate..."
                rows={2}
                className="w-full bg-[#121622] border border-white/[0.1] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2A85] resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: DATE & ARRIVAL WINDOW */}
        {step === 3 && (
          <div className="space-y-4 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase font-bold text-slate-400 block mb-1.5">
                  Scheduled Service Date:
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-[#121622] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-slate-400 block mb-1.5">
                  Arrival Time Window:
                </label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full bg-[#121622] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
                >
                  <option value="08:00 AM - 12:00 PM PST">Morning (08:00 AM - 12:00 PM PST)</option>
                  <option value="01:00 PM - 05:00 PM PST">Afternoon (01:00 PM - 05:00 PM PST)</option>
                </select>
              </div>
            </div>

            {/* SLA Priority Toggle */}
            <div>
              <label className="text-xs uppercase font-bold text-slate-400 block mb-2">
                Service Level Agreement (SLA):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsUrgentSla(false)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    !isUrgentSla
                      ? "bg-[#121622] border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.2)]"
                      : "bg-[#060709] border-white/[0.06] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Standard Dispatch</span>
                    <span className="text-[10px] font-bold text-[#00E676]">Included</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Scheduled window within standard 5 business day lead time.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUrgentSla(true)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isUrgentSla
                      ? "bg-[#FF2A85]/15 border-[#FF2A85] shadow-[0_0_15px_rgba(255,42,133,0.3)]"
                      : "bg-[#060709] border-white/[0.06] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Urgent 24-hr SLA</span>
                    <span className="text-[10px] font-bold text-[#FF2A85]">+$350 Fee</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Emergency certified field technician dispatched within 24 hours.
                  </p>
                </button>
              </div>
            </div>

            {/* Assigned Crew Preview */}
            <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400">Assigned Dispatch Unit:</span>
              <span className="font-bold text-[#00E676]">
                {assetType === "bess"
                  ? "Alpha BESS Diagnostic Crew (Lead: Marcus Vance)"
                  : "SkyInspect Aerial Solutions"}
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW, QUOTE & PAYMENT */}
        {step === 4 && (
          <div className="space-y-4 font-mono">
            {/* Itemized Quote Breakdown */}
            <div className="p-4 rounded-xl bg-[#060709] border border-white/[0.08] space-y-2 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 border-b border-white/[0.06] pb-2">
                Itemized Work Order Quote Breakdown:
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>{currentService?.title || "Specialized Service Package"}:</span>
                <span className="font-bold text-white">${basePrice.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Calibrated Test Equipment &amp; Environmental Fee:</span>
                <span className="font-bold text-white">${environmentalFee}</span>
              </div>

              {isUrgentSla && (
                <div className="flex items-center justify-between text-[#FF2A85]">
                  <span>Urgent 24-Hour Emergency Dispatch SLA:</span>
                  <span className="font-bold">+$350</span>
                </div>
              )}

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-sm font-bold">
                <span className="text-white">Total Authorized Amount:</span>
                <span className="text-lg font-black text-[#00E676]">${totalPrice.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-slate-400 block">
                Select Commercial Billing Method:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe_card")}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "stripe_card"
                      ? "bg-[#121622] border-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.25)]"
                      : "bg-[#060709] border-white/[0.06] text-slate-400 hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="size-4 text-[#FF2A85]" />
                    <span className="text-xs font-bold text-white">Stripe Corporate Card</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Visa ending in &bull;&bull;&bull;&bull; 4242 (Instant Settlement)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("corporate_po")}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "corporate_po"
                      ? "bg-[#121622] border-[#00F0FF] text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                      : "bg-[#060709] border-white/[0.06] text-slate-400 hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="size-4 text-[#00F0FF]" />
                    <span className="text-xs font-bold text-white">Corporate PO / Credits</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Net 30 invoice against verified O&amp;M budget
                  </span>
                </button>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-[#FF1744]/15 border border-[#FF1744]/30 text-xs text-[#FF1744]">
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] font-mono">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-300 border border-white/[0.08] text-xs transition-colors min-h-[42px] cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-400 hover:text-white border border-white/[0.08] text-xs transition-colors min-h-[42px] cursor-pointer"
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,42,133,0.35)] min-h-[42px] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#00E676] hover:bg-[#20ff8e] disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_18px_rgba(0,230,118,0.4)] min-h-[42px] cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                <span>Confirm &amp; Authorize ${totalPrice.toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
