# Implementation Prompt: Subscription Management Page, Renewal Calculator & Home Page Telemetry Search

## Goal
Implement a complete subscription management and site renewal workflow alongside a real-time search engine on the Fleet Cockpit home page:
1. **Subscription Management Page (`/subscription`)**:
   - A dedicated dashboard view showing the organization's subscription tier, overall license quotas, and an interactive site subscription matrix showing each site's status (`ACTIVE`, `EXPIRED`, `PAST_DUE`), nameplate capacities, billing cycle dates, and calculated license rates.
2. **Renewal Subscription Feature (Calculator & Checkout Simulator)**:
   - Dynamic capacity-based rate calculation (Starter, Pro Commercial, Utility Enterprise) from `public/context/doc.md`.
   - Monthly vs Annual term selection (with 17% discount).
   - High-performance add-on toggles (1-sec Modbus polling, automated NFPA 855 compliance reporting, 24/7 emergency SLA).
   - Itemized transparent invoice breakdown (Base fee, Add-ons, Term discount, Taxes, Total Due in Neon Pink `font-mono`).
   - "Proceed to Checkout" button that updates `subscription_status` to `'active'` in Supabase PostgreSQL via the existing API (`PUT /api/v1/sites/:id`), displays an order confirmation modal with an invoice ID, and live-refreshes site state.
   - Accessible via the "Renew Subscription" button on expired site cards on `/`, directly on `/subscription`, and via deep link.
3. **Home Page Real-Time Search Engine**:
   - Instant search input bar on `/` (`FleetCockpitView`) filtering installations by name, city, state, capacity (kWp/kWh), and asset combination.
   - Keyboard shortcut (`⌘K` / `Ctrl+K` / `/`) and Topbar search button integration.
   - Cyber obsidian empty state with "Clear Filters" button when no results match.
4. **Navigation Integration**:
   - Add "Subscriptions" (`CreditCard` icon) to `DesktopSidebar`.
   - Make the `PRO` badge in `Topbar` navigate to `/subscription`.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (`SKILL.md`): Form controls, modals, tabs, badges, cards, and responsive drawers.
- `.agents/skills/clerk-orgs/` (`SKILL.md`): Tenant scoping with `orgId`, role claims, and organization context.
- `.agents/skills/supabase/` (`SKILL.md`): PostgreSQL data updates and RLS integrity.

---

## Existing Code Inspected
1. `components/dashboard/fleet-cockpit-view.tsx`:
   - Contains `activeFilter` tabs (`all`, `solar`, `bess`, `dg`, `islanded`).
   - Lacks `searchQuery` state and search input UI.
2. `components/design-system/site-cockpit-card-preview.tsx`:
   - Line 427–438: Renders `"Renew Subscription"` link when `isExpired` is true, but links directly to `/sites/${site.id}`.
3. `components/layout/topbar.tsx`:
   - Contains a static search button with `⌘K` shortcut and static `PRO` badge.
4. `components/layout/desktop-sidebar.tsx`:
   - Lacks a link to `/subscription`.
5. `app/api/v1/sites/[id]/route.ts`:
   - `PUT` handler already allows updating `subscription_status` and `status` in `public.sites`.
6. `lib/energy/types.ts`:
   - `SiteRecord` already contains `subscription_status?: 'active' | 'past_due' | 'expired'`.

---

## Decisions or Assumptions
1. **Tier Pricing Model (from `public/context/doc.md` Section 3.1)**:
   - **Starter** ($\le 500\text{ kWp / kWh}$): **$199 / mo** ($1,990 / yr)
   - **Pro Commercial** ($\le 2,500\text{ kWp / kWh}$): **$599 / mo** ($5,990 / yr)
   - **Utility Enterprise** ($> 2,500\text{ kWp / kWh}$): **$1,499 / mo** ($14,990 / yr)
2. **Add-on Services**:
   - ⚡ 1-Sec High-Frequency Modbus Stream: **+$49 / mo** ($490 / yr)
   - 🛡️ Automated NFPA 855 Compliance & Fire Safety Log: **+$99 / mo** ($990 / yr)
   - 📞 24/7 Rapid Emergency Dispatch SLA: **+$149 / mo** ($1,490 / yr)
3. **No Payment Gateway Yet**:
   - In accordance with the prompt ("no payment gateway yet, just calculate and show proceed to checkout button"), clicking "Proceed to Checkout" triggers an simulated authorization animation, updates the database record to `'active'` via `PUT /api/v1/sites/[id]`, logs an invoice confirmation reference, and refreshes the data without errors.
4. **Modal vs In-Page Renewal**:
   - Create a reusable `RenewalSubscriptionModal` component that can be opened from the Home Page site card ("Renew Subscription" button), from `/subscription` ("Renew Now" button), or via URL query parameter `?renew=<siteId>`.
5. **Search Interaction**:
   - Typing in the search input on the Home Page filters the live site list in memory immediately with 0ms latency.
   - Pressing `⌘K` or clicking the Topbar search button focuses the search input or opens the quick-filter.

---

## Files Likely to Change / Be Created
1. `components/subscription/renewal-subscription-modal.tsx` (New):
   - Capacity evaluation, billing term selector (monthly/annual), add-on checkboxes, live cost calculator, and "Proceed to Checkout" button with order confirmation.
2. `app/subscription/page.tsx` (New):
   - Server Component fetching organization sites, rendering org tier overview, site subscription matrix, and subscription tier comparison cards.
3. `components/subscription/subscription-view.tsx` (New):
   - Client component managing site subscription status table, status filtering (`All`, `Active`, `Expired`), and opening the renewal modal.
4. `components/dashboard/fleet-cockpit-view.tsx` (Update):
   - Add search input bar with search icon, clear button, result count badge, and empty state.
   - Wire up `RenewalSubscriptionModal` for expired site cards.
5. `components/design-system/site-cockpit-card-preview.tsx` (Update):
   - Accept `onRenew?: (site: SiteData) => void` and wire up the "Renew Subscription" button and banner.
6. `components/layout/desktop-sidebar.tsx` (Update):
   - Add `Subscriptions` (`/subscription`) navigation link with `CreditCard` icon.
7. `components/layout/topbar.tsx` (Update):
   - Make `PRO` badge link to `/subscription`.
   - Wire up search button and `⌘K` keyboard event listener to focus search.

---

## Design System & Visual Adherence
- Void Black `#060709` background, Obsidian `#0B0D13` card surfaces, Elevated `#121622` modals.
- Neon Pink `#FF2A85` primary actions, Cyber Emerald `#00E676` for active subscriptions, Vivid Amber `#FFAB00` for expired warnings.
- `font-mono` on all currency, capacity, and rate calculations (`$599/mo`, `2,500 kWp`, `NEON-SUB-82910`).
- Minimum $48 \times 48\text{ px}$ mobile touch target ergonomics on all buttons and toggles.

---

## Security & RBAC Requirements
- Scoped strictly to the authenticated user's active Clerk organization (`orgId`).
- `PUT /api/v1/sites/:id` validates payload and enforces org boundaries.
- No direct client-side raw SQL queries.

---

## Acceptance Criteria
- [ ] Navigating to `/subscription` displays the organization's subscription overview and full list of sites with their subscription status (`ACTIVE`, `EXPIRED`).
- [ ] "Subscriptions" link appears in the desktop sidebar with active route highlighting.
- [ ] Topbar `PRO` badge links to `/subscription`.
- [ ] On the Home page (`/`), the search bar instantly filters sites by site name, city, state, capacity, or keywords.
- [ ] Pressing `Cmd+K` / `Ctrl+K` or clicking search in the topbar focuses the search input.
- [ ] Clicking "Renew Subscription" on an expired site card (or "Renew Now" on `/subscription`) opens the Renewal Subscription Modal.
- [ ] The Renewal modal dynamically computes the base tier rate based on capacity, adjusts for monthly vs annual, updates for add-ons, and displays the itemized total.
- [ ] Clicking "Proceed to Checkout" simulates checkout, updates the site's status to `active` via the API, displays the confirmation card, and refreshes the site list.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to Run
1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Search on Home Page**:
   - Go to `/`.
   - In the search bar, type `Redwood` $\to$ only `Redwood Coast Hybrid Peaker` appears.
   - Type `Bakersfield` $\to$ only `Bakersfield Central Solar-Plus-Storage` appears.
   - Type `Fresno` $\to$ only `Sonora Valley Agri-Voltaics & Peaker` appears.
   - Press `Esc` or click the clear button $\to$ all sites reappear.
2. **Subscription Management Page**:
   - Click "Subscriptions" in the sidebar (or navigate to `/subscription`).
   - Observe the Organization Tier overview card and the table/cards of all 6 sites with status badges.
   - Filter by "Expired / Action Required" $\to$ displays expired sites (e.g. Redwood Coast).
3. **Renewal Calculation & Checkout**:
   - Click "Renew Now" on the expired site.
   - Modal opens with calculated Pro Commercial tier ($599/mo).
   - Toggle "Annual Billing (Save 17%)" $\to$ verify discounted rate ($499/mo billed as $5,990/yr).
   - Check "Automated NFPA 855 Compliance Log" $\to$ verify cost updates in real time.
   - Click "Proceed to Checkout" $\to$ verify loading state, order confirmation receipt, and that the site status changes to `ACTIVE` without page reload.
