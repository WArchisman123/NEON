# Feature Spec 3: Power Consumption & Historical Analytics (Workspace at /analytics & "History and analytics" Tab at /sites/[id])

## Goal
Implement **Feature Spec 3: Power Consumption & Historical Analytics** in two synchronized locations:
1. **Dedicated Analytics Workspace (`/analytics`)**:
   - Replaces the 404 route linked in the desktop sidebar and mobile bottom bar.
   - Includes an interactive **Site Selector Dropdown** allowing users to switch between any site in their organization (e.g. *Apex Hybrid Park*, *Bakersfield Central*, *Sonora Valley*) or deep link via `?siteId=[id]`.
2. **Site Detail Screen Tab (`/sites/[id]`)**:
   - Rename the second tab from "Historical Dispatch & Balance" to **"History and analytics"** (`📊 History and analytics`).
   - Embed the full analytics engine inside this tab, pre-scoped to the active site.

Both surfaces deliver stacked area dispatch curves, TOU tariff arbitrage calculations, BESS round-trip efficiency (RTE %) and degradation curves, peak demand penalty shaving analysis, and exportable ESG carbon offset reports (1-click CSV download and official corporate ESG statement modal).

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Tabs, dialog modal, dropdown select, high-contrast badges)
- `.agents/skills/clerk-orgs/` (Multi-tenant org scoping to fetch user's sites)
- `.agents/skills/supabase/` (Querying `telemetry_hourly` and site configurations)

---

## Existing Code Inspected
- `public/context/doc.md` (Section 7): Complete product specifications for Power Consumption & Historical Analytics.
- `public/context/ui_doc.md` (Section 8): UI specifications for the Stacked Area Energy Balance chart and metrics.
- `public/context/api_doc.md` (Section 7): Specifications for `GET /api/v1/sites/:id/analytics/consumption` and `GET /api/v1/sites/:id/analytics/arbitrage`.
- `components/site-detail/site-detail-view.tsx`: Currently has tab `📊 Historical Dispatch & Balance`.
- `lib/energy/site-service.ts`: Has `getSitesForOrg`, `getSiteDetails`, `getSiteHourlyAnalytics`.

---

## Technical Architecture & Reusable Component Strategy

```
                               ┌────────────────────────────────┐
                               │ PowerConsumptionWorkspace       │
                               │ (components/analytics/)        │
                               └───────────────┬────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
             [/analytics Route]                         [/sites/[id] Route]
         • Full page workspace                       • Tab: "History and analytics"
         • Includes Site Selector dropdown           • Pre-scoped to active site
         • Switch across all org sites               • No redundant site selector
```

### Core Modules within `PowerConsumptionWorkspace`:
1. **Stacked Energy Balance & Dispatch Chart**:
   - Stacked area curves for Solar PV (`#FFD600`), BESS Discharge (`#00F0FF`), Grid Import (`#9D4EDD`), and DG Peaker (`#FF6B00`).
   - Facility Load Demand line overlay (`#FF2A85`).
   - Timeframe switcher: `Today (15m/Hourly)`, `Last 7 Days`, `Last 30 Days`, `Year-to-Date (YTD)`.
   - Hover inspection displaying energy mix percentages.
2. **4-Metric Performance Strip**:
   - Solar Self-Consumption Ratio %
   - BESS Peak Shaved kWh & Peak Tariff Cut ($)
   - Diesel Fuel Displaced (Liters & $ saved)
   - Carbon Offset ($kg\ CO_2$ avoided)
3. **TOU Tariff Arbitrage & Peak Demand Shaving**:
   - Financial yield from charging off-peak and discharging at peak.
   - Maximum Demand (MD) shaving ($1,280/mo avoided penalty charges).
4. **BESS Round-Trip Efficiency & Health Degradation**:
   - Historical RTE % ($\frac{\text{Discharge MWh}}{\text{Charge MWh}} \times 100$) with $<85\%$ alert threshold.
   - SoH % degradation tracking against warranty cycles.
5. **ESG Carbon Abatement & Export Tools**:
   - 1-click **Download Dispatch CSV** button.
   - **View ESG Compliance Statement** modal with verified corporate certificate, site details, equivalent trees planted, and printable action.

---

## Files Likely to Change / Be Created
1. `lib/energy/analytics-engine.ts` (New):
   - Computes self-consumption %, TOU arbitrage savings, peak shaving, RTE %, and carbon offset.
   - Generates CSV string for export.
2. `app/api/v1/sites/[id]/analytics/consumption/route.ts` (New):
   - REST API endpoint for time-series consumption data and aggregates.
3. `app/api/v1/sites/[id]/analytics/arbitrage/route.ts` (New):
   - REST API endpoint for TOU peak shaving and financial yield.
4. `components/analytics/esg-compliance-modal.tsx` (New):
   - Interactive cyber-styled ESG statement dialog.
5. `components/analytics/power-consumption-workspace.tsx` (New):
   - Reusable client workspace used on `/analytics` and `/sites/[id]`.
6. `app/analytics/page.tsx` (New):
   - Workspace page resolving Clerk org, listing sites, and rendering `PowerConsumptionWorkspace` with site dropdown.
7. `components/site-detail/site-detail-view.tsx` (Update):
   - Rename second tab to **"History and analytics"** (`📊 History and analytics`).
   - Replace old chart with `PowerConsumptionWorkspace` pre-scoped to `site`.

---

## Design System & Visual Adherence
- Void Black canvas (`#060709`), Obsidian Dark cards (`#0B0D13`), Neon Pink accents (`#FF2A85`).
- Font-mono for all electrical metrics ($kW$, $MWh$, $\$$, $\%$, $kg\ CO_2$, $\$ / kWh$).
- Touch targets $\ge 48 \times 48\ px$ on mobile viewports.

---

## Acceptance Criteria
1. `/analytics` renders the Power Consumption & Historical Analytics workspace with a working Site Selector dropdown to switch between sites.
2. `/sites/[id]` has its tab renamed to **"History and analytics"** and embeds the full analytics engine scoped to that site.
3. Stacked Energy Balance chart displays Solar, BESS discharge, Grid import, DG generation, and Facility Load line across Today, 7d, 30d, and YTD.
4. TOU Arbitrage, Peak Shaving, and BESS RTE % cards calculate numbers accurately based on site nameplate and tariff settings.
5. Clicking "Export Dispatch CSV" triggers a `.csv` download.
6. Clicking "View ESG Compliance Statement" opens the certified corporate ESG dialog.
7. Zero TypeScript errors, zero lint warnings, clean build.

---

## Checks to Run
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

---

## Exact Manual Test Steps
1. Open `/sites/[id]` and click the newly renamed **`📊 History and analytics`** tab:
   - Verify the stacked area dispatch chart, TOU arbitrage, BESS RTE %, and carbon offset modules render.
   - Click timeframe buttons (`Today`, `7 Days`, `30 Days`, `YTD`).
   - Click **Download Dispatch CSV** and verify file download.
   - Click **View ESG Statement** and verify modal opens.
2. Open `/analytics`:
   - Verify the page loads cleanly without 404 errors.
   - Use the **Site Selector** dropdown to switch between *Bakersfield Central*, *Apex Hybrid Park*, and *Sonora Valley*.
   - Confirm all charts and metrics re-render based on the selected site.
