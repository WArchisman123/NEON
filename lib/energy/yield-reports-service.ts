import { SiteRecord } from "./types";

export interface InverterDayRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "14 Jul"
  inverterId: string; // "INV-01" | "INV-02"
  peakPowerKw: number;
  totalYieldKwh: number;
  efficiencyPct: number;
  dcVoltageV: number;
  specificYieldKwhPerKwp: number;
  performanceRatioPct: number;
  status: "Normal" | "Warning" | "Offline";
}

export interface GridMfmDayRecord {
  date: string;
  dayLabel: string;
  gridImportKwh: number;
  gridExportKwh: number;
  peakExportKw: number;
  peakImportKw: number;
  netBalanceKwh: number;
  exportRevenueInr: number;
  averagePowerFactor: number;
  gridFrequencyHz: number;
}

export interface DgDayRecord {
  date: string;
  dayLabel: string;
  runHours: number;
  generationYieldKwh: number;
  peakPowerKw: number;
  fuelConsumedLiters: number;
  specificFuelRateLPerKwh: number;
  fuelEfficiencyKwhPerLiter: number;
  status: "Standby" | "Operational";
}

export interface MonthlyGenerationRecord {
  monthKey: string; // "2026-01"
  monthName: string; // "Jan 2026"
  solarTotalKwh: number;
  solarTotalMwh: number;
  inv1Kwh: number;
  inv2Kwh: number;
  gridExportKwh: number;
  gridImportKwh: number;
  dgYieldKwh: number;
  peakSolarKw: number;
  specificYieldKwhPerKwp: number;
  performanceRatioPct: number;
  solarRevenueInr: number;
  avoidedCo2Tonnes: number;
}

export interface YearlyGenerationRecord {
  year: number;
  targetMwh: number;
  actualMwh: number;
  achievementPct: number;
  solarYieldMwh: number;
  gridExportMwh: number;
  dgYieldMwh: number;
  degradationPct: number;
  revenueInrLakhs: number;
  carbonOffsetTonnes: number;
  status: "Ahead of Plan" | "On Track" | "Pacing";
}

// Helper to seed dates between start and end
export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);

  // Safety cap to 90 days max
  let counter = 0;
  while (curr <= end && counter < 90) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + 1);
    counter++;
  }
  return dates.length > 0 ? dates : [startDate];
}

/**
 * Generate granular Inverter-wise daily records
 */
export function generateInverterRecords(
  site: SiteRecord,
  startDate: string,
  endDate: string,
  selectedInverter: "all" | "INV-01" | "INV-02" = "all"
): InverterDayRecord[] {
  const dates = getDatesBetween(startDate, endDate);
  const records: InverterDayRecord[] = [];
  const baseKwp = site.solar_capacity_kwp || 100;

  dates.forEach((dateStr, idx) => {
    const d = new Date(dateStr);
    const dayLabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const weatherFactor = 0.85 + Math.sin(idx * 0.7) * 0.14; // Natural solar variation

    if (selectedInverter === "all" || selectedInverter === "INV-01") {
      const yield1 = Number(((baseKwp * 0.5) * 4.4 * weatherFactor).toFixed(1));
      const peakKw1 = Number(((baseKwp * 0.5) * 0.92 * (0.95 + Math.sin(idx) * 0.04)).toFixed(1));
      records.push({
        date: dateStr,
        dayLabel,
        inverterId: "INV-01",
        peakPowerKw: peakKw1,
        totalYieldKwh: yield1,
        efficiencyPct: 98.6,
        dcVoltageV: 620.4,
        specificYieldKwhPerKwp: Number((yield1 / (baseKwp * 0.5)).toFixed(2)),
        performanceRatioPct: 82.4,
        status: "Normal",
      });
    }

    if (selectedInverter === "all" || selectedInverter === "INV-02") {
      const yield2 = Number(((baseKwp * 0.5) * 4.3 * weatherFactor).toFixed(1));
      const peakKw2 = Number(((baseKwp * 0.5) * 0.90 * (0.94 + Math.cos(idx) * 0.05)).toFixed(1));
      records.push({
        date: dateStr,
        dayLabel,
        inverterId: "INV-02",
        peakPowerKw: peakKw2,
        totalYieldKwh: yield2,
        efficiencyPct: 98.4,
        dcVoltageV: 618.9,
        specificYieldKwhPerKwp: Number((yield2 / (baseKwp * 0.5)).toFixed(2)),
        performanceRatioPct: 81.8,
        status: "Normal",
      });
    }
  });

  return records;
}

/**
 * Generate Grid MFM daily records with bidirectional export & import
 */
export function generateGridMfmRecords(
  site: SiteRecord,
  startDate: string,
  endDate: string
): GridMfmDayRecord[] {
  const dates = getDatesBetween(startDate, endDate);
  const tariffInr = Number(site.feed_in_tariff_inr ?? 5.5);

  return dates.map((dateStr, idx) => {
    const d = new Date(dateStr);
    const dayLabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    // Grid import and solar surplus export
    const isSunny = idx % 3 !== 0;
    const gridExportKwh = isSunny
      ? Number((85 + Math.sin(idx * 0.8) * 35).toFixed(1))
      : Number((18 + Math.sin(idx * 0.5) * 10).toFixed(1));
    const gridImportKwh = Number((120 + Math.cos(idx * 0.6) * 30).toFixed(1));
    const peakExportKw = Number((gridExportKwh * 0.28).toFixed(1));
    const peakImportKw = Number((gridImportKwh * 0.24).toFixed(1));
    const netBalanceKwh = Number((gridExportKwh - gridImportKwh).toFixed(1));
    const exportRevenueInr = Math.round(gridExportKwh * tariffInr);

    return {
      date: dateStr,
      dayLabel,
      gridImportKwh,
      gridExportKwh,
      peakExportKw,
      peakImportKw,
      netBalanceKwh,
      exportRevenueInr,
      averagePowerFactor: 0.985,
      gridFrequencyHz: 50.02,
    };
  });
}

/**
 * Generate DG daily records
 */
export function generateDgRecords(
  _site: SiteRecord,
  startDate: string,
  endDate: string
): DgDayRecord[] {
  const dates = getDatesBetween(startDate, endDate);

  return dates.map((dateStr, idx) => {
    const d = new Date(dateStr);
    const dayLabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    // Occasional grid outage trigger (e.g. every 5th day)
    const hasRun = idx % 5 === 2;
    const runHours = hasRun ? Number((1.5 + (idx % 3) * 0.5).toFixed(1)) : 0;
    const generationYieldKwh = hasRun ? Number((runHours * 45).toFixed(1)) : 0;
    const peakPowerKw = hasRun ? 48.5 : 0;
    const fuelConsumedLiters = hasRun ? Number((generationYieldKwh * 0.28).toFixed(1)) : 0;

    return {
      date: dateStr,
      dayLabel,
      runHours,
      generationYieldKwh,
      peakPowerKw,
      fuelConsumedLiters,
      specificFuelRateLPerKwh: hasRun ? 0.28 : 0,
      fuelEfficiencyKwhPerLiter: hasRun ? 3.57 : 0,
      status: hasRun ? "Operational" : "Standby",
    };
  });
}

/**
 * 12-Month Generation Records (Jan - Dec)
 */
export function generateMonthlyGenerationRecords(site: SiteRecord): MonthlyGenerationRecord[] {
  const months = [
    { key: "2026-01", name: "Jan 2026", solarKwh: 12450, inv1: 6300, inv2: 6150, exportKwh: 3400, importKwh: 4800, dgKwh: 120 },
    { key: "2026-02", name: "Feb 2026", solarKwh: 13100, inv1: 6650, inv2: 6450, exportKwh: 3900, importKwh: 4400, dgKwh: 90 },
    { key: "2026-03", name: "Mar 2026", solarKwh: 14800, inv1: 7500, inv2: 7300, exportKwh: 4800, importKwh: 4200, dgKwh: 60 },
    { key: "2026-04", name: "Apr 2026", solarKwh: 15400, inv1: 7800, inv2: 7600, exportKwh: 5200, importKwh: 4100, dgKwh: 45 },
    { key: "2026-05", name: "May 2026", solarKwh: 16200, inv1: 8200, inv2: 8000, exportKwh: 5800, importKwh: 4000, dgKwh: 30 },
    { key: "2026-06", name: "Jun 2026", solarKwh: 14100, inv1: 7150, inv2: 6950, exportKwh: 4300, importKwh: 4300, dgKwh: 80 },
    { key: "2026-07", name: "Jul 2026", solarKwh: 13800, inv1: 7000, inv2: 6800, exportKwh: 4100, importKwh: 4400, dgKwh: 110 },
    { key: "2026-08", name: "Aug 2026", solarKwh: 13950, inv1: 7080, inv2: 6870, exportKwh: 4250, importKwh: 4350, dgKwh: 95 },
    { key: "2026-09", name: "Sep 2026", solarKwh: 14600, inv1: 7400, inv2: 7200, exportKwh: 4700, importKwh: 4200, dgKwh: 50 },
    { key: "2026-10", name: "Oct 2026", solarKwh: 14200, inv1: 7200, inv2: 7000, exportKwh: 4500, importKwh: 4250, dgKwh: 40 },
    { key: "2026-11", name: "Nov 2026", solarKwh: 12900, inv1: 6550, inv2: 6350, exportKwh: 3700, importKwh: 4600, dgKwh: 70 },
    { key: "2026-12", name: "Dec 2026", solarKwh: 12100, inv1: 6150, inv2: 5950, exportKwh: 3250, importKwh: 4900, dgKwh: 130 },
  ];

  const tariff = Number(site.feed_in_tariff_inr ?? 5.5);
  const baseKwp = site.solar_capacity_kwp || 100;

  return months.map((m) => {
    const specificYield = Number((m.solarKwh / baseKwp).toFixed(1));
    const prPct = 82.2;
    const revenue = Math.round(m.solarKwh * tariff);
    const avoidedCo2 = Number(((m.solarKwh * 0.82) / 1000).toFixed(2));

    return {
      monthKey: m.key,
      monthName: m.name,
      solarTotalKwh: m.solarKwh,
      solarTotalMwh: Number((m.solarKwh / 1000).toFixed(2)),
      inv1Kwh: m.inv1,
      inv2Kwh: m.inv2,
      gridExportKwh: m.exportKwh,
      gridImportKwh: m.importKwh,
      dgYieldKwh: m.dgKwh,
      peakSolarKw: 89.3,
      specificYieldKwhPerKwp: specificYield,
      performanceRatioPct: prPct,
      solarRevenueInr: revenue,
      avoidedCo2Tonnes: avoidedCo2,
    };
  });
}

/**
 * Multi-Year Generation Records (2024 to 2026 + Lifetime)
 */
export function generateYearlyGenerationRecords(site: SiteRecord): YearlyGenerationRecord[] {
  const target = Number(site.annual_target_mwh ?? 165);

  return [
    {
      year: 2024,
      targetMwh: target,
      actualMwh: 168.4,
      achievementPct: 102.1,
      solarYieldMwh: 168.4,
      gridExportMwh: 52.6,
      dgYieldMwh: 1.2,
      degradationPct: 0.0,
      revenueInrLakhs: 9.26,
      carbonOffsetTonnes: 138.1,
      status: "Ahead of Plan",
    },
    {
      year: 2025,
      targetMwh: target,
      actualMwh: 166.2,
      achievementPct: 100.7,
      solarYieldMwh: 166.2,
      gridExportMwh: 51.4,
      dgYieldMwh: 0.9,
      degradationPct: 0.6,
      revenueInrLakhs: 9.14,
      carbonOffsetTonnes: 136.3,
      status: "Ahead of Plan",
    },
    {
      year: 2026,
      targetMwh: target,
      actualMwh: 142.5, // YTD
      achievementPct: 86.4,
      solarYieldMwh: 142.5,
      gridExportMwh: 44.8,
      dgYieldMwh: 0.8,
      degradationPct: 1.1,
      revenueInrLakhs: 7.84,
      carbonOffsetTonnes: 116.8,
      status: "On Track",
    },
  ];
}
