import React from "react";
import Link from "next/link";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { verifyInviteToken } from "@/lib/energy/invite-service";
import { InviteAcceptCard } from "@/components/invite/invite-accept-card";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface InvitePageProps {
  searchParams: Promise<{
    orgId?: string;
    role?: string;
    token?: string;
  }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { orgId, role = "org:member", token } = await searchParams;
  const user = await currentUser();

  // Validate parameters and cryptographic HMAC token
  const isValidToken = orgId && token ? verifyInviteToken(orgId, role, token) : false;

  let orgName = "Energy Fleet";
  let isAlreadyMember = false;

  if (isValidToken && orgId) {
    try {
      const client = await clerkClient();
      const org = await client.organizations.getOrganization({ organizationId: orgId });
      if (org) {
        orgName = org.name;
      }

      if (user) {
        const memberships = await client.users.getOrganizationMembershipList({
          userId: user.id,
        });
        isAlreadyMember = memberships.data.some((m) => m.organization.id === orgId);
      }
    } catch (err) {
      console.error("[InvitePage] Error loading organization details:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,42,133,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative scan-line */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF2A85]/20 to-transparent" />

      <div className="relative z-10 w-full flex flex-col items-center">
        {!isValidToken || !orgId ? (
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#0B0D13] border border-[#FF1744]/30 shadow-[0_0_40px_rgba(255,23,68,0.15)] text-center space-y-4">
            <div className="size-14 rounded-2xl bg-[#121622] border border-[#FF1744]/40 flex items-center justify-center mx-auto text-[#FF1744]">
              <AlertTriangle className="size-7" />
            </div>

            <h1 className="text-xl font-bold text-white">Invalid or Expired Invite Link</h1>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              This invitation link is missing required parameters or has an invalid cryptographic token.
              Please ask your organization administrator to generate a fresh invite link.
            </p>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121622] border border-white/[0.1] hover:border-white/[0.2] text-xs font-mono font-semibold text-slate-300 hover:text-white transition-all"
              >
                <ArrowLeft className="size-3.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          <InviteAcceptCard
            orgId={orgId}
            orgName={orgName}
            role={role}
            token={token || ""}
            user={
              user
                ? {
                    id: user.id,
                    email: user.emailAddresses[0]?.emailAddress || "",
                    name: user.firstName || "Engineer",
                  }
                : null
            }
            isAlreadyMember={isAlreadyMember}
          />
        )}
      </div>
    </div>
  );
}
