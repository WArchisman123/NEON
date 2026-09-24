import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Welcome banner skeleton */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85]/20 to-transparent" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
              <Skeleton className="h-7 w-72 mt-1" />
              <Skeleton className="h-3 w-96 mt-1" />
            </div>
          </div>
        </div>

        {/* Fleet aggregate strip — 5 KPI blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="size-4 rounded" />
              </div>
              <Skeleton className="h-8 w-28 font-mono" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <div className="ml-auto">
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Site cards — 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4"
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Asset badge strip */}
              <div className="flex gap-1.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-12 rounded-full" />
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.05]" />

              {/* Metric rows */}
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-20 font-mono" />
                  </div>
                ))}
              </div>

              {/* Mini flow bar */}
              <Skeleton className="h-8 w-full rounded-lg" />

              {/* CTA */}
              <Skeleton className="h-9 w-full rounded-lg mt-1" />
            </div>
          ))}
        </div>
      </div>
    </NeonAppShell>
  );
}
