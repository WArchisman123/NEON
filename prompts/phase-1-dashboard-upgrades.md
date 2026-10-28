# Implementation Prompt: Phase 1 — Dashboard Upgrades (Portal Requirements Sheet)

## Goal
Implement **Phase 1** of the client portal requirements extracted from the uploaded spreadsheet:
1. **Company Name & Logo Space**: Provide dedicated branding header with company logo slot, site name, and organization identity.
2. **Annual Target vs. Achieved Progress**: Visual target completion dial showing annual target (MWh), achieved generation (MWh), % pacing, and projected year-end finish.
3. **Solar, Grid, DG Yield (Today & Total in kWh)**: Consolidated 3-source matrix card comparing Today's Yield (kWh) and Total Cumulative Yield (kWh / MWh) across Solar PV, Utility Grid, and Diesel Generator.
4. **Revenue by Solar Generation**: Explicit financial revenue card displaying solar earnings in Indian Rupees (₹) for Today and Lifetime based on feed-in tariff rates.
5. **Inverter-Wise & Total Current Generation Display**: Instantaneous active power breakdown displaying total site kW alongside individual inverter loads (e.g. INV-01: `45.2 kW`, INV-02: `44.1 kW`).
6. **Inverter Alarm Supervisory Panel**: Real-time alarm banner/card displaying inverter fault states, trip codes (Grid Overvoltage, Isolation, DC Arc, Thermal), warning counts, and status indicators.
7. **Strict Units Compliance**: All instantaneous generation displayed in **kW**, all energy yield displayed in **kWh** (and MWh where applicable).

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Cyber Dark & High-Contrast Light theme token adherence, badges, tooltips, cards)
- `.agents/skills/clerk-orgs/` (Dynamic organization name and tenant logo display)

---

## Existing Code Inspected
- `components/site-detail/tabs/dashboard-tab.tsx`: Currently renders 8 top financial cards, 3 core columns (System Stats, Topology, Power Stats), 8 subsystem cards, and 2 bottom charts. Needs integration of Phase 1 requirements: Company Logo slot, Annual Target progress, 3-Source Today/Total Yield matrix, Solar Revenue, Inverter Alarm panel, and Inverter-wise current kW breakdown.
- `lib/energy/types.ts`: `SiteRecord` contains `annual_target_mwh`, `annual_achieved_mwh`, `solar_yield_today_kwh`, `grid_import_today_kwh`, `dg_yield_today_kwh`, `feed_in_tariff_inr`, and `solar_power_kw`.

---

## Detailed Implementation Plan

### 1. Dedicated Company Branding & Logo Banner (`components/site-detail/dashboard/company-branding-banner.tsx`)
- Display tenant Company Logo (custom SVG/image with fallback cyber badge `⚡ iRasus`) and Company Name alongside Site Title and Plant Capacity (kWp / kWh).
- Quick metadata badges: Commissioning Date, Target Pacing status, and Active Grid Synchronization.

### 2. Consolidated 3-Source Yield Matrix Card (`components/site-detail/dashboard/three-source-yield-card.tsx`)
- Matrix layout comparing:
  - ☀️ **Solar PV Generation**: Today's Yield (`solar_yield_today_kwh` in kWh) + Total Cumulative Yield (kWh).
  - ⚡ **Utility Grid Import/Export**: Today's Net Grid Import/Export (kWh) + Lifetime Net MWh.
  - ⛽ **Diesel Generator Backup**: Today's DG Run Yield (kWh) + Lifetime Operating kWh.
- Units explicitly formatted in **kWh** and monospace (`font-mono`).

### 3. Annual Target vs. Achieved Progress Dial (`components/site-detail/dashboard/annual-target-card.tsx`)
- Target: `annual_target_mwh` (e.g. `1,250 MWh`).
- Achieved: `annual_achieved_mwh` (e.g. `842 MWh`).
- Interactive progress bar & radial percentage ring (`67.4% Target Achieved`).
- Projected Completion status badge (`On Track` / `Ahead of P50 Plan`).

### 4. Solar Revenue & Inverter-Wise Current Generation Strip
- **Revenue by Solar Generation Card**: Today's Solar Revenue in ₹ INR (`₹4,862 Today` / `₹1,42,800 Total`) computed via `feed_in_tariff_inr`.
- **Inverter-Wise Generation Strip**: Total current generation (`89.3 kW`) with per-inverter cards (INV-01: `45.2 kW`, INV-02: `44.1 kW`) with individual inverter efficiency (`98.6%`) and operational state (`Normal`).

### 5. Inverter Alarm Supervisory Card (`components/site-detail/dashboard/inverter-alarm-card.tsx`)
- Grid of monitored inverter alarms:
  - Grid Overvoltage / Undervoltage (`Normal`)
  - DC Insulation / Earth Fault (`Normal`)
  - Inverter Over-Temperature (`Normal`)
  - String Current Imbalance (`Warning` / `Healthy`)
- Live Alarm Counter (`0 Critical`, `0 Trips`, `1 Warning`) with timestamp of last system scan.

### 6. Seamless Dashboard Tab Composition
- Update `components/site-detail/tabs/dashboard-tab.tsx` to compose these modules cleanly while preserving the 3D System Topology visualizer and bottom analytical waveforms.

---

## Design System & Theme Adherence
- Void Black (`#060709`) and Obsidian Dark (`#0B0D13`) in Cyber Dark mode; Solar Ice Canvas (`#F4F6FB`) and Pure White Cards (`#FFFFFF`) in Day Light mode.
- Glowing `#FF2A85` Neon Pink brand primary CTA, `#00E676` Cyber Emerald for healthy states, `#FFD600` Solar Amber, and `#00F0FF` BESS Cyan.
- Strict monospace rule for all numbers, kilowatt/kWh units, and INR currency symbols.

---

## Acceptance Criteria
1. Company name and logo slot displayed prominently at top of Dashboard.
2. Annual Target vs Achieved progress dial rendered with target MWh, achieved MWh, and percentage.
3. Solar, Grid, and DG Yield displayed with both Today (kWh) and Total (kWh/MWh) side-by-side.
4. Revenue by Solar Generation displayed in ₹ INR.
5. Inverter-wise current generation (kW) breakdown shown alongside total generation.
6. Inverter Alarm supervisory card rendered with alarm states and warning counters.
7. Zero TypeScript or ESLint errors (`npx tsc --noEmit` and `npm run lint`).

---

## Checks to Run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
