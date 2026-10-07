# Implementation Prompt: Clerk Organization Switcher & UserButton Profile Menu Dual-Theme Adaptation

## Goal
Fix the Clerk `OrganizationSwitcher` and `UserButton` (profile menu popup) so they dynamically and seamlessly adapt between **Cyber Dark Mode** (`#060709`, `#0B0D13`) and **High-Contrast Day Mode** (`#F4F6FB`, `#FFFFFF`, `#0B0F19`) instead of remaining permanently dark.

---

## Relevant Agent Skills
- `.agents/skills/clerk-custom-ui/`: Clerk appearance prop, themes (`dark`, `baseTheme`), variables (`colorBackground`, `colorForeground`), element class overrides, CSS color-scheme support.
- `.agents/skills/clerk-orgs/`: OrganizationSwitcher configuration, appearance options, and member role displays.
- `.agents/skills/clerk-nextjs-patterns/`: Next.js App Router ClerkProvider session and theme integration.

---

## Existing Code Inspected
1. `app/layout.tsx`:
   - Statically hardcodes `theme: dark` in `ClerkProvider appearance`.
   - Hardcodes static dark Tailwind utility classes (`bg-[#0B0D13]`, `text-slate-300`, `border-white/[0.1]`) on all Clerk popover and modal elements (`userButtonPopoverCard`, `organizationSwitcherPopoverCard`, `card`, `modalContent`, etc.).
2. `components/layout/topbar.tsx`:
   - Mounts `<OrganizationSwitcher />` and `<UserButton />`.
   - Hardcodes static classes without passing dynamic `baseTheme` or `variables` based on the active theme from `useTheme()`.
3. `components/theme/theme-provider.tsx`:
   - Manages client-side theme (`dark`, `light`, `system`) and synchronizes `document.documentElement` attributes (`data-theme`, `class`, `colorScheme`).
   - Does not currently synchronize the theme state to a cookie for SSR alignment in `app/layout.tsx`.
4. `app/globals.css`:
   - Lacks comprehensive scoped overrides for Clerk popover internals (e.g. `.cl-userPreviewMainIdentifier`, `.cl-userButtonPopoverActionButton`, `.cl-organizationSwitcherPopoverActionButton`, `.cl-organizationListItemButton`, `.cl-userButtonPopoverFooter`).

---

## Root Causes Identified
1. **Hardcoded Static Dark Theme in `ClerkProvider`**: `app/layout.tsx` passes `theme: dark`, which forces Clerk's internal dark stylesheet onto all portal popovers.
2. **Missing Dynamic Appearance on Topbar Components**: `<OrganizationSwitcher />` and `<UserButton />` in `topbar.tsx` do not bind to `useTheme()` to supply dynamic `baseTheme: isDark ? dark : undefined` and matching color variables.
3. **Incomplete CSS Scoping on Clerk Portals**: Clerk popovers render inside portals appended to `document.body`. When in Day Light mode, Clerk's popover internal action buttons, identifiers, and footer stay dark due to default Clerk dark styling rules.

---

## Decisions & Implementation Strategy

### 1. Dynamic Appearance in `components/layout/topbar.tsx` (Client Component)
- Utilize `useTheme()` hook:
  ```tsx
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  ```
- Pass dynamic `appearance` to both `<OrganizationSwitcher />` and `<UserButton />`:
  - `baseTheme`: `isDark ? dark : undefined`
  - `variables`:
    - `colorPrimary`: `#FF2A85`
    - `colorBackground`: `isDark ? "#0B0D13" : "#FFFFFF"`
    - `colorForeground`: `isDark ? "#F8FAFC" : "#0B0F19"`
    - `colorNeutral`: `isDark ? "#F8FAFC" : "#0B0F19"`
    - `colorMutedForeground`: `isDark ? "#94A3B8" : "#475569"`
    - `colorInput`: `isDark ? "#121622" : "#EAEFF8"`
    - `colorBorder`: `isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.1)"`
  - `elements`:
    - Full semantic class mapping for trigger, popover card, actions, action buttons, identifier texts, and footers using `bg-theme-card`, `bg-theme-elevated`, `text-theme-primary`, `text-theme-secondary`, and `border-theme-subtle`.

### 2. Cookie Synchronization in `components/theme/theme-provider.tsx` & `app/layout.tsx`
- In `theme-provider.tsx`, write `neon-theme` cookie whenever theme changes so server-side rendering in `app/layout.tsx` aligns with the user's preference on page load.
- In `app/layout.tsx`, read `neon-theme` cookie via `await cookies()`, passing `baseTheme: isServerDark ? dark : undefined` to `ClerkProvider`.
- Remove static dark colors (`bg-[#0B0D13]`, `border-white/...`) from `app/layout.tsx` element defaults in favor of semantic CSS variable classes.

### 3. Comprehensive Dual-Theme CSS for Clerk Portals in `app/globals.css`
- Add high-specificity selectors for `.cl-userButtonPopoverCard`, `.cl-organizationSwitcherPopoverCard`, `.cl-modalContent`, and their sub-elements:
  - In `html.light`: Pure White Card (`#FFFFFF`), Day Frost highlights (`#EAEFF8`), Deep Charcoal typography (`#0B0F19`), Subtle slate borders (`rgba(15, 23, 42, 0.09)`), and Light Gray footers (`#F8FAFC`).
  - In `html.dark`: Obsidian Card (`#0B0D13`), Cyber Glass highlights (`#121622`), Slate White typography (`#F8FAFC`), Subtle frost borders (`rgba(255, 255, 255, 0.08)`), and Void Black footers (`#060709`).

---

## Files to Change
1. `components/theme/theme-provider.tsx`: Add cookie persistence (`neon-theme`) alongside `localStorage`.
2. `app/layout.tsx`: Read theme cookie for SSR and remove hardcoded static dark colors from `ClerkProvider`.
3. `components/layout/topbar.tsx`: Bind `<OrganizationSwitcher />` and `<UserButton />` to `useTheme()` with dynamic `baseTheme` and `variables`.
4. `app/globals.css`: Add comprehensive dual-theme portal overrides for all Clerk popover elements.

---

## Design System & Visual Adherence
- **Cyber Dark Mode**: Void Black `#060709`, Obsidian `#0B0D13`, glowing `#FF2A85` Neon Pink accents, `#F8FAFC` typography.
- **High-Contrast Day Mode**: Solar Ice `#F4F6FB`, Pure White `#FFFFFF`, Day Frost `#EAEFF8`, Deep Charcoal `#0B0F19` typography.
- **Touch Ergonomics**: All popover action buttons and trigger items satisfy $\ge 48 \times 48\text{ px}$ mobile tap areas or standard compact desktop popover padding ($36\text{–}44\text{ px}$).

---

## Acceptance Criteria
- [ ] Clicking the `OrganizationSwitcher` in Day Light mode displays a crisp white card with dark charcoal text and light hover states.
- [ ] Clicking the `UserButton` (profile avatar) in Day Light mode displays a crisp white card with dark charcoal text, light hover action items ("Manage account", "Sign out"), and light footer.
- [ ] In Cyber Dark mode, both popovers render in obsidian dark with slate-white text and neon pink highlights.
- [ ] Toggling the theme instantly adapts both popovers without requiring a page refresh.
- [ ] Zero TypeScript errors (`npx tsc --noEmit`).
- [ ] Zero ESLint errors or warnings (`npm run lint`).
- [ ] Production build succeeds cleanly (`npm run build`).

---

## Checks to Run
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `/` (Fleet Cockpit).
2. Toggle theme to **High-Contrast Day Mode** (sun icon).
3. Click the **Organization Switcher** in the topbar:
   - Verify the popover card is pure white (`#FFFFFF`) with dark text and subtle slate borders.
   - Hover over organization items to verify light gray/frost hover highlights.
4. Click the **User Button** (profile avatar):
   - Verify the user preview shows user name and email in deep charcoal.
   - Verify "Manage account" and "Sign out" buttons have dark text and light hover backgrounds.
   - Verify the popover footer is light gray (`#F8FAFC`).
5. Toggle back to **Cyber Dark Mode** (moon icon):
   - Click both popups and verify they render in obsidian dark with glowing pink accents.
