import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { getSitesForOrg } from "@/lib/energy/site-service";
import { syncUserAndOrgFromClerk } from "@/lib/energy/clerk-sync";
import { FleetCockpitView } from "@/components/dashboard/fleet-cockpit-view";

export default async function FleetCockpitPage() {
  const user = await currentUser();

  // Synchronize authenticated user and organization from Clerk to Supabase
  const { user: dbUser, org: dbOrg, clerkOrgId, role } = await syncUserAndOrgFromClerk();

  // Fetch initial sites on server for zero-flicker SSR hydration
  const dbSites = await getSitesForOrg(clerkOrgId);

  const userName =
    dbUser?.first_name ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "Engineer";
  const orgName = dbOrg?.name || "iRasus Technologies";

  return (
    <NeonAppShell sites={dbSites}>
      <div className="space-y-6">
        <FleetCockpitView
          initialSites={dbSites}
          userName={userName}
          orgName={orgName}
          role={role}
          clerkOrgId={clerkOrgId}
        />
      </div>
    </NeonAppShell>
  );
}
