# Site Detail Tabs & Dedicated Component Deep-Dive Pages (Solar, BESS, Grid, DG, Load)

## Goal
Transform the Site Detail Cockpit (`/sites/[id]`) from a single cluttered vertical scroll into an organized, control-room-grade tabbed workspace. Furthermore, establish dedicated, URL-addressable sub-pages for all 5 electrical assets (`/sites/[id]/solar`, `/sites/[id]/bess`, `/sites/[id]/grid`, `/sites/[id]/dg`, `/sites/[id]/load`) featuring deep telemetry, historical curves, predictive vs actual comparisons (e.g. Predicted Power vs Solar Power vs Load), string-level diagnostics, thermal heatmaps, TOU tariff overlays, and direct O&M actions.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Tabbed interface composition, high-contrast badges, buttons, responsive drawer integration)
- `.agents/skills/architect/` (Multi-tiered information architecture: Cockpit Overview $\to$ Side Drawer $\to$ Full Asset Deep Dive)
- `.agents/skills/clerk-orgs/` (Multi-tenant org-scoping and permissions across site sub-routes)
- `.agents/skills/supabase/` (Querying site records, devices, and historical telemetry series)

---

## Existing Code Inspected
- `app/sites/[id]/page.tsx`: Currently stacks Site Hero, `SchematicNodeFlow`, `EnergyFlowVisualizer`, `HistoricalDispatchChart`, and Hardware Devices vertically on one page.
- `components/energy-flow/telemetry-drawer.tsx`: Slide-over drawer displaying sub-second telemetry for the 5 nodes, currently lacking direct navigation links to deep-dive pages.
- `components/energy-flow/energy-flow-visualizer.tsx` & `components/energy-flow/schematic-node-flow.tsx`: Visualizers triggering the drawer upon node click.
- `lib/energy/flow-engine.ts`: Contains calculation models and interfaces for `SolarTelemetryDetails`, `BessTelemetryDetails`, `DgTelemetryDetails`, `GridTelemetryDetails`, `LoadTelemetryDetails`.
- `lib/energy/site-service.ts`: Queries site records, device inventories, and time-series telemetry buckets (`getSiteDetails`, `getSiteHourlyAnalytics`).

---

## Product Manager (PM) Information Architecture & User Experience

```
                                  [Fleet Cockpit] (/)
                                          │
                                          ▼
                               [/sites/[id] Site Detail]
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
   [Tab: Energy Flow]            [Tab: Dispatch & Analytics]       [Tab: SCADA & Hardware]
   • 5-Node Particle Canvas       • Stacked Dispatch Area Chart     • Inverters, BMS, PCS, Meters
   • Schematic Conduit View       • Self-Consumption & Savings      • Alarms & Event Log
   • Asset Quick-Pill Bar
        │ (Click Node)
        ▼
   [Telemetry Drawer] (Tier 1 Quick Triage)
   • Sub-second gauges
   • Action: [Open Full Deep-Dive ➔]
        │
        ▼ (Click Deep-Dive or Asset Pill)
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   TIER 2: DEDICATED ASSET DEEP-DIVE PAGES              │
 ├─────────────────┬─────────────────┬─────────────────┬──────────────────┤
 │ ☀️ /solar        │ 🔋 /bess        │ ⚡ /grid        │ 🛢️ /dg /load    │
 │ • Predicted vs  │ • SoC/SoH Curve │ • TOU Tariff    │ • DG Dispatch    │
 │   Actual vs Load│ • 16-Cell Heat  │   Arbitrage     │ • Fuel Burn Rate │
 │ • 24 MPPT Matrix│ • Coolant Loop  │ • Power Quality │ • Load Breakdown │
 │ • Inverter Fleet│ • NFPA 855 Fire │ • Peak MD Shave │ • Phase Balance  │
 └─────────────────┴─────────────────┴─────────────────┴──────────────────┘
```

### Two-Tier Inspection Pattern
1. **Tier 1 (Instant Drawer Triage)**: Fast, non-blocking drawer for immediate telemetry checks while keeping the live energy flow in view.
2. **Tier 2 (Full Asset Deep-Dive Hub)**: Dedicated URL-addressable sub-page with comprehensive historical trend lines, comparative forecasts, hardware matrices, and direct maintenance CTAs.

---

## Files Likely to Change
1. `app/sites/[id]/page.tsx` - Reorganize into cyber-styled tabs (`Energy Flow`, `Historical Analytics`, `Hardware SCADA`, `Site Alarms`), add Asset Quick-Switcher Pill Strip, and view toggle between Canvas and Schematic.
2. `components/energy-flow/telemetry-drawer.tsx` - Add `siteId` prop, and include prominent glowing buttons at top header and bottom footer linking directly to `/sites/[id]/[nodeType]`.
3. `components/energy-flow/energy-flow-visualizer.tsx` & `components/energy-flow/schematic-node-flow.tsx` - Pass `siteId` to drawer, add node action badges.
4. `components/site-detail/site-asset-nav.tsx` (New) - Shared top breadcrumb & asset switcher bar for deep-dive pages.
5. `app/sites/[id]/solar/page.tsx` (New) - Dedicated Solar PV & Inverter Performance Hub:
   - Predicted Power vs Actual Solar Power vs Facility Load multi-line chart with interval selector.
   - 24-channel MPPT string current & voltage table with mismatch alerts ($<85\%$ average).
   - Inverter fleet performance table (DC in, AC out, efficiency $\ge 98.4\%$, heatsink temp).
   - Irradiance, POA, GHI, module temp, and IEC 61724 PR % telemetry.
   - Quick action: Book Certified Solar Maintenance (drone IR, panel wash).
6. `app/sites/[id]/bess/page.tsx` (New) - Dedicated BESS Storage Hub:
   - SoC % & Charge/Discharge diurnal curve over 24h / 7d.
   - SoH % degradation tracking against warranty cycles.
   - 16-cell thermal & voltage heatmap grid with hot-spot detection and $\Delta V$ warning.
   - Liquid coolant loop, chiller compressor, and NFPA 855 fire sensor gauges.
   - Quick action: Schedule Certified BESS Service (coolant flush, cell balancing).
7. `app/sites/[id]/grid/page.tsx` (New) - Dedicated Utility Grid & Tariff Hub:
   - Grid Import/Export vs TOU Tariff Pricing slots chart ($/kWh arbitrage value).
   - Contracted Maximum Demand (MD) utilization and penalty shaving tracker.
   - 3-Phase power quality ($V_{12}, V_{23}, V_{31}$), frequency deviation (50.00 Hz), THD-V and THD-I harmonics.
8. `app/sites/[id]/dg/page.tsx` (New) - Dedicated Diesel Generator Hub:
   - DG Peaker dispatch vs microgrid deficit chart.
   - Fuel level % and burn rate ($L/hr$) curves.
   - Cumulative engine run hours, 250-hour oil/filter service countdown, starter battery voltage.
   - Fuel displacement savings ($ avoided, $kg\ CO_2$ avoided).
9. `app/sites/[id]/load/page.tsx` (New) - Dedicated Facility Load Hub:
   - Critical circuits vs sheddable HVAC load stacked profile.
   - Peak Demand vs Sanctioned Contracted MD gauge & threshold alerts.
   - 3-Phase current balance ($I_a, I_b, I_c$) and neutral conductor thermal protection.

---

## Design System & Visual Adherence
- **Color Palette Tokens**:
  - Void Black canvas (`#060709`) and Obsidian Dark card surfaces (`#0B0D13`).
  - Elevated cyber panels (`#121622`).
  - Neon Pink active indicators (`#FF2A85`) with pink glow shadows (`shadow-[0_0_15px_rgba(255,42,133,0.35)]`).
  - Electric Amber (`#FFD600`) for Solar, Laser Cyan (`#00F0FF`) for BESS, Electric Purple (`#9D4EDD`) for Grid, Hi-Viz Orange (`#FF6B00`) for DG, Cyber Emerald (`#00E676`) for Normal/Online.
- **Monospace Rule**:
  - All numerical parameters ($kW$, $MW$, $V$, $A$, $Hz$, $\%$, $kWh$, $^\circ C$, $\$ / kWh$) formatted with `font-mono`.
- **Mobile Ergonomics**:
  - Minimum tap target $48 \times 48\ px$ on all tab buttons and asset selector pills.
  - Horizontal swipeable tabs with touch indicators on mobile viewports.

---

## Security & RBAC Requirements
- All sub-routes (`/sites/[id]/solar`, etc.) verify the active Clerk organization context using `getSiteDetails(effectiveOrgId, siteId)` ensuring strict tenant isolation.
- Unauthenticated or unauthorized tenant access is blocked.

---

## Acceptance Criteria
1. **Tabs on Site Page**: `/sites/[id]` cleanly presents 4 tabs (`Energy Flow`, `Dispatch & Analytics`, `SCADA Hardware`, `Alarms & Events`) eliminating excessive vertical stacking.
2. **Topology Switcher**: In the Energy Flow tab, user can seamlessly toggle between the 5-Node Particle Flow Canvas and the Schematic Conduit View.
3. **Asset Quick-Pill Bar**: Instant navigation strip on `/sites/[id]` displaying live power for Solar, BESS, Grid, DG, and Load with 1-click links to deep dives.
4. **Drawer Linkage**: Clicking any node opens the slide-over drawer with an actionable button `[Deep-Dive [Node] Subsystem ➔]` that routes to `/sites/[id]/[nodeType]`.
5. **Dedicated Solar Page (`/sites/[id]/solar`)**:
   - Displays Predicted Power vs Actual Solar Power vs Facility Load chart.
   - Displays 24-channel MPPT string analysis with visual mismatch alerts.
   - Displays Inverter fleet metrics table and PR % / weather telemetry.
6. **Dedicated BESS, Grid, DG, and Load Pages**: Each provides deep domain-specific telemetry, charts, and hardware gauges matching industrial specifications.
7. **Zero TypeScript Errors & Lint Cleanliness**: `npm run build` passes with zero errors.

---

## Checks to Run
- `npm run typecheck` or `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Site Detail Tabs**:
   - Navigate to `/sites/[site-id]`.
   - Verify the 4 tabs (`Energy Flow`, `Dispatch & Analytics`, `SCADA Hardware`, `Alarms & Events`).
   - Switch between tabs and confirm smooth rendering without layout jumps.
2. **Topology Toggle**:
   - On the `Energy Flow` tab, switch between "Particle Flow Canvas" and "Schematic Conduit View".
3. **Telemetry Drawer to Deep-Dive Navigation**:
   - Click the "Solar PV Array" node.
   - Confirm the drawer slides open.
   - Click `[Deep-Dive Solar Subsystem ➔]`.
   - Verify navigation to `/sites/[id]/solar`.
4. **Solar Deep-Dive Verification**:
   - Verify the Predicted vs Actual vs Load comparison chart renders with clear legends.
   - Check the 24-channel MPPT string matrix and inverter fleet table.
   - Use the top asset switcher to toggle directly to `/sites/[id]/bess`.
5. **BESS, Grid, DG, Load Deep-Dives**:
   - On BESS page, inspect the 16-cell thermal heatmap and SoC cycle curve.
   - On Grid page, inspect TOU tariff rate overlay and power quality metrics.
   - On DG page, check fuel burn rate and service countdown.
   - On Load page, check load composition and maximum demand threshold.
6. **Mobile Viewport Test ($390 \times 844$)**:
   - Confirm horizontal scrolling on asset pills and tabs.
   - Ensure touch targets satisfy $\ge 48\ px$.
