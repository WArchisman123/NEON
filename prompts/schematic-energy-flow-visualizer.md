# Implementation Prompt: Schematic Node Energy Flow Visualizer & Multi-Horizon Asset Strip

## 1. Goal
Implement the exact **Schematic Node Energy Flow Visualizer** specified in `public/context/context_img/flow.jpg`:
1. **Asset Telemetry Header Cards Strip**:
   - **Solar Card**: Installed Capacity, Specific Yield, Site Health / PR %
   - **Grid Card**: Sanctioned Load, MDI (Maximum Demand Indicator), Phase 1/2/3 Load (kW)
   - **DG Card**: Installed Capacity, Number of Gensets, Engine Runtime (hrs)
   - **BESS Card**: Installed Energy Capacity, State of Charge (SoC %), Stored Usable Energy
2. **Multi-Horizon Time Tabs**:
   - `Realtime` | `Daily` | `Monthly` | `Yearly`
   - Dynamically toggles metrics between instantaneous kW, Daily kWh, Monthly MWh, and Yearly MWh.
3. **Animated Circular-Node Schematic Flow Diagram** (1:1 visual match with `flow.jpg` in Cyber Black / Neon Pink styling):
   - Vertical central electrical spine / trunk.
   - Circular asset bubbles whose diameter and glowing aura dynamically scale with active power volume:
     - **Top**: Utility Grid Node (or Off-Grid status)
     - **Upper-Left Branch**: Solar PV Node
     - **Middle-Right Branch**: BESS Storage Node (with bidirectional charge/discharge indication)
     - **Lower-Left Branch**: DG Genset Node
     - **Bottom Hub**: Facility Load Terminal Node
   - **Animated Energy Beads / Particles**: Glowing beads traveling along the dashed conduits from active sources into the central spine and down into the Load bubble (or into BESS when charging, or into Grid when exporting).
   - Each node displays its Icon, Name, Active Value (kW/kWh), and `% of Load Share`.
4. **Retain the Direct Source-to-Sink Section**:
   - As requested by the user ("Direct Source-to-Sink Electrical Energy Flow . Keep this section"), preserve the detailed source-to-sink routing matrix directly below.

---

## 2. Relevant Agent Skills
- `.agents/skills/shadcn/`: Tab navigation, badge typography, card layout, and touch ergonomics.
- `.agents/skills/clerk-nextjs-patterns/`: Session verification and site routing.

---

## 3. Existing Code Inspected
- `public/context/context_img/flow.jpg`: The reference mobile screenshot showing the asset header cards (Solar, Grid, DG), the `Realtime | Daily | Monthly | Yearly` tabs, and the vertical spine flow diagram with scaled circular bubbles and animated beads.
- `lib/energy/flow-engine.ts`: Power balance calculation module.
- `components/energy-flow/energy-flow-visualizer.tsx`: The source-to-sink visualizer.
- `app/sites/[id]/page.tsx`: Site detail page.

---

## 4. Decisions or Assumptions
1. **Circular Bubble Scaling Formula**:
   - The radius $r$ of each source bubble scales with its active power contribution:
     $$r = \max(24, \min(54, 24 + \sqrt{\text{kw}} \times 1.2))$$
   - Inactive sources (e.g. DG on standby, or Solar at night) render as compact, dim circular nodes ($r = 20\ px$, subtle border).
   - Active sources glow in their respective cyber colors:
     - Solar: Electric Amber (`#FFD600`)
     - BESS: Laser Cyan (`#00F0FF`)
     - DG: Hi-Viz Orange (`#FF6B00`)
     - Grid: Electric Purple (`#9D4EDD`)
     - Load: Neon Pink (`#FF2A85`)
2. **Animated Energy Beads on Dashed Spine**:
   - An SVG overlay renders dashed conduits with animated travelling bead circles (`<circle>` with `<animateMotion>` or CSS keyframe translation) moving smoothly along the paths:
     - Solar $\to$ Spine $\to$ Load
     - DG $\to$ Spine $\to$ Load
     - Grid $\to$ Spine $\to$ Load
     - BESS $\to$ Spine $\to$ Load (or Spine $\to$ BESS when charging)
3. **Multi-Horizon Tab Switching**:
   - `Realtime`: Shows live instantaneous kW and instantaneous load percentage.
   - `Daily`: Shows cumulative energy today ($kWh$ / $MWh$) and daily share.
   - `Monthly`: Shows 30-day cumulative dispatch ($MWh$).
   - `Yearly`: Shows year-to-date cumulative yield ($MWh$).
4. **Desktop & Mobile Responsiveness**:
   - Designed desktop-first and mobile-optimized, precisely matching `flow.jpg` on mobile screens ($< 768px$) and expanding with control-room fidelity on desktop ($> 1024px$).

---

## 5. Files Likely to Change
1. `components/energy-flow/schematic-node-flow.tsx`: New component implementing the vertical spine circular node flow diagram from `flow.jpg`.
2. `components/energy-flow/energy-flow-visualizer.tsx`: Keep existing source-to-sink breakdown as requested.
3. `app/sites/[id]/page.tsx`: Integrate the new schematic flow visualizer alongside the direct source-to-sink section.

---

## 6. Implementation Requirements

### Step 1: Schematic Node Flow Component (`components/energy-flow/schematic-node-flow.tsx`)
- **Asset Header Strip**:
  - Solar: Installed Capacity, Specific Yield, PR %
  - Grid: Sanctioned Load, MDI, Phase 1/2/3 kW
  - DG: Installed Capacity, No of Gensets, Runtime (hrs)
  - BESS: Installed Capacity, SoC %, Stored Usable Energy
- **Horizon Tabs**: `Realtime`, `Daily`, `Monthly`, `Yearly`.
- **Vertical Spine Flow Canvas**:
  - Top: Grid Node bubble with live kW & % of load.
  - Left Branch 1: Solar Node bubble with dashed conduit to spine.
  - Right Branch 2: BESS Node bubble with dashed conduit to spine.
  - Left Branch 3: DG Node bubble with dashed conduit to spine.
  - Bottom: Load Node bubble with building icon, active demand, and total power received.
  - Animated SVG moving beads traveling along the dashed lines in the direction of power.
  - Clicking any circular node opens the `TelemetryDrawer`.

### Step 2: Site Detail Integration (`app/sites/[id]/page.tsx`)
- Render `<SchematicNodeFlow site={site} />` as the primary live flow visualizer.
- Render `<EnergyFlowVisualizer site={site} />` directly below it, honoring the user's explicit instruction to keep the Direct Source-to-Sink section.

---

## 7. Design System & Visual Adherence
- Void Black `#060709` canvas with subtle matrix grid.
- Obsidian cards `#0B0D13` with semantic color accents (`#FFD600`, `#00F0FF`, `#9D4EDD`, `#FF6B00`, `#FF2A85`).
- Monospace numbers (`font-mono`) for all electrical readouts and percentages.
- Minimum tap targets $\ge 48 \times 48\ px$.

---

## 8. Acceptance Criteria
1. Exactly implements the visual flow diagram shown in `flow.jpg` (circular bubbles connected to a vertical trunk spine with animated beads).
2. Includes the top asset header cards (Solar, Grid, DG, BESS) with installed capacity, specific yield, sanctioned load, MDI, phase balance, and runtime.
3. Includes the `Realtime | Daily | Monthly | Yearly` time horizon switcher.
4. Keeps the Direct Source-to-Sink Electrical Energy Flow section intact below.
5. `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass with 0 errors.

---

## 9. Checks to Run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

---

## 10. Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `/sites/<id>` in the browser.
2. View the new **Schematic Node Energy Flow** diagram matching `flow.jpg`:
   - Inspect the top cards (Solar, Grid, DG, BESS).
   - Click `Realtime`, `Daily`, `Monthly`, and `Yearly` tabs and observe values update.
   - Look at the circular node bubbles and observe the animated glowing beads moving along the dashed lines into the Load circle.
3. Scroll down and confirm the **Direct Source-to-Sink Electrical Energy Flow** section is preserved with its detailed supply breakdown.
