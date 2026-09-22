const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("[Expand Sites] Connecting to live Supabase PostgreSQL...");
    await client.connect();
    console.log("[Expand Sites] Connected successfully.");

    // 1. Run Migration 0004: Add subscription_status to sites
    const migrationSql = fs.readFileSync(
      path.resolve(__dirname, "../supabase/migrations/0004_add_subscription_status_to_sites.sql"),
      "utf-8"
    );
    console.log("[Expand Sites] Executing 0004_add_subscription_status_to_sites.sql...");
    await client.query(migrationSql);
    console.log("[Expand Sites] Added subscription_status column.");

    // 2. Resolve Target Org ID for org_3JgZ51s2g9LkRRE0L61kAXDGDWE
    const orgRes = await client.query(
      "SELECT id FROM public.organizations WHERE clerk_org_id = 'org_3JgZ51s2g9LkRRE0L61kAXDGDWE'"
    );
    if (orgRes.rows.length === 0) {
      throw new Error("Organization org_3JgZ51s2g9LkRRE0L61kAXDGDWE not found!");
    }
    const orgId = orgRes.rows[0].id;
    console.log(`[Expand Sites] Target Org UUID: ${orgId}`);

    // Update existing 3 sites to have subscription_status = 'active'
    await client.query(
      "UPDATE public.sites SET subscription_status = 'active' WHERE org_id = $1 AND subscription_status IS NULL",
      [orgId]
    );

    // 3. Insert Site 4: Just DG, Load, Solar (No BESS, No Grid - 100% Islanded Peaker)
    console.log("[Expand Sites] Upserting Site 4: Sierra Nevada Remote Camp Microgrid (Solar + DG + Load)...");
    const site4Res = await client.query(`
      INSERT INTO public.sites (
        org_id, name, slug, location_city, location_state, plant_type, status, subscription_status,
        solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
        has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
      ) VALUES (
        '${orgId}', 'Sierra Nevada Remote Camp Microgrid', 'sierra-nevada-remote',
        'Truckee', 'CA', 'utility_microgrid', 'online', 'active',
        800, 0, 0, 500, 0,
        true, false, true, false, 0.25, 0.12
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    let site4Id;
    if (site4Res.rows.length > 0) {
      site4Id = site4Res.rows[0].id;
    } else {
      const existing = await client.query("SELECT id FROM public.sites WHERE slug = 'sierra-nevada-remote' LIMIT 1");
      site4Id = existing.rows[0].id;
    }

    // Site 4 Devices
    await client.query(`
      INSERT INTO public.site_devices (site_id, name, category, manufacturer, model, is_online) VALUES
      ('${site4Id}', 'Remote String Inverter Matrix', 'solar_inverter', 'Huawei', 'SUN2000-100KTL-M1', true),
      ('${site4Id}', 'Primary Islanded Peaker Genset', 'diesel_generator', 'Caterpillar', 'CAT C15 500kVA Diesel', true),
      ('${site4Id}', 'Camp Substation Feeder Meter', 'grid_meter', 'Schneider Electric', 'PowerLogic ION9000', true)
      ON CONFLICT DO NOTHING
    `);

    // Site 4 Snapshot
    await client.query(`
      INSERT INTO public.telemetry_snapshots (
        site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
        bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
        solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
      ) VALUES (
        '${site4Id}', 580, 0, 0, 120, 700, 0, 0, 76.5, true, 60.0, 0.98,
        3420, 4100, 0, 0, 1710
      )
      ON CONFLICT (site_id) DO UPDATE SET
        solar_power_kw = 580, bess_power_kw = 0, grid_power_kw = 0, dg_power_kw = 120, load_power_kw = 700,
        dg_running = true, dg_fuel_pct = 76.5, timestamp = now()
    `);

    // 4. Insert Site 5: Just BESS, Solar, Load (No DG, No Grid - 100% Clean Zero-Emission Island)
    console.log("[Expand Sites] Upserting Site 5: Coachella Zero-Emission Islanded Hub (Solar + BESS + Load)...");
    const site5Res = await client.query(`
      INSERT INTO public.sites (
        org_id, name, slug, location_city, location_state, plant_type, status, subscription_status,
        solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
        has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
      ) VALUES (
        '${orgId}', 'Coachella Zero-Emission Islanded Hub', 'coachella-islanded-hub',
        'Coachella', 'CA', 'utility_microgrid', 'online', 'active',
        1200, 2000, 600, 0, 0,
        true, true, false, false, 0.20, 0.09
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    let site5Id;
    if (site5Res.rows.length > 0) {
      site5Id = site5Res.rows[0].id;
    } else {
      const existing = await client.query("SELECT id FROM public.sites WHERE slug = 'coachella-islanded-hub' LIMIT 1");
      site5Id = existing.rows[0].id;
    }

    // Site 5 Devices
    await client.query(`
      INSERT INTO public.site_devices (site_id, name, category, manufacturer, model, is_online) VALUES
      ('${site5Id}', 'Agri-PV Inverter Station', 'solar_inverter', 'Sungrow', 'SG250HX 250kW', true),
      ('${site5Id}', 'Clean Island BESS BMS', 'bess_bms', 'Tesla Energy', 'Megapack BMS v2', true),
      ('${site5Id}', 'Bi-directional Island PCS Inverter', 'bess_pcs', 'Dynapower', 'CPS-500 Inverter', true),
      ('${site5Id}', 'Off-grid Island Load Bus Meter', 'grid_meter', 'Siemens', 'PAC4200 Smart Meter', true)
      ON CONFLICT DO NOTHING
    `);

    // Site 5 Snapshot
    await client.query(`
      INSERT INTO public.telemetry_snapshots (
        site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
        bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
        solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
      ) VALUES (
        '${site5Id}', 840, -320, 0, 0, 520, 89.4, 99.1, 0, false, 60.0, 0.99,
        5180, 3120, 0, 0, 2590
      )
      ON CONFLICT (site_id) DO UPDATE SET
        solar_power_kw = 840, bess_power_kw = -320, grid_power_kw = 0, dg_power_kw = 0, load_power_kw = 520,
        bess_soc_pct = 89.4, timestamp = now()
    `);

    // 5. Insert Site 6: Expired Subscription Installation
    console.log("[Expand Sites] Upserting Site 6: Redwood Coast Hybrid Peaker (EXPIRED SUBSCRIPTION)...");
    const site6Res = await client.query(`
      INSERT INTO public.sites (
        org_id, name, slug, location_city, location_state, plant_type, status, subscription_status,
        solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
        has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
      ) VALUES (
        '${orgId}', 'Redwood Coast Hybrid Peaker', 'redwood-coast-hybrid',
        'Eureka', 'CA', 'commercial_industrial', 'offline', 'expired',
        650, 800, 300, 0, 500,
        true, true, false, true, 0.22, 0.10
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    let site6Id;
    if (site6Res.rows.length > 0) {
      site6Id = site6Res.rows[0].id;
    } else {
      const existing = await client.query("SELECT id FROM public.sites WHERE slug = 'redwood-coast-hybrid' LIMIT 1");
      site6Id = existing.rows[0].id;
    }

    // Site 6 Devices
    await client.query(`
      INSERT INTO public.site_devices (site_id, name, category, manufacturer, model, is_online) VALUES
      ('${site6Id}', 'Commercial String Inverter', 'solar_inverter', 'SMA Solar', 'Sunny Tripower 50kW', false),
      ('${site6Id}', 'C&I Storage BMS Container', 'bess_bms', 'Fluence', 'Gridstack OS Gen5', false),
      ('${site6Id}', 'Facility Substation Intertie Meter', 'grid_meter', 'Schneider Electric', 'PowerLogic ION9000', false)
      ON CONFLICT DO NOTHING
    `);

    // Site 6 Snapshot (Stale / paused telemetry)
    await client.query(`
      INSERT INTO public.telemetry_snapshots (
        site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
        bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
        solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
      ) VALUES (
        '${site6Id}', 0, 0, 0, 0, 0, 42.0, 94.0, 0, false, 0.0, 0.0,
        0, 0, 0, 0, 0
      )
      ON CONFLICT (site_id) DO UPDATE SET
        solar_power_kw = 0, bess_power_kw = 0, grid_power_kw = 0, load_power_kw = 0,
        timestamp = now() - interval '14 days'
    `);

    // 6. Generate 30 Days of Hourly Data for Site 4 and Site 5 if empty
    console.log("[Expand Sites] Generating 30-day hourly historical records for Site 4 and Site 5...");
    await generateHourlyForSite(client, site4Id, 800, 0, 450, true, false);
    await generateHourlyForSite(client, site5Id, 1200, 2000, 520, false, false);
    await generateHourlyForSite(client, site6Id, 650, 800, 300, false, true);

    // 7. Verify all sites for iRasus Technologies
    const allSites = await client.query(`
      SELECT id, name, plant_type, has_solar, has_bess, has_dg, has_grid, subscription_status, status
      FROM public.sites 
      WHERE org_id = $1
      ORDER BY created_at ASC
    `, [orgId]);

    console.log("\n======================================================");
    console.log("EXPANDED DEMO SITES FOR iRasus Technologies (TOTAL: " + allSites.rows.length + "):");
    console.log("======================================================");
    console.table(allSites.rows);

  } catch (err) {
    console.error("[Expand Sites Error]:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function generateHourlyForSite(client, siteId, solarKwp, bessKwh, loadKw, hasDg, hasGrid) {
  const countRes = await client.query("SELECT count(*) FROM public.telemetry_hourly WHERE site_id = $1", [siteId]);
  if (parseInt(countRes.rows[0].count, 10) > 100) {
    console.log(`  Site ${siteId} already has ${countRes.rows[0].count} hourly records.`);
    return;
  }

  const now = new Date();
  const rows = [];
  for (let i = 720; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const hour = time.getHours();
    let solarKw = 0;
    if (hour >= 6 && hour <= 19) {
      solarKw = Math.max(0, Math.round(solarKwp * Math.sin(((hour - 6) / 13) * Math.PI) * 0.85));
    }
    const currentLoadKw = Math.round(loadKw * (0.8 + 0.3 * Math.sin(((hour - 4) / 24) * 2 * Math.PI)));
    let bessKw = 0;
    let socPct = 50;
    if (bessKwh > 0) {
      if (solarKw > currentLoadKw) {
        bessKw = -Math.min(bessKwh * 0.3, (solarKw - currentLoadKw) * 0.7);
        socPct = Math.min(95, 60 + hour * 2);
      } else if (hour >= 18 && hour <= 22) {
        bessKw = Math.min(bessKwh * 0.35, currentLoadKw * 0.8);
        socPct = Math.max(20, 80 - (hour - 18) * 15);
      }
    }
    const net = currentLoadKw - solarKw - bessKw;
    const gridImport = hasGrid && net > 0 ? net : 0;
    const gridExport = hasGrid && net < 0 ? Math.abs(net) : 0;
    const dgKw = hasDg && net > 0 ? net : 0;
    const dgFuel = dgKw > 0 ? Math.round(dgKw * 0.28) : 0;

    rows.push([
      siteId,
      time.toISOString(),
      solarKw,
      solarKw,
      bessKw,
      bessKw < 0 ? Math.abs(bessKw) : 0,
      bessKw > 0 ? bessKw : 0,
      socPct,
      currentLoadKw,
      currentLoadKw,
      currentLoadKw,
      gridImport,
      gridExport,
      dgKw,
      dgFuel,
      Math.round((solarKw * 0.14) * 100) / 100
    ]);
  }

  for (let b = 0; b < rows.length; b += 100) {
    const chunk = rows.slice(b, b + 100);
    const placeholders = chunk
      .map((_, r) => `($${r*16+1}, $${r*16+2}, $${r*16+3}, $${r*16+4}, $${r*16+5}, $${r*16+6}, $${r*16+7}, $${r*16+8}, $${r*16+9}, $${r*16+10}, $${r*16+11}, $${r*16+12}, $${r*16+13}, $${r*16+14}, $${r*16+15}, $${r*16+16})`)
      .join(", ");
    await client.query(`
      INSERT INTO public.telemetry_hourly (
        site_id, bucket_timestamp, avg_solar_kw, solar_energy_kwh, avg_bess_kw,
        bess_charge_kwh, bess_discharge_kwh, end_bess_soc_pct, avg_load_kw,
        peak_load_kw, load_energy_kwh, grid_import_kwh, grid_export_kwh,
        dg_energy_kwh, dg_fuel_liters, estimated_cost_saved
      ) VALUES ${placeholders}
      ON CONFLICT (site_id, bucket_timestamp) DO NOTHING
    `, chunk.flat());
  }
}

main();
