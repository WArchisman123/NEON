import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { query } from "@/lib/supabase/db";
import { UserRecord, OrganizationRecord } from "@/lib/energy/types";
import { seedDemoSitesIfEmpty } from "@/lib/energy/site-service";

export interface SyncResult {
  user: UserRecord | null;
  org: OrganizationRecord | null;
  clerkOrgId: string;
  role: string;
}

/**
 * Synchronizes all active organizations from Clerk into Supabase PostgreSQL.
 * Deletes any organizations in Supabase that no longer exist in Clerk.
 */
export async function syncAllClerkOrganizations(): Promise<OrganizationRecord[]> {
  try {
    const client = await clerkClient();
    const clerkOrgs = await client.organizations.getOrganizationList({ limit: 100 });
    const activeClerkOrgIds = clerkOrgs.data.map((o) => o.id);

    if (activeClerkOrgIds.length > 0) {
      // Upsert each organization from Clerk
      for (const org of clerkOrgs.data) {
        await query(
          `INSERT INTO public.organizations (clerk_org_id, name, slug, tier, status)
           VALUES ($1, $2, $3, 'pro_commercial', 'active')
           ON CONFLICT (clerk_org_id)
           DO UPDATE SET 
             name = EXCLUDED.name, 
             slug = EXCLUDED.slug, 
             updated_at = now()`,
          [org.id, org.name, org.slug]
        );
      }

      // Delete any organizations in the database that do not exist in Clerk
      const placeholders = activeClerkOrgIds.map((_, i) => `$${i + 1}`).join(", ");
      await query(
        `DELETE FROM public.organizations WHERE clerk_org_id NOT IN (${placeholders})`,
        activeClerkOrgIds
      );
    }

    const current = await query<OrganizationRecord>("SELECT * FROM public.organizations ORDER BY name ASC");
    return current.rows;
  } catch (err) {
    console.error("[syncAllClerkOrganizations] Error syncing Clerk organizations:", err);
    return [];
  }
}

/**
 * Synchronizes the currently authenticated Clerk user and their active organization
 * into Supabase PostgreSQL (public.users and public.organizations).
 * If the user or organization does not exist in the database, it creates them.
 * If the organization has no sites assigned, it automatically seeds 3 diverse demo sites.
 */
export async function syncUserAndOrgFromClerk(): Promise<SyncResult> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return {
        user: null,
        org: null,
        clerkOrgId: "",
        role: "org:member",
      };
    }

    const { orgId, orgRole, orgSlug } = await auth();
    let effectiveOrgId = orgId;
    let effectiveRole = orgRole || "org:member";
    let effectiveOrgName = orgSlug || "iRasus Technologies";
    let effectiveOrgSlug = orgSlug || "irasus-technologies";

    // If orgId is not explicitly selected in the current session,
    // query the user's organization memberships from Clerk Backend API
    if (!effectiveOrgId) {
      try {
        const client = await clerkClient();
        const memberships = await client.users.getOrganizationMembershipList({
          userId: clerkUser.id,
        });

        if (memberships.data.length > 0) {
          const firstOrg = memberships.data[0];
          effectiveOrgId = firstOrg.organization.id;
          effectiveRole = firstOrg.role;
          effectiveOrgName = firstOrg.organization.name;
          effectiveOrgSlug =
            firstOrg.organization.slug ||
            firstOrg.organization.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }
      } catch (err) {
        console.warn("[syncUserAndOrgFromClerk] Warning fetching Clerk org memberships:", err);
      }
    }

    // Fallback if user has no organization in Clerk at all
    if (!effectiveOrgId) {
      effectiveOrgId = `user-org-${clerkUser.id}`;
      effectiveOrgName = clerkUser.firstName
        ? `${clerkUser.firstName}'s Energy Fleet`
        : "Personal Energy Fleet";
      effectiveOrgSlug = `user-${clerkUser.id.toLowerCase().slice(0, 12)}`;
    }

    // 1. Upsert Organization in Supabase
    const orgRes = await query<OrganizationRecord>(
      `INSERT INTO public.organizations (clerk_org_id, name, slug, tier, status)
       VALUES ($1, $2, $3, 'pro_commercial', 'active')
       ON CONFLICT (clerk_org_id)
       DO UPDATE SET 
         name = EXCLUDED.name, 
         slug = EXCLUDED.slug, 
         updated_at = now()
       RETURNING *`,
      [effectiveOrgId, effectiveOrgName, effectiveOrgSlug]
    );
    const dbOrg = orgRes.rows[0];

    // 2. Ensure sites exist for this organization (seed if empty)
    await seedDemoSitesIfEmpty(dbOrg.id);

    // 3. Upsert User in Supabase
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || "user@neon.energy";
    const firstName = clerkUser.firstName || null;
    const lastName = clerkUser.lastName || null;
    const imageUrl = clerkUser.imageUrl || null;

    const userRes = await query<UserRecord>(
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
       RETURNING *`,
      [clerkUser.id, email, firstName, lastName, imageUrl, effectiveOrgId, dbOrg.id, effectiveRole]
    );
    const dbUser = userRes.rows[0];

    return {
      user: dbUser,
      org: dbOrg,
      clerkOrgId: effectiveOrgId,
      role: effectiveRole,
    };
  } catch (err) {
    console.error("[syncUserAndOrgFromClerk] Error syncing user and org:", err);
    return {
      user: null,
      org: null,
      clerkOrgId: "",
      role: "org:member",
    };
  }
}
