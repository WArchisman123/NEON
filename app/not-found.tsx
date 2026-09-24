import Link from "next/link";
import { Radio } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Scan-line background effect */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .scanline {
          animation: scanline 4s linear infinite;
        }
      `}</style>
      <div
        className="scanline pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85]/20 to-transparent"
        aria-hidden="true"
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,42,133,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-2xl bg-[#0B0D13] border border-[#FF2A85]/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,42,133,0.2)]">
            <Radio className="size-8 text-[#FF2A85]" />
          </div>
        </div>

        {/* 404 numeral */}
        <p
          className="font-mono font-black text-[96px] leading-none tracking-tighter"
          style={{
            color: "#FF2A85",
            textShadow:
              "0 0 30px rgba(255,42,133,0.6), 0 0 60px rgba(255,42,133,0.3)",
          }}
        >
          404
        </p>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-black text-white tracking-tight">
          Signal Lost
        </h1>
        <p className="mt-1 text-base font-semibold text-slate-300">
          Page Not Found
        </p>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-500 font-mono leading-relaxed">
          This route doesn&apos;t exist in the NEON Energy grid. The telemetry
          node you&apos;re looking for may have been decommissioned or moved.
        </p>

        {/* Divider */}
        <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold font-mono uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(255,42,133,0.4)] border border-[#FF2A85]/60 min-w-[200px]"
          >
            ← Return to Fleet Cockpit
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-[11px] font-mono text-slate-600 uppercase tracking-widest">
          NEON ENERGY · Industrial BESS &amp; Solar Platform
        </p>
      </div>
    </div>
  );
}
