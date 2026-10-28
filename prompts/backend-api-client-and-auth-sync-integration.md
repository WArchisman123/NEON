# Implementation Prompt: Singular Universal API Client (`lib/api.ts`), Clerk Auth Sync & Custom Hooks Integration

## Goal
Integrate the live backend REST API documentation from `https://dev.irasus.com/neon/docs` into NEON ENERGY. Specifically, build a singular, robust, type-safe API client (`lib/api.ts`) supporting `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` with automatic Bearer token injection, along with dedicated custom React hooks (`useAuthSync`, `useUserMe`, `useOrganizationMe`) to power the login sync flow and user/organization retrieval.

---

## API Documentation & Endpoint Verification Summary

The API at `https://dev.irasus.com/neon/docs` was inspected and verified via its OpenAPI 3.1.0 specification at `https://dev.irasus.com/neon/openapi.json`.

- **Base URL Prefix**: `https://dev.irasus.com/neon` (configured via `NEXT_PUBLIC_BACKEND_API_URL`)
- **Authentication Scheme**: `HTTPBearer` (`Authorization: Bearer <clerk_session_token>`)
- **Discovered Endpoints**:
  1. `POST /api/v1/auth/sync`:
     - **Auth**: Bearer Token required (`HTTPBearer`)
     - **Request Schema** (`AuthSyncRequest`):
       ```json
       {
         "clerkUserId": "string (1-255 chars, required)",
         "email": "string (email or null)",
         "firstName": "string (max 255 or null)",
         "lastName": "string (max 255 or null)",
         "imageUrl": "string (uri or null)",
         "organization": {
           "clerkOrgId": "string (required)",
           "name": "string (required)",
           "slug": "string (null or string)"
         },
         "organizationRole": "string (max 64 or null)"
       }
       ```
     - **Response**: `{ success: boolean, data: ... }`
  2. `GET /api/v1/users/me`:
     - **Auth**: Bearer Token required
     - **Response**: Current user profile in backend database
  3. `PUT /api/v1/users/me`:
     - **Auth**: Bearer Token required
     - **Request Schema** (`UserUpdateRequest`): `{ firstName?: string, lastName?: string, imageUrl?: string }`
  4. `GET /api/v1/organizations/me`:
     - **Auth**: Bearer Token required
     - **Response**: Active organization profile in backend database
  5. `GET /health` & `GET /ready`:
     - **Auth**: None (Public)
     - **Live Verification**: Both endpoints are live and respond with `{ success: true, data: { status: "ok" } }` and `{ success: true, data: { status: "ready", database: "ok" } }`.
  6. `POST /api/v1/webhooks/clerk`: Clerk webhook receiver.

---

## Relevant Agent Skills
- `.agents/skills/clerk-nextjs-patterns/` (Clerk session token acquisition via `useAuth().getToken()` on client and `(await auth()).getToken()` on server)
- `.agents/skills/clerk-orgs/` (Clerk organization switching, active organization resolution, and role mapping)
- `.agents/skills/clerk/` (Clerk auth lifecycle, sign-in redirection, session state handling)
- `.agents/skills/shadcn/` (UI notifications and status toasts if needed)

---

## Existing Code Inspected
- `lib/api.ts`: Basic client-side fetch helper with method wrappers. Needs enhancement for base URL routing, token extraction, standard error envelopes, and request interceptors.
- `app/layout.tsx`: Root layout with `ClerkProvider` and theme hydration.
- `app/sign-in/[[...sign-in]]/page.tsx` & `app/sign-up/[[...sign-up]]/page.tsx`: Clerk sign-in and sign-up interfaces.
- `app/page.tsx`: Main dashboard entry point where auth sync currently triggers.
- `lib/energy/clerk-sync.ts`: Server-side synchronization logic.
- `hooks/use-sites.ts`: Existing hook pattern consuming `lib/api/sites.ts`.
- `.env.local`: Environment variables file.

---

## Decisions & Assumptions
1. **Configurable Base URL**: Use `NEXT_PUBLIC_BACKEND_API_URL` in `.env.local`, defaulting to `https://dev.irasus.com/neon`. When endpoints start with `/api/` or relative paths, the API client automatically resolves them against the configured backend base URL, unless explicitly targeting Next.js internal routes.
2. **Automatic Token Resolution**: `lib/api.ts` will support a pluggable token resolver (or accepting a `token` in options). On client components, hooks will retrieve the Clerk session token via `useAuth().getToken()` and feed it to `api` calls.
3. **Automated Login Sync Flow**: Implement an `AuthSyncProvider` (or `useAuthSync` trigger) mounted within the root layout under `ClerkProvider`. When a user logs in or switches their active Clerk organization, `useAuthSync` immediately triggers `POST /api/v1/auth/sync` with their Clerk ID, profile details, and active organization hint.
4. **Idempotent Syncing**: To avoid redundant network spam on every re-render, `useAuthSync` will track the last synchronized `userId:orgId` fingerprint and only execute when auth state changes or when explicitly invoked.

---

## Files Likely to Change / Be Created
1. `.env.local`: Add `NEXT_PUBLIC_BACKEND_API_URL=https://dev.irasus.com/neon`.
2. `lib/api.ts`: Upgrade to the singular, full-featured typed API client with GET, POST, PUT, PATCH, DELETE, custom headers, bearer token injection, and typed error handling.
3. `lib/api/types.ts`: Define strict TypeScript interfaces matching the OpenAPI schemas (`AuthSyncRequest`, `UserUpdateRequest`, `OrganizationHint`, `ApiSuccessResponse<T>`, `ApiErrorResponse`).
4. `hooks/use-auth-sync.ts`: Dedicated hook for synchronizing Clerk user & organization data with `POST /api/v1/auth/sync`.
5. `hooks/use-user-me.ts`: Dedicated hook for `GET /api/v1/users/me` and `PUT /api/v1/users/me`.
6. `hooks/use-organization-me.ts`: Dedicated hook for `GET /api/v1/organizations/me`.
7. `components/auth/auth-sync-listener.tsx`: Invisible client component placed in `app/layout.tsx` that calls `useAuthSync` when authenticated.
8. `app/layout.tsx`: Mount `AuthSyncListener` inside `ClerkProvider`.

---

## Implementation Requirements

### 1. `lib/api.ts` (Singular Universal API Client)
- Define universal `request<T>(endpoint: string, options?: RequestOptions): Promise<T>`.
- Support methods:
  - `api.get<T>(endpoint, options)`
  - `api.post<T>(endpoint, body, options)`
  - `api.put<T>(endpoint, body, options)`
  - `api.patch<T>(endpoint, body, options)`
  - `api.delete<T>(endpoint, options)`
- Support `RequestOptions`:
  - `token?: string | null` (automatically adds `Authorization: Bearer <token>`)
  - `params?: Record<string, string | number | boolean | undefined>`
  - `headers?: HeadersInit`
  - `baseUrl?: string` (defaults to `process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://dev.irasus.com/neon"`)
- Robust error handling:
  - Throw typed `ApiError` containing `status`, `code`, `details`, and human-friendly `message` parsed from `{ success: false, error: "..." }`.

### 2. Custom Hooks Layer
- `useAuthSync()`:
  - Uses Clerk's `useUser()`, `useOrganization()`, `useAuth()`.
  - When `isSignedIn === true`, retrieves `token = await getToken()`.
  - Builds `AuthSyncRequest` payload:
    - `clerkUserId: user.id`
    - `email: user.primaryEmailAddress?.emailAddress ?? null`
    - `firstName: user.firstName ?? null`
    - `lastName: user.lastName ?? null`
    - `imageUrl: user.imageUrl ?? null`
    - `organization: organization ? { clerkOrgId: organization.id, name: organization.name, slug: organization.slug } : null`
    - `organizationRole: orgRole ?? null`
  - Calls `api.post<AuthSyncResponse>("/api/v1/auth/sync", payload, { token })`.
  - Returns `{ isSyncing, isSynced, error, syncNow }`.
- `useUserMe()`:
  - Fetches `/api/v1/users/me` using Clerk session token.
  - Exposes `updateUser(data: UserUpdateRequest)` to call `PUT /api/v1/users/me`.
  - Returns `{ data, loading, error, refetch, updateUser }`.
- `useOrganizationMe()`:
  - Fetches `/api/v1/organizations/me` using Clerk session token.
  - Returns `{ data, loading, error, refetch }`.

### 3. Login Flow Integration
- Mount `<AuthSyncListener />` in `app/layout.tsx`.
- Whenever a user signs in via `/sign-in` or switches organizations in the app, the sync listener will execute, ensuring the backend database has the updated user and org records.

---

## Design System & Visual Adherence
- Any user profile or sync state displayed in UI adheres to the Cyber Dark / High-Contrast Day palette.
- Badges and indicators use Cyber Emerald (`#00E676`) for synced state, Neon Red (`#FF1744`) for errors, and Neon Pink (`#FF2A85`) for active progress.
- Monospace font (`font-mono`) for timestamps, IDs, and status codes.

---

## Security & RBAC Requirements
- Never store bearer tokens in unencrypted local storage; resolve ephemeral JWTs on-demand via Clerk's `getToken()`.
- Send Bearer tokens over HTTPS only.
- Validate request payloads strictly against backend OpenAPI schemas.

---

## Acceptance Criteria
1. `https://dev.irasus.com/neon/docs` endpoints verified and accessible.
2. `lib/api.ts` provides typed `get`, `post`, `put`, `patch`, and `delete` methods with automatic Bearer token support.
3. `hooks/use-auth-sync.ts` triggers `POST /api/v1/auth/sync` with valid Clerk session JWT and `AuthSyncRequest` structure.
4. `hooks/use-user-me.ts` retrieves and updates `/api/v1/users/me`.
5. `hooks/use-organization-me.ts` retrieves `/api/v1/organizations/me`.
6. Successful login flow triggers synchronization in background without impacting page load performance.
7. `npm run typecheck` passes with **0 errors**.

---

## Checks to Run
- `npm run typecheck` (or `npx tsc --noEmit`)
- `npm run lint`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Desktop ($1440 \times 900$)**:
   - Open browser at `http://localhost:3000`.
   - Log in with Clerk credentials.
   - Open Browser DevTools Network tab.
   - Filter by `auth/sync` or `dev.irasus.com`: verify `POST /api/v1/auth/sync` is dispatched with `Authorization: Bearer <token>` and `200 OK`.
2. **Mobile ($390 \times 844$)**:
   - Verify sign-in flow and auth sync on mobile viewport.
