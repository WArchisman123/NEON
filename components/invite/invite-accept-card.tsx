"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteAcceptCardProps {
  orgId: string;
  orgName: string;
  role: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  isAlreadyMember: boolean;
}

export function InviteAcceptCard({
  orgId,
  orgName,
  role,
  token,
  user,
  isAlreadyMember,
}: InviteAcceptCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(isAlreadyMember);

  const formattedRole =
    role === "org:admin" ? "Organization Admin" : "Site Engineer (Member)";

  async function handleAccept() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/org/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, role, token }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to join organization.");
      }

      setAccepted(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-[#0B0D13] border border-white/[0.1] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl">
      {/* Top glowing accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent" />

      {/* Header icon */}
      <div className="flex justify-center mb-6">
        <div className="size-16 rounded-2xl bg-[#121622] border border-[#FF2A85]/30 flex items-center justify-center shadow-[0_0_25px_rgba(255,42,133,0.3)]">
          <span className="text-2xl">⚡</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2A85]/10 border border-[#FF2A85]/30 text-[#FF2A85] text-xs font-mono font-semibold uppercase tracking-wider">
          <ShieldCheck className="size-3.5" />
          <span>Organization Invitation</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
          Join <span className="text-[#FF2A85]">{orgName}</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 font-mono">
          You have been invited to collaborate as{" "}
          <span className="text-white font-semibold">{formattedRole}</span>.
        </p>
      </div>

      {/* Target Organization Details Box */}
      <div className="mt-6 p-4 rounded-xl bg-[#121622] border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Organization:</span>
          <span className="text-white font-semibold font-mono">{orgName}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Designated Role:</span>
          <span className="px-2 py-0.5 rounded bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40 text-[10px] font-mono font-bold uppercase">
            {role.replace("org:", "").toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Telemetry Scope:</span>
          <span className="text-slate-300 font-mono text-[11px]">Solar &amp; BESS Fleets</span>
        </div>
        {user && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
            <span className="text-slate-400 font-medium">Signed in as:</span>
            <span className="text-slate-200 font-mono text-[11px] truncate max-w-[200px]">
              {user.email}
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-[#FF1744]/10 border border-[#FF1744]/30 flex items-center gap-2 text-xs text-[#FF1744] font-mono">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success state */}
      {accepted && (
        <div className="mt-6 p-4 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-[#00E676] font-bold text-sm">
            <CheckCircle2 className="size-4" />
            <span>Welcome to {orgName}!</span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Redirecting to fleet dispatch dashboard...
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6">
        {!user ? (
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(
              `/invite?orgId=${orgId}&role=${role}&token=${token}`
            )}`}
            className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold font-mono uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(255,42,133,0.4)] border border-[#FF2A85]/60"
          >
            <span>Sign In to Accept Invitation</span>
            <ArrowRight className="size-4" />
          </Link>
        ) : accepted ? (
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black font-bold font-mono uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(0,230,118,0.4)]"
          >
            <span>Enter Fleet Cockpit</span>
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold font-mono uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(255,42,133,0.4)] border border-[#FF2A85]/60 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Joining Organization...</span>
              </>
            ) : (
              <>
                <span>Accept &amp; Enter Fleet</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        )}
      </div>

      <p className="mt-6 text-[11px] font-mono text-center text-slate-500">
        NEON ENERGY · Multi-Tenant Industrial Renewable Platform
      </p>
    </div>
  );
}
