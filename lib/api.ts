/**
 * Universal Type-Safe API Client for NEON ENERGY
 * Supports typed GET, POST, PUT, PATCH, and DELETE operations.
 * Handles automatic query params stringifying, Bearer token injection,
 * dual-routing for backend endpoints (https://dev.irasus.com/neon) and internal Next.js routes,
 * and comprehensive error envelope parsing.
 */

import { ApiValidationError } from "./api/types";
export * from "./api/types";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: ApiValidationError[] | unknown[];
  data: unknown;

  constructor(message: string, status: number, data?: unknown, code?: string, details?: ApiValidationError[] | unknown[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string> | HeadersInit;
  token?: string | null;
  baseUrl?: string;
  useBackend?: boolean;
}

const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://dev.irasus.com/neon";

// Endpoints that belong to the external backend service by default
const BACKEND_ROUTE_PREFIXES = [
  "/api/v1/auth",
  "/api/v1/users",
  "/api/v1/organizations",
  "/api/v1/webhooks",
  "/health",
  "/ready",
];

function resolveFullUrl(endpoint: string, options: RequestOptions = {}): string {
  // If endpoint is already an absolute URL, use it directly
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  // If baseUrl was explicitly provided, use it
  if (options.baseUrl !== undefined) {
    const base = options.baseUrl.replace(/\/+$/, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  // If explicit useBackend is true, or endpoint matches known backend routes
  const shouldTargetBackend =
    options.useBackend === true ||
    (options.useBackend === undefined &&
      BACKEND_ROUTE_PREFIXES.some((prefix) => endpoint.startsWith(prefix)));

  if (shouldTargetBackend) {
    const base = DEFAULT_BACKEND_URL.replace(/\/+$/, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  // Otherwise, leave as relative URL for internal Next.js routes
  return endpoint;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, token, baseUrl, useBackend, ...customConfig } = options;

  let url = resolveFullUrl(endpoint, { baseUrl, useBackend });

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const mergedHeaders: Record<string, string> = {
    ...defaultHeaders,
    ...(headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : Array.isArray(headers)
      ? Object.fromEntries(headers)
      : (headers as Record<string, string>)),
  };

  const response = await fetch(url, {
    headers: mergedHeaders,
    ...customConfig,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    let message = `HTTP Error ${response.status}: ${response.statusText}`;
    let code: string | undefined;
    let details: ApiValidationError[] | unknown[] | undefined;

    if (typeof errorData === "object" && errorData !== null) {
      const errObj = errorData as Record<string, unknown>;

      // Standard error envelope: { success: false, error: "...", code: "..." }
      if (typeof errObj.error === "string") {
        message = errObj.error;
      }
      if (typeof errObj.code === "string") {
        code = errObj.code;
      }
      if (Array.isArray(errObj.details)) {
        details = errObj.details;
      }

      // FastAPI validation error envelope: { detail: [{ msg, loc, type }] }
      if (Array.isArray(errObj.detail) && errObj.detail.length > 0) {
        const first = errObj.detail[0] as { msg?: string; loc?: string[] };
        const loc = Array.isArray(first.loc) ? first.loc.join(" -> ") : "";
        message = first.msg ? `${first.msg}${loc ? ` (${loc})` : ""}` : message;
        details = errObj.detail;
      } else if (typeof errObj.detail === "string") {
        message = errObj.detail;
      }
    }

    throw new ApiError(message, response.status, errorData, code, details);
  }

  // 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  /**
   * Universal GET request
   */
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  /**
   * Universal POST request
   */
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  /**
   * Universal PUT request
   */
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  /**
   * Universal PATCH request
   */
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  /**
   * Universal DELETE request
   */
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  /**
   * Direct Backend API namespace (always targets NEXT_PUBLIC_BACKEND_API_URL)
   */
  backend: {
    get: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, { ...options, method: "GET", useBackend: true }),

    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>(endpoint, {
        ...options,
        method: "POST",
        body: body !== undefined ? JSON.stringify(body) : undefined,
        useBackend: true,
      }),

    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>(endpoint, {
        ...options,
        method: "PUT",
        body: body !== undefined ? JSON.stringify(body) : undefined,
        useBackend: true,
      }),

    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body !== undefined ? JSON.stringify(body) : undefined,
        useBackend: true,
      }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, { ...options, method: "DELETE", useBackend: true }),
  },
};
