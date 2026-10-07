import React from "react";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { SiteAssetNav } from "@/components/site-detail/site-asset-nav";
import { SolarSubsystemContainer } from "@/components/solar/solar-subsystem-container";
import {
  getOrCreateOrg,
  getSiteDetails,
  getSiteHourlyAnalytics,
} from "@/lib/energy/site-service";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export default async function SolarSubsystemPage({ params, searchParams }: Props) {
  const { id: siteId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab =
    typeof resolvedSearchParams?.tab === "string"
      ? resolvedSearchParams.tab
      : "overview";

  const user = await currentUser();
  const { orgId, orgSlug } = await auth();

  const effectiveOrgId = orgId || `user-org-${user?.id || "default"}`;
  const orgName =
    orgSlug || (user?.firstName ? `${user.firstName}'s Energy Fleet` : "Apex Clean Energy");

  await getOrCreateOrg(effectiveOrgId, orgName);

  const siteData = await getSiteDetails(effectiveOrgId, siteId);

  if (!siteData) {
    return notFound();
  }

  const { site, devices } = siteData;
  const hourlyTelemetry = await getSiteHourlyAnalytics(site.id, "30d");

  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Asset Switcher Bar */}
        <SiteAssetNav site={site} activeAsset="solar" />

        {/* Solar Subsystem Interactive Tabbed Container */}
        <SolarSubsystemContainer
          site={site}
          devices={devices}
          hourlyTelemetry={hourlyTelemetry}
          initialTab={initialTab}
        />
      </div>
    </NeonAppShell>
  );
}
