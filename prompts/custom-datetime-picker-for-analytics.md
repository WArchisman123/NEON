# Implementation Prompt: Custom DateTime Range Picker for Analytics and Historical Telemetry

## Goal
Implement a reusable, industrial-grade **Cyber DateTime Range Picker** (`CyberDatetimePicker`) styled strictly in the Cyber Black / Neon Pink design system, and integrate it into every screen, chart, and workspace where time range selection (`Today`, `7 days`, `30 days` / `1 month`, `YTD`) is present. This enables asset managers and site engineers to inspect granular electrical power transfer and dispatch data across any arbitrary custom date and time window with live KPI recalculations.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: UI component primitives, form composition, accessible popover/dialog behavior, and clean Tailwind styling.
- `AGENTS.md`: Strict frontend design system adherence (`#060709` Void Black, `#0B0D13` Obsidian cards, `#121622` elevated modals, `#FF2A85` Neon Pink glow accents, `font-mono` timestamps, and $\ge 48 \times 48\text{ px}$ mobile touch ergonomics).
- `public/context/doc.md` (Section 7: Feature Spec 3): Specifies `TIMEFRAME: [Today (15m)] [Last 7 Days] [Last 30 Days] [Year-to-Date] [Custom Range]`.
- `public/context/ui_doc.md` (Section 8: Power Consumption & Analytics UI): Guidelines on dark glass popovers and control-room legibility.

---

## Existing Code Inspected
1. **Power Consumption Workspace (`components/analytics/power-consumption-workspace.tsx`)**:
   - Lines 49, 60–109: State `timeframe` currently limited to `"today" | "7d" | "30d" | "ytd"`.
   - Lines 238–254: Preset pill buttons `[Today, 7D, 30D, YTD]`.
   - Lines 182–187: Timeframe descriptive labels.
2. **Historical Dispatch Chart (`components/analytics/historical-dispatch-chart.tsx`)**:
   - Lines 27–43: State `range` limited to `"today" | "7d" | "30d"`.
   - Lines 108–142: Range switcher buttons `[Today (24h), 7 Days, 30 Days]`.
   - Lines 47–68: Dynamic interval totals (Solar kWh, Load kWh, Arbitrage ₹, CO2 avoided).
3. **Subsystem Performance Charts**:
   - `components/analytics/solar-performance-chart.tsx`: Lines 25, 146–180 (Preset buttons: `Today (15m)`, `7 Days`, `30 Days`).
   - `components/analytics/bess-performance-chart.tsx`: Lines 25, 137–172 (Preset buttons: `Today (15m)`, `7 Days`, `30 Days`).
   - `components/analytics/dg-performance-chart.tsx`: Lines 24, 125–158 (Preset buttons: `Today (15m)`, `7 Days`, `30 Days`).
   - `components/analytics/grid-performance-chart.tsx`: Lines 27, 130–165 (Preset buttons: `Today (15m)`, `7 Days`, `30 Days`).
   - `components/analytics/load-performance-chart.tsx`: Lines 25, 140–174 (Preset buttons: `Today (15m)`, `7 Days`, `30 Days`).
4. **Site Detail & Analytics Pages**:
   - `app/analytics/page.tsx`: Passes `hourlyTelemetry` (30 days) to `PowerConsumptionWorkspace`.
   - `app/sites/[id]/page.tsx` & `components/site-detail/site-detail-view.tsx`: Renders `PowerConsumptionWorkspace` under the "Analytics" tab.
   - `app/sites/[id]/[subsystem]/page.tsx` (`solar`, `bess`, `dg`, `grid`, `load`): Render the respective subsystem performance charts.
5. **Loading Skeletons**:
   - `app/analytics/loading.tsx` (Lines 23–30) and `app/sites/[id]/loading.tsx` (Lines 62–68): Display static preset pill skeletons.

---

## Decisions or Assumptions
1. **Reusable Component Architecture**:
   - Create `components/analytics/cyber-datetime-picker.tsx` so any chart or workspace can seamlessly import it.
   - Support both controlled and preset-compatible modes. The picker will accept:
     - `value`: `{ startDate: string; startTime: string; endDate: string; endTime: string }`
     - `onChange`: `(range: { startDate: string; startTime: string; endDate: string; endTime: string }) => void`
     - `activePreset?`: `"today" | "7d" | "30d" | "ytd" | "custom"`
     - `onPresetChange?`: `(preset: "today" | "7d" | "30d" | "ytd" | "custom") => void`
     - `accentColor?`: customizable neon accent color (defaults to Neon Pink `#FF2A85`, supports `#FFD600` for Solar, `#00F0FF` for BESS, `#FF6B00` for DG, `#9D4EDD` for Grid).
2. **Interactive UI Capabilities**:
   - **Trigger Button**: Displays calendar/clock icon, active label (e.g. `Custom Range` or formatted date-time `Sep 18 00:00 → Sep 25 13:00`), and a glowing indicator when active.
   - **Quick Preset Chips**: `Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days` (1 Month), `Year to Date (YTD)`.
   - **Dual Date-Time Controls**:
     - Start Date (`YYYY-MM-DD`) and Start Time (`HH:mm`).
     - End Date (`YYYY-MM-DD`) and End Time (`HH:mm`).
   - **Interactive Calendar Grid**: Interactive month view allowing direct click selection of start date and end date with highlighted range spans.
   - **Validation & Safe Apply**: Validates that start is before or equal to end; displays error feedback if invalid. "Apply Range" commits the selection and closes the popover.
   - **Responsive Dropdown / Sheet**: Displays as a sleek cyber popover on desktop ($> 768\text{px}$) and reflows into a swipeable/modal bottom sheet on mobile screens ($< 768\text{px}$) with full $\ge 48\text{px}$ touch targets.
3. **Data Filtering Logic**:
   - When a custom date-time range is applied, telemetry datasets are filtered chronologically between `startDateTime` and `endDateTime`.
   - Adaptive chart downsampling/resolution:
     - $\le 24\text{ hours}$: 1-hour resolution
     - $\le 7\text{ days}$: 3-hour or 4-hour resolution
     - $\le 30\text{ days}$: 12-hour resolution
     - $> 30\text{ days}$: 24-hour daily resolution
   - Recalculates all derived aggregates (Solar yield kWh, BESS peak shaved, avoided MD penalties, fuel saved, carbon avoided, arbitrage revenue) dynamically for the custom interval.
   - CSV export in `PowerConsumptionWorkspace` dynamically exports the custom-filtered dataset with accurate filename timestamps.

---

## Files Likely to Change
1. `components/analytics/cyber-datetime-picker.tsx` *(New File)*: Reusable Cyber Black / Neon Pink DateTime Range Picker component.
2. `components/analytics/power-consumption-workspace.tsx`: Add `"custom"` timeframe, custom range state, date-time filtering, adaptive downsampling, and integration with `CyberDatetimePicker`.
3. `components/analytics/historical-dispatch-chart.tsx`: Add `"custom"` range option with date-time filtering and integration with `CyberDatetimePicker`.
4. `components/analytics/solar-performance-chart.tsx`: Add custom datetime picker support with `#FFD600` accent.
5. `components/analytics/bess-performance-chart.tsx`: Add custom datetime picker support with `#00F0FF` accent.
6. `components/analytics/dg-performance-chart.tsx`: Add custom datetime picker support with `#FF6B00` accent.
7. `components/analytics/grid-performance-chart.tsx`: Add custom datetime picker support with `#9D4EDD` accent.
8. `components/analytics/load-performance-chart.tsx`: Add custom datetime picker support with `#FF2A85` accent.
9. `app/analytics/loading.tsx` & `app/sites/[id]/loading.tsx`: Add custom date picker trigger placeholder to skeleton loaders.

---

## Implementation Requirements

### 1. `components/analytics/cyber-datetime-picker.tsx`
- Implement an accessible popover with click-outside and `Escape` key listeners.
- Design:
  - Container: `#121622` Elevated Glass, `border-white/[0.1]`, `backdrop-blur-xl`, `shadow-[0_0_30px_rgba(0,0,0,0.8)]`.
  - Header: Cyber title `CUSTOM DATETIME WINDOW`, reset button, and close icon.
  - Quick Presets: Chips for `Today`, `Yesterday`, `Last 7D`, `Last 30D`, `YTD` for instant selection.
  - From / To inputs:
    - Native Cyber inputs for `date` and `time` styled with `font-mono text-xs bg-[#0B0D13] border-white/[0.08] text-white focus:border-[#FF2A85]`.
  - Calendar View:
    - Month navigation (prev/next month).
    - Grid displaying 7-column days.
    - Start date cell: Solid Neon Pink `#FF2A85` with white bold text.
    - End date cell: Solid Neon Pink `#FF2A85` with white bold text.
    - Intermediate range cells: `bg-[#FF2A85]/20 text-white`.
  - Action Footer:
    - "Cancel / Reset" button.
    - "Apply Range" button with glowing neon fill.

### 2. Update `PowerConsumptionWorkspace`
- Expand `timeframe` type to `"today" | "7d" | "30d" | "ytd" | "custom"`.
- Add state for `customRange: { startDate: string; startTime: string; endDate: string; endTime: string }`.
- When `timeframe === "custom"`:
  - Filter `hourlyTelemetry` where `bucket_timestamp >= customStart && bucket_timestamp <= customEnd`.
  - Compute span in hours; assign appropriate sampling `step`.
  - Update summary metrics and dispatch point labels (showing `MMM d, HH:mm`).
  - Render `CyberDatetimePicker` right alongside the `[Today, 7D, 30D, YTD]` toggle group.

### 3. Update `HistoricalDispatchChart` & Subsystem Charts
- Update range state to include `"custom"`.
- Insert `CyberDatetimePicker` into each chart's header control strip with appropriate subsystem color accent.
- Filter data points between selected timestamps and recompute live KPI cards and chart curves.

---

## Design System & Visual Adherence
- **Color Tokens**: Void Black (`#060709`), Obsidian (`#0B0D13`), Elevated Cyber Glass (`#121622`), Brand Neon Pink (`#FF2A85`), Laser Cyan (`#00F0FF`), Electric Amber (`#FFD600`), Hi-Viz Orange (`#FF6B00`), Electric Purple (`#9D4EDD`).
- **Typography**: All dates, times, durations, and electrical values strictly use `font-mono`.
- **Contrast**: High contrast dark mode control room theme; zero light themes or default un-styled controls.
- **Mobile Ergonomics**: Full touch target sizing $\ge 48 \times 48\text{ px}$ for all buttons and interactive calendar date cells on touch screens.

---

## Security & RBAC Requirements
- Pure client-side telemetry window filtering operating within the user's verified Clerk organization scope.
- Zero raw unvalidated SQL mutations or cross-tenant data leaks.

---

## Acceptance Criteria
- [ ] Every screen with time range selection (`/analytics`, `/sites/[id]` Analytics tab, and all 5 subsystem pages) includes a functional custom datetime picker.
- [ ] Users can pick any arbitrary custom start date/time and end date/time.
- [ ] Quick preset chips (`Today`, `Yesterday`, `Last 7D`, `Last 30D`, `YTD`) update the inputs instantly.
- [ ] Interactive calendar grid visually highlights the selected start, end, and in-between date range.
- [ ] Slicing dynamically filters chart curves, tooltips, and calculated KPI totals (Solar yield, BESS peak shaved, Arbitrage ₹, CO2 avoided).
- [ ] CSV export in the Power Consumption workspace exports the custom-filtered dataset.
- [ ] Mobile viewports (< 768px) render the picker as a touch-friendly bottom sheet/modal with $\ge 48\text{px}$ touch targets.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npx tsc --noEmit` passes with 0 errors.

---

## Checks to Run
1. `npx tsc --noEmit`
2. `npm run lint`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Desktop Viewport ($1440 \times 900$)**:
   - Navigate to `/analytics`.
   - Observe the new **"Custom Range" / DateTime Picker** button beside `[Today, 7D, 30D, YTD]`.
   - Click the button; verify the obsidian/neon cyber popover opens with Start/End date-time inputs, quick preset chips, and interactive calendar.
   - Select a custom window (e.g. 5 days ago to yesterday). Click "Apply Range".
   - Verify the stacked area chart and KPI cards immediately reflect the custom interval, and the active range badge updates.
   - Click "Export CSV" and verify the exported file contains only the custom filtered rows.
   - Navigate to `/sites/site-01/solar` (and `bess`, `dg`, `grid`, `load`).
   - Open the custom datetime picker, pick a custom window, and verify the performance chart updates accordingly.
2. **Mobile Viewport ($390 \times 844$)**:
   - Open Chrome DevTools in iPhone 14/15 mode ($390 \times 844$).
   - Go to `/analytics` or `/sites/site-01/solar`.
   - Tap the custom datetime picker button.
   - Verify the picker opens as an ergonomic bottom modal sheet with $\ge 48\text{px}$ touchable calendar cells and input fields.
   - Select dates, tap "Apply Range", and verify the charts resize and update cleanly without layout shifts or horizontal overflows.
