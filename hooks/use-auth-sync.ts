"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser, useOrganization, useAuth } from "@clerk/nextjs";
import { api, ApiError } from "@/lib/api";
import { ApiResponse, AuthSyncRequest } from "@/lib/api/types";

export interface UseAuthSyncReturn {
  isSyncing: boolean;
  isSynced: boolean;
  error: string | null;
  syncNow: () => Promise<void>;
}

/**
 * Custom React Hook to synchronize the authenticated Clerk user and active organization
 * with the NEON ENERGY Backend REST API (POST /api/v1/auth/sync).
 *
 * Runs automatically upon user sign-in or organization switch,
 * attaching the valid Clerk session Bearer token.
 */
export function useAuthSync(): UseAuthSyncReturn {
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { organization, membership } = useOrganization();
  const { getToken } = useAuth();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Prevents repeated duplicate syncs for the same user + org state
  const lastSyncFingerprint = useRef<string | null>(null);

  const performSync = useCallback(async () => {
    if (!isSignedIn || !user) {
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const token = await getToken();

      const payload: AuthSyncRequest = {
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        imageUrl: user.imageUrl ?? null,
        organization: organization
          ? {
              clerkOrgId: organization.id,
              name: organization.name,
              slug: organization.slug ?? null,
            }
          : null,
        organizationRole: membership?.role ?? null,
      };

      await api.post<ApiResponse<unknown>>("/api/v1/auth/sync", payload, {
        token,
      });

      setIsSynced(true);
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to synchronize authentication session with backend";
      setError(message);
      console.error("[useAuthSync] Error synchronizing auth with backend:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSignedIn, user, organization, membership, getToken]);

  useEffect(() => {
    if (!isUserLoaded || !isSignedIn || !user) {
      return;
    }

    // Build fingerprint of user ID + active org ID
    const currentFingerprint = `${user.id}:${organization?.id ?? "personal"}:${user.updatedAt?.getTime() ?? 0}`;

    if (lastSyncFingerprint.current === currentFingerprint) {
      return;
    }

    lastSyncFingerprint.current = currentFingerprint;
    void performSync();
  }, [isUserLoaded, isSignedIn, user, organization, performSync]);

  return {
    isSyncing,
    isSynced,
    error,
    syncNow: performSync,
  };
}
