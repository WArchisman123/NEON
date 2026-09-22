const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const sites = await client.query(
    "SELECT s.name, o.clerk_org_id FROM public.sites s JOIN public.organizations o ON s.org_id = o.id WHERE o.clerk_org_id IN ('org_demo_neon_energy', 'default_org')"
  );
  console.log("Sites linked to demo orgs:", sites.rows.length);

  const users = await client.query(
    "SELECT u.email, o.clerk_org_id FROM public.users u JOIN public.organizations o ON u.current_org_id = o.id WHERE o.clerk_org_id IN ('org_demo_neon_energy', 'default_org')"
  );
  console.log("Users linked to demo orgs:", users.rows.length);

  await client.end();
}

main().catch(console.error);
