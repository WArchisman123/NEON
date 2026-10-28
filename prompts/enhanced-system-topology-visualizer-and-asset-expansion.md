# Implementation Prompt: Enhanced System Topology Visualizer, Rich 3D Asset Representations & Telemetry Expansion

## Goal
Elevate the **System Topology Visualizer** (`components/energy-flow/system-topology-visualizer.tsx`) across both the Dashboard Tab and Energy Flow Tab with richer, industrial-grade 3D isometric asset representations, live real-time kilowatt and operating badges on each node, animated directional energy transfer conduits, and an interactive expanded/fullscreen mode featuring deep asset telemetry drilldowns and operating mode toggles, referencing competitor EMS telemetry standards (`01_dashboard_overview_financial.png`, `02_energy_flow_diagram_top.png`, `03_energy_flow_summaries_and_trend.png`).

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Dialog, Sheet, Badge, Tooltip components with Cyber Dark & High-Contrast Light styling)
- `.agents/skills/clerk/` & `clerk-nextjs-patterns/` (Ensuring tenant and site data safety)

---

## Existing Code Inspected
- `components/energy-flow/system-topology-visualizer.tsx`: Currently renders 6 nodes with basic text and static SVGs, no live kilowatt badges on nodes, no interactive node drilldown modal, and minimal fullscreen information.
- `components/energy-flow/telemetry-drawer.tsx`: Existing drawer providing detailed telemetry for Solar, BESS, DG, Grid, and Load.
- `components/site-detail/tabs/dashboard-tab.tsx`: Embeds `SystemTopologyVisualizer` in the center row at height 340px.
- `components/site-detail/tabs/energy-flow-tab.tsx`: Embeds `SystemTopologyVisualizer` as hero canvas with operating mode pills.
- `public/context/COMPETITOR_EMS_METERING_BREAKDOWN.md`: References Pages 1 & 2 for 3D System Topology Canvas, 7-node dynamic power balance, and 4-quadrant diagnostic summaries.

---

## Key Improvements & Design Decisions

### 1. Rich Industrial Asset Node Representation
Replace bare text and basic icons with modular, cyber-styled **Asset Nodes**:
- **Solar PV** (`#FFD600`):
  - 3D Isometric photovoltaic array with blue solar cell grid lines.
  - Live metric: `solar_power_kw` (e.g. `89.3 kW`) in `font-mono`.
  - Sub-metrics: Irradiance ($W/m^2$), Performance Ratio ($PR\%$).
  - Status pill: Glowing `Online` / `Standby`.
- **PCS / Bi-directional Inverter** (`#38BDF8`):
  - 3D Isometric conversion cabinet with heat ventilation louvers and green run LED.
  - Live metric: Inverter throughput `inverter_power_kw` (e.g. `74.4 kW`).
  - Sub-metrics: Efficiency `98.4%`, Conversion state (`AC ⇄ DC`).
  - Status pill: `Running` / `Inverting`.
- **Utility Grid Interconnection** (`#9D4EDD`):
  - 3D High-voltage transmission pylon with purple insulator rings.
  - Live metric: `grid_power_kw` (e.g. `76.6 kW Net Import` or `Export`).
  - Sub-metrics: `415V LL`, `50.0 Hz`, Power Factor `0.99`.
  - Direction indicator arrow (Import vs Export).
- **Diesel Generator Set** (`#FF6B00`):
  - 3D Isometric genset enclosure with exhaust manifold and orange alternator coil.
  - Live metric: `dg_power_kw` (e.g. `0.0 kW` or active backup kW).
  - Sub-metrics: `0 RPM` / `1500 RPM`, Fuel Level (`82%`), Coolant Temp.
  - Status pill: `Standby` (dim orange) or `Active Run` (glowing orange pulse).
- **BESS Container** (`#00F0FF`):
  - 3D Liquid-cooled battery container with LED door status and rack cooling vents.
  - Live metric: `live_bess_power_kw` (e.g. `-74.4 kW Charging` or `+ Discharging`).
  - Sub-metrics: SoC (`21.7%`), SoH (`98.3%`), DC bus (`871 V`).
  - Dynamic battery charge progress bar embedded inside the node.
- **Facility / Building Load** (`#FF2A85`):
  - 3D Commercial facility structure with neon cyan and pink lit windows.
  - Live metric: `load_power_kw` (e.g. `100.4 kW`).
  - Sub-metrics: Peak Demand (`64% MD`), Phase Imbalance (`1.2%`).

### 2. High-Tech Animated Power Conduits
- SVG stroke-dashoffset animations with directional particle physics.
- Conduit line speed and glowing particle colors dynamically reflect transfer volume and direction:
  - Solar $\to$ PCS: Electric Amber (`#FFD600`)
  - PCS $\leftrightarrow$ Grid: Deep Grid Purple (`#9D4EDD`) with bidirectional flow logic
  - PCS $\leftrightarrow$ BESS: Laser Cyan (`#00F0FF`) reflecting Charge (downward) vs Discharge (upward)
  - DG Set $\to$ BESS/Bus: Hi-Viz Orange (`#FF6B00`) active only when DG is running
  - BESS $\to$ Building Load: Neon Pink (`#FF2A85`)
  - Grid $\to$ Building Load: Purple/Pink junction conduit
- Dynamic pulse frequency: High power ($> 50\text{ kW}$) accelerates particle animation; idle/low power slows it gracefully.

### 3. Click-to-Inspect Asset Telemetry Modal
- Clicking on any asset node opens a dedicated, cyber-glass **Asset Telemetry Modal / Drilldown Sheet**:
  - Displays instant multi-parameter breakdown:
    - 3-Phase Voltage ($V_{L1}, V_{L2}, V_{L3}$) and Current ($I_{L1}, I_{L2}, I_{L3}$)
    - Active kW, Reactive kVAR, Apparent kVA, Power Factor ($\cos \phi$)
    - Internal temperatures, cooling loop status, alarms/trips
  - Fast-action shortcut button to switch directly to the corresponding deep EMS tab (e.g., `PCS Management`, `Battery Health`, `Metering`, `Solar Subsystem`).

### 4. Rich Fullscreen & Expanded View
- When expanded via the Fullscreen toggle:
  - Canvas scales seamlessly with high-resolution layout.
  - Nodes expand with dual-tier telemetry chips (Primary kW, Secondary Voltage/Frequency/PF, and Tertiary Status/Alarms).
  - Top control bar with operating mode selectors:
    - `Day Mode` (Solar-driven self-consumption)
    - `Night Mode` (BESS peak dispatch)
    - `Solar Excess` (Feed-in & maximum charge prioritizer)
    - `DG Backup / Islanded`
  - Bottom summary strip displaying real-time fleet generation balance:
    - Total Solar Generation | Total Facility Load | Battery Net | Grid Net | RTE %

---

## Design System & Visual Adherence
- Void Black (`#060709`) and Obsidian Dark (`#0B0D13`) in Cyber Dark mode; Solar Ice Canvas (`#F4F6FB`) and Pure White Cards (`#FFFFFF`) in Day Light mode.
- Glowing `#FF2A85` Neon Pink accents, `#00F0FF` BESS cyan, `#FFD600` Solar amber.
- All numbers and electrical units formatted with `font-mono`.
- Minimum $48 \times 48\ px$ touch targets on mobile viewports.

---

## Files to Modify / Create
1. `components/energy-flow/system-topology-visualizer.tsx`: Complete overhaul with richer isometric cards, live metric badges, interactive node inspection modal, and enhanced fullscreen mode.
2. `components/energy-flow/asset-detail-modal.tsx`: Reusable cyber-modal presenting deep telemetry and tab shortcuts when an asset is clicked.

---

## Acceptance Criteria
1. Every asset node displays: Name, Status badge, 3D graphic, live active power (kW), and sub-metric chip.
2. Animated SVG conduit particles flow dynamically based on power volume and direction (Charge vs Discharge, Import vs Export).
3. Clicking on any node opens the detailed asset telemetry modal with 3-phase and operational metrics.
4. Fullscreen mode enlarges the view, renders extended telemetry per node, and provides operating mode selectors.
5. Dual-theme compatibility (Cyber Dark & High-Contrast Light mode).
6. Zero TypeScript or ESLint errors (`npx tsc --noEmit` and `npm run lint`).

---

## Checks to Run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `/sites/[id]` and view the **Overview / Dashboard** tab.
2. Observe the center **System Topology** card: verify all 6 asset nodes display live kilowatt badges, 3D illustrations, and animated flowing conduits.
3. Click on the **BESS 10kWh** node: verify the Asset Detail Modal opens showing pack voltage, SoC, cell temperature, and contactor states.
4. Click the **Fullscreen** icon in the header: verify the visualizer expands into an immersive command-center view with extended parameters and mode pills.
5. Toggle between Cyber Dark and Day Light modes using the topbar switch: verify perfect contrast in both themes.
