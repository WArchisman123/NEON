"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Check,
  Search,
  Building2,
  Sun,
  Battery,
  Flame,
} from "lucide-react";
import { SiteRecord } from "@/lib/energy/types";

interface SiteSwitcherProps {
  sites: SiteRecord[];
  activeSiteId?: string;
  onSelectSite?: (siteId: string) => void;
  className?: string;
}

export function SiteSwitcher({
  sites,
  activeSiteId,
  onSelectSite,
  className = "",
}: SiteSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSite =
    sites.find((s) => s.id === activeSiteId) || sites[0] || null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.plant_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (siteId: string) => {
    setIsOpen(false);
    if (onSelectSite) {
      onSelectSite(siteId);
    } else {
      router.push(`/sites/${siteId}`);
    }
  };

  if (!activeSite) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-theme-elevated border border-theme-subtle text-xs text-theme-secondary font-mono">
        <span className="size-2 rounded-full bg-slate-500 animate-pulse" />
        <span>No Sites Available</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-lg bg-theme-elevated hover:bg-theme-card border border-theme-subtle hover:border-[#FF2A85]/50 transition-all min-h-[40px] sm:min-h-[36px] group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF2A85]/30"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Pulsing Status Dot */}
        <span className="relative flex size-2.5 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              activeSite.status === "online"
                ? "bg-[#00E676]"
                : activeSite.status === "degraded"
                ? "bg-[#FFAB00]"
                : "bg-[#FF1744]"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full size-2.5 ${
              activeSite.status === "online"
                ? "bg-[#00E676]"
                : activeSite.status === "degraded"
                ? "bg-[#FFAB00]"
                : "bg-[#FF1744]"
            }`}
          />
        </span>

        {/* Site Details */}
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-xs font-bold text-theme-primary truncate max-w-[120px] sm:max-w-[200px] leading-tight group-hover:text-[#FF2A85] transition-colors">
            {activeSite.name}
          </span>
          <span className="text-[10px] font-mono text-theme-secondary truncate capitalize">
            {activeSite.plant_type.replace(/_/g, " ")} • {activeSite.location_city}
          </span>
        </div>

        <ChevronDown
          className={`size-3.5 text-theme-secondary transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#FF2A85]" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded-xl bg-[#0B0D13] light:bg-white border border-theme-subtle shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header & Quick Search */}
          <div className="p-2.5 border-b border-theme-subtle bg-[#121622] light:bg-[#EAEFF8]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-theme-secondary" />
              <input
                type="text"
                placeholder="Search sites or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#060709] light:bg-[#F4F6FB] border border-theme-subtle text-xs text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-[#FF2A85] font-mono"
              />
            </div>
          </div>

          {/* Site List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 divide-y divide-theme-subtle/30 bg-[#0B0D13] light:bg-white">
            {filteredSites.length === 0 ? (
              <div className="py-6 text-center text-xs text-theme-secondary font-mono">
                No matching sites found
              </div>
            ) : (
              filteredSites.map((site) => {
                const isSelected = site.id === activeSite.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => handleSelect(site.id)}
                    className={`w-full flex items-start justify-between p-2 rounded-lg text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-[#FF2A85]/15 border border-[#FF2A85]/40"
                        : "hover:bg-[#121622] light:hover:bg-[#EAEFF8] border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0 pr-2">
                      <div
                        className={`size-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-[#FF2A85] text-white"
                            : "bg-theme-elevated text-theme-secondary group-hover:text-theme-primary"
                        }`}
                      >
                        <Building2 className="size-3.5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? "text-[#FF2A85]"
                                : "text-theme-primary group-hover:text-[#FF2A85]"
                            }`}
                          >
                            {site.name}
                          </span>
                        </div>

                        <div className="text-[10px] text-theme-secondary font-mono flex items-center gap-2 mt-0.5">
                          <span>{site.location_city}, {site.location_state}</span>
                          <span>•</span>
                          <span
                            className={
                              site.status === "online"
                                ? "text-[#00E676]"
                                : site.status === "degraded"
                                ? "text-[#FFAB00]"
                                : "text-[#FF1744]"
                            }
                          >
                            {site.status}
                          </span>
                        </div>

                        {/* Capacity Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {site.has_solar && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <Sun className="size-2.5" />
                              {site.solar_capacity_kwp} kWp
                            </span>
                          )}
                          {site.has_bess && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              <Battery className="size-2.5" />
                              {site.bess_capacity_kwh} kWh
                            </span>
                          )}
                          {site.has_dg && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              <Flame className="size-2.5" />
                              {site.dg_capacity_kva} kVA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="size-4 text-[#FF2A85] shrink-0 mt-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer CTA to Fleet Overview */}
          <div className="p-2 border-t border-theme-subtle bg-theme-elevated/40 flex items-center justify-between text-[11px] font-mono">
            <span className="text-theme-secondary">
              {sites.length} total site{sites.length !== 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/fleet");
              }}
              className="text-[#FF2A85] hover:underline font-semibold"
            >
              View Fleet Cockpit →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
