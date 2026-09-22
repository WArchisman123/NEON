const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  console.log("=== CHECKING ORG_3JGZ51S2G9LKRRE0L61KAXDGDWE ===");
  const orgRes = await client.query(
    "SELECT * FROM public.organizations WHERE clerk_org_id = $1",
    ["org_3JgZ51s2g9LkRRE0L61kAXDGDWE"]
  );
  console.log("Org Row:", orgRes.rows);

  if (orgRes.rows.length > 0) {
    const orgId = orgRes.rows[0].id;
    const sitesRes = await client.query(
      "SELECT id, name, plant_type, has_solar, has_bess, has_dg, has_grid FROM public.sites WHERE org_id = $1",
      [orgId]
    );
    console.log(`Sites Count for org (${orgId}):`, sitesRes.rows.length);
    console.log("Sites:", sitesRes.rows);

    const usersRes = await client.query(
      "SELECT id, email, first_name, role, clerk_org_id, current_org_id FROM public.users WHERE current_org_id = $1",
      [orgId]
    );
    console.log("Users in Org:", usersRes.rows);

    const alarmsRes = await client.query(
      `SELECT a.* FROM public.site_alarms a 
       JOIN public.sites s ON a.site_id = s.id 
       WHERE s.org_id = $1`,
      [orgId]
    );
    console.log("Alarms Count for Org sites:", alarmsRes.rows.length);

    const ticketsRes = await client.query(
      "SELECT * FROM public.maintenance_tickets WHERE org_id = $1",
      [orgId]
    );
    console.log("Maintenance Tickets for Org:", ticketsRes.rows.length);
  }

  await client.end();
}

main().catch(console.error);
