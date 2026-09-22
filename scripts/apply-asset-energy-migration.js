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
    await client.connect();
    console.log("[Migration 0005] Connected to Supabase PostgreSQL...");

    // 1. Run the migration SQL
    const migrationSql = fs.readFileSync(
      path.join(__dirname, "../supabase/migrations/0005_add_asset_energy_figures_to_snapshots.sql"),
      "utf8"
    );
    await client.query(migrationSql);
    console.log("[Migration 0005] Columns added to public.telemetry_snapshots successfully.");

    // 2. Fetch all sites for org_3JgZ51s2g9LkRRE0L61kAXDGDWE
    const sitesRes = await client.query(`
      SELECT s.id, s.slug, s.name 
      FROM public.sites s
      JOIN public.organizations o ON s.org_id = o.id
      WHERE o.clerk_org_id = 'org_3JgZ51s2g9LkRRE0L61kAXDGDWE'
    `);

    console.log(`[Migration 0005] Found ${sitesRes.rows.length} sites to update with rich energy figures:`);

    for (const site of sitesRes.rows) {
      if (site.slug === "bakersfield-central") {
        await client.query(`
          UPDATE public.telemetry_snapshots SET
            solar_power_kw = 720,
            solar_yield_today_kwh = 4230,
            bess_power_kw = -250,
            bess_soc_pct = 82.0,
            bess_charge_today_kwh = 980,
            bess_discharge_today_kwh = 750,
            grid_power_kw = -120,
            grid_import_today_kwh = 1420,
            grid_export_today_kwh = 890,
            dg_power_kw = 0,
            dg_yield_today_kwh = 0,
            dg_running = false,
            load_power_kw = 620,
            load_consumption_today_kwh = 4850,
            co2_saved_today_kg = 3045,
            timestamp = now()
          WHERE site_id = '${site.id}'
        `);
        console.log(`  ✓ Calibrated Bakersfield Central (940 kWp Solar, 1.5 MWh BESS)`);
      } else if (site.slug === "mojave-desert-alpha") {
        await client.query(`
          UPDATE public.telemetry_snapshots SET
            solar_power_kw = 1150,
            solar_yield_today_kwh = 6525,
            bess_power_kw = 280,
            bess_soc_pct = 68.0,
            bess_charge_today_kwh = 1400,
            bess_discharge_today_kwh = 1100,
            grid_power_kw = 310,
            grid_import_today_kwh = 2450,
            grid_export_today_kwh = 450,
            dg_power_kw = 180,
            dg_yield_today_kwh = 480,
            dg_running = true,
            dg_fuel_pct = 82.0,
            load_power_kw = 1180,
            load_consumption_today_kwh = 8900,
            co2_saved_today_kg = 4698,
            timestamp = now()
          WHERE site_id = '${site.id}'
        `);
        console.log(`  ✓ Calibrated Mojave Desert Alpha (1,450 kWp Solar, 2.2 MWh BESS, 800 kVA DG)`);
      } else if (site.slug === "sonora-valley") {
        await client.query(`
          UPDATE public.telemetry_snapshots SET
            solar_power_kw = 810,
            solar_yield_today_kwh = 4635,
            bess_power_kw = 0,
            bess_soc_pct = 0,
            bess_charge_today_kwh = 0,
            bess_discharge_today_kwh = 0,
            grid_power_kw = 410,
            grid_import_today_kwh = 3200,
            grid_export_today_kwh = 0,
            dg_power_kw = 0,
            dg_yield_today_kwh = 210,
            dg_running = false,
            dg_fuel_pct = 91.0,
            load_power_kw = 750,
            load_consumption_today_kwh = 6100,
            co2_saved_today_kg = 3337,
            timestamp = now()
          WHERE site_id = '${site.id}'
        `);
        console.log(`  ✓ Calibrated Sonora Valley (1,030 kWp Solar, 600 kVA DG, 900 kVA Grid)`);
      } else if (site.slug === "sierra-nevada-remote") {
        await client.query(`
          UPDATE public.telemetry_snapshots SET
            solar_power_kw = 580,
            solar_yield_today_kwh = 3420,
            bess_power_kw = 0,
            bess_soc_pct = 0,
            bess_charge_today_kwh = 0,
            bess_discharge_today_kwh = 0,
            grid_power_kw = 0,
            grid_import_today_kwh = 0,
            grid_export_today_kwh = 0,
            dg_power_kw = 120,
            dg_yield_today_kwh = 680,
            dg_running = true,
            dg_fuel_pct = 76.5,
            load_power_kw = 700,
            load_consumption_today_kwh = 4100,
            timestamp = now()
          WHERE site_id = '${site.id}'
        `);
        console.log(`  ✓ Updated Sierra Nevada Remote: Solar 3.42 MWh, DG 680 kWh (Running), Grid: Islanded`);
      } else if (site.slug === "coachella-islanded-hub") {
        await client.query(`
          UPDATE public.telemetry_snapshots SET
            solar_power_kw = 920,
            solar_yield_today_kwh = 5400,
            bess_power_kw = -320,
            bess_soc_pct = 92.0,
            bess_charge_today_kwh = 2800,
            bess_discharge_today_kwh = 1400,
            grid_power_kw = 0,
            grid_import_today_kwh = 0,
            grid_export_today_kwh = 0,
            dg_power_kw = 0,
            dg_yield_today_kwh = 0,
            dg_running = false,
            dg_fuel_pct = 0,
            load_power_kw = 600,
            load_consumption_today_kwh = 5900,
            timestamp = now()
          WHERE site_id = '${site.id}'
        `);
        console.log(`  ✓ Updated Coachella Islanded: Solar 5.4 MWh, BESS 92% (In 2.8 MWh / Out 1.4 MWh), 100% Clean`);
      } else if (site.slug === "redwood-coast-hybrid") {
        await client.query(`
          UPDATE public.telemetry_snapshots SET
            solar_power_kw = 0,
            solar_yield_today_kwh = 0,
            bess_power_kw = 0,
            bess_soc_pct = 74.0,
            bess_charge_today_kwh = 0,
            bess_discharge_today_kwh = 0,
            grid_power_kw = 0,
            grid_import_today_kwh = 0,
            grid_export_today_kwh = 0,
            dg_power_kw = 0,
            dg_yield_today_kwh = 0,
            dg_running = false,
            dg_fuel_pct = 88.0,
            load_power_kw = 0,
            load_consumption_today_kwh = 0,
            timestamp = now()
          WHERE site_id = '${site.id}'
        `);
        console.log(`  ✓ Updated Redwood Coast: Subscription Expired (Paused feeds)`);
      }
    }

    console.log("[Migration 0005] Completed successfully!");
  } catch (err) {
    console.error("[Migration 0005] Error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
