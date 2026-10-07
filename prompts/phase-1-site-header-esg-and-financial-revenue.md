# Implementation Prompt: Phase 1 — Site Header Commissioning Metadata, Contractual Targets, Extended ESG & Financial Revenue

> **Reference**: Implements Phase 1 of [`prompts/competitor-feature-gap-analysis-and-placement-strategy.md`](file:///C:/Users/hp/Desktop/git/NEON/neon/prompts/competitor-feature-gap-analysis-and-placement-strategy.md) based on competitor production benchmarks (`public/context/context_img/ref_img_1.png` to `ref_img_8.png`).

---

## 1. Goal

Implement the complete production-grade **Phase 1** feature set across NEON ENERGY:
1. **EPC Commissioning & Asset Ownership Strip**: Display EPC vendor name, commissioning date, warranty/subscription expiry countdown badge, and DC/AC overload ratio indicator.
2. **Contractual Annual PPA Generation Target Tracker**: Implement radial progress dial tracking Annual Target ($MWh$), Achieved ($MWh$), and Target Achieved %.
3. **Financial Revenue Gains Ticker in Local Currency (₹)**: Compute and display monetary generation value for Day (₹), Month (₹), and Year (₹ in Lacs) based on the site's localized feed-in tariff.
4. **Extended Environmental ESG Compliance Counters**: Expand carbon accounting to include **Coal Saved ($k\ \text{Tons}$)** and **Equivalent Trees Planted** alongside $\text{CO}_2$ avoided.
5. **Today's Operational Performance Telemetry Strip**: Display control-room KPI badges for **Capacity Utilization Factor (CUF %)**, **Performance Ratio (PR %)**, **Specific Yield ($kWh/kWp$)**, **Peak Irradiance ($W/m²$ @ timestamp)**, and **PV-DG Fuel Savings ($kWh$ and Liters saved)**.
6. **Fleet Cockpit Portfolio Rollups**: Elevate site-level metrics to the Fleet Cockpit with portfolio-wide revenue, target progress, tree equivalents, and normalized yield badges.

---

## 2. Relevant Agent Skills

* `.agents/skills/shadcn/`: Dual-theme design system compliance, card and drawer styling, layout composition, and Radix UI touch targets.
* `.agents/skills/supabase-postgres-best-practices/`: PostgreSQL schema types, null-safe telemetry enrichment, and indexing.
* `.agents/skills/clerk-orgs/`: Multi-tenant organization scoping and RBAC role boundaries.

---

## 3. Existing Code Inspected

* `lib/energy/types.ts`: `SiteRecord`, `HourlyTelemetryRecord`, and hardware device models.
* `lib/energy/site-service.ts`: `enrichSiteRecord`, `getSitesForOrg`, and `getSiteDetails`.
* `components/site-detail/site-detail-view.tsx`: Site Master Hero Card, telemetry strips, and asset badges.
* `components/dashboard/fleet-cockpit-view.tsx`: Fleet-level aggregate strip, site filtering, and portfolio summary.
* `components/design-system/site-cockpit-card-preview.tsx`: `SiteCockpitCard` and `SiteData` definitions.
* `components/design-system/fleet-aggregate-strip.tsx`: 5-metric glowing fleet aggregate strip.

---

## 4. Decisions & Mathematical Formulations

1. **Dual-Theme Design System Adherence**:
   * All new components and cards must strictly use theme tokens (`bg-theme-card`, `bg-theme-muted`, `border-theme-subtle`, `text-theme-primary`, `text-theme-secondary`, `text-theme-muted`) to ensure seamless switching between **Cyber Dark Mode** and **High-Contrast Day Mode**.
2. **Indian Rupee (₹) Financial Formatting**:
   * Day revenue: `₹X,XXX`
   * Month revenue: `₹XX,XXX`
   * Annual revenue: `₹X.XX Lacs` (when $\ge 100,000$)
   * Feed-in tariff: default to `₹8.25 / kWh` if not explicitly specified.
3. **Engineering Equations**:
   * **Capacity Utilization Factor**:
     $$\text{CUF } (\%) = \frac{\text{Actual Generation } (kWh)}{\text{Installed AC Capacity } (kW) \times 24\text{ hours}} \times 100$$
   * **Specific Yield**:
     $$Y_f = \frac{\text{Actual Generation } (kWh)}{\text{Installed DC Capacity } (kWp)}$$
   * **DC/AC Overload Ratio**:
     $$\text{Overload Ratio} = \frac{\text{Installed DC Capacity } (kWp)}{\text{Installed AC Capacity } (kW)}$$
   * **Coal Saved**:
     $$\text{Coal Saved } (kg) = \text{Solar Generation } (kWh) \times 0.38\ kg\ \text{Coal}/kWh$$
   * **Equivalent Trees Planted**:
     $$\text{Trees Planted} = \frac{\text{CO}_2\text{ Avoided } (kg)}{21.77\ kg\ \text{CO}_2/\text{tree/year}}$$
   * **PV-DG Fuel Savings**:
     $$\text{Diesel Fuel Saved } (L) = \frac{\text{Solar kWh consumed during DG run}}{3.2\ kWh/L}$$

---

## 5. Files Likely to Change

* [`lib/energy/types.ts`](file:///C:/Users/hp/Desktop/git/NEON/neon/lib/energy/types.ts): Ensure all Phase 1 fields on `SiteRecord` are strictly typed.
* [`lib/energy/site-service.ts`](file:///C:/Users/hp/Desktop/git/NEON/neon/lib/energy/site-service.ts): Verify `enrichSiteRecord` attaches all metadata and calculates CUF, Specific Yield, Coal, Trees, and Targets dynamically.
* [`components/site-detail/site-detail-view.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/site-detail-view.tsx): Verify and polish the Hero Card layout, Target Dial, Revenue Ticker, Extended ESG Block, and Today's Performance Strip.
* [`components/design-system/site-cockpit-card-preview.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/design-system/site-cockpit-card-preview.tsx): Verify normalized CUF % and Specific Yield badges on site cards.
* [`components/dashboard/fleet-cockpit-view.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/dashboard/fleet-cockpit-view.tsx): Verify the portfolio-wide revenue, annual target progress, trees planted, and coal saved banner.

---

## 6. Implementation Requirements

### Requirement 1: EPC Commissioning & Contract Ownership Block
* Display:
  * Plant AC Capacity ($kW$) vs Plant DC Capacity ($kWp$) with a glowing badge for DC/AC Ratio.
  * Commissioned By: Vendor name (e.g. *Pratual Clean Energy EPC*).
  * Commissioned Date (e.g. `30-Apr-2024`).
  * Subscription / Warranty Expiry Date with status badge (`30-Apr-2027`).
  * Equipment inventory counts: Inverters count, DG count, BESS count.

### Requirement 2: Annual PPA Target vs Generation Progress Ring
* Display:
  * Progress ring with animated/styled border showing percentage achieved.
  * Numerical label: `{annual_achieved_mwh} / {annual_target_mwh} MWh`.
  * Status label: `● Target Achieved ({pct}%)`.

### Requirement 3: Financial Revenue Gains in Local Currency (₹)
* Display:
  * Feed-in Tariff indicator (e.g. `₹8.25/kWh`).
  * Day revenue (`₹3,171`).
  * Month revenue (`₹26,054`).
  * Year revenue (`₹2.37 Lacs`).

### Requirement 4: Extended ESG Environmental Compliance Offset
* Display:
  * $\text{CO}_2$ Avoided ($k\ \text{Tons}$).
  * Coal Saved ($k\ \text{Tons}$).
  * Equivalent Trees Planted count.

### Requirement 5: Today's Operational Performance Telemetry Strip
* Display:
  * CUF % (Cyan badge).
  * Performance Ratio % (Emerald badge).
  * Specific Yield in $kWh/kWp$ (Pink badge).
  * Peak Irradiance in $W/m²$ with timestamp (Amber badge).
  * When DG exists: PV-DG Fuel Saved ($kWh$ & Liters).

### Requirement 6: Fleet Cockpit Portfolio Aggregation Banner
* Display:
  * Portfolio Revenue Today (`₹28,400+`).
  * Portfolio Annual Target Progress (`68%`).
  * Portfolio Trees Planted Today.
  * Portfolio Coal Saved Today.
  * Site cards show CUF % and Specific Yield badges in location row.

---

## 7. Design System & Visual Adherence

* **Palette**:
  * Default Cyber Dark: Void Black (`#060709`), Obsidian (`#0B0D13`), Cyber Glass (`#121622`), with glowing `#FF2A85` Neon Pink accents.
  * High-Contrast Day: Solar Ice Canvas (`#F4F6FB`), Pure White Cards (`#FFFFFF`), Day Frost (`#EAEFF8`), Deep Charcoal Ink (`#0B0F19`).
* **Monospace Rule**: All numerical telemetry ($kW$, $kWp$, $kWh$, $MWh$, $W/m²$, $A$, $V$, $₹$, $\%$) must use `font-mono`.
* **Touch Ergonomics**: All interactive buttons, tabs, and modals must meet minimum $48\times 48\text{ px}$ mobile tap target requirements.

---

## 8. Security & RBAC Requirements

* All site data queries must scope strictly to the active Clerk organization (`clerk_org_id`).
* Frontend client components must never execute raw unvalidated database mutations.

---

## 9. Acceptance Criteria

- [ ] `lib/energy/types.ts` defines all Phase 1 fields on `SiteRecord`.
- [ ] `lib/energy/site-service.ts` enriches all site records with valid numerical calculations.
- [ ] `components/site-detail/site-detail-view.tsx` renders the EPC commissioning bar, target dial, revenue ticker, extended ESG block, and today's performance strip.
- [ ] `components/dashboard/fleet-cockpit-view.tsx` renders the portfolio aggregation banner below the aggregate strip.
- [ ] `components/design-system/site-cockpit-card-preview.tsx` displays CUF % and Specific Yield badges on site cards.
- [ ] Dual-theme toggle seamlessly transitions all new elements between Cyber Dark and High-Contrast Day Mode without dark container artifacts.
- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `npm run lint` passes with 0 errors and 0 warnings.
- [ ] `npm run build` succeeds with zero errors.

---

## 10. Checks to Run

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

---

## 11. Exact Manual Test Steps (Desktop & Mobile)

1. **Desktop Viewport ($1440 \times 900$)**:
   - Navigate to `/` (Fleet Cockpit).
   - Verify the **Portfolio ESG & Revenue Banner** appears below the 5-metric strip with Revenue (₹), Target %, Trees, and Coal.
   - Verify each site card shows the **CUF %** and **Specific Yield** badges.
   - Click on a site card to open `/sites/[id]`.
   - Verify the **EPC Commissioning Strip**, **Target Dial (67.7%)**, **Revenue Ticker (₹)**, and **Extended ESG Counters**.
   - Verify the **Today's Performance Telemetry Strip** displaying CUF %, PR %, Specific Yield, and Peak Irradiance @ Time.
   - Toggle theme via Topbar Theme Toggle; verify crisp contrast on White Slate cards.
2. **Mobile Viewport ($390 \times 844$)**:
   - Verify all grids collapse into clean vertical/2-column stacks without horizontal overflow.
   - Verify minimum $48\text{ px}$ tap targets on all interactive buttons and badges.
