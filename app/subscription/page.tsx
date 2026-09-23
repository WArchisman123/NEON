import React from "react";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { syncUserAndOrgFromClerk } from "@/lib/energy/clerk-sync";
import { getSitesForOrg } from "@/lib/energy/site-service";
import { SubscriptionView } from "@/components/subscription/subscription-view";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Subscription & Licensing | NEON ENERGY",
  description: "Manage renewable site telemetry subscriptions, capacity license tiers, and renewal billing.",
};

export default async function SubscriptionPage() {
  // Synchronize authenticated user and organization from Clerk to Supabase
  const { org: dbOrg, clerkOrgId } = await syncUserAndOrgFromClerk();

  // Fetch all sites for the authenticated organization
  const dbSites = await getSitesForOrg(clerkOrgId);

  return (
    <NeonAppShell>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                SaaS Monetization & Fleet Licensing
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
              <CreditCard className="size-6 text-[#FF2A85]" />
              <span>Subscription & Site Licenses</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Review telemetry authorization statuses, capacity tier limits, and manage renewals across your fleet.
            </p>
          </div>
        </div>

        {/* Subscription View Matrix & Renewal Engine */}
        <SubscriptionView
          initialSites={dbSites}
          organization={dbOrg}
          clerkOrgId={clerkOrgId}
        />
      </div>
    </NeonAppShell>
  );
}
