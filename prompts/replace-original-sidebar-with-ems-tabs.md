# Implementation Prompt: Replace Application Sidebar with EMS Subsystems Navigation

## Goal
Replace the original application `DesktopSidebar` (`components/layout/desktop-sidebar.tsx`) with the 10-tab industrial EMS Subsystem Navigation suite, eliminating redundant double sidebars and maximizing horizontal screen real estate for the telemetry charts, heatmaps, and SCADA visualizers.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: Sidebar composition, accessible navigation items, collapsible rail patterns, and color token compliance.

---

## Existing Code Inspected
- [`components/layout/desktop-sidebar.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/desktop-sidebar.tsx): Contains generic navigation links (Site EMS, Fleet Cockpit, Analytics, Subscriptions, Maintenance, Design System, Settings).
- [`components/layout/neon-app-shell.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/layout/neon-app-shell.tsx): Houses `DesktopSidebar` alongside the `<main>` viewport.
- [`components/site-detail/single-site-ems-view.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/single-site-ems-view.tsx): Currently contains an inner vertical side navigation, causing a double-sidebar layout on desktop.
- [`components/site-detail/tabs/`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/tabs/): All 10 modular tab components.

---

## Architecture & Implementation Plan

### 1. Unified EMS Tab State (`lib/energy/ems-tab-context.tsx`)
Create a lightweight React Context (`EmsTabContext` & `useEmsTab` hook) providing:
- `activeTab`: Current active EMS subsystem (`"dashboard" | "flow" | "inverter" | "metering" | "bess" | "thermal" | "fire-safety" | "historian" | "thresholds" | "controls"`).
- `setActiveTab(tab)`: Function to switch tabs instantly.
- Seamlessly synchronize with URL search parameter (`?tab=...`) with `"dashboard"` as default.

### 2. Replace `DesktopSidebar` Navigation Items (`components/layout/desktop-sidebar.tsx`)
Transform `DesktopSidebar` into the primary EMS Subsystems Navigation:
- **Subsystem Items (10 Items)**:
  1. `Dashboard` (`Activity`) — Page 1 Financial strip, 3-column core, waveforms
  2. `Energy Flow` (`Zap`) — Page 2 7-node visualizer & 4-quadrant balance
  3. `PCS / Inverter` (`Sun`) — Page 3 Fleet KPIs & AC/DC electrical matrix
  4. `Metering & SCADA` (`Gauge`, badge `CORE`) — Page 4 Class 0.2S 3-phase live table & IEEE 519
  5. `Battery Health` (`BatteryCharging`) — Page 5 SOH RUL curve & weak cells ranking
  6. `Thermal Mgmt` (`Thermometer`) — Page 6 72-zone heatmap matrix & regression
  7. `Fire Safety` (`Flame`, badge `NFPA 855`) — Page 7 4-stage suppression & gas ppm
  8. `Historian` (`LineChart`) — Page 8 High-density tag time series
  9. `Thresholds & Limits` (`SlidersHorizontal`) — Page 9 4-tier trip setpoint matrix
  10. `Controls & SCADA` (`Terminal`) — Page 10 Direct Modbus register actuation
- **Secondary App Links (Bottom Section)**:
  - `Fleet Overview` (`/fleet`)
  - `Maintenance Hub` (`/maintenance`)
  - `Subscriptions` (`/subscription`)
- **Collapsible Mode**:
  - Expanded (`w-60`): Shows icons, subsystem labels, and badges (`CORE`, `NFPA 855`).
  - Collapsed (`w-16`): Center-aligned icons with hover tooltips and Neon Pink active indicator.
  - Persists preference in `localStorage` (`"neon_sidebar_collapsed"`).

### 3. Remove Inner Side Nav in `SingleSiteEmsView` (`components/site-detail/single-site-ems-view.tsx`)
- Remove the inner `<aside>` side nav from `SingleSiteEmsView`.
- Consume `useEmsTab()` to render the active tab content directly across the entire available width.
- On mobile (`< 1024px`), render a compact horizontal swipeable tab bar so mobile technicians can easily switch subsystems without desktop sidebars.

---

## Design System & Visual Adherence
- **Cyber Dark**: Obsidian card background (`#0B0D13`), Cyber Glass navigation rail (`#121622`), glowing `#FF2A85` Neon Pink active indicator.
- **Solar Day Light**: Pure White Slate (`#FFFFFF`), Day Frost rail (`#EAEFF8`), charcoal text (`#0B0F19`), `#FF2A85` accents.
- **Monospace Typography**: `font-mono` on all navigation items, badges, and status labels.

---

## Acceptance Criteria
1. Original generic sidebar is replaced by the 10 EMS Subsystem tabs.
2. No duplicate or double sidebars exist in the site view on desktop.
3. Clicking any subsystem in the sidebar immediately renders its corresponding tab on the right.
4. Collapsible rail (`w-16` vs `w-60`) operates cleanly with tooltips.
5. Bottom section retains quick links to Fleet, Maintenance, and Subscriptions.
6. Mobile view retains convenient subsystem switching via horizontal dock.
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
2. Confirm there is **only ONE sidebar on the screen** on the left, displaying all 10 EMS subsystems.
3. Click through the subsystems (e.g. **Energy Flow**, **Metering & SCADA**, **Battery Health**, **Thermal Mgmt**, **Fire Safety**, **Controls & SCADA**) and confirm the content on the right updates instantly.
4. Click the collapse button on the sidebar: confirm it shrinks to `w-16` icon-only mode with tooltips, giving full width to charts.
5. Click **"Fleet Overview"** at the bottom of the sidebar: confirm it navigates to `/fleet`.
6. Test on mobile viewport ($390 \times 844$) to verify responsive layout.
