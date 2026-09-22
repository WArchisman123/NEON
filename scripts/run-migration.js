const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.uoiodhmahcpwedwajdtd:VncVw2WsMG3RL70u@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function migrate() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to live Supabase PostgreSQL!');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '0001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing 0001_initial_schema.sql migration...');
    await client.query(sql);
    console.log('Migration executed successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('organizations', 'sites', 'site_devices', 'telemetry_snapshots', 'telemetry_hourly', 'site_alarms', 'maintenance_services', 'maintenance_tickets')
      ORDER BY table_name;
    `);

    console.log('Verified created NEON tables in Supabase:');
    console.log(res.rows.map(r => r.table_name));

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
