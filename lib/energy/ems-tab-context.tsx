"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type EmsTabId =
  | "dashboard"
  | "flow"
  | "inverter"
  | "metering"
  | "bess"
  | "thermal"
  | "fire-safety"
  | "historian"
  | "thresholds"
  | "controls";

interface EmsTabContextType {
  activeTab: EmsTabId;
  setActiveTab: (tab: EmsTabId) => void;
}

const EmsTabContext = createContext<EmsTabContextType | undefined>(undefined);

export function EmsTabProvider({
  children,
  defaultTab = "dashboard",
}: {
  children: ReactNode;
  defaultTab?: EmsTabId;
}) {
  const [activeTab, setActiveTab] = useState<EmsTabId>(defaultTab);

  return (
    <EmsTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </EmsTabContext.Provider>
  );
}

export function useEmsTab() {
  const context = useContext(EmsTabContext);
  if (!context) {
    // Return fallback state if used outside provider
    return {
      activeTab: "dashboard" as EmsTabId,
      setActiveTab: () => {},
    };
  }
  return context;
}
