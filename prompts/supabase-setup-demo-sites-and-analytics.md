# Implementation Prompt: Real Supabase PostgreSQL Setup, Multi-Tenant Demo Sites & Analytics Engine

## Goal
Set up real Supabase PostgreSQL persistence (zero mock/offline fallbacks) for Neon Energy scoped strictly to the authenticated user's Clerk organization (`clerk_org_id`). Execute the production schema migration on the live Supabase PostgreSQL instance (`aws-0-ap-northeast-1.pooler.supabase.com`), implement idempotent organization auto-provisioning and site seeding with diverse asset configurations (Solar, BESS, DG, Grid), fetch and render live aggregate site data in the Fleet Cockpit cards, and build a dedicated site drilldown view (`/sites/[id]`) with interval-based historical analytics (Daily, Weekly, Monthly) and asset telemetry queried directly from Supabase PostgreSQL.

---

## Relevant Agent Skills
- `.agents/skills/supabase/` (`SKILL.md`): Supabase client architecture, PostgreSQL persistence, and SSR patterns.
- `.agents/skills/supabase-postgres-best-practices/` (`SKILL.md`): Relational schema design, compound indexes on `(site_id, bucket_timestamp desc)`, foreign key cascade deletion, and RLS data security.
- `.agents/skills/clerk-orgs/` (`SKILL.md`): B2B multi-tenancy, organization resolution via `@clerk/nextjs/server`, and tenant data scoping (`clerk_org_id`).
- `.agents/skills/clerk-nextjs-patterns/` (`SKILL.md`): Server-side authentication and session extraction in App Router Server Components and Route Handlers.
- `.agents/skills/shadcn/` (`SKILL.md`): Cyberpunk card structures, tabs, badges, and accessible touch targets.

---

## Live Database Connectivity Verification
- **Verified Host**: `aws-0-ap-northeast-1.pooler.supabase.com:5432` (Supabase Region: `ap-northeast-1`)
- **Direct Connection URI**: `postgresql://postgres.uoiodhmahcpwedwajdtd:VncVw2WsMG3RL70u@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`
- **Verification Status**: Direct TCP connection and DDL execution test succeeded on the live database.
- **Strict Rule**: **No mock fallback**. All queries and mutations operate directly against real PostgreSQL tables in Supabase.

---

## Environment Keys & User Requirements Status
In `.env.local`:
1. `DATABASE_URL`: Add the verified pooler connection string:
   `postgresql://postgres.uoiodhmahcpwedwajdtd:VncVw2WsMG3RL70u@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`
2. `NEXT_PUBLIC_SUPABASE_URL`: Set to `https://uoiodhmahcpwedwajdtd.supabase.co`
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public API key (optional for server pg queries, but needed for browser-side PostgREST / Supabase Realtime). Found in **Supabase Dashboard $\to$ Project Settings $\to$ API $\to$ `anon` / `public`**.
4. `SUPABASE_SERVICE_ROLE_KEY`: Supabase service_role secret key (found in **Supabase Dashboard $\to$ Project Settings $\to$ API $\to$ `service_role`**).

---

## Decisions or Assumptions
1. **Zero Mock Fallback**:
   - The application connects directly to the real Supabase PostgreSQL database via connection-pooled PostgreSQL client (`pg`) and `@supabase/supabase-js`.
2. **Schema Migration Execution**:
   - Create and execute `supabase/migrations/0001_initial_schema.sql` on the live database, establishing:
     - `organizations`
     - `sites`
     - `site_devices`
     - `telemetry_snapshots`
     - `telemetry_hourly`
     - `site_alarms`
     - `maintenance_services`
     - `maintenance_tickets`
     - Compound indexes on `(site_id, bucket_timestamp desc)` and `(org_id)`
3. **Multi-Tenant Scoping by Clerk Organization (`clerk_org_id`)**:
   - Extract the active `clerk_org_id` via `@clerk/nextjs/server`'s `auth()`.
   - When a user logs in, if their Clerk organization does not exist in `public.organizations`, the system automatically provisions it and seeds 3 distinct demo sites directly in Supabase PostgreSQL:
     - **Site 1: Bakersfield Central Solar-Plus-Storage** (`has_solar: true`, `has_bess: true`, `has_grid: true`, `has_dg: false`) — 940 kWp Solar, 1,500 kWh BESS (84.2% SoC), Grid Import/Export, No DG.
     - **Site 2: Mojave Desert Industrial Microgrid Alpha** (`has_solar: true`, `has_bess: true`, `has_grid: true`, `has_dg: true`) — 1,450 kWp Solar, 2,200 kWh BESS (71.0% SoC), 800 kVA DG Genset, Grid Interconnection.
     - **Site 3: Sonora Valley Agri-Voltaics & Peaker** (`has_solar: true`, `has_bess: false`, `has_grid: true`, `has_dg: true`) — 1,030 kWp Solar, No BESS, 600 kVA DG Genset, Grid Interconnection.
   - For each site, insert real hardware devices in `site_devices`, latest state in `telemetry_snapshots`, and 30 days of hourly rollup records in `telemetry_hourly`.
4. **Fleet Cockpit Card Aggregation (`app/page.tsx`)**:
   - Dynamically queries real sites and live telemetry snapshots from Supabase PostgreSQL.
   - Initial card displays:
     - Instantaneous power flows (`solar_power_kw`, `load_power_kw`, `bess_power_kw`, `grid_power_kw`)
     - Battery SoC % (if `has_bess`)
     - Daily yield accumulation (`solar_yield_today_kwh`)
     - Individual badges for active assets (Solar, BESS, DG, Grid)
   - Cards link directly to `/sites/[id]`.
5. **Site Drilldown Route (`app/sites/[id]/page.tsx`)**:
   - Resolves tenant organization and verifies site belongs to the active organization.
   - Renders time-range interval tabs: **Today (24h hourly)**, **7 Days (daily rollup)**, **30 Days (daily rollup)**.
   - Queries `telemetry_hourly` directly from Supabase PostgreSQL to render dynamic historical dispatch energy balance charts (Solar PV, BESS charge/discharge, Grid import/export, DG generation, Load consumption).
   - Dynamically adapts asset telemetry panels based on enabled assets (`has_bess`, `has_dg`, `has_solar`, `has_grid`).

---

## Files Likely to Change / Be Created
1. `.env.local`: Add `DATABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`.
2. `package.json`: Add `@supabase/supabase-js` (and `pg` already installed).
3. `supabase/migrations/0001_initial_schema.sql`: Full PostgreSQL schema DDL.
4. `lib/supabase/db.ts`: PostgreSQL connection pooler and query executor connecting directly to live Supabase DB.
5. `lib/supabase/client.ts` & `lib/supabase/server.ts`: Supabase JS client factories.
6. `lib/energy/site-service.ts`: Real Supabase database queries for tenant resolution, site seeding, snapshot fetching, and historical time-series analytics.
7. `app/page.tsx`: Connect Fleet Cockpit to fetch real data from Supabase.
8. `components/design-system/site-cockpit-card-preview.tsx`: Update card navigation and asset badges to reflect real site data.
9. `app/sites/[id]/page.tsx`: Dedicated site command center with time-range tabs and real telemetry queries.
10. `components/analytics/historical-dispatch-chart.tsx`: Neon cyberpunk stacked area dispatch chart.

---

## Implementation Requirements

### 1. Execute Real Database Schema Migration
- Create `supabase/migrations/0001_initial_schema.sql` and execute it directly via the pooler client to create:
  - `organizations` (`id`, `clerk_org_id`, `name`, `slug`, `tier`, `status`, `created_at`, `updated_at`)
  - `sites` (`id`, `org_id`, `name`, `slug`, `location_city`, `location_state`, `plant_type`, `status`, capacities, `has_solar`, `has_bess`, `has_dg`, `has_grid`, tariffs)
  - `site_devices` (`id`, `site_id`, `name`, `category`, `manufacturer`, `model`, `is_online`)
  - `telemetry_snapshots` (`site_id`, `timestamp`, live power flows, SoC %, SoH %, daily accumulations)
  - `telemetry_hourly` (`id`, `site_id`, `bucket_timestamp`, solar, bess, load, grid, dg, cost saved)
  - `site_alarms` (`id`, `site_id`, `severity`, `code`, `title`, `is_cleared`, `triggered_at`)
  - Indexes on `(site_id, bucket_timestamp desc)` and `(org_id)`.

### 2. Live Supabase Query Layer (`lib/energy/site-service.ts`)
- `getOrCreateOrg(clerkOrgId, orgName)`: Auto-creates tenant organization in Supabase if not present.
- `seedDemoSitesIfEmpty(orgId)`: Checks `public.sites` in Supabase for `orgId`. If 0 sites exist, seeds the 3 diverse sites, their devices, live snapshot, and 30 days (720 hourly records) of telemetry in `telemetry_hourly`.
- `getSitesForOrg(clerkOrgId)`: Queries `public.sites` joined with `public.telemetry_snapshots` strictly filtered by `clerk_org_id`.
- `getSiteDetails(clerkOrgId, siteId)`: Queries a specific site, ensuring it belongs to `clerk_org_id`.
- `getSiteHourlyAnalytics(siteId, range: 'today' | '7d' | '30d')`: Queries `public.telemetry_hourly` for real time-series dispatch curves.

### 3. Home View Integration (`app/page.tsx`)
- Server Component resolving active `clerk_org_id` from `@clerk/nextjs/server`.
- Calls `getSitesForOrg(orgId)` to retrieve real sites from Supabase.
- Computes fleet-wide live MW, MWh, and average SoC % directly from live database records.

### 4. Site Drilldown Route (`app/sites/[id]/page.tsx`)
- Server Component resolving `clerk_org_id` and `params.id`.
- Renders site header with location, nameplate capacities, and live operational status.
- Renders time-range tabs (**Today**, **7 Days**, **30 Days**) fetching historical hourly dispatch data from Supabase.
- Renders hardware telemetry cards (BESS cell thermals & SoC if `has_bess`, DG genset fuel & hours if `has_dg`, Inverter PR % for `has_solar`, Grid THD & power factor for `has_grid`).

---

## Design System & Visual Adherence
- **Void Black Background**: `#060709`.
- **Obsidian Dark Cards**: `#0B0D13` with `border-white/[0.08]` and subtle hover glow.
- **Brand Accents**: Neon Pink `#FF2A85`.
- **Asset Swatches**:
  - Solar: Electric Amber `#FFD600`
  - BESS: Laser Cyan `#00F0FF`
  - Grid: Electric Purple `#9D4EDD`
  - DG: Hi-Viz Orange `#FF6B00`
  - Load: Neon Pink `#FF2A85`
- **Monospace Metrics**: All values ($kW$, $kWh$, $\%$, $Hz$) use `font-mono`.
- **Mobile Ergonomics**: Minimum $\ge 48\times 48\text{px}$ touch targets across all tabs and buttons.

---

## Acceptance Criteria
- [ ] Real schema migration executed successfully on live Supabase PostgreSQL instance.
- [ ] No mock fallback logic: all data flows directly to and from Supabase PostgreSQL.
- [ ] User's Clerk organization is dynamically resolved and provisioned in Supabase.
- [ ] 3 demo sites with differing asset types (Site 1: Solar+BESS+Grid; Site 2: Solar+BESS+DG+Grid; Site 3: Solar+DG+Grid) are seeded in PostgreSQL.
- [ ] Fleet Cockpit home cards display live daily yield, power flows, and asset badges from Supabase.
- [ ] Clicking any card opens `/sites/[id]`.
- [ ] `/sites/[id]` renders historical dispatch charts switchable across **Today**, **7 Days**, and **30 Days** using real `telemetry_hourly` records.
- [ ] Asset cards adapt strictly to the site's enabled hardware.
- [ ] `npm run build` and `npx tsc --noEmit` pass with 0 errors.

---

## Checks to Run
1. `npm run typecheck` / `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)

### Desktop Viewport (1440 x 900)
1. Run `npm run dev` and navigate to `http://localhost:3000/`.
2. Verify the Fleet Cockpit loads 3 real sites from Supabase under your active Clerk organization.
3. Verify each card shows its specific assets (Site 1 has Solar+BESS+Grid; Site 2 has Solar+BESS+DG+Grid; Site 3 has Solar+DG+Grid).
4. Click on **Mojave Desert Industrial Microgrid Alpha**:
   - Verify URL is `/sites/<site-id>`.
   - Verify site header displays name, location, and operational mode badge.
   - Verify historical dispatch chart renders data from `telemetry_hourly`.
   - Toggle between **Today**, **7 Days**, and **30 Days** to verify time-series chart updates.
   - Verify DG metrics (fuel %, run hours) are visible.
5. Return to home and click on **Bakersfield Central Solar-Plus-Storage**:
   - Verify BESS metrics are visible, and DG metrics are hidden.

### Mobile Viewport (390 x 844)
1. Open DevTools in device emulation mode ($390 \times 844$).
2. Verify Fleet Cockpit cards stack smoothly with touch targets $\ge 48\text{px}$.
3. Tap into a site: verify historical chart and asset metrics reflow cleanly within mobile width.
