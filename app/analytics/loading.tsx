import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-52" />
            <Skeleton className="h-7 w-80" />
          </div>
        </div>

        {/* Site selector + range tabs */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-36 rounded-lg" />
            ))}
          </div>
          <div className="flex gap-2">
            {["Today", "7d", "30d", "YTD"].map((label) => (
              <Skeleton key={label} className="h-7 w-14 rounded-md" />
            ))}
            <Skeleton className="h-7 w-28 rounded-md" />
          </div>
        </div>

        {/* KPI summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 space-y-3"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32 font-mono" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          ))}
        </div>

        {/* Main chart area */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-7 w-32 rounded-lg" />
          </div>
          {/* Chart legend */}
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="size-2.5 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          {/* Chart body */}
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        {/* Bottom analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-3"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-32 font-mono" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </NeonAppShell>
  );
}
