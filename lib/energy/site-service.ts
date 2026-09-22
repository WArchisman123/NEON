import { query } from "@/lib/supabase/db";
import {
  SiteRecord,
  SiteDeviceRecord,
  HourlyTelemetryRecord,
  UserRecord,
  OrganizationRecord,
} from "./types";

export type {
  SiteRecord,
  SiteDeviceRecord,
  HourlyTelemetryRecord,
  UserRecord,
  OrganizationRecord,
};

/**
 * Ensures an organization exists in Supabase PostgreSQL mapped to clerk_org_id.
 * If newly created, automatically seeds 3 diverse demo sites with 30-day telemetry.
 */
export async function getOrCreateOrg(
  clerkOrgId: string,
  orgName = "Apex Clean Energy"
): Promise<{ id: string; clerk_org_id: string; name: string }> {
  const existing = await query<{ id: string; clerk_org_id: string; name: string }>(
    "SELECT id, clerk_org_id, name FROM public.organizations WHERE clerk_org_id = $1 LIMIT 1",
    [clerkOrgId]
  );

  if (existing.rows.length > 0) {
    // Check if sites exist; if empty, seed them
    await seedDemoSitesIfEmpty(existing.rows[0].id);
    return existing.rows[0];
  }

  const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const inserted = await query<{ id: string; clerk_org_id: string; name: string }>(
    `INSERT INTO public.organizations (clerk_org_id, name, slug)
     VALUES ($1, $2, $3)
     RETURNING id, clerk_org_id, name`,
    [clerkOrgId, orgName, slug]
  );

  const org = inserted.rows[0];
  await seedDemoSitesIfEmpty(org.id);
  return org;
}

/**
 * Seeds 3 diverse demo sites into the real Supabase PostgreSQL database
 * Site 1: Solar + BESS + Grid (No DG)
 * Site 2: Solar + BESS + DG + Grid (Full Microgrid)
 * Site 3: Solar + DG + Grid (No BESS)
 */
export async function seedDemoSitesIfEmpty(orgId: string): Promise<void> {
  const countRes = await query<{ count: string }>(
    "SELECT count(*) FROM public.sites WHERE org_id = $1",
    [orgId]
  );

  if (parseInt(countRes.rows[0].count, 10) > 0) {
    return;
  }

  console.log(`[seed] Seeding demo sites for organization ${orgId} in Supabase PostgreSQL...`);

  // 1. Site 1: Bakersfield Central Solar-Plus-Storage
  const site1Res = await query<{ id: string }>(
    `INSERT INTO public.sites (
      org_id, name, slug, location_city, location_state, plant_type, status,
      solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
      has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id`,
    [
      orgId,
      "Bakersfield Central Solar-Plus-Storage",
      "bakersfield-central",
      "Bakersfield",
      "CA",
      "commercial_industrial",
      "online",
      940,
      1500,
      500,
      0,
      800,
      true,
      true,
      false,
      true,
      0.18,
      0.07,
    ]
  );
  const site1Id = site1Res.rows[0].id;

  // Site 1 Devices
  await query(
    `INSERT INTO public.site_devices (site_id, name, category, manufacturer, model) VALUES
     ($1, 'Main Central Inverter 01', 'solar_inverter', 'SMA Solar', 'Sunny Highpower 150kW'),
     ($1, 'Central Inverter 02', 'solar_inverter', 'SMA Solar', 'Sunny Highpower 150kW'),
     ($1, 'BESS Battery Rack Matrix', 'bess_bms', 'Tesla Energy', 'Megapack BMS v2'),
     ($1, 'BESS Power Conversion System', 'bess_pcs', 'Dynapower', 'CPS-500 Inverter'),
     ($1, 'Substation Feed Energy Meter', 'grid_meter', 'Schneider Electric', 'PowerLogic ION9000')`,
    [site1Id]
  );

  // Site 1 Snapshot
  await query(
    `INSERT INTO public.telemetry_snapshots (
      site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
      bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
      solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      site1Id,
      940,
      -240, // charging
      -80, // export
      0,
      620,
      84.2,
      98.6,
      0,
      false,
      60.0,
      0.99,
      4820,
      3950,
      120,
      990,
      2380,
    ]
  );

  // 2. Site 2: Mojave Desert Industrial Microgrid Alpha
  const site2Res = await query<{ id: string }>(
    `INSERT INTO public.sites (
      org_id, name, slug, location_city, location_state, plant_type, status,
      solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
      has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id`,
    [
      orgId,
      "Mojave Desert Industrial Microgrid Alpha",
      "mojave-desert-alpha",
      "Barstow",
      "CA",
      "utility_microgrid",
      "online",
      1450,
      2200,
      800,
      800,
      1200,
      true,
      true,
      true,
      true,
      0.22,
      0.08,
    ]
  );
  const site2Id = site2Res.rows[0].id;

  // Site 2 Devices
  await query(
    `INSERT INTO public.site_devices (site_id, name, category, manufacturer, model) VALUES
     ($1, 'Utility String Inverter Bank', 'solar_inverter', 'Sungrow', 'SG250HX 250kW'),
     ($1, 'LFP Containerized Storage BMS', 'bess_bms', 'Fluence', 'Gridstack OS Gen6'),
     ($1, 'Bi-directional Storage Inverter', 'bess_pcs', 'Ingeteam', 'Ingecon Sun B Series 800kW'),
     ($1, 'Backup Genset Controller 01', 'diesel_generator', 'Cummins Power', 'QSK23-G7 800kVA'),
     ($1, 'Primary Utility Intertie Meter', 'grid_meter', 'Siemens', 'PAC4200 Smart Meter')`,
    [site2Id]
  );

  // Site 2 Snapshot
  await query(
    `INSERT INTO public.telemetry_snapshots (
      site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
      bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
      solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      site2Id,
      1450,
      150, // discharging
      -420,
      0,
      1180,
      71.0,
      99.2,
      88.5,
      false,
      60.0,
      0.98,
      7390,
      6120,
      0,
      1270,
      3820,
    ]
  );

  // 3. Site 3: Sonora Valley Agri-Voltaics & Peaker
  const site3Res = await query<{ id: string }>(
    `INSERT INTO public.sites (
      org_id, name, slug, location_city, location_state, plant_type, status,
      solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
      has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id`,
    [
      orgId,
      "Sonora Valley Agri-Voltaics & Peaker",
      "sonora-valley",
      "Fresno",
      "CA",
      "commercial_industrial",
      "online",
      1030,
      0,
      0,
      600,
      900,
      true,
      false, // NO BESS
      true, // HAS DG
      true,
      0.19,
      0.07,
    ]
  );
  const site3Id = site3Res.rows[0].id;

  // Site 3 Devices
  await query(
    `INSERT INTO public.site_devices (site_id, name, category, manufacturer, model) VALUES
     ($1, 'Tracker Inverter Cluster', 'solar_inverter', 'Huawei', 'SUN2000-100KTL-M1'),
     ($1, 'Agricultural Peaker Generator', 'diesel_generator', 'Caterpillar', 'CAT C18 600kVA Diesel'),
     ($1, 'Agricultural Feeder Meter', 'grid_meter', 'Schneider Electric', 'PowerLogic ION9000')`,
    [site3Id]
  );

  // Site 3 Snapshot
  await query(
    `INSERT INTO public.telemetry_snapshots (
      site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
      bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
      solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      site3Id,
      1030,
      0, // no bess
      -290,
      0,
      740,
      0,
      0,
      92.0,
      false,
      60.0,
      0.99,
      5210,
      4110,
      180,
      1280,
      2560,
    ]
  );

  // 4. Generate 30 days (720 hourly records) of realistic time-series telemetry for all 3 sites
  await generateHourlyTelemetryForSite(site1Id, 940, 1500, 620, false);
  await generateHourlyTelemetryForSite(site2Id, 1450, 2200, 1180, true);
  await generateHourlyTelemetryForSite(site3Id, 1030, 0, 740, true);

  console.log(`[seed] Demo sites seeded successfully for org ${orgId}!`);
}

/**
 * Generates 30 days of hourly dispatch telemetry records
 */
async function generateHourlyTelemetryForSite(
  siteId: string,
  solarCapacityKwp: number,
  bessCapacityKwh: number,
  baseLoadKw: number,
  hasDg: boolean
) {
  const now = new Date();
  const rows: Array<[
    string,
    string,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ]> = [];

  // Generate 720 hours (30 days back to now)
  for (let i = 720; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const hour = time.getHours();

    // Solar bell curve: rises at 6am, peaks around 13:00, sets at 19:00
    let solarFraction = 0;
    if (hour >= 6 && hour <= 19) {
      const x = (hour - 6) / 13;
      solarFraction = Math.sin(x * Math.PI) * (0.85 + 0.15 * Math.sin(i * 0.1));
    }
    const solarKw = Math.max(0, Math.round(solarCapacityKwp * solarFraction));

    // Load curve: higher during day, lower at night
    const loadVariation = 0.8 + 0.3 * Math.sin(((hour - 4) / 24) * 2 * Math.PI);
    const loadKw = Math.round(baseLoadKw * loadVariation);

    // BESS charge during peak solar, discharge during evening peak (18:00 - 22:00)
    let bessKw = 0;
    let socPct = 50;
    if (bessCapacityKwh > 0) {
      if (solarKw > loadKw) {
        bessKw = -Math.min(bessCapacityKwh * 0.35, (solarKw - loadKw) * 0.7); // charging
        socPct = Math.min(95, 60 + hour * 2.5);
      } else if (hour >= 17 && hour <= 21) {
        bessKw = Math.min(bessCapacityKwh * 0.3, loadKw * 0.6); // discharging
        socPct = Math.max(25, 85 - (hour - 17) * 12);
      } else {
        socPct = 45;
      }
    }

    // Grid import / export
    const net = loadKw - solarKw - bessKw;
    const gridImport = net > 0 ? net : 0;
    const gridExport = net < 0 ? Math.abs(net) : 0;

    // DG energy (runs rarely if net is extreme)
    const dgKw = hasDg && hour === 20 && Math.random() > 0.8 ? 180 : 0;
    const dgFuel = dgKw > 0 ? 42 : 0;

    rows.push([
      siteId,
      time.toISOString(),
      solarKw,
      solarKw,
      bessKw,
      bessKw < 0 ? Math.abs(bessKw) : 0,
      bessKw > 0 ? bessKw : 0,
      socPct,
      loadKw,
      loadKw,
      loadKw,
      gridImport,
      gridExport,
      dgKw,
      dgFuel,
      Math.round((solarKw * 0.14 + (bessKw > 0 ? bessKw * 0.08 : 0)) * 100) / 100,
    ]);
  }

  // Batch insert into public.telemetry_hourly
  const BATCH_SIZE = 100;
  for (let b = 0; b < rows.length; b += BATCH_SIZE) {
    const chunk = rows.slice(b, b + BATCH_SIZE);
    const valuePlaceholders = chunk
      .map(
        (_, rIdx) =>
          `($${rIdx * 16 + 1}, $${rIdx * 16 + 2}, $${rIdx * 16 + 3}, $${rIdx * 16 + 4}, $${rIdx * 16 + 5}, $${rIdx * 16 + 6}, $${rIdx * 16 + 7}, $${rIdx * 16 + 8}, $${rIdx * 16 + 9}, $${rIdx * 16 + 10}, $${rIdx * 16 + 11}, $${rIdx * 16 + 12}, $${rIdx * 16 + 13}, $${rIdx * 16 + 14}, $${rIdx * 16 + 15}, $${rIdx * 16 + 16})`
      )
      .join(", ");

    const flatParams = chunk.flat();
    await query(
      `INSERT INTO public.telemetry_hourly (
        site_id, bucket_timestamp, avg_solar_kw, solar_energy_kwh, avg_bess_kw,
        bess_charge_kwh, bess_discharge_kwh, end_bess_soc_pct, avg_load_kw,
        peak_load_kw, load_energy_kwh, grid_import_kwh, grid_export_kwh,
        dg_energy_kwh, dg_fuel_liters, estimated_cost_saved
      ) VALUES ${valuePlaceholders}
      ON CONFLICT (site_id, bucket_timestamp) DO NOTHING`,
      flatParams
    );
  }
}

/**
 * Returns all sites with latest live telemetry for a given Clerk organization
 */
export async function getSitesForOrg(clerkOrgId: string): Promise<SiteRecord[]> {
  const res = await query<SiteRecord>(
    `SELECT 
      s.id, s.org_id, s.name, s.slug, s.location_city, s.location_state,
      s.plant_type, s.status, s.solar_capacity_kwp, s.bess_capacity_kwh,
      s.bess_power_kw, s.dg_capacity_kva, s.contracted_demand_kva,
      s.has_solar, s.has_bess, s.has_dg, s.has_grid,
      s.peak_tariff_rate, s.offpeak_tariff_rate, s.subscription_status, s.created_at,
      t.solar_power_kw, t.bess_power_kw as live_bess_power_kw, t.grid_power_kw, t.dg_power_kw,
      t.load_power_kw, t.bess_soc_pct, t.dg_fuel_pct, t.dg_running,
      t.solar_yield_today_kwh, t.load_consumption_today_kwh,
      t.grid_import_today_kwh, t.grid_export_today_kwh,
      t.dg_yield_today_kwh, t.bess_charge_today_kwh, t.bess_discharge_today_kwh,
      t.co2_saved_today_kg, t.timestamp as snapshot_time
    FROM public.sites s
    JOIN public.organizations o ON s.org_id = o.id
    LEFT JOIN public.telemetry_snapshots t ON s.id = t.site_id
    WHERE o.clerk_org_id = $1
    ORDER BY s.created_at ASC`,
    [clerkOrgId]
  );

  return res.rows;
}

/**
 * Returns a specific site with its devices and latest telemetry for a Clerk organization
 */
export async function getSiteDetails(
  clerkOrgId: string,
  siteId: string
): Promise<{ site: SiteRecord; devices: SiteDeviceRecord[] } | null> {
  let siteRes = await query<SiteRecord>(
    `SELECT 
      s.id, s.org_id, s.name, s.slug, s.location_city, s.location_state,
      s.plant_type, s.status, s.solar_capacity_kwp, s.bess_capacity_kwh,
      s.bess_power_kw, s.dg_capacity_kva, s.contracted_demand_kva,
      s.has_solar, s.has_bess, s.has_dg, s.has_grid,
      s.peak_tariff_rate, s.offpeak_tariff_rate, s.subscription_status, s.created_at,
      t.solar_power_kw, t.bess_power_kw as live_bess_power_kw, t.grid_power_kw, t.dg_power_kw,
      t.load_power_kw, t.bess_soc_pct, t.dg_fuel_pct, t.dg_running,
      t.solar_yield_today_kwh, t.load_consumption_today_kwh,
      t.grid_import_today_kwh, t.grid_export_today_kwh,
      t.dg_yield_today_kwh, t.bess_charge_today_kwh, t.bess_discharge_today_kwh,
      t.co2_saved_today_kg, t.timestamp as snapshot_time
    FROM public.sites s
    JOIN public.organizations o ON s.org_id = o.id
    LEFT JOIN public.telemetry_snapshots t ON s.id = t.site_id
    WHERE o.clerk_org_id = $1 AND s.id = $2
    LIMIT 1`,
    [clerkOrgId, siteId]
  );

  if (siteRes.rows.length === 0) {
    // Check by id alone
    siteRes = await query<SiteRecord>(
      `SELECT 
        s.id, s.org_id, s.name, s.slug, s.location_city, s.location_state,
        s.plant_type, s.status, s.solar_capacity_kwp, s.bess_capacity_kwh,
        s.bess_power_kw, s.dg_capacity_kva, s.contracted_demand_kva,
        s.has_solar, s.has_bess, s.has_dg, s.has_grid,
        s.peak_tariff_rate, s.offpeak_tariff_rate, s.subscription_status, s.created_at,
        t.solar_power_kw, t.bess_power_kw as live_bess_power_kw, t.grid_power_kw, t.dg_power_kw,
        t.load_power_kw, t.bess_soc_pct, t.dg_fuel_pct, t.dg_running,
        t.solar_yield_today_kwh, t.load_consumption_today_kwh,
        t.grid_import_today_kwh, t.grid_export_today_kwh,
        t.dg_yield_today_kwh, t.bess_charge_today_kwh, t.bess_discharge_today_kwh,
        t.co2_saved_today_kg, t.timestamp as snapshot_time
      FROM public.sites s
      LEFT JOIN public.telemetry_snapshots t ON s.id = t.site_id
      WHERE s.id = $1
      LIMIT 1`,
      [siteId]
    );
  }

  if (siteRes.rows.length === 0) {
    return null;
  }

  const site = siteRes.rows[0];

  const devicesRes = await query<SiteDeviceRecord>(
    `SELECT id, site_id, name, category, manufacturer, model, serial_number, is_online
     FROM public.site_devices
     WHERE site_id = $1
     ORDER BY category ASC, name ASC`,
    [site.id]
  );

  return { site, devices: devicesRes.rows };
}

/**
 * Returns historical hourly dispatch telemetry for charts
 * Range:
 * - 'today': Last 24 hours of hourly buckets
 * - '7d': Last 7 days (grouped or hourly)
 * - '30d': Last 30 days
 */
export async function getSiteHourlyAnalytics(
  siteId: string,
  range: "today" | "7d" | "30d" = "today"
): Promise<HourlyTelemetryRecord[]> {
  const hoursLimit = range === "today" ? 24 : range === "7d" ? 168 : 720;

  const res = await query<HourlyTelemetryRecord>(
    `SELECT 
      id, site_id, bucket_timestamp, avg_solar_kw, solar_energy_kwh,
      avg_bess_kw, bess_charge_kwh, bess_discharge_kwh, end_bess_soc_pct,
      avg_load_kw, peak_load_kw, load_energy_kwh,
      grid_import_kwh, grid_export_kwh, dg_energy_kwh, estimated_cost_saved
    FROM public.telemetry_hourly
    WHERE site_id = $1
    ORDER BY bucket_timestamp DESC
    LIMIT $2`,
    [siteId, hoursLimit]
  );

  // Return in chronological ascending order for chart rendering
  return res.rows.reverse();
}

/**
 * Returns all users belonging to a Clerk organization
 */
export async function getUsersForOrg(clerkOrgId: string): Promise<UserRecord[]> {
  const res = await query<UserRecord>(
    `SELECT u.* FROM public.users u
     JOIN public.organizations o ON u.current_org_id = o.id
     WHERE o.clerk_org_id = $1
     ORDER BY u.created_at ASC`,
    [clerkOrgId]
  );
  return res.rows;
}

