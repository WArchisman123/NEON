# Implementation Prompt: Client API Layer (`api.ts`), Hooks (`use-sites.ts`), Route Handlers & Demo Org Cleanup

## Goal
1. **Delete Legacy Demo Organizations**:
   - Permanently delete `org_demo_neon_energy` and `default_org` from `public.organizations` on live Supabase PostgreSQL (`mzumlzmfjgzvycebqask`).
   - Prune all hardcoded fallback queries from `lib/energy/site-service.ts` and `lib/energy/clerk-sync.ts`.
   - Add automated sync with Clerk organizations (`syncAllClerkOrganizations()`).
2. **Client-Side API Layer Architecture (`lib/api.ts`)**:
   - Create `lib/api.ts` defining standard typed HTTP request primitives: `api.get<T>()`, `api.post<T>()`, `api.put<T>()`, and `api.delete<T>()`.
   - Provide centralized error handling, JSON serialization, and headers.
3. **Sites API Client & React Hooks (`lib/api/sites.ts` & `hooks/use-sites.ts`)**:
   - Create `lib/api/sites.ts`: Typed API functions (`getSites()`, `getSiteDetails()`, `updateSite()`).
   - Create `hooks/use-sites.ts`: React hooks (`useSites()`, `useSiteDetails()`) that manage loading states, error states, and cache revalidation.
4. **Next.js Route Handlers (`app/api/v1/sites/`)**:
   - Implement `app/api/v1/sites/route.ts` (`GET /api/v1/sites`): Authenticates via Clerk `auth()`, scopes to user's `orgId`, and returns JSON.
   - Implement `app/api/v1/sites/[id]/route.ts` (`GET, PUT /api/v1/sites/[id]`): Returns site details with hardware devices and supports updates.
5. **Fleet Cockpit Integration with Network Visibility**:
   - Update the Fleet Cockpit to use the `useSites()` client hook.
   - Ensure that whenever a developer opens Chrome DevTools (`F12`) $\to$ **Network** tab $\to$ **Fetch/XHR**, they see explicit HTTP calls (`GET /api/v1/sites` $\to$ HTTP 200 OK) with live JSON payloads.

---

## Relevant Agent Skills
- `.agents/skills/clerk-nextjs-patterns/` (`SKILL.md`): Route Handler authentication with `auth()`.
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Scoping API responses by caller's `orgId`.
- `.agents/skills/supabase/` (`SKILL.md`): Database deletion and query integration in Route Handlers.
- `.agents/skills/shadcn/` (`SKILL.md`): Cyber-themed loaders and error states.

---

## Existing Code Inspected
1. `public.organizations`: Contains `org_demo_neon_energy` and `default_org` which must be deleted.
2. `lib/energy/site-service.ts`: Has `getSitesForOrg()` and `getSiteDetails()` that can be called directly inside the Route Handlers.
3. `app/api/`: Does not exist yet. Needs Route Handlers.
4. `app/page.tsx`: Currently fetches entirely on the server; needs client hook integration for visible network requests.

---

## Decisions or Assumptions
1. **Client API Layer (`lib/api.ts`)**:
   - Universal fetch wrapper supporting standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
   - Rejects non-2xx responses with detailed `ApiError` objects containing status code and error messages.
2. **Domain Service Functions (`lib/api/sites.ts`)**:
   - `fetchSites(params)`: Calls `GET /api/v1/sites`.
   - `fetchSite(id)`: Calls `GET /api/v1/sites/${id}`.
   - `updateSite(id, data)`: Calls `PUT /api/v1/sites/${id}`.
3. **React Hooks (`hooks/use-sites.ts`)**:
   - `useSites(options)`:
     - Returns `{ sites, loading, error, refresh, isRefreshing }`.
     - Supports `initialData` for seamless initial page render without flash, and issues client-side fetch for live debugging and inspection in DevTools Network tab.
4. **Route Handlers**:
   - `GET /api/v1/sites`:
     - Checks `auth()`. If not authenticated, returns `401 Unauthorized`.
     - Resolves `orgId` (fallback to `iRasus Technologies` `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` if demo).
     - Returns `{ success: true, count: sites.length, data: sites }`.
   - `GET /api/v1/sites/[id]`:
     - Returns `{ success: true, data: { site, devices } }`.
   - `PUT /api/v1/sites/[id]`:
     - Updates site record and returns `{ success: true, data: updatedSite }`.

---

## Files Likely to Change / Be Created
1. `scripts/delete-demo-orgs-and-sync.js`: Script to delete demo orgs and prune database.
2. `lib/api.ts`: Core HTTP fetch client with `GET`, `POST`, `PUT`, `DELETE`.
3. `lib/api/sites.ts`: Typed domain API endpoints.
4. `hooks/use-sites.ts`: React hook managing client data fetching.
5. `app/api/v1/sites/route.ts`: Next.js Route Handler for `/api/v1/sites`.
6. `app/api/v1/sites/[id]/route.ts`: Next.js Route Handler for `/api/v1/sites/[id]`.
7. `components/dashboard/fleet-cockpit-view.tsx`: Client view utilizing `useSites()` to trigger and display visible network calls.
8. `app/page.tsx`: Render `FleetCockpitView` with server-hydrated initial data.

---

## Design System & Visual Adherence
- Void Black `#060709`, Obsidian `#0B0D13`, Neon Pink `#FF2A85`.
- Live API Network status badge in header: `HTTP 200 OK • GET /api/v1/sites`.
- Monospace font (`font-mono`) for all electrical metrics and latency indicators.

---

## Security & RBAC Requirements
- Route Handlers enforce Clerk authentication via `auth()`.
- Data is strictly scoped by `orgId`.

---

## Acceptance Criteria
- [ ] `public.organizations` contains only real Clerk organizations (`iRasus Technologies`).
- [ ] Legacy demo orgs (`org_demo_neon_energy`, `default_org`) are completely deleted.
- [ ] `lib/api.ts` provides reusable `api.get`, `api.post`, `api.put`, `api.delete`.
- [ ] `hooks/use-sites.ts` provides `useSites()` hook.
- [ ] `GET /api/v1/sites` and `GET /api/v1/sites/[id]` return JSON responses with 200 OK.
- [ ] Opening Chrome DevTools Network tab shows real HTTP API requests to `/api/v1/sites` with 200 OK status and JSON response.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to Run
1. `node scripts/delete-demo-orgs-and-sync.js`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Open [`http://localhost:3000/`](http://localhost:3000/).
2. Open Chrome DevTools (`F12`), go to the **Network** tab, and filter by **Fetch/XHR**.
3. Verify that `GET /api/v1/sites` appears with status `200 OK`.
4. Click on the request to inspect the response:
   - Preview shows `{ success: true, count: 6, data: [...] }`.
5. Click the "Sync Telemetry" button to see an immediate on-demand network call triggered.
6. Open Supabase Dashboard: Confirm only `iRasus Technologies` exists in `public.organizations`.
