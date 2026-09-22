# Implementation Prompt: Org Switcher Visibility Restriction & Expanded Variety of Demo Sites

## Goal
1. **Restrict Organization Switcher**:
   - Only display the `<OrganizationSwitcher />` in the topbar for users belonging to the master/admin organization **`org_3JgZ51s2g9LkRRE0L61kAXDGDWE`** (`iRasus Technologies`).
   - For all other organization users, hide the switcher completely when signed in (showing a sleek static organization badge instead).
   - Preserve Clerk's sign-up workflow where new users still get the organization creation/joining step on registration.
2. **Expand Demo Site Variety in Database (`public.sites`)**:
   Add 3 new diverse site configurations to `org_3JgZ51s2g9LkRRE0L61kAXDGDWE` in Supabase PostgreSQL:
   - **Site 4: DG + Solar + Load (Islanded Peaker)**: `has_solar: true, has_bess: false, has_dg: true, has_grid: false`.
   - **Site 5: BESS + Solar + Load (Zero-Emission Islanded Microgrid)**: `has_solar: true, has_bess: true, has_dg: false, has_grid: false`.
   - **Site 6: Expired Subscription Installation**: `has_solar: true, has_bess: true, has_dg: false, has_grid: true, subscription_status: 'expired', status: 'offline'`.
3. **UI Enhancements**:
   - Update `SiteCockpitCard` to render distinct asset combination tags (`ISLANDED`, `DG PEAKER`, `100% CLEAN STORAGE`) and an amber/red glowing `EXPIRED` badge for lapsed subscriptions with renewal hints.
   - Seed hardware devices, snapshots, and 30-day hourly telemetry for each new site.

---

## Relevant Agent Skills
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Organization switcher gating, `useAuth()`, `orgId`, and multi-tenant access control.
- `.agents/skills/supabase/` (`SKILL.md`): Schema evolution, adding `subscription_status` column, and seeding.
- `.agents/skills/supabase-postgres-best-practices/` (`SKILL.md`): Constraint handling, schema integrity, and indexing.
- `.agents/skills/shadcn/` (`SKILL.md`): Badges, tooltips, cyber card styling, and touch ergonomics.

---

## Existing Code Inspected
1. `components/layout/topbar.tsx`: Currently renders `<OrganizationSwitcher />` unconditionally.
2. `components/design-system/site-cockpit-card-preview.tsx`: Renders site cards with asset icons and status. Needs support for `subscription_status` (expired badge) and islanded asset combinations (no grid).
3. `lib/energy/types.ts`: `SiteRecord` needs `subscription_status?: 'active' | 'past_due' | 'expired'` and `has_grid: boolean`.
4. `scripts/seed-org-data.js`: Populates demo data. Needs to seed the 3 new diverse installations.

---

## Decisions or Assumptions
1. **Org Switcher Gating**:
   - In `components/layout/topbar.tsx`, use `useAuth()` to check `orgId`.
   - Constant: `const MASTER_ORG_ID = "org_3JgZ51s2g9LkRRE0L61kAXDGDWE";`
   - If `orgId === MASTER_ORG_ID`: Render `<OrganizationSwitcher hidePersonal={false} />`.
   - If `orgId !== MASTER_ORG_ID`: Render a static Cyber badge with the current tenant's organization name or a lock indicator, preventing tenant hopping.
2. **Schema Migration for Subscription Status**:
   - Add `subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'expired'))` to `public.sites`.
   - Run SQL directly on live database (`mzumlzmfjgzvycebqask`).
3. **The 6 Comprehensive Demo Sites for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`**:
   1. **Bakersfield Central Solar-Plus-Storage**: Solar + BESS + Grid (no DG).
   2. **Mojave Desert Industrial Microgrid Alpha**: Solar + BESS + DG + Grid (Full Microgrid).
   3. **Sonora Valley Agri-Voltaics & Peaker**: Solar + DG + Grid (no BESS).
   4. **Sierra Nevada Remote Camp Microgrid**: Solar + DG + Load (Islanded, NO BESS, NO Grid).
   5. **Coachella Zero-Emission Islanded Hub**: Solar + BESS + Load (Islanded, NO DG, NO Grid).
   6. **Redwood Coast Hybrid Peaker (Expired)**: Solar + BESS + Grid (`subscription_status: 'expired'`, `status: 'offline'`).
4. **Site Card Visuals**:
   - Expired sites display a glowing `EXPIRED` badge (`bg-amber-500/20 text-amber-400 border-amber-500/40`), dimmed card surface (`opacity-75`), and action button `"Renew Subscription"`.
   - Off-grid sites display an `ISLANDED` badge and omit grid import/export metrics.

---

## Files Likely to Change / Be Created
1. `supabase/migrations/0004_add_subscription_status_to_sites.sql`: Migration adding `subscription_status` column to `public.sites`.
2. `scripts/expand-demo-sites.js`: Script to apply migration and seed Sites 4, 5, and 6 with devices, snapshots, and telemetry.
3. `lib/energy/types.ts`: Update `SiteRecord` interface.
4. `components/layout/topbar.tsx`: Implement master organization switcher condition.
5. `components/design-system/site-cockpit-card-preview.tsx`: Support `subscription_status` and islanded off-grid rendering.
6. `app/page.tsx`: Update mapping to pass `subscription_status`.

---

## Design System & Visual Adherence
- Void Black `#060709`, Obsidian `#0B0D13`, Elevated Glass `#121622`.
- Neon Pink `#FF2A85` for primary accents, Vivid Amber `#FFAB00` for expired warnings, Cyber Emerald `#00E676` for active.
- Monospace font (`font-mono`) for all electrical units.
- Minimum $48 \times 48\text{ px}$ mobile touch target ergonomics.

---

## Security & RBAC Requirements
- Master switcher gated strictly to `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.
- Non-master tenants cannot view or select peer organizations.
- RLS remains active across all tables.

---

## Acceptance Criteria
- [ ] Organization switcher is visible ONLY for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`.
- [ ] For any other organization user, the switcher is hidden and replaced by a static organization badge.
- [ ] `public.sites` contains 6 distinct demo sites for `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`:
  - Site 4: Just DG + Solar + Load (Off-grid islanded).
  - Site 5: Just BESS + Solar + Load (Off-grid zero emissions).
  - Site 6: Expired Subscription site (`subscription_status = 'expired'`).
- [ ] Fleet Cockpit renders all 6 sites with appropriate badges (`ISLANDED`, `EXPIRED`).
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to Run
1. `node scripts/expand-demo-sites.js`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Open [`http://localhost:3000/`](http://localhost:3000/) while logged in under `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`:
   - Verify Organization Switcher IS visible in the topbar.
   - Verify the Fleet Cockpit displays 6 diverse installations:
     - **Sierra Nevada Remote Camp Microgrid**: Shows Solar & DG, no Grid, marked `ISLANDED`.
     - **Coachella Zero-Emission Islanded Hub**: Shows Solar & BESS, no DG, no Grid, marked `ISLANDED`.
     - **Redwood Coast Hybrid Peaker**: Marked with glowing `EXPIRED` badge and dimmed card.
2. Sign out or inspect with another user / org:
   - Verify Organization Switcher is completely hidden from the topbar.
3. Mobile Viewport Test ($390 \times 844$):
   - Verify touch ergonomics and card responsiveness.
