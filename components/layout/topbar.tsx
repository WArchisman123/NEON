"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton, OrganizationSwitcher, useAuth, useOrganization } from "@clerk/nextjs";
import { Bell, Search, UserPlus } from "lucide-react";
import { InviteTeamDialog } from "@/components/layout/invite-team-dialog";

const MASTER_ORG_ID = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";

export function Topbar() {
  const router = useRouter();
  const { orgId } = useAuth();
  const { organization } = useOrganization();
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  // Organization switcher is shown ONLY for the master admin org (iRasus Technologies).
  // For all other tenant users, it is completely hidden and replaced with a static badge.
  const isMasterOrg = orgId === MASTER_ORG_ID;

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 w-full bg-[#0B0D13]/90 backdrop-blur-md border-b border-white/[0.08] px-3 sm:px-6 flex items-center justify-between">
      {/* Left: Brand + Clerk Organization Switcher */}
      <div className="flex items-center gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-8 sm:size-9 rounded-lg bg-gradient-to-br from-[#FF2A85] to-[#B00055] flex items-center justify-center text-white font-black text-base sm:text-lg shadow-[0_0_15px_rgba(255,42,133,0.5)] group-hover:shadow-[0_0_22px_rgba(255,42,133,0.7)] transition-all">
            ⚡
          </div>
          <span className="font-black tracking-wider text-base sm:text-lg text-white">
            NEON<span className="text-[#FF2A85]">.ENERGY</span>
          </span>
        </Link>

        {/* Organization Switcher (Master Org Only) or Static Tenant Badge */}
        <div className="flex items-center">
          {isMasterOrg ? (
            <OrganizationSwitcher
              hidePersonal={false}
              appearance={{
                elements: {
                  organizationSwitcherTrigger:
                    "bg-[#121622] border border-white/[0.08] hover:border-[#FF2A85]/40 text-slate-200 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-lg transition-all min-h-[36px]",
                  organizationPreviewTextContainer:
                    "text-slate-200 text-xs font-semibold max-w-[120px] sm:max-w-[200px] truncate",
                  organizationSwitcherPopoverCard:
                    "bg-[#0B0D13] border border-white/[0.1] shadow-2xl text-slate-100",
                },
              }}
            />
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121622] border border-white/[0.08] text-xs font-semibold text-slate-300">
              <span className="size-1.5 rounded-full bg-[#00E676]" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate">
                {organization?.name || "Client Portal"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Search, Alerts & Clerk UserButton */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Shortcut */}
        {/* <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              const searchInput = document.getElementById("fleet-search-input");
              if (searchInput) {
                searchInput.focus();
              } else {
                router.push("/?focusSearch=true");
              }
            }
          }}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#121622] border border-white/[0.08] text-xs font-mono text-slate-400 hover:text-white hover:border-white/[0.2] transition-colors"
        >
          <Search className="size-3.5 text-slate-400" />
          <span>Search telemetry...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-slate-400 border border-white/[0.1]">
            ⌘K
          </kbd>
        </button> */}

        {/* Invite Team Action Button */}
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FF2A85]/15 hover:bg-[#FF2A85]/25 border border-[#FF2A85]/40 hover:border-[#FF2A85] text-xs font-mono font-bold text-white shadow-[0_0_12px_rgba(255,42,133,0.3)] transition-all cursor-pointer select-none min-h-[36px]"
          title="Invite Team & Generate Org Link"
        >
          <UserPlus className="size-3.5 text-[#FF2A85]" />
          <span className="hidden sm:inline">Invite Team</span>
        </button>

        {/* Alarm Alert Bell with Glowing Badge */}
        <button
          type="button"
          aria-label="View system alarms"
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-[#FF2A85] rounded-full shadow-[0_0_8px_#FF2A85]" />
        </button>

        {/* Clerk User Button & Subscription Tier Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox:
                  "size-8 rounded-full border border-[#FF2A85]/40 shadow-[0_0_10px_rgba(255,42,133,0.3)]",
                userButtonPopoverCard:
                  "bg-[#0B0D13] border border-white/[0.1] shadow-2xl text-slate-100",
              },
            }}
          />
          <Link
            href="/subscription"
            title="Manage Subscriptions & Site Licenses"
            className="hidden md:inline-flex px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40 shadow-[0_0_8px_rgba(255,42,133,0.3)] hover:bg-[#FF2A85]/30 hover:shadow-[0_0_14px_rgba(255,42,133,0.5)] transition-all cursor-pointer"
          >
            PRO
          </Link>
        </div>
      </div>

      {/* Org-Scoped Invite Modal Dialog */}
      <InviteTeamDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        activeOrgId={orgId}
      />
    </header>
  );
}
