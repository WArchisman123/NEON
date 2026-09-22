import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#FF2A85] selection:text-white">
      {/* Ambient Cyber Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-[#FF2A85]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 size-80 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center relative z-10">
        <Link href="/" className="flex items-center gap-2.5 mb-2 group">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#FF2A85] to-[#B00055] flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(255,42,133,0.5)] group-hover:shadow-[0_0_28px_rgba(255,42,133,0.7)] transition-all">
            ⚡
          </div>
          <span className="font-black tracking-wider text-xl sm:text-2xl text-white">
            NEON<span className="text-[#FF2A85]">.ENERGY</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400 max-w-sm">
          Register New Renewable Asset & Microgrid Organization
        </p>
      </div>

      {/* Clerk SignUp Component */}
      <div className="relative z-10 w-full max-w-md flex justify-center">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
        />
      </div>

      {/* Security Footer Pill */}
      <div className="mt-8 relative z-10 flex items-center gap-2 text-[11px] font-mono text-slate-500">
        <ShieldCheck className="size-3.5 text-[#00E676]" />
        <span>Hardware-Encrypted SCADA & Telemetry Access</span>
      </div>
    </div>
  );
}
