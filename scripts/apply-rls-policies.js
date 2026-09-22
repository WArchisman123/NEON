const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

console.log("[RLS Migration] Connecting to Supabase PostgreSQL at:", connectionString.replace(/:[^:@]+@/, ":****@"));

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await client.connect();
    console.log("[RLS Migration] Connected to database successfully.");

    const sqlPath = path.resolve(__dirname, "../supabase/migrations/0002_enable_rls.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("[RLS Migration] Executing 0002_enable_rls.sql...");
    await client.query(sql);

    console.log("[RLS Migration] Migration completed successfully!");

    // Verify RLS status on public tables
    const rlsStatusRes = await client.query(`
      SELECT 
        tablename, 
        rowsecurity
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename ASC;
    `);

    console.log("\n[RLS Status on Public Tables]:");
    rlsStatusRes.rows.forEach(r => {
      console.log(`  🛡️  ${r.tablename.padEnd(25)} -> RLS Enabled: ${r.rowsecurity}`);
    });

    // Verify policies
    const policiesRes = await client.query(`
      SELECT 
        tablename, 
        policyname, 
        cmd, 
        roles
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename ASC, policyname ASC;
    `);

    console.log("\n[Configured RLS Policies]:");
    policiesRes.rows.forEach(p => {
      console.log(`  📜 ${p.tablename}: "${p.policyname}" (${p.cmd}) for roles: ${p.roles}`);
    });

  } catch (err) {
    console.error("[RLS Migration Error]:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
