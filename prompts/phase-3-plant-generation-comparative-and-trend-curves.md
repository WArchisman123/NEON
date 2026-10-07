# Implementation Prompt: Phase 3 — Plant Generation Comparative Analysis & Multi-Day Trend Curves

## Goal
Implement **Phase 3** of the Competitor Gap Analysis and Feature Placement Strategy (`ref_img_2.png` and `ref_img_8.png`):
1. **Multi-Day Energy Trend Spline Curve** (`ref_img_8.png`):
   - Diurnal & multi-day generation curve with instant toggle between **Spline Line** and **Bar Chart**.
   - Date range selector (Last 7 Days, Last 14 Days, Last 30 Days, Custom Range).
   - KPI aggregate strip: Total Energy ($kWh/MWh$), Peak Day Generation ($kWh$ & Date), Daily Average Yield ($kWh/day$), Average CUF %, Average Specific Yield ($kWh/kWp$), Weather Curtailment Events.
   - One-click CSV and Excel export.
2. **4-Quadrant Analytical Correlation Grid** (`ref_img_2.png`):
   - **Quadrant 1 (Top-Left)**: Daily Energy Generation `[kWh]` bar chart with labeled bar values and hover inspection.
   - **Quadrant 2 (Top-Right)**: CUF Curve `[%]` daily capacity utilization factor bar chart.
   - **Quadrant 3 (Bottom-Left)**: Energy Generation `[kWh]` vs. CUF Curve `[%]` dual-axis chart (Bars: Energy Generation on Left Y-axis; Line: CUF % on Right Y-axis) with exact value badges per bar.
   - **Quadrant 4 (Bottom-Right)**: Energy Generation `[kWh]` vs. Specific Yield `[kWh/kWp]` dual-axis chart (Bars: Energy Generation on Left Y-axis; Line: Specific Yield $0–8\text{ kWh/kWp}$ on Right Y-axis).
   - Individual quadrant download and fullscreen/expand actions.
3. **Daily Generation Audit Table**:
   - Tabular log correlating Date, Actual Yield ($kWh$), Expected Baseline ($kWh$), Variance %, CUF %, Specific Yield ($kWh/kWp$), Peak Irradiance ($W/m^2$), and Weather Condition flags (Sunny, Cloud Curtailment, Rain).
4. **Clean Integration into App Workspaces**:
   - Add a dedicated **"📈 Plant Generation & Curves"** tab on `SiteDetailView` (`/sites/[id]`).
   - Add mode switcher on global `/analytics` page (`app/analytics/page.tsx`) to switch between "Power Mix & Dispatch Workspace" and "Plant Generation Comparative & 4-Quadrant Analysis".

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: Tabs, cards, tooltips, responsive grids, buttons, badges.
- `.agents/skills/clerk-orgs/`: Multi-tenant organization scoping.
- `.agents/skills/supabase/`: Site master records and hourly telemetry buckets.

---

## Existing Code Inspected
- `prompts/competitor-feature-gap-analysis-and-placement-strategy.md`: Full gap matrix and references for `ref_img_2` and `ref_img_8`.
- `components/site-detail/site-detail-view.tsx`: Site command center with Energy Flow, DGR tab, Analytics tab, and Alarms tab.
- `components/analytics/power-consumption-workspace.tsx`: Power consumption and dispatch workspace.
- `components/analytics/dgr-horizontal-report.tsx`: Daily Generation Report matrix from Phase 1.
- `app/analytics/page.tsx`: Global portfolio analytics view.
- `lib/energy/types.ts`: Telemetry models and energy interfaces.

---

## Decisions & Assumptions
1. **Mathematical Model Consistency**:
   - $\text{CUF } (\%) = (\text{Daily Energy } kWh / (\text{AC Capacity } kW \times 24)) \times 100$.
   - $\text{Specific Yield} = \text{Daily Energy } kWh / \text{DC Capacity } kWp$.
   - Realistic weather variances: e.g. cloudy day dip on 28-Sep down to ~84.48 kWh (matching competitor `ref_img_8.png`), followed by sunny days recovering to 320–480 kWh.
2. **Dual-Theme Design System Consistency**:
   - In Cyber Dark Mode: Obsidian surfaces (`#0B0D13`), Cyber Glass (`#121622`), Electric Amber (`#FFD600`) for Solar bars, Laser Cyan (`#00F0FF`) for CUF lines, Cyber Emerald (`#00E676`) for Specific Yield lines, Neon Pink (`#FF2A85`) for active tabs/hover cursors.
   - In High-Contrast Day Mode: Crisp Day White surfaces (`#FFFFFF`), Day Frost (`#EAEFF8`), High-Contrast Amber (`#D97706`), Deep Blue (`#0284C7`), Deep Charcoal typography (`#0B0F19`).
3. **Pure SVG / Canvas Visual Performance**:
   - All charts will be custom-engineered SVG with responsive viewboxes, crisp pixel alignment, hover crosshairs, and zero reliance on heavy unstyled third-party chart wrappers.
4. **Mobile Ergonomics**:
   - On screens $< 1024px$, the 4-quadrant grid reflows into a clean 2-column or 1-column scrollable stack.
   - All filter tabs, range toggles, and export buttons satisfy $\ge 48 \times 48\text{ px}$ touch target guidelines.

---

## Files Likely to Change & Created

### New Files
1. `components/analytics/plant-generation-comparative-hub.tsx`:
   - Master component containing the Multi-Day Trend Spline Curve (`ref_img_8.png`), 4-Quadrant Analytical Grid (`ref_img_2.png`), and Comparative Audit Table with CSV/Excel export.
2. `lib/energy/comparative-data-service.ts`:
   - Helper utility generating deterministic daily comparative metrics (Daily kWh, Expected kWh, CUF %, Specific Yield, Peak Irradiance, Weather conditions) for selectable date windows.

### Modified Files
1. `components/site-detail/site-detail-view.tsx`:
   - Add the dedicated tab `📈 Plant Generation & Curves` in the cyber tab bar.
2. `app/analytics/page.tsx`:
   - Add view mode switcher allowing fleet operators to toggle between "Energy Dispatch Workspace" and "Plant Generation Comparative & 4-Quadrant Analysis".

---

## Implementation Requirements

### 1. Multi-Day Energy Trend Spline Curve (`ref_img_8.png`)
- **Visual Switcher**: Smooth toggle between **Spline Curve** (smooth Bezier curve with gradient area) and **Bar Chart**.
- **Date Presets**: 7 Days, 14 Days (default), 30 Days.
- **Statistical Metric Strip**:
  - Total Energy in Period ($kWh$)
  - Peak Day Generation ($kWh$ & Date)
  - Average Daily Generation ($kWh/day$)
  - Average CUF %
  - Average Specific Yield ($kWh/kWp$)
  - Weather Dip / Curtailment Days count
- **Interactive Tooltip**: Hovering over any point reveals Date, Energy ($kWh$), CUF %, Specific Yield ($kWh/kWp$), and Weather Condition.

### 2. 4-Quadrant Analytical Correlation Grid (`ref_img_2.png`)
- **Quadrant 1: Energy Generation [kWh] Bar Chart**:
  - Vertical bars colored Electric Amber (`#FFD600`), with each bar's exact kWh value rendered directly above the bar.
  - Baseline expected yield dashed reference line.
- **Quadrant 2: CUF Curve [%] Bar Chart**:
  - Vertical bars colored Laser Cyan (`#00F0FF`), displaying daily Capacity Utilization Factor with reference line at 18% target.
- **Quadrant 3: Energy Generation [kWh] vs. CUF Curve [%] Dual-Axis Chart**:
  - Left Y-Axis: Energy Generation ($0–600\text{ kWh}$) as solid bars.
  - Right Y-Axis: CUF % ($0–30\%$) as a vibrant connected spline line with circular nodes.
  - Exact daily values labeled per bar.
- **Quadrant 4: Energy Generation [kWh] vs. Specific Yield [kWh/kWp] Dual-Axis Chart**:
  - Left Y-Axis: Energy Generation ($0–600\text{ kWh}$) as solid bars.
  - Right Y-Axis: Specific Yield ($0–8\text{ kWh/kWp}$) as a Cyber Emerald (`#00E676`) line.
  - Labeled values with clear unit indicators.

### 3. Comparative Audit Table
- Columns:
  - `Date`: e.g. `27-Sep-2026` to `10-Oct-2026`
  - `Actual Yield (kWh)`
  - `Expected Yield (kWh)`
  - `Variance (%)`
  - `CUF (%)`
  - `Specific Yield (kWh/kWp)`
  - `Peak Irradiance (W/m²)`
  - `Condition`: Sunny, Partial Cloud, Curtailment
- Pagination and CSV download.

---

## Design System & Visual Adherence
- **Cyber Dark Mode**: Void Black `#060709`, Obsidian `#0B0D13`, Cyber Glass `#121622`, glowing `#FF2A85` accents, `#FFD600` Solar Amber, `#00F0FF` Laser Cyan, `#00E676` Cyber Emerald.
- **High-Contrast Day Mode**: Solar Ice `#F4F6FB`, Pure White `#FFFFFF`, Day Frost `#EAEFF8`, Deep Charcoal `#0B0F19` typography.
- **Monospace Rule**: Strict `font-mono` on all numerical metrics ($kWh$, $kWp$, $\%$, $W/m^2$, $₹$).
- **Mobile Touch Targets**: All toggle buttons, range pills, and export buttons $\ge 48 \times 48\text{ px}$.

---

## Security & RBAC Requirements
- Multi-tenancy enforced through Clerk session org validation (`auth()`).
- Site queries scoped strictly to authenticated tenant organization.
- Export endpoints client-side generated to prevent server memory bloat.

---

## Acceptance Criteria
- [ ] Multi-day trend spline curve toggles cleanly between **Line** and **Bar** modes.
- [ ] 4-quadrant correlation grid reproduces `ref_img_2.png` with Energy bar chart, CUF bar chart, Energy vs CUF dual-axis chart, and Energy vs Specific Yield dual-axis chart.
- [ ] Dual-axis charts show clear left and right Y-axis tick marks and units ($kWh$, $\%$, $kWh/kWp$).
- [ ] Data table lists daily metrics with weather conditions and variance %.
- [ ] One-click CSV and Excel export works cleanly.
- [ ] Responsive reflow on desktop ($1440 \times 900$) and mobile ($390 \times 844$).
- [ ] Zero TypeScript errors (`npx tsc --noEmit`).
- [ ] Zero ESLint errors or warnings (`npm run lint`).
- [ ] Production Next.js build succeeds cleanly (`npm run build`).

---

## Checks to Run
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Exact Manual Test Steps (Desktop & Mobile)

### Desktop ($1440 \times 900$)
1. Navigate to `/sites/site-1`:
   - Click the new tab **"📈 Plant Generation & Curves"**.
   - Check the **Multi-Day Energy Trend Spline Curve** (`ref_img_8`):
     - Toggle between **Line** and **Bar** modes.
     - Switch date presets (7D, 14D, 30D).
     - Hover over the cloudy dip on 28-Sep to verify the tooltip reflects lower yield ($84.5\text{ kWh}$).
   - Scroll down to the **4-Quadrant Analytical Correlation Grid** (`ref_img_2`):
     - Quadrant 1: Verify daily kWh bars with value labels.
     - Quadrant 2: Verify CUF % bars.
     - Quadrant 3: Verify dual-axis Energy (left axis) vs CUF % (right axis).
     - Quadrant 4: Verify dual-axis Energy (left axis) vs Specific Yield $0-8\text{ kWh/kWp}$ (right axis).
   - Check the Daily Audit Table and click **"Export Comparative CSV"**.
2. Navigate to `/analytics`:
   - Verify the top switcher allows toggling to **"Plant Generation Comparative & 4-Quadrant Analysis"**.
   - Select another site from the dropdown and verify dynamic re-calculation.
3. Toggle between Dark and Light mode:
   - Verify all chart canvases, labels, grids, and numbers remain crisp and legible.

### Mobile ($390 \times 844$)
1. Switch to mobile emulation ($390 \times 844$).
2. Verify the 4 quadrants reflow into a clean 1-column card stack.
3. Verify all buttons meet the $\ge 48 \times 48\text{ px}$ touch target guideline.
4. Verify the audit table supports horizontal scrolling with sticky dates.
