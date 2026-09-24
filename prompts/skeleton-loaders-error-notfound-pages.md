# Skeleton Loaders, Error Boundaries & Not-Found Pages

## Goal
Add full-app loading states via Next.js `loading.tsx` per-segment skeleton screens,
a global `error.tsx` boundary, route-level `error.tsx` boundaries for data-heavy pages,
and a global `not-found.tsx` — all strictly following the Cyber Black / Neon Pink design system.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` — shadcn Skeleton primitive usage
- `.agents/skills/clerk-nextjs-patterns/` — Server Component patterns, page structure

---

## Existing Code Inspected
- `app/layout.tsx` — Root layout, ClerkProvider, html/body
- `app/page.tsx` — Home / Fleet Cockpit (server, awaits `syncUserAndOrgFromClerk` + `getSitesForOrg`)
- `app/analytics/page.tsx` — Analytics page (server, awaits org + sites + hourlyTelemetry)
- `app/maintenance/page.tsx` — Maintenance Hub (server, awaits org + sites + services + tickets)
- `app/sites/[id]/page.tsx` — Site detail (server, awaits org + siteDetails + hourlyTelemetry)
- `app/sites/[id]/bess|dg|grid|load|solar/page.tsx` — Subsystem pages
- `app/subscription/page.tsx` — Subscription page (server, awaits org sync + sites)
- `components/ui/skeleton.tsx` — DOES NOT EXIST yet; must be created
- No `loading.tsx`, `error.tsx`, or `not-found.tsx` files exist anywhere

---

## Decisions & Assumptions
1. **Skeleton primitive**: Create `components/ui/skeleton.tsx` using the shadcn pattern (`animate-pulse bg-white/[0.06] rounded`), themed to Obsidian dark.
2. **loading.tsx placement**:
   - `app/loading.tsx` — Root-level fallback (covers `/`)
   - `app/analytics/loading.tsx`
   - `app/maintenance/loading.tsx`
   - `app/sites/[id]/loading.tsx` — Covers all subsystem pages under `[id]`
   - `app/subscription/loading.tsx`
3. **Skeleton layouts** are context-aware — each mimics the real page's visual structure (header strip, card grid, chart areas, etc.) so there is no layout shift on load.
4. **error.tsx** — Must be `"use client"` (Next.js requirement). Two levels:
   - `app/error.tsx` — Global catch-all
   - `app/sites/[id]/error.tsx` — Handles DB miss / notFound for a specific site
5. **not-found.tsx**:
   - `app/not-found.tsx` — Global 404 page with Neon Pink design, back-to-fleet CTA button
6. Sign-in / sign-up pages are Clerk-rendered and do not need loading skeletons.
7. The `design-system` page is a dev tool; skip loading.tsx for it.

---

## Files to Create / Change

### New files:
| File | Purpose |
|---|---|
| `components/ui/skeleton.tsx` | Base skeleton primitive |
| `app/loading.tsx` | Home page (Fleet Cockpit) skeleton |
| `app/analytics/loading.tsx` | Analytics workspace skeleton |
| `app/maintenance/loading.tsx` | Maintenance hub skeleton |
| `app/sites/[id]/loading.tsx` | Site detail + all subsystem pages skeleton |
| `app/subscription/loading.tsx` | Subscription page skeleton |
| `app/not-found.tsx` | Global 404 page |
| `app/error.tsx` | Global runtime error boundary (client component) |
| `app/sites/[id]/error.tsx` | Site-level error boundary (client component) |

---

## Implementation Requirements

### 1. `components/ui/skeleton.tsx`
```tsx
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/[0.06]",
        className
      )}
      {...props}
    />
  )
}
export { Skeleton }
```

### 2. `app/loading.tsx` — Fleet Cockpit Skeleton
Wraps in `NeonAppShell`. Skeleton mimics:
- Header welcome strip (full-width card with 2px top gradient line, 2 text lines, role badge)
- Fleet aggregate metric strip (5 glowing stat blocks in a row)
- 3 site cards (each with header badge row, 3 metric rows, mini asset badge strip)
All blocks: `bg-[#0B0D13] border border-white/[0.08] rounded-xl`

### 3. `app/analytics/loading.tsx` — Analytics Skeleton
Wraps in `NeonAppShell`. Skeleton mimics:
- Page title + breadcrumb line
- Site selector tab row (4 tab pills)
- Range selector (4 button pills)
- Large stacked area chart placeholder (h-64, full width)
- 3 KPI metric cards row (arbitrage, RTE, CO2)

### 4. `app/maintenance/loading.tsx` — Maintenance Skeleton
Wraps in `NeonAppShell`. Skeleton mimics:
- Page title + breadcrumb
- Active tickets row (2 ticket cards, each with status badge, title, date)
- Service catalog grid (4 service cards in 2x2 grid)

### 5. `app/sites/[id]/loading.tsx` — Site Detail Skeleton
Wraps in `NeonAppShell`. Skeleton mimics:
- Site name breadcrumb + status badge
- Energy flow canvas placeholder (large square, `h-96`)
- Subsystem telemetry tabs strip (5 tab pills)
- 2-column stats grid below

### 6. `app/subscription/loading.tsx` — Subscription Skeleton
Wraps in `NeonAppShell`. Skeleton mimics:
- Page header card
- 3 tier plan cards side by side (each with title, price, 4 feature rows, CTA button)

### 7. `app/not-found.tsx`
- Full-page centered layout on `bg-[#060709]`
- Large `404` in font-mono, color `#FF2A85`, with `text-glow` effect
- Subtitle: `"Signal Lost — Page Not Found"` in slate-300
- Small description: `"This route doesn't exist in the NEON Energy grid."`
- Pink `<Link href="/">` button: `"← Return to Fleet Cockpit"` styled as primary button
- Animated subtle background: single horizontal scan line animation via `@keyframes` in a `<style>` tag

### 8. `app/error.tsx` — Global Error Boundary (`"use client"`)
Props: `{ error: Error & { digest?: string }, reset: () => void }`
- Same centered Void Black layout as not-found
- Icon: `AlertTriangle` from lucide-react in `#FF1744` (Neon Red)
- Title: `"System Fault Detected"`
- Show `error.message` in a `font-mono text-xs text-slate-500` code block
- Show `error.digest` if present (Vercel error ID for support)
- Two buttons: `"Retry"` (calls `reset()`, primary pink) and `"← Fleet Cockpit"` (`href="/"`, secondary)

### 9. `app/sites/[id]/error.tsx` — Site Error Boundary (`"use client"`)
Same structure as global error.tsx but:
- Title: `"Telemetry Feed Error"`  
- Description: `"Unable to load site data. The BESS or solar telemetry stream may be unavailable."`
- Retry button calls `reset()`
- Secondary link: `"← Back to Fleet"` → `href="/"`

---

## Design System & Visual Adherence
- Background: `#060709` Void Black
- Cards: `bg-[#0B0D13] border border-white/[0.08]`
- Skeleton fill: `bg-white/[0.06]` with `animate-pulse`
- Error accent: `#FF1744` Neon Red for error icon
- 404 accent: `#FF2A85` Neon Pink for the "404" numeral
- All button CTA: min `h-12` for mobile touch ergonomics
- `font-mono` on all numeric/metric skeleton blocks

---

## Security & RBAC
- All loading.tsx and error.tsx files are UI-only with no data access — no auth checks needed.
- not-found.tsx is public — no auth checks needed.

---

## Acceptance Criteria
- [ ] Navigating to any server page shows the skeleton immediately, then transitions to real content with zero layout shift
- [ ] Navigating to `/xyz-does-not-exist` shows the custom not-found page (not Vercel's generic 404)
- [ ] Throwing in a page (e.g. DB failure) shows the error boundary with retry button, not a white crash screen
- [ ] Clicking Retry on the error page re-runs the server fetch
- [ ] All skeletons match the real page's column/row layout structure exactly
- [ ] Desktop (1440px) and mobile (390px) both render skeleton layouts correctly
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run lint` passes with 0 errors

---

## Checks to Run
```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual Test Steps

### Desktop (1440px):
1. Open DevTools → Network → set throttling to "Slow 3G"
2. Navigate to `/` — verify Fleet Cockpit skeleton appears immediately
3. Navigate to `/analytics` — verify chart area skeleton
4. Navigate to `/maintenance` — verify service card skeleton grid
5. Navigate to `/sites/<id>` — verify flow canvas + tab skeleton
6. Navigate to `/subscription` — verify 3-tier plan skeleton
7. Navigate to `/this-does-not-exist` — verify Neon Pink 404 page
8. In `app/page.tsx`, temporarily `throw new Error("test")` → verify error boundary with retry

### Mobile (390px):
9. Repeat steps 2–7 on mobile viewport
10. Verify skeletons stack vertically, no horizontal overflow
11. Verify 404 and error pages are readable and CTA buttons are ≥48px tall
