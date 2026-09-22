import React from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSitesForOrg } from "@/lib/energy/site-service";
import { syncUserAndOrgFromClerk } from "@/lib/energy/clerk-sync";
import { FleetCockpitView } from "@/components/dashboard/fleet-cockpit-view";

export default async function HomePage() {
  const user = await currentUser();

  // Synchronize authenticated user and organization from Clerk to Supabase
  const { user: dbUser, org: dbOrg, clerkOrgId, role } = await syncUserAndOrgFromClerk();

  // Fetch initial sites on server for zero-flicker SSR hydration
  const dbSites = await getSitesForOrg(clerkOrgId);

  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Welcome & Session Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />

          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Authenticated Operator Session
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40 text-[10px] font-mono font-bold uppercase">
                {role.replace("org:", "").toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Welcome back,{" "}
              <span className="text-[#FF2A85]">
                {dbUser?.first_name || user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Engineer"}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-2">
              <span className="text-white font-semibold">{dbOrg?.name || "iRasus Technologies"}</span>
              <span className="text-slate-600">•</span>
              <span>Fleet Dispatch & Substation Telemetry Dashboard</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500 font-mono text-[10px]">ID: {clerkOrgId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/design-system">
              <Button variant="secondary" size="sm">
                Design System
              </Button>
            </Link>
            <Button variant="primary" size="sm">
              <Plus className="size-3.5" />
              Add Solar / BESS Site
            </Button>
          </div>
        </div>

        {/* Fleet Cockpit View connected to client hooks and Network-visible API */}
        <FleetCockpitView initialSites={dbSites} />
      </div>
    </NeonAppShell>
  );
}
