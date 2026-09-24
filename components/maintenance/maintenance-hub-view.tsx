"use client";

import React, { useState, useMemo } from "react";
import {
  Wrench,
  Sun,
  BatteryCharging,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  ArrowRight,
  Truck,
} from "lucide-react";
import {
  SiteRecord,
  MaintenanceServiceRecord,
  MaintenanceTicketRecord,
} from "@/lib/energy/types";
import { BookingWizardModal } from "./booking-wizard-modal";
import { DigitalJobCardModal } from "./digital-job-card-modal";

interface MaintenanceHubViewProps {
  sites: SiteRecord[];
  services: MaintenanceServiceRecord[];
  initialTickets: MaintenanceTicketRecord[];
  initialSiteId?: string;
}

export function MaintenanceHubView({
  sites,
  services,
  initialTickets,
  initialSiteId,
}: MaintenanceHubViewProps) {
  const [tickets, setTickets] = useState<MaintenanceTicketRecord[]>(initialTickets);
  const [catalogFilter, setCatalogFilter] = useState<"all" | "solar_pv" | "bess">("all");
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string | undefined>(
    undefined
  );
  const [selectedTicketForJobCard, setSelectedTicketForJobCard] =
    useState<MaintenanceTicketRecord | null>(null);

  // Filtered services
  const displayedServices = useMemo(() => {
    if (catalogFilter === "all") return services;
    return services.filter((s) => s.asset_type === catalogFilter);
  }, [services, catalogFilter]);

  // Aggregate metrics
  const activeOrdersCount = tickets.filter((t) => t.status !== "completed").length;
  const dispatchedCrewsCount = tickets.filter((t) =>
    ["en_route", "on_site", "testing_and_verification"].includes(t.status)
  ).length;

  const handleOpenBooking = (serviceId?: string) => {
    setSelectedServiceForBooking(serviceId);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (newTicket: MaintenanceTicketRecord) => {
    setTickets((prev) => [newTicket, ...prev]);
    // Automatically open its job card
    setSelectedTicketForJobCard(newTicket);
  };

  const handleTicketUpdated = (updatedTicket: MaintenanceTicketRecord) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
    setSelectedTicketForJobCard(updatedTicket);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. FLEET O&M KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Active Work Orders</span>
            <Wrench className="size-4 text-[#FF2A85]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            {activeOrdersCount}
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            {tickets.length} total lifetime orders
          </span>
        </div>

        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Dispatched Crews</span>
            <Truck className="size-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#00F0FF] mt-1">
            {dispatchedCrewsCount}
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            En route &amp; on-site units
          </span>
        </div>

        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Guaranteed SLA</span>
            <ShieldCheck className="size-4 text-[#00E676]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#00E676] mt-1">
            &lt; 24h
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            OEM certified technicians
          </span>
        </div>

        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Next Arrival Slot</span>
            <Calendar className="size-4 text-[#FFD600]" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-white mt-2 truncate">
            {tickets[0]?.scheduled_date || "Tomorrow"}
          </div>
          <span className="text-[11px] font-mono text-[#FFD600] mt-0.5 block truncate">
            {tickets[0]?.time_window?.split(" ")[0] || "08:00 AM"} window
          </span>
        </div>
      </div>

      {/* 2. CERTIFIED SERVICE CATALOG SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/30 uppercase tracking-widest">
                Service Marketplace
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                Solar PV &amp; BESS Exclusive
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              Specialized Clean Energy Service Catalog
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-voltage radiometric diagnostics, thermal loop chemistry flushes, and NFPA 855 compliance audits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenBooking()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,42,133,0.4)] min-h-[44px] cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Book Certified Service</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setCatalogFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              catalogFilter === "all"
                ? "bg-[#121622] text-white border border-white/[0.2] shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Packages ({services.length})
          </button>

          <button
            type="button"
            onClick={() => setCatalogFilter("solar_pv")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              catalogFilter === "solar_pv"
                ? "bg-[#FFD600]/15 text-[#FFD600] border border-[#FFD600]/40 shadow-[0_0_10px_rgba(255,214,0,0.2)]"
                : "text-slate-400 hover:text-[#FFD600]"
            }`}
          >
            <Sun className="size-3.5" />
            <span>Solar PV Only</span>
          </button>

          <button
            type="button"
            onClick={() => setCatalogFilter("bess")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              catalogFilter === "bess"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                : "text-slate-400 hover:text-[#00F0FF]"
            }`}
          >
            <BatteryCharging className="size-3.5" />
            <span>BESS Only</span>
          </button>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedServices.map((srv) => {
            const isBess = srv.asset_type === "bess";

            return (
              <div
                key={srv.id}
                className="rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-[#FF2A85]/50 transition-all p-5 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                        isBess
                          ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20"
                          : "bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20"
                      }`}
                    >
                      {isBess ? "BESS Specialized" : "Solar PV Specialized"}
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-white">
                      ₹{srv.base_price.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#FF2A85] transition-colors line-clamp-1">
                    {srv.title}
                  </h3>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>Est. Duration: {srv.estimated_duration_hours} Hours On-Site</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {srv.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-300 font-mono">
                    {srv.deliverables.slice(0, 3).map((d, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="size-3.5 text-[#00E676] shrink-0 mt-0.5" />
                        <span className="text-[11px] line-clamp-1">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBooking(srv.id)}
                  className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(255,42,133,0.35)] min-h-[42px] cursor-pointer"
                >
                  Book Service Window
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE TICKETS & SLA TRACKER SECTION */}
      <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Wrench className="size-4 text-[#FF2A85]" />
            <h3 className="text-base font-bold uppercase tracking-tight text-white">
              Active Service Work Orders &amp; SLA Tracker ({tickets.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-time multi-tenant dispatch queue
          </span>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No maintenance work orders found for this organization.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {tickets.map((tck) => {
              const isBess = tck.asset_type === "bess";

              // Status badge styling
              const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                requested: { bg: "bg-[#FFAB00]/10", text: "text-[#FFAB00]", border: "border-[#FFAB00]/30" },
                quote_accepted: { bg: "bg-[#00F0FF]/10", text: "text-[#00F0FF]", border: "border-[#00F0FF]/30" },
                technician_assigned: { bg: "bg-[#9D4EDD]/15", text: "text-[#9D4EDD]", border: "border-[#9D4EDD]/30" },
                en_route: { bg: "bg-[#00F0FF]/15", text: "text-[#00F0FF]", border: "border-[#00F0FF]/40" },
                on_site: { bg: "bg-[#FF2A85]/15", text: "text-[#FF2A85]", border: "border-[#FF2A85]/40" },
                testing_and_verification: { bg: "bg-[#FFAB00]/15", text: "text-[#FFAB00]", border: "border-[#FFAB00]/40" },
                completed: { bg: "bg-[#00E676]/15", text: "text-[#00E676]", border: "border-[#00E676]/40" },
                cancelled: { bg: "bg-[#FF1744]/15", text: "text-[#FF1744]", border: "border-[#FF1744]/40" },
              };

              const color = statusColors[tck.status] || statusColors.requested;

              return (
                <div
                  key={tck.id}
                  className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-xs transition-colors hover:bg-white/[0.01] rounded-lg px-2"
                >
                  {/* Left Column: Number, Title, Site */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {tck.ticket_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${color.bg} ${color.text} ${color.border}`}
                      >
                        {tck.status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          isBess
                            ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20"
                            : "bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20"
                        }`}
                      >
                        {isBess ? "BESS" : "Solar PV"}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200">
                      {tck.service_title || "Specialized O&M Inspection"}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 text-slate-500" />
                        {tck.site_name || "Enrolled Site"} ({tck.site_city || "Field"})
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-slate-500" />
                        {tck.scheduled_date} ({tck.time_window.split(" ")[0]})
                      </span>
                      <span>&bull;</span>
                      <span className="text-[#00E676]">{tck.assigned_crew_name}</span>
                    </div>
                  </div>

                  {/* Right Column: Price & View Job Card */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-white">
                        ₹{tck.total_price.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-[#00E676]">
                        {tck.payment_status}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTicketForJobCard(tck)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-[#FF2A85] hover:text-white border border-[#FF2A85]/30 hover:border-[#FF2A85] font-bold text-xs uppercase tracking-wider transition-all min-h-[42px] cursor-pointer"
                    >
                      <span>View Job Card</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODALS */}

      {/* 4-Step Booking Wizard */}
      <BookingWizardModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        sites={sites}
        services={services}
        initialSiteId={initialSiteId}
        initialServiceId={selectedServiceForBooking}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Digital Job Card Drawer */}
      {selectedTicketForJobCard && (
        <DigitalJobCardModal
          isOpen={Boolean(selectedTicketForJobCard)}
          onClose={() => setSelectedTicketForJobCard(null)}
          ticket={selectedTicketForJobCard}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </div>
  );
}
