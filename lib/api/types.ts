/**
 * Strict TypeScript types for NEON ENERGY Backend REST API
 * Conforming to OpenAPI 3.1.0 specifications (https://dev.irasus.com/neon/docs)
 */

export interface OrganizationHint {
  clerkOrgId: string;
  name: string;
  slug?: string | null;
}

export interface AuthSyncRequest {
  clerkUserId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  organization?: OrganizationHint | null;
  organizationRole?: string | null;
}

export interface UserUpdateRequest {
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

export interface ApiValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface ApiMeta {
  timestamp?: string;
  siteId?: string;
  deviceId?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  error: string;
  code?: string;
  details?: ApiValidationError[] | unknown[];
  meta?: ApiMeta;
}

export interface UserMe {
  id?: string;
  clerk_user_id?: string;
  clerkUserId?: string;
  email?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface OrganizationMe {
  id?: string;
  clerk_org_id?: string;
  clerkOrgId?: string;
  name?: string;
  slug?: string | null;
  tier?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface HealthResponse {
  status: string;
  database?: string;
}
