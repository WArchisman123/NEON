"use client";

import { useState, useEffect, useCallback } from "react";
import { SiteRecord } from "@/lib/energy/types";
import { getSites } from "@/lib/api/sites";
import { FleetAggregates } from "@/components/design-system/fleet-aggregate-strip";

interface UseSitesOptions {
  initialData?: SiteRecord[];
  autoRefreshIntervalMs?: number; // Optional polling (e.g. 10000ms)
}

export function useSites(options: UseSitesOptions = {}) {
  const [sites, setSites] = useState<SiteRecord[]>(options.initialData || []);
  const [loading, setLoading] = useState<boolean>(!options.initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    options.initialData ? new Date() : null
  );

  // Initial client fetch to trigger network request in DevTools
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const response = await getSites();
        if (!ignore) {
          setSites(response.data);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load solar & BESS sites";
          setError(msg);
          console.error("[useSites] Error fetching sites via API:", err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  // Manual refresh callback
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await getSites();
      setSites(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load solar & BESS sites";
      setError(msg);
      console.error("[useSites] Error refreshing sites via API:", err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Optional background polling
  useEffect(() => {
    if (!options.autoRefreshIntervalMs) return;

    const interval = setInterval(async () => {
      try {
        const response = await getSites();
        setSites(response.data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("[useSites] Background polling error:", err);
      }
    }, options.autoRefreshIntervalMs);

    return () => clearInterval(interval);
  }, [options.autoRefreshIntervalMs]);

  // Compute live fleet aggregates directly from active sites
  const totalSolarKw = sites.reduce(
    (acc, s) => acc + (s.solar_power_kw ?? s.solar_capacity_kwp ?? 0),
    0
  );
  const totalBessKwh = sites.reduce(
    (acc, s) => acc + (s.bess_capacity_kwh ?? 0),
    0
  );
  const sitesWithBess = sites.filter((s) => s.has_bess);
  const avgBessSoc =
    sitesWithBess.length > 0
      ? sitesWithBess.reduce((acc, s) => acc + (s.bess_soc_pct ?? 75), 0) /
        sitesWithBess.length
      : 0;
  const activeLoadKw = sites.reduce(
    (acc, s) => acc + (s.load_power_kw ?? 0),
    0
  );
  const netGridKw = sites.reduce(
    (acc, s) => acc + (s.grid_power_kw ?? 0),
    0
  );

  const fleetAggregates: FleetAggregates = {
    totalSolarMw: totalSolarKw / 1000,
    totalBessMwh: totalBessKwh / 1000,
    avgBessSoc: avgBessSoc,
    activeLoadMw: activeLoadKw / 1000,
    netGridKw: netGridKw,
    activeGensets: "0 / 4",
  };

  return {
    sites,
    loading,
    isRefreshing,
    error,
    lastUpdated,
    fleetAggregates,
    refresh,
  };
}
