# Implementation Prompt: Pixel-Perfect Page 1 Dashboard Alignment & Compact System Topology

## Goal
Redesign the **Page 1 Dashboard Tab** ([`components/site-detail/tabs/dashboard-tab.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/tabs/dashboard-tab.tsx)) and the **System Topology Visualizer** ([`components/energy-flow/system-topology-visualizer.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/energy-flow/system-topology-visualizer.tsx)) to match the exact visual alignment, proportions, and compact vertical fit seen in [`public/context/context_img/01_dashboard_overview_financial.png`](file:///C:/Users/hp/Desktop/git/NEON/neon/public/context/context_img/01_dashboard_overview_financial.png).
Ensure that the entire upper dashboard section (Financial Strip, 3-Column Core with System Stats, Topology, and Power Stats, and the 8-card Subsystem Status Strip) is perfectly aligned, compact, and fits on a standard desktop viewport without forcing unnecessary vertical scroll.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: High-density dashboard grid composition, compact typography, synchronized card heights, SVG isometric node rendering.

---

## Visual Deconstruction from `01_dashboard_overview_financial.png`

### 1. Top Financial & TOU Arbitrage Strip (8 Compact Cards)
- Exact 8-column grid (`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5`):
  1. `Energy Cost To...`: `11.33 ₹` (Green Rupee icon)
  2. `Savings Today`: `120 ₹` (Wallet / cash icon)
  3. `Monthly Savings`: `3850 ₹` (Money sack icon)
  4. `Demand Char...`: `980 ₹` (Red downward trending chart / fee icon)
  5. `Arbitrary Reve...`: `420 ₹` (Ascending bar chart icon)
  6. `Projected ROI`: `18.40 %` (Target / bullseye icon)
  7. `Operating Ben...`: `5200 ₹` (Calendar / clock benefit icon)
  8. `Tariff (AVG.)`: `0.18 ₹/kWh` (Price tag icon)
- Compact height (`h-[58px] p-2`), icon on left, label (truncate) and bold value on right.

### 2. Main 3-Column Row (Synchronized Equal Height: ~340px)
- Proportions: 1 col (Left: System Stats) + 2 cols (Center: System Topology) + 1 col (Right: Power Stats).
- **Left Card: System Stats**
  - Header: `System Stats` with pulse icon, right-aligned `Updated: 14 Jul, 2026, 12:09:08`.
  - Row 1: `State of Charge (SoC)` on left, `21.60 %` in emerald green bold on right, with slim green progress bar below.
  - Rows 2–9: Clean, evenly spaced 2-column key-value rows:
    - `Cycle Count`: `10666 cycles` (green)
    - `Maximum Voltage`: `3.08 v` (green)
    - `Average Voltage`: `3.06 v` (green)
    - `Maximum Temperature`: `38.80 °C` (green)
    - `Average Temperature`: `35 °C` (green)
    - `Charge Overtemp`: `0` (green)
    - `Cell Overvoltage`: `0` (green)
    - `Pack Overvoltage`: `0` (green)
- **Center Card: Compact System Topology (Matches Left & Right Height Exactly)**
  - Header: `System Topology` with topology node icon, right-aligned `(i)` info button and `[ ]` expand modal button.
  - 6 Isometric Nodes arranged in a clean $3 \times 2$ grid:
    - Top: **Solar PV** (`• Online`) $\to$ **PCS / Inverter** (`• Online`) $\to$ **Grid** (`• Online`)
    - Bottom: **DG Set** (`• Online`) $\to$ **10kWh BESS** (`• Online`) $\to$ **Building Load** (`• Online`)
  - Crisp animated dotted conduit lines connecting:
    - Solar $\to$ PCS $\to$ Grid (horizontal)
    - PCS $\downarrow$ BESS (vertical)
    - DG Set $\to$ BESS $\to$ Building Load (horizontal)
    - Grid $\downarrow$ Building Load (vertical)
  - Uses compact, realistic 3D/Isometric SVG illustrations (solar panels, inverter cabinet, high-voltage pylon, generator set, battery enclosure, commercial building) rather than bloated text-heavy boxes that overflow vertically.
- **Right Card: Power Stats**
  - Header: `Power Stats` with shield icon, right-aligned `Updated: 14 Jul, 2026, 12:09:08`.
  - Row 1: `State of Health (SoH)` on left, `98.30 %` in emerald green bold on right, with slim green progress bar below.
  - Rows 2–9: Clean, evenly spaced key-value rows:
    - `Charged / Discharg...`: `107230.40 / 94567 Ah` (bold)
    - `High Side Contactor`: `ON` (green)
    - `Low Side Contactor`: `ON` (green)
    - `Pre-Charge Contactor`: `OFF` (dark/slate)
    - `DC/DC Contactor`: `ON` (green)
    - `Discharge Overtemp`: `0` (green)
    - `Short Circuit`: `0` (green)
    - `Voltage Difference`: `0 mV` (green)

### 3. Subsystem Status Strip (8 Compact Cards Directly Below)
- Replaces the generic single bar with the exact 8-card grid matching `01_dashboard_overview_financial.png`:
  1. `Grid Status`: **Connected** (Pylon transmission icon)
  2. `Grid Power In`: **76.87 kW** (Solar panel array icon)
  3. `System Status`: **Charging** (Inverter / cabinet icon)
  4. `Sys. Efficiency`: **96.80 %** (Gauge / speedometer icon)
  5. `System Health`: **Normal** (Medical shield / heart icon)
  6. `Rem. Energy`: **54 kWh** (Battery bolt icon)
  7. `Critical Alerts`: **0** (Alarm bell icon)
  8. `Ambient Temp.`: **24.90 °C** (Thermometer temperature icon)
- Compact height (`h-[56px] p-2`), consistent with the top financial strip.

### 4. Bottom Waveform Charts (System Voltage & Load Current Draw)
- Compact height (~110px) with inline values (`489.60 V` in cyan, `-151.70 A` in pink/purple).

---

## Files Likely to Change
- `components/site-detail/tabs/dashboard-tab.tsx`: Implement the exact 8-card top strip, synchronized 3-column mid section, and 8-card subsystem status strip.
- `components/energy-flow/system-topology-visualizer.tsx`: Refactor into a compact, fixed-height ($~340\text{px}$) isometric SVG canvas matching the center card of `01_dashboard_overview_financial.png`.

---

## Acceptance Criteria
1. The 3-column section (System Stats, System Topology, Power Stats) has synchronized equal height (~340px) on desktop.
2. The System Topology card no longer takes excessive vertical space; it fits comfortably in the center column.
3. The Subsystem Status row has exactly 8 cards matching `01_dashboard_overview_financial.png`.
4. All metrics, progress bars, and contactor states align with the competitor reference screenshot.
5. In standard desktop viewports ($1440 \times 900$ / $1920 \times 1080$), everything from the top financial strip down through the subsystem status strip fits cleanly in view.
6. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with **0 errors**.

---

## Checks to Run
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Exact Manual Test Steps
1. Navigate to `http://localhost:3000/`.
2. Inspect the **Dashboard** view:
   - Verify the top row of 8 financial cards.
   - Verify the 3 middle columns: **System Stats**, **System Topology**, and **Power Stats** are perfectly aligned with identical height.
   - Verify the 6-node isometric topology fits cleanly without stretching the page.
   - Verify the 8 subsystem status cards directly beneath.
   - Verify the 2 waveform charts at the bottom.
3. Test in both Cyber Dark and Solar Day Light modes.
