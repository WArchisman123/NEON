import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function SiteDetailLoading() {
  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Breadcrumb + site header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-24" />
              <span className="text-slate-700">/</span>
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Skeleton className="h-7 w-80" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>

        {/* Energy flow canvas placeholder */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-6 w-40 rounded-full" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>

        {/* Subsystem telemetry tabs */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-1 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
          ))}
        </div>

        {/* Telemetry stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 space-y-2"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-28 font-mono" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>

        {/* Historic chart area */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <div className="flex gap-2">
              {["24h", "7d", "30d"].map((r) => (
                <Skeleton key={r} className="h-7 w-12 rounded-md" />
              ))}
              <Skeleton className="h-7 w-28 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </NeonAppShell>
  );
}
