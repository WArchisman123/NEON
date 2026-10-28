"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { api, ApiError } from "@/lib/api";
import { ApiResponse, OrganizationMe } from "@/lib/api/types";

export interface UseOrganizationMeReturn {
  organization: OrganizationMe | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom React Hook to fetch the active organization profile
 * via GET /api/v1/organizations/me
 */
export function useOrganizationMe(): UseOrganizationMeReturn {
  const { isSignedIn, getToken } = useAuth();
  const { organization: clerkOrg } = useOrganization();
  const [organization, setOrganization] = useState<OrganizationMe | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(isSignedIn));
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    if (!isSignedIn) {
      return;
    }

    async function load() {
      try {
        const token = await getToken();
        const res = await api.get<ApiResponse<OrganizationMe> | OrganizationMe>(
          "/api/v1/organizations/me",
          { token }
        );

        if (ignore) return;

        const orgData =
          res && typeof res === "object" && "data" in res && res.data
            ? (res.data as OrganizationMe)
            : (res as OrganizationMe);

        setOrganization(orgData);
        setError(null);
      } catch (err) {
        if (ignore) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch active organization";
        setError(msg);
        console.error("[useOrganizationMe] Error fetching organization:", err);
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
  }, [isSignedIn, getToken, clerkOrg?.id, refreshIndex]);

  return {
    organization,
    loading,
    error,
    refresh,
  };
}
