"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Zap, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SiteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[NEON] Site error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-14 rounded-2xl bg-[#0B0D13] border border-[#FF1744]/30 flex items-center justify-center shadow-[0_0_24px_rgba(255,23,68,0.2)]">
            <Zap className="size-7 text-[#FF1744]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-white tracking-tight">
          Telemetry Feed Error
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-mono leading-relaxed">
          Unable to load site data. The BESS or solar telemetry stream may be
          unavailable or the site record could not be found.
        </p>

        {/* Error detail */}
        {error.message && (
          <div className="mt-5 text-left rounded-xl bg-[#0B0D13] border border-[#FF1744]/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#FF1744] mb-1.5">
              Fault Detail
            </p>
            <p className="text-xs font-mono text-slate-400 break-words leading-relaxed">
              {error.message}
            </p>
          </div>
        )}

        {error.digest && (
          <p className="mt-3 text-[10px] font-mono text-slate-600">
            digest: {error.digest}
          </p>
        )}

        {/* Divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold font-mono uppercase tracking-wider text-sm transition-all shadow-[0_0_16px_rgba(255,42,133,0.4)] border border-[#FF2A85]/60"
          >
            <RotateCcw className="size-4" />
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-[#0B0D13] hover:bg-white/[0.05] text-slate-300 hover:text-white font-bold font-mono uppercase tracking-wider text-sm transition-all border border-white/[0.08]"
          >
            ← Back to Fleet
          </Link>
        </div>
      </div>
    </div>
  );
}
