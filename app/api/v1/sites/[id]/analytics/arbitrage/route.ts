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
    const range = (searchParams.get("range") as "today" | "7d" | "30d") || "30d";

    const hourlyTelemetry = await getSiteHourlyAnalytics(site.id, range);
    const summary = calculateAnalyticsSummary(hourlyTelemetry, site);

    return NextResponse.json({
      success: true,
      data: {
        siteId: site.id,
        tariff: {
          peakRatePerKwh: site.peak_tariff_rate || 0.18,
          offpeakRatePerKwh: site.offpeak_tariff_rate || 0.07,
          peakWindow: "18:00 - 22:00",
        },
        arbitrage: {
          arbitrageRevenueEarned: summary.touArbitrageSavings,
          bessChargedOffpeakKwh: summary.bessChargeKwh,
          bessDischargedPeakKwh: summary.bessDischargeKwh,
        },
        peakDemandShaving: {
          contractedMdKva: site.contracted_demand_kva || 800,
          peakLoadRecordedKw: summary.peakDemandRecordedKw,
          peakShavedKw: summary.peakDemandShavedKw,
          avoidedMonthlyDemandPenalties: summary.avoidedMdPenalties,
        },
      },
    });
  } catch (error) {
    console.error("[api/v1/sites/:id/analytics/arbitrage] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch arbitrage analytics" },
      { status: 500 }
    );
  }
}
