# Implementation Prompt: Phase 2 — Inverter Multi-Channel MPPT Diagnostic Stack & Raw Modbus Register Map

## Goal
Implement **Phase 2** of the Competitor Gap Analysis and Feature Placement Strategy (`ref_img_3.png` and `ref_img_4.png`):
1. **12-Channel MPPT Diagnostic Stack** (`ref_img_4.png`):
   - Overlaid diurnal time-series curve for all 12 DC MPPT currents (`DC_CURRENT_1` to `DC_CURRENT_12`).
   - 12 individual stacked dual-axis sub-charts (DC Current line on left axis vs. DC Voltage line/fill on right axis) with interactive tooltips, tracker status badges (`Optimal`, `Clipping`, `Open-Circuit`, `Misaligned`), and CSV/Excel export.
2. **PV Parameter Live Modbus Register Map** (`ref_img_3.png`):
   - Inverter tab selector (`INV-01`, `INV-02`, etc.) with Modbus Slave ID & live polling simulator (5s, 10s, manual refresh).
   - Tile grid displaying live Modbus registers: Internal Inverter Temp (°C), Event Code (0 = Normal, with decoded fault status), 12-channel DC Voltages (`DC_VOLTAGE_1`..`12`), 12-channel DC Currents (`DC_CURRENT_1`..`12`), 24 String Currents, 3-phase AC Voltages & Currents, Frequency, Power Factor, and Isolation Resistance.
   - Register search/filter bar and Hex/Decimal register address toggle (`30001` vs `0x7531`).
3. **Interactive Solar Sub-Navigation & Seamless Routing**:
   - Clean tab bar on `/sites/[id]/solar` allowing solar engineers to switch between:
     - `Overview & Losses`
     - `12-Channel MPPT Stack` (`ref_img_4`)
     - `Modbus Register Map` (`ref_img_3`)
     - `24-String Heatmap Matrix` (`ref_img_5`)
   - URL query parameter synchronization (`?tab=mppt`, `?tab=modbus`, etc.) and instant responsive reflow.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: High-contrast dual-theme tabs, cards, badge primitives, tooltips, responsive grids.
- `.agents/skills/clerk-orgs/`: Organization tenancy validation and member permissions.
- `.agents/skills/clerk-nextjs-patterns/`: Next.js App Router server component session checks.
- `.agents/skills/supabase/`: Site and inverter device relations.

---

## Existing Code Inspected
- `prompts/competitor-feature-gap-analysis-and-placement-strategy.md`: Full gap matrix and reference specs for `ref_img_3` and `ref_img_4`.
- `app/sites/[id]/solar/page.tsx`: Existing solar subsystem view with scatter plot, inverter table, and string current heatmap.
- `components/solar/string-current-heatmap-matrix.tsx`: Existing 2D string matrix built in Phase 1.
- `components/solar/mppt-string-scatter-plot.tsx`: Current scatter plot analyzer.
- `lib/energy/types.ts`: Energy system data models and telemetry interfaces.
- `lib/energy/site-service.ts`: Site detail fetchers, device categories, and telemetry enrichment.

---

## Decisions & Assumptions
1. **Multi-Inverter Tabbed Support**: In commercial/utility plants, each plant has multiple inverters (e.g. `INV-01 (Sungrow SG110CX)`, `INV-02`, `INV-03`). The MPPT Stack and Modbus Register Map will feature an inverter switcher tab row so technicians can inspect individual units independently.
2. **Dual-Theme Design System Consistency**:
   - In Cyber Dark Mode: Obsidian surfaces (`#0B0D13`), Cyber Glass (`#121622`), Electric Amber (`#FFD600`) for Solar power, Laser Cyan (`#00F0FF`) for MPPT voltages, Cyber Emerald (`#00E676`) for normal currents, Neon Pink (`#FF2A85`) for active tabs/accents.
   - In High-Contrast Day Mode: Crisp Day White surfaces (`#FFFFFF`), Day Frost (`#EAEFF8`), High-Contrast Amber (`#D97706`), Deep Grid Violet / Blue (`#0284C7`), Deep Charcoal typography (`#0B0F19`).
3. **Telemetry & Modbus Simulation Integrity**: Provide deterministic, realistic electrical behavior (diurnal sun curves with peak irradiance around noon, realistic string voltage ranges 580V–680V, string currents 0A–13A, realistic internal IGBT temperatures 45°C–65°C, Modbus standard 30000-series input registers).
4. **Mobile Ergonomics**: On viewports `< 768px`, the 12 MPPT sub-charts collapse into a smooth 1-column scrollable stack, tabs scroll horizontally with touch-friendly pills ($\ge 48\text{ px}$), and register tiles collapse into responsive 2-column cards.

---

## Files Likely to Change & Created

### New Files
1. `components/solar/mppt-diagnostic-stack.tsx`:
   - Interactive 12-channel MPPT overlay diurnal curve + 12 individual dual-axis sub-charts (SVG / Canvas).
   - Inverter selector tabs, diurnal time slider / preset range, tracker health status flags, CSV / Excel data export.
2. `components/solar/modbus-register-map.tsx`:
   - Interactive live Modbus register grid matching `ref_img_3.png`.
   - Inverter selector, poll interval control (5s / 10s / paused), register search query, decimal/hex address toggle, expandable details.
3. `components/solar/solar-sub-view-tabs.tsx`:
   - Client sub-navigation component with URL state syncing, tab pill animations, and mobile horizontal scrolling.

### Modified Files
1. `lib/energy/types.ts`:
   - Add types for `MpptDiurnalPoint`, `MpptChannelCurve`, `ModbusRegisterItem`, `InverterModbusTelemetry`.
2. `app/sites/[id]/solar/page.tsx`:
   - Integrate `SolarSubViewTabs` and conditionally render or smoothly tab between Overview, MPPT Stack, Modbus Register Map, and String Heatmap Matrix.

---

## Implementation Requirements

### 1. 12-Channel MPPT Diagnostic Stack (`ref_img_4.png`)
- **Diurnal Time Window**: 06:00 to 18:00 (15-min intervals, 49 data points).
- **Summary Curve**:
  - Overlaid SVG chart with 12 distinct colored lines for `DC_CURRENT_1` through `DC_CURRENT_12`.
  - Hover cursor with crosshair displaying all 12 currents at that exact time.
  - Interactive legend allowing toggling of individual channels on/off.
- **12 Stacked Dual-Axis Tracker Cards**:
  - Each card represents one MPPT tracker (`MPPT-01` to `MPPT-12`).
  - Dual Y-axes: Left Y-axis for Current ($0–15\text{ A}$), Right Y-axis for Voltage ($0–800\text{ V}$).
  - Render dual-line or area+line curve showing voltage vs current across the day.
  - Tracker status badge:
    - Normal / Optimal: green badge with nominal tracking.
    - Soiling / Reduced: amber badge (e.g. MPPT-07 current running 30% below peer average).
    - Voltage Only / Blown Fuse: red badge (e.g. MPPT-12 has 650V voltage but 0.00A current).
- **Export Actions**: Export active inverter MPPT time-series to CSV / Excel format.

### 2. Live Modbus Register Map (`ref_img_3.png`)
- **Header Info Strip**:
  - Inverter Model & Serial Number (e.g. `Sungrow SG110CX | S/N: SG-2026-994102`).
  - Inverter Internal IGBT Temperature (`49.5 °C`).
  - Total DC Power (`104.8 kW`), Total AC Power (`103.2 kW`), Efficiency (`98.5%`).
  - Modbus Slave ID (`01`), Baud Rate (`9600-8-N-1`), Last Poll Timestamp (`10/8/2026 12:30:00 PM`).
  - Event Code: `0` (Normal) with live status chip.
- **Register Groups (Organized in Clean Grid Cards)**:
  - **Group A: DC Voltages (12 registers)**: `DC_VOLTAGE_1` to `DC_VOLTAGE_12` (Reg `30001` - `30012`), displayed with exact decimal voltage (e.g. `587.7 V`).
  - **Group B: DC Currents (12 registers)**: `DC_CURRENT_1` to `DC_CURRENT_12` (Reg `30021` - `30032`), displayed in Amperes (e.g. `11.20 A`).
  - **Group C: String Currents (24 registers)**: `CURRENT_STRING_1` to `CURRENT_STRING_24` (Reg `30041` - `30064`), with blown fuse highlight ($0.00\text{ A}$).
  - **Group D: 3-Phase AC Grid & Power Quality (8 registers)**: $V_{AB}, V_{BC}, V_{CA}$ (415V), $I_A, I_B, I_C$ (143A), Frequency ($50.02\text{ Hz}$), Power Factor ($0.998$).
  - **Group E: Energy & Lifetime Counters (6 registers)**: Daily Yield ($kWh$), Lifetime Yield ($MWh$), Daily Run Hours, Insulation Resistance ($k\Omega$).
- **Features**:
  - Real-time search filter (filter by name e.g. `"voltage"` or address e.g. `"3002"`).
  - Address mode switch: Standard Decimal (`30021`) vs Hexadecimal (`0x7545`).
  - Live simulation ticker (updates values with slight realistic fluctuations every 5s if active).

### 3. Solar Subsystem Navigation
- Render a clean tab header on `/sites/[id]/solar`:
  - `[1] Fleet Overview & Losses`
  - `[2] 12-Channel MPPT Stack (ref_img_4)`
  - `[3] Modbus Register Map (ref_img_3)`
  - `[4] 24-String Heatmap Matrix (ref_img_5)`
- Support direct deep-linking via `?tab=overview|mppt|modbus|heatmap` while maintaining instant client-side tab switching.

---

## Design System & Visual Adherence
- **Cyber Dark Mode**: Void Black `#060709` canvas, Obsidian `#0B0D13` cards, Cyber Glass `#121622` table rows, glowing `#FF2A85` Neon Pink accents, `#FFD600` Electric Amber solar metrics, `#00F0FF` Laser Cyan voltage metrics, `#00E676` Cyber Emerald current metrics.
- **High-Contrast Day Mode**: Solar Ice `#F4F6FB` canvas, Pure White `#FFFFFF` cards, Elevated Day Frost `#EAEFF8`, Deep Charcoal `#0B0F19` typography.
- **Monospace Rule**: Strict `font-mono` on all voltages, currents, temperatures, frequencies, power values, and register addresses.
- **Mobile Touch Target Standard**: All tabs, inverter buttons, and register toggles $\ge 48 \times 48\text{ px}$.

---

## Security & RBAC Requirements
- Organization multi-tenancy enforced through Clerk session org validation (`auth()`).
- Data scoped strictly to the authenticated organization's sites.
- Read-only telemetry inspection available to all authenticated tenant roles (`asset_manager`, `site_engineer`, `field_technician`, `client`).
- Modbus write/parameter configuration buttons (if added in the future) restricted to `superadmin` and `site_engineer`.

---

## Acceptance Criteria
- [ ] Inverter switcher allows seamless toggle between `INV-01`, `INV-02`, and `INV-03`.
- [ ] 12-channel MPPT summary overlay curve renders cleanly with hover crosshair and legend toggling.
- [ ] 12 stacked per-MPPT dual-axis sub-charts clearly graph DC Voltage and DC Current side-by-side with anomaly flags.
- [ ] Raw Modbus register map matches `ref_img_3.png` with live polling simulation, search bar, and hex/dec toggle.
- [ ] Full 24 string currents and 12 MPPT channels reflect realistic values with blown-fuse flags.
- [ ] High-Contrast Day Mode and Cyber Dark Mode render without drab backgrounds or unreadable text.
- [ ] Zero TypeScript errors (`npx tsc --noEmit`).
- [ ] Zero ESLint errors or warnings (`npm run lint`).
- [ ] Production build succeeds cleanly (`npm run build`).

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
1. Navigate to `/sites/site-1/solar`.
2. Inspect the top tab bar:
   - Click **"12-Channel MPPT Stack"**:
     - Verify the top summary curve displays all 12 MPPT channels over the 06:00–18:00 window.
     - Hover over data points to check the interactive crosshair and tooltip.
     - Scroll through the 12 stacked dual-axis sub-charts; verify MPPT-07 shows soiling warning and MPPT-12 shows fuse check.
     - Click **"Export MPPT CSV"** to verify data download.
   - Click **"Modbus Register Map"**:
     - Verify the register tile grid with Inverter Temp, Event Code `0`, 12 DC Voltages, 12 DC Currents, 24 String Currents, and AC Power Quality.
     - Type `"voltage"` into the register search bar and verify instant filtering.
     - Toggle between **DEC** and **HEX** address modes.
     - Toggle live polling to verify sub-second/5s simulated telemetry fluctuations.
   - Click **"24-String Heatmap Matrix"**:
     - Verify the 2D heatmap matrix with 5-minute cells and blown fuse indicators.
   - Click **"Overview & Losses"**:
     - Verify return to the original overview, weather forecast, and loss breakdown.
3. Toggle dark/light theme to verify high-contrast solar ice palette in Day Mode.

### Mobile ($390 \times 844$)
1. Open mobile emulation mode ($390 \times 844$).
2. Verify tab pills scroll smoothly with $\ge 48\text{ px}$ touch targets.
3. Verify the MPPT sub-charts stack cleanly in a single column without overflow.
4. Verify the Modbus register tiles reflow into a clean 2-column or 1-column card grid.
