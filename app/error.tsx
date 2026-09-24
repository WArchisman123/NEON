"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[NEON] Global error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,23,68,0.05) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-2xl bg-[#0B0D13] border border-[#FF1744]/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,23,68,0.2)]">
            <AlertTriangle className="size-8 text-[#FF1744]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-white tracking-tight">
          System Fault Detected
        </h1>
        <p className="mt-1 text-sm text-slate-400 font-mono">
          An unexpected runtime error occurred in the NEON Energy platform.
        </p>

        {/* Error message */}
        {error.message && (
          <div className="mt-6 text-left rounded-xl bg-[#0B0D13] border border-[#FF1744]/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#FF1744] mb-2">
              Error Message
            </p>
            <p className="text-xs font-mono text-slate-300 break-words leading-relaxed">
              {error.message}
            </p>
          </div>
        )}

        {/* Vercel digest */}
        {error.digest && (
          <div className="mt-3 text-left rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
              Error Digest (for support)
            </p>
            <p className="text-xs font-mono text-slate-500 break-all">
              {error.digest}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold font-mono uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(255,42,133,0.4)] border border-[#FF2A85]/60"
          >
            <RotateCcw className="size-4" />
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#0B0D13] hover:bg-white/[0.05] text-slate-300 hover:text-white font-bold font-mono uppercase tracking-wider text-sm transition-all border border-white/[0.08]"
          >
            ← Fleet Cockpit
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-[11px] font-mono text-slate-600 uppercase tracking-widest">
          NEON ENERGY · Industrial BESS &amp; Solar Platform
        </p>
      </div>
    </div>
  );
}
