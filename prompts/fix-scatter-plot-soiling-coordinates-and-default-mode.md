# Implementation Prompt: Fix Scatter Plot Soiling Coordinates & Set Channel Mode as Default

## Goal
1. Fix the Cartesian coordinate discrepancy in the I vs V scatter plot where the `#07: SOILING (-32%)` annotation points to an empty point due to String #07 erroneously inheriting the reduced voltage of String #19 (`606 V` instead of nominal `645 V`), and replace hardcoded annotation coordinates with dynamic node vector lookups.
2. Make **"Channel # vs Current"** (`plotMode = "channel"`) the default view mode rendered upon initial load, while preserving seamless interactive switching to the I vs V plane.

---

## Relevant Agent Skills
- `shadcn` (`.agents/skills/shadcn/SKILL.md`): Button toggles, Cyber Black UI layout.
- `architect` (`.agents/skills/architect/SKILL.md`): Mathematical coordinate alignment and dynamic SVG pointer projections.

---

## Existing Code Inspected
1. `app/sites/[id]/solar/page.tsx` (lines 55–75):
   - `voltage = isDegraded ? nominalStringVoltage * 0.94 : nominalStringVoltage;`
   - Because `isDegraded = channelNum === 7 || channelNum === 19`, String #07 (soiling) was assigned `606 V` instead of maintaining nominal voltage (`645 V`).
   - Fix: Only String #19 (fuse check / blown fuse) should have voltage derated to `0.94` (`606 V`). Soiling attenuates optical irradiance and therefore reduces current, but open-circuit / MPP voltage remains at nominal `645 V`.
2. `components/solar/mppt-string-scatter-plot.tsx`:
   - Line 30: `const [plotMode, setPlotMode] = useState<PlotMode>("iv");`
   - Lines 624–652: Annotation coordinates for String #07 were hardcoded with formula `paddingLeft + ((645 - minV) / (maxV - minV)) * chartW`, causing the line to point to `645 V` while the dot was plotted at `606 V`.
   - Fix:
     - Set initial state: `useState<PlotMode>("channel")`.
     - In `channel` mode, default active mode button highlights **Channel # vs Current**.
     - Replace hardcoded annotation coordinates with dynamic references: `const ch07 = channels.find(c => c.channel === 7); const coords07 = getCoordinates(ch07);` so lines and labels are mathematically locked to the exact center of each dot in both IV mode and Channel mode.
     - Add tolerance confidence band in Channel mode showing the nominal current envelope ($\pm 10\%$).

---

## Decisions or Assumptions
1. **Physical Accuracy of MPPT Data**:
   - In photovoltaic physics, module soiling (dust, bird droppings) attenuates shortwave irradiance, dropping current $I_{\text{sc}}$ and $I_{\text{mp}}$ by $\sim 32\%$, while string open-circuit voltage $V_{\text{oc}}$ and $V_{\text{mp}}$ remain virtually unaffected ($\approx 645\text{ V}$).
   - Conversely, blown combiner fuses or open series branches cause localized voltage drop across the array branch.
   - Therefore, in `app/sites/[id]/solar/page.tsx`, String #07 voltage is restored to nominal $645\text{ V}$, while String #19 voltage remains $606\text{ V}$.
2. **Dynamic Annotation Anchoring**:
   - Outlier callout lines will dynamically read `getCoordinates(ch)` for any flagged channel instead of hardcoded voltage numbers. If a channel moves, its callout line and tag follow it with zero error.
3. **Default Render Mode**:
   - `plotMode = "channel"` on initial render.
   - The user can still click **Voltage vs Current (I-V Plane)** to inspect the bivariate distribution where String #07 will now be correctly positioned at $(645\text{V}, 7.6\text{A})$.

---

## Files Likely to Change
1. `app/sites/[id]/solar/page.tsx`:
   - Fix voltage formula so String #07 retains nominal voltage ($645\text{ V}$) and only String #19 has derated voltage ($606\text{ V}$).
2. `components/solar/mppt-string-scatter-plot.tsx`:
   - Change default state to `const [plotMode, setPlotMode] = useState<PlotMode>("channel");`.
   - Update annotation logic to dynamically anchor callout leader lines to `coords07` and `coords19` in both IV and Channel modes.
   - Add shaded $\pm 10\%$ tolerance band across the 24 channels in Channel mode.

---

## Design System & Visual Adherence
- Void Black `#060709`, Obsidian `#0B0D13`, Elevated Glass `#121622`.
- Solar Amber `#FFD600`, Neon Pink `#FF2A85`, Vivid Amber `#FFAB00`, Neon Red `#FF1744`, Laser Cyan `#00F0FF`.
- `font-mono` on all axes and badges.

---

## Security & RBAC Requirements
- Pure presentation and telemetry analytics component.

---

## Acceptance Criteria
- [ ] On initial page load of `/sites/[id]/solar`, the scatter plot defaults to **Channel # vs Current** mode.
- [ ] In Channel mode, all 24 channels (#01–#24) are rendered along the X-axis with the fleet median reference line, and outliers #07 (Soiling) and #19 (Fuse) are clearly highlighted with dynamic callout tags.
- [ ] When switching to **Voltage vs Current (I-V Plane)**, String #07 is plotted at $645\text{ V}$ and $7.6\text{A}$, and the callout annotation `#07: SOILING (-32%)` points directly to String #07's dot (no empty space).
- [ ] String #19 is plotted at $606\text{ V}$ and $8.5\text{A}$, with its callout pointing directly to its dot.
- [ ] `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with 0 errors.

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
   - Scroll down to the scatter plot: Verify it renders **Channel # vs Current** by default.
   - Verify Channel #07 and Channel #19 stand out clearly with callout annotations pointing to their exact coordinates.
   - Click **Voltage vs Current (I-V Plane)**: Verify the I-V graph renders with String #07 at $645\text{ V}$ and the callout arrow pointing directly to the Amber dot.
2. **Mobile ($390 \times 844$)**:
   - Check mobile layout in DevTools; verify horizontal panning and tap selections work smoothly.
