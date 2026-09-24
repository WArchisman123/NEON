import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function MaintenanceLoading() {
  return (
    <NeonAppShell>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-7 w-96" />
          </div>
        </div>

        {/* Active tickets strip */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#121622] border border-white/[0.06] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-7 w-24 rounded-lg" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site & asset filter */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <div className="ml-auto">
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
        </div>

        {/* Service catalog grid — 4 cards */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4"
              >
                {/* Icon + badge */}
                <div className="flex items-start justify-between">
                  <Skeleton className="size-10 rounded-xl" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                {/* Title */}
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
                {/* Duration + price */}
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16 font-mono" />
                </div>
                {/* CTA */}
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </NeonAppShell>
  );
}
