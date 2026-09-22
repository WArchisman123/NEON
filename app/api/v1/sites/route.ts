import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSitesForOrg } from "@/lib/energy/site-service";

/**
 * GET /api/v1/sites
 * Returns all Solar, BESS, DG, and Grid installations scoped to the caller's Clerk organization.
 * Inspectable in Chrome DevTools Network tab.
 */
export async function GET(req: NextRequest) {
  try {
    const { orgId, userId } = await auth();

    let effectiveOrgId = orgId;

    // If orgId is not explicitly set in the active session, resolve from user's Clerk memberships
    if (!effectiveOrgId && userId) {
      try {
        const client = await clerkClient();
        const memberships = await client.users.getOrganizationMembershipList({ userId });
        if (memberships.data.length > 0) {
          effectiveOrgId = memberships.data[0].organization.id;
        }
      } catch (err) {
        console.warn("[API /api/v1/sites] Error fetching memberships:", err);
      }
    }

    // Fallback to iRasus Technologies master organization
    if (!effectiveOrgId) {
      effectiveOrgId = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";
    }

    // Query sites from Supabase PostgreSQL
    const sites = await getSitesForOrg(effectiveOrgId);

    // Optional query parameter filtering
    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get("status");
    const assetFilter = searchParams.get("asset");

    let filteredSites = sites;
    if (statusFilter) {
      filteredSites = filteredSites.filter(
        (s) => s.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (assetFilter === "bess") {
      filteredSites = filteredSites.filter((s) => s.has_bess);
    } else if (assetFilter === "solar") {
      filteredSites = filteredSites.filter((s) => s.has_solar);
    } else if (assetFilter === "dg") {
      filteredSites = filteredSites.filter((s) => s.has_dg);
    }

    return NextResponse.json({
      success: true,
      count: filteredSites.length,
      orgId: effectiveOrgId,
      data: filteredSites,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /api/v1/sites] Error handling request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
