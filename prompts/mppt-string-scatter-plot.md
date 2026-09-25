# Implementation Prompt: 24-Channel MPPT String Scatter Plot & Outlier Analyzer

## Goal
Replace the grid-based heatmap below the `'24-Channel MPPT String Current & Voltage Matrix'` section on the Solar PV screen (`/sites/[id]/solar`) with an interactive, control-room-grade **24-Channel MPPT String Scatter Plot & Outlier Analyzer**. The scatter plot will plot all 24 string operating vectors on an electrical Cartesian coordinate plane (Voltage vs Current), rendering a nominal operational cluster envelope that immediately isolates outliers (e.g. String #07 for localized soiling and String #19 for blown fuse / under-voltage).

---

## Relevant Agent Skills
- `shadcn` (`.agents/skills/shadcn/SKILL.md`): Layout primitives, toggle groups, badges, buttons, Cyber Black styling tokens.
- `architect` (`.agents/skills/architect/SKILL.md`): Mathematical Cartesian coordinate transformations, cluster bounding boxes, statistical dispersion analysis.

---

## Existing Code Inspected
1. `app/sites/[id]/solar/page.tsx`:
   - Contains the 24-channel string telemetry dataset (`mpptChannels`), where String #07 has reduced current (7.6 A, soiling) and String #19 has reduced voltage & current (606 V, 8.5 A, fuse check).
   - Currently renders `MpptStringHeatmap` right below the 24-channel matrix.
2. `components/analytics/solar-performance-chart.tsx`:
   - Inspected responsive SVG coordinate projection, linear gradients, gridlines, and crosshair interaction patterns.
3. `components/solar/mppt-string-heatmap.tsx`:
   - Contains the statistical engine (`meanCurrent`, `meanVoltage`, `meanPower`, `stdDevCurrent`, `uniformityIndex`) and diagnostic inspection card logic.

---

## Decisions or Assumptions
1. **Interactive Scatter Plot Cartesian Plane**:
   - Build a responsive SVG coordinate canvas with dynamic scaling:
     - **Default Mode: I-V Operating Plane (Voltage vs Current)**:
       - **X-axis**: DC Voltage ($V_{\text{string}}$) spanning $\sim 580\text{V}$ to $\sim 670\text{V}$ with tick marks every $20\text{V}$.
       - **Y-axis**: DC Current ($I_{\text{string}}$) spanning $\sim 6.0\text{A}$ to $\sim 13.0\text{A}$ with tick marks every $1.0\text{A}$.
       - Normal healthy strings cluster tightly in the top-right quadrant near $(645\text{V}, 11.2\text{A})$.
       - **String #07 (Soiling)** clearly falls down vertically to $7.6\text{A}$ while maintaining $645\text{V}$.
       - **String #19 (Fuse Fault)** clearly falls down and to the left to $(606\text{V}, 8.5\text{A})$.
     - **Alternative Mode: Channel Index vs Current (#01–#24)**:
       - Plots Channel #01 to #24 along the X-axis with the fleet median horizontal reference line and $\pm 15\%$ tolerance envelope.
2. **Nominal Operational Cluster Envelope**:
   - Render a semi-transparent glowing dashed boundary on the canvas representing the $\pm 10\%$ nominal cluster envelope around the fleet centroid $(\bar{V}, \bar{I})$.
   - Points falling outside this envelope are classified as **Anomalous Outliers** and rendered with glowing pulsing rings and warning badges.
3. **Interactive Crosshair & Hover Tooltip**:
   - Hovering or tapping any string node projects glowing dashed crosshairs to both the Voltage (X) and Current (Y) axes.
   - An SVG/HTML tooltip displays Channel number, Operating Voltage, Current, Power, and percentage delta $\Delta$ vs fleet median.
4. **Diagnostic Inspection Card Integration**:
   - Clicking/tapping any node pins it in the detailed diagnostic card below the chart, providing:
     - Exact Electrical Vector: Current ($A$), Voltage ($V$), Yield ($kW$), PR ($\%$).
     - Delta vs Fleet Centroid: e.g. `-3.58 A (-32.0%)`.
     - Actionable root-cause diagnosis (Module washing / IR thermography for #07, Combiner fuse inspection for #19) with a direct **Dispatch Service** CTA button to `/maintenance`.
5. **Mobile Ergonomics**:
   - Minimum $48 \times 48\text{ px}$ touch collision targets on each scatter point.
   - Horizontal scrolling container (`min-w-[650px]`) prevents axis compression on mobile viewports ($390 \times 844$).

---

## Files Likely to Change
1. `components/solar/mppt-string-scatter-plot.tsx`:
   - New client component implementing the SVG Cartesian scatter plot, axis toggles, cluster envelope, crosshair guides, and diagnostic card.
2. `app/sites/[id]/solar/page.tsx`:
   - Import `MpptStringScatterPlot`.
   - Replace `<MpptStringHeatmap channels={mpptChannels} />` with `<MpptStringScatterPlot channels={mpptChannels} />`.

---

## Implementation Requirements
1. **Cartesian Projection**:
   - Map $(V_i, I_i)$ into canvas coordinates $(x, y)$ using proportional scale formulas:
     - $x = \text{paddingLeft} + \frac{V - V_{\min}}{V_{\max} - V_{\min}} \times \text{chartWidth}$
     - $y = \text{paddingTop} + \text{chartHeight} - \frac{I - I_{\min}}{I_{\max} - I_{\min}} \times \text{chartHeight}$
2. **Visual Design & Aesthetics**:
   - Canvas Surface: Obsidian Dark `#0B0D13` with subtle frosted gridlines (`rgba(255,255,255,0.05)`).
   - Centroid Marker: Cyan crosshair $(\bar{V}, \bar{I})$ with label.
   - Nominal String Nodes: Electric Solar Amber (`#FFD600`) with subtle glow.
   - Soiling Outlier Node (#07): Vivid Amber (`#FFAB00`) with pulsing ring and label.
   - Fuse Fault Outlier Node (#19): Neon Red (`#FF1744`) with pulsing ring, glow shadow, and label.
   - Selected Node: Neon Pink (`#FF2A85`) ring with interactive crosshair projection to both axes.
3. **Statistical Header Strip**:
   - Centroid $(V, I)$, Standard Deviation ($\sigma_I$), Total Monitored Yield ($kW$), Uniformity Index ($\%$), Flagged Outliers count.
4. **Interactive Controls**:
   - Mode switcher: `Voltage vs Current (I-V)` vs `Channel # vs Current`.
   - Node selection click/tap handler.

---

## Design System & Visual Adherence
- Void Black `#060709`, Obsidian `#0B0D13`, Elevated Glass `#121622`.
- Solar Amber `#FFD600`, Neon Pink `#FF2A85`, Laser Cyan `#00F0FF`, Cyber Emerald `#00E676`, Neon Red `#FF1744`, Vivid Amber `#FFAB00`.
- Strict `font-mono` typography for all electrical numbers, units, channels, and axes.
- Minimum $48 \times 48\text{ px}$ mobile tap target padding.

---

## Security & RBAC Requirements
- Pure presentation and telemetry analytics component.
- Scoped under Clerk authenticated organization context.

---

## Acceptance Criteria
- [ ] Scatter plot is rendered directly below the `'24-Channel MPPT String Current & Voltage Matrix'` section in `/sites/[id]/solar`.
- [ ] All 24 MPPT strings are plotted as interactive scatter nodes on the Cartesian plane.
- [ ] Healthy strings cluster tightly in the nominal operating envelope.
- [ ] Outliers (String #07 and String #19) are visibly separated outside the cluster envelope with high-contrast alert styling.
- [ ] Hovering or tapping any node projects crosshairs to the axes and displays an informative tooltip.
- [ ] Clicking a node selects it and updates the diagnostic inspection card below the plot.
- [ ] Mode toggle switches between Voltage vs Current (I-V) and Channel vs Current.
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] `npm run lint` passes with 0 errors and 0 warnings.
- [ ] `npm run build` compiles successfully.

---

## Checks to Run
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Desktop ($1440 \times 900$)**:
   - Open `/sites/<id>/solar`.
   - Scroll down to the `'24-Channel MPPT String Current & Voltage Matrix'` section.
   - Verify the **24-Channel MPPT Array Scatter Plot & Outlier Analyzer** renders directly below it.
   - Verify the healthy cluster in the top-right quadrant (~645 V, ~11.2 A).
   - Spot the 2 distinct outliers:
     - String #07: Drops down to 7.6 A at 645 V (Amber soiling alert).
     - String #19: Drops to 606 V and 8.5 A (Neon Red fuse alert).
   - Hover and click on String #07 and String #19: Verify crosshair projections and diagnostic cards.
   - Toggle to `Channel # vs Current` mode and verify distribution.
2. **Mobile ($390 \times 844$)**:
   - Open mobile DevTools view.
   - Verify smooth horizontal scroll of the scatter canvas without breaking outer page layout.
   - Tap individual nodes; verify touch selection works smoothly.
