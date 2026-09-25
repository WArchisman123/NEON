# Implementation Prompt: 24-Channel MPPT String Heatmap Matrix & Outlier Detection Engine

## Goal
Transform the 24-Channel MPPT String Current & Voltage telemetry on the Solar PV screen (`/sites/[id]/solar`) into a high-visibility, control-room-grade **heatmap matrix** rendered directly below the existing `'24-Channel MPPT String Current & Voltage Matrix'` section. The heatmap will allow asset managers and field engineers to immediately identify thermal/current outliers, string mismatch, soiling accumulation, and blown fuses across the photovoltaic array.

---

## Relevant Agent Skills
- `shadcn` (`.agents/skills/shadcn/SKILL.md`): Component composition, accessibility, Cyber Black styling, badges, and layout primitives.
- `architect` (`.agents/skills/architect/SKILL.md`): Component hierarchy and mathematical deviation modeling.

---

## Existing Code Inspected
1. `app/sites/[id]/solar/page.tsx`:
   - Contains the 24-channel synthetic string telemetry generation (`nominalStringCurrent = 11.2 A`, `nominalStringVoltage = 645 V`, deliberate outlier injection at String #07 [Soiling, 68% current] and String #19 [Fuse check, 76% current]).
   - Renders the `'24-Channel MPPT String Current & Voltage Matrix'` card grid (lines 208–301).
   - Target placement: Directly below line 301, immediately preceding the String Inverter Telemetry Matrix.
2. `app/sites/[id]/bess/page.tsx`:
   - Inspected the 16-cell BESS thermal heatmap implementation to ensure visual consistency in border radius, typography, status badges, and color tokens.
3. `components/energy-flow/telemetry-drawer.tsx` & `components/design-system/telemetry-widgets.tsx`:
   - Inspected existing telemetry widgets and visual tokens for industrial grade consistency.

---

## Decisions or Assumptions
1. **Component Modularization**: Create a reusable, self-contained client component `components/solar/mppt-string-heatmap.tsx` to handle reactive metric switching, statistical outlier analysis, interactive cell selection, and responsive layout.
2. **Metric Switching**:
   - Provide interactive tab pills for the operator to visualize the heatmap by:
     - **Current ($A$)**: Primary metric for soiling, shading, and string current mismatch.
     - **Variance from Mean ($\Delta\%$)**: Normalized deviation showing exact percentage gain or loss against peer average (e.g., `-32.0%`, `+2.4%`).
     - **Voltage ($V$)**: Identifies open circuits, blown bypass diodes, or temperature gradients.
     - **Power ($kW$)**: Identifies net yield loss per string.
3. **Statistical Analysis Engine**:
   - Computes fleet-wide statistical benchmarks:
     - Median and Mean current ($\mu$).
     - Standard deviation ($\sigma$).
     - Uniformity index ($\%$).
     - Outlier threshold: Strings running $\Delta < -15\%$ flagged as degraded, $\Delta < -25\%$ flagged as critical alarm.
4. **Color Scale & Visual Gradients**:
   - High-contrast Cyber Black color mapping:
     - **Critical Deficit ($\le -25\%$)**: Deep Neon Red (`#FF1744` / `bg-[#FF1744]/20 border-[#FF1744]/60`) with pulse dot.
     - **Soiling / Mismatch Warning ($-25\%$ to $-12\%$)**: Vivid Amber / Orange (`#FFAB00` / `bg-[#FFAB00]/15 border-[#FFAB00]/50`).
     - **Nominal / Peer Average ($-12\%$ to $+4\%$)**: Electric Solar Amber / Emerald (`#FFD600` / `#00E676` subtle frost glass).
     - **High Output / Overperforming ($> +4\%$)**: Laser Cyan / Gold (`#00F0FF` / `#FFF066`).
5. **Interactive Cell Inspector Drawer / Card**:
   - Clicking or tapping any cell opens an instant detail card below the heatmap displaying:
     - String identifier and array zone.
     - Exact Electrical Vector: Current ($A$), Voltage ($V$), Power ($kW$).
     - Exact Delta vs Fleet Median: e.g. `-3.58 A (-32.0%)`.
     - Root-Cause Recommendation (e.g. *"Heavy Soiling / Shading detected: Dispatch robotic panel wash or field inspection"* or *"Under-voltage / Open circuit: Check inline combiner fuse F19"*).
6. **Mobile Ergonomics**:
   - Responsive CSS grid ($6 \times 4$ on desktop/tablet, $3 \times 8$ or $2 \times 12$ on mobile).
   - Cells guarantee $\ge 48 \times 48\text{ px}$ tap targets for mobile field technicians with glove-friendly clearance.

---

## Files Likely to Change
1. `components/solar/mppt-string-heatmap.tsx`:
   - New client component implementing the 24-channel MPPT string heatmap, metric toggles, statistical strip, color gradient legend, and diagnostic inspector.
2. `app/sites/[id]/solar/page.tsx`:
   - Import `MpptStringHeatmap`.
   - Render `<MpptStringHeatmap channels={mpptChannels} />` immediately below the `'24-Channel MPPT String Current & Voltage Matrix'` section.

---

## Implementation Requirements
1. **Interactive Metric Selection**:
   - Four mode buttons: `Current (A)`, `Variance (Δ%)`, `Voltage (V)`, `Power (kW)`.
2. **Dynamic KPI Strip**:
   - Fleet Mean Current ($A$)
   - Fleet Voltage ($V$)
   - Total Monitored Output ($kW$)
   - String Uniformity Index ($\%$)
   - Flagged Outlier count (with direct alert chip)
3. **Heatmap Grid**:
   - 24 cells representing String #01 through String #24.
   - Distinctive border and background shading proportional to the selected metric.
   - Outliers clearly stand out in Neon Red and Vivid Amber.
4. **Color Gradient Legend**:
   - Visual scale bar with clearly defined stops:
     - `<-25% Critical Outlier (Red)`
     - `-25% to -12% Soiling Warning (Amber)`
     - `-12% to +4% Nominal Peak (Solar Amber)`
     - `>+4% High Yield (Laser Cyan)`
5. **Diagnostic Inspection Card**:
   - Active string inspector showing deep electrical breakdown and actionable field recommendations.

---

## Design System & Visual Adherence
- **Canvas & Surfaces**: Void Black `#060709` background, Obsidian `#0B0D13` container surface, Elevated Cyber Glass `#121622` for cells.
- **Accents**: Solar Amber `#FFD600`, Neon Pink `#FF2A85`, Laser Cyan `#00F0FF`, Cyber Emerald `#00E676`, Neon Red `#FF1744`.
- **Typography**: Strict `font-mono` for all numerical telemetry values, units, channels, and percentages.
- **Touch Targets**: Minimum $48 \times 48\text{ px}$ interactive touch targets on mobile viewports.

---

## Security & RBAC Requirements
- Purely presentation and telemetry visualization component.
- All site routing and server-side page data remain guarded by existing Clerk organization auth.
- No direct database bypass or client-side mutations.

---

## Acceptance Criteria
- [ ] 24-Channel MPPT String Heatmap renders immediately below the `'24-Channel MPPT String Current & Voltage Matrix'` section in `/sites/[id]/solar`.
- [ ] Outlier strings (String #07 and String #19) are immediately distinguishable from peer strings via chromatic scale and alert styling.
- [ ] Metric switcher allows toggling between Current ($A$), Deviation ($\Delta\%$), Voltage ($V$), and Power ($kW$).
- [ ] Color gradient legend clearly explains the chromatic threshold bands.
- [ ] Tapping or clicking any cell highlights it and displays the detailed electrical telemetry and diagnostic recommendation.
- [ ] Responsive reflow functions cleanly without horizontal overflow on mobile viewports ($390 \times 844$).
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
   - Navigate to `/sites/<id>/solar`.
   - Scroll down to the `'24-Channel MPPT String Current & Voltage Matrix'` section.
   - Verify the new `'24-Channel MPPT Array Thermal & Outlier Heatmap'` section is rendered directly below it.
   - Verify String #07 is highlighted in Amber (Soiling Warning, $-32.0\%$) and String #19 is highlighted in Red (Fuse Check, $-24.1\%$).
   - Toggle metrics: Switch to `Variance (Δ%)`, `Voltage (V)`, and `Power (kW)` and observe dynamic color shifts and values.
   - Click String #07: Verify the inspection panel displays detailed diagnostics and recommendations.
2. **Mobile ($390 \times 844$)**:
   - Toggle DevTools device simulation to iPhone 14/15 Pro.
   - Navigate to `/sites/<id>/solar` and scroll down to the heatmap.
   - Verify the grid reflows into a readable layout with minimum $48 \times 48\text{ px}$ tap targets.
   - Tap individual cells and verify smooth inspection card updates without layout jumping.
