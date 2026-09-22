"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MaintenanceCatalogPreview() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const packages = [
    {
      id: "bess-coolant",
      category: "BESS Specialized",
      badgeVariant: "bess" as const,
      price: "$1,250",
      title: "Liquid Chiller Coolant Flush & Refill",
      description:
        "Full drain, pressure flush, dielectric coolant refill, and pump flow rate calibration to prevent BESS thermal derating.",
      deliverables: [
        "50L Dielectric Coolant Replacement",
        "Loop Pressure & Leak Test (NFPA 855)",
        "Certified Signed Digital Diagnostic Report",
      ],
    },
    {
      id: "solar-drone",
      category: "Solar PV Specialized",
      badgeVariant: "solar" as const,
      price: "$850",
      title: "Drone IR Aerial Thermography & Hotspot Scan",
      description:
        "Autonomous radiometric drone sweep identifying micro-cracks, diode bypass faults, and soiling hotspot losses.",
      deliverables: [
        "Full Array Radiometric Orthomosaic Map",
        "IEC 62446-3 Thermographic Compliance Audit",
        "Loss Attribution & Warranty Claim Dossier",
      ],
    },
  ];

  const steps = [
    { step: 1, label: "Asset & Site" },
    { step: 2, label: "Service Package" },
    { step: 3, label: "Date Window" },
    { step: 4, label: "Stripe Payment" },
  ];

  return (
    <div className="space-y-6">
      {/* 4-Step Maintenance Wizard Stepper Indicator */}
      <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((s, idx) => (
            <React.Fragment key={s.step}>
              <div
                onClick={() => setActiveStep(s.step)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div
                  className={`size-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    activeStep === s.step
                      ? "bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.6)] border border-[#FF2A85]"
                      : activeStep > s.step
                      ? "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40"
                      : "bg-[#121622] text-slate-500 border border-white/[0.08]"
                  }`}
                >
                  {activeStep > s.step ? "✓" : s.step}
                </div>
                <span
                  className={`text-[10px] font-mono tracking-wider uppercase ${
                    activeStep === s.step
                      ? "text-white font-bold"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2 transition-all ${
                    activeStep > idx + 1
                      ? "bg-[#00E676]/40"
                      : "bg-white/[0.08]"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Service Catalog Cards (Strictly Solar & BESS Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-[#FF2A85]/50 transition-all p-5 flex flex-col justify-between shadow-xl group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={pkg.badgeVariant}>{pkg.category}</Badge>
                <span className="text-xl font-black font-mono text-white">
                  {pkg.price}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-[#FF2A85] transition-colors">
                {pkg.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                {pkg.description}
              </p>

              {/* Deliverables Checklist */}
              <ul className="mt-4 space-y-2 text-xs text-slate-300 font-medium">
                {pkg.deliverables.map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-[#00E676] shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setActiveStep(3)}
              >
                Book Service Window
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
