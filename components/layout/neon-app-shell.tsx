"use client";

import React, { ReactNode } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { Topbar } from "./topbar";
import { MobileBottomBar } from "./mobile-bottom-bar";

interface NeonAppShellProps {
  children: ReactNode;
}

export function NeonAppShell({ children }: NeonAppShellProps) {
  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 flex flex-col antialiased selection:bg-[#FF2A85] selection:text-white">
      <Topbar />

      <div className="flex flex-1 items-stretch min-w-0">
        <DesktopSidebar className="hidden lg:flex" />

        <main className="flex-1 flex flex-col min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-[1600px] mx-auto w-full pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileBottomBar className="lg:hidden" />
    </div>
  );
}
