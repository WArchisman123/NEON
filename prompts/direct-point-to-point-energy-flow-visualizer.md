# Implementation Prompt: Direct Source-to-Sink Energy Flow Visualizer & Multi-Source Load Breakdown

## 1. Goal
Redesign the **Energy Flow Visualizer** on `/sites/[id]` based on user feedback:
1. **Remove the Central Busbar Box**: Replace the abstract busbar junction where DG/Grid power appeared to dead-end with direct, intuitive **Source-to-Sink physical conduits** connecting generation sources directly to **Facility Load**, BESS, and Grid.
2. **Explicit Quantitative Flow Routing**: Show exact kilowatt volumes moving along each individual conduit path:
   - `Solar ➔ Load` (kW)
   - `BESS ➔ Load` (discharging kW) or `Solar ➔ BESS` (charging kW)
   - `DG ➔ Load` (genset active contribution kW)
   - `Grid ➔ Load` (import kW) or `Solar ➔ Grid` (export kW)
3. **Comprehensive Facility Load Energy Mix Matrix**: Display the exact multi-source energy breakdown on the Facility Load node (and in a dedicated summary bar), showing how much load is powered by Solar, BESS, DG, and Grid, with percentage share and multi-colored segmented progress bar.
4. **Source Dispatch Details on Each Card**: Show exactly where each source's output is delivered (e.g. Solar: $720\ kW$ total $\to 600\ kW$ to Load, $120\ kW$ to BESS).

---

## 2. Relevant Agent Skills
- `.agents/skills/shadcn/`: High-contrast dark cards, segmented progress bars, tooltips, responsive layout reflow.
- `.agents/skills/clerk-nextjs-patterns/`: Session verification and site routing.

---

## 3. Existing Code Inspected
- `components/energy-flow/energy-flow-visualizer.tsx`: The current canvas with the central busbar box.
- `lib/energy/flow-engine.ts`: Power balance calculation module.
- `components/energy-flow/telemetry-drawer.tsx`: The detailed telemetry drawer.
- `app/sites/[id]/page.tsx`: The site detail route.
- `public/context/context_img/flow visualizer example.png`: The original architectural reference.

---

## 4. Decisions or Assumptions
1. **Direct Point-to-Point Routing Physics (`lib/energy/flow-engine.ts`)**:
   - Power transfers will be calculated using exact physical energy dispatch rules:
     - **Solar Priority**:
       $$\text{solarToLoad} = \min(\text{solarKw}, \text{loadKw})$$
       $$\text{solarSurplus} = \text{solarKw} - \text{solarToLoad}$$
       $$\text{solarToBess} = \min(\text{solarSurplus}, |\text{bessKw}|)\quad (\text{if charging, i.e. } \text{bessKw} < 0)$$
       $$\text{solarToGrid} = \min(\text{solarSurplus} - \text{solarToBess}, |\text{gridKw}|)\quad (\text{if exporting})$$
     - **Deficit Dispatch (Load Support)**:
       $$\text{loadDeficit} = \text{loadKw} - \text{solarToLoad}$$
       $$\text{bessToLoad} = \min(\text{loadDeficit}, \text{bessKw})\quad (\text{if discharging, i.e. } \text{bessKw} > 0)$$
       $$\text{dgToLoad} = \min(\text{loadDeficit} - \text{bessToLoad}, \text{dgKw})\quad (\text{if DG running})$$
       $$\text{gridToLoad} = \min(\text{loadDeficit} - \text{bessToLoad} - \text{dgToLoad}, \text{gridKw})\quad (\text{if grid importing})$$
   - This ensures **Conservation of Energy**:
     $$\text{Total Load Demand} = \text{solarToLoad} + \text{bessToLoad} + \text{dgToLoad} + \text{gridToLoad}$$
     Every kilowatt produced by DG or Grid is explicitly routed directly into Facility Load!
2. **Canvas Topology (Source-to-Sink Architecture)**:
   - **Left / Perimeter Column**: Generation & Storage Nodes:
     - ☀️ **Solar PV Array** (Top-Left)
     - 🔋 **BESS Storage Container** (Middle-Left)
     - 🔥 **Diesel Generator Peaker** (Bottom-Left)
     - ⚡ **Utility Grid Intertie** (Bottom-Center)
   - **Right Column / Primary Sink**:
     - 🏭 **Facility Consumption Load** (Large, prominent destination hub):
       - Displays total active demand in $kW$
       - Displays live **Load Energy Mix**:
         - Solar % (`#FFD600`)
         - BESS % (`#00F0FF`)
         - DG % (`#FF6B00`)
         - Grid % (`#9D4EDD`)
       - Multi-color segmented progress bar visually showing the exact proportion of each power source.
3. **Direct Point-to-Point Conduits**:
   - Conduits connect directly from each source to Load (and between Solar and BESS/Grid):
     - `Solar ➔ Load` (Amber animated stroke)
     - `BESS ➔ Load` (Cyan animated stroke when discharging) or `Solar ➔ BESS` (Amber stroke entering BESS when charging)
     - `DG ➔ Load` (Orange animated stroke flowing directly into Load)
     - `Grid ➔ Load` (Purple animated stroke flowing directly into Load when importing) or `Solar ➔ Grid` (Amber/Purple stroke when exporting)
   - Each conduit carries an inline volumetric badge with the exact transfer amount:
     - e.g. `🔥 DG ➔ Load: 180 kW`
     - e.g. `☀️ Solar ➔ Load: 420 kW`
     - e.g. `🔋 BESS ➔ Load: 120 kW`
     - e.g. `⚡ Grid ➔ Load: 310 kW`

---

## 5. Files Likely to Change
1. `lib/energy/flow-engine.ts`: Update `calculateEnergyFlows` with exact point-to-point transfer matrix and Load Energy Mix breakdown.
2. `components/energy-flow/energy-flow-visualizer.tsx`: Remove central busbar box; replace with direct Source-to-Sink topology, direct conduits with individual kW labels, and Load Energy Mix breakdown.
3. `components/energy-flow/telemetry-drawer.tsx`: Retain existing deep telemetry tabs (16-cell thermal heatmap, MPPT strings, DG metrics, etc.).

---

## 6. Implementation Requirements

### Step 1: Exact Point-to-Point Flow Math (`lib/energy/flow-engine.ts`)
- Calculate exact source-to-sink distributions:
  - `solarToLoadKw`
  - `solarToBessKw`
  - `solarToGridKw`
  - `bessToLoadKw`
  - `dgToLoadKw`
  - `gridToLoadKw`
- Calculate Load Energy Mix:
  - `solarSharePct`: $(\text{solarToLoad} / \text{loadKw}) \times 100$
  - `bessSharePct`: $(\text{bessToLoad} / \text{loadKw}) \times 100$
  - `dgSharePct`: $(\text{dgToLoad} / \text{loadKw}) \times 100$
  - `gridSharePct`: $(\text{gridToLoad} / \text{loadKw}) \times 100$

### Step 2: Energy Flow Visualizer Redesign (`components/energy-flow/energy-flow-visualizer.tsx`)
- Remove the central "Microgrid Busbar" node entirely.
- Lay out generation sources on the left/perimeter and Facility Load prominently on the right.
- Render direct SVG conduits connecting active sources directly into Facility Load:
  - `Solar ➔ Load`
  - `BESS ➔ Load` (or `Solar ➔ BESS`)
  - `DG ➔ Load`
  - `Grid ➔ Load` (or `Solar ➔ Grid`)
- Display volumetric flow pills directly on each conduit showing source, destination, and transfer kW.
- On the **Facility Load** node:
  - Prominent active demand display.
  - Multi-source breakdown cards:
    - ☀️ Solar: `X kW (Y%)`
    - 🔋 BESS: `X kW (Y%)`
    - 🔥 DG: `X kW (Y%)`
    - ⚡ Grid: `X kW (Y%)`
  - Segmented multi-colored progress bar.
- On each generation card:
  - Show where its generation goes (e.g. `180 kW ➔ Facility Load`).

---

## 7. Design System & Visual Adherence
- Void Black background `#060709` with engineering dot grid pattern.
- Obsidian dark cards `#0B0D13` with subtle glowing borders.
- Semantic colors:
  - Solar: Electric Amber `#FFD600`
  - BESS: Laser Cyan `#00F0FF`
  - DG: Hi-Viz Orange `#FF6B00`
  - Grid: Electric Purple `#9D4EDD`
  - Load: Neon Pink `#FF2A85`
- Monospace font (`font-mono`) for all electrical metrics and percentages.

---

## 8. Acceptance Criteria
1. The abstract central busbar box is completely removed.
2. Power from DG and Grid visibly and directly flows into Facility Load (not into an abstract dead-end).
3. Every conduit displays an explicit transfer label indicating the exact amount of kilowatts moving from source to destination (e.g. `DG ➔ Load: 180 kW`).
4. Facility Load displays an exact breakdown of how much power is supplied by Solar, BESS, DG, and Grid.
5. All scenarios (Solar Surplus, Peak Shaving, Night Grid Import, Islanded DG) correctly route power and animate in real time.
6. `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass with 0 errors.

---

## 9. Checks to Run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

---

## 10. Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `/sites/<id>` in the browser.
2. Inspect the redesigned Energy Flow Visualizer:
   - Confirm the central busbar box is gone.
   - Observe direct conduits leading from Solar, BESS, DG, and Grid into the Facility Load on the right.
   - Confirm each conduit has a clear label (e.g. `DG ➔ Load: 180 kW`, `Solar ➔ Load: 420 kW`).
3. Inspect the **Facility Load** card:
   - Check the Load Energy Mix breakdown table and multi-colored segmented progress bar showing exact kW and percentage contributions from each source.
4. Click scenario buttons:
   - **Peak Shaving**: Watch BESS ($380\ kW$) and Solar ($420\ kW$) lines converge into Load ($800\ kW$).
   - **Islanded Microgrid ➔ DG + Solar**: Watch DG ($350\ kW$) and Solar ($250\ kW$) lines flow directly into Load ($600\ kW$).
   - **Solar Surplus**: Watch Solar power split into Load ($480\ kW$), BESS Charging ($350\ kW$), and Grid Feed-in ($420\ kW$).
