# Feature Spec 4: Solar & BESS Maintenance Scheduling Engine

## Goal
Implement **Feature Spec 4: Solar & BESS Maintenance Scheduling Engine (Paid Service Engine)** at `/maintenance`, providing an industrial-grade O&M marketplace and digital field operations hub strictly restricted to **Solar Photovoltaics (PV)** and **Battery Energy Storage Systems (BESS)**.

The engine includes:
1. **Specialized Service Catalog (`/maintenance`)**:
   - High-contrast Cyber Black / Neon Pink cards for Solar PV (Amber `#FFD600`) and BESS (Cyan `#00F0FF`) certified packages with transparent base pricing, duration, and deliverables.
2. **4-Step Maintenance Booking Wizard Modal**:
   - **Step 1: Select Site & Asset**: Filter to Solar PV Array or BESS Container; auto-detects active alarms to suggest relevant packages.
   - **Step 2: Service Package & Custom Scope**: Select standardized package and append field fault notes.
   - **Step 3: Preferred Service Window & SLA**: Interactive calendar with morning/afternoon slots and Standard vs Urgent 24-hr SLA emergency dispatch.
   - **Step 4: Upfront Quote Breakdown & Stripe Payment**: Itemized parts/labor/SLA quote with instant simulated card checkout and corporate PO/credit option.
3. **Active Service Tickets & Real-Time SLA Tracker**:
   - Live query of `public.maintenance_tickets` for the authenticated Clerk organization.
   - Status pipeline: `requested` → `quote_accepted` → `technician_assigned` → `en_route` → `on_site` → `testing_and_verification` → `completed`.
   - Status advancement control for site engineers and technicians.
4. **Digital Job Card & Field Checklist Drawer**:
   - Interactive field technician checklist (LOTO safety, radiometric scans, dielectric pressure tests, cell delta-V balance verification, customer sign-off).
5. **Tamper-Proof Certified Service Report Viewer**:
   - Verifiable certificate viewer with pre/post SCADA measurements, FLIR radiometric resolution notes, technician signature, and 1-click printable format.
6. **Integration with Site Detail**:
   - Quick "Schedule Maintenance" action in `/sites/[id]` pre-populating the target site.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Dialog, Sheet, Tabs, Stepper, Badges, Button variants, Form controls)
- `.agents/skills/clerk-orgs/` (Multi-tenant org scoping to fetch user's sites and tickets)
- `.agents/skills/supabase/` (PostgreSQL tables `maintenance_services`, `maintenance_tickets`, queries)
- `.agents/skills/clerk-billing/` (Pricing, payment terms, and upfront quoting structures)

---

## Existing Code Inspected
- `public/context/doc.md` (Section 8: Feature Spec 4 - Service catalog, 4-step wizard, job card lifecycle, report sign-off).
- `public/context/ui_doc.md` (Section 9: Screen 4 Maintenance Scheduling Hub, catalog cards, stepper specs).
- `public/context/api_doc.md` (Section 8: `GET /api/v1/maintenance/services`, `POST /api/v1/maintenance/tickets`, `PATCH /api/v1/maintenance/tickets/:id/status`).
- `public/context/role.md` (Section 4: Permission matrix for Asset Manager, Site Engineer, and Field Tech).
- `supabase/migrations/0001_initial_schema.sql`: Contains `maintenance_services` and `maintenance_tickets` table schemas and seed packages.
- `lib/energy/types.ts`: Master interface definitions.
- `lib/supabase/db.ts`: Direct PostgreSQL client pool connected to Supabase.
- `components/layout/desktop-sidebar.tsx` & `components/layout/mobile-bottom-bar.tsx`: Navigation items already pointing to `/maintenance`.

---

## Decisions or Assumptions
1. **Strict Asset Scoping**:
   - In strict compliance with product rules, only **Solar PV** and **BESS** assets can be serviced. Diesel generators and utility grid infrastructure are excluded from maintenance bookings.
2. **Database Persistence**:
   - Uses real tables `public.maintenance_services` and `public.maintenance_tickets` in Supabase PostgreSQL.
   - If an organization has zero tickets, initial seed tickets will be populated so the user can immediately test the job card checklist, SLA tracker, and status transitions.
3. **Upfront Quote Calculation**:
   - Formula: $\text{Total} = \text{Base Price} + \text{Environmental Fee (\$120)} + \text{Expedited SLA (\$350 if urgent)}$.
4. **Payment Processing**:
   - Step 4 simulates Stripe Elements payment confirmation and allows Corporate PO / Maintenance Credits, immediately saving the ticket to PostgreSQL with `payment_status = 'paid'`.

---

## Files Likely to Change or Create
- `lib/energy/types.ts`: Add maintenance service and ticket interfaces.
- `lib/energy/maintenance-service.ts`: Query functions (`getMaintenanceServices`, `getMaintenanceTickets`, `createMaintenanceTicket`, `updateTicketStatus`).
- `app/api/v1/maintenance/services/route.ts`: API endpoint to list active service packages.
- `app/api/v1/maintenance/tickets/route.ts`: API endpoint to list and create tickets.
- `app/api/v1/maintenance/tickets/[id]/status/route.ts`: API endpoint to advance ticket lifecycle.
- `components/maintenance/maintenance-hub-view.tsx`: Client view with catalog tabs, active tickets list, and stats strip.
- `components/maintenance/booking-wizard-modal.tsx`: 4-step interactive booking modal stepper.
- `components/maintenance/digital-job-card-modal.tsx`: Interactive field technician checklist and state updater.
- `components/maintenance/certified-service-report-modal.tsx`: Official tamper-proof certificate and report viewer.
- `app/maintenance/page.tsx`: Server Component fetching org sites, services, and tickets.
- `components/site-detail/site-detail-view.tsx`: Add "Schedule Maintenance" quick button linking to `/maintenance?siteId=[id]`.

---

## Implementation Requirements

### 1. Domain Service Layer (`lib/energy/maintenance-service.ts`)
- Query active services filtered by asset type (`solar_pv` | `bess`).
- Fetch tickets scoped to the organization (`org_id`), joined with site details and service package.
- Insert new booking tickets with generated ticket numbers (e.g. `NEON-MNT-XXXX`).
- Update ticket status (`requested`, `quote_accepted`, `technician_assigned`, `en_route`, `on_site`, `testing_and_verification`, `completed`).

### 2. REST API Endpoints (`app/api/v1/maintenance/`)
- `GET /api/v1/maintenance/services`: Returns catalog array grouped or filtered by asset type.
- `GET /api/v1/maintenance/tickets`: Returns org tickets sorted by `created_at DESC`.
- `POST /api/v1/maintenance/tickets`: Validates input with Zod, inserts record, returns created ticket.
- `PATCH /api/v1/maintenance/tickets/[id]/status`: Updates ticket status and returns updated record.

### 3. Service Catalog & Marketplace (`components/maintenance/maintenance-hub-view.tsx`)
- Tabbed filter: `All Services`, `Solar PV Only` (`#FFD600`), `BESS Only` (`#00F0FF`).
- Cards displaying service title, duration in hours, price in USD, full deliverables checklist with checkmarks, and primary "Book Service Window" button.
- 4-metric maintenance aggregate header:
  - *Active Work Orders*: Count of open tickets.
  - *Certified Technicians Dispatched*: Crews currently en-route / on-site.
  - *Avg Response SLA*: e.g. `< 24 Hours`.
  - *Next Scheduled Window*: Upcoming service date/time.

### 4. 4-Step Maintenance Booking Wizard (`components/maintenance/booking-wizard-modal.tsx`)
- **Step 1: Site & Asset Selection**:
  - Select from enrolled sites.
  - Radio toggle: **Solar PV Array** or **BESS Container**.
  - Alarms check: Displays active alarm badges for the selected asset with suggestion pill.
- **Step 2: Service Package & Diagnostics**:
  - Select package matching the asset type.
  - Custom notes / SCADA fault code text area.
- **Step 3: Service Window & Expedited SLA**:
  - Date selector (HTML5 date input styled for cyber dark theme).
  - Time window: `08:00 AM - 12:00 PM PST` vs `01:00 PM - 05:00 PM PST`.
  - SLA toggle: Standard (5 days) vs Urgent Emergency (< 24h, +$350).
- **Step 4: Upfront Quote & Stripe / Card Payment**:
  - Itemized quote summary.
  - Payment method toggle: Credit Card (Stripe simulation) or Corporate PO.
  - Confirm & Book action that triggers `POST /api/v1/maintenance/tickets` and refreshes ticket tracker.

### 5. SLA Dispatch Tracker & Digital Job Card Drawer
- Ticket list with status badges (`requested` amber, `en_route` cyan, `on_site` purple, `completed` emerald).
- "View Job Card" opens `DigitalJobCardModal` showing:
  - Progress timeline bar with all 7 lifecycle stages.
  - Action buttons: "Advance Status (e.g. En Route -> On Site -> Testing -> Completed)".
  - Interactive digital checklist with safety protocols and measurements.
  - "View Tamper-Proof Report" button when completed (or preview at any time).

### 6. Tamper-Proof Certified Service Report (`components/maintenance/certified-service-report-modal.tsx`)
- High-contrast official certificate with ISO/IEC compliance banner.
- Pre-service vs post-service electrical measurements comparison.
- Digital technician signature stamp and verification checksum.
- Print button (`window.print()`).

---

## Design System & Visual Adherence
- Void Black background (`#060709`), Obsidian Dark surfaces (`#0B0D13`), Elevated Cyber Glass modals (`#121622`).
- Neon Pink accents (`#FF2A85`) for primary CTAs and active tabs.
- Solar PV packages highlighted with Electric Amber (`#FFD600`).
- BESS packages highlighted with Laser Cyan (`#00F0FF`).
- Monospace font (`font-mono`) for all prices, durations, ticket IDs, dates, and electrical readings.
- Touch ergonomics: All interactive controls $\ge 48 \times 48\ px$ on mobile.

---

## Security & RBAC Requirements
- Authentication strictly via Clerk (`auth.protect()` in proxy middleware).
- Multi-tenancy isolation: All ticket queries and mutations are scoped to the authenticated user's `org_id`.
- Zero database bypass: Mutations occur via validated Next.js API routes.

---

## Acceptance Criteria
- [ ] `/maintenance` renders the Certified Clean Energy Maintenance Hub.
- [ ] Catalog exclusively shows Solar PV and BESS services (no DG or Grid services).
- [ ] 4-Step booking modal smoothly progresses through Site & Asset -> Package -> Schedule -> Quote & Pay.
- [ ] Booking a service successfully creates a record in Supabase PostgreSQL and displays it in the active tickets list.
- [ ] Clicking a ticket opens the Digital Job Card with interactive checklist and status advancement controls.
- [ ] Completed tickets allow viewing and printing the tamper-proof certified service report.
- [ ] Responsive across desktop ($1440 \times 900$) and mobile ($390 \times 844$).
- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `npm run lint` passes with 0 errors and 0 warnings.
- [ ] `npm run build` compiles successfully.

---

## Checks to Run
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Desktop ($1440 \times 900$)**:
   - Open `http://localhost:3000/maintenance`.
   - Verify the 4-metric KPI header, service catalog cards (Solar & BESS), and active tickets list.
   - Filter catalog by "Solar PV Only" and "BESS Only".
   - Click "Book Service Window" on "Liquid Coolant Loop Flush & BMS Calibration".
   - Step 1: Select site and verify asset is BESS Container.
   - Step 2: Confirm package and add custom notes.
   - Step 3: Select date and time window.
   - Step 4: Verify transparent quote breakdown and click "Confirm Booking & Pay".
   - Verify new ticket appears in Active Service Tickets with ticket number and scheduled date.
   - Click "View Job Card" on the ticket: toggle checklist items and click "Advance Status" through `en_route` -> `on_site` -> `testing_and_verification` -> `completed`.
   - Click "View Certified Report" and test "Print Report".
2. **Mobile ($390 \times 844$)**:
   - Switch DevTools to iPhone ($390 \times 844$).
   - Tap "Service" in the bottom cyber-dock.
   - Verify touch targets and smooth vertical stacking of catalog cards and ticket items.
   - Open the booking wizard modal and verify full mobile sheet responsiveness.
