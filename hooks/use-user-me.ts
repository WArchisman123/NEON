"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { api, ApiError } from "@/lib/api";
import { ApiResponse, UserMe, UserUpdateRequest } from "@/lib/api/types";

export interface UseUserMeReturn {
  user: UserMe | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateUser: (updates: UserUpdateRequest) => Promise<UserMe | null>;
}

/**
 * Custom React Hook to fetch and update the authenticated user's profile
 * via GET /api/v1/users/me and PUT /api/v1/users/me
 */
export function useUserMe(): UseUserMeReturn {
  const { isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(isSignedIn));
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  const updateUser = useCallback(
    async (updates: UserUpdateRequest): Promise<UserMe | null> => {
      setUpdating(true);
      setError(null);

      try {
        const token = await getToken();
        const res = await api.put<ApiResponse<UserMe> | UserMe>(
          "/api/v1/users/me",
          updates,
          { token }
        );

        const updated =
          res && typeof res === "object" && "data" in res && res.data
            ? (res.data as UserMe)
            : (res as UserMe);

        setUser(updated);
        return updated;
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to update user profile";
        setError(msg);
        console.error("[useUserMe] Error updating user profile:", err);
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    let ignore = false;

    if (!isSignedIn) {
      return;
    }

    async function load() {
      try {
        const token = await getToken();
        const res = await api.get<ApiResponse<UserMe> | UserMe>("/api/v1/users/me", {
          token,
        });

        if (ignore) return;

        const userData =
          res && typeof res === "object" && "data" in res && res.data
            ? (res.data as UserMe)
            : (res as UserMe);

        setUser(userData);
        setError(null);
      } catch (err) {
        if (ignore) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch user profile";
        setError(msg);
        console.error("[useUserMe] Error fetching user profile:", err);
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
  }, [isSignedIn, getToken, refreshIndex]);

  return {
    user,
    loading,
    updating,
    error,
    refresh,
    updateUser,
  };
}
