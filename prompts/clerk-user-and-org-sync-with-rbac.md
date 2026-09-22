# Implementation Prompt: User & Organization Synchronization from Clerk with RBAC & Site Scoping

## Goal
1. Create a `public.users` table in the live Supabase PostgreSQL database (`mzumlzmfjgzvycebqask`) to store user profile data, Clerk organization memberships, active organization foreign key (`current_org_id`), and RBAC roles.
2. Synchronize the logged-in user and their Clerk organization (`org_3JgZ51s2g9LkRRE0L61kAXDGDWE` - "iRasus Technologies") from Clerk into Supabase PostgreSQL automatically if they do not already exist.
3. Ensure that all sites are strictly bound to their parent organization (`sites.org_id`), and seed / initialize active renewable assets (Solar, BESS, DG, Grid) for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` so all users belonging to this organization immediately see and manage their fleet.
4. Enable Row Level Security (RLS) on `public.users` and ensure multi-tenant query isolation.

---

## Relevant Agent Skills
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Multi-tenant B2B organizations, organization membership retrieval, `orgId`, `orgRole`, and `<OrganizationSwitcher />`.
- `.agents/skills/clerk-nextjs-patterns/` (`SKILL.md`): Server-side authentication handling with `auth()`, `currentUser()`, and `clerkClient()`.
- `.agents/skills/supabase/` (`SKILL.md`): PostgreSQL schema management, client integration, and RLS in exposed schemas.
- `.agents/skills/supabase-postgres-best-practices/` (`references/security-rls-basics.md`, `references/schema-foreign-key-indexes.md`): Schema design, foreign key indexing, and RLS policies.
- `.agents/skills/shadcn/` (`SKILL.md`): Clean component composition and responsive cyber-themed styling.

---

## Existing Code & Data Inspected
1. **Live Supabase PostgreSQL (`mzumlzmfjgzvycebqask`)**:
   - `public.organizations`: Currently only contains 2 default demo rows (`org_demo_neon_energy` and `default_org`). Missing the user's real Clerk organization `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.
   - `public.users`: Does not exist yet.
   - `public.sites`: Has foreign key `org_id REFERENCES public.organizations(id)`.
2. **Clerk Instance**:
   - Organization: `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` ("iRasus Technologies", slug: `irasus-technologies-1790084484244493943`).
   - Member: `user_3JgYoylDi4XOG7F8ImkNddS5Qpk` (`archisman.saha@irasus.com`, role: `org:admin`).
3. **Application Layer**:
   - `lib/energy/site-service.ts`: Needs a dedicated `syncUserAndOrgFromClerk()` helper that resolves user details and Clerk organization via `clerkClient()`, upserting both `organizations` and `users` into Supabase.
   - `app/page.tsx`: Resolves active user session, triggers automatic sync, and renders fleet aggregates and site cards scoped to the user's organization.
   - `components/layout/topbar.tsx`: Displays `<OrganizationSwitcher />` for both desktop and mobile, with cyber styling.

---

## Decisions or Assumptions
1. **`public.users` Schema**:
   - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
   - `clerk_user_id TEXT UNIQUE NOT NULL`
   - `email TEXT NOT NULL`
   - `first_name TEXT`
   - `last_name TEXT`
   - `image_url TEXT`
   - `clerk_org_id TEXT`
   - `current_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL`
   - `role TEXT DEFAULT 'org:member'` (synced from Clerk org membership, e.g. `org:admin`)
   - `created_at TIMESTAMPTZ DEFAULT now()`
   - `updated_at TIMESTAMPTZ DEFAULT now()`
   - Indexes on `clerk_user_id` and `current_org_id`.
2. **Dynamic Clerk Sync Workflow**:
   - Create `syncUserAndOrgFromClerk(user, auth)` in `lib/energy/site-service.ts`:
     - Checks if user is authenticated.
     - Reads `orgId` from session or queries `clerkClient().users.getOrganizationMembershipList({ userId })` as fallback if the session token has not explicitly selected an active org.
     - Fetches official org metadata (name: "iRasus Technologies", slug) from Clerk API.
     - Upserts into `public.organizations` with `ON CONFLICT (clerk_org_id) DO UPDATE`.
     - Upserts into `public.users` with `ON CONFLICT (clerk_user_id) DO UPDATE`.
     - If the organization has 0 sites, seeds the 3 diverse demo sites (Solar+BESS, Solar+BESS+DG, Solar+DG) and 30-day telemetry for that organization so all org members immediately have telemetry and assets to monitor.
3. **Database Migration Script**:
   - Create `supabase/migrations/0003_create_users_table.sql`.
   - Run migration script directly on the live Supabase instance (`mzumlzmfjgzvycebqask`).
   - Enable RLS on `public.users`.
   - Immediately sync `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` and user `user_3JgYoylDi4XOG7F8ImkNddS5Qpk` via a seed/sync execution.
4. **Site Scoping Invariant**:
   - `getSitesForOrg(clerkOrgId)` queries `WHERE o.clerk_org_id = $1`.
   - All users belonging to `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` will share and view the organization's sites.

---

## Files Likely to Change / Be Created
1. `supabase/migrations/0003_create_users_table.sql`: DDL for `public.users`, indexes, and RLS.
2. `scripts/apply-users-migration.js`: Execution script applying the migration and immediately syncing `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.
3. `lib/energy/site-service.ts`: Add `syncUserAndOrgFromClerk()` and `getUsersForOrg()`.
4. `app/page.tsx`: Call `syncUserAndOrgFromClerk()`, display user's organization name ("iRasus Technologies") and user role badge.
5. `components/layout/topbar.tsx`: Ensure `<OrganizationSwitcher />` is visible and responsive across mobile and desktop.

---

## Design System & Visual Adherence
- Background: Void Black `#060709`
- Cards: Obsidian `#0B0D13` with subtle frost border `border-white/[0.08]`
- Active Glow: Neon Pink `#FF2A85`
- Telemetry: Monospace (`font-mono`) for all electrical metrics ($kW$, $MW$, $V$, $A$, $Hz$, $\%$)
- Mobile Touch Targets: $\ge 48 \times 48\text{ px}$

---

## Security & RBAC Requirements
- Enable RLS on `public.users`.
- `public.users` is protected from raw anonymous public access via PostgREST Data API.
- All operations scoped strictly by `clerk_org_id`.
- Roles (`org:admin`, `org:asset_manager`, `org:site_engineer`, `org:field_tech`, `org:client`) recorded and validated against `public/context/role.md`.

---

## Acceptance Criteria
- [ ] `public.users` table exists in live Supabase (`mzumlzmfjgzvycebqask`) with RLS enabled.
- [ ] `public.organizations` contains `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` ("iRasus Technologies").
- [ ] `public.users` contains `user_3JgYoylDi4XOG7F8ImkNddS5Qpk` (`archisman.saha@irasus.com`, role: `org:admin`) linked to `iRasus Technologies`.
- [ ] Sites are associated with `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`, allowing all users in that organization to view them.
- [ ] Any new user logging in with an organization is automatically upserted into `users` and `organizations`.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to Run
1. `node scripts/apply-users-migration.js`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Check Supabase Dashboard Table Editor:
   - View `public.users`: Confirm row for `archisman.saha@irasus.com` with `org:admin`.
   - View `public.organizations`: Confirm row for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` ("iRasus Technologies").
   - View `public.sites`: Confirm sites assigned to `iRasus Technologies` org ID.
2. Open `http://localhost:3000/`:
   - Verify the top banner displays "iRasus Technologies" with `org:admin` operator badge.
   - Verify Fleet Aggregate Strip and Site Cockpit Cards show the organization's sites.
3. Mobile Viewport Test ($390 \times 844$):
   - Check responsive topbar with Organization Switcher and UserButton.
