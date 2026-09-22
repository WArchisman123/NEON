const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL (mzumlzmfjgzvycebqask)...');
    await client.connect();
    console.log('Connected successfully to live database!');

    // 1. Run DDL Schema Migration
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '0001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing 0001_initial_schema.sql DDL migration...');
    await client.query(sql);
    console.log('Schema migration completed successfully!');

    // 2. Verify all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('organizations', 'sites', 'site_devices', 'telemetry_snapshots', 'telemetry_hourly', 'site_alarms', 'maintenance_services', 'maintenance_tickets')
      ORDER BY table_name;
    `);
    console.log('Created Tables:', tablesRes.rows.map(r => r.table_name));

    // 3. Seed Default / Demo Organizations
    // We seed both a general demo org AND check if there are any clerk orgs
    console.log('Seeding demo organization...');
    const orgRes = await client.query(`
      INSERT INTO public.organizations (clerk_org_id, name, slug, tier, status)
      VALUES 
        ('org_demo_neon_energy', 'Apex Clean Energy', 'apex-clean-energy', 'pro_commercial', 'active'),
        ('default_org', 'Neon Energy Fleet', 'neon-energy-fleet', 'pro_commercial', 'active')
      ON CONFLICT (clerk_org_id) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, clerk_org_id, name;
    `);
    
    const demoOrgId = orgRes.rows[0].id;
    console.log('Demo Org ID:', demoOrgId);

    // 4. Seed 3 Diverse Sites for the Demo Org
    // Check if sites already exist
    const sitesCount = await client.query('SELECT count(*) FROM public.sites WHERE org_id = $1', [demoOrgId]);
    if (parseInt(sitesCount.rows[0].count, 10) === 0) {
      console.log('Seeding 3 diverse sites...');

      // Site 1: Solar + BESS + Grid (No DG)
      const site1 = await client.query(`
        INSERT INTO public.sites (
          org_id, name, slug, location_city, location_state, plant_type, status,
          solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
          has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
        ) VALUES ($1, 'Bakersfield Central Solar-Plus-Storage', 'bakersfield-central', 'Bakersfield', 'CA', 'commercial_industrial', 'online', 940, 1500, 500, 0, 800, true, true, false, true, 0.18, 0.07)
        RETURNING id;
      `, [demoOrgId]);
      const s1Id = site1.rows[0].id;

      // Site 1 Devices
      await client.query(`
        INSERT INTO public.site_devices (site_id, name, category, manufacturer, model) VALUES
          ($1, 'SMA Sunny Highpower 150kW Inverter #1', 'solar_inverter', 'SMA Solar', 'SHP-150-20'),
          ($1, 'SMA Sunny Highpower 150kW Inverter #2', 'solar_inverter', 'SMA Solar', 'SHP-150-20'),
          ($1, 'Tesla Megapack BMS Rack Cluster', 'bess_bms', 'Tesla Energy', 'Megapack BMS v2'),
          ($1, 'Dynapower Bi-directional PCS 500kW', 'bess_pcs', 'Dynapower', 'CPS-500'),
          ($1, 'Main Substation Interconnection Meter', 'grid_meter', 'Schneider Electric', 'PowerLogic ION9000');
      `, [s1Id]);

      // Site 1 Snapshot
      await client.query(`
        INSERT INTO public.telemetry_snapshots (
          site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
          bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
          solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
        ) VALUES ($1, 940, -240, -80, 0, 620, 84.2, 98.6, 0, false, 60.0, 0.99, 4820, 3950, 120, 990, 2380);
      `, [s1Id]);

      // Site 2: Solar + BESS + DG + Grid (Full Microgrid)
      const site2 = await client.query(`
        INSERT INTO public.sites (
          org_id, name, slug, location_city, location_state, plant_type, status,
          solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
          has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
        ) VALUES ($1, 'Mojave Desert Industrial Microgrid Alpha', 'mojave-desert-alpha', 'Barstow', 'CA', 'utility_microgrid', 'online', 1450, 2200, 800, 800, 1200, true, true, true, true, 0.22, 0.08)
        RETURNING id;
      `, [demoOrgId]);
      const s2Id = site2.rows[0].id;

      // Site 2 Devices
      await client.query(`
        INSERT INTO public.site_devices (site_id, name, category, manufacturer, model) VALUES
          ($1, 'Sungrow SG250HX Inverter Bank', 'solar_inverter', 'Sungrow', 'SG250HX-US'),
          ($1, 'Fluence Gridstack OS Gen6 BMS', 'bess_bms', 'Fluence', 'OS Gen6'),
          ($1, 'Ingeteam 800kW Bi-directional Inverter', 'bess_pcs', 'Ingeteam', 'Ingecon Sun B 800'),
          ($1, 'Cummins QSK23-G7 800kVA Diesel Genset', 'diesel_generator', 'Cummins Power', 'QSK23-G7'),
          ($1, 'High-Voltage Intertie Smart Meter', 'grid_meter', 'Siemens', 'PAC4200');
      `, [s2Id]);

      // Site 2 Snapshot
      await client.query(`
        INSERT INTO public.telemetry_snapshots (
          site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
          bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
          solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
        ) VALUES ($1, 1450, 150, -420, 0, 1180, 71.0, 99.2, 88.5, false, 60.0, 0.98, 7390, 6120, 0, 1270, 3820);
      `, [s2Id]);

      // Site 3: Solar + DG + Grid (No BESS)
      const site3 = await client.query(`
        INSERT INTO public.sites (
          org_id, name, slug, location_city, location_state, plant_type, status,
          solar_capacity_kwp, bess_capacity_kwh, bess_power_kw, dg_capacity_kva, contracted_demand_kva,
          has_solar, has_bess, has_dg, has_grid, peak_tariff_rate, offpeak_tariff_rate
        ) VALUES ($1, 'Sonora Valley Agri-Voltaics & Peaker', 'sonora-valley', 'Fresno', 'CA', 'commercial_industrial', 'online', 1030, 0, 0, 600, 900, true, false, true, true, 0.19, 0.07)
        RETURNING id;
      `, [demoOrgId]);
      const s3Id = site3.rows[0].id;

      // Site 3 Devices
      await client.query(`
        INSERT INTO public.site_devices (site_id, name, category, manufacturer, model) VALUES
          ($1, 'Huawei SUN2000-100KTL Inverter Array', 'solar_inverter', 'Huawei', 'SUN2000-100KTL'),
          ($1, 'Caterpillar CAT C18 600kVA Peaker Genset', 'diesel_generator', 'Caterpillar', 'CAT C18'),
          ($1, 'Agricultural Feeder Revenue Meter', 'grid_meter', 'Schneider Electric', 'ION9000');
      `, [s3Id]);

      // Site 3 Snapshot
      await client.query(`
        INSERT INTO public.telemetry_snapshots (
          site_id, solar_power_kw, bess_power_kw, grid_power_kw, dg_power_kw, load_power_kw,
          bess_soc_pct, bess_soh_pct, dg_fuel_pct, dg_running, grid_frequency_hz, grid_power_factor,
          solar_yield_today_kwh, load_consumption_today_kwh, grid_import_today_kwh, grid_export_today_kwh, co2_saved_today_kg
        ) VALUES ($1, 1030, 0, -290, 0, 740, 0, 0, 92.0, false, 60.0, 0.99, 5210, 4110, 180, 1280, 2560);
      `, [s3Id]);

      // 5. Generate 30 days of hourly telemetry for each site (720 records per site = 2,160 rows)
      console.log('Generating 30 days of hourly telemetry rollups...');
      await generateHourlyTelemetry(client, s1Id, 940, 1500, 620, false);
      await generateHourlyTelemetry(client, s2Id, 1450, 2200, 1180, true);
      await generateHourlyTelemetry(client, s3Id, 1030, 0, 740, true);
    }

    // Print summary counts from DB
    const finalCounts = await client.query(`
      SELECT 
        (SELECT count(*) FROM public.organizations) as org_count,
        (SELECT count(*) FROM public.sites) as sites_count,
        (SELECT count(*) FROM public.site_devices) as devices_count,
        (SELECT count(*) FROM public.telemetry_snapshots) as snapshots_count,
        (SELECT count(*) FROM public.telemetry_hourly) as hourly_count,
        (SELECT count(*) FROM public.maintenance_services) as services_count;
    `);

    console.log('\n=============================================');
    console.log('DATABASE SETUP SUCCESSFUL ON SUPABASE!');
    console.log('Organizations:', finalCounts.rows[0].org_count);
    console.log('Sites:', finalCounts.rows[0].sites_count);
    console.log('Hardware Devices:', finalCounts.rows[0].devices_count);
    console.log('Telemetry Snapshots:', finalCounts.rows[0].snapshots_count);
    console.log('Hourly Telemetry Rows (30 Days):', finalCounts.rows[0].hourly_count);
    console.log('Maintenance Packages:', finalCounts.rows[0].services_count);
    console.log('=============================================\n');

  } catch (err) {
    console.error('Execution failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function generateHourlyTelemetry(client, siteId, solarKwp, bessKwh, baseLoadKw, hasDg) {
  const now = new Date();
  const rows = [];

  for (let i = 720; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const hour = time.getHours();

    let solarFraction = 0;
    if (hour >= 6 && hour <= 19) {
      const x = (hour - 6) / 13;
      solarFraction = Math.sin(x * Math.PI) * (0.85 + 0.15 * Math.sin(i * 0.1));
    }
    const solarKw = Math.max(0, Math.round(solarKwp * solarFraction));
    const loadVariation = 0.8 + 0.3 * Math.sin(((hour - 4) / 24) * 2 * Math.PI);
    const loadKw = Math.round(baseLoadKw * loadVariation);

    let bessKw = 0;
    let socPct = 50;
    if (bessKwh > 0) {
      if (solarKw > loadKw) {
        bessKw = -Math.min(bessKwh * 0.35, (solarKw - loadKw) * 0.7);
        socPct = Math.min(95, 60 + hour * 2.5);
      } else if (hour >= 17 && hour <= 21) {
        bessKw = Math.min(bessKwh * 0.3, loadKw * 0.6);
        socPct = Math.max(25, 85 - (hour - 17) * 12);
      } else {
        socPct = 45;
      }
    }

    const net = loadKw - solarKw - bessKw;
    const gridImport = net > 0 ? net : 0;
    const gridExport = net < 0 ? Math.abs(net) : 0;
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
      Math.round((solarKw * 0.14 + (bessKw > 0 ? bessKw * 0.08 : 0)) * 100) / 100
    ]);
  }

  const BATCH_SIZE = 100;
  for (let b = 0; b < rows.length; b += BATCH_SIZE) {
    const chunk = rows.slice(b, b + BATCH_SIZE);
    const placeholders = chunk.map((_, rIdx) => 
      `($${rIdx * 16 + 1}, $${rIdx * 16 + 2}, $${rIdx * 16 + 3}, $${rIdx * 16 + 4}, $${rIdx * 16 + 5}, $${rIdx * 16 + 6}, $${rIdx * 16 + 7}, $${rIdx * 16 + 8}, $${rIdx * 16 + 9}, $${rIdx * 16 + 10}, $${rIdx * 16 + 11}, $${rIdx * 16 + 12}, $${rIdx * 16 + 13}, $${rIdx * 16 + 14}, $${rIdx * 16 + 15}, $${rIdx * 16 + 16})`
    ).join(', ');

    await client.query(`
      INSERT INTO public.telemetry_hourly (
        site_id, bucket_timestamp, avg_solar_kw, solar_energy_kwh, avg_bess_kw,
        bess_charge_kwh, bess_discharge_kwh, end_bess_soc_pct, avg_load_kw,
        peak_load_kw, load_energy_kwh, grid_import_kwh, grid_export_kwh,
        dg_energy_kwh, dg_fuel_liters, estimated_cost_saved
      ) VALUES ${placeholders}
      ON CONFLICT (site_id, bucket_timestamp) DO NOTHING;
    `, chunk.flat());
  }
}

run();
