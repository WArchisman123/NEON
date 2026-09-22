import { NextResponse } from "next/server";
import { getMaintenanceServices } from "@/lib/energy/maintenance-service";
import { MaintenanceAssetType } from "@/lib/energy/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/maintenance/services
 * Returns standardized maintenance packages strictly for Solar PV and BESS.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetType = searchParams.get("assetType") as MaintenanceAssetType | null;

    if (assetType && assetType !== "solar_pv" && assetType !== "bess") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid assetType filter. Only 'solar_pv' and 'bess' are supported.",
        },
        { status: 400 }
      );
    }

    const services = await getMaintenanceServices(assetType || undefined);

    return NextResponse.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("[api:maintenance/services:GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
