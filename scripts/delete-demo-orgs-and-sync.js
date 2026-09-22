const { Client } = require("pg");

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

    // Ensure clean name for iRasus Technologies
    await client.query(
      `UPDATE public.organizations 
       SET name = 'iRasus Technologies' 
       WHERE clerk_org_id = 'org_3JgZ51s2g9LkRRE0L61kAXDGDWE'`
    );

    // Delete legacy demo organizations
    await client.query(
      `DELETE FROM public.organizations 
       WHERE clerk_org_id IN ('org_demo_neon_energy', 'default_org')`
    );

    // Verify current organizations
    const currentOrgs = await client.query(
      `SELECT id, clerk_org_id, name, slug, tier, status FROM public.organizations`
    );
    console.log("\n======================================================");
    console.log("ACTIVE ORGANIZATIONS IN SUPABASE (1:1 WITH CLERK):");
    console.log("======================================================");
    console.table(currentOrgs.rows);

  } catch (err) {
    console.error("[Cleanup Error]:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
