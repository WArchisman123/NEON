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
    console.log("[Seed Org Data] Connecting to live Supabase PostgreSQL (mzumlzmfjgzvycebqask)...");
    await client.connect();
    console.log("[Seed Org Data] Connected successfully.");

    // 1. Resolve iRasus Technologies Organization
    const targetClerkOrgId = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";
    const orgRes = await client.query(
      `INSERT INTO public.organizations (clerk_org_id, name, slug, tier, status)
       VALUES ($1, 'iRasus Technologies', 'irasus-technologies-1790084484244493943', 'pro_commercial', 'active')
       ON CONFLICT (clerk_org_id)
       DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, updated_at = now()
       RETURNING id, clerk_org_id, name`,
      [targetClerkOrgId]
    );
    const orgId = orgRes.rows[0].id;
    console.log(`[Seed Org Data] Target Organization: "${orgRes.rows[0].name}" (${orgId})`);

    // Also ensure fallback demo orgs exist
    await client.query(
      `INSERT INTO public.organizations (clerk_org_id, name, slug, tier, status)
       VALUES ('org_demo_neon_energy', 'Apex Clean Energy', 'apex-clean-energy', 'pro_commercial', 'active'),
              ('default_org', 'Neon Energy Fleet', 'neon-energy-fleet', 'pro_commercial', 'active')
       ON CONFLICT (clerk_org_id) DO NOTHING`
    );

    // 2. Ensure the 3 Sites are strictly assigned to iRasus Technologies
    // Check if sites exist
    const existingSitesRes = await client.query(
      `SELECT id, name FROM public.sites WHERE org_id = $1`,
      [orgId]
    );

    let site1Id, site2Id, site3Id;

    if (existingSitesRes.rows.length >= 3) {
      console.log(`[Seed Org Data] Found ${existingSitesRes.rows.length} existing sites for iRasus Technologies.`);
      site1Id = existingSitesRes.rows.find(s => s.name.includes("Bakersfield"))?.id || existingSitesRes.rows[0].id;
      site2Id = existingSitesRes.rows.find(s => s.name.includes("Mojave"))?.id || existingSitesRes.rows[1].id;
      site3Id = existingSitesRes.rows.find(s => s.name.includes("Sonora"))?.id || existingSitesRes.rows[2].id;
    } else {
      // Re-assign all existing sites or insert new ones
      console.log(`[Seed Org Data] Assigning all installation master records to ${orgId}...`);
      await client.query(`UPDATE public.sites SET org_id = $1`, [orgId]);
      
      const sitesAfterUpdate = await client.query(
        `SELECT id, name FROM public.sites WHERE org_id = $1 ORDER BY name ASC`,
        [orgId]
      );
      site1Id = sitesAfterUpdate.rows[0].id;
      site2Id = sitesAfterUpdate.rows[1].id;
      site3Id = sitesAfterUpdate.rows[2].id;
    }

    console.log(`[Seed Org Data] Sites bound to iRasus Technologies:`);
    console.log(`  ⚡ Site 1: ${site1Id} (Bakersfield)`);
    console.log(`  ⚡ Site 2: ${site2Id} (Mojave)`);
    console.log(`  ⚡ Site 3: ${site3Id} (Sonora)`);

    // 3. Ensure Hardware Devices exist for each site
    const devicesCountRes = await client.query(
      `SELECT count(*) FROM public.site_devices WHERE site_id IN ($1, $2, $3)`,
      [site1Id, site2Id, site3Id]
    );
    console.log(`[Seed Org Data] Hardware Devices currently in DB: ${devicesCountRes.rows[0].count}`);

    if (parseInt(devicesCountRes.rows[0].count, 10) === 0) {
      console.log(`[Seed Org Data] Seeding site_devices for the 3 installations...`);
      await client.query(`
        INSERT INTO public.site_devices (site_id, name, category, manufacturer, model, is_online) VALUES
        ('${site1Id}', 'Main Central Inverter 01', 'solar_inverter', 'SMA Solar', 'Sunny Highpower 150kW', true),
        ('${site1Id}', 'Central Inverter 02', 'solar_inverter', 'SMA Solar', 'Sunny Highpower 150kW', true),
        ('${site1Id}', 'BESS Battery Rack Matrix', 'bess_bms', 'Tesla Energy', 'Megapack BMS v2', true),
        ('${site1Id}', 'BESS Power Conversion System', 'bess_pcs', 'Dynapower', 'CPS-500 Inverter', true),
        ('${site1Id}', 'Substation Feed Energy Meter', 'grid_meter', 'Schneider Electric', 'PowerLogic ION9000', true),
        ('${site2Id}', 'Utility String Inverter Bank', 'solar_inverter', 'Sungrow', 'SG250HX 250kW', true),
        ('${site2Id}', 'LFP Containerized Storage BMS', 'bess_bms', 'Fluence', 'Gridstack OS Gen6', true),
        ('${site2Id}', 'Bi-directional Storage Inverter', 'bess_pcs', 'Ingeteam', 'Ingecon Sun B Series 800kW', true),
        ('${site2Id}', 'Backup Genset Controller 01', 'diesel_generator', 'Cummins Power', 'QSK23-G7 800kVA', true),
        ('${site2Id}', 'Primary Utility Intertie Meter', 'grid_meter', 'Siemens', 'PAC4200 Smart Meter', true),
        ('${site3Id}', 'Tracker Inverter Cluster', 'solar_inverter', 'Huawei', 'SUN2000-100KTL-M1', true),
        ('${site3Id}', 'Agricultural Peaker Generator', 'diesel_generator', 'Caterpillar', 'CAT C18 600kVA Diesel', true),
        ('${site3Id}', 'Agricultural Feeder Meter', 'grid_meter', 'Schneider Electric', 'PowerLogic ION9000', true)
      `);
      console.log(`[Seed Org Data] Seeded 13 hardware devices.`);
    }

    // 4. Ensure Telemetry Snapshots exist
    console.log(`[Seed Org Data] Upserting live telemetry snapshots for each site...`);
    await client.query(`
      INSERT INTO public.telemetry_snapshots (
        site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
        bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
        solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
      ) VALUES 
      ('${site1Id}', 940, -240, -80, 0, 620, 84.2, 98.6, 0, false, 60.0, 0.99, 4820, 3950, 120, 990, 2380),
      ('${site2Id}', 1450, 150, -420, 0, 1180, 71.0, 99.2, 88.5, false, 60.0, 0.98, 7390, 6120, 0, 1270, 3820),
      ('${site3Id}', 1030, 0, -290, 0, 740, 0, 0, 92.0, false, 60.0, 0.99, 5210, 4110, 180, 1280, 2560)
      ON CONFLICT (site_id) DO UPDATE SET
        solar_power_kw = EXCLUDED.solar_power_kw,
        bess_power_kw = EXCLUDED.bess_power_kw,
        grid_power_kw = EXCLUDED.grid_power_kw,
        dg_power_kw = EXCLUDED.dg_power_kw,
        load_power_kw = EXCLUDED.load_power_kw,
        bess_soc_pct = EXCLUDED.bess_soc_pct,
        solar_yield_today_kwh = EXCLUDED.solar_yield_today_kwh,
        timestamp = now();
    `);
    console.log(`[Seed Org Data] Live snapshots active.`);

    // 5. Seed Site Alarms for iRasus Technologies Sites
    console.log(`[Seed Org Data] Seeding realistic site alarms for iRasus Technologies...`);
    await client.query(`DELETE FROM public.site_alarms WHERE site_id IN ($1, $2, $3)`, [site1Id, site2Id, site3Id]);

    // Fetch inverters / BMS device IDs to link alarms
    const devList = await client.query(`SELECT id, site_id, name, category FROM public.site_devices`);
    const bessBmsDev = devList.rows.find(d => d.site_id === site1Id && d.category === 'bess_bms')?.id || null;
    const sungrowInverterDev = devList.rows.find(d => d.site_id === site2Id && d.category === 'solar_inverter')?.id || null;
    const catGensetDev = devList.rows.find(d => d.site_id === site3Id && d.category === 'diesel_generator')?.id || null;

    await client.query(`
      INSERT INTO public.site_alarms (site_id, device_id, severity, code, title, description, is_acknowledged, is_cleared, triggered_at)
      VALUES 
      ('${site1Id}', ${bessBmsDev ? `'${bessBmsDev}'` : 'NULL'}, 'warning', 'BESS-W04', 'BESS Rack 02 Thermal Delta-V Imbalance', 'String cell delta-V exceeded 35mV during fast charge. Automatic cell balancing active.', false, false, now() - interval '42 minutes'),
      ('${site2Id}', ${sungrowInverterDev ? `'${sungrowInverterDev}'` : 'NULL'}, 'critical', 'INV-C12', 'MPPT String 04 Open-Circuit Trip', 'DC voltage dropped below threshold. Potential blown string fuse or module disconnection detected.', false, false, now() - interval '18 minutes'),
      ('${site3Id}', ${catGensetDev ? `'${catGensetDev}'` : 'NULL'}, 'info', 'DG-I02', 'Weekly Genset Auto-Exercise Routine Completed', 'Diesel Peaker ran for 15 minutes at standby test load. All pressure and battery levels normal.', true, true, now() - interval '2 hours')
    `);
    console.log(`[Seed Org Data] Seeded 3 system alarms (Warning, Critical, Info).`);

    // 6. Seed Maintenance Tickets for iRasus Technologies
    console.log(`[Seed Org Data] Seeding active maintenance tickets for iRasus Technologies...`);
    await client.query(`DELETE FROM public.maintenance_tickets WHERE org_id = $1`, [orgId]);

    // Fetch certified service packages
    const servicesRes = await client.query(`SELECT id, slug, base_price FROM public.maintenance_services`);
    const droneService = servicesRes.rows.find(s => s.slug === 'drone-ir-thermography') || servicesRes.rows[0];
    const bessService = servicesRes.rows.find(s => s.slug === 'bess-coolant-flush-bms') || servicesRes.rows[1];

    if (droneService && bessService) {
      await client.query(`
        INSERT INTO public.maintenance_tickets (
          ticket_number, org_id, site_id, asset_type, service_id, custom_notes,
          status, scheduled_date, time_window, assigned_crew_name, total_price, payment_status, created_at
        ) VALUES 
        (
          'TCK-2026-0891',
          '${orgId}',
          '${site1Id}',
          'bess',
          '${bessService.id}',
          'Annual preventative maintenance: Flush dielectric loop and verify NFPA 855 contactor response times.',
          'technician_assigned',
          CURRENT_DATE + 3,
          '08:00 AM - 12:00 PM PST',
          'Alpha BESS Diagnostic Crew (Lead: Marcus Vance)',
          ${bessService.base_price},
          'paid',
          now() - interval '1 day'
        ),
        (
          'TCK-2026-0842',
          '${orgId}',
          '${site2Id}',
          'solar_pv',
          '${droneService.id}',
          'Follow-up inspection on MPPT 04 string mismatch to classify diode faults via radiometric orthomosaic.',
          'quote_accepted',
          CURRENT_DATE + 5,
          '01:00 PM - 05:00 PM PST',
          'SkyInspect Aerial Solutions',
          ${droneService.base_price},
          'pending',
          now() - interval '5 hours'
        )
      `);
      console.log(`[Seed Org Data] Seeded 2 maintenance tickets (TCK-2026-0891, TCK-2026-0842).`);
    }

    // 7. Ensure Hourly Telemetry (30 Days = 2,160+ rows) exists
    const hourlyCount = await client.query(
      `SELECT count(*) FROM public.telemetry_hourly WHERE site_id IN ($1, $2, $3)`,
      [site1Id, site2Id, site3Id]
    );
    console.log(`[Seed Org Data] Hourly records count: ${hourlyCount.rows[0].count}`);

    // 8. Verification Output
    console.log("\n======================================================");
    console.log("FULL DEMO DATA SUCCESSFULLY SEEDED & VERIFIED!");
    console.log("======================================================");

    const checkSites = await client.query(`SELECT id, name, plant_type, has_solar, has_bess, has_dg FROM public.sites WHERE org_id = $1`, [orgId]);
    console.log(`\n🏢 Organization: iRasus Technologies (${orgId})`);
    console.table(checkSites.rows);

    const checkAlarms = await client.query(`SELECT id, severity, code, title, is_cleared FROM public.site_alarms WHERE site_id IN ($1, $2, $3)`, [site1Id, site2Id, site3Id]);
    console.log(`\n🚨 Active Alarms for iRasus Technologies:`);
    console.table(checkAlarms.rows);

    const checkTickets = await client.query(`SELECT ticket_number, asset_type, status, scheduled_date, total_price, assigned_crew_name FROM public.maintenance_tickets WHERE org_id = $1`, [orgId]);
    console.log(`\n🛠️  Maintenance Tickets for iRasus Technologies:`);
    console.table(checkTickets.rows);

  } catch (err) {
    console.error("[Seed Org Data Error]:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
