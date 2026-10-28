import React from "react";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { SingleSiteEmsView } from "@/components/site-detail/single-site-ems-view";
import {
  getOrCreateOrg,
  getSiteDetails,
  getSiteHourlyAnalytics,
  getSitesForOrg,
} from "@/lib/energy/site-service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SiteDetailPage({ params }: Props) {
  const { id: siteId } = await params;
  const user = await currentUser();
  const { orgId, orgSlug } = await auth();

  const effectiveOrgId = orgId || `user-org-${user?.id || "default"}`;
  const orgName =
    orgSlug || (user?.firstName ? `${user.firstName}'s Energy Fleet` : "Apex Clean Energy");

  await getOrCreateOrg(effectiveOrgId, orgName);

  const [siteData, sites] = await Promise.all([
    getSiteDetails(effectiveOrgId, siteId),
    getSitesForOrg(effectiveOrgId),
  ]);

  if (!siteData) {
    return notFound();
  }

  const { site, devices } = siteData;
  const hourlyTelemetry = await getSiteHourlyAnalytics(site.id, "30d");

  return (
    <NeonAppShell sites={sites} activeSiteId={site.id}>
      <SingleSiteEmsView
        site={site}
        sites={sites}
        devices={devices}
        hourlyTelemetry={hourlyTelemetry}
      />
    </NeonAppShell>
  );
}
