# Implementation Prompt: Full Demo Data Seeding & Assignment for Organization `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`

## Goal
Perform a comprehensive database operation on the live Supabase PostgreSQL database (`mzumlzmfjgzvycebqask`) to ensure that organization **`org_3JgZ51s2g9LkRRE0L61kAXDGDWE`** (**iRasus Technologies**, UUID: `937c5bc8-63fb-4239-a719-53aa87a36876`) is fully populated with complete, high-fidelity demo data across all relational tables:
1. **Sites (`public.sites`)**: 3 multi-asset installations (Site 1: Solar+BESS+Grid, Site 2: Solar+BESS+DG+Grid, Site 3: Solar+DG+Grid) explicitly assigned to `org_id = 937c5bc8-63fb-4239-a719-53aa87a36876`.
2. **Devices (`public.site_devices`)**: 13 hardware assets (SMA/Sungrow/Huawei inverters, Tesla/Fluence BMS, Dynapower PCS, Cummins/CAT gensets, ION9000 meters) assigned to these sites.
3. **Live Snapshots (`public.telemetry_snapshots`)**: Sub-second active electrical power flow vectors (kW, SoC %, fuel %, today's yield kWh, CO2 saved).
4. **Hourly Analytics (`public.telemetry_hourly`)**: Full 30 days (720 hours per site = 2,160+ rows) of historical dispatch time-series records for stacked area analytics charts.
5. **Site Alarms (`public.site_alarms`)**: Active and historical faults/warnings (BESS cell $\Delta V$ imbalance, inverter clipping, DG fuel warning) for site alarms monitoring.
6. **Maintenance Tickets (`public.maintenance_tickets`)**: Active maintenance work orders (Drone IR thermography, BESS coolant flush) with scheduled dates, assigned crew, quote pricing, and status.

---

## Relevant Agent Skills
- `.agents/skills/supabase/` (`SKILL.md`): Direct PostgreSQL database seeding and verification.
- `.agents/skills/supabase-postgres-best-practices/` (`SKILL.md`): Relational data integrity, foreign key consistency, and performance.
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Multi-tenant scoping for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.

---

## Existing Code & Database State Inspected
1. `public.organizations`:
   - Contains `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` (`iRasus Technologies`, UUID: `937c5bc8-63fb-4239-a719-53aa87a36876`).
2. Current Table Populations for `iRasus Technologies`:
   - `public.sites`: 3 sites.
   - `public.site_devices`: 13 devices.
   - `public.telemetry_snapshots`: 3 snapshots.
   - `public.telemetry_hourly`: 2,163 records.
   - `public.site_alarms`: **0 records** (currently unpopulated).
   - `public.maintenance_tickets`: **0 records** (currently unpopulated).
3. The user specifically observed that demo data is missing or incomplete for their organization. We will run a deterministic idempotent seed script that guarantees every single table has active demo data linked to `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.

---

## Decisions or Assumptions
1. **Dedicated Organization Seeding Script (`scripts/seed-org-data.js`)**:
   - Resolve UUID for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` (`937c5bc8-63fb-4239-a719-53aa87a36876`).
   - Ensure the 3 sites are strictly assigned to this `org_id`.
   - Seed realistic system alarms in `public.site_alarms`:
     - **Critical**: BESS Rack 02 Thermal Runaway Interlock Warning.
     - **Warning**: String Inverter 02 MPPT Current Mismatch (Soiling / Fuse trip).
     - **Info**: Cummins Genset Weekly Auto-Exercise Test Completed.
   - Seed active maintenance tickets in `public.maintenance_tickets`:
     - Ticket `TCK-2026-0891`: BESS Liquid Coolant Loop Flush & BMS Calibration ($2,400, Assigned Crew: Delta Tech Crew A).
     - Ticket `TCK-2026-0842`: Drone IR Thermography & String Analysis ($1,250, Assigned Crew: SkyInspect Solar).
   - Ensure `public.telemetry_snapshots` and `public.telemetry_hourly` are fully intact for all 3 sites.
   - Also ensure fallback demo organizations (`org_demo_neon_energy` and `default_org`) maintain valid demo sites so switching organizations in the topbar never encounters an empty state.

---

## Files Likely to Change / Be Created
1. `scripts/seed-org-data.js`: Direct seeding script populating all 6 operational tables for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.
2. `lib/energy/site-service.ts`: Ensure alarms and tickets query helpers exist for the organization.

---

## Design System & Visual Adherence
- Adheres strictly to Cyber Black `#060709`, Obsidian `#0B0D13`, and Neon Pink `#FF2A85`.
- All electrical units formatted in `font-mono`.
- Minimum $48 \times 48\text{ px}$ touch targets on all interactive elements.

---

## Security & RBAC Requirements
- All records strictly scoped to `org_id = '937c5bc8-63fb-4239-a719-53aa87a36876'`.
- Row Level Security (RLS) remains active on all tables.
- No direct client-side raw SQL mutations.

---

## Acceptance Criteria
- [ ] `public.sites` contains 3 active sites assigned to `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.
- [ ] `public.site_devices` contains 13 hardware devices linked to these sites.
- [ ] `public.telemetry_snapshots` contains live telemetry for each site.
- [ ] `public.telemetry_hourly` contains 2,160+ records spanning 30 days.
- [ ] `public.site_alarms` contains active alarms for these sites.
- [ ] `public.maintenance_tickets` contains active tickets for `iRasus Technologies`.
- [ ] Database verification script confirms non-zero counts across all tables for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to Run
1. `node scripts/seed-org-data.js`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. In Supabase Dashboard Table Editor (`mzumlzmfjgzvycebqask`):
   - Check `sites`: verify `org_id` matches `937c5bc8-63fb-4239-a719-53aa87a36876`.
   - Check `site_alarms`: verify alarms exist linked to `iRasus Technologies` sites.
   - Check `maintenance_tickets`: verify tickets exist with `org_id` pointing to `iRasus Technologies`.
2. Open `http://localhost:3000/`:
   - Verify Fleet Aggregate Strip computes metrics from all 3 sites.
   - Verify alarm indicator displays active alarms.
   - Click into any site to see hardware devices and 30-day analytics charts.
