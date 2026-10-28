import { EdgeDeviceTelemetry } from "./types";

/**
 * Default live sample payload provided by edge hardware sensor device
 */
export const DEFAULT_EDGE_TELEMETRY: EdgeDeviceTelemetry = {
  "DayActive PowerWh": 14.2,
  "DayReactive PowerWh": -14.9,
  "Total_Active_PowerWh": 22950707.2,
  "Total Reactive PowerWh": 0.0,
  "Total Work time": 0.0,
  "inverter efficiency": 0.0,
  "Grid voltage AB": 0.1,
  "Grid voltage BC": 0.0,
  "Grid voltage AC": 18.5,
  "Grid voltage A": 0.0,
  "Grid current A": 0.3,
  "Grid frequency": 49.9,
  "Input active power": 0.0,
  "output apparent power": 6.1,
  "Output active power": 0.0,
  "Output reactive power": 0.0,
  "power factor": 0.0,
  "historyPV PowerWh": 27898675.2,
  "Day PV PowerWh": 16.0,
  "Dc voltage 1": 242.1,
  "Dc current 1": 0.1,
  "Dc voltage 2": 227.3,
  "Dc current 2": 0.1,
  "Dc voltage 3": 0.0,
  "Dc current 3": 0.0,
  "Dc voltage 4": 0.0,
  "Dc current 4": 0.0,
  "Day Load Power Wh": 0.0,
  "history Load Power": 37749312.0,
  "Meter active power": 361758820.0,
  "Day GridSell Power Wh": 45.0,
  "history GridSell_Power": 131081.0,
  "Day GridBuy Power Wh": 0.0,
  "history GridBuy Power": 4.0,
};

export interface NormalizedEdgeMetrics {
  // Energy Accumulators
  dayActiveKwh: number;
  dayReactiveKvarh: number;
  totalActiveMwh: number;
  totalReactiveKvarh: number;
  totalWorkHours: number;
  
  dayPvKwh: number;
  historyPvMwh: number;
  
  dayLoadKwh: number;
  historyLoadMwh: number;
  
  dayGridSellKwh: number;
  historyGridSellKwh: number;
  dayGridBuyKwh: number;
  historyGridBuyKwh: number;
  
  meterActiveMwh: number;
  
  // 3-Phase Grid Telemetry
  gridVoltageAB: number;
  gridVoltageBC: number;
  gridVoltageAC: number;
  gridVoltageA: number;
  gridCurrentA: number;
  gridFrequencyHz: number;
  
  // Power & Efficiency
  inputActiveKw: number;
  outputApparentKva: number;
  outputActiveKw: number;
  outputReactiveKvar: number;
  powerFactor: number;
  inverterEfficiencyPct: number;
  
  // DC MPPT Strings
  strings: {
    stringId: number;
    voltageV: number;
    currentA: number;
    powerW: number;
    status: "active" | "standby";
  }[];
}

/**
 * Normalizes raw edge device telemetry registers into standardized engineering units
 */
export function normalizeEdgeTelemetry(
  raw: Partial<EdgeDeviceTelemetry> = {}
): NormalizedEdgeMetrics {
  const data = { ...DEFAULT_EDGE_TELEMETRY, ...raw };

  const s1P = data["Dc voltage 1"] * data["Dc current 1"];
  const s2P = data["Dc voltage 2"] * data["Dc current 2"];
  const s3P = data["Dc voltage 3"] * data["Dc current 3"];
  const s4P = data["Dc voltage 4"] * data["Dc current 4"];

  return {
    dayActiveKwh: Number((data["DayActive PowerWh"] / 1000).toFixed(3)),
    dayReactiveKvarh: Number((data["DayReactive PowerWh"] / 1000).toFixed(3)),
    totalActiveMwh: Number((data["Total_Active_PowerWh"] / 1000000).toFixed(3)),
    totalReactiveKvarh: Number((data["Total Reactive PowerWh"] / 1000).toFixed(3)),
    totalWorkHours: Number(data["Total Work time"].toFixed(1)),

    dayPvKwh: Number((data["Day PV PowerWh"] / 1000).toFixed(3)),
    historyPvMwh: Number((data["historyPV PowerWh"] / 1000000).toFixed(3)),

    dayLoadKwh: Number((data["Day Load Power Wh"] / 1000).toFixed(3)),
    historyLoadMwh: Number((data["history Load Power"] / 1000000).toFixed(3)),

    dayGridSellKwh: Number((data["Day GridSell Power Wh"] / 1000).toFixed(3)),
    historyGridSellKwh: Number((data["history GridSell_Power"] / 1000).toFixed(3)),
    dayGridBuyKwh: Number((data["Day GridBuy Power Wh"] / 1000).toFixed(3)),
    historyGridBuyKwh: Number((data["history GridBuy Power"] / 1000).toFixed(3)),

    meterActiveMwh: Number((data["Meter active power"] / 1000000).toFixed(3)),

    gridVoltageAB: data["Grid voltage AB"],
    gridVoltageBC: data["Grid voltage BC"],
    gridVoltageAC: data["Grid voltage AC"],
    gridVoltageA: data["Grid voltage A"],
    gridCurrentA: data["Grid current A"],
    gridFrequencyHz: data["Grid frequency"],

    inputActiveKw: data["Input active power"],
    outputApparentKva: data["output apparent power"],
    outputActiveKw: data["Output active power"],
    outputReactiveKvar: data["Output reactive power"],
    powerFactor: data["power factor"],
    inverterEfficiencyPct: data["inverter efficiency"],

    strings: [
      {
        stringId: 1,
        voltageV: data["Dc voltage 1"],
        currentA: data["Dc current 1"],
        powerW: Number(s1P.toFixed(1)),
        status: data["Dc voltage 1"] > 20 ? "active" : "standby",
      },
      {
        stringId: 2,
        voltageV: data["Dc voltage 2"],
        currentA: data["Dc current 2"],
        powerW: Number(s2P.toFixed(1)),
        status: data["Dc voltage 2"] > 20 ? "active" : "standby",
      },
      {
        stringId: 3,
        voltageV: data["Dc voltage 3"],
        currentA: data["Dc current 3"],
        powerW: Number(s3P.toFixed(1)),
        status: data["Dc voltage 3"] > 20 ? "active" : "standby",
      },
      {
        stringId: 4,
        voltageV: data["Dc voltage 4"],
        currentA: data["Dc current 4"],
        powerW: Number(s4P.toFixed(1)),
        status: data["Dc voltage 4"] > 20 ? "active" : "standby",
      },
    ],
  };
}

/**
 * Format any Wh value into auto-scaled unit string (Wh, kWh, MWh)
 */
export function formatWh(val: number): string {
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)} MWh`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(2)} kWh`;
  }
  return `${val.toFixed(1)} Wh`;
}
