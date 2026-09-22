import { SiteRecord } from "./types";

export type FlowDirection = "forward" | "backward" | "idle";

export interface ConduitFlow {
  id: string;
  source: string;
  target: string;
  kw: number;
  direction: FlowDirection;
  color: string;
  speedSec: number;
  label: string;
  active: boolean;
}

export interface DirectTransfers {
  solarToLoadKw: number;
  solarToBessKw: number;
  solarToGridKw: number;
  bessToLoadKw: number;
  dgToLoadKw: number;
  gridToLoadKw: number;
}

export interface LoadEnergyMix {
  totalDemandKw: number;
  solarKw: number;
  solarPct: number;
  bessKw: number;
  bessPct: number;
  dgKw: number;
  dgPct: number;
  gridKw: number;
  gridPct: number;
}

export interface SourceOutputs {
  solar: {
    totalKw: number;
    toLoadKw: number;
    toBessKw: number;
    toGridKw: number;
  };
  bess: {
    totalKw: number;
    direction: "charging" | "discharging" | "idle";
    toLoadKw: number;
    fromSolarKw: number;
  };
  dg: {
    totalKw: number;
    toLoadKw: number;
    running: boolean;
  };
  grid: {
    totalKw: number;
    direction: "import" | "export" | "islanded" | "idle";
    toLoadKw: number;
    fromSolarKw: number;
  };
}

export interface SolarTelemetryDetails {
  inverterEfficiencyPct: number;
  irradianceWpm2: number;
  moduleTempC: number;
  performanceRatioPct: number;
  mpptChannels: Array<{
    channel: number;
    voltageV: number;
    currentA: number;
    powerKw: number;
    status: "normal" | "soiling_warning" | "fuse_check";
  }>;
}

export interface BessTelemetryDetails {
  socPct: number;
  sohPct: number;
  packVoltageV: number;
  packCurrentA: number;
  cellMaxMv: number;
  cellMinMv: number;
  cellDeltaVMv: number;
  cellMaxTempC: number;
  coolantTempC: number;
  chillerRunning: boolean;
  contactorClosed: boolean;
  thermalMatrix16: Array<{
    cellId: number;
    tempC: number;
    voltageMv: number;
    status: "optimal" | "elevated" | "hotspot";
  }>;
}

export interface DgTelemetryDetails {
  state: "RUNNING" | "AUTO_STANDBY" | "OFFLINE";
  rpm: number;
  oilPressureBar: number;
  coolantTempC: number;
  fuelPct: number;
  fuelBurnRateLph: number;
  starterBatteryV: number;
  runHours: number;
}

export interface GridTelemetryDetails {
  frequencyHz: number;
  powerFactor: number;
  voltageL1L2: number;
  voltageL2L3: number;
  voltageL3L1: number;
  thdPct: number;
  tariffSlot: string;
  currentCostPerKwh: number;
}

export interface LoadTelemetryDetails {
  activeDemandKw: number;
  apparentPowerKva: number;
  reactivePowerKvar: number;
  powerFactor: number;
  phaseL1CurrentA: number;
  phaseL2CurrentA: number;
  phaseL3CurrentA: number;
  contractedMaxDemandKva: number;
  peakDemandTodayKva: number;
}

export interface EnergyFlowState {
  scenario: "live" | "solar_surplus" | "peak_shaving" | "grid_support" | "islanded_dg";
  systemMode: string;
  systemModeDescription: string;
  totalGenerationKw: number;
  totalConsumptionKw: number;
  netGridKw: number;
  directTransfers: DirectTransfers;
  loadEnergyMix: LoadEnergyMix;
  sourceOutputs: SourceOutputs;
  conduits: {
    solarToLoad: ConduitFlow;
    bessToLoad: ConduitFlow;
    solarToBess: ConduitFlow;
    dgToLoad: ConduitFlow;
    gridToLoad: ConduitFlow;
    solarToGrid: ConduitFlow;
  };
  details: {
    solar: SolarTelemetryDetails;
    bess: BessTelemetryDetails;
    dg: DgTelemetryDetails;
    grid: GridTelemetryDetails;
    load: LoadTelemetryDetails;
  };
  lastUpdated: Date;
}

/**
 * Calculates direct source-to-sink physical energy transfers,
 * explicit conduit paths, and load energy mix breakdown.
 */
export function calculateEnergyFlows(
  site: SiteRecord,
  scenario: "live" | "solar_surplus" | "peak_shaving" | "grid_support" | "islanded_dg" = "live",
  timestamp?: number
): EnergyFlowState {
  let solarKw = site.solar_power_kw ?? site.solar_capacity_kwp ?? 0;
  let bessKw = site.live_bess_power_kw ?? (site.has_bess ? -150 : 0);
  let dgKw = site.dg_power_kw ?? (site.dg_running ? 180 : 0);
  let gridKw = site.grid_power_kw ?? (site.has_grid ? -120 : 0);
  let loadKw = site.load_power_kw ?? 620;
  const bessSoc = site.bess_soc_pct ?? 82.0;
  let dgRunning = site.dg_running ?? false;
  const dgFuel = site.dg_fuel_pct ?? 85.0;

  // Apply Scenario Overrides if requested for live testing
  if (scenario === "solar_surplus") {
    solarKw = Math.round((site.solar_capacity_kwp || 1200) * 0.95);
    loadKw = Math.round((site.solar_capacity_kwp || 1200) * 0.45);
    const surplus = solarKw - loadKw;
    bessKw = site.has_bess ? -Math.round(surplus * 0.55) : 0; // charging
    gridKw = site.has_grid ? -(surplus + bessKw) : 0; // exporting
    dgKw = 0;
    dgRunning = false;
  } else if (scenario === "peak_shaving") {
    solarKw = Math.round((site.solar_capacity_kwp || 1200) * 0.4);
    loadKw = Math.round((site.solar_capacity_kwp || 1200) * 0.85);
    const deficit = loadKw - solarKw;
    bessKw = site.has_bess ? Math.min(deficit, site.bess_power_kw || 400) : 0; // discharging
    gridKw = Math.max(0, deficit - bessKw); // remaining from grid
    dgKw = 0;
    dgRunning = false;
  } else if (scenario === "grid_support") {
    solarKw = 0;
    loadKw = Math.round((site.solar_capacity_kwp || 1000) * 0.65);
    bessKw = 0;
    gridKw = loadKw;
    dgKw = 0;
    dgRunning = false;
  } else if (scenario === "islanded_dg") {
    solarKw = Math.round((site.solar_capacity_kwp || 800) * 0.4);
    loadKw = 700;
    gridKw = 0; // Islanded / Disconnected
    bessKw = 0;
    dgKw = Math.max(0, loadKw - solarKw);
    dgRunning = true;
  }

  // Exact Point-to-Point Power Routing Physics
  // 1. Solar First Priority: Powers Facility Load
  const solarToLoadKw = Math.min(solarKw, loadKw);
  let unservedLoad = loadKw - solarToLoadKw;
  let excessSolar = solarKw - solarToLoadKw;

  // 2. Solar Excess: Charges BESS (if BESS is in charging state, bessKw < 0)
  let solarToBessKw = 0;
  if (excessSolar > 0 && bessKw < 0 && site.has_bess) {
    solarToBessKw = Math.min(excessSolar, Math.abs(bessKw));
    excessSolar -= solarToBessKw;
  }

  // 3. Solar Excess: Exports to Utility Grid (if gridKw < 0 and site has grid)
  let solarToGridKw = 0;
  if (excessSolar > 0 && site.has_grid) {
    solarToGridKw = excessSolar;
    excessSolar = 0;
  }

  // 4. Load Deficit Support: BESS Discharging (if bessKw > 0)
  let bessToLoadKw = 0;
  if (unservedLoad > 0 && bessKw > 0 && site.has_bess) {
    bessToLoadKw = Math.min(unservedLoad, bessKw);
    unservedLoad -= bessToLoadKw;
  }

  // 5. Load Deficit Support: DG Peaker (if dgRunning and dgKw > 0)
  let dgToLoadKw = 0;
  if (unservedLoad > 0 && dgRunning && dgKw > 0 && site.has_dg) {
    dgToLoadKw = Math.min(unservedLoad, dgKw);
    unservedLoad -= dgToLoadKw;
  }

  // 6. Load Deficit Support: Utility Grid Import (if gridKw > 0 and site has grid)
  let gridToLoadKw = 0;
  if (unservedLoad > 0 && site.has_grid) {
    gridToLoadKw = unservedLoad;
    unservedLoad = 0;
  }

  // Calculate Load Energy Mix Percentages
  const totalLoad = Math.max(1, loadKw);
  const solarPct = Math.round((solarToLoadKw / totalLoad) * 100);
  const bessPct = Math.round((bessToLoadKw / totalLoad) * 100);
  const dgPct = Math.round((dgToLoadKw / totalLoad) * 100);
  const gridPct = Math.max(0, 100 - (solarPct + bessPct + dgPct));

  // Determine System Operational Mode
  let systemMode = "Grid-Tied Self-Consumption";
  let systemModeDescription = `Solar PV supplying ${solarToLoadKw} kW (${solarPct}%) of facility demand with zero grid import.`;

  const isIslanded = !site.has_grid || scenario === "islanded_dg";

  if (isIslanded) {
    if (dgRunning && dgToLoadKw > 0) {
      systemMode = "Islanded DG Peaker Support";
      systemModeDescription = `Microgrid islanded. DG genset supplying ${dgToLoadKw} kW and Solar supplying ${solarToLoadKw} kW to load.`;
    } else if (site.has_bess) {
      systemMode = "100% Clean Islanded Microgrid";
      systemModeDescription = "Zero emissions. Solar PV and BESS storage independently sustaining 100% of facility demand.";
    } else {
      systemMode = "Islanded Self-Powered";
      systemModeDescription = "Microgrid operating disconnected from utility distribution.";
    }
  } else if (solarToGridKw > 10) {
    systemMode = "Surplus Green Grid Feed-In";
    systemModeDescription = `Solar 100% powering load, with ${solarToGridKw} kW exported to utility grid and ${solarToBessKw} kW charging BESS.`;
  } else if (bessToLoadKw > 50) {
    systemMode = "Peak Shaving & BESS Discharge";
    systemModeDescription = `BESS discharging ${bessToLoadKw} kW alongside Solar ${solarToLoadKw} kW to eliminate peak demand charges.`;
  } else if (solarToBessKw > 50) {
    systemMode = "Solar Self-Consumption & BESS Charging";
    systemModeDescription = `Solar powering facility load and storing ${solarToBessKw} kW into BESS lithium packs.`;
  } else if (gridToLoadKw > 50) {
    systemMode = "Utility Grid Import Assist";
    systemModeDescription = `Grid importing ${gridToLoadKw} kW (${gridPct}%) to supplement local clean generation.`;
  }

  // Calculate animated conduit speeds (seconds per cycle: faster for higher kW)
  const calcSpeed = (kw: number) => {
    const absKw = Math.abs(kw);
    if (absKw <= 0) return 3.0;
    return Math.max(0.6, Math.min(2.8, 2500 / (absKw + 200)));
  };

  // Direct Point-to-Point Conduits
  const solarToLoadConduit: ConduitFlow = {
    id: "solar-to-load",
    source: "solar",
    target: "load",
    kw: solarToLoadKw,
    direction: solarToLoadKw > 0 ? "forward" : "idle",
    color: "#FFD600",
    speedSec: calcSpeed(solarToLoadKw),
    label: `Solar ➔ Load: ${solarToLoadKw.toLocaleString()} kW`,
    active: solarToLoadKw > 0,
  };

  const bessToLoadConduit: ConduitFlow = {
    id: "bess-to-load",
    source: "bess",
    target: "load",
    kw: bessToLoadKw,
    direction: bessToLoadKw > 0 ? "forward" : "idle",
    color: "#00F0FF",
    speedSec: calcSpeed(bessToLoadKw),
    label: `BESS ➔ Load: ${bessToLoadKw.toLocaleString()} kW`,
    active: bessToLoadKw > 0,
  };

  const solarToBessConduit: ConduitFlow = {
    id: "solar-to-bess",
    source: "solar",
    target: "bess",
    kw: solarToBessKw,
    direction: solarToBessKw > 0 ? "forward" : "idle",
    color: "#FFD600",
    speedSec: calcSpeed(solarToBessKw),
    label: `Solar ➔ BESS: ${solarToBessKw.toLocaleString()} kW (Charge)`,
    active: solarToBessKw > 0,
  };

  const dgToLoadConduit: ConduitFlow = {
    id: "dg-to-load",
    source: "dg",
    target: "load",
    kw: dgToLoadKw,
    direction: dgToLoadKw > 0 ? "forward" : "idle",
    color: "#FF6B00",
    speedSec: calcSpeed(dgToLoadKw),
    label: `DG ➔ Load: ${dgToLoadKw.toLocaleString()} kW`,
    active: dgToLoadKw > 0,
  };

  const gridToLoadConduit: ConduitFlow = {
    id: "grid-to-load",
    source: "grid",
    target: "load",
    kw: gridToLoadKw,
    direction: gridToLoadKw > 0 ? "forward" : "idle",
    color: "#9D4EDD",
    speedSec: calcSpeed(gridToLoadKw),
    label: `Grid ➔ Load: ${gridToLoadKw.toLocaleString()} kW`,
    active: gridToLoadKw > 0,
  };

  const solarToGridConduit: ConduitFlow = {
    id: "solar-to-grid",
    source: "solar",
    target: "grid",
    kw: solarToGridKw,
    direction: solarToGridKw > 0 ? "forward" : "idle",
    color: "#00E676",
    speedSec: calcSpeed(solarToGridKw),
    label: `Solar ➔ Grid: ${solarToGridKw.toLocaleString()} kW (Feed-In)`,
    active: solarToGridKw > 0,
  };

  // 16-Cell BESS Thermal Heatmap Matrix
  const thermalMatrix16 = Array.from({ length: 16 }, (_, i) => {
    const baseTemp = 25.4 + (i % 4) * 0.8 + Math.floor(i / 4) * 0.6;
    const tempC = Math.round(baseTemp * 10) / 10;
    const delta = (i % 2 === 0 ? 1 : -1) * (i * 2);
    const voltageMv = 3330 + delta;
    return {
      cellId: i + 1,
      tempC,
      voltageMv,
      status: (tempC > 38 ? "hotspot" : tempC > 30 ? "elevated" : "optimal") as "optimal" | "elevated" | "hotspot",
    };
  });

  // 12-Channel MPPT String Matrix
  const mpptChannels = Array.from({ length: 12 }, (_, i) => {
    const isDerated = i === 4;
    const currentA = isDerated ? 9.8 : Math.round((13.4 + (i % 3) * 0.3) * 10) / 10;
    const voltageV = Math.round((695 + (i % 4) * 3) * 10) / 10;
    const powerKw = Math.round(((voltageV * currentA) / 1000) * 10) / 10;
    return {
      channel: i + 1,
      voltageV,
      currentA,
      powerKw,
      status: isDerated ? ("soiling_warning" as const) : ("normal" as const),
    };
  });

  return {
    scenario,
    systemMode,
    systemModeDescription,
    totalGenerationKw: solarKw + (dgRunning ? dgKw : 0) + (bessKw > 0 ? bessKw : 0),
    totalConsumptionKw: loadKw + (bessKw < 0 ? Math.abs(bessKw) : 0),
    netGridKw: gridKw,
    directTransfers: {
      solarToLoadKw,
      solarToBessKw,
      solarToGridKw,
      bessToLoadKw,
      dgToLoadKw,
      gridToLoadKw,
    },
    loadEnergyMix: {
      totalDemandKw: loadKw,
      solarKw: solarToLoadKw,
      solarPct,
      bessKw: bessToLoadKw,
      bessPct,
      dgKw: dgToLoadKw,
      dgPct,
      gridKw: gridToLoadKw,
      gridPct,
    },
    sourceOutputs: {
      solar: {
        totalKw: solarKw,
        toLoadKw: solarToLoadKw,
        toBessKw: solarToBessKw,
        toGridKw: solarToGridKw,
      },
      bess: {
        totalKw: Math.abs(bessKw),
        direction: bessKw < 0 ? "charging" : bessKw > 0 ? "discharging" : "idle",
        toLoadKw: bessToLoadKw,
        fromSolarKw: solarToBessKw,
      },
      dg: {
        totalKw: dgKw,
        toLoadKw: dgToLoadKw,
        running: dgRunning && dgKw > 0,
      },
      grid: {
        totalKw: Math.abs(gridKw),
        direction: isIslanded ? "islanded" : gridKw > 0 ? "import" : gridKw < 0 ? "export" : "idle",
        toLoadKw: gridToLoadKw,
        fromSolarKw: solarToGridKw,
      },
    },
    conduits: {
      solarToLoad: solarToLoadConduit,
      bessToLoad: bessToLoadConduit,
      solarToBess: solarToBessConduit,
      dgToLoad: dgToLoadConduit,
      gridToLoad: gridToLoadConduit,
      solarToGrid: solarToGridConduit,
    },
    details: {
      solar: {
        inverterEfficiencyPct: 98.4,
        irradianceWpm2: 840.5,
        moduleTempC: 38.2,
        performanceRatioPct: 84.6,
        mpptChannels,
      },
      bess: {
        socPct: bessSoc,
        sohPct: 98.2,
        packVoltageV: 984.6,
        packCurrentA: bessKw !== 0 ? Math.round((bessKw * 1000) / 984.6) : 0,
        cellMaxMv: 3342,
        cellMinMv: 3324,
        cellDeltaVMv: 18,
        cellMaxTempC: 29.8,
        coolantTempC: 19.4,
        chillerRunning: true,
        contactorClosed: true,
        thermalMatrix16,
      },
      dg: {
        state: dgRunning ? "RUNNING" : "AUTO_STANDBY",
        rpm: dgRunning ? 1800 : 0,
        oilPressureBar: dgRunning ? 4.8 : 0.0,
        coolantTempC: dgRunning ? 84.5 : 28.0,
        fuelPct: dgFuel,
        fuelBurnRateLph: dgRunning ? 38.4 : 0.0,
        starterBatteryV: 26.4,
        runHours: 1420.5,
      },
      grid: {
        frequencyHz: 50.02,
        powerFactor: 0.992,
        voltageL1L2: 415.2,
        voltageL2L3: 414.8,
        voltageL3L1: 415.0,
        thdPct: 1.4,
        tariffSlot: gridKw < 0 ? "PEAK_FEED_IN" : "NORMAL_COMMERCIAL",
        currentCostPerKwh: site.peak_tariff_rate || 0.14,
      },
      load: {
        activeDemandKw: loadKw,
        apparentPowerKva: Math.round(loadKw / 0.98),
        reactivePowerKvar: Math.round(loadKw * 0.2),
        powerFactor: 0.98,
        phaseL1CurrentA: Math.round((loadKw / 3 / 0.24) * 0.99),
        phaseL2CurrentA: Math.round((loadKw / 3 / 0.24) * 1.01),
        phaseL3CurrentA: Math.round(loadKw / 3 / 0.24),
        contractedMaxDemandKva: site.contracted_demand_kva || 1000,
        peakDemandTodayKva: Math.round(loadKw * 1.08),
      },
    },
    lastUpdated: timestamp != null ? new Date(timestamp) : new Date(),
  };
}
