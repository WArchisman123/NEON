# Implementation Prompt: Feature Spec 2 - Site Detail & Interactive Real-Time Energy Flow Visualizer

## 1. Goal
Implement **Feature Spec 2: Site Detail & Interactive Real-Time Energy Flow Visualizer** on the site detail screen (`/sites/[id]`).
Inspired directly by the provided engineering reference screenshot (`public/context/context_img/flow visualizer example.png`), this feature delivers:
1. An interactive **Component Node Topology Canvas** with a subtle technical grid background and central AC/DC microgrid busbar.
2. **Directional Energy Flow Physics Conduits**: Glowing animated SVG particle conduits indicating the exact real-time direction of power transfer (e.g. Solar + BESS $\to$ Load; Solar $\to$ BESS charging; Bus $\to$ Grid feed-in; Grid $\to$ Load import; DG $\to$ Load peaker).
3. **Dynamic Volumetric Badges**: Transfer kilowatt volume labels on each conduit with animated flow indicators whose particle velocity dynamically scales with kilowatt volume.
4. **Slide-Over Detailed Telemetry Drawers**: Clicking any of the 5 component nodes (Solar PV, BESS Storage, Utility Grid, Diesel Generator, Facility Load) opens an industrial inspection drawer (e.g., 16-cell BESS thermal heatmap, MPPT string table, generator oil/coolant telemetry, 3-phase grid power factor, load phase balance).
5. **Operational Mode Engine & Scenario Testing**: System operational mode detection (Grid-Tied Self-Consumption, Peak Shaving, Clean Islanded, etc.) plus interactive scenario switching for testing different flow directions.

---

## 2. Relevant Agent Skills
- `.agents/skills/shadcn/`: Sheet drawers, dialogs, tabs, high-contrast badges, buttons, and mobile bottom sheets.
- `.agents/skills/clerk-nextjs-patterns/`: Organization scoping, session token verification, and route protection for site telemetry.

---

## 3. Existing Code Inspected
- `public/context/context_img/flow visualizer example.png`: The reference image showing component node layout, connection lines, top "LAST RECEIVED" status bar, and detailed right-side telemetry panel.
- `public/context/doc.md` & `public/context/ui_doc.md`: Specifications for Section 6 (Interactive 5-Node Energy Flow Visualizer) and Section 7 (Component Telemetry Drawers).
- `public/context/api_doc.md`: JSON schema for `GET /api/v1/sites/:id/flow` and deep telemetry properties.
- `app/sites/[id]/page.tsx`: The current site details route rendering a static `<EnergyFlowPreview />`.
- `components/design-system/energy-flow-preview.tsx`: The legacy preview component with mock static SVG lines.
- `app/globals.css`: `@keyframes flowForward`, `@keyframes pulseGlow`, and cyber glow utilities.

---

## 4. Decisions or Assumptions
1. **Flow Calculation & Direction Physics Engine (`lib/energy/flow-engine.ts`)**:
   - Power flow directions are determined by physical electrical laws:
     - **Solar**: Always unidirectional source ($\text{Solar} \to \text{Busbar}$).
     - **BESS**: Bidirectional:
       - If `live_bess_power_kw > 0`: **Discharging** ($\text{BESS} \to \text{Busbar}$).
       - If `live_bess_power_kw < 0`: **Charging** ($\text{Busbar} \to \text{BESS}$).
       - If `live_bess_power_kw == 0`: **Idle / Standby**.
     - **Diesel Generator**: Unidirectional peaker ($\text{DG} \to \text{Busbar}$) when `dg_running` is true and `dg_power_kw > 0`.
     - **Utility Grid**: Bidirectional:
       - If `grid_power_kw > 0`: **Import** ($\text{Grid} \to \text{Busbar}$).
       - If `grid_power_kw < 0`: **Export / Feed-in** ($\text{Busbar} \to \text{Grid}$).
       - If islanded / off-grid: **Disconnected / Islanded** ($0\ kW$).
     - **Facility Load**: Always sink ($\text{Busbar} \to \text{Facility Load}$).
2. **Reverse Flow Animation (`@keyframes flowBackward`)**:
   - Add `@keyframes flowBackward` to `globals.css` so reverse electrical conduit animations (e.g. Busbar $\to$ BESS charging, or Busbar $\to$ Grid export) run smoothly without reversing DOM node order.
3. **Adaptive Canvas Topology**:
   - Sites missing DG (e.g. Site 1, Site 5) or BESS (Site 3, Site 4) or Grid (Off-Grid Site 4, Site 5) cleanly adapt: conduits to uninstalled or disconnected assets are dimmed or marked `ISLANDED / STANDBY`, keeping the central energy flow visually balanced.
4. **Deep Component Telemetry Drawer**:
   - Clicking any node opens a slide-over drawer (or mobile bottom sheet) displaying detailed sub-second instrumentation:
     - **Solar**: 12-string MPPT currents, inverter conversion efficiency, irradiance ($W/m^2$), module temp ($^\circ C$), Performance Ratio (PR %).
     - **BESS**: SoC %, SoH %, DC pack voltage ($984\ V$), current, 16-cell thermal heatmap matrix ($4 \times 4$ interactive cells), $\Delta V$ cell delta ($18\ mV$), coolant temperature ($19.4^\circ C$), contactor states.
     - **DG**: Standby/running state, RPM, oil pressure, coolant temp, fuel %, burn rate ($L/hr$), run hours.
     - **Grid**: Import/export kW, 3-phase voltages ($V_{ab}, V_{bc}, V_{ca}$), frequency ($Hz$), power factor ($\cos \phi$), THD-V/THD-I %, TOU tariff slot.
     - **Load**: Active kW, apparent kVA, reactive kVAR, phase balance ($L1/L2/L3$), peak demand vs contracted MD.

---

## 5. Files Likely to Change
1. `app/globals.css`: Add `@keyframes flowBackward` and conduit particle utilities.
2. `lib/energy/flow-engine.ts`: New domain engine calculating nodal balance, directional velocities, and operational mode detection.
3. `components/energy-flow/energy-flow-visualizer.tsx`: The primary interactive 5-node canvas component with animated SVG particle physics conduits, volumetric pills, and node cards.
4. `components/energy-flow/telemetry-drawer.tsx`: Slide-over inspection drawer rendering detailed telemetry for the active node (BESS 16-cell thermal matrix, Solar MPPT table, DG gauges, Grid power quality, Load phase balance).
5. `app/sites/[id]/page.tsx`: Pass live site record and telemetry to the updated visualizer.

---

## 6. Implementation Requirements

### Step 1: CSS Animation & Keyframe Expansion
- Add `flowBackward` keyframes in `app/globals.css` alongside `flowForward`.
- Ensure stroke-dashoffset animations support variable speeds via inline styles (`animationDuration`).

### Step 2: Flow Calculation Engine (`lib/energy/flow-engine.ts`)
- Implement `calculateEnergyFlows(site: SiteRecord): EnergyFlowState`:
  - Returns active transfer kilowatts for each leg: `solarToBus`, `bessToBus` / `busToBess`, `gridToBus` / `busToGrid`, `dgToBus`, `busToLoad`.
  - Determines `operationalMode`:
    - Grid-Tied Self-Consumption
    - Peak Shaving & BESS Support
    - Clean Solar + BESS Islanded
    - Diesel Generator Peaker Microgrid
    - Grid Feed-in Surplus
  - Computes animation speed in seconds: $v = \max(0.6, \min(3.5, 3000 / (\text{kw} + 1)))$.

### Step 3: Energy Flow Canvas Component (`components/energy-flow/energy-flow-visualizer.tsx`)
- Render schematic technical grid canvas (`#060709` background with subtle SVG grid pattern).
- Canvas Top Header:
  - System Operational Mode pill with animated pulsing dot.
  - "LAST RECEIVED: <Date & Time>" with sync refresh button.
  - Flow Scenario Switcher (Live Telemetry, Daytime Surplus $\to$ BESS Charge, Peak Shaving Discharge $\to$ Load, Night Grid Import, Islanded Outage) for interactive testing.
- Center AC/DC Microgrid Busbar Hub with glowing bidirectional indicator.
- 5 Surrounding Component Nodes:
  - Top: Solar PV Array (Amber `#FFD600`)
  - Left: BESS Storage Container (Cyan `#00F0FF`)
  - Right: Facility Consumption Load (Pink `#FF2A85`)
  - Bottom-Left: Diesel Generator Peaker (Orange `#FF6B00`)
  - Bottom-Right: Utility Grid Intertie (Purple `#9D4EDD`)
- Animated Directional SVG Conduits:
  - Inactive base conduits with subtle white/gray stroke (`rgba(255,255,255,0.06)`).
  - Glowing colored conduits with moving particle strokes (`strokeDasharray="6 8"`).
  - Volumetric transfer pills positioned on the lines showing directional arrows and kW transfer.

### Step 4: Component Telemetry Drawer (`components/energy-flow/telemetry-drawer.tsx`)
- Slide-over panel (right side on desktop, bottom sheet on mobile):
  - **Solar Subsystem**: Inverter conversion efficiency ($\eta$), 12-channel MPPT string current table with soiling warnings, irradiance ($W/m^2$), module temp ($^\circ C$), PR %.
  - **BESS Subsystem**: State of Charge & State of Health gauges, DC voltage/current, **16-cell interactive thermal heatmap grid ($4 \times 4$)**, cell voltage delta ($\Delta V$), liquid coolant loop temp ($^\circ C$), DC contactor state.
  - **DG Subsystem**: Standby/Running state, RPM, oil pressure ($bar$), coolant temp, fuel level %, fuel burn rate ($L/hr$), run hours.
  - **Grid Subsystem**: Active kW, 3-phase voltages ($V_{ab}, V_{bc}, V_{ca}$), frequency ($Hz$), power factor ($\cos \phi$), THD %, TOU price slot.
  - **Load Subsystem**: Active kW, apparent kVA, reactive kVAR, phase balance ($L1/L2/L3$), peak demand vs contracted MD.

---

## 7. Design System & Visual Adherence
- Page Background: Void Black `#060709`.
- Node Cards: Obsidian Dark `#0B0D13` with Elevated `#121622` tiles.
- Semantic Lighting:
  - Solar: Electric Amber `#FFD600`
  - BESS: Laser Cyan `#00F0FF`
  - Grid: Electric Purple `#9D4EDD`
  - DG: Hi-Viz Orange `#FF6B00`
  - Load / Brand: Neon Pink `#FF2A85`
- Monospace Typography: All electrical units ($kW$, $MW$, $V$, $A$, $Hz$, $\%$, $kWh$, $^\circ C$) use `font-mono`.
- Mobile Ergonomics: Touch targets satisfy $\ge 48 \times 48\ px$.

---

## 8. Security & RBAC Requirements
- Site telemetry scoped strictly to active Clerk organization (`org_id`).
- Subscription verification: Expired sites display paused telemetry banner.

---

## 9. Acceptance Criteria
1. Flow visualizer displays the real-time direction of power flow between nodes (e.g. Solar+BESS to Load).
2. Animated particles physically flow in the exact transfer direction (forward/backward) with speed proportional to kilowatt volume.
3. Clicking any node opens the detailed telemetry drawer (16-cell thermal heatmap, MPPT strings, DG metrics, Grid quality).
4. Top status bar displays System Operational Mode and "LAST RECEIVED" timestamp with refresh trigger.
5. Interactive scenario switcher allows switching and testing different flow patterns.
6. All quality gates (`npm run lint`, `npx tsc --noEmit`, `npm run build`) pass with 0 errors.

---

## 10. Checks to Run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

---

## 11. Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `/sites/<id>` (e.g. click "View Energy Flow" from any site card on the homepage).
2. Observe the Energy Flow Canvas:
   - Check the glowing conduits connecting Solar, BESS, DG, Grid, and Load to the central AC/DC busbar.
   - Verify particle dash animation moves in the exact direction of power transfer (e.g. from Solar and BESS inward to the busbar, and outward to Facility Load).
3. Test Flow Scenarios:
   - Click "Daytime Solar Surplus" $\to$ Observe flow traveling into BESS (charging) and Grid (feed-in).
   - Click "Peak Shaving" $\to$ Observe BESS discharging alongside Solar into Load.
   - Click "Off-Grid Islanded" $\to$ Observe Grid conduit dimming and DG/BESS supporting Load.
4. Click on the **BESS Node**:
   - Verify the Detailed Telemetry Drawer slides open from the right.
   - Inspect the 16-cell thermal heatmap matrix, cell delta-V ($18\ mV$), and liquid coolant loop temperature.
5. Click on the **Solar Node**:
   - Inspect the 12-channel MPPT string current table and inverter efficiency.
6. Check Mobile Viewport ($390 \times 844$):
   - Verify node cards and vertical flow reflow smoothly with swipeable bottom sheets.
