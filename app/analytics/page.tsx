import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { PowerConsumptionWorkspace } from "@/components/analytics/power-consumption-workspace";
import {
  getOrCreateOrg,
  getSitesForOrg,
  getSiteHourlyAnalytics,
} from "@/lib/energy/site-service";

interface Props {
  searchParams: Promise<{ siteId?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const { siteId } = await searchParams;
  const user = await currentUser();
  const { orgId, orgSlug } = await auth();

  const effectiveOrgId = orgId || `user-org-${user?.id || "default"}`;
  const orgName =
    orgSlug || (user?.firstName ? `${user.firstName}'s Energy Fleet` : "Apex Clean Energy");

  await getOrCreateOrg(effectiveOrgId, orgName);

  const sites = await getSitesForOrg(effectiveOrgId);

  if (!sites || sites.length === 0) {
    return notFound();
  }

  // Find targeted site or default to first site
  const activeSite = siteId
    ? sites.find((s) => s.id === siteId) || sites[0]
    : sites[0];

  const hourlyTelemetry = await getSiteHourlyAnalytics(activeSite.id, "30d");

  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Workspace Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#FF2A85] font-bold">
              Feature Spec 3 • Industrial Energy Balance
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Power Consumption & Historical Analytics
            </h1>
          </div>
        </div>

        {/* Master Analytics Workspace */}
        <PowerConsumptionWorkspace
          site={activeSite}
          sites={sites}
          hourlyTelemetry={hourlyTelemetry}
        />
      </div>
    </NeonAppShell>
  );
}
