import { api } from "@/lib/api";
import { SiteRecord, SiteDeviceRecord } from "@/lib/energy/types";

export interface SitesApiResponse {
  success: boolean;
  count: number;
  data: SiteRecord[];
  timestamp: string;
}

export interface SiteDetailApiResponse {
  success: boolean;
  data: {
    site: SiteRecord;
    devices: SiteDeviceRecord[];
  };
}

/**
 * Client API call to fetch all sites for the authenticated organization
 * Appears in DevTools Network tab as GET /api/v1/sites
 */
export async function getSites(params?: {
  orgId?: string;
  status?: string;
}): Promise<SitesApiResponse> {
  return api.get<SitesApiResponse>("/api/v1/sites", { params });
}

/**
 * Client API call to fetch full site details and device inventory
 * Appears in DevTools Network tab as GET /api/v1/sites/:id
 */
export async function getSite(siteId: string): Promise<SiteDetailApiResponse> {
  return api.get<SiteDetailApiResponse>(`/api/v1/sites/${siteId}`);
}

/**
 * Client API call to update site configuration
 * Appears in DevTools Network tab as PUT /api/v1/sites/:id
 */
export async function updateSite(
  siteId: string,
  updates: Partial<SiteRecord>
): Promise<{ success: boolean; data: SiteRecord }> {
  return api.put<{ success: boolean; data: SiteRecord }>(
    `/api/v1/sites/${siteId}`,
    updates
  );
}
