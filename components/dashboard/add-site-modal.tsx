"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Plus,
  Sun,
  BatteryCharging,
  Flame,
  Zap,
  Building2,
  MapPin,
  IndianRupee,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSite, CreateSitePayload } from "@/lib/api/sites";
import { SiteRecord } from "@/lib/energy/types";

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newSite: SiteRecord) => void;
}

// Quick prefill configurations
interface TemplateConfig {
  label: string;
  badge: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  plantType: "commercial_industrial" | "utility_microgrid" | "rooftop_hybrid";
  hasSolar: boolean;
  solarKwp: number;
  hasBess: boolean;
  bessKwh: number;
  bessKw: number;
  hasDg: boolean;
  dgKva: number;
  hasGrid: boolean;
  demandKva: number;
  peakTariff: number;
  offpeakTariff: number;
}

const PRESET_TEMPLATES: TemplateConfig[] = [
  {
    label: "Solar + BESS C&I",
    badge: "Most Common",
    name: "Sahyadri Agro Solar Microgrid",
    city: "Nashik",
    state: "Maharashtra",
    lat: 19.9975,
    lng: 73.7898,
    plantType: "commercial_industrial",
    hasSolar: true,
    solarKwp: 950,
    hasBess: true,
    bessKwh: 1600,
    bessKw: 600,
    hasDg: false,
    dgKva: 0,
    hasGrid: true,
    demandKva: 750,
    peakTariff: 8.50,
    offpeakTariff: 4.50,
  },
  {
    label: "Full Hybrid Microgrid",
    badge: "All 5 Nodes",
    name: "Kutch Desert Resilient Microgrid",
    city: "Bhuj",
    state: "Gujarat",
    lat: 23.242,
    lng: 69.6669,
    plantType: "utility_microgrid",
    hasSolar: true,
    solarKwp: 1250,
    hasBess: true,
    bessKwh: 2200,
    bessKw: 800,
    hasDg: true,
    dgKva: 600,
    hasGrid: true,
    demandKva: 1000,
    peakTariff: 9.80,
    offpeakTariff: 5.20,
  },
  {
    label: "Commercial Rooftop",
    badge: "Solar PV",
    name: "Bengaluru Tech Park Rooftop Array",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    plantType: "rooftop_hybrid",
    hasSolar: true,
    solarKwp: 520,
    hasBess: false,
    bessKwh: 0,
    bessKw: 0,
    hasDg: false,
    dgKva: 0,
    hasGrid: true,
    demandKva: 600,
    peakTariff: 7.80,
    offpeakTariff: 4.20,
  },
  {
    label: "BESS Peaker / Shaving",
    badge: "Storage Only",
    name: "Deccan High-Voltage Storage Peaker",
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lng: 73.8567,
    plantType: "commercial_industrial",
    hasSolar: false,
    solarKwp: 0,
    hasBess: true,
    bessKwh: 2500,
    bessKw: 1000,
    hasDg: false,
    dgKva: 0,
    hasGrid: true,
    demandKva: 1200,
    peakTariff: 10.50,
    offpeakTariff: 5.00,
  },
];

export function AddSiteModal({ isOpen, onClose, onSuccess }: AddSiteModalProps) {
  // Form fields
  const [name, setName] = useState("Sahyadri Agro Solar Microgrid");
  const [city, setCity] = useState("Nashik");
  const [state, setState] = useState("Maharashtra");
  const [latitude, setLatitude] = useState<string>("19.9975");
  const [longitude, setLongitude] = useState<string>("73.7898");
  const [plantType, setPlantType] = useState<
    "commercial_industrial" | "utility_microgrid" | "rooftop_hybrid"
  >("commercial_industrial");

  // Hardware Assets
  const [hasSolar, setHasSolar] = useState(true);
  const [solarKwp, setSolarKwp] = useState<string>("950");

  const [hasBess, setHasBess] = useState(true);
  const [bessKwh, setBessKwh] = useState<string>("1600");
  const [bessKw, setBessKw] = useState<string>("600");

  const [hasDg, setHasDg] = useState(false);
  const [dgKva, setDgKva] = useState<string>("0");

  const [hasGrid, setHasGrid] = useState(true);
  const [demandKva, setDemandKva] = useState<string>("750");

  // TOU Tariffs
  const [peakTariff, setPeakTariff] = useState<string>("8.50");
  const [offpeakTariff, setOffpeakTariff] = useState<string>("4.50");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSite, setCreatedSite] = useState<SiteRecord | null>(null);

  if (!isOpen) return null;

  // Apply a template preset
  const handleApplyTemplate = (tmpl: TemplateConfig) => {
    setName(tmpl.name);
    setCity(tmpl.city);
    setState(tmpl.state);
    setLatitude(tmpl.lat.toString());
    setLongitude(tmpl.lng.toString());
    setPlantType(tmpl.plantType);

    setHasSolar(tmpl.hasSolar);
    setSolarKwp(tmpl.solarKwp.toString());

    setHasBess(tmpl.hasBess);
    setBessKwh(tmpl.bessKwh.toString());
    setBessKw(tmpl.bessKw.toString());

    setHasDg(tmpl.hasDg);
    setDgKva(tmpl.dgKva.toString());

    setHasGrid(tmpl.hasGrid);
    setDemandKva(tmpl.demandKva.toString());

    setPeakTariff(tmpl.peakTariff.toString());
    setOffpeakTariff(tmpl.offpeakTariff.toString());

    setErrorMessage(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!name.trim()) {
      setErrorMessage("Please enter an installation site name.");
      return;
    }
    if (!city.trim() || !state.trim()) {
      setErrorMessage("Please enter both city and state locations.");
      return;
    }
    if (!hasSolar && !hasBess && !hasDg && !hasGrid) {
      setErrorMessage("At least one energy subsystem (Solar, BESS, DG, or Grid) must be enabled.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: CreateSitePayload = {
        name: name.trim(),
        locationCity: city.trim(),
        locationState: state.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        plantType,
        hasSolar,
        solarCapacityKwp: hasSolar ? parseFloat(solarKwp) || 0 : 0,
        hasBess,
        bessCapacityKwh: hasBess ? parseFloat(bessKwh) || 0 : 0,
        bessPowerKw: hasBess ? parseFloat(bessKw) || 0 : 0,
        hasDg,
        dgCapacityKva: hasDg ? parseFloat(dgKva) || 0 : 0,
        hasGrid,
        contractedDemandKva: hasGrid ? parseFloat(demandKva) || 0 : 0,
        peakTariffRate: parseFloat(peakTariff) || 8.50,
        offpeakTariffRate: parseFloat(offpeakTariff) || 4.50,
      };

      const res = await createSite(payload);

      if (res.success && res.data) {
        setCreatedSite(res.data);
        if (onSuccess) {
          onSuccess(res.data);
        }
      } else {
        setErrorMessage("Server returned an unsuccessful response. Please try again.");
      }
    } catch (err: unknown) {
      console.error("[AddSiteModal] Registration failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to register site. Please check input values.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset and Close
  const handleResetAndClose = () => {
    setCreatedSite(null);
    setErrorMessage(null);
    onClose();
  };

  const tariffSpread = (parseFloat(peakTariff || "0") - parseFloat(offpeakTariff || "0")).toFixed(3);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 md:p-8 flex items-center justify-center min-h-screen animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) handleResetAndClose();
      }}
    >
      <div className="relative w-full max-w-3xl my-auto rounded-2xl bg-[#0B0D13] border border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh]">
        {/* Top Glowing Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent z-10" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] shrink-0 bg-[#0B0D13]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-[#FF2A85]/20 border border-[#FF2A85]/40 flex items-center justify-center text-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.3)]">
              <Plus className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Register New Energy Installation
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#FF2A85]/20 border border-[#FF2A85]/40 text-[#FF2A85] font-mono text-[10px] font-bold uppercase">
                  Telemetry Edge
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Configure Solar PV, BESS storage, DG peaker, and utility grid intertie
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            disabled={submitting}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* SUCCESS BANNER STATE */}
          {createdSite ? (
            <div className="p-6 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="size-12 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676] mx-auto shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  Installation Successfully Enrolled!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  <strong className="text-white">{createdSite.name}</strong> is now live on the telemetry edge with hardware devices and initial telemetry snapshots provisioned.
                </p>
              </div>

              {/* Site Details Card */}
              <div className="p-3.5 rounded-lg bg-[#060709] border border-white/[0.08] text-left max-w-md mx-auto space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Location:</span>
                  <span className="text-white">{createdSite.location_city}, {createdSite.location_state}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Plant Type:</span>
                  <span className="text-[#FF2A85] uppercase">{createdSite.plant_type.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Capacities:</span>
                  <span className="text-white">
                    {createdSite.has_solar ? `${createdSite.solar_capacity_kwp} kWp Solar` : ""}
                    {createdSite.has_bess ? ` • ${createdSite.bess_capacity_kwh} kWh BESS` : ""}
                    {createdSite.has_dg ? ` • ${createdSite.dg_capacity_kva} kVA DG` : ""}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto font-mono text-xs border-white/[0.1] bg-[#121622] hover:bg-[#1a2030] text-slate-300 min-h-[44px]"
                >
                  Return to Fleet Cockpit
                </Button>
                <Link href={`/sites/${createdSite.id}`} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto font-mono text-xs gap-2 min-h-[44px]"
                  >
                    <span>Open 5-Node Flow Visualizer</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#FF1744]/15 border border-[#FF1744]/30 flex items-start gap-2.5 text-[#FF1744]">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1 font-mono text-[11px] leading-relaxed">
                    <strong>Error:</strong> {errorMessage}
                  </div>
                </div>
              )}

              {/* 1-Click Quick Preset Templates */}
              <div className="p-3.5 rounded-xl bg-[#121622] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="size-3 text-[#FF2A85]" />
                    <span>Quick Configuration Presets</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">1-Click Population</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="p-2.5 rounded-lg bg-[#0B0D13] border border-white/[0.08] hover:border-[#FF2A85]/50 hover:bg-[#FF2A85]/10 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-[10px] font-mono font-bold text-[#FF2A85] uppercase">
                        {tmpl.badge}
                      </div>
                      <div className="font-bold text-slate-200 group-hover:text-white truncate mt-0.5 text-xs">
                        {tmpl.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 1: Identity & Location */}
              <div className="p-4 rounded-xl bg-[#0B0D13] border border-white/[0.08] space-y-4">
                <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs border-b border-white/[0.06] pb-2">
                  <Building2 className="size-3.5 text-[#FF2A85]" />
                  <span>1. Plant Identity &amp; Classification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Site Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Site / Microgrid Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sahyadri Agro Solar Microgrid"
                      className="w-full px-3 py-2 rounded-lg bg-[#121622] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF2A85] transition-all min-h-[44px]"
                    />
                  </div>

                  {/* Plant Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Topology Type
                    </label>
                    <select
                      value={plantType}
                      onChange={(e) =>
                        setPlantType(
                          e.target.value as
                            | "commercial_industrial"
                            | "utility_microgrid"
                            | "rooftop_hybrid"
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#121622] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF2A85] transition-all min-h-[44px]"
                    >
                      <option value="commercial_industrial">Commercial C&amp;I</option>
                      <option value="utility_microgrid">Utility Microgrid</option>
                      <option value="rooftop_hybrid">Rooftop Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Location City, State, Coordinates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <MapPin className="size-2.5 text-[#FF2A85]" /> City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Nashik"
                      className="w-full px-3 py-2 rounded-lg bg-[#121622] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full px-3 py-2 rounded-lg bg-[#121622] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="19.9975"
                      className="w-full px-3 py-2 rounded-lg bg-[#121622] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="73.7898"
                      className="w-full px-3 py-2 rounded-lg bg-[#121622] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Hardware Assets & Capacities */}
              <div className="p-4 rounded-xl bg-[#0B0D13] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                    <Zap className="size-3.5 text-[#FF2A85]" />
                    <span>2. Subsystems &amp; Nameplate Ratings</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Toggle active generation &amp; storage
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Solar PV Card */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      hasSolar
                        ? "bg-[#121622] border-[#FFD600]/40 shadow-[0_0_12px_rgba(255,214,0,0.1)]"
                        : "bg-[#0B0D13] border-white/[0.06] opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-[#FFD600]/20 flex items-center justify-center text-[#FFD600]">
                          <Sun className="size-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">Solar PV Array</span>
                          <span className="text-[10px] font-mono text-slate-400">Photovoltaic Strings</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[48px] justify-center">
                        <input
                          type="checkbox"
                          checked={hasSolar}
                          onChange={(e) => setHasSolar(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[7px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FFD600]"></div>
                      </label>
                    </div>

                    {hasSolar && (
                      <div className="pt-2 border-t border-white/[0.06] space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">
                          Peak Installed Capacity (kWp)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={solarKwp}
                            onChange={(e) => setSolarKwp(e.target.value)}
                            placeholder="950"
                            className="w-full px-3 py-1.5 rounded-lg bg-[#060709] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FFD600]"
                          />
                          <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">
                            kWp
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BESS Storage Card */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      hasBess
                        ? "bg-[#121622] border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.1)]"
                        : "bg-[#0B0D13] border-white/[0.06] opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-[#00F0FF]/20 flex items-center justify-center text-[#00F0FF]">
                          <BatteryCharging className="size-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">BESS Storage</span>
                          <span className="text-[10px] font-mono text-slate-400">LFP Container / BMS</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[48px] justify-center">
                        <input
                          type="checkbox"
                          checked={hasBess}
                          onChange={(e) => setHasBess(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[7px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00F0FF]"></div>
                      </label>
                    </div>

                    {hasBess && (
                      <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase">
                            Energy (kWh)
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={bessKwh}
                            onChange={(e) => setBessKwh(e.target.value)}
                            placeholder="1600"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#060709] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase">
                            PCS Power (kW)
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={bessKw}
                            onChange={(e) => setBessKw(e.target.value)}
                            placeholder="600"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#060709] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Diesel Generator Card */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      hasDg
                        ? "bg-[#121622] border-[#FF6B00]/40 shadow-[0_0_12px_rgba(255,107,0,0.1)]"
                        : "bg-[#0B0D13] border-white/[0.06] opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                          <Flame className="size-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">Diesel Generator</span>
                          <span className="text-[10px] font-mono text-slate-400">Standby Genset</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[48px] justify-center">
                        <input
                          type="checkbox"
                          checked={hasDg}
                          onChange={(e) => setHasDg(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[7px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                      </label>
                    </div>

                    {hasDg && (
                      <div className="pt-2 border-t border-white/[0.06] space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">
                          Genset Capacity (kVA)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={dgKva}
                          onChange={(e) => setDgKva(e.target.value)}
                          placeholder="500"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#060709] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Utility Grid Intertie Card */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      hasGrid
                        ? "bg-[#121622] border-[#9D4EDD]/40 shadow-[0_0_12px_rgba(157,78,221,0.1)]"
                        : "bg-[#0B0D13] border-white/[0.06] opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-[#9D4EDD]/20 flex items-center justify-center text-[#9D4EDD]">
                          <Zap className="size-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">Utility Grid Intertie</span>
                          <span className="text-[10px] font-mono text-slate-400">Feeder / Maximum Demand</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[48px] justify-center">
                        <input
                          type="checkbox"
                          checked={hasGrid}
                          onChange={(e) => setHasGrid(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[7px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9D4EDD]"></div>
                      </label>
                    </div>

                    {hasGrid && (
                      <div className="pt-2 border-t border-white/[0.06] space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">
                          Contracted Demand (kVA)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={demandKva}
                          onChange={(e) => setDemandKva(e.target.value)}
                          placeholder="750"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#060709] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#9D4EDD]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: TOU Tariff Rates */}
              <div className="p-4 rounded-xl bg-[#0B0D13] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                    <IndianRupee className="size-3.5 text-[#FF2A85]" />
                    <span>3. Time-of-Use (TOU) Tariff Schedule</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40 font-mono text-[10px]">
                    Spread: ₹{tariffSpread}/kWh
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Peak Tariff Rate (₹/kWh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={peakTariff}
                      onChange={(e) => setPeakTariff(e.target.value)}
                      placeholder="8.50"
                      className="w-full px-3 py-2 rounded-lg bg-[#121622] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Off-Peak Tariff Rate (₹/kWh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={offpeakTariff}
                      onChange={(e) => setOffpeakTariff(e.target.value)}
                      placeholder="4.50"
                      className="w-full px-3 py-2 rounded-lg bg-[#121622] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-[#FF2A85] min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Summary Bar */}
              <div className="p-3 rounded-xl bg-[#060709] border border-white/[0.08] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Active Topology:</span>
                  <div className="flex items-center gap-1">
                    {hasSolar && (
                      <span className="px-2 py-0.5 rounded bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/40 font-bold">
                        Solar
                      </span>
                    )}
                    {hasBess && (
                      <span className="px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-bold">
                        BESS
                      </span>
                    )}
                    {hasDg && (
                      <span className="px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 font-bold">
                        DG
                      </span>
                    )}
                    {hasGrid && (
                      <span className="px-2 py-0.5 rounded bg-[#9D4EDD]/20 text-[#9D4EDD] border border-[#9D4EDD]/40 font-bold">
                        Grid
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-slate-300">
                  Total Capacity:{" "}
                  <strong className="text-white">
                    {hasSolar ? `${solarKwp} kWp` : ""}{" "}
                    {hasBess ? `+ ${bessKwh} kWh` : ""}
                  </strong>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetAndClose}
                  disabled={submitting}
                  className="font-mono text-xs border-white/[0.1] bg-[#121622] hover:bg-[#1a2030] text-slate-300 min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="font-mono text-xs gap-2 min-h-[44px] shadow-[0_0_15px_rgba(255,42,133,0.35)]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin text-white" />
                      <span>Provisioning Site &amp; Devices...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Register &amp; Initialize Site</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
