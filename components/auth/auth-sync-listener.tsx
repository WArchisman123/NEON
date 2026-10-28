"use client";

import { useAuthSync } from "@/hooks/use-auth-sync";

/**
 * Global Authentication Sync Listener
 * Renders null and automatically triggers POST /api/v1/auth/sync
 * whenever a Clerk user signs in, changes organization, or refreshes session.
 */
export function AuthSyncListener() {
  useAuthSync();
  return null;
}
