# Implementation Prompt: Enhanced Site Cockpit Card Telemetry & Asset Figures

## 1. Goal
Upgrade the Fleet Cockpit site cards (`<SiteCockpitCard />`) on the home screen to display rich, highly usable industrial telemetry for all active subsystem assets:
- **Solar Subsystem**: Installed Capacity ($kWp$ / $MWp$), Generation Today ($kWh$ / $MWh$), and Specific Yield ($kWh/kWp$).
- **Utility Grid Subsystem**: Sanctioned / Contracted Capacity ($kVA$), Power Drawn Today ($kWh$), and Live Flow Direction ($kW$ Import / Export).
- **Diesel Generator Subsystem**: Installed Capacity ($kVA$), Generation Today ($kWh$), and Operating Status / Fuel Level ($%$).
- **BESS Subsystem**: State of Charge ($SoC\ \%$), Installed Energy Capacity ($kWh$ / $MWh$), Stored Usable Energy ($kWh$), and Cycled Energy Today ($kWh$ Charged / Discharged).
- **Facility Load Subsystem**: Live Demand ($kW$) and Daily Energy Consumption ($kWh$).

---

## 2. Relevant Agent Skills
- `.agents/skills/shadcn/`: UI layout primitives, responsive card composition, high-contrast dark theme styling, badge typography, and accessibility touch targets.
- `.agents/skills/supabase-postgres-best-practices/`: Column additions with `DOUBLE PRECISION DEFAULT 0.0`, schema migrations, indexing, and non-blocking DDL updates.

---

## 3. Existing Code Inspected
- `components/design-system/site-cockpit-card-preview.tsx`: The current card component displaying a rudimentary 3-metric strip (`live_solar_kw`, `bess_soc_pct`, `load_kw`).
- `components/dashboard/fleet-cockpit-view.tsx`: The dashboard client view mapping `SiteRecord[]` to `SiteData[]`.
- `lib/energy/types.ts`: TypeScript contracts for `SiteRecord`, `HourlyTelemetryRecord`, and `SiteData`.
- `lib/energy/site-service.ts`: SQL query functions (`getSitesForOrg`, `getSiteDetails`) joining `public.sites` and `public.telemetry_snapshots`.
- `supabase/migrations/0001_initial_schema.sql`: Schema definitions for `public.telemetry_snapshots` and `public.sites`.
- `scripts/expand-demo-sites.js`: Seed script populating the 6 diverse demo installations.

---

## 4. Decisions or Assumptions
1. **Specific Yield Metric Calculation**:
   - Specific Yield ($kWh/kWp$) is computed as:
     $$\text{Specific Yield} = \frac{\text{Solar Generation Today (kWh)}}{\text{Installed Solar Capacity (kWp)}}$$
   - Example: A $15,000\ kWp$ plant generating $58,400\ kWh$ yields $3.89\ kWh/kWp$. This is formatted with 2 decimal places in `font-mono text-[#FFD600]`.
2. **Sanctioned Capacity & Grid Import**:
   - Sanctioned Capacity is sourced directly from `site.contracted_demand_kva` ($kVA$).
   - Power Drawn Today is sourced from `site.grid_import_today_kwh` ($kWh$).
   - For islanded sites (`has_grid: false`), the card cleanly displays an `"ISLANDED"` badge with Sanctioned Capacity as `"0 kVA"` and Drawn Today as `"0 kWh"`.
3. **BESS Stored Usable Energy**:
   - Stored Energy is computed dynamically as:
     $$\text{Stored Usable Energy (kWh)} = \text{bess\_capacity\_kwh} \times \left(\frac{\text{bess\_soc\_pct}}{100}\right)$$
   - Both installed capacity ($kWh$ or $MWh$) and remaining stored energy are displayed alongside the SoC progress meter.
4. **Database Migration for Missing Snapshot Fields**:
   - To support DG Generation Today and BESS Daily Cycling in `public.telemetry_snapshots`, we create migration `0005_add_asset_energy_figures_to_snapshots.sql`:
     - `dg_yield_today_kwh DOUBLE PRECISION DEFAULT 0.0`
     - `bess_charge_today_kwh DOUBLE PRECISION DEFAULT 0.0`
     - `bess_discharge_today_kwh DOUBLE PRECISION DEFAULT 0.0`
5. **Adaptive Subsystem Grid**:
   - Sites without certain assets (e.g. Site 3 with No BESS, Site 4 Islanded Off-Grid with No Grid, Site 5 Clean Island with No DG) will conditionally render only the assets equipped on that plant, allowing the available asset telemetry cards to expand with high visual balance.

---

## 5. Files Likely to Change
1. `supabase/migrations/0005_add_asset_energy_figures_to_snapshots.sql`: SQL migration adding missing energy accumulator columns.
2. `scripts/apply-asset-energy-migration.js`: Automated runner applying migration and updating demo telemetry with realistic values.
3. `lib/energy/types.ts`: Updating `SiteRecord` and `SiteData` interfaces with new energy accumulator fields.
4. `lib/energy/site-service.ts`: Updating `getSitesForOrg` and `getSiteDetails` to query the new fields from `telemetry_snapshots`.
5. `components/design-system/site-cockpit-card-preview.tsx`: Full redesign of the telemetry section with dedicated subsystem tiles.
6. `components/dashboard/fleet-cockpit-view.tsx`: Pass complete asset data from `useSites` into `<SiteCockpitCard />`.

---

## 6. Implementation Requirements

### Step 1: Database Schema & Migration
- Add `dg_yield_today_kwh`, `bess_charge_today_kwh`, and `bess_discharge_today_kwh` to `public.telemetry_snapshots`.
- Seed realistic figures across the 6 demo installations:
  - **Bhadla Phase IV**: Solar $15,000\ kWp$, Yield $58,400\ kWh$, Spec Yield $3.89\ kWh/kWp$, Grid $8,000\ kVA$, Import $14,200\ kWh$, BESS $30,000\ kWh$ ($82\%\ SoC$, $24,600\ kWh$ stored, Charged $18,500\ kWh$).
  - **Gurugram Microgrid**: Solar $2,500\ kWp$, Yield $10,750\ kWh$, Spec Yield $4.30\ kWh/kWp$, Grid $2,000\ kVA$, Import $4,850\ kWh$, BESS $5,000\ kWh$ ($68\%\ SoC$, $3,400\ kWh$ stored), DG $1,250\ kVA$, DG Yield $480\ kWh$ (Running peaker).
  - **Manesar Industrial**: Solar $1,200\ kWp$, Yield $5,160\ kWh$, Spec Yield $4.30\ kWh/kWp$, Grid $1,500\ kVA$, Import $7,300\ kWh$, DG $750\ kVA$, DG Yield $210\ kWh$ (Standby).
  - **Thar Desert Minigrid**: Solar $800\ kWp$, Yield $3,420\ kWh$, Spec Yield $4.28\ kWh/kWp$, DG $500\ kVA$, DG Yield $680\ kWh$ (Continuous baseload), Grid: Islanded ($0\ kVA$).
  - **Coachella Islanded**: Solar $1,200\ kWp$, Yield $5,400\ kWh$, Spec Yield $4.50\ kWh/kWp$, BESS $2,000\ kWh$ ($92\%\ SoC$, $1,840\ kWh$ stored, Charged $2,800\ kWh$), Grid: Islanded.
  - **Neemrana Manufacturing**: Solar $4,000\ kWp$, BESS $8,000\ kWh$, Grid $3,000\ kVA$, Subscription Expired (Paused feeds).

### Step 2: Query Service & TypeScript Updates
- Update `lib/energy/types.ts`:
  - Add `dg_yield_today_kwh`, `bess_charge_today_kwh`, `bess_discharge_today_kwh`, `grid_import_today_kwh`, `grid_export_today_kwh` to `SiteRecord` and `SiteData`.
- Update `lib/energy/site-service.ts`:
  - Select all energy accumulator columns in `getSitesForOrg` and `getSiteDetails`.

### Step 3: Card Component UI Redesign (`SiteCockpitCard`)
- Replace the legacy 3-box strip with a structured, cybernetic **Subsystem Telemetry Grid**:
  - **Solar Panel Block** (Amber `#FFD600`):
    - "Installed": `site.solar_capacity_kwp >= 1000 ? (site.solar_capacity_kwp / 1000).toFixed(1) + " MWp" : site.solar_capacity_kwp + " kWp"`
    - "Gen Today": `site.solar_yield_today_kwh >= 1000 ? (site.solar_yield_today_kwh / 1000).toFixed(1) + " MWh" : site.solar_yield_today_kwh + " kWh"`
    - "Specific Yield": `(solar_yield_today_kwh / solar_capacity_kwp).toFixed(2) + " kWh/kWp"`
    - Live active generation: `site.live_solar_kw.toLocaleString() + " kW"`
  - **Utility Grid Block** (Purple `#9D4EDD`):
    - "Sanctioned": `site.has_grid ? site.contracted_demand_kva.toLocaleString() + " kVA" : "ISLANDED (0 kVA)"`
    - "Drawn Today": `site.has_grid ? site.grid_import_today_kwh.toLocaleString() + " kWh" : "0 kWh (Self-Powered)"`
    - Live import/export kW with directional indicator ($\to$ Import, $\leftarrow$ Feed-in).
  - **BESS Storage Block** (Cyan `#00F0FF`):
    - "SoC": `site.bess_soc_pct.toFixed(1) + "%"` with mini gradient bar.
    - "Capacity": `site.bess_capacity_kwh >= 1000 ? (site.bess_capacity_kwh / 1000).toFixed(1) + " MWh" : site.bess_capacity_kwh + " kWh"`
    - "Stored Usable": `((site.bess_capacity_kwh * site.bess_soc_pct) / 100).toLocaleString() + " kWh"`
    - "Cycled Today": `In: +${bess_charge_today_kwh} / Out: -${bess_discharge_today_kwh} kWh`
  - **Diesel Generator Block** (Orange `#FF6B00`):
    - "Installed": `site.dg_capacity_kva.toLocaleString() + " kVA"`
    - "Gen Today": `site.dg_yield_today_kwh.toLocaleString() + " kWh"`
    - "Status": `dg_running ? "RUNNING" : "STANDBY"` with fuel percentage pill (`Fuel: 82%`).
  - **Facility Load Block** (Pink `#FF2A85`):
    - "Active Load": `site.load_kw.toLocaleString() + " kW"`
    - "Energy Today": `site.load_consumption_today_kwh.toLocaleString() + " kWh"`

---

## 7. Design System & Visual Adherence
- Backgrounds: Obsidian `#0B0D13` with Elevated surface `#121622` for metric tiles.
- Semantic Accents:
  - Solar: Electric Amber `#FFD600`
  - BESS: Laser Cyan `#00F0FF`
  - Grid: Electric Purple `#9D4EDD`
  - DG: Hi-Viz Orange `#FF6B00`
  - Load & Brand: Neon Pink `#FF2A85`
- Monospace Rule: All electrical metrics and units ($kW$, $MWp$, $kVA$, $kWh/kWp$, $kWh$, $\%$) strictly utilize `font-mono`.
- Mobile-First Touch Ergonomics: Card action targets satisfy minimum $\ge 48 \times 48\ px$.

---

## 8. Security & RBAC Requirements
- Multi-tenant isolation: Queries filtered by active Clerk organization (`org_id`).
- Subscription enforcement: Expired sites display an amber warning badge and pause live telemetry updates.

---

## 9. Acceptance Criteria
1. The Home screen site cards display granular telemetry for Solar (Installed kWp, Gen Today kWh, Specific Yield kWh/kWp).
2. The Grid block clearly indicates Sanctioned Capacity (kVA) and Power Drawn Today (kWh), or Islanded mode.
3. The DG block displays Installed Capacity (kVA), Generation Today (kWh), and Running/Standby state with fuel %.
4. The BESS block displays SoC %, Installed MWh/kWh, Stored Usable Energy, and Cycled figures.
5. Sites with missing assets (e.g. no DG, no BESS, or Islanded) adapt gracefully without blank or broken cards.
6. `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass with 0 errors.

---

## 10. Checks to Run
- `node scripts/apply-asset-energy-migration.js`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

---

## 11. Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `http://localhost:3000/`.
2. Inspect the 6 site cards on desktop ($1440 \times 900$):
   - **Site 1 (Bhadla Solar & Storage)**: Check Solar ($15.0\ MWp$, $58,400\ kWh$, $3.89\ kWh/kWp$), Grid ($8,000\ kVA$ Sanctioned, $14,200\ kWh$ drawn), BESS ($82\%\ SoC$, $24,600\ kWh$ stored).
   - **Site 2 (Gurugram Tech Park)**: Verify all 4 assets (Solar, BESS, DG, Grid) render cleanly side-by-side.
   - **Site 3 (Manesar Industrial)**: Verify BESS tile is omitted; DG and Grid expand cleanly.
   - **Site 4 (Thar Desert Islanded)**: Verify Grid tile displays `"ISLANDED (0 kVA)"` and DG shows active generation.
   - **Site 5 (Coachella Islanded Hub)**: Verify 100% clean solar + BESS island metrics.
   - **Site 6 (Neemrana Manufacturing)**: Verify expired subscription banner and paused figures.
3. Switch viewport to Mobile ($390 \times 844$ iPhone):
   - Verify all subsystem tiles wrap gracefully into responsive mobile touch columns without horizontal overflow.
