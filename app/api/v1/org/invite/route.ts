import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import {
  generateInviteToken,
  getManageableOrganizations,
} from "@/lib/energy/invite-service";

const MASTER_ORG_ID = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";

/**
 * GET: Returns organizations the authenticated admin can create invite links for.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    const { orgId, orgRole } = await auth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isMasterOrgAdmin =
      orgId === MASTER_ORG_ID ||
      user.emailAddresses.some((e) => e.emailAddress.endsWith("@irasus.com")) ||
      orgRole === "org:admin";

    const organizations = await getManageableOrganizations(user.id, isMasterOrgAdmin);

    // Fallback: If no orgs found, ensure at least iRasus Technologies is available if user is authorized
    if (organizations.length === 0 && isMasterOrgAdmin) {
      organizations.push({
        id: MASTER_ORG_ID,
        name: "iRasus Technologies",
        slug: "irasus-technologies",
      });
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const origin = `${protocol}://${host}`;

    // Attach generated tokens for convenient initial state
    const orgsWithLinks = organizations.map((org) => {
      const memberToken = generateInviteToken(org.id, "org:member");
      const adminToken = generateInviteToken(org.id, "org:admin");
      return {
        ...org,
        links: {
          member: `${origin}/invite?orgId=${org.id}&role=org:member&token=${memberToken}`,
          admin: `${origin}/invite?orgId=${org.id}&role=org:admin&token=${adminToken}`,
        },
      };
    });

    return NextResponse.json({
      organizations: orgsWithLinks,
      defaultOrgId: orgId || organizations[0]?.id || MASTER_ORG_ID,
      isMasterAdmin: isMasterOrgAdmin,
    });
  } catch (err: unknown) {
    console.error("[api/org/invite GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch invite details" }, { status: 500 });
  }
}

/**
 * POST: Handles sending an official Clerk email invitation or generating an ad-hoc signed link.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const { orgId: userOrgId, orgRole } = await auth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, targetOrgId, email, role = "org:member" } = body;

    const isMasterOrgAdmin =
      userOrgId === MASTER_ORG_ID ||
      user.emailAddresses.some((e) => e.emailAddress.endsWith("@irasus.com")) ||
      orgRole === "org:admin";

    if (!isMasterOrgAdmin && targetOrgId !== userOrgId) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permissions to invite members to this organization." },
        { status: 403 }
      );
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const origin = `${protocol}://${host}`;

    if (action === "send_email") {
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }

      const client = await clerkClient();
      const redirectUrl = `${origin}/invite?orgId=${targetOrgId}&role=${role}&token=${generateInviteToken(
        targetOrgId,
        role
      )}`;

      const invitation = await client.organizations.createOrganizationInvitation({
        organizationId: targetOrgId,
        inviterUserId: user.id,
        emailAddress: email.trim().toLowerCase(),
        role: role === "org:admin" ? "org:admin" : "org:member",
        redirectUrl,
      });

      return NextResponse.json({
        success: true,
        invitationId: invitation.id,
        message: `Official invitation sent to ${email}`,
      });
    }

    // Default action: generate signed link
    const token = generateInviteToken(targetOrgId, role);
    const link = `${origin}/invite?orgId=${targetOrgId}&role=${role}&token=${token}`;

    return NextResponse.json({
      success: true,
      link,
      orgId: targetOrgId,
      role,
    });
  } catch (err: unknown) {
    console.error("[api/org/invite POST] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to process invitation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
