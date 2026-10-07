"use client";

import React from "react";
import Link from "next/link";
import { UserButton, OrganizationSwitcher, useAuth, useOrganization } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Bell, UserPlus } from "lucide-react";
import { InviteTeamDialog } from "@/components/layout/invite-team-dialog";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTheme } from "@/components/theme/theme-provider";

const MASTER_ORG_ID = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";

export function Topbar() {
  const { orgId } = useAuth();
  const { organization } = useOrganization();
  const { resolvedTheme } = useTheme();
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  const isDark = resolvedTheme !== "light";

  // Organization switcher is shown ONLY for the master admin org (iRasus Technologies).
  // For all other tenant users, it is completely hidden and replaced with a static badge.
  const isMasterOrg = orgId === MASTER_ORG_ID;

  const orgSwitcherAppearance = React.useMemo(
    () => ({
      baseTheme: isDark ? dark : undefined,
      theme: isDark ? dark : undefined,
      variables: {
        colorPrimary: "#FF2A85",
        colorPrimaryForeground: "#FFFFFF",
        colorBackground: isDark ? "#0B0D13" : "#FFFFFF",
        colorForeground: isDark ? "#F8FAFC" : "#0B0F19",
        colorNeutral: isDark ? "#F8FAFC" : "#0B0F19",
        colorMutedForeground: isDark ? "#94A3B8" : "#475569",
        colorInput: isDark ? "#121622" : "#EAEFF8",
        colorBorder: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.12)",
        borderRadius: "0.5rem",
      },
      elements: {
        organizationSwitcherTrigger:
          "bg-theme-elevated border border-theme-subtle hover:border-[#FF2A85]/40 text-theme-primary text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-lg transition-all min-h-[36px]",
        organizationPreviewTextContainer:
          "text-theme-primary text-xs font-semibold max-w-[120px] sm:max-w-[200px] truncate",
        organizationPreviewMainIdentifier:
          "text-theme-primary font-semibold text-xs",
        organizationPreviewSecondaryIdentifier:
          "text-theme-secondary text-[11px]",
        organizationSwitcherPopoverCard:
          "bg-theme-card border border-theme-subtle shadow-2xl text-theme-primary",
        organizationSwitcherPopoverActionButton:
          "text-theme-primary hover:bg-theme-elevated transition-colors",
        organizationSwitcherPopoverActionButtonText:
          "text-theme-primary font-medium text-xs",
        organizationSwitcherPopoverActionButtonIcon:
          "text-theme-secondary",
        organizationSwitcherPopoverFooter:
          "border-t border-theme-subtle bg-theme-elevated/40",
        organizationListItem:
          "hover:bg-theme-elevated transition-colors text-theme-primary",
        organizationListItemButton:
          "text-theme-primary hover:bg-theme-elevated transition-colors",
        userPreviewMainIdentifier:
          "text-theme-primary font-semibold",
        userPreviewSecondaryIdentifier:
          "text-theme-secondary",
      },
    }),
    [isDark]
  );

  const userButtonAppearance = React.useMemo(
    () => ({
      baseTheme: isDark ? dark : undefined,
      theme: isDark ? dark : undefined,
      variables: {
        colorPrimary: "#FF2A85",
        colorPrimaryForeground: "#FFFFFF",
        colorBackground: isDark ? "#0B0D13" : "#FFFFFF",
        colorForeground: isDark ? "#F8FAFC" : "#0B0F19",
        colorNeutral: isDark ? "#F8FAFC" : "#0B0F19",
        colorMutedForeground: isDark ? "#94A3B8" : "#475569",
        colorInput: isDark ? "#121622" : "#EAEFF8",
        colorBorder: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.12)",
        borderRadius: "0.5rem",
      },
      elements: {
        userButtonAvatarBox:
          "size-8 rounded-full border border-[#FF2A85]/40 shadow-[0_0_10px_rgba(255,42,133,0.3)]",
        userButtonPopoverCard:
          "bg-theme-card border border-theme-subtle shadow-2xl text-theme-primary",
        userButtonPopoverActionButton:
          "text-theme-primary hover:bg-theme-elevated transition-colors",
        userButtonPopoverActionButtonText:
          "text-theme-primary font-medium",
        userButtonPopoverActionButtonIcon:
          "text-theme-secondary group-hover:text-theme-primary",
        userButtonPopoverFooter:
          "border-t border-theme-subtle bg-theme-elevated/40",
        userPreviewMainIdentifier:
          "text-theme-primary font-semibold",
        userPreviewSecondaryIdentifier:
          "text-theme-secondary",
      },
    }),
    [isDark]
  );

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 w-full bg-theme-card/90 backdrop-blur-md border-b border-theme-subtle px-3 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Brand + Clerk Organization Switcher */}
      <div className="flex items-center gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-8 sm:size-9 rounded-lg bg-gradient-to-br from-[#FF2A85] to-[#B00055] flex items-center justify-center text-white font-black text-base sm:text-lg shadow-[0_0_15px_rgba(255,42,133,0.5)] group-hover:shadow-[0_0_22px_rgba(255,42,133,0.7)] transition-all">
            ⚡
          </div>
          <span className="font-black tracking-wider text-base sm:text-lg text-theme-primary">
            NEON<span className="text-[#FF2A85]">.ENERGY</span>
          </span>
        </Link>

        {/* Organization Switcher (Master Org Only) or Static Tenant Badge */}
        <div className="flex items-center">
          {isMasterOrg ? (
            <OrganizationSwitcher
              hidePersonal={false}
              appearance={orgSwitcherAppearance}
            />
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-theme-elevated border border-theme-subtle text-xs font-semibold text-theme-secondary">
              <span className="size-1.5 rounded-full bg-[#00E676]" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate">
                {organization?.name || "Client Portal"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle, Invite, Alerts & Clerk UserButton */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dual-Theme Switcher */}
        <ThemeToggle />

        {/* Invite Team Action Button */}
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FF2A85]/15 hover:bg-[#FF2A85]/25 border border-[#FF2A85]/40 hover:border-[#FF2A85] text-xs font-mono font-bold text-theme-primary shadow-[0_0_12px_rgba(255,42,133,0.3)] transition-all cursor-pointer select-none min-h-[36px]"
          title="Invite Team & Generate Org Link"
        >
          <UserPlus className="size-3.5 text-[#FF2A85]" />
          <span className="hidden sm:inline">Invite Team</span>
        </button>

        {/* Alarm Alert Bell with Glowing Badge */}
        <button
          type="button"
          aria-label="View system alarms"
          className="relative p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-[#FF2A85] rounded-full shadow-[0_0_8px_#FF2A85]" />
        </button>

        {/* Clerk User Button & Subscription Tier Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-theme-subtle">
          <UserButton appearance={userButtonAppearance} />
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
