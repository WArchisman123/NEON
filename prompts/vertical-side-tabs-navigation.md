# Implementation Prompt: Vertical Side Tabs Navigation & Site Switcher Dropdown Background Fix

## Goal
1. **Vertical Side Tabs Navigation**: Replace the top horizontal tab bar in [`components/site-detail/single-site-ems-view.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/single-site-ems-view.tsx) with a dedicated, collapsible **vertical side navigation rail** running alongside the active telemetry content.
2. **Site Switcher Dropdown Background Fix**: Fix the transparent background on the Site Selector dropdown in [`components/layout/site-switcher.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/site-switcher.tsx) by replacing the invalid `bg-theme-card/95` modifier with an opaque solid surface (`bg-theme-card` / `bg-[#0B0D13] light:bg-white`) so the underlying page is never visible through the popover.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: UI component layout, responsive flex/grid composition, accessible button lists, popover stacking and solid surface backgrounds.

---

## Existing Code Inspected
- [`components/layout/site-switcher.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/site-switcher.tsx): Line 131 uses `bg-theme-card/95 backdrop-blur-xl`. Because `.bg-theme-card` is a custom CSS utility in `globals.css` rather than a Tailwind v4 theme color, `/95` fails to resolve, causing transparent rendering.
- [`components/site-detail/single-site-ems-view.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/single-site-ems-view.tsx): Currently renders the 10 tabs horizontally at the top (`flex items-center gap-1.5 p-1.5 overflow-x-auto`).
- [`components/site-detail/tabs/`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/tabs/): All 10 modular tab components.

---

## Decisions & Layout Architecture
1. **Vertical Side Tabs Navigation**:
   - Layout becomes a 2-column container:
     - **Left Subsystem Rail**:
       - On desktop ($\ge 1024\text{px}$): Sticky vertical rail (`w-60` or `w-64`) with site status indicator, subsystem category headers, and all 10 tab buttons.
       - Collapse toggle to shrink the side rail to `w-16` icon-only mode with tooltips, allowing operators to maximize screen real estate when examining high-density charts and heatmaps.
       - Active state: `#FF2A85` Neon Pink glow pill (`bg-[#FF2A85] text-white shadow-[0_0_12px_rgba(255,42,133,0.35)]`), inactive state: `text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated`.
     - **Right Content View (`flex-1 min-w-0`)**:
       - Houses the active tab component (`DashboardTab`, `EnergyFlowTab`, `MeteringTab`, etc.).
     - **Mobile Viewport ($< 1024\text{px}$)**:
       - Smoothly reflows into a compact top dock or an icon-rail with horizontal scroll, preserving touch targets $\ge 48\times 48\text{ px}$.
2. **Site Switcher Solid Opaque Background**:
   - Update `components/layout/site-switcher.tsx` popover container to:
     `bg-theme-card bg-[#0B0D13] light:bg-white border border-theme-subtle shadow-2xl shadow-black/80 z-50`
   - Ensure the search bar header also uses solid opaque background (`bg-theme-elevated`).

---

## Files Likely to Change
- `components/layout/site-switcher.tsx`: Fix popover background to solid opaque surface.
- `components/site-detail/single-site-ems-view.tsx`: Transform top tabs into vertical side rail layout with optional collapse.

---

## Design System & Visual Adherence
- **Cyber Dark Mode**: Obsidian card background (`#0B0D13`), Cyber Glass navigation rail (`#121622`), subtle borders (`border-white/[0.08]`), glowing Neon Pink active pill (`#FF2A85`).
- **Solar Day Light Mode**: Pure White Slate (`#FFFFFF`), Day Frost rail (`#EAEFF8`), crisp Charcoal text (`#0B0F19`), Neon Pink accents.
- **Monospace Typography**: `font-mono` on all labels, badges, and status pills.

---

## Acceptance Criteria
1. Site Selector dropdown popover has a 100% solid, opaque background in both dark and light modes, completely obscuring the page behind it.
2. Top tab bar is replaced with a dedicated vertical side navigation panel.
3. All 10 EMS tabs are accessible from the vertical side rail with icons, labels, and badges.
4. Collapsible rail allows switching between expanded (`w-60`) and icon-only (`w-16`) mode.
5. Content smoothly renders in the primary viewport area without horizontal layout clipping.
6. Mobile viewport remains responsive and accessible.
7. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with **0 errors**.

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
2. Click the Site Switcher dropdown in the topbar: verify the background is completely solid and opaque, with no page content visible through it.
3. Observe the site view: verify the left vertical side tabs panel displaying all 10 EMS subsystems.
4. Click through the vertical tabs (e.g. **Energy Flow**, **Metering & SCADA**, **Battery Health**, **Thermal Mgmt**, **Controls & SCADA**) and verify active pink indicator and content updates on the right.
5. Click the collapse button on the side tabs rail: verify it shrinks to `w-16` icon-only mode with tooltips, expanding chart viewing width.
6. Toggle dark / light theme to confirm high-contrast readability and solid popover background.
