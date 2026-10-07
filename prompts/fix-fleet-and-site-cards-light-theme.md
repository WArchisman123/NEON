# Implementation Prompt: Theme Harmonization for Fleet and Site Cards Subsystems & Facility Demand

## 1. Goal
Harmonize the visual appearance of the **Fleet Cockpit and Site Cockpit Cards** in Light Day Mode by eliminating jarring dark container backgrounds (`bg-[#121622]`) inside the Solar PV, Utility Grid, BESS Storage, DG Backup, and Facility Demand sections, replacing them with theme-adaptive surfaces (`bg-theme-elevated/70` in light mode, `bg-[#121622]/80` in dark mode) and high-contrast typography.

---

## 2. Relevant Agent Skills
- `.agents/skills/shadcn/`: Theme-aware surface composition, CSS custom properties, and contrast rules.

---

## 3. Existing Code Inspected
- `components/design-system/site-cockpit-card-preview.tsx`:
  - Contains hardcoded `bg-[#121622]/80` for:
    - Solar PV subsystem card (`lines 218-255`)
    - Utility Grid subsystem card (`lines 260-309`)
    - BESS Storage subsystem card (`lines 313-360`)
    - DG Backup subsystem card (`lines 365-410`)
    - Facility Demand & Daily Consumption Bar (`lines 414-433`)
  - Contains hardcoded `text-white`, `text-slate-300`, `text-slate-400` inside subsystem metric grids.
  - Contains dark progress bar track `bg-slate-800/80` for BESS SoC.
  - Contains `bg-[#121622]` for asset hardware badge container (`line 160`).
- `components/dashboard/fleet-cockpit-view.tsx`:
  - Search input and filter button containers have hardcoded `bg-[#121622]` and `border-white/[0.08]` / `border-white/[0.1]`.
  - Welcome banner has hardcoded `bg-[#0B0D13]` and `border-white/[0.08]`.

---

## 4. Decisions or Assumptions
1. **Subsystem Card Surfaces in Site Cards**:
   - In **Cyber Dark Mode**: Preserve the control-room obsidian glass look with `bg-[#121622]/80` and colored border accents (`border-amber-500/20`, `border-purple-500/20`, `border-cyan-500/20`, `border-orange-500/20`).
   - In **Cyber Light Day Mode**: Render crisp, elevated soft frost / light slate surfaces (`bg-theme-elevated/70` / `bg-slate-100/70`) with matching colored border accents and high-contrast typography (`text-theme-primary` for metrics, `text-theme-secondary` for labels).
2. **Facility Demand Bar**:
   - In **Cyber Dark Mode**: `bg-[#121622]/60 border border-pink-500/20`.
   - In **Cyber Light Day Mode**: `bg-pink-500/[0.06] border border-pink-500/25` with `text-theme-primary` and vibrant `#FF2A85` active demand, eliminating dark rectangular patches.
3. **BESS SoC Progress Bar**:
   - In Dark Mode: `bg-slate-800` track with cyan glow.
   - In Light Mode: `bg-slate-200` track with high-contrast `#0284C7` to `#00B4D8` gradient.
4. **Fleet Cockpit Controls & Welcome Banner**:
   - Update `components/dashboard/fleet-cockpit-view.tsx` search bar, filter badges, and welcome header to use semantic classes (`bg-theme-card`, `bg-theme-elevated`, `border-theme-subtle`, `text-theme-primary`, `text-theme-secondary`).

---

## 5. Files Likely to Change
1. `components/design-system/site-cockpit-card-preview.tsx`: Update `SiteCockpitCard` container, asset badge pill, Solar PV, Utility Grid, BESS, DG subsystem cards, and the Facility Demand bar.
2. `components/dashboard/fleet-cockpit-view.tsx`: Update welcome banner, search bar, filter buttons, and results counter.

---

## 6. Implementation Requirements
- Replace `bg-[#121622]/80` with `bg-theme-elevated/70 dark:bg-[#121622]/80` across all 4 subsystem modules in `SiteCockpitCard`.
- Replace `bg-[#121622]/50` on the Facility Demand bar with `bg-pink-500/[0.06] dark:bg-[#121622]/60`.
- Update text colors in `SiteCockpitCard` subsystem metric cells from hardcoded `text-white` / `text-slate-200` to `text-theme-primary` and `text-theme-secondary`.
- Update the BESS SoC progress bar background to `bg-slate-200 dark:bg-slate-800`.
- Update `components/dashboard/fleet-cockpit-view.tsx` controls and banners to use `bg-theme-card` and `bg-theme-elevated`.

---

## 7. Design System & Visual Adherence
- **Cyber Dark Mode**: Maintains 100% fidelity to the original void obsidian look (`#0B0D13` cards, `#121622` subsystems).
- **High-Contrast Day Mode**: Delivers seamless white slate cards with soft frosted subsystem insets, eliminate jarring dark blobs, and highlight Neon Pink `#FF2A85`.
- **Monospace Telemetry**: Retain `font-mono` on all $kW$, $MW$, $V$, $A$, $Hz$, $\%$, $kWh$, $^\circ C$ values.

---

## 8. Security & RBAC Requirements
- Pure UI styling and theme harmonization; no change to session checks or RBAC logic.

---

## 9. Acceptance Criteria
1. On both `/` (Fleet Cockpit) and `/design-system` (Fleet & Site Cards tab), switching to Light Day Mode renders the Solar PV, Utility Grid, BESS, and DG cards with crisp daylight backgrounds instead of dark navy/black rectangles.
2. The Facility Demand bar blends seamlessly into the card with a light pink tint in Light Mode, and dark glass in Dark Mode.
3. In Dark Mode, all cards and subsystems retain their obsidian dark control-room aesthetic.
4. `npx tsc --noEmit` passes with 0 errors.
5. `npm run lint` passes with 0 errors.

---

## 10. Checks to Run
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

---

## 11. Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `/` and `/design-system` on desktop ($1440 \times 900$).
2. Toggle to **Day Light Mode**:
   - Inspect the site cards: verify Solar PV, Utility Grid, BESS Storage, and DG Backup cards have light/frost backgrounds with clean colored borders.
   - Inspect the Facility Demand bar: verify it has a subtle translucent pink glow with legible text and no dark box.
   - Verify all numbers ($kW$, $kWh$, $SoC$) are crisp and legible.
3. Toggle back to **Cyber Dark Mode**:
   - Verify cards restore to obsidian glass with dark containers.
4. Emulate mobile ($390 \times 844$) and verify visual harmony and tap ergonomics.
