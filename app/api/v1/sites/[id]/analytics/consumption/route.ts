import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getOrCreateOrg,
  getSiteDetails,
  getSiteHourlyAnalytics,
} from "@/lib/energy/site-service";
import { calculateAnalyticsSummary } from "@/lib/energy/analytics-engine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const user = await currentUser();
    const { orgId, orgSlug } = await auth();

    const effectiveOrgId = orgId || `user-org-${user?.id || "default"}`;
    const orgName =
      orgSlug || (user?.firstName ? `${user.firstName}'s Energy Fleet` : "Apex Clean Energy");

    await getOrCreateOrg(effectiveOrgId, orgName);

    const siteData = await getSiteDetails(effectiveOrgId, siteId);
    if (!siteData) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 }
      );
    }

    const { site } = siteData;
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") as "today" | "7d" | "30d") || "today";

    const hourlyTelemetry = await getSiteHourlyAnalytics(site.id, range);
    const summary = calculateAnalyticsSummary(hourlyTelemetry, site);

    const series = hourlyTelemetry.map((row) => ({
      timestamp: row.bucket_timestamp,
      solarKwh: row.solar_energy_kwh || row.avg_solar_kw || 0,
      bessDischargeKwh: row.bess_discharge_kwh || (row.avg_bess_kw > 0 ? row.avg_bess_kw : 0),
      bessChargeKwh: row.bess_charge_kwh || (row.avg_bess_kw < 0 ? Math.abs(row.avg_bess_kw) : 0),
      loadKwh: row.load_energy_kwh || row.avg_load_kw || 0,
      gridImportKwh: row.grid_import_kwh || 0,
      gridExportKwh: row.grid_export_kwh || 0,
      dgKwh: row.dg_energy_kwh || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        siteId: site.id,
        interval: range === "today" ? "15m" : "1h",
        series,
        aggregates: {
          totalSolarYieldKwh: summary.totalSolarKwh,
          totalLoadConsumedKwh: summary.totalLoadKwh,
          solarSelfConsumptionPct: summary.solarSelfConsumptionPct,
          bessRoundTripEfficiencyPct: summary.bessRtePct,
          totalCo2AbatedKg: summary.co2AbatedKg,
        },
      },
    });
  } catch (error) {
    console.error("[api/v1/sites/:id/analytics/consumption] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch consumption analytics" },
      { status: 500 }
    );
  }
}
