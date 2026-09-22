# Implementation Prompt: Enable Row Level Security (RLS) & Multi-Tenant Access Policies

## Goal
Enable Row Level Security (RLS) across all 8 production tables in the `public` schema on the user's live Supabase PostgreSQL instance (`mzumlzmfjgzvycebqask`). Establish strict security policies that:
1. Prevent unauthorized anonymous reads/writes to private tenant tables (`organizations`, `sites`, `site_devices`, `telemetry_snapshots`, `telemetry_hourly`, `site_alarms`, `maintenance_tickets`).
2. Permit public read-only access to certified maintenance packages (`maintenance_services`).
3. Retain complete operational access for backend Server Components, API routes, and Server Actions via the `service_role` and `postgres` roles.

---

## Relevant Agent Skills
- `.agents/skills/supabase/` (`SKILL.md`): Core security principles (Section 5: RLS in exposed schemas, Section 6: Security checklist).
- `.agents/skills/supabase-postgres-best-practices/` (`references/security-rls-basics.md`, `references/security-rls-performance.md`): RLS indexing and policy execution.
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Multi-tenant scoping with Clerk organizations.

---

## Existing Code Inspected
- `supabase/migrations/0001_initial_schema.sql`: Initial DDL for the 8 core tables.
- `lib/supabase/db.ts`: Direct PostgreSQL connection pool targeting `DATABASE_URL` as the `postgres` role (which automatically bypasses RLS).
- `lib/supabase/server.ts`: Supabase client factory using `SUPABASE_SERVICE_ROLE_KEY` (which also bypasses RLS).
- `scripts/verify-supabase-api.js`: Verification script testing REST API calls.

---

## Decisions or Assumptions
1. **Enable RLS on All Exposed Public Tables**:
   - `public.organizations`
   - `public.sites`
   - `public.site_devices`
   - `public.telemetry_snapshots`
   - `public.telemetry_hourly`
   - `public.site_alarms`
   - `public.maintenance_services`
   - `public.maintenance_tickets`
2. **Policy Configuration**:
   - **`public.maintenance_services`**:
     - `SELECT`: Allowed for `anon` and `authenticated` roles where `is_active = true` (public service catalog).
   - **`public.organizations`**, **`public.sites`**, **`public.site_devices`**, **`public.telemetry_snapshots`**, **`public.telemetry_hourly`**, **`public.site_alarms`**, **`public.maintenance_tickets`**:
     - Default deny for public anonymous Data API requests.
     - Accessible securely by the application backend using the PostgreSQL pool / `service_role` key.
3. **Migration & Verification Execution**:
   - Create migration script `supabase/migrations/0002_enable_rls.sql`.
   - Run SQL script against the live Seoul pooler (`aws-0-ap-northeast-2.pooler.supabase.com:5432`).
   - Run API verification script to prove that:
     - The `anon` role can no longer freely access private tenant sites without authorization.
     - The `anon` role can still read active maintenance packages.
     - The `service_role` and direct pooled connection maintain 100% read/write access.
     - The Next.js web application (`/` and `/sites/[id]`) runs without error.

---

## Files Likely to Change / Be Created
1. `supabase/migrations/0002_enable_rls.sql`: SQL DDL enabling RLS and defining policies.
2. `scripts/apply-rls-policies.js`: Node.js script to execute the migration against the live Supabase database.
3. `scripts/verify-supabase-api.js`: Updated to verify that RLS is active and enforced.

---

## Acceptance Criteria
- [ ] RLS is enabled on all 8 tables in Supabase dashboard (`mzumlzmfjgzvycebqask`).
- [ ] Anon requests to `sites` are blocked / restricted by RLS.
- [ ] Anon requests to `maintenance_services` succeed for active catalog items.
- [ ] Service role & Next.js application data access continues to function with 0 degradation.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to Run
1. `node scripts/apply-rls-policies.js`
2. `node scripts/verify-supabase-api.js`
3. `npx tsc --noEmit`
4. `npm run lint`
5. `npm run build`
