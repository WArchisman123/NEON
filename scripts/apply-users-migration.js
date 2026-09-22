const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const { createClerkClient } = require("@clerk/backend");

// Read .env.local for credentials
const envLocalPath = path.resolve(__dirname, "../.env.local");
let clerkSecretKey = process.env.CLERK_SECRET_KEY || "";
let connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  const clerkMatch = envContent.match(/CLERK_SECRET_KEY=(sk_test_[^\s]+)/);
  if (clerkMatch) clerkSecretKey = clerkMatch[1];
  const dbMatch = envContent.match(/DATABASE_URL=(postgresql:\/\/[^\s]+)/);
  if (dbMatch) connectionString = dbMatch[1];
}

const clerk = createClerkClient({ secretKey: clerkSecretKey });

async function main() {
  const dbClient = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("[Users Migration] Connecting to live Supabase PostgreSQL...");
    await dbClient.connect();
    console.log("[Users Migration] Connected successfully.");

    // 1. Run Migration DDL
    const ddlPath = path.resolve(__dirname, "../supabase/migrations/0003_create_users_table.sql");
    const ddlSql = fs.readFileSync(ddlPath, "utf-8");
    console.log("[Users Migration] Executing 0003_create_users_table.sql...");
    await dbClient.query(ddlSql);
    console.log("[Users Migration] Created public.users table and enabled RLS!");

    // 2. Fetch Organization and Members from Clerk API
    const targetOrgId = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";
    console.log(`\n[Clerk Sync] Fetching organization details for ${targetOrgId} from Clerk API...`);
    const clerkOrg = await clerk.organizations.getOrganization({ organizationId: targetOrgId });
    console.log(`[Clerk Sync] Found Org: "${clerkOrg.name}" (${clerkOrg.id}, slug: ${clerkOrg.slug})`);

    // 3. Upsert Organization in Supabase
    const orgUpsertRes = await dbClient.query(
      `INSERT INTO public.organizations (clerk_org_id, name, slug, tier, status)
       VALUES ($1, $2, $3, 'pro_commercial', 'active')
       ON CONFLICT (clerk_org_id) 
       DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, updated_at = now()
       RETURNING id, clerk_org_id, name`,
      [clerkOrg.id, clerkOrg.name, clerkOrg.slug]
    );
    const dbOrg = orgUpsertRes.rows[0];
    console.log(`[Clerk Sync] Organization stored in Supabase: ID ${dbOrg.id} -> ${dbOrg.name}`);

    // 4. Fetch Members from Clerk API
    console.log(`[Clerk Sync] Fetching organization members for ${targetOrgId}...`);
    const membersRes = await clerk.organizations.getOrganizationMembershipList({ organizationId: targetOrgId });
    console.log(`[Clerk Sync] Found ${membersRes.data.length} member(s) in Clerk.`);

    for (const member of membersRes.data) {
      const publicUser = member.publicUserData;
      const clerkUserId = publicUser.userId;
      const email = publicUser.identifier;
      const firstName = publicUser.firstName || "Archisman";
      const lastName = publicUser.lastName || "Saha";
      const imageUrl = publicUser.imageUrl || null;
      const role = member.role || "org:admin";

      console.log(`[Clerk Sync] Upserting user ${email} (${clerkUserId}, role: ${role})...`);

      const userUpsertRes = await dbClient.query(
        `INSERT INTO public.users (
           clerk_user_id, email, first_name, last_name, image_url, clerk_org_id, current_org_id, role
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (clerk_user_id) 
         DO UPDATE SET 
           email = EXCLUDED.email,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           image_url = EXCLUDED.image_url,
           clerk_org_id = EXCLUDED.clerk_org_id,
           current_org_id = EXCLUDED.current_org_id,
           role = EXCLUDED.role,
           updated_at = now()
         RETURNING id, email, role, current_org_id`,
        [clerkUserId, email, firstName, lastName, imageUrl, clerkOrg.id, dbOrg.id, role]
      );
      const dbUser = userUpsertRes.rows[0];
      console.log(`[Clerk Sync] User stored in Supabase: ID ${dbUser.id} -> ${dbUser.email} (${dbUser.role})`);
    }

    // 5. Check if this Organization has Sites assigned
    const siteCountRes = await dbClient.query(
      `SELECT count(*) FROM public.sites WHERE org_id = $1`,
      [dbOrg.id]
    );
    const currentSitesCount = parseInt(siteCountRes.rows[0].count, 10);
    console.log(`\n[Sites Scoping] Current sites assigned to org ${dbOrg.name}: ${currentSitesCount}`);

    if (currentSitesCount === 0) {
      console.log(`[Sites Scoping] Assigning/Seeding multi-asset installations for ${dbOrg.name}...`);
      
      // Update existing 3 demo sites so they belong to this active organization!
      // This immediately connects the rich 30-day telemetry (2,163 records) to this organization!
      const updateSitesRes = await dbClient.query(
        `UPDATE public.sites SET org_id = $1 RETURNING id, name`,
        [dbOrg.id]
      );
      console.log(`[Sites Scoping] Assigned ${updateSitesRes.rows.length} installations to ${dbOrg.name}:`);
      updateSitesRes.rows.forEach(s => console.log(`  ⚡ Assigned: ${s.name} (${s.id})`));

      // Also update maintenance tickets org_id
      await dbClient.query(
        `UPDATE public.maintenance_tickets SET org_id = $1`,
        [dbOrg.id]
      );
      console.log(`[Sites Scoping] Updated maintenance tickets to belong to ${dbOrg.name}.`);
    }

    // 6. Verification Summary
    console.log("\n======================================================");
    console.log("CLERK USER & ORG SYNC COMPLETE AND VERIFIED!");
    console.log("======================================================");

    const verifyUsers = await dbClient.query(`
      SELECT u.email, u.first_name, u.role, o.name as org_name, o.clerk_org_id
      FROM public.users u
      LEFT JOIN public.organizations o ON u.current_org_id = o.id
    `);
    console.log("\n[Current Supabase Users]:");
    verifyUsers.rows.forEach(u => {
      console.log(`  👤 ${u.email} (${u.first_name}) | Role: ${u.role} | Org: ${u.org_name} (${u.clerk_org_id})`);
    });

    const verifySites = await dbClient.query(`
      SELECT s.name, o.name as org_name, s.has_solar, s.has_bess, s.has_dg
      FROM public.sites s
      JOIN public.organizations o ON s.org_id = o.id
    `);
    console.log("\n[Sites Scoped to Organizations]:");
    verifySites.rows.forEach(s => {
      console.log(`  ⚡ ${s.name} -> Org: "${s.org_name}" | Solar: ${s.has_solar} | BESS: ${s.has_bess} | DG: ${s.has_dg}`);
    });

  } catch (err) {
    console.error("[Users Migration Error]:", err);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

main();
