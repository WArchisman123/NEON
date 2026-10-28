import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { getSitesForOrg, getSiteDetails, getSiteHourlyAnalytics } from "@/lib/energy/site-service";
import { syncUserAndOrgFromClerk } from "@/lib/energy/clerk-sync";
import { FleetCockpitView } from "@/components/dashboard/fleet-cockpit-view";
import { SingleSiteEmsView } from "@/components/site-detail/single-site-ems-view";

interface HomePageProps {
  searchParams?: Promise<{ site?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await currentUser();
  const params = searchParams ? await searchParams : {};
  const requestedSiteId = params.site;

  // Synchronize authenticated user and organization from Clerk to Supabase
  const { user: dbUser, org: dbOrg, clerkOrgId, role } = await syncUserAndOrgFromClerk();

  // Fetch all sites for the organization
  const dbSites = await getSitesForOrg(clerkOrgId);

  const userName =
    dbUser?.first_name ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "Engineer";
  const orgName = dbOrg?.name || "iRasus Technologies";

  // If no sites exist yet, render FleetCockpitView with onboarding/Add Site flow
  if (!dbSites || dbSites.length === 0) {
    return (
      <NeonAppShell sites={[]}>
        <div className="space-y-6">
          <FleetCockpitView
            initialSites={[]}
            userName={userName}
            orgName={orgName}
            role={role}
            clerkOrgId={clerkOrgId}
          />
        </div>
      </NeonAppShell>
    );
  }

  // Determine active site: specified by searchParam or default to first site
  const activeSite =
    dbSites.find((s) => s.id === requestedSiteId) || dbSites[0];

  // Fetch devices and hourly telemetry for active site
  const siteDetails = await getSiteDetails(clerkOrgId, activeSite.id);
  const devices = siteDetails?.devices || [];
  const hourlyTelemetry = await getSiteHourlyAnalytics(activeSite.id, "30d");

  return (
    <NeonAppShell sites={dbSites} activeSiteId={activeSite.id}>
      <SingleSiteEmsView
        site={activeSite}
        sites={dbSites}
        devices={devices}
        hourlyTelemetry={hourlyTelemetry}
      />
    </NeonAppShell>
  );
}
