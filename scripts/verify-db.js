const { Client } = require('pg');

const connectionString = 'postgresql://postgres.uoiodhmahcpwedwajdtd:VncVw2WsMG3RL70u@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function verify() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Verifying Supabase PostgreSQL tables and data...');

    // 1. Check tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('organizations', 'sites', 'site_devices', 'telemetry_snapshots', 'telemetry_hourly')
      ORDER BY table_name;
    `);
    console.log('Tables present:', tables.rows.map(r => r.table_name));

    // 2. Check maintenance catalog packages
    const services = await client.query('SELECT title, asset_type, base_price FROM public.maintenance_services;');
    console.log('Maintenance catalog services seeded:', services.rows.length);
    services.rows.forEach(s => console.log(` - [${s.asset_type}] ${s.title} ($${s.base_price})`));

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await client.end();
  }
}

verify();
