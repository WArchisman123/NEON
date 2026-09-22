# Implementation Prompt: Design System Showcase Route (`/design-system`)

## Goal
Implement the comprehensive Neon Energy design system as specified in `public/context/ui_doc.md` and render a live, interactive showcase route at `/design-system`. This route will serve as the living design system documentation and component playground for the entire platform, showcasing all color tokens, glow utilities, monospace typography scales, UI primitives (buttons, inputs, badges), the global layout shell, and core industrial BESS/Solar telemetry components (KPI strips, Site cards, 5-node flow visualizer preview, subsystem telemetry widgets, and service catalog cards).

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (`SKILL.md`): Used for UI component composition, class variance styling, accessibility rules, button/badge/input primitives, and icon guidelines.
- `.agents/skills/clerk-nextjs-patterns/` (`SKILL.md`): Used for Next.js App Router layout structure and client/server component boundary segregation.

---

## Existing Code Inspected
- `AGENTS.md`: Outlines strict architecture rules, color palette tokens, monospace telemetry rule, and workflow constraints.
- `public/context/ui_doc.md`: Master specification for cyberpunk black neon/pink aesthetic, swatches, glow utilities, component code samples, typography hierarchy, and mobile reflow.
- `public/context/doc.md`: Product architecture, 5-node electrical flow physics, BESS & Solar subsystems, maintenance catalog packages.
- `app/globals.css`: Currently minimal Next.js scaffold with light/dark template rules that must be replaced with the Neon Energy cyber black token definitions and custom glow utilities.
- `app/layout.tsx`: Base root layout utilizing Geist and Geist Mono font variables.
- `package.json`: Contains Next.js 16.3.5, React 19.2.8, Tailwind CSS v4. Requires `lucide-react`, `clsx`, and `tailwind-merge` for UI primitives and industrial icons.

---

## Decisions or Assumptions
1. **Tailwind v4 Integration**: Configure custom theme tokens (`--color-void-black`, `--color-obsidian`, `--color-neon-pink`, `--color-solar-amber`, `--color-bess-cyan`, etc.) and utility classes (`glow-pink`, `glow-cyan`, `glow-yellow`, `glow-border-pink`) in `app/globals.css` so both standard classes and semantic token classes are available.
2. **Icons**: Install `lucide-react` for industrial iconography (`Sun`, `BatteryCharging`, `Zap`, `Flame`, `ShieldAlert`, `Wrench`, `Bell`, `ChevronRight`, `CheckCircle2`, `Layers`, `Activity`, etc.).
3. **Class Merging Utility**: Create `lib/utils.ts` with standard `cn()` helper utilizing `clsx` and `tailwind-merge`.
4. **Component Modularization**: Place reusable design system primitives in `components/ui/` and layout shell components in `components/layout/` so they can be reused across all future dashboard screens.
5. **Interactive Showcase Page (`app/design-system/page.tsx`)**:
   - Tabbed or anchored navigation allowing engineers and operators to review:
     1. **Palette & Tokens**: Live swatch cards with hex codes, RGB glow values, and click-to-copy token utility.
     2. **Typography & Monospace Scale**: Telemetry metrics, status indicators, and headers formatted strictly with `font-mono`.
     3. **Buttons & Controls**: Primary Neon Pink CTAs, Secondary glass buttons, Emergency Trip / E-stop buttons, input search fields, badge pills.
     4. **Fleet & Site Components**: 5-metric Fleet Aggregate KPI strip, `<SiteCockpitCard />` with asset badges and mini-flow telemetry.
     5. **5-Node Flow Visualizer Preview**: Interactive preview with SVG pulsing conduits and dynamic mode badges.
     6. **Subsystem Drawers & Widgets**: 16-cell BESS thermal heatmap matrix, Cell delta-V status gauge, and Solar MPPT string current table.
     7. **Maintenance Service Cards**: Specialized Solar & BESS maintenance package cards with deliverables checklists and booking CTAs.
   - Built with mobile-responsive ergonomics (touch targets >= 48px, horizontal scroll prevention, collapsible sections).

---

## Files Likely to Change / Be Created
1. `package.json`: Install `lucide-react`, `clsx`, `tailwind-merge`.
2. `lib/utils.ts`: Create `cn()` utility function.
3. `app/globals.css`: Update with custom cyber black root variables, glow shadow classes, and keyframe animations for directional electrical flow pulses.
4. `components/ui/button.tsx`: Reusable Neon button variants (primary pink glow, secondary glass, destructive trip, outline).
5. `components/ui/badge.tsx`: Neon status badges (online green, charging cyan, warning amber, fault red, asset tags).
6. `components/ui/input.tsx`: Cyber obsidian search and numerical inputs.
7. `components/layout/neon-app-shell.tsx`: Application shell with fixed desktop cyberdock sidebar, responsive topbar with live fleet health marquee, and mobile bottom bar.
8. `components/layout/topbar.tsx`: Dark glassmorphism header with logo, organization pill, live fleet ticker, search bar, and alert bell.
9. `components/layout/desktop-sidebar.tsx`: Collapsible/expanded cyber dock with active pink glow routing links.
10. `components/layout/mobile-bottom-bar.tsx`: Sticky 64px mobile navigation bar with 48px touch targets.
11. `components/design-system/swatch-card.tsx`: Interactive color swatch card with hex, Tailwind class, and usage badge.
12. `components/design-system/component-showcase.tsx`: Sections demonstrating the various component families.
13. `app/design-system/page.tsx`: The primary route page displaying the entire design system and interactive widgets.

---

## Implementation Requirements

### 1. Palette Tokens (`app/globals.css`)
- Void Black background: `#060709`
- Obsidian Card Surface: `#0B0D13`
- Elevated Surface (Modals/Drawers): `#121622`
- Neon Pink Brand Primary: `#FF2A85`
- Primary Glow Shadow: `shadow-[0_0_15px_rgba(255,42,133,0.35)]`
- Solar Amber: `#FFD600`
- BESS Cyan: `#00F0FF`
- Grid Violet: `#9D4EDD`
- DG Orange: `#FF6B00`
- Online Green: `#00E676`
- Warning Amber: `#FFAB00`
- Critical Alarm Red: `#FF1744`
- Border Default: `border-white/[0.08]`
- Border Active: `border-[#FF2A85]/40`

### 2. Glow Classes
- `.glow-pink`: `box-shadow: 0 0 20px -3px rgba(255, 42, 133, 0.45);`
- `.glow-cyan`: `box-shadow: 0 0 20px -3px rgba(0, 240, 255, 0.45);`
- `.glow-yellow`: `box-shadow: 0 0 20px -3px rgba(255, 214, 0, 0.45);`
- `.glow-border-pink`: `border-color: rgba(255, 42, 133, 0.6); box-shadow: inset 0 0 12px rgba(255, 42, 133, 0.15), 0 0 15px rgba(255, 42, 133, 0.25);`

### 3. Monospace Rule
- Every electrical metric (`kW`, `MW`, `MWh`, `V`, `mV`, `A`, `Hz`, `%`, `kWh`, `°C`) must render in `font-mono`.

### 4. Layout Shell Preview & Ergonomics
- Topbar includes glowing brand icon `NEON.ENERGY`, live marquee ticker ("Fleet Normal | Live Power: 3.42 MW | Fleet SoC: 78.4%"), search button, alarm notification badge.
- Sidebar with links: Sites, Flow, Analytics, Maintenance, Settings.
- Mobile bottom cyber dock fixed at screen bottom with 48x48px touch areas.

### 5. Specialized Solar & BESS Maintenance Card
- Showcase BESS Liquid Chiller Coolant Flush package ($1,250) and Solar PV Drone IR Thermography ($850) with deliverables checklists and instant booking button.

---

## Design System & Visual Adherence
- **Color Fidelity**: Strict enforcement of Void Black (`#060709`), Obsidian Card Surface (`#0B0D13`), Elevated Surface (`#121622`), and Neon Pink Brand Glow (`#FF2A85` with `shadow-[0_0_15px_rgba(255,42,133,0.35)]`).
- **No Light Mode**: Absolute prohibition of light mode containers, white page cards, or generic grey utility wrappers.
- **Monospace Telemetry**: All electrical values, capacities, frequencies, temperatures, and units (`kW`, `MW`, `MWh`, `V`, `A`, `Hz`, `°C`, `%`) formatted with `font-mono`.
- **Mobile Touch Ergonomics**: Minimum $48 \times 48\ px$ touch targets on mobile viewports with smooth horizontal scrolling containment.

---

## Security & RBAC Requirements
- Although `/design-system` is an internal showcase and development route, ensure no sensitive keys or raw database mutations are exposed.
- All mock state transitions (e.g. toggling statuses or booking steps) are pure client-side demonstrations.

---

## Acceptance Criteria
1. `/design-system` loads seamlessly with dark void black background (`#060709`) and zero flash of unstyled light content.
2. All 12 color swatches from Section 1.1 of `ui_doc.md` are visibly rendered with correct hex codes and role descriptions.
3. Glow utilities (`.glow-pink`, `.glow-cyan`, `.glow-yellow`, `.glow-border-pink`) exhibit noticeable luminescent contrast on `#0B0D13` surfaces.
4. Monospace hierarchy displays all 6 typography scales with crisp alignment using `font-mono`.
5. Button variants (Primary Pink Glow, Secondary Obsidian Glass, Destructive Emergency Trip) and cyber inputs render with correct hover/active states.
6. The 5-card Fleet Aggregate KPI strip renders responsively with live delta indicators and color-coded subsystem icons.
7. The `<SiteCockpitCard />` displays online pulse status, asset badges (Solar, BESS, Grid, DG), mini-flow readings, and daily yield.
8. The 5-node energy flow visualizer preview demonstrates directional SVG dashed animation linking Solar, BESS, Grid, DG, and Load.
9. The 16-cell BESS thermal heatmap grid renders with temperature gradients ($24^\circ C$ normal to $>45^\circ C$ critical).
10. MPPT string current table highlights string deviation warnings properly.
11. Responsive testing passes on desktop ($1440 \times 900$) and mobile ($390 \times 844$).
12. `npm run typecheck` passes with 0 errors.

---

## Checks to Run
- `npm run typecheck` (`npx tsc --noEmit`)
- `npm run lint` (or `npx next lint`)
- `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Desktop Viewport ($1440 \times 900$)**:
   - Navigate to `http://localhost:3000/design-system`.
   - Verify the topbar renders the glowing "NEON.ENERGY" badge and live fleet status marquee.
   - Click through the showcase tabs / sections:
     - **Colors & Tokens**: Click any swatch to copy its hex token; confirm clipboard feedback.
     - **Typography**: Verify `font-mono` is applied to all numerical telemetry metrics and units.
     - **Components & Controls**: Hover over the primary CTA button to observe the pink glow shadow expansion (`shadow-[0_0_20px_rgba(255,42,133,0.45)]`).
     - **Fleet Strip**: Observe the 5-metric cards with amber solar, cyan BESS, pink load, purple grid, and orange DG icons.
     - **Energy Flow Preview**: Verify animated stroke-dashoffset SVG pipes connecting nodes.
     - **BESS Thermal Matrix**: Inspect the 16-cell thermal grid; verify color-coded temperatures.
2. **Mobile Viewport ($390 \times 844$)**:
   - In Chrome/Safari DevTools, toggle Device Mode to iPhone 14/15 ($390 \times 844$).
   - Verify the desktop sidebar collapses and the sticky mobile cyberdock bottom bar (`h-16`) appears at the bottom.
   - Verify all buttons and tabs meet the $48 \times 48\ px$ touch target standard.
   - Verify the 5-card KPI strip reflows cleanly without horizontal page scroll.
