import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateOrg, getSiteDetails } from "@/lib/energy/site-service";
import { fetchSiteWeatherForecast } from "@/lib/weather/open-meteo";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: siteId } = await context.params;
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

    const weatherForecast = await fetchSiteWeatherForecast({
      siteId: site.id,
      locationCity: site.location_city,
      locationState: site.location_state,
      solarCapacityKwp: site.solar_capacity_kwp || 800,
      latitude: site.latitude,
      longitude: site.longitude,
    });

    return NextResponse.json({
      success: true,
      data: weatherForecast,
    });
  } catch (error: unknown) {
    console.error("Error in weather API route:", error);
    const message = error instanceof Error ? error.message : "Failed to retrieve site weather";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
