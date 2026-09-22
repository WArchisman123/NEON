import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSiteDetails } from "@/lib/energy/site-service";
import { query } from "@/lib/supabase/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/sites/:id
 * Fetches installation details, live telemetry snapshot, and device hardware inventory.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
        console.warn("[API /api/v1/sites/:id] Error fetching memberships:", err);
      }
    }

    if (!effectiveOrgId) {
      effectiveOrgId = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";
    }

    const details = await getSiteDetails(effectiveOrgId, id);
    if (!details) {
      return NextResponse.json(
        { success: false, error: "Site installation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /api/v1/sites/:id] Error fetching site:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/sites/:id
 * Updates installation configuration (e.g. status, tariff, nameplate capacity).
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "name",
      "status",
      "subscription_status",
      "solar_capacity_kwp",
      "bess_capacity_kwh",
      "peak_tariff_rate",
      "offpeak_tariff_rate",
    ];

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates.push(`${key} = $${idx}`);
        values.push(body[key]);
        idx++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    values.push(id);
    const updateSql = `
      UPDATE public.sites 
      SET ${updates.join(", ")}, updated_at = now()
      WHERE id = $${idx}
      RETURNING *
    `;

    const res = await query(updateSql, values);
    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Site installation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /api/v1/sites/:id] Error updating site:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
