# Implementation Prompt: Phase 4 — Fleet-Wide Specific Yield Leaderboard & Warranty Watchlist

## Goal
Implement **Phase 4** of the Competitor Gap Analysis and Feature Placement Strategy (`ref_img_1.png` fleet rollup):
1. **Portfolio Specific Yield & CUF Leaderboard** (`FleetSpecificYieldLeaderboard.tsx`):
   - Normalized ranking across all portfolio plants by **Specific Yield ($kWh/kWp$)** and **CUF (%)**.
   - Rank badges (#1 Gold, #2 Silver, #3 Bronze, etc.) and visual horizontal comparison bars.
   - Comprehensive metrics: Site Name, City/State, DC/AC Ratio, Today's Yield ($kWh$), Specific Yield ($kWh/kWp$), CUF %, Annual Target Achieved %, and Live Operational Status.
   - Sorting options: Specific Yield (High to Low / Low to High), CUF %, Capacity, and Annual Target %.
2. **EPC Commissioning & Warranty Expiration Watchlist** (`FleetWarrantyWatchlist.tsx`):
   - Proactive portfolio O&M monitoring tracking sites with warranties or service agreements expiring within 30, 60, or 90 days.
   - Displays EPC Vendor (`Tata Power Solar`, `Sterling & Wilson`, `L&T Solar`), Commissioning Date, Warranty Expiration Date, Days Remaining countdown pill with severity-coded colors (`<30d` Red, `30-60d` Amber, `60-90d` Cyan).
   - Direct 1-click CTA: "Schedule Warranty Inspection" linking into the `/maintenance` booking wizard.
3. **Fleet Cockpit View Modes & Sorting Enhancements**:
   - Add view mode toggle on Fleet Cockpit: **Grid Cards View** vs **Leaderboard & Benchmarking View**.
   - Enhanced filter & sort controls: sort by Specific Yield, CUF %, Capacity, or Warranty Urgency.
   - Fleet-wide Annual PPA Target tracker with run-rate pacing and achievement indicators.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: Tabs, cards, table rows, progress bars, tooltips, responsive grids.
- `.agents/skills/clerk-orgs/`: Multi-tenant organization scoping and RBAC permissions.
- `.agents/skills/supabase/`: Site master records and telemetry rollups.

---

## Existing Code Inspected
- `prompts/competitor-feature-gap-analysis-and-placement-strategy.md`: Master Gap Analysis roadmap.
- `components/dashboard/fleet-cockpit-view.tsx`: Fleet Cockpit layout with aggregates, search, and site cards.
- `components/design-system/site-cockpit-card-preview.tsx`: Individual site card preview with CUF and Specific Yield badges.
- `lib/energy/types.ts`: SiteRecord, SiteData, and enriched telemetry fields.
- `lib/energy/site-service.ts`: Site enrichment with CUF, specific yield, and commissioning fields.

---

## Decisions & Assumptions
1. **Normalized Performance Benchmarking**: In utility and C&I solar, comparing raw kWh is misleading because a 1 MW plant produces 10x more energy than a 100 kW plant. Specific Yield ($kWh/kWp$) is the universal industry standard for benchmarking fleet efficiency regardless of system size.
2. **Dual-Theme Design System Consistency**:
   - In Cyber Dark Mode: Obsidian surfaces (`#0B0D13`), Cyber Glass (`#121622`), glowing `#FF2A85` Neon Pink accents, Electric Amber (`#FFD600`) for top yields, Laser Cyan (`#00F0FF`) for CUF %, Cyber Emerald (`#00E676`) for normal status.
   - In High-Contrast Day Mode: Crisp Day White surfaces (`#FFFFFF`), Day Frost (`#EAEFF8`), Deep Charcoal typography (`#0B0F19`), High-Contrast Amber (`#D97706`).
3. **Ergonomic View Switching**: Fleet operators can toggle between visually rich **Grid Cards** (for status at a glance) and **Leaderboard Table** (for cross-site ranking, sorting, and export) with 1 click.
4. **Mobile Responsiveness**: On viewports $< 768px$, the leaderboard table converts into a mobile-first ranked card list with touch targets $\ge 48 \times 48\text{ px}$.

---

## Files Likely to Change & Created

### New Files
1. `components/dashboard/fleet-specific-yield-leaderboard.tsx`:
   - Ranked leaderboard component with sorting, relative performance bars, target progress dials, and one-click navigation to `/sites/[id]`.
2. `components/dashboard/fleet-warranty-watchlist.tsx`:
   - EPC warranty expiry monitoring drawer/card displaying expiring sites and direct booking links.

### Modified Files
1. `components/dashboard/fleet-cockpit-view.tsx`:
   - Add view mode switcher: Grid Cards vs Leaderboard View.
   - Add sort dropdown with Specific Yield and CUF % options.
   - Mount `FleetSpecificYieldLeaderboard` and `FleetWarrantyWatchlist`.

---

## Implementation Requirements

### 1. Specific Yield Fleet Leaderboard
- **Ranked Index**: #1 Gold, #2 Silver, #3 Bronze, followed by numerical badges.
- **Normalized Relative Gauge**: Horizontal bar indicating performance relative to the fleet-leader ($100\%$ width for #1).
- **Columns / Fields**:
  - Rank & Site Name (with city, state, and plant type)
  - Installed Capacity (DC kWp / AC kW) + DC/AC Overload Ratio
  - Today's Yield ($kWh$)
  - **Specific Yield ($kWh/kWp$)** (e.g. `5.12 kWh/kWp`)
  - **CUF %** (e.g. `21.3%`)
  - **PPA Annual Target %** (Radial progress ring or miniature bar)
  - EPC Vendor & Commissioning Date
  - Operational Status (`ONLINE`, `DEGRADED`, `OFFLINE`)
  - Direct action: "Open Command Center ➔"
- **Sort Options**:
  - Specific Yield (High to Low / Low to High)
  - CUF % (High to Low)
  - Solar Capacity (High to Low)
  - Target Progress (Low to High - flagging underperforming PPA sites)

### 2. EPC Warranty & Service Watchlist
- **Filter**: All sites, Expiring in 30 Days, Expiring in 60 Days, Expiring in 90 Days.
- **Card / Strip per Expiring Site**:
  - Site Name & Location
  - EPC Contractor (e.g. `Tata Power Solar`, `Sterling & Wilson`)
  - Commissioned Date & Warranty Expiration Date
  - Days Remaining countdown badge (`18 Days Left` in flashing red/amber)
  - Action button: `Schedule Inspection ➔` linking to `/maintenance` with pre-selected site.

### 3. Fleet Cockpit Master Integration
- Seamless toggle between:
  - `[🗂️ Site Cards View]`
  - `[🏆 Specific Yield Leaderboard]`
  - `[🛡️ Warranty Watchlist]`
- Preserve real-time search query across all views (e.g. searching `"Pune"` filters both cards and leaderboard).

---

## Design System & Visual Adherence
- **Cyber Dark Mode**: Void Black `#060709`, Obsidian `#0B0D13`, Cyber Glass `#121622`, Neon Pink `#FF2A85`, Electric Amber `#FFD600`.
- **High-Contrast Day Mode**: Solar Ice `#F4F6FB`, Pure White `#FFFFFF`, Day Frost `#EAEFF8`, Deep Charcoal `#0B0F19`.
- **Monospace Rule**: Strict `font-mono` on all $kWh/kWp$, $\%$, $kW$, $MWh$, and dates.
- **Mobile Ergonomics**: All buttons, view toggles, and sort pills $\ge 48 \times 48\text{ px}$.

---

## Security & RBAC Requirements
- Organization multi-tenancy enforced through Clerk session org validation (`auth()`).
- Data scoped strictly to authenticated tenant organization.

---

## Acceptance Criteria
- [ ] Portfolio sites ranked accurately by Specific Yield ($kWh/kWp$) with relative horizontal comparison bars.
- [ ] Sorting works cleanly across Specific Yield, CUF %, Capacity, and Target Progress.
- [ ] Warranty watchlist lists sites with expiring warranties, displaying EPC vendor, countdown days, and booking links.
- [ ] View switcher allows seamless toggle between Site Cards, Leaderboard, and Warranty Watchlist.
- [ ] Search input filters all active views in real-time.
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

### Desktop ($1440 \times 900$)
1. Navigate to `/` (Fleet Cockpit):
   - Check the view mode switcher right next to the search bar:
     - Click **"🏆 Specific Yield Leaderboard"**:
       - Verify sites are ranked from highest to lowest $kWh/kWp$.
       - Check the rank badges (#1 Gold, #2 Silver, #3 Bronze).
       - Click the sort dropdown to sort by **CUF %** and verify immediate re-ordering.
       - Click on any site row to verify navigation to its command center (`/sites/[id]`).
     - Click **"🛡️ Warranty Watchlist"**:
       - Verify sites with upcoming warranty expirations are listed with EPC vendor names and countdown pills.
       - Click **"Schedule Inspection ➔"** to verify transition to the `/maintenance` booking wizard.
     - Click **"🗂️ Site Cards View"**:
       - Verify return to the original obsidian cockpit cards.
2. Toggle Theme:
   - Check contrast in both Cyber Dark and High-Contrast Day Mode.

### Mobile ($390 \times 844$)
1. Open mobile emulation mode ($390 \times 844$).
2. Verify view mode buttons wrap cleanly with touch targets $\ge 48\text{ px}$.
3. Verify the leaderboard reflows into a clean stacked list without horizontal page clipping.
