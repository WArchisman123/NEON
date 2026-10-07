import { SiteRecord } from "./types";

export interface ComparativeDayRecord {
  date: string; // e.g. "27/Sep"
  fullDate: string; // e.g. "2026-09-27"
  dayName: string; // e.g. "Sun"
  actualEnergyKwh: number;
  expectedEnergyKwh: number;
  cufPct: number;
  specificYieldKwhPerKwp: number;
  peakIrradianceWm2: number;
  peakIrradianceTime: string;
  weatherCondition: "sunny" | "partly_cloudy" | "rain_curtailment";
  variancePct: number;
  inverterCount: number;
  pvDgFuelSavedLiters: number;
}

export interface ComparativeSummary {
  totalEnergyKwh: number;
  peakDayEnergyKwh: number;
  peakDayDate: string;
  avgDailyEnergyKwh: number;
  avgCufPct: number;
  avgSpecificYieldKwhPerKwp: number;
  curtailmentDaysCount: number;
  expectedTotalEnergyKwh: number;
  overallVariancePct: number;
}

export function generateComparativeDataset(
  site: SiteRecord,
  daysCount: number = 14
): {
  records: ComparativeDayRecord[];
  summary: ComparativeSummary;
} {
  const acCapacity = site.solar_capacity_kwp || 100;
  const dcCapacity = site.dc_capacity_kwp || Math.round(acCapacity * 1.06);

  const records: ComparativeDayRecord[] = [];
  const today = new Date();

  // Pattern of weather and generation matching competitor ref_img_2, 6, 7, 8
  // e.g. normal generation ~320 - 450 kWh, with specific overcast dip on 28-Sep down to ~84.48 kWh
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const monthStr = d.toLocaleString("en-US", { month: "short" });
    const dayNum = d.getDate();
    const dateStr = `${dayNum.toString().padStart(2, "0")}/${monthStr}`;
    const fullDate = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleString("en-US", { weekday: "short" });

    // Weather simulation: day 2 and day 8 have weather curtailments
    const isHeavyCurtailment = i === Math.min(10, daysCount - 2); // Overcast drop matching ref_img_8 (84.48 kWh)
    const isCloudy = i % 5 === 1;

    let weatherCondition: ComparativeDayRecord["weatherCondition"] = "sunny";
    let actualYield = 380 + ((dayNum * 17) % 85);

    if (isHeavyCurtailment) {
      actualYield = 84.48; // Explicit competitor dip value
      weatherCondition = "rain_curtailment";
    } else if (isCloudy) {
      actualYield = 240 + ((dayNum * 11) % 50);
      weatherCondition = "partly_cloudy";
    }

    // Scale yield by site capacity relative to 100 kW reference
    const scaleFactor = acCapacity / 100;
    const finalActual = parseFloat((actualYield * scaleFactor).toFixed(2));
    const expected = parseFloat((420 * scaleFactor).toFixed(2));

    // CUF % = (Actual kWh / (AC Capacity kW * 24 h)) * 100
    const cuf = parseFloat(((finalActual / (acCapacity * 24)) * 100).toFixed(2));

    // Specific Yield = Actual kWh / DC Capacity kWp
    const specificYield = parseFloat((finalActual / dcCapacity).toFixed(2));

    // Peak irradiance
    const peakIrr = isHeavyCurtailment
      ? 260
      : isCloudy
      ? 610 + (dayNum % 40)
      : 820 + (dayNum % 90);

    const variance = parseFloat(
      (((finalActual - expected) / expected) * 100).toFixed(1)
    );

    const pvDgSaved = parseFloat((finalActual * 0.08).toFixed(1));

    records.push({
      date: dateStr,
      fullDate,
      dayName,
      actualEnergyKwh: finalActual,
      expectedEnergyKwh: expected,
      cufPct: cuf,
      specificYieldKwhPerKwp: specificYield,
      peakIrradianceWm2: peakIrr,
      peakIrradianceTime: "12:45 PM",
      weatherCondition,
      variancePct: variance,
      inverterCount: 2,
      pvDgFuelSavedLiters: pvDgSaved,
    });
  }

  // Summary statistics
  const totalEnergy = records.reduce((acc, r) => acc + r.actualEnergyKwh, 0);
  const expectedTotal = records.reduce((acc, r) => acc + r.expectedEnergyKwh, 0);
  const peakRec = [...records].sort(
    (a, b) => b.actualEnergyKwh - a.actualEnergyKwh
  )[0];

  const avgEnergy = totalEnergy / records.length;
  const avgCuf = records.reduce((acc, r) => acc + r.cufPct, 0) / records.length;
  const avgSpecific =
    records.reduce((acc, r) => acc + r.specificYieldKwhPerKwp, 0) / records.length;
  const curtailmentCount = records.filter(
    (r) => r.weatherCondition === "rain_curtailment"
  ).length;

  const overallVariance =
    expectedTotal > 0
      ? ((totalEnergy - expectedTotal) / expectedTotal) * 100
      : 0;

  return {
    records,
    summary: {
      totalEnergyKwh: parseFloat(totalEnergy.toFixed(1)),
      peakDayEnergyKwh: peakRec ? peakRec.actualEnergyKwh : 0,
      peakDayDate: peakRec ? peakRec.date : "--",
      avgDailyEnergyKwh: parseFloat(avgEnergy.toFixed(1)),
      avgCufPct: parseFloat(avgCuf.toFixed(2)),
      avgSpecificYieldKwhPerKwp: parseFloat(avgSpecific.toFixed(2)),
      curtailmentDaysCount: curtailmentCount,
      expectedTotalEnergyKwh: parseFloat(expectedTotal.toFixed(1)),
      overallVariancePct: parseFloat(overallVariance.toFixed(1)),
    },
  };
}
