# Implementation Prompt: Isometric System Topology Flow Visualizer

## Goal
Replicate the clean, industrial **System Topology UI** from competitor EMS reference (`public/context/context_img/01_dashboard_overview_financial.png`) to replace the current circular flow visualizer in NEON. The new component will render an isometric/3D-styled 6-node electrical transfer grid (Solar PV, PCS/Inverter, Utility Grid, DG Set, BESS Storage, and Building Load) with animated directional particle conduits reflecting live kilowatt transfer volume, node health status badges, and dual-theme compatibility.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: Styling, Card composition, Dialog/Tooltip primitives, and touch ergonomics.
- Dual-theme token system (Cyber Dark `#060709` / `#0B0D13` with Neon Pink `#FF2A85` accents, and Solar Day Mode `#F4F6FB` / `#FFFFFF`).

---

## Existing Code Inspected
- `public/context/context_img/01_dashboard_overview_financial.png`: Competitor reference for the System Topology canvas on the site dashboard.
- `public/context/context_img/02_energy_flow_diagram_top.png`: Competitor reference for the detailed flow diagram and junction routing.
- `components/energy-flow/schematic-node-flow.tsx`: Existing circular flow diagram to be modernized.
- `components/energy-flow/energy-flow-visualizer.tsx`: Existing flow visualizer wrapper.
- `components/site-detail/single-site-ems-view.tsx`: Site view hosting the topology canvas on the Dashboard and Energy Flow tabs.
- `lib/energy/flow-engine.ts`: Energy flow calculation engine providing instantaneous directional transfers.

---

## Decisions or Assumptions
1. **Layout & Node Grid**:
   - 6 Isometric Nodes arranged in a balanced 2-row $\times$ 3-column electrical schematic:
     - **Top Row**: Solar PV (Left) $\to$ PCS / Inverter (Center) $\to$ Utility Grid (Right)
     - **Bottom Row**: DG Set (Left) $\to$ BESS Container (Center) $\to$ Facility Building Load (Right)
   - Connecting Conduits:
     - Solar PV $\to$ PCS / Inverter (DC $\to$ AC conversion conduit)
     - PCS / Inverter $\leftrightarrow$ Utility Grid (Bi-directional grid tie conduit)
     - PCS / Inverter $\leftrightarrow$ BESS Container (Bi-directional battery charge/discharge DC bus)
     - DG Set $\to$ BESS / AC busbar (Emergency backup generator feed)
     - BESS Container $\to$ Building Load (Battery peak shaving & self-consumption)
     - Utility Grid $\to$ Building Load (Grid baseline import / export feed)
2. **Visual Aesthetics & Isometric Rendering**:
   - Custom high-contrast SVG isometric asset illustrations for each physical node:
     - **Solar PV**: Angled blue solar panel matrix with string combiner box.
     - **PCS / Inverter**: Industrial multi-door inverter power conversion enclosure.
     - **Grid**: High-voltage electrical steel lattice transmission pylon.
     - **DG Set**: Weatherproof diesel genset container with exhaust stack.
     - **BESS**: Containerized battery storage cabinet with coolant loop manifold.
     - **Building Load**: Multi-story modern industrial facility with sub-distribution lines.
   - Status indicators: `● Online`, `● Standby`, or `● Fault` badges for each asset.
   - Real-time numerical transfer values ($kW$) displayed next to conduits and nodes in `font-mono`.
3. **Animated Conduits**:
   - SVG conduits with animated stroke-dashoffset / moving particle dots.
   - Particle velocity and luminous intensity dynamically scaled based on active kW volume.
   - Reverse particle direction automatically when power reverses (e.g. BESS charging vs discharging; Grid importing vs exporting).
4. **Header Controls**:
   - Card title: `System Topology` with topology icon.
   - Mode indicator pill: `Grid-Tied Self-Consumption`, `Peak Shaving`, `Islanded`, or `DG Backup`.
   - Info button `(i)` with electrical single-line diagram details and Fullscreen toggle `[ ⛶ ]`.
5. **Responsiveness**:
   - Desktop ($1440 \times 900$): Full 3x2 isometric schematic canvas with interactive node cards.
   - Mobile ($< 768px$): Fluid SVG viewBox scaling and vertical flex reflow maintaining touch ergonomics ($\ge 48 \times 48\ px$).

---

## Files Likely to Change
1. `components/energy-flow/system-topology-visualizer.tsx` (New): Modernized isometric system topology visualizer replicating the reference design.
2. `components/energy-flow/schematic-node-flow.tsx`: Updated to export and leverage the new isometric topology canvas.
3. `components/site-detail/single-site-ems-view.tsx`: Connect new topology visualizer across Dashboard and Energy Flow tabs.

---

## Design System & Visual Adherence
- **Cyber Dark**: Background grid on Obsidian `#0B0D13`, glowing conduit lines, Neon Pink `#FF2A85` accents, Electric Amber `#FFD600` for Solar, Laser Cyan `#00F0FF` for BESS, Deep Violet `#9D4EDD` for Grid, Hi-Viz Orange `#FF6B00` for DG, Cyber Emerald `#00E676` for Load.
- **Solar Day Light**: Crisp slate borders, pure white card containers, deep charcoal ink `#0B0F19`, high-contrast color badges.
- **Monospace Rule**: All kW, V, A, and % values formatted in `font-mono`.

---

## Security & RBAC Requirements
- Purely presentation and telemetry visualization; read-only operations safe across all RBAC tiers.

---

## Acceptance Criteria
1. The System Topology canvas faithfully replicates the reference in `01_dashboard_overview_financial.png` (2x3 isometric layout: Solar, PCS, Grid on top; DG, BESS, Load on bottom).
2. Animated dashed conduit lines show directional particle flow between nodes reflecting live kW power transfer.
3. Each node displays its isometric icon, asset title, active status badge (`● Online`), and real-time kW reading.
4. Particle speed and direction dynamically adapt to system mode (Solar generation, BESS charging/discharging, Grid import/export).
5. Seamless rendering in both Cyber Dark Mode and Solar Day Mode.
6. TypeScript compilation (`npx tsc --noEmit`) and ESLint pass with 0 errors.

---

## Checks to Run
- `npm run typecheck` or `npx tsc --noEmit`: 0 errors.
- `npm run lint`: 0 errors.
- Manual verification on desktop and mobile viewports.

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `http://localhost:3000/`.
2. Inspect the **System Topology** card in the center of the Dashboard tab:
   - Verify the 6 isometric nodes (Solar PV, PCS/Inverter, Grid, DG Set, BESS, Building Load).
   - Verify the animated conduits connecting Solar $\to$ Inverter $\to$ Grid, Inverter $\leftrightarrow$ BESS, DG $\to$ BESS, and BESS/Grid $\to$ Building Load.
   - Confirm particle movement indicates live power direction.
3. Switch to the **Energy Flow** tab. Verify the topology canvas renders with full dimensions.
4. Toggle the Theme Switcher (sun/moon icon). Confirm high-contrast visibility in Solar Day Light mode and Cyber Dark mode.
5. In Chrome DevTools, test responsive scaling on mobile ($390 \times 844$).
