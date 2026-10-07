# Implementation Prompt: Dual-Theme (Cyber Dark & High-Contrast Cyber Light Day Mode) in Design System

## 1. Goal
Implement a high-contrast **Cyber Light (Day Mode)** theme alongside the existing **Cyber Black Neon** theme in the NEON ENERGY design system and application shell. This will provide solar asset managers and field technicians with optimal readability under intense outdoor direct sunlight while preserving the iconic `#FF2A85` Neon Pink brand identity, monospace telemetry metrics, and high-contrast industrial control-room aesthetics.

---

## 2. Relevant Agent Skills
- `.agents/skills/shadcn/`: Styling rules, CSS custom property definitions, semantic color mapping, accessibility tap targets ($\ge 48\times 48\text{ px}$), and component composition.
- `.agents/skills/clerk-custom-ui/`: Theming and appearance synchronization for Clerk authentication components (organization switcher, user profile, sign-in dialogs) across light and dark modes.

---

## 3. Existing Code Inspected
- `app/globals.css`: Tailwind v4 `@theme` block, CSS root variables, hardcoded `#060709` / `#0B0D13` / `#121622` palette tokens, and Clerk dark theme overrides.
- `app/layout.tsx`: Root layout with `@clerk/themes` `dark` theme, Clerk appearance variables, and font configurations.
- `components/layout/neon-app-shell.tsx`: Main application shell with hardcoded `bg-[#060709] text-slate-100`.
- `components/layout/topbar.tsx`: Sticky topbar with hardcoded `bg-[#0B0D13]/90` and dark glass styles.
- `components/layout/desktop-sidebar.tsx` & `components/layout/mobile-bottom-bar.tsx`: Navigation bars with dark styling.
- `app/design-system/page.tsx`: Design System showcase page with "Zero Light Mode" badge, dark swatches, and dark preview components.
- `components/design-system/swatch-card.tsx`, `fleet-aggregate-strip.tsx`, `site-cockpit-card-preview.tsx`, `telemetry-widgets.tsx`, `maintenance-catalog-preview.tsx`: Design system preview components.
- `AGENTS.md` and `public/context/ui_doc.md`: Specifications currently mandating dark-only theme.

---

## 4. Decisions or Assumptions
1. **Theme Aesthetics**:
   - **Cyber Dark Mode (Default)**: Void Black (`#060709`), Obsidian Card (`#0B0D13`), Cyber Glass (`#121622`), Slate Text (`#F8FAFC`), and subtle white frost borders.
   - **Cyber Light Day Mode**: Crisp Solar Ice Canvas (`#F4F6FB`), Pure White Card (`#FFFFFF`), Elevated Day Glass (`#EAEFF8`), Deep Charcoal Ink Text (`#0B0F19`), Steel Muted Text (`#475569`), and subtle slate borders (`rgba(15, 23, 42, 0.08)`).
   - **Neon Pink Accent (`#FF2A85`)**: Retained in both themes as the primary brand luminescent accent for CTAs, active indicators, and focus halos.
   - **Subsystem & Telemetry Colors**: Adjusted in Light Mode for WCAG AAA outdoor sunlight contrast (e.g. Solar `#D97706` amber, BESS `#0284C7` laser blue/cyan, DG `#EA580C` orange, Grid `#7C3AED` violet, Normal `#059669` green, Alarm `#DC2626` red).
2. **Zero-Flash Theme Resolution**:
   - Store user preference in `localStorage` under key `neon-theme` (`"dark" | "light" | "system"`).
   - Inject an inline theme initialization script in `<head>` in `app/layout.tsx` to read `localStorage` / system media query before DOM rendering to eliminate any FOUC (Flash of Unstyled Content).
3. **Clerk Theming**:
   - Support dynamic Clerk theming based on the active theme, applying appropriate dark or light variables.
4. **Design System Living Showcase**:
   - The `/design-system` route will feature a live interactive Theme Switcher, dual-swatch comparisons (Dark vs Light tokens), and theme-responsive preview components.
5. **Documentation Alignment**:
   - Update `AGENTS.md` and `public/context/ui_doc.md` to officially record the dual-theme architecture.

---

## 5. Files Likely to Change
1. `AGENTS.md`: Update rules from "No Light Themes" to "Dual-Theme (Cyber Dark & High-Contrast Cyber Light Day Mode)".
2. `public/context/ui_doc.md`: Update Section 1 & Section 1.1 to document Light Day Mode palette tokens, contrast rules, and theme toggling.
3. `components/theme/theme-provider.tsx` *(new)*: React context provider and hook for `useTheme()` managing `"dark" | "light" | "system"`.
4. `components/theme/theme-toggle.tsx` *(new)*: Cyber-styled button with Sun / Moon icons and $\ge 48\times 48\text{ px}$ mobile tap target.
5. `app/globals.css`:
   - Declare CSS variables for `--background`, `--card`, `--card-elevated`, `--text-primary`, `--text-secondary`, `--border-color` for both `.dark` and `.light` / `:root`.
   - Update Clerk CSS overrides to support `.light` and `.dark` scopes.
6. `app/layout.tsx`: Include theme provider, inline anti-flicker script, and dynamic theme wrapper.
7. `components/layout/neon-app-shell.tsx`: Replace hardcoded dark-only colors with theme-aware classes.
8. `components/layout/topbar.tsx`: Integrate the Theme Toggle button in desktop and mobile headers.
9. `components/layout/desktop-sidebar.tsx` & `components/layout/mobile-bottom-bar.tsx`: Ensure theme-aware background and border styling.
10. `app/design-system/page.tsx`:
    - Add Day Mode vs Dark Mode token swatches.
    - Add Theme Toggle in header with updated status badge ("Dual-Mode Enabled").
    - Ensure all tabs and component previews respond cleanly to the active theme.
11. `components/design-system/swatch-card.tsx` & other design-system components: Support light mode backgrounds and text contrast.

---

## 6. Implementation Requirements

### 6.1 Theme Provider & Anti-Flicker Script
- Implement `components/theme/theme-provider.tsx`:
  - `Theme` type: `"dark" | "light" | "system"`.
  - Listen for system preference changes when in `"system"` mode.
  - Synchronize `class="dark"` / `class="light"` and `data-theme="dark"` / `data-theme="light"` on `document.documentElement`.
  - Broadcast active state via React Context: `{ theme, resolvedTheme, setTheme }`.
- In `app/layout.tsx`:
  - Add inline `<script>` in `<head>`:
    ```js
    (function() {
      try {
        var t = localStorage.getItem('neon-theme') || 'dark';
        var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.add(d ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
      } catch (e) {}
    })()
    ```

### 6.2 CSS Tokens & Theme Styles (`app/globals.css`)
- Configure semantic theme variables:
  ```css
  :root, html.light {
    color-scheme: light;
    --background: #F4F6FB;
    --card: #FFFFFF;
    --card-elevated: #EAEFF8;
    --text-primary: #0B0F19;
    --text-secondary: #475569;
    --border-subtle: rgba(15, 23, 42, 0.08);
    --border-hover: rgba(255, 42, 133, 0.4);
    --color-solar: #D97706;
    --color-bess: #0284C7;
    --color-grid: #7C3AED;
    --color-dg: #EA580C;
    --color-neon-green: #059669;
    --color-neon-amber: #D97706;
    --color-neon-red: #DC2626;
  }

  html.dark {
    color-scheme: dark;
    --background: #060709;
    --card: #0B0D13;
    --card-elevated: #121622;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --border-subtle: rgba(255, 255, 255, 0.08);
    --border-hover: rgba(255, 42, 133, 0.4);
    --color-solar: #FFD600;
    --color-bess: #00F0FF;
    --color-grid: #9D4EDD;
    --color-dg: #FF6B00;
    --color-neon-green: #00E676;
    --color-neon-amber: #FFAB00;
    --color-neon-red: #FF1744;
  }
  ```
- Ensure body uses `bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200`.

### 6.3 Theme Toggle Button (`components/theme/theme-toggle.tsx`)
- Toggle button with `Sun` and `Moon` icons, displaying current state with smooth transition.
- Includes tooltip/label and maintains a minimum $48\times 48\text{ px}$ touch target for mobile viewports.
- Integrated into `components/layout/topbar.tsx` header actions.

### 6.4 App Shell & Layout Updates
- Update `components/layout/neon-app-shell.tsx`:
  - Change `bg-[#060709] text-slate-100` to `bg-[var(--background)] text-[var(--text-primary)]`.
- Update `components/layout/topbar.tsx`:
  - Adapt background to `bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]`.
- Update `components/layout/desktop-sidebar.tsx` & `components/layout/mobile-bottom-bar.tsx`:
  - Adapt surfaces and borders to theme variables.

### 6.5 Design System Page Expansion (`app/design-system/page.tsx`)
- Display dual-palette swatches:
  - **Dark Swatches**: Void Black, Obsidian, Elevated Cyber Glass, Neon Pink, Solar Amber, BESS Cyan, Grid Violet, DG Orange.
  - **Day Mode Swatches**: Crisp Solar Canvas (`#F4F6FB`), Pure White Card (`#FFFFFF`), Elevated Frost (`#EAEFF8`), High-Contrast Monospace Ink (`#0B0F19`), and outdoor-tuned telemetry colors.
- Interactive Theme Toggle placed prominently in the Design System header.
- Ensure all preview cards (`SiteCockpitCard`, `FleetAggregateStrip`, `TelemetryWidgets`, `MaintenanceCatalogPreview`) look crisp and legible in both light and dark modes.

---

## 7. Design System & Visual Adherence
- **Dark Mode**: Retains 100% fidelity to `#060709` Void Black, `#0B0D13` Obsidian cards, `#121622` elevated modals, and glowing Neon Pink `#FF2A85`.
- **Light Mode**: High-contrast outdoor-optimized day palette (`#F4F6FB` background, `#FFFFFF` cards, `#0B0F19` high-contrast ink, `#FF2A85` neon pink glow).
- **Monospace Rule**: Monospace font (`font-mono`) preserved for all numerical electrical metrics ($kW$, $MW$, $V$, $A$, $Hz$, $\%$, $kWh$, $^\circ C$) in both themes.
- **Touch Ergonomics**: All interactive toggles and buttons guarantee $\ge 48\times 48\text{ px}$ tap targets on mobile viewports.

---

## 8. Security & RBAC Requirements
- Theming is a client-side preference stored in `localStorage` and does not affect role scopes or Supabase RLS policies.
- Clerk user session, organization multi-tenancy, and API authentication remain completely unchanged.

---

## 9. Acceptance Criteria
1. Toggle between Dark Mode and Light Mode is available in the Topbar on both desktop and mobile viewports.
2. Clicking the toggle immediately updates the DOM (`class="light"` or `class="dark"`) with smooth transition and zero page reload.
3. Reloading the page retains the user's selected theme with zero flashing of the unselected theme.
4. The `/design-system` page showcases both Dark and Light theme tokens and swatches with explicit color hex codes, semantic roles, and contrast information.
5. All Design System preview components (cards, strips, buttons, widgets) render with high contrast and legible typography in both Light and Dark modes.
6. The Neon Pink (`#FF2A85`) accent remains prominent and visually striking across both themes.
7. `AGENTS.md` and `public/context/ui_doc.md` are updated to formally reflect the dual-theme architecture.
8. `npx tsc --noEmit` and `npm run lint` pass with 0 errors.

---

## 10. Checks to Run
- `npx tsc --noEmit` (TypeScript typecheck)
- `npm run lint` (ESLint verification)

---

## 11. Exact Manual Test Steps (Desktop & Mobile)
### Desktop ($1440 \times 900$)
1. Navigate to `/design-system`.
2. Locate the Theme Toggle in the Topbar (and the one on the Design System page).
3. Click the toggle to switch from **Dark Mode** to **Light Mode**:
   - Verify page canvas transitions to crisp `#F4F6FB`.
   - Verify cards transition to pure white `#FFFFFF` with clear `#0B0F19` text and subtle slate borders.
   - Verify Neon Pink buttons and badges pop with high luminance.
   - Verify all monospace electrical metrics are sharp and readable.
4. Switch through the Design System tabs (`Colors & Tokens`, `Typography`, `Buttons & Inputs`, `Fleet & Site Cards`, `5-Node Flow`, `Subsystem Telemetry`, `Maintenance Hub`) to confirm proper light mode contrast.
5. Refresh the browser; confirm the light mode persists without flashing dark mode.
6. Toggle back to **Dark Mode**; verify dark obsidian styling restores cleanly.

### Mobile Viewport ($390 \times 844$)
1. Open mobile emulation mode ($390 \times 844$).
2. Verify the Theme Toggle is accessible in the header with a touch target $\ge 48\times 48\text{ px}$.
3. Tap the toggle; observe the entire mobile viewport, bottom navigation bar, and cards switch themes cleanly.
4. Verify readability of text and telemetry values under high ambient brightness simulation.
