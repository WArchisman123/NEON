"use client";

import React, { ReactNode } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { Topbar } from "./topbar";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { SiteRecord } from "@/lib/energy/types";
import { EmsTabProvider } from "@/lib/energy/ems-tab-context";

interface NeonAppShellProps {
  children: ReactNode;
  sites?: SiteRecord[];
  activeSiteId?: string;
  onSelectSite?: (siteId: string) => void;
}

export function NeonAppShell({
  children,
  sites,
  activeSiteId,
  onSelectSite,
}: NeonAppShellProps) {
  return (
    <EmsTabProvider>
      <div className="h-screen overflow-hidden bg-theme-canvas text-theme-primary transition-colors duration-200 flex flex-col antialiased selection:bg-[#FF2A85] selection:text-white">
        <Topbar
          sites={sites}
          activeSiteId={activeSiteId}
          onSelectSite={onSelectSite}
        />

        <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden items-stretch">
          <DesktopSidebar className="hidden lg:flex shrink-0 h-full" />

          <main className="flex-1 h-full min-h-0 min-w-0 overflow-y-auto px-3 py-2.5 sm:px-5 sm:py-3.5 max-w-[1680px] mx-auto w-full pb-20 lg:pb-4">
            {children}
          </main>
        </div>

        <MobileBottomBar className="lg:hidden shrink-0" />
      </div>
    </EmsTabProvider>
  );
}
