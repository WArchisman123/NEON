import React from "react";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { MaintenanceHubView } from "@/components/maintenance/maintenance-hub-view";
import {
  getOrCreateOrg,
  getSitesForOrg,
} from "@/lib/energy/site-service";
import {
  getMaintenanceServices,
  getMaintenanceTickets,
  seedDemoTicketsIfEmpty,
} from "@/lib/energy/maintenance-service";

interface MaintenancePageProps {
  searchParams: Promise<{ siteId?: string }>;
}

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const { siteId } = await searchParams;
  const user = await currentUser();
  const { orgId, orgSlug } = await auth();

  const effectiveOrgId = orgId || `user-org-${user?.id || "default"}`;
  const orgName =
    orgSlug || (user?.firstName ? `${user.firstName}'s Energy Fleet` : "Apex Clean Energy");

  const org = await getOrCreateOrg(effectiveOrgId, orgName);
  const sites = await getSitesForOrg(effectiveOrgId);

  if (!sites || sites.length === 0) {
    return notFound();
  }

  // Pre-seed demo tickets if none exist for this organization
  await seedDemoTicketsIfEmpty(org.id, sites[0].id);

  // Fetch active Solar & BESS services and tickets
  const services = await getMaintenanceServices();
  const tickets = await getMaintenanceTickets(org.id);

  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Breadcrumb & Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#FF2A85] font-bold">
              Feature Spec 4 &bull; Specialized O&amp;M Service Marketplace
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Certified Solar &amp; BESS Maintenance Hub
            </h1>
          </div>
        </div>

        {/* Master Maintenance View Container */}
        <MaintenanceHubView
          sites={sites}
          services={services}
          initialTickets={tickets}
          initialSiteId={siteId}
        />
      </div>
    </NeonAppShell>
  );
}
