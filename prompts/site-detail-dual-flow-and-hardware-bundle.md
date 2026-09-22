# Site Detail: Dual Flow Views (5-Node Canvas + Schematic), Simplified Hub Labels, and Hardware Bundle Integration

## Goal
Update the Site Detail Cockpit (`/sites/[id]`) based on user feedback:
1. Shorten the Component Deep-Dive Hub pill buttons to concise labels: `Solar Hub`, `BESS Hub`, `Grid Hub`, `DG Hub`, `Load Hub`.
2. Display **both** the Schematic View (`SchematicNodeFlow`) and the 5-Node Canvas View (`EnergyFlowVisualizer`) simultaneously in the primary flow view, removing the toggle mode.
3. Integrate the SCADA hardware devices directly into the **Energy Flow & Topology** tab and rename the section to **"Hardware Bundle"**, streamlining the top tab bar to:
   - **⚡ Energy Flow & Topology** (Hubs pills + 5-Node Canvas + Schematic View + Hardware Bundle)
   - **📊 Historical Dispatch & Balance**
   - **🚨 Active Alarms & Events**

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Tab bar composition, badge alignment, card spacing)
- `.agents/skills/architect/` (Layout hierarchy and industrial telemetry ergonomics)

---

## Existing Code Inspected
- `components/site-detail/site-detail-view.tsx`:
  - Contains tab state (`flow`, `analytics`, `hardware`, `alarms`).
  - Contains `flowViewMode` (`canvas` | `schematic`) toggle button.
  - Contains long button labels for the deep-dive hubs (e.g. `Solar Hub (Predicted vs Actual) ➔`).
  - Contains hardware inventory in a separate `hardware` tab.

---

## Decisions & Implementation Requirements
1. **Simplified Hub Pill Labels**:
   - `Solar Hub ➔`
   - `BESS Hub ➔`
   - `Grid Hub ➔`
   - `DG Hub ➔`
   - `Load Hub ➔`
2. **Simultaneous Dual Flow Visualizers**:
   - Render `EnergyFlowVisualizer` (animated particle conduits & scenario simulator).
   - Render `SchematicNodeFlow` (1:1 schematic vertical flow with realtime / daily / monthly / yearly horizon selector).
   - Both visualizers remain interactive and trigger the `TelemetryDrawer` with `siteId={site.id}`.
3. **Hardware Bundle Integration**:
   - Move the hardware devices card into the `flow` tab directly below the flow visualizers.
   - Rename title to `Hardware Bundle ({devices.length} Devices)` with SCADA sync status.
   - Remove the separate `hardware` tab from the top navigation bar.

---

## Files Likely to Change
- `components/site-detail/site-detail-view.tsx`

---

## Design System & Visual Adherence
- Void Black background (`#060709`), Obsidian Dark card surface (`#0B0D13`), Neon Pink accents (`#FF2A85`).
- Preserves `font-mono` for all metrics and hardware serial numbers.
- Maintains responsive touch targets ($\ge 48\ px$) on mobile.

---

## Acceptance Criteria
1. Hub pill labels display cleanly as `Solar Hub`, `BESS Hub`, `Grid Hub`, `DG Hub`, `Load Hub`.
2. Both the 5-Node Canvas View and the Schematic View render simultaneously in the `Energy Flow & Topology` tab.
3. The hardware inventory is embedded directly within the `Energy Flow & Topology` tab under the heading **"Hardware Bundle"**.
4. The top tab bar contains 3 clean tabs: `⚡ Energy Flow & Topology`, `📊 Historical Dispatch & Balance`, and `🚨 Active Alarms & Events`.
5. Zero TypeScript errors and clean build.

---

## Checks to Run
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

---

## Exact Manual Test Steps
1. Navigate to `/sites/[site-id]`.
2. Inspect the **Component Deep-Dive Hubs** strip: verify concise labels (`Solar Hub`, `BESS Hub`, etc.).
3. Under the **⚡ Energy Flow & Topology** tab, verify that:
   - The 5-Node Canvas View renders with animated glowing particles.
   - Directly below, the Schematic View renders with its horizon selector.
   - Directly below, the **Hardware Bundle** section renders showing connected inverters, BMS, meters, and DG controllers.
4. Verify the top tab bar now cleanly presents 3 tabs: `⚡ Energy Flow & Topology`, `📊 Historical Dispatch & Balance`, and `🚨 Active Alarms & Events`.
