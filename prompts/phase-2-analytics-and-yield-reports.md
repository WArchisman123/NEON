# Implementation Prompt: Phase 2 — Analytics & Yield Reports (Inverter-wise, Grid MFM, DG Reports)

## Goal
Implement **Phase 2** of the portal requirements extracted from the client's modifications sheet:
1. **Separated Inverter-wise, Grid MFM, and DG Reports**: Dedicated reporting views providing granular generation analytics for each asset type.
2. **Date-wise / Range Generation with Calendar Option**: Interactive calendar picker allowing single-date and date-range selection with day-by-day generation breakdowns.
3. **Monthly Generation Report**: Month-by-month historical yield table and comparative charts (Inverters, Grid Export/Import, DG, Peak kW, Specific Yield).
4. **Yearly Generation Report**: Multi-year generation report comparing actual yield vs. annual target (P50), degradation pacing, and carbon offset statements.
5. **Preserve Existing Grid Export Data in Grid MFM**: Full bidirectional grid export telemetry (active export kW, export kWh counters, export revenue credit, net billing).
6. **Strict Units Standard**: Instantaneous power in **kW**, yield and energy in **kWh** (and MWh for cumulative totals).

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Cyber Dark & High-Contrast Light theme token adherence, data tables, tabs, badges)
- `.agents/skills/clerk-orgs/` (Tenant-scoped telemetry and organization report downloads)
- `.agents/skills/supabase/` (Historical telemetry querying conventions)

---

## Existing Code Inspected
- `app/analytics/page.tsx`: Server component loading active site and hourly telemetry, rendering `AnalyticsMasterContainer`.
- `components/analytics/analytics-master-container.tsx`: Mode switcher between Power Consumption Workspace and Plant Comparative Hub. Will be expanded to support the new "Yield Reports Hub" (Inverter-wise, Grid, DG, Monthly, Yearly).
- `components/analytics/cyber-datetime-picker.tsx`: High-precision cyber calendar range picker with presets (`today`, `7d`, `30d`, `ytd`, `custom`) and dual date-time selector.
- `components/analytics/dgr-horizontal-report.tsx`: Daily generation report structure.
- `components/site-detail/tabs/metering-tab.tsx`: Existing Grid MFM portal with 3-phase live metrics and energy billing counters.

---

## Decisions or Assumptions
1. **Three Dedicated Asset Reporting Views**:
   - **Inverter-Wise Report**: Displays individual inverter power curves (INV-01, INV-02 in kW), daily yield (kWh), string currents, MPPT voltage, conversion efficiency %, and specific yield (`kWh/kWp`).
   - **Grid MFM Report**: Preserves and expands existing bidirectional grid export data, showing active export kW, export kWh yield, import kWh, power factor, phase voltages, and net export billing credit (₹).
   - **Diesel Generator (DG) Report**: Displays DG runtime hours, active load kW, generation yield in kWh, total diesel consumed (L), and specific fuel consumption (`0.28 L/kWh`).
2. **Three Reporting Time Horizons**:
   - **Date-wise / Range**: Custom calendar selection with daily granularity, peak generation kW, total kWh, and CSV export.
   - **Monthly**: 12-month breakdown (Jan - Dec) with inverter breakdown, grid export vs import, DG run, and PR %.
   - **Yearly**: Multi-year table (2024, 2025, 2026, Lifetime) with P50 Target vs. Achieved MWh, degradation analysis, and avoided CO₂ emissions.
3. **Dual-Theme Cyber Design System**:
   - Dark mode: Void Black (`#060709`), Obsidian (`#0B0D13`), Neon Pink (`#FF2A85`), Electric Amber (`#FFD600`), Laser Cyan (`#00F0FF`), Electric Purple (`#9D4EDD`), Hi-Viz Orange (`#FF6B00`).
   - Light mode: Solar Ice Canvas (`#F4F6FB`), Pure White cards (`#FFFFFF`), crisp high-contrast fonts.
   - Strict monospace font (`font-mono`) on all numerical values, dates, and units.

---

## Files Likely to Change / Be Created
1. `components/analytics/yield-reports-hub.tsx` (New master component with asset report tabs & time horizon switchers).
2. `components/analytics/reports/inverter-wise-report.tsx` (New Inverter-wise generation & efficiency report).
3. `components/analytics/reports/grid-mfm-report.tsx` (New Grid MFM report preserving and highlighting bidirectional grid export data).
4. `components/analytics/reports/dg-generation-report.tsx` (New DG yield, fuel burn, and runtime report).
5. `components/analytics/reports/monthly-generation-table.tsx` (New Monthly generation breakdown with CSV export).
6. `components/analytics/reports/yearly-generation-table.tsx` (New Multi-year target vs. achieved report).
7. `components/analytics/analytics-master-container.tsx` (Updated to add third primary mode: "📑 Yield & Generation Reports").
8. `lib/energy/yield-reports-service.ts` (Mock & calculated historical dataset generator for inverters, grid MFM, and DG).

---

## Implementation Requirements

### 1. Separate Inverter-wise, Grid MFM, and DG Reports
- **Inverter-wise Report**:
  - Filter by Inverter (All, INV-01, INV-02).
  - Metrics: Total Generation (kWh), Peak Active Power (kW), Average Efficiency (%), Specific Yield (kWh/kWp), PR (%).
  - Table: Date, Inverter ID, Active Power (kW), Yield (kWh), DC Voltage (V), Efficiency (%), Status.
- **Grid MFM Report (Preserving Grid Export)**:
  - Metrics: Net Energy Balance (kWh), Total Grid Import (kWh), Total Grid Export (kWh), Peak Export (kW), Export Revenue (₹), Average PF.
  - Table: Date, Grid Import (kWh), Grid Export (kWh), Net Balance (kWh), Peak Export kW, Export Value (₹).
- **DG Generation Report**:
  - Metrics: DG Total Yield (kWh), Total Operating Run Hours, Total Fuel Burned (L), Specific Fuel Rate (`0.28 L/kWh`), Avoided Outage Time.
  - Table: Date, DG Yield (kWh), Peak kW, Run Hours, Fuel Consumed (L), Fuel Efficiency (kWh/L).

### 2. Date-wise / Range Selection with Calendar Option
- Integrated `CyberDatetimePicker` with date picker popover, quick range pills (`Today`, `Last 7 Days`, `Last 30 Days`, `Custom Range`).
- Instant recalculation of daily generation records.
- "Export CSV" and "Print Report" buttons for compliance and accounting.

### 3. Monthly Generation Report
- 12-month matrix (Jan - Dec) showing:
  - Solar Generation (kWh & MWh)
  - Inverter-1 vs. Inverter-2 (kWh)
  - Grid Export (kWh) vs. Grid Import (kWh)
  - DG Generation (kWh)
  - Specific Yield (kWh/kWp) & PR (%)
  - Net Commercial Savings (₹ INR)

### 4. Yearly Generation Report
- Multi-year comparison table (2024 to 2026 + Lifetime):
  - Annual Target (MWh) vs. Actual Generation (MWh)
  - Target Achievement Rate (%)
  - Annual Grid Export (MWh)
  - Degradation Factor (% vs. Year 1)
  - Carbon Offset Avoided (MT CO₂)

---

## Design System & Visual Adherence
- Void Black (`#060709`) and Obsidian (`#0B0D13`) surfaces.
- Accent colors: `#FFD600` (Solar), `#9D4EDD` (Grid), `#FF6B00` (DG), `#00E676` (Export/Healthy), `#FF2A85` (Primary CTA).
- Numerical metrics must use `font-mono`.
- Responsive layout reflowing into stacked view on mobile ($< 768px$). Minimum tap target $48 \times 48\ px$.

---

## Acceptance Criteria
1. User can switch between Inverter-wise, Grid MFM, and DG reports separately.
2. Calendar date picker allows custom date and range selection with instant table and chart updates.
3. Monthly generation report renders 12-month historical breakdown with export capability.
4. Yearly generation report compares actual vs. P50 target with degradation tracking.
5. Grid export data is clearly highlighted in the Grid MFM report.
6. All instantaneous values in **kW**, all yields in **kWh** (and MWh).
7. TypeScript (`npx tsc --noEmit`), lint (`npm run lint`), and build (`npm run build`) pass with 0 errors.

---

## Checks to Run
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
