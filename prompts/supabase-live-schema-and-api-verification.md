# Implementation Prompt: Live Supabase Schema, Demo Data Seeding & API Verification

## Goal
Execute the production schema migration directly on the user's real Supabase project (`mzumlzmfjgzvycebqask`), populate it with comprehensive demo data (organization, 3 distinct sites with differing assets, hardware devices, live telemetry snapshots, and 30 days of hourly time-series data), and verify end-to-end data retrieval using the Supabase API (`@supabase/supabase-js`).

---

## Relevant Agent Skills
- `.agents/skills/supabase/` (`SKILL.md`): Supabase client architecture, PostgREST API querying, and PostgreSQL management.
- `.agents/skills/supabase-postgres-best-practices/` (`SKILL.md`): Relational schema execution, indexes, and data integrity.
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Multi-tenant organization scoping (`clerk_org_id`).

---

## Root Cause Analysis
Previously, the migration ran against an older reference database (`uoiodhmahcpwedwajdtd`) documented in template specs. The user's actual Supabase project is:
- **Project Reference**: `mzumlzmfjgzvycebqask`
- **Region**: `ap-northeast-2` (Seoul)
- **Direct Pooler URI**: `postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`
- **Supabase URL**: `https://mzumlzmfjgzvycebqask.supabase.co`
- **Anon Publishable Key**: `sb_publishable_rdT3U5_1lZnwaaRmKINEEQ_I-dDmzDK`
- **Service Role Secret Key**: Configured in `.env.local`

Direct connection and authentication to this exact project have now been confirmed.

---

## Existing Code Inspected
- `supabase/migrations/0001_initial_schema.sql`: Contains the complete DDL for all 8 tables and indexes.
- `.env.local`: Needs to be locked to `mzumlzmfjgzvycebqask`.
- `lib/supabase/db.ts`: Connection pooler targeting `DATABASE_URL`.
- `lib/supabase/client.ts` & `lib/supabase/server.ts`: Supabase JS client factories.
- `lib/energy/site-service.ts`: Query and seeding methods.

---

## Decisions or Assumptions
1. **Direct Migration Execution on `mzumlzmfjgzvycebqask`**:
   - Run `0001_initial_schema.sql` via the verified `ap-northeast-2` pooler to create:
     - `organizations`
     - `sites`
     - `site_devices`
     - `telemetry_snapshots`
     - `telemetry_hourly`
     - `site_alarms`
     - `maintenance_services`
     - `maintenance_tickets`
2. **Immediate Demo Data Seeding**:
   - Seed default demo organization.
   - Seed 3 sites with differing asset combinations:
     - **Site 1: Bakersfield Central Solar-Plus-Storage** (`Solar + BESS + Grid`, no DG)
     - **Site 2: Mojave Desert Industrial Microgrid Alpha** (`Solar + BESS + DG + Grid`)
     - **Site 3: Sonora Valley Agri-Voltaics & Peaker** (`Solar + DG + Grid`, no BESS)
   - Seed hardware devices in `site_devices` for each site.
   - Seed instantaneous electrical flows in `telemetry_snapshots`.
   - Seed 30 days (720 records per site, 2,160 total rows) in `telemetry_hourly` for historical dispatch analytics.
3. **API Connection Verification Script**:
   - Create and run `scripts/verify-supabase-api.js` using `@supabase/supabase-js` to fetch tables and count rows via the HTTP REST API, proving that the user's Supabase dashboard and API reflect all data.
4. **Application Wiring**:
   - Ensure `app/page.tsx` and `app/sites/[id]/page.tsx` query this verified live Supabase project.

---

## Files Likely to Change / Be Created
1. `.env.local`: Update `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to point strictly to `mzumlzmfjgzvycebqask`.
2. `scripts/run-migration-real.js`: Migration and seeding script targeting `mzumlzmfjgzvycebqask`.
3. `scripts/verify-supabase-api.js`: Verification script testing `@supabase/supabase-js` queries against `mzumlzmfjgzvycebqask`.
4. `lib/energy/site-service.ts`: Ensure dynamic resolution supports both Clerk organization and default demo organization.

---

## Acceptance Criteria
- [ ] Tables are visible in the user's Supabase project dashboard (`mzumlzmfjgzvycebqask`):
  - `organizations`, `sites`, `site_devices`, `telemetry_snapshots`, `telemetry_hourly`, `site_alarms`, `maintenance_services`, `maintenance_tickets`.
- [ ] Tables are populated with real demo data:
  - 3 sites with different assets (Site 1: Solar+BESS+Grid, Site 2: Solar+BESS+DG+Grid, Site 3: Solar+DG+Grid).
  - Devices, snapshots, and 30 days of hourly telemetry records.
- [ ] API verification script succeeds using `@supabase/supabase-js`, returning row counts via Supabase PostgREST.
- [ ] Fleet Cockpit (`/`) and Site Details (`/sites/[id]`) display real data fetched from Supabase.
- [ ] `npm run build` and `npm run lint` pass with 0 errors.

---

## Checks to Run
1. Run `node scripts/run-migration-real.js`
2. Run `node scripts/verify-supabase-api.js`
3. `npm run typecheck`
4. `npm run lint`
5. `npm run build`

---

## Exact Manual Test Steps
1. Open Supabase Dashboard at `https://supabase.com/dashboard/project/mzumlzmfjgzvycebqask/editor`:
   - Verify all 8 tables are visible in the Table Editor.
   - Inspect `public.sites`: verify 3 rows with asset flags.
   - Inspect `public.telemetry_hourly`: verify 2,160 rows of hourly time-series data.
2. Run `node scripts/verify-supabase-api.js`:
   - Verify terminal displays successful REST API response with fetched sites and counts.
3. Open `http://localhost:3000/`:
   - Verify Fleet Cockpit displays the 3 sites and live aggregates.
   - Click into a site and test the 24h, 7d, and 30d dispatch charts.
