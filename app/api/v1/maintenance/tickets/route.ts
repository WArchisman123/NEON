import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getOrCreateOrg, getSitesForOrg } from "@/lib/energy/site-service";
import {
  getMaintenanceTickets,
  createMaintenanceTicket,
  seedDemoTicketsIfEmpty,
} from "@/lib/energy/maintenance-service";
import { MaintenanceAssetType } from "@/lib/energy/types";

export const dynamic = "force-dynamic";

async function resolveOrgId(): Promise<string> {
  const { orgId, userId } = await auth();
  let effectiveOrgId = orgId;

  if (!effectiveOrgId && userId) {
    try {
      const client = await clerkClient();
      const memberships = await client.users.getOrganizationMembershipList({ userId });
      if (memberships.data.length > 0) {
        effectiveOrgId = memberships.data[0].organization.id;
      }
    } catch (err) {
      console.warn("[API maintenance/tickets] Error fetching memberships:", err);
    }
  }

  if (!effectiveOrgId) {
    effectiveOrgId = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";
  }

  return effectiveOrgId;
}

/**
 * GET /api/v1/maintenance/tickets
 * Lists all active and completed maintenance tickets for the authenticated organization.
 */
export async function GET() {
  try {
    const clerkOrgId = await resolveOrgId();
    const org = await getOrCreateOrg(clerkOrgId);

    // If org has sites, ensure demo tickets are seeded if empty
    const sites = await getSitesForOrg(clerkOrgId);
    if (sites.length > 0) {
      await seedDemoTicketsIfEmpty(org.id, sites[0].id);
    }

    const tickets = await getMaintenanceTickets(org.id);

    return NextResponse.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("[api:maintenance/tickets:GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve maintenance tickets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/maintenance/tickets
 * Books a new certified Solar PV or BESS maintenance service window.
 */
export async function POST(req: NextRequest) {
  try {
    const clerkOrgId = await resolveOrgId();
    const org = await getOrCreateOrg(clerkOrgId);

    const body = await req.json();
    const {
      siteId,
      assetType,
      serviceId,
      scheduledDate,
      timeWindow,
      customNotes,
      totalPrice,
      paymentStatus,
    } = body;

    // Strict validation: Only Solar PV and BESS are serviced
    if (assetType !== "solar_pv" && assetType !== "bess") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid assetType. Neon Energy maintenance marketplace exclusively supports 'solar_pv' and 'bess'.",
        },
        { status: 400 }
      );
    }

    if (!siteId || !scheduledDate || !timeWindow || totalPrice === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required booking fields (siteId, scheduledDate, timeWindow, totalPrice).",
        },
        { status: 400 }
      );
    }

    const newTicket = await createMaintenanceTicket({
      orgId: org.id,
      siteId,
      assetType: assetType as MaintenanceAssetType,
      serviceId,
      scheduledDate,
      timeWindow,
      customNotes,
      totalPrice: Number(totalPrice),
      paymentStatus: paymentStatus || "paid",
    });

    if (!newTicket) {
      return NextResponse.json(
        { success: false, error: "Failed to persist maintenance ticket" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newTicket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api:maintenance/tickets:POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error booking maintenance window" },
      { status: 500 }
    );
  }
}
