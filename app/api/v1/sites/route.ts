import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSitesForOrg, createSiteForOrg, CreateSiteInput } from "@/lib/energy/site-service";
import { z } from "zod";

const createSiteSchema = z
  .object({
    name: z.string().min(2, "Site name must be at least 2 characters").max(100),
    locationCity: z.string().min(1, "Location city is required"),
    locationState: z.string().min(1, "Location state is required"),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    plantType: z
      .enum(["commercial_industrial", "utility_microgrid", "rooftop_hybrid"])
      .optional()
      .default("commercial_industrial"),
    solarCapacityKwp: z.number().min(0).optional().default(0),
    bessCapacityKwh: z.number().min(0).optional().default(0),
    bessPowerKw: z.number().min(0).optional().default(0),
    dgCapacityKva: z.number().min(0).optional().default(0),
    contractedDemandKva: z.number().min(0).optional().default(0),
    hasSolar: z.boolean().optional().default(true),
    hasBess: z.boolean().optional().default(true),
    hasDg: z.boolean().optional().default(false),
    hasGrid: z.boolean().optional().default(true),
    peakTariffRate: z.number().min(0).optional().default(0.18),
    offpeakTariffRate: z.number().min(0).optional().default(0.07),
  })
  .refine(
    (data) => data.hasSolar || data.hasBess || data.hasDg || data.hasGrid,
    {
      message: "At least one asset capability (Solar, BESS, DG, or Grid) must be enabled",
      path: ["hasSolar"],
    }
  );

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

/**
 * POST /api/v1/sites
 * Registers a new Solar and BESS installation under the authenticated Clerk organization.
 * Provisions initial hardware devices and telemetry snapshots automatically.
 */
export async function POST(req: NextRequest) {
  try {
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
        console.warn("[POST /api/v1/sites] Error fetching memberships:", err);
      }
    }

    if (!effectiveOrgId) {
      effectiveOrgId = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";
    }

    const body = await req.json();
    const parseResult = createSiteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const val = parseResult.data;
    const input: CreateSiteInput = {
      name: val.name,
      location_city: val.locationCity,
      location_state: val.locationState,
      latitude: val.latitude,
      longitude: val.longitude,
      plant_type: val.plantType,
      solar_capacity_kwp: val.solarCapacityKwp,
      bess_capacity_kwh: val.bessCapacityKwh,
      bess_power_kw: val.bessPowerKw,
      dg_capacity_kva: val.dgCapacityKva,
      contracted_demand_kva: val.contractedDemandKva,
      has_solar: val.hasSolar,
      has_bess: val.hasBess,
      has_dg: val.hasDg,
      has_grid: val.hasGrid,
      peak_tariff_rate: val.peakTariffRate,
      offpeak_tariff_rate: val.offpeakTariffRate,
    };

    const newSite = await createSiteForOrg(effectiveOrgId, input);

    return NextResponse.json(
      {
        success: true,
        message: "Site registered successfully",
        data: newSite,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/v1/sites] Error creating site:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to register site",
      },
      { status: 500 }
    );
  }
}

