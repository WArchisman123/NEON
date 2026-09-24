const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const res = await client.query(
    `INSERT INTO public.users (
       clerk_user_id, email, first_name, last_name, clerk_org_id, current_org_id, role
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (clerk_user_id)
     DO UPDATE SET
       email = EXCLUDED.email,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       clerk_org_id = EXCLUDED.clerk_org_id,
       current_org_id = EXCLUDED.current_org_id,
       role = EXCLUDED.role,
       updated_at = now()
     RETURNING *`,
    [
      "user_3Jly5gIQtsGiGS2ZmXJhR8tCUBe",
      "demo@demo.com",
      "Demo",
      "User",
      "org_3JgZ51s2g9LkRRE0L61kAXDGDWE",
      "937c5bc8-63fb-4239-a719-53aa87a36876",
      "org:admin",
    ]
  );

  console.log("Synced user:", res.rows[0]);
  await client.end();
}

main().catch(console.error);
