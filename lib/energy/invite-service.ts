import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { query } from "@/lib/supabase/db";
import { OrganizationRecord } from "./types";

const MASTER_ORG_ID = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";

function getSecretKey(): string {
  const secret = process.env.CLERK_SECRET_KEY || "neon-energy-invite-fallback-secret-2026";
  return secret;
}

/**
 * Generates an HMAC-SHA256 signature for a specific organization and role
 */
export function generateInviteToken(orgId: string, role: string = "org:member"): string {
  const secret = getSecretKey();
  return crypto
    .createHmac("sha256", secret)
    .update(`${orgId}:${role}`)
    .digest("hex")
    .slice(0, 24);
}

/**
 * Verifies an invite token using constant-time comparison
 */
export function verifyInviteToken(orgId: string, role: string, token: string): boolean {
  if (!orgId || !token) return false;
  const expected = generateInviteToken(orgId, role);
  try {
    const bufA = Buffer.from(token, "hex");
    const bufB = Buffer.from(expected, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Returns organizations that the user has admin authority to create invite links for.
 * If user is in the master organization (iRasus Technologies) or has org:admin,
 * they can invite for that org (or select from all active orgs if master admin).
 */
export async function getManageableOrganizations(
  clerkUserId: string,
  isMasterOrgAdmin: boolean
): Promise<Array<{ id: string; name: string; slug: string }>> {
  const client = await clerkClient();

  if (isMasterOrgAdmin) {
    // Master admin can invite to any organization in the fleet
    try {
      const orgList = await client.organizations.getOrganizationList({ limit: 50 });
      return orgList.data.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug || o.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));
    } catch (err) {
      console.error("[getManageableOrganizations] Error fetching org list:", err);
    }
  }

  // Otherwise, fetch user's admin memberships
  try {
    const memberships = await client.users.getOrganizationMembershipList({
      userId: clerkUserId,
    });
    return memberships.data
      .filter((m) => m.role === "org:admin")
      .map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug || m.organization.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));
  } catch (err) {
    console.error("[getManageableOrganizations] Error fetching user memberships:", err);
    return [];
  }
}

/**
 * Accepts an invitation, enrolls the user into the target organization in Clerk,
 * and synchronizes their record in Supabase PostgreSQL.
 */
export async function acceptInviteAndJoinOrg(
  targetOrgId: string,
  targetRole: string = "org:member",
  clerkUserId: string
): Promise<{ success: boolean; orgName: string; error?: string }> {
  try {
    const client = await clerkClient();

    // 1. Fetch organization details from Clerk to verify it exists
    const org = await client.organizations.getOrganization({
      organizationId: targetOrgId,
    });

    if (!org) {
      return { success: false, orgName: "", error: "Target organization does not exist." };
    }

    // 2. Check if the user is already a member
    const existingMemberships = await client.users.getOrganizationMembershipList({
      userId: clerkUserId,
    });

    const isAlreadyMember = existingMemberships.data.some(
      (m) => m.organization.id === targetOrgId
    );

    if (!isAlreadyMember) {
      // Create organization membership in Clerk
      await client.organizations.createOrganizationMembership({
        organizationId: targetOrgId,
        userId: clerkUserId,
        role: targetRole,
      });
      console.log(`[acceptInvite] User ${clerkUserId} added to org ${targetOrgId} as ${targetRole}`);
    } else {
      console.log(`[acceptInvite] User ${clerkUserId} is already a member of org ${targetOrgId}`);
    }

    // 3. Upsert organization and user into Supabase PostgreSQL
    const orgRes = await query<OrganizationRecord>(
      `INSERT INTO public.organizations (clerk_org_id, name, slug, tier, status)
       VALUES ($1, $2, $3, 'pro_commercial', 'active')
       ON CONFLICT (clerk_org_id)
       DO UPDATE SET name = EXCLUDED.name, updated_at = now()
       RETURNING *`,
      [org.id, org.name, org.slug || org.id]
    );

    const dbOrg = orgRes.rows[0];

    const clerkUser = await client.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || "member@neon.energy";
    const firstName = clerkUser.firstName || null;
    const lastName = clerkUser.lastName || null;
    const imageUrl = clerkUser.imageUrl || null;

    await query(
      `INSERT INTO public.users (
         clerk_user_id, email, first_name, last_name, image_url, clerk_org_id, current_org_id, role
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (clerk_user_id)
       DO UPDATE SET
         email = EXCLUDED.email,
         clerk_org_id = EXCLUDED.clerk_org_id,
         current_org_id = EXCLUDED.current_org_id,
         role = EXCLUDED.role,
         updated_at = now()`,
      [clerkUserId, email, firstName, lastName, imageUrl, targetOrgId, dbOrg.id, targetRole]
    );

    return {
      success: true,
      orgName: org.name,
    };
  } catch (err: unknown) {
    console.error("[acceptInviteAndJoinOrg] Error accepting invite:", err);
    const message = err instanceof Error ? err.message : "Failed to join organization";
    return {
      success: false,
      orgName: "",
      error: message,
    };
  }
}
