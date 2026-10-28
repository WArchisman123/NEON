# Implementation Prompt: Usable Waveform Charts with Axes & Load vs. Current Draw Correlation

## Goal
Upgrade the bottom waveform section in [`components/site-detail/tabs/dashboard-tab.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/tabs/dashboard-tab.tsx) from compact sparkline bars to **full-featured, interactive, industrial-grade analytical waveform canvases with calibrated Y & X axes**:
1. Increase height to a spacious, readable envelope (`h-64`, ~250px) with dedicated Cartesian grid lines.
2. **System Voltage Canvas**: Real-time DC system voltage tracking around $489.60\text{ V}$ nominal with left voltage Y-axis ($486\text{ V}$ to $492\text{ V}$), bottom time X-axis, gradient area fill, and interactive hover crosshairs.
3. **Load vs. Current Draw Dual Canvas**: Correlates **Active Load Demand ($kW$)** against **Current Draw ($A$)**, featuring dual left/right Y-axes, synchronized time ticks, negative current step profile ($-151.70\text{ A}$), active kilowatt demand curve ($112.4\text{ kW}$), and hover data inspection.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: Data visualization ergonomics, SVG coordinate mapping, dual-axis scales, responsive chart containers, and cyber design token compliance.

---

## Existing Code Inspected
- [`components/site-detail/tabs/dashboard-tab.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/tabs/dashboard-tab.tsx): Bottom section currently uses simplified mini-bars (`h-20`) with no Y-axes, no numerical grid ticks, and no load vs. current comparison.
- [`public/context/context_img/01_dashboard_overview_financial.png`](file:///C:/Users/hp/Desktop/git/NEON/neon/public/context/context_img/01_dashboard_overview_financial.png): Reference showing bottom waveforms with labeled axis ticks and negative step response.

---

## Implementation Details

### 1. Reusable Waveform Chart Components
Create dedicated, high-performance SVG chart modules with zero external dependencies (React 19 native):
- `components/site-detail/charts/system-voltage-chart.tsx`:
  - Canvas height: `h-60` to `h-64`.
  - Calibrated Y-axis ticks on the left: `492 V`, `490 V`, `488 V`, `486 V`.
  - Subtle Cartesian dashed horizontal gridlines.
  - Smooth Bezier or polyline curve in glowing Laser Cyan (`#00F0FF`) with linear gradient area fill.
  - Bottom X-axis time labels: `11:00`, `11:15`, `11:30`, `11:45`, `12:00`, `12:09`.
  - Interactive hover tooltip showing exact timestamp and voltage reading with crosshair marker.
  - Header: Live RMS indicator, Min `487.8 V`, Max `492.0 V`, Avg `489.6 V`.

- `components/site-detail/charts/load-vs-current-chart.tsx`:
  - Canvas height: `h-60` to `h-64`.
  - Dual Y-axes:
    - Left Y-axis: Negative Current Draw ($-130\text{ A}$, $-140\text{ A}$, $-150\text{ A}$, $-160\text{ A}$, $-170\text{ A}$) in Neon Pink / Purple.
    - Right Y-axis: Active Facility Demand ($80\text{ kW}$, $100\text{ kW}$, $120\text{ kW}$, $140\text{ kW}$) in Amber.
  - Bottom X-axis time labels synchronized with the voltage chart.
  - Dual waveforms:
    - Step-load inductive current draw area in Neon Pink (`#FF2A85` / `#9D4EDD`) tracking $-151.70\text{ A}$.
    - Active power demand line in Electric Amber (`#FFD600`) tracking $112.4\text{ kW}$.
  - Interactive hover tooltip showing both current ($A$) and power ($kW$) at any cursor position.
  - Header toggle / legend pills for Current Draw and Active Load.

### 2. Integration into Dashboard Tab
- Replace the compact mini-bars in `components/site-detail/tabs/dashboard-tab.tsx` with `<SystemVoltageChart />` and `<LoadVsCurrentChart />`.
- Maintain clean control-room typography (`font-mono`) and dark/light theme tokens.

---

## Design System & Visual Adherence
- **Cyber Dark**: Void Black background, glowing Laser Cyan `#00F0FF` for voltage, Neon Pink `#FF2A85` for current, Electric Amber `#FFD600` for load kW.
- **Solar Day Light**: High-contrast blue for voltage, crimson pink for current, amber for load kW, with clean grey gridlines (`rgba(15,23,42,0.08)`).
- **Monospace Numerical Readouts**: `font-mono` on all axes ticks and hover tooltips.

---

## Acceptance Criteria
1. Both bottom charts have clear, readable Y-axes and X-axes with calibrated numerical tick labels.
2. The Load vs. Current chart displays both **Active Load Demand ($kW$)** and **Current Draw ($A$)** with comparative dual scaling.
3. Hovering over either chart reveals a synchronized tooltip with timestamp and exact values.
4. Chart heights are expanded to ~240–260px (`h-60`/`h-64`), providing full control-room usability.
5. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with **0 errors**.

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
2. Scroll to the bottom waveforms section.
3. Inspect **System Voltage**: verify left Y-axis ticks (`486 V` to `492 V`) and bottom time labels (`11:00` to `12:09`). Hover across the line to verify the crosshair tooltip.
4. Inspect **Load vs. Current Draw**: verify the dual axes (Left: Current Draw in Amperes, Right: Active Load in Kilowatts), and observe both the pink current step curve and amber load power curve.
5. Toggle between dark and light themes to confirm contrast and grid readability.
