# Implementation Prompt: Topnav Site Switcher & Metering-Focused Individual Site EMS View

## Goal
Transform NEON's primary user journey to load the **Individual Site EMS View by default** upon opening the app, integrate an industrial-grade **Site Switcher** directly in the top navigation bar, incorporate the exact edge device telemetry payload (3-phase voltages, currents, harmonics, 4 MPPT strings, cumulative and daily active/reactive/PV/load/grid-sell/grid-buy energy counters), and simplify the site UI/UX with clean **in-page tabs** modeled after the competitor analysis in [`COMPETITOR_EMS_METERING_BREAKDOWN.md`](file:///C:/Users/hp/Desktop/git/NEON/neon/public/context/COMPETITOR_EMS_METERING_BREAKDOWN.md). The Fleet Cockpit (`FleetCockpitView`) is preserved in code and remains accessible.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: UI primitives (Select, DropdownMenu, Tabs, Badges, Cards, Table, Dialog) adhering to Tailwind styling and accessibility rules.
- `.agents/skills/clerk-orgs/`: Multi-tenant organization scoping, single-site RBAC enforcement (`client`, `field_technician`, `site_engineer`).
- `.agents/skills/clerk-nextjs-patterns/`: Next.js App Router server authentication, session checks, zero-flicker SSR hydration.
- `.agents/skills/supabase/`: Supabase client data retrieval and realtime updates for site telemetry snapshots.

---

## Existing Code Inspected
- [`app/page.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/app/page.tsx): Current root page loading `FleetCockpitView`.
- [`app/sites/[id]/page.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/app/sites/[id]/page.tsx): Server Component rendering individual site details.
- [`components/layout/topbar.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/topbar.tsx): Sticky topnav containing Clerk OrganizationSwitcher, brand logo, invite CTA, and ThemeToggle.
- [`components/layout/neon-app-shell.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/neon-app-shell.tsx): Main application wrapper with DesktopSidebar and MobileBottomBar.
- [`components/site-detail/site-detail-view.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/site-detail-view.tsx): Existing site detail view with sub-drawers.
- [`lib/energy/types.ts`](file:///C:/Users/hp/Desktop/git/NEON/neon/lib/energy/types.ts): TypeScript interfaces for `SiteRecord`, `SiteDeviceRecord`, and `HourlyTelemetryRecord`.
- [`lib/energy/site-service.ts`](file:///C:/Users/hp/Desktop/git/NEON/neon/lib/energy/site-service.ts): Server queries fetching site lists, snapshots, and hourly telemetry.
- [`public/context/COMPETITOR_EMS_METERING_BREAKDOWN.md`](file:///C:/Users/hp/Desktop/git/NEON/neon/public/context/COMPETITOR_EMS_METERING_BREAKDOWN.md): Extracted competitor breakdown of VoltTrack EMS with 18 screenshot references.

---

## Decisions or Assumptions
1. **Default App Route (`app/page.tsx`)**:
   - When the user visits `/`, the server loads the organization's sites via `getSitesForOrg(clerkOrgId)`.
   - The first site (`sites[0]`) is selected as the default active site and rendered with full SSR hydration into the new metering-focused `SingleSiteEmsView`.
   - If an optional `?site=` query parameter or route param is supplied, it loads that specific site.
   - The original `FleetCockpitView` is preserved in code and can be navigated to via a clean "Fleet Cockpit" toggle or dedicated `/fleet` route.
2. **Topnav Site Switcher (`SiteSwitcher`)**:
   - Positioned in `components/layout/topbar.tsx` adjacent to the organization badge/switcher.
   - Mimics the competitor's header component `[BESS Site A ˅]`: displays current site name, plant type badge, active status dot, and a dropdown menu listing all sites assigned to the user/org with quick search and selection.
   - Fully responsive: collapses cleanly on mobile viewports with a minimum $48 \times 48\ px$ touch target.
3. **Edge Device Telemetry Modeling**:
   - The user provided the exact edge device payload:
     ```json
     {
       "DayActive PowerWh": 14.2,
       "DayReactive PowerWh": -14.9,
       "Total_Active_PowerWh": 22950707.2,
       "Total Reactive PowerWh": 0.0,
       "Total Work time": 0.0,
       "inverter efficiency": 0.0,
       "Grid voltage AB": 0.1,
       "Grid voltage BC": 0.0,
       "Grid voltage AC": 18.5,
       "Grid voltage A": 0.0,
       "Grid current A": 0.3,
       "Grid frequency": 49.9,
       "Input active power": 0.0,
       "output apparent power": 6.1,
       "Output active power": 0.0,
       "Output reactive power": 0.0,
       "power factor": 0.0,
       "historyPV PowerWh": 27898675.2,
       "Day PV PowerWh": 16.0,
       "Dc voltage 1": 242.1,
       "Dc current 1": 0.1,
       "Dc voltage 2": 227.3,
       "Dc current 2": 0.1,
       "Dc voltage 3": 0.0,
       "Dc current 3": 0.0,
       "Dc voltage 4": 0.0,
       "Dc current 4": 0.0,
       "Day Load Power Wh": 0.0,
       "history Load Power": 37749312.0,
       "Meter active power": 361758820.0,
       "Day GridSell Power Wh": 45.0,
       "history GridSell_Power": 131081.0,
       "Day GridBuy Power Wh": 0.0,
       "history GridBuy Power": 4.0
     }
     ```
   - An adapter utility `transformEdgeDeviceTelemetry(payload)` will parse and format Wh to kWh/MWh, extract line-to-line voltages ($V_{AB}, V_{BC}, V_{AC}$), line current ($I_A$), grid frequency ($49.9\ Hz$), apparent power ($6.1\ kVA$), and 4 DC MPPT strings.
4. **Simplified In-Page Tabs UI/UX**:
   - Replace complex nested sub-route navigation with high-performance in-page tabs on the site view:
     - **Tab 1: Dashboard / Overview** (KPI strip, 3D/Isometric topology flow, System Voltage & Load Current waveforms).
     - **Tab 2: Metering & Power Quality** (3-phase live table, Voltage/Current THD %, Harmonic spectrum up to 25th harmonic, 15-min rolling demand curve, 3-tier energy billing counters, meter device inventory).
     - **Tab 3: Inverter / Solar MPPT** (4-string DC telemetry table with $V_{dc}, I_{dc}, P_{dc}$, conversion efficiency %, AC/DC power).
     - **Tab 4: BESS & Health** (Pack voltage/current, SOC %, SOH %, cell voltage spread, 7-year RUL projection, balancing CTAs).
     - **Tab 5: Safety & Controls** (Off-gas ppm monitoring, active interlocks, peak-shaving setpoint registers).
   - Designed desktop-first and optimized for mobile field operations.

---

## Files Likely to Change
1. `lib/energy/types.ts`: Add `EdgeDeviceTelemetry` interface and extend `SiteRecord` with structured edge metering fields.
2. `lib/energy/edge-telemetry-adapter.ts` (New): Parser and converter transforming raw edge device registers into normalized electrical metrics.
3. `components/layout/site-switcher.tsx` (New): Cyber-styled site selector dropdown with live status indicator and quick navigation.
4. `components/layout/topbar.tsx`: Incorporate `SiteSwitcher` and support passing active site and site list.
5. `components/site-detail/single-site-ems-view.tsx` (New/Revamped): Streamlined, tabbed EMS cockpit with metering focus, real-time gauges, and edge telemetry display.
6. `components/metering/live-metering-3phase-table.tsx` (New): Industrial 3-phase live telemetry table ($V_{LL}, V_{LN}, I, P, Q, S$, PF, Hz).
7. `components/metering/power-quality-harmonics-card.tsx` (New): IEEE 519 Voltage/Current THD gauges, 25th order harmonic bar chart, and phase imbalance meter.
8. `components/metering/energy-counters-billing-card.tsx` (New): Day and cumulative active/reactive/PV/Load/Grid-sell/Grid-buy energy counters.
9. `app/page.tsx`: Update root page to load the default active site with `SingleSiteEmsView` while keeping `FleetCockpitView` accessible.
10. `app/fleet/page.tsx` (New): Explicit dedicated route preserving the full Fleet Cockpit view.

---

## Implementation Requirements

### 1. Topnav Site Switcher
- Create `components/layout/site-switcher.tsx`.
- Accept `sites: SiteRecord[]`, `activeSiteId?: string`, and `onSiteSelect?: (siteId: string) => void`.
- Design: High-contrast Obsidian card (`#0B0D13`), Neon Pink hover glow, status pill (`Online` / `Degraded`), and dropdown with search filter and site capacity badges (e.g. `500 kWp Solar • 250 kWh BESS`).
- Embed inside `components/layout/topbar.tsx` with smooth mobile reflow.

### 2. Edge Device Telemetry Integration
- Create `lib/energy/edge-telemetry-adapter.ts`.
- Map all 32 fields from the edge payload:
  - `DayActive PowerWh` (14.2 Wh $\to$ 0.014 kWh)
  - `DayReactive PowerWh` (-14.9 VARh)
  - `Total_Active_PowerWh` (22,950,707.2 Wh $\to$ 22.95 MWh)
  - `historyPV PowerWh` (27,898,675.2 Wh $\to$ 27.90 MWh)
  - `Day PV PowerWh` (16.0 Wh)
  - `Day GridSell Power Wh` (45.0 Wh) | `history GridSell_Power` (131.08 kWh)
  - `Day GridBuy Power Wh` (0.0 Wh) | `history GridBuy Power` (0.004 kWh)
  - `history Load Power` (37,749,312.0 Wh $\to$ 37.75 MWh)
  - `Meter active power` (361,758,820.0 Wh $\to$ 361.76 MWh)
  - Grid voltages: $V_{AB}=0.1\ V, V_{BC}=0.0\ V, V_{AC}=18.5\ V, V_A=0.0\ V$
  - Grid current: $I_A=0.3\ A$
  - Frequency: $49.9\ Hz$
  - Apparent Power: $6.1\ kVA$
  - DC MPPT Strings:
    - String 1: $242.1\ V, 0.1\ A$ ($24.2\ W$)
    - String 2: $227.3\ V, 0.1\ A$ ($22.7\ W$)
    - String 3 & 4: $0.0\ V, 0.0\ A$

### 3. Core Metering & Power Quality Tab
- Implement `LiveMetering3PhaseTable.tsx` displaying per-phase $V_{LL}$, $V_{LN}$, $I$, $P$, $Q$, $S$, PF, and Hz.
- Implement `PowerQualityHarmonicsCard.tsx` displaying Voltage THD ($1.20\%$), Current THD ($3.00\%$), Phase Imbalance ($1.6\%$ GOOD), and clustered harmonic spectrum bar chart up to 25th harmonic.
- Implement `EnergyCountersBillingCard.tsx` displaying daily vs lifetime energy registers with clean tabular alignment and monospace numbers.
- Implement 15-minute rolling demand tracker comparing actual kW against contracted demand.

### 4. Simplified In-Page Navigation Architecture
- In `SingleSiteEmsView`, render responsive horizontal pill tabs:
  - `[Dashboard]`
  - `[Metering & Power Quality]` *(User's highlighted focus)*
  - `[Energy Flow]`
  - `[Inverter / Solar MPPT]`
  - `[BESS & Health]`
  - `[Safety & Controls]`
- Provide quick toggle link to `Fleet Cockpit` for managers with multi-site privileges.
- If user has single-site RBAC, the view seamlessly scopes directly to their site without distraction.

---

## Design System & Visual Adherence
- **Cyber Dark Mode (Default)**: Void Black (`#060709`), Obsidian Dark (`#0B0D13`), Cyber Glass (`#121622`), glowing Neon Pink (`#FF2A85`) accents.
- **High-Contrast Day Mode**: Solar Ice Canvas (`#F4F6FB`), Pure White Cards (`#FFFFFF`), Deep Charcoal Ink (`#0B0F19`).
- **Monospace Rule**: All electrical metrics ($kW, MWh, V, A, Hz, \%, kVAR, kVA$) rendered in `font-mono`.
- **Mobile Touch Target Ergonomics**: $\ge 48 \times 48\ px$ touch bounds for all switcher triggers, tabs, and buttons.

---

## Security & RBAC Requirements
- User identity and role resolved via Clerk (`syncUserAndOrgFromClerk()`).
- Single-site RBAC users are restricted to their assigned site; multi-site managers and superadmins can switch across all organization sites.
- Server Actions enforce tenant isolation with `clerk_org_id` scoping.

---

## Acceptance Criteria
1. Loading the application root (`/`) opens the individual site EMS view by default with the first site pre-selected.
2. The Topnav features a cyber-styled `SiteSwitcher` displaying the active site with a live status dot, allowing switching between sites.
3. The Fleet Cockpit view is preserved in code and remains accessible via `/fleet` and via a topnav/header shortcut.
4. The exact edge device telemetry payload is parsed, normalized, and displayed in the UI (3-phase voltages, currents, frequency, 4 MPPT DC strings, and energy counters).
5. The individual site page features responsive in-page tabs (Dashboard, Metering & Power Quality, Energy Flow, Inverter/MPPT, BESS & Health, Safety & Controls).
6. The Metering tab provides industrial 3-phase live metering, Voltage/Current THD, harmonic spectrum up to the 25th harmonic, phase imbalance gauge, and 15-minute rolling demand.
7. Both Cyber Dark and High-Contrast Day modes render with full contrast and 0 styling regressions.
8. TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors.

---

## Checks to Run
- `npm run typecheck` or `npx tsc --noEmit`: 0 errors.
- `npm run lint`: 0 errors.
- Manual browser verification on desktop ($1440 \times 900$) and mobile ($390 \times 844$).

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `http://localhost:3000/`. Verify the application loads directly into the **Individual Site EMS View** with the active site pre-selected.
2. Click the **Site Switcher** dropdown in the top navigation bar. Verify all sites appear with their live status dot and capacity badges. Click another site and confirm the view updates instantly.
3. Click the **Metering & Power Quality** tab. Verify the Live 3-Phase Metering table, Harmonic Spectrum (up to 25th harmonic), Phase Imbalance gauge, and 15-minute rolling demand chart render cleanly.
4. Verify the edge device telemetry values appear formatted (e.g., Grid frequency `49.9 Hz`, MPPT String 1 `242.1 V / 0.1 A`, Total Active Energy `22.95 MWh`, Day PV `16.0 Wh`, etc.).
5. Click the "Fleet Cockpit" button/link. Verify `/fleet` opens the full multi-site aggregate dashboard.
6. Toggle the Theme switch (top right). Verify full contrast in both Cyber Dark and Solar Day Light mode.
7. Test on mobile viewport ($390 \times 844$). Verify the topnav site switcher and in-page tabs have smooth touch targets ($\ge 48\ px$) and no horizontal overflow.
