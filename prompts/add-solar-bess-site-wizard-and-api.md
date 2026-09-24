# Implementation Prompt: Add Solar & BESS Site Wizard, Validation & Telemetry Ingestion Pipeline

## Goal
Implement a complete, production-grade "Add Site" / "Register Site" feature in **NEON ENERGY**:
1. **Interactive Cyber Modal Wizard (`AddSiteModal`)**:
   - An obsidian glassmorphism dialog adhering to the Void Black `#060709` / Elevated `#121622` / Neon Pink `#FF2A85` design tokens.
   - Quick preset templates ("Solar + BESS C&I", "Full Hybrid Microgrid", "Commercial Rooftop Solar", "BESS Peaker") for instant 1-click configuration.
   - 3 structured configuration sections:
     - **Identity & Location**: Site Name, Plant Type (`commercial_industrial`, `utility_microgrid`, `rooftop_hybrid`), City, State, Latitude & Longitude coordinates.
     - **Hardware Assets & Capacities**:
       - ☀️ Solar PV Array toggle (`has_solar`) & Nameplate Capacity ($kWp$).
       - 🔋 BESS Storage toggle (`has_bess`), Storage Capacity ($kWh$) & Inverter Rating ($kW$).
       - 🛢️ Diesel Generator toggle (`has_dg`) & Standby Capacity ($kVA$).
       - ⚡ Utility Grid toggle (`has_grid`) & Contracted Demand ($kVA$).
     - **Utility TOU Tariff Rates**: Peak Tariff Rate ($/kWh) and Off-Peak Tariff Rate ($/kWh).
   - Live configuration preview card showing active asset badges, total nameplate capacity, and tariff spread.
   - Robust form validation with clear inline cyber-styled error messages.
   - Submit button with glowing neon pink states, loading indicator, and success confirmation.
2. **Client API Layer (`lib/api/sites.ts`)**:
   - Export `createSite(payload: CreateSitePayload)` which triggers a real `POST /api/v1/sites` HTTP call visible in Chrome DevTools Network Tab.
3. **REST API Route Handler (`POST /api/v1/sites`) in `app/api/v1/sites/route.ts`**:
   - Scoped strictly to the caller's active Clerk Organization (`orgId`).
   - Role-based access validation (verifying active operator session).
   - Zod schema validation matching `public/context/api_doc.md` Section 5.3.
   - Returns standard success envelope with status `201 Created`.
4. **Domain & Database Persistence (`lib/energy/site-service.ts`)**:
   - `createSiteForOrg(orgId: string, input: CreateSiteInput)`:
     - Inserts the new site record into `public.sites` in Supabase PostgreSQL with safe parameterization.
     - Automatically generates URL-safe unique `slug`.
     - Automatically provisions default hardware devices in `public.site_devices` (inverter for solar, BMS & PCS for BESS, genset controller for DG, smart meter for grid).
     - Initializes `public.telemetry_snapshots` with realistic initial power flows and state gauges so the site immediately renders operational in cockpit cards and the 5-node energy flow visualizer.
     - Seeds initial 24-hour baseline in `public.telemetry_hourly` so historical analytics charts function immediately.
5. **Fleet Cockpit Integration (`components/dashboard/fleet-cockpit-view.tsx` & `app/page.tsx`)**:
   - Connect "Add Solar / BESS Site" button in the Home Page welcome banner.
   - Add a prominent "+ Add Installation" action button in `FleetCockpitView` adjacent to the search/filter bar.
   - On successful site creation, immediately call `refresh()` in `useSites` so the new installation appears in the site cards grid and updates the 5-metric aggregate strip without a full page reload.
   - Provide a direct link button in the success toast/state to jump straight into `/sites/:id` to view the live animated 5-node flow visualizer.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (`SKILL.md`): Dialog composition, input fields, accessible labels, button variants, and badge styling.
- `.agents/skills/supabase/` (`SKILL.md`): PostgreSQL data operations and Supabase service architecture.
- `.agents/skills/supabase-postgres-best-practices/` (`SKILL.md`): Parameterized queries, transactional consistency, indexing considerations, and schema fidelity.
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Multi-tenant organization scoping, role permissions, and tenant isolation.
- `.agents/skills/clerk-nextjs-patterns/` (`SKILL.md`): Clerk server session verification using `auth()` and `@clerk/nextjs/server`.

---

## Existing Code Inspected
1. `public/context/doc.md` (Sections 5, 6, 10):
   - Definition of `public.sites` schema, foreign key relations with `organizations`, default values, and column constraints.
   - Telemetry snapshot schema (`public.telemetry_snapshots`) and device categories (`public.site_devices`).
2. `public/context/api_doc.md` (Section 5.3):
   - REST endpoint specification for `POST /api/v1/sites`, including required fields, parameter types, and standard JSON envelope.
3. `public/context/ui_doc.md`:
   - Aesthetic tokens: Void Black `#060709`, Obsidian `#0B0D13`, Elevated `#121622`, Neon Pink `#FF2A85`, Electric Amber `#FFD600`, Laser Cyan `#00F0FF`, Hi-Viz Orange `#FF6B00`, Grid Purple `#9D4EDD`.
   - Monospace rule (`font-mono`) for all numerical capacities and tariffs.
   - Touch target ergonomics ($\ge 48\times 48\text{ px}$).
4. `public/context/role.md`:
   - Operator permissions for registering new sites.
5. `app/api/v1/sites/route.ts`:
   - Contains `GET /api/v1/sites`. Currently lacks `POST` handler.
6. `lib/api/sites.ts`:
   - Contains `getSites`, `getSite`, `updateSite`. Lacks `createSite`.
7. `lib/energy/site-service.ts`:
   - Contains `getOrCreateOrg`, `seedDemoSitesIfEmpty`, `getSitesForOrg`, `getSiteDetails`, and `generateHourlyTelemetryForSite`. Needs `createSiteForOrg`.
8. `components/dashboard/fleet-cockpit-view.tsx`:
   - Renders search, asset filters, and `SiteCockpitCard` grid. Needs modal trigger and refresh integration.
9. `app/page.tsx`:
   - Has commented-out `Add Solar / BESS Site` button on line 58.

---

## Decisions or Assumptions
1. **Multi-Tenant Scoping**:
   - The new site is bound directly to the active Clerk organization (`orgId`). If not present in the current session, it resolves through user organization memberships or falls back to the user's default organization created in `syncUserAndOrgFromClerk`.
2. **Device & Telemetry Auto-Provisioning**:
   - To prevent crashes or blank views when navigating to the newly created site's detail page (`/sites/[id]`), the creation pipeline will automatically provision:
     - Component devices in `public.site_devices` matching the active assets.
     - An initial row in `public.telemetry_snapshots` with realistic initial values (e.g. 82% BESS SoC, online state).
     - 24 hours of initial hourly rollups in `public.telemetry_hourly` so historical dispatch charts display immediately.
3. **Validation Rules**:
   - `name`: String, 2 to 100 characters.
   - `locationCity` & `locationState`: Required non-empty strings.
   - `plantType`: One of `'commercial_industrial'`, `'utility_microgrid'`, `'rooftop_hybrid'`.
   - Asset validation: At least one of `hasSolar`, `hasBess`, `hasDg`, or `hasGrid` must be true.
   - Capacity values: Non-negative floats. If an asset is disabled, its capacity is recorded as 0.
4. **Modal UX**:
   - Provide 4 preset buttons at the top of the modal so an operator or evaluator can populate realistic microgrid configurations in 1 click or customize every field manually.
   - Keyboard accessibility: Escape key closes modal, Enter submits when valid.

---

## Files Likely to Change / Be Created
1. `components/dashboard/add-site-modal.tsx` (New Component):
   - Cyber Black / Neon Pink modal dialog for registering a new solar and BESS site.
   - Preset selector, inputs for identity/location/assets/tariffs, validation errors, and submission handler.
2. `lib/energy/site-service.ts` (Update):
   - Add `CreateSiteInput` interface.
   - Add `createSiteForOrg(orgId: string, input: CreateSiteInput): Promise<SiteRecord>`.
3. `lib/api/sites.ts` (Update):
   - Add `CreateSitePayload` interface.
   - Export `createSite(payload: CreateSitePayload): Promise<{ success: boolean; data: SiteRecord }>`.
4. `app/api/v1/sites/route.ts` (Update):
   - Implement `POST` handler with Zod validation, Clerk org resolution, error handling, and `201 Created` response.
5. `components/dashboard/fleet-cockpit-view.tsx` (Update):
   - Integrate `AddSiteModal` state (`isAddSiteModalOpen`).
   - Add "+ Add Installation" button in controls header.
   - Refresh site list dynamically on success.
6. `app/page.tsx` (Update):
   - Wire the top session banner's "Add Solar / BESS Site" button to open the `AddSiteModal`.

---

## Implementation Requirements

### 1. `lib/energy/site-service.ts`
- Implement `createSiteForOrg(clerkOrgId: string, input: CreateSiteInput)`:
  - Resolve or create the organization record via `getOrCreateOrg(clerkOrgId)`.
  - Slugify `input.name` and ensure uniqueness.
  - Insert into `public.sites` with parameterized SQL.
  - Insert appropriate hardware devices into `public.site_devices`:
    - Solar Inverter (SMA / Sungrow) if `has_solar` is true.
    - BESS BMS & PCS (Tesla Megapack BMS / Dynapower CPS) if `has_bess` is true.
    - Diesel Generator Controller (Cummins / Caterpillar) if `has_dg` is true.
    - Smart Grid Meter (Schneider Electric ION9000) if `has_grid` is true.
  - Insert initial row into `public.telemetry_snapshots` with calculated initial power flows:
    - `solar_power_kw` = `input.solar_capacity_kwp ? input.solar_capacity_kwp * 0.8 : 0`
    - `bess_power_kw` = `input.has_bess ? -(input.bess_power_kw || 100) * 0.5 : 0` (charging)
    - `load_power_kw` = `Math.round((input.solar_capacity_kwp || input.bess_power_kw || 500) * 0.65)`
    - `grid_power_kw` = balanced net export/import.
    - `bess_soc_pct` = 82.5, `bess_soh_pct` = 99.4, `dg_fuel_pct` = 90.0.
  - Generate initial 24 hours of hourly records via `generateHourlyTelemetryForSite`.
  - Return the full `SiteRecord` with joined snapshot fields.

### 2. `lib/api/sites.ts`
- Define `CreateSitePayload`.
- Implement `createSite(payload: CreateSitePayload)` sending `POST` to `/api/v1/sites`.

### 3. `app/api/v1/sites/route.ts`
- Define Zod schema `createSiteSchema`.
- Implement `POST(req: NextRequest)`:
  - Auth resolution via Clerk `auth()`.
  - Validate body with `createSiteSchema.safeParse(body)`.
  - Call `createSiteForOrg(effectiveOrgId, parsedData)`.
  - Return JSON `{ success: true, data: newSite, message: "Site registered successfully" }` with HTTP 201.

### 4. `components/dashboard/add-site-modal.tsx`
- Dialog with backdrop blur `bg-black/85 backdrop-blur-md` and elevated card `bg-[#0B0D13] border border-white/[0.1]`.
- Glowing pink accent strip at top.
- Preset templates:
  - *Solar + BESS C&I*: 950 kWp Solar, 1,600 kWh BESS, 600 kW PCS, Grid intertie.
  - *Full Microgrid*: 1,200 kWp Solar, 2,000 kWh BESS, 500 kVA DG, 800 kVA Grid.
  - *Commercial Rooftop*: 450 kWp Solar, Grid tied (No BESS, No DG).
  - *BESS Standalone*: 2,500 kWh BESS, 1,000 kW PCS, Grid tied (No Solar, No DG).
- Asset toggle cards with color-coded badges (Electric Amber for Solar, Laser Cyan for BESS, Hi-Viz Orange for DG, Purple for Grid).
- Dynamic summary card updating in real time.
- Error banner and form validation alerts.
- Success confirmation banner with "View in Cockpit" or "Open 5-Node Flow Visualizer" action.

### 5. `components/dashboard/fleet-cockpit-view.tsx` & `app/page.tsx`
- Connect modal trigger to both:
  - Cockpit controls header: Button with `<Plus className="size-3.5" /> Add Installation`.
  - Top session welcome banner in `app/page.tsx`: Button `<Plus className="size-3.5" /> Add Solar / BESS Site`.
- Trigger `refresh()` from `useSites` upon modal completion to instantly show the new installation in the grid.

---

## Design System & Visual Adherence
- **Void Black Background**: `#060709`.
- **Obsidian Card & Modal**: `#0B0D13` with `#121622` inner containers.
- **Brand Primary & Glow**: `#FF2A85` with `shadow-[0_0_15px_rgba(255,42,133,0.35)]`.
- **Subsystem Accents**:
  - Solar: Electric Amber `#FFD600`
  - BESS: Laser Cyan `#00F0FF`
  - DG: Hi-Viz Orange `#FF6B00`
  - Utility Grid: Electric Purple `#9D4EDD`
- **Monospace Typography**: All capacities, units ($kWp, kWh, kVA, \$/kWh$), and coordinates must use `font-mono`.
- **Mobile Ergonomics**: All interactive toggles and buttons must satisfy $\ge 48\times 48\text{ px}$ touch targets.

---

## Security & RBAC Requirements
- Scoped strictly to the caller's active Clerk organization ID (`clerkOrgId`).
- Prevents cross-tenant injection or unauthorized site registration.
- Input validation sanitizes strings and enforces numeric capacity limits.
- Zero raw unparameterized SQL queries (strict parameterized query usage).

---

## Acceptance Criteria
1. Clicking "Add Solar / BESS Site" (in session banner or cockpit controls) opens the Cyber Black / Neon Pink modal.
2. Clicking any preset template instantly populates realistic coordinates, capacities, and asset toggles.
3. Form validation prevents submission if site name is empty or no assets are selected.
4. Submitting the form issues an authentic `POST /api/v1/sites` request inspectable in Chrome DevTools Network Tab.
5. The API inserts the site, its default hardware devices, its initial telemetry snapshot, and hourly records into Supabase PostgreSQL.
6. The new site instantly appears in the Fleet Cockpit grid, updates the 5-metric aggregate strip, and can be filtered/searched.
7. Clicking the newly created site opens `/sites/:id` where the animated 5-node flow visualizer, telemetry drawers, and historical analytics render smoothly without errors.
8. Fully responsive: displays cleanly on both desktop ($1440\times 900$) and mobile ($390\times 844$).
9. `npm run typecheck` and `npm run lint` pass with 0 errors.

---

## Checks to Run
- `npm run typecheck` (or `npx tsc --noEmit`): Must pass with 0 TypeScript errors.
- `npm run lint`: Must pass with 0 lint errors.

---

## Exact Manual Test Steps (Desktop & Mobile)

### Desktop ($1440 \times 900$)
1. Navigate to `http://localhost:3000/`.
2. Observe the "Add Solar / BESS Site" button in the top session banner and the "+ Add Installation" button in the Fleet Cockpit controls bar.
3. Click "+ Add Installation". The obsidian modal opens with smooth backdrop blur.
4. Click the "Full Hybrid Microgrid" preset button. Notice that Name, Plant Type, City, State, Solar kWp, BESS kWh, DG kVA, and Grid kVA are automatically filled with realistic numbers.
5. Edit the site name to "Apex Alpha Hybrid Microgrid #09".
6. Open Chrome DevTools Network tab.
7. Click "Register & Initialize Site". Observe the button loading state.
8. Verify in Network tab: `POST /api/v1/sites` returns status `201 Created` with the new site data.
9. Observe the modal showing success confirmation and the site automatically appearing in the Fleet Cockpit grid.
10. Click the new site card or "Open 5-Node Flow Visualizer" to navigate to `/sites/:id`. Verify that the animated energy flow visualizer, devices tab, and analytics charts load properly.

### Mobile ($390 \times 844$)
1. Switch browser to mobile responsive mode ($390 \times 844$).
2. Tap the "+ Add Installation" button.
3. Verify the modal opens as a responsive full-width view with comfortable touch targets.
4. Fill in or select a preset and submit.
5. Verify the new site card renders in the single-column mobile cockpit layout.
