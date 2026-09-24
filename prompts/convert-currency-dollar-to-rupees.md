# Implementation Prompt: Convert All Currency from Dollars ($) to Indian Rupees (₹)

## Goal
Replace all US Dollar currency indicators (`$`, `USD`, `$/kWh`, `DollarSign` icons) with Indian Rupee indicators (`₹`, `₹/kWh`, `IndianRupee` icons, and Indian numeric formatting `en-IN` like `₹16,500` or `₹1,24,000`) across all user-facing views, modals, charts, and calculation engines in the NEON ENERGY platform.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: Styling, typography consistency, UI badge/modal composition, and accessibility.
- `AGENTS.md`: Mandatory design token adherence (`#060709` Void Black canvas, `#0B0D13` Obsidian cards, `#FF2A85` Neon Pink glow, `font-mono` telemetry, $\ge 48 \times 48\text{ px}$ mobile touch ergonomics).

---

## Existing Code Inspected
1. **Subscription & Billing Module**:
   - `components/subscription/subscription-view.tsx`:
     - Line 78–80: `getTierForSite` rates: `$199 / mo`, `$599 / mo`, `$1,499 / mo`
     - Lines 370, 403, 433: Tier cards displaying `$199 / month`, `$599 / month`, `$1,499 / month`
   - `components/subscription/renewal-subscription-modal.tsx`:
     - Lines 62–73: Starter ($199 / $1,990), Pro Commercial ($599 / $5,990), Utility Enterprise ($1,499 / $14,990)
     - Lines 76–78: Add-on rates for fast polling ($49/$490), compliance ($99/$990), SLA ($149/$1490)
     - Lines 201, 265, 268, 283, 323, 352, 381, 394, 399, 404, 410, 436: Pricing displays, subtotal breakdown, and checkout CTA buttons
2. **Maintenance Marketplace Hub & Modals**:
   - `components/maintenance/maintenance-hub-view.tsx`:
     - Line 228: Service card base price `${srv.base_price.toLocaleString()}`
     - Line 355: Ticket total price `${tck.total_price.toLocaleString()}`
   - `components/maintenance/booking-wizard-modal.tsx`:
     - Lines 89–91: Base price and fee fallbacks
     - Lines 427, 459, 464, 470, 476, 579: Fee badges, itemized quote breakdown, USD currency label, and button text
   - `components/maintenance/digital-job-card-modal.tsx`:
     - Line 364: Commercial Total `${currentTicket.total_price.toLocaleString()}`
   - `components/design-system/maintenance-catalog-preview.tsx`:
     - Lines 16, 30: Mock package prices (`$1,250`, `$850`)
3. **Site Registration & Tariffs**:
   - `components/dashboard/add-site-modal.tsx`:
     - Lines 73–74, 94–95, 115–116, 136–137: Template tariff defaults
     - Lines 167–168: Default state for peakTariff (`0.19`) and offpeakTariff (`0.08`)
     - Line 748: `DollarSign` icon
     - Lines 752, 759, 774: Spread badge (`$${tariffSpread}/kWh`) and input labels (`Peak Tariff Rate ($/kWh)`, `Off-Peak Tariff Rate ($/kWh)`)
4. **Subsystem Detail Pages**:
   - `app/sites/[id]/grid/page.tsx`:
     - Line 142: Active tariff display `${peakRate}/kWh`
     - Line 250: Utility MD penalty saving `$1,280 / month saved`
   - `app/sites/[id]/dg/page.tsx`:
     - Line 258: Diesel fuel avoided `($684 Saved today)`
5. **Analytics & Performance Workspaces**:
   - `components/analytics/power-consumption-workspace.tsx`:
     - Line 300: Avoided MD penalty `${summary.avoidedMdPenalties.toLocaleString()} MD penalty cut`
     - Line 313: Diesel cost avoided `${summary.dieselCostSaved.toLocaleString()} fuel cost saved`
     - Lines 572, 583, 593: Tariff delta `+$.../kWh`, Arbitrage Revenue `+$...`, Avoided MD penalty `+$... / mo`
   - `components/analytics/historical-dispatch-chart.tsx`:
     - Line 171: `DollarSign` icon in Arbitrage Saved KPI card
     - Line 175: Arbitrage Saved value `${totals.costSaved.toLocaleString()}`
   - `components/analytics/grid-performance-chart.tsx`:
     - Lines 172, 177, 304: Peak window legend, header rates, and tooltip hovered point tariff slot
   - `components/design-system/fleet-aggregate-strip.tsx`:
     - Line 65: Net Grid Feed-In arbitrage velocity delta `+$84.20/hr`
   - `lib/energy/analytics-engine.ts`:
     - Line 115: Diesel cost saved multiplier `dieselFuelDisplacedLiters * 1.6` ($1.60/L $\to$ ₹92/L)
     - Line 111: Avoided MD penalty multiplier `contractedMd * 1.6` $\to$ `contractedMd * 125`

---

## Decisions or Assumptions
1. **Currency Symbol**:
   - Use standard Unicode Indian Rupee symbol `₹` across all formatted strings.
   - Use `IndianRupee` Lucide icon instead of `DollarSign` wherever icons accompany financial metrics.
2. **Number Formatting**:
   - Format numbers using Indian numbering standard (`en-IN`), e.g., `value.toLocaleString("en-IN")` so numbers group in lakhs and thousands (e.g., `₹1,24,000` instead of `₹124,000`).
3. **Realistic Indian B2B SaaS Tiers**:
   - Starter Tier: `₹16,500 / mo` (`₹1,65,000 / yr`)
   - Pro Commercial Tier: `₹49,500 / mo` (`₹4,95,000 / yr`)
   - Utility Enterprise Tier: `₹1,24,000 / mo` (`₹12,40,000 / yr`)
   - Add-ons: Fast Polling `₹4,000/mo` (`₹40,000/yr`), NFPA 855 `₹8,000/mo` (`₹80,000/yr`), SLA `₹12,000/mo` (`₹1,20,000/yr`).
4. **Indian Grid Tariff Defaults**:
   - Commercial/Industrial Peak Tariff: `₹8.50 / kWh` (or custom site value).
   - Off-Peak Tariff: `₹4.50 / kWh`.
   - Fuel Cost Benchmark: `₹92 / Liter` of diesel.
5. **Certified Maintenance Packages**:
   - Liquid Chiller Coolant Flush & Refill: `₹1,05,000`
   - Drone IR Thermography Scan: `₹72,000`
   - Urgent 24-hr SLA Fee: `+₹28,000 Fee`

---

## Files Likely to Change
1. `components/subscription/subscription-view.tsx`
2. `components/subscription/renewal-subscription-modal.tsx`
3. `components/maintenance/maintenance-hub-view.tsx`
4. `components/maintenance/booking-wizard-modal.tsx`
5. `components/maintenance/digital-job-card-modal.tsx`
6. `components/design-system/maintenance-catalog-preview.tsx`
7. `components/dashboard/add-site-modal.tsx`
8. `app/sites/[id]/grid/page.tsx`
9. `app/sites/[id]/dg/page.tsx`
10. `components/analytics/power-consumption-workspace.tsx`
11. `components/analytics/historical-dispatch-chart.tsx`
12. `components/analytics/grid-performance-chart.tsx`
13. `components/design-system/fleet-aggregate-strip.tsx`
14. `components/site-detail/site-detail-view.tsx`
15. `lib/energy/analytics-engine.ts`

---

## Implementation Requirements

### 1. Subscription & Renewal
- Update `components/subscription/subscription-view.tsx`:
  - Change all tier rates in `getTierForSite` and the 3 tier display cards to `₹16,500 / mo`, `₹49,500 / mo`, and `₹1,24,000 / mo`.
- Update `components/subscription/renewal-subscription-modal.tsx`:
  - Change `monthlyBase` and `annualBase` variables to Indian Rupee tier figures.
  - Change `fastPollingRate`, `complianceRate`, and `slaRate` to Indian Rupee rates.
  - Change tax estimation to Indian GST standard (18%) or format `+₹${estimatedTax.toLocaleString("en-IN")}`.
  - Update all rendered currency labels to `₹${totalDue.toLocaleString("en-IN")}`.
  - Update the checkout CTA button to display `Proceed to Checkout (₹${totalDue.toLocaleString("en-IN")})`.

### 2. Maintenance Hub & Work Orders
- Update `components/maintenance/maintenance-hub-view.tsx`:
  - Render `₹${srv.base_price.toLocaleString("en-IN")}` for catalog cards.
  - Render `₹${tck.total_price.toLocaleString("en-IN")}` for ticket list rows.
- Update `components/maintenance/booking-wizard-modal.tsx`:
  - Urgent SLA label: `+₹28,000 Fee`.
  - Itemized quote lines: `₹${basePrice.toLocaleString("en-IN")}`, `₹${environmentalFee.toLocaleString("en-IN")}`, `+₹28,000`.
  - Authorized total: `₹${totalPrice.toLocaleString("en-IN")}` (remove `USD`).
  - Checkout button: `Confirm & Authorize ₹${totalPrice.toLocaleString("en-IN")}`.
- Update `components/maintenance/digital-job-card-modal.tsx`:
  - Commercial total label: `₹${currentTicket.total_price.toLocaleString("en-IN")}`.
- Update `components/design-system/maintenance-catalog-preview.tsx`:
  - Package prices: `price: "₹1,05,000"` and `price: "₹72,000"`.

### 3. Add Site Wizard & Tariff Management
- Update `components/dashboard/add-site-modal.tsx`:
  - Swap `DollarSign` import with `IndianRupee` from `lucide-react`.
  - Section 3 title icon: `<IndianRupee className="size-3.5 text-[#FF2A85]" />`.
  - Tariff spread: `Spread: ₹${tariffSpread}/kWh`.
  - Input labels: `Peak Tariff Rate (₹/kWh)` and `Off-Peak Tariff Rate (₹/kWh)`.
  - Default form inputs & templates: Set to Indian market defaults (`₹8.50` peak, `₹4.50` off-peak).

### 4. Subsystem Detail Views
- Update `app/sites/[id]/grid/page.tsx`:
  - Active Tariff: `₹${peakRate}/kWh`.
  - Avoided Utility MD Penalty: `₹1,05,000 / month saved`.
- Update `app/sites/[id]/dg/page.tsx`:
  - Diesel Fuel Avoided: `428 Liters (₹56,400 Saved today)`.
- Update `components/site-detail/site-detail-view.tsx`:
  - Alarm message: `"Switched to Peak TOU tariff slot (₹8.50/kWh); BESS peak-shaving dispatch engaged"`.

### 5. Analytics & Fleet Metrics
- Update `components/analytics/power-consumption-workspace.tsx`:
  - BESS Peak Shaved: `₹${summary.avoidedMdPenalties.toLocaleString("en-IN")} MD penalty cut`.
  - Diesel Fuel Avoided: `₹${summary.dieselCostSaved.toLocaleString("en-IN")} fuel cost saved`.
  - Tariff Delta: `+₹${((currentSite.peak_tariff_rate || 8.5) - (currentSite.offpeak_tariff_rate || 4.5)).toFixed(2)}/kWh`.
  - Arbitrage Revenue Harvested: `+₹${summary.touArbitrageSavings.toLocaleString("en-IN")}`.
  - Avoided MD Penalties: `+₹${summary.avoidedMdPenalties.toLocaleString("en-IN")} / mo`.
- Update `components/analytics/historical-dispatch-chart.tsx`:
  - Replace `DollarSign` with `IndianRupee` icon.
  - Arbitrage Saved value: `₹${totals.costSaved.toLocaleString("en-IN")}`.
- Update `components/analytics/grid-performance-chart.tsx`:
  - Peak Window legend: `Peak Window (₹${peakTariffRate}/kWh)`.
  - Header rates: `Tariff: Off-Peak ₹${offpeakTariffRate}/kWh • Peak ₹${peakTariffRate}/kWh`.
  - Hover tooltip: `PEAK (₹${peakTariffRate}/kWh)` / `OFF-PEAK (₹${offpeakTariffRate}/kWh)`.
- Update `components/design-system/fleet-aggregate-strip.tsx`:
  - Arbitrage velocity delta: `+₹6,950/hr`.
- Update `lib/energy/analytics-engine.ts`:
  - Diesel cost saving formula: `Math.round(dieselFuelDisplacedLiters * 92); // ₹92 / Liter benchmark`
  - Avoided MD demand penalty formula: `Math.round(contractedMd * 125); // Avoided MD demand penalty in ₹`

---

## Design System & Visual Adherence
- Maintain strict Cyber Black / Neon Pink design tokens (`#060709` Void Black background, `#0B0D13` Obsidian cards, `#121622` elevated modals, `#FF2A85` Neon Pink accents, `#00E676` Cyber Emerald for positive savings).
- Ensure all numerical figures and financial currencies retain `font-mono` styling for clean alignment and control-room legibility.
- Mobile touch targets must maintain minimum $48 \times 48\text{ px}$ clickable bounds.

---

## Security & RBAC Requirements
- Pure display and calculation transformations; existing Clerk multi-tenancy, Supabase RLS policies, and authorization checks remain strictly intact.
- Server-side validations in Zod and API endpoints remain unchanged and secure.

---

## Acceptance Criteria
- [ ] No US Dollar signs (`$`) or `USD` labels remain in any user-facing screen, modal, card, drawer, or chart.
- [ ] All financial values use the Indian Rupee symbol (`₹`) with `en-IN` number formatting.
- [ ] TOU tariff metrics across Add Site Modal, Grid Subsystem page, and Analytics workspaces show `₹/kWh`.
- [ ] Lucide `DollarSign` icons are replaced with `IndianRupee` in tariff and savings cards.
- [ ] Subscription tiers and renewal checkout modals display Indian Rupee rates.
- [ ] Maintenance marketplace packages, booking wizard, and digital job cards display Rupee figures.
- [ ] `npx tsc --noEmit` completes with 0 errors.
- [ ] `npm run lint` completes with 0 errors.

---

## Checks to Run
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Subscription View (`/subscription`)**:
   - Inspect the 3 tier cards: verify they show `₹16,500 / month`, `₹49,500 / month`, and `₹1,24,000 / month`.
   - Click "Renew Site Subscription" or "Manage Subscription":
     - Verify monthly and annual rates are in `₹`.
     - Toggle add-ons (Fast Polling, NFPA 855, SLA) and verify price calculations update in `₹`.
     - Verify checkout button shows `Proceed to Checkout (₹...)`.
2. **Maintenance Marketplace (`/maintenance`)**:
   - Check service package cards: verify prices display with `₹` (e.g. `₹1,05,000`, `₹72,000`).
   - Click "Schedule Certified Service":
     - In Step 3, verify urgent SLA displays `+₹28,000 Fee`.
     - In Step 4, verify itemized breakdown and total authorized amount display in `₹` (no `USD`).
     - Click Confirm & Authorize: verify ticket appears in list with `₹`.
   - Click "Digital Job Card": verify Commercial Total shows `₹...`.
3. **Add Site Wizard (Dashboard `+ Add Site`)**:
   - Open Add Site modal.
   - Scroll to Section 3 "Time-of-Use (TOU) Tariff Schedule":
     - Verify `IndianRupee` icon is displayed.
     - Verify labels read `Peak Tariff Rate (₹/kWh)` and `Off-Peak Tariff Rate (₹/kWh)`.
     - Verify spread badge reads `Spread: ₹.../kWh`.
4. **Site Subsystems & Analytics (`/sites/[id]` and `/analytics`)**:
   - Navigate to `/sites/[id]/grid`: verify Active Tariff shows `₹.../kWh` and avoided penalty shows `₹1,05,000 / month saved`.
   - Navigate to `/sites/[id]/dg`: verify avoided diesel shows `(₹56,400 Saved today)`.
   - Navigate to `/analytics`:
     - Verify "Arbitrage Saved" KPI card has `IndianRupee` icon and `₹...`.
     - Verify BESS Peak Shaved penalty cut shows `₹... MD penalty cut`.
     - Verify Diesel Fuel Avoided shows `₹... fuel cost saved`.
     - In Grid Exchange & TOU chart, verify legend and hover tooltip display `₹.../kWh`.
5. **Mobile Viewport (390 x 844)**:
   - Verify all Rupee values, modals, and sheets reflow cleanly without text truncation or overflow.
