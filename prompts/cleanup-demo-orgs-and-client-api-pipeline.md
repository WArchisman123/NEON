# Implementation Prompt: Delete Legacy Demo Orgs, Sync Clerk Organizations & Provide Client API Pipeline

## Goal
1. **Delete Legacy Demo Organizations**:
   - Permanently remove the hardcoded demo organizations (`org_demo_neon_energy` and `default_org`) from the live Supabase PostgreSQL database (`mzumlzmfjgzvycebqask`).
   - Remove all legacy fallback references to these demo orgs in `lib/energy/site-service.ts` and `lib/energy/clerk-sync.ts`.
2. **Automated Clerk Organization Synchronization**:
   - Implement an automated sync pipeline in `lib/energy/clerk-sync.ts` that queries the Clerk Backend API (`clerkClient().organizations.getOrganizationList()`), ensures all active Clerk organizations are mirrored into `public.organizations`, and prunes any stale non-Clerk entries.
3. **Client-Facing REST API Route & Network Tab Telemetry**:
   - Address the user's question regarding why network requests were not visible: Explain that Next.js Server Components fetch and render server-side (producing zero client-side fetch waterfall).
   - Implement the official REST API endpoint: `app/api/v1/sites/route.ts` (`GET /api/v1/sites`), returning authenticated, organization-scoped site and telemetry JSON.
   - Wire a live telemetry refresh poller / refresh button in the Fleet Cockpit that calls `/api/v1/sites`, making live HTTP API requests visible directly in the browser's DevTools Network tab.

---

## Relevant Agent Skills
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Multi-tenant organization listing, syncing, and session scoping.
- `.agents/skills/clerk-nextjs-patterns/` (`SKILL.md`): Route Handler authentication (`auth()`, Next.js 15+ headers/cookies).
- `.agents/skills/supabase/` (`SKILL.md`): Database deletion, foreign key constraints, and query execution.
- `.agents/skills/supabase-postgres-best-practices/` (`SKILL.md`): Safe deletion and transactional integrity.

---

## Existing Code Inspected
1. `public.organizations`: Contains `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` (iRasus Technologies), plus `org_demo_neon_energy` and `default_org`.
2. `lib/energy/site-service.ts`: Has fallback queries targeting `org_demo_neon_energy` and `default_org` when no sites are found.
3. `lib/energy/clerk-sync.ts`: Has fallback strings pointing to `org_demo_neon_energy`.
4. `app/api/`: Currently does not exist. All data was fetched via React Server Components.

---

## Decisions or Assumptions
1. **Database Deletion**:
   - Run SQL script to delete `org_demo_neon_energy` and `default_org`.
   - Verified that 0 sites and 0 users reference these two rows; deletion is safe and will not cascade.
2. **Dynamic Clerk Synchronization (`syncClerkOrganizations`)**:
   - Query Clerk API `clerkClient().organizations.getOrganizationList({ limit: 100 })`.
   - Upsert each organization from Clerk into `public.organizations` (`clerk_org_id`, `name`, `slug`).
   - Delete any database organizations whose `clerk_org_id` does not exist in Clerk.
3. **Codebase Fallback Pruning**:
   - In `getSitesForOrg(clerkOrgId)`: Remove the fallback query that selected demo org sites. If an organization has no sites, return `[]`.
   - In `clerk-sync.ts`: Remove `org_demo_neon_energy` fallbacks.
4. **REST API Endpoint (`GET /api/v1/sites`)**:
   - Located at `app/api/v1/sites/route.ts`.
   - Uses `auth()` to extract the caller's `orgId`.
   - Calls `getSitesForOrg(orgId)` and returns `NextResponse.json({ success: true, count: sites.length, data: sites })`.
   - In the Fleet Cockpit (`app/page.tsx`), add a client-side telemetry poll component or refresh button that queries `/api/v1/sites` so the developer can inspect the network call and JSON payload in the Network tab.

---

## Files Likely to Change / Be Created
1. `scripts/delete-demo-orgs-and-sync.js`: Script to execute deletion and initial full Clerk sync.
2. `lib/energy/site-service.ts`: Remove demo org fallbacks.
3. `lib/energy/clerk-sync.ts`: Add `syncAllClerkOrganizations()` and remove demo org references.
4. `app/api/v1/sites/route.ts`: New Route Handler for `GET /api/v1/sites`.
5. `components/dashboard/live-telemetry-poller.tsx`: Client component that makes periodic `fetch('/api/v1/sites')` calls, visible in Network tab.
6. `app/page.tsx`: Mount poller to display live sync state.

---

## Design System & Visual Adherence
- Void Black `#060709`, Obsidian `#0B0D13`, Neon Pink `#FF2A85`.
- Live API status indicator shows `ONLINE (HTTP 200 OK)` with Cyber Emerald pulse.
- Monospace font (`font-mono`) for latency and sync timestamps.

---

## Security & RBAC Requirements
- `GET /api/v1/sites` validates Clerk authentication using `auth()`.
- Unauthenticated requests return `401 Unauthorized`.
- Scoped strictly to caller's `orgId`.

---

## Acceptance Criteria
- [ ] `public.organizations` contains ONLY real Clerk organizations (0 legacy demo orgs).
- [ ] Automated sync keeps Supabase organizations strictly identical to Clerk organizations.
- [ ] No hardcoded fallbacks to `org_demo_neon_energy` or `default_org` remain in the codebase.
- [ ] `GET /api/v1/sites` returns JSON with the 6 installations and their live telemetry.
- [ ] Opening Chrome DevTools Network tab shows real HTTP API requests to `/api/v1/sites` with 200 OK.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to Run
1. `node scripts/delete-demo-orgs-and-sync.js`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Open Supabase Dashboard Table Editor (`mzumlzmfjgzvycebqask`):
   - Check `public.organizations`: Verify ONLY `iRasus Technologies` exists (the 2 demo orgs are deleted).
2. Open [`http://localhost:3000/`](http://localhost:3000/):
   - Open Chrome DevTools (`F12`), switch to **Network** tab, filter by **Fetch/XHR**.
   - Observe the live `GET /api/v1/sites` API calls returning HTTP `200 OK` with JSON telemetry payloads.
   - Click "Refresh Telemetry" to trigger an instant HTTP fetch.
