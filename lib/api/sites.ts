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

export interface CreateSitePayload {
  name: string;
  locationCity: string;
  locationState: string;
  latitude?: number | null;
  longitude?: number | null;
  plantType?: "commercial_industrial" | "utility_microgrid" | "rooftop_hybrid";
  solarCapacityKwp?: number;
  bessCapacityKwh?: number;
  bessPowerKw?: number;
  dgCapacityKva?: number;
  contractedDemandKva?: number;
  hasSolar?: boolean;
  hasBess?: boolean;
  hasDg?: boolean;
  hasGrid?: boolean;
  peakTariffRate?: number;
  offpeakTariffRate?: number;
}

/**
 * Client API call to register a new solar and BESS site
 * Appears in DevTools Network tab as POST /api/v1/sites
 */
export async function createSite(
  payload: CreateSitePayload
): Promise<{ success: boolean; data: SiteRecord; message?: string }> {
  return api.post<{ success: boolean; data: SiteRecord; message?: string }>(
    "/api/v1/sites",
    payload
  );
}

