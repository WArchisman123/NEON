# Implementation Prompt: Remove Fleet Health Marquee Ticker from Topbar

## Goal
Remove the static hardcoded desktop fleet health marquee ticker (`Fleet Normal | Live Power: 3.42 MW | Fleet SoC: 78.4% | Net Grid: -420 kW`) from the topbar component in `components/layout/topbar.tsx`.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (`SKILL.md`): Layout primitives, spacing, and styling standards.

---

## Existing Code Inspected
- `components/layout/topbar.tsx`:
  - Contains lines 58–76 rendering `{/* Center: Live Fleet Health Marquee (Desktop) */}` inside `<div className="hidden xl:flex items-center gap-4 px-3.5 py-1.5 rounded-full bg-[#121622] border border-white/[0.06] text-xs font-mono">...</div>`.
  - The ticker displays hardcoded placeholder metrics (`Fleet Normal`, `Live Power: 3.42 MW`, `Fleet SoC: 78.4%`, `Net Grid: -420 kW`) which are redundant with the dynamic 5-metric glowing fleet aggregate strip on the main cockpit page.

---

## Decisions or Assumptions
1. **Remove Entire Center Marquee Element**:
   - The user provided the full text string of the center ticker (`Fleet Normal | Live Power: 3.42 MW | Fleet SoC: 78.4% | Net Grid: -420 kW`) requesting its removal.
   - Removing the entire center ticker cleans up the topbar across all desktop breakpoints (it was already `hidden` below `xl`).
   - The flex layout of `topbar.tsx` (`flex items-center justify-between`) will cleanly preserve the left brand + organization area and the right search/notifications/profile cluster without layout shifts.

---

## Files Likely to Change
1. `components/layout/topbar.tsx`: Remove the center ticker `div` (lines 58–76).

---

## Implementation Requirements
- Delete lines 58–76 in `components/layout/topbar.tsx`.
- Ensure clean JSX syntax and no dangling comments or unused elements.
- Maintain topbar styling (`bg-[#0B0D13]/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between`).

---

## Design System & Visual Adherence
- Void Black `#060709` / Obsidian `#0B0D13` styling remains intact.
- Left and right header action clusters maintain consistent padding, alignment, and hover effects.
- Minimum 48px touch ergonomics preserved for mobile.

---

## Security & RBAC Requirements
- Preserves Clerk user authentication buttons and organization switcher gating unchanged.

---

## Acceptance Criteria
- [ ] Center fleet health marquee ticker (`Fleet Normal | Live Power: 3.42 MW | Fleet SoC: 78.4% | Net Grid: -420 kW`) is completely removed from `components/layout/topbar.tsx`.
- [ ] Left brand & organization section and right search / alert bell / user button section remain visually balanced and fully functional.
- [ ] `npm run typecheck` passes with 0 errors.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npm run build` succeeds without build errors.

---

## Checks to Run
1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Desktop Viewport ($1440 \times 900$)**:
   - Navigate to `/`.
   - Inspect the sticky topbar at the top of the screen.
   - Confirm that the brand logo and organization switcher are on the far left, and search bar, notification bell, and user avatar are on the far right.
   - Confirm that the center ticker bar (`Fleet Normal | Live Power...`) is no longer present.
2. **Mobile Viewport ($390 \times 844$)**:
   - Inspect the sticky topbar on mobile.
   - Confirm that the mobile layout remains clean, responsive, and free of clutter or overflow.
