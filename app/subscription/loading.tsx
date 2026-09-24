import { NeonAppShell } from "@/components/layout/neon-app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionLoading() {
  return (
    <NeonAppShell>
      <div className="space-y-6 pb-12">
        {/* Page header card */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0D13] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85]/20 to-transparent" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-7 w-64" />
            </div>
            <Skeleton className="h-3 w-96 mt-0.5" />
          </div>
        </div>

        {/* Current plan badge */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* 3 Tier plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Starter", "Pro Commercial", "Utility Enterprise"].map((tier) => (
            <div
              key={tier}
              className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-6 space-y-5 flex flex-col"
            >
              {/* Tier header */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <Skeleton className="h-10 w-28 font-mono" />
                <Skeleton className="h-3 w-20" />
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Feature list */}
              <div className="space-y-2.5 flex-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-full shrink-0" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <Skeleton className="h-12 w-full rounded-xl mt-auto" />
            </div>
          ))}
        </div>

        {/* Site license table */}
        <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-7 w-28 rounded-lg" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-3 border-b border-white/[0.05]"
              >
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </NeonAppShell>
  );
}
