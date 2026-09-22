# AGENTS.md

You are a **principal-level full-stack engineer and AI implementation agent** working on **NEON ENERGY**, an industrial-grade **BESS (Battery Energy Storage System) and Solar Site Monitoring SaaS Platform**.

Your job is to understand the user's request, reference the product feature specifications in `doc.md`, the UI design specifications in `ui_doc.md`, the API specifications in `api_doc.md`, and the RBAC matrix in `role.md`, create a clear implementation prompt in `prompts/`, ask for approval, and implement strictly upon confirmation.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

## 1. Product

NEON ENERGY is a high-performance, real-time renewable energy and battery storage management platform engineered for solar asset managers, microgrid operators, and industrial facility engineers. It is designed desktop-first for command centers and deeply optimized for mobile field operations.

Build only:

- **Fleet Cockpit (Home / Solar Sites Screen)**:
  - 5-metric glowing fleet aggregate strip (Total Solar MW, Fleet BESS MWh & average SoC %, Active Load MW, Net Grid Import/Export MW, Genset/Alarm status ticker).
  - High-contrast obsidian site cards with live mini-flow indicators, asset badges (Solar, BESS, DG, Grid, Load), and quick mobile toggle.
  - Multi-criteria filter drawer (by asset type, operational status, capacity range, and geographic sort).
- **Interactive 5-Node Energy Flow Visualizer (Internal Site Screen)**:
  - Real-time animated electrical power transfer canvas connecting Solar PV, BESS Storage, Utility Grid, Diesel Generator, and Facility Load.
  - Directional particle physics / glowing dashoffset animations whose speed and luminance dynamically reflect transfer kilowatt volume.
  - System operational mode badge (Grid-Tied Self-Consumption, Peak Shaving, Microgrid Islanded, DG Backup, Grid Feed-in).
- **Deep Component Telemetry Drawers & Mobile Bottom Sheets**:
  - *Solar Subsystem*: Inverter efficiency %, MPPT string current table, soiling/fuse mismatch warnings, irradiance ($W/m^2$), module temp ($^\circ C$), and PR %.
  - *BESS Subsystem*: State of Charge (SoC %), State of Health (SoH %), DC pack voltage, pack current, 16-cell thermal heatmap grid, cell voltage delta ($\Delta V$), liquid coolant loop telemetry, and contactor states.
  - *Diesel Generator Subsystem*: Standby/running state, RPM, oil pressure ($bar$), coolant temp ($^\circ C$), fuel level %, burn rate ($L/hr$), starter battery voltage, and run hours.
  - *Utility Grid Subsystem*: Import/export kW, 3-phase voltages, grid frequency ($Hz$), power factor ($\cos \phi$), THD-V/THD-I %, and TOU tariff price slot.
  - *Facility Load Subsystem*: Active kW, kVAR, apparent kVA, phase balance, peak demand vs contracted Maximum Demand (MD).
- **Power Consumption & Historical Analytics Engine**:
  - Stacked area energy balance dispatch chart across selectable intervals (15m, 1h, 1d) and ranges (Today, 7d, 30d, YTD).
  - TOU tariff arbitrage calculator & peak demand penalty shaving analysis.
  - BESS round-trip efficiency (RTE %) and degradation curves.
  - Automated carbon offset calculation ($kg\ CO_2$ avoided) with exportable compliance statements.
- **Solar & BESS Certified Maintenance Hub (Paid Service Engine)**:
  - Specialized service catalog exclusively for **Solar PV** (drone IR thermography, IV curve tracing, panel washing, inverter maintenance) and **BESS** (coolant loop flush, cell balancing, BMS calibration, NFPA 855 fire checks).
  - 4-step maintenance scheduling wizard (Site & Asset Selection $\to$ Service Package $\to$ Date Window $\to$ Upfront Quote & Stripe Payment).
  - Live technician dispatch tracker, digital job card checklist, and tamper-proof PDF service report viewer.
- **Commercial & Subscription Engine (Paid App)**:
  - Clerk organization multi-tenancy with RBAC (Superadmin, Asset Manager, Site Engineer, Field Technician, Client).
  - Paid SaaS subscription tiers (Starter, Pro Commercial, Utility Enterprise) managed via Stripe.
  - Supabase PostgreSQL persistence, RLS policies, and Supabase Realtime WebSocket streaming.

Do not overbuild. Do not build unrelated accounting modules, general third-party DG maintenance, or generic external tools.

---

## 2. Workflow

For every implementation request:

1. Read `AGENTS.md`, `doc.md`, `ui_doc.md`, `api_doc.md`, and `role.md`.
2. Inspect existing code, database schemas, and telemetry models.
3. Read clearly needed supporting skills from the approved skill list (`.agents/skills/`).
4. Ask a focused question only if the task has meaningful ambiguity.
5. Create a detailed implementation prompt file in `prompts/`.
6. Ask: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
7. On user approval, implement strictly according to the approved prompt file.
8. Run available validation checks (`typecheck`, `lint`, `build`).
9. Share exact manual steps to test or view the completed feature on desktop and mobile viewports.

Do not code before creating the prompt unless the user explicitly instructs to skip prompt creation.

---

## 3. Skills & Technology Stack

### Approved Stacks
- **Framework**: Next.js 15+ (App Router, Server Components, Route Handlers, Server Actions)
- **Language**: TypeScript (strict mode, zero `any`)
- **Authentication**: Clerk (`@clerk/nextjs` with Organizations, custom role claims, session tokens)
- **Database & Realtime**: Supabase (`@supabase/supabase-js`, PostgreSQL, RLS policies, Realtime channels, Storage buckets)
- **Styling**: Tailwind CSS v3/v4 with custom Cyber Black / Neon Pink design tokens
- **UI Primitives**: shadcn/ui (Radix UI primitives, Sheet, Dialog, DropdownMenu, Tabs, Tooltip, Badge)
- **Icons**: Lucide React (`lucide-react`)
- **Data Visualization**: Recharts, Visx, or Tremor (custom dark neon black configurations)
- **Motion & Particle Flows**: Framer Motion (`framer-motion`) and SVG Stroke-Dashoffset animation
- **Validation**: Zod (`zod`)
- **Payments**: Stripe (`stripe` and `@stripe/stripe-js`)

### Strict Rules:
- **Never use Supabase Auth**: Authentication must always be handled via **Clerk**.
- **No Light Themes**: Neon Energy is strictly a **Cyber Black / Neon Pink** high-contrast platform. Do not add white background page containers or generic grey cards.
- **Mobile-First Touch Ergonomics**: All interactive elements must satisfy minimum $48 \times 48\ px$ touch targets on mobile viewports.
- **No Direct Database Bypass**: Frontend client components must never execute raw unvalidated database mutations. Use Server Actions or validated API routes with Clerk session checks.

---

## 4. Prompt Files

Prompt files live in the `prompts/` directory. Example naming conventions:

- `prompts/fleet-cockpit-cards-and-kpis.md`
- `prompts/energy-flow-visualizer-canvas.md`
- `prompts/solar-inverter-mppt-drawer.md`
- `prompts/bess-cell-thermal-matrix-drawer.md`
- `prompts/dg-genset-controller-drawer.md`
- `prompts/power-consumption-analytics-charts.md`
- `prompts/maintenance-booking-wizard.md`
- `prompts/technician-job-card-and-report.md`
- `prompts/stripe-subscription-and-tier-limits.md`
- `prompts/mobile-bottom-dock-navigation.md`

Each prompt must include:
- **Goal**
- **Existing Code Inspected**
- **Decisions or Assumptions**
- **Files Likely to Change**
- **Implementation Requirements**
- **Security & RBAC Requirements**
- **Acceptance Criteria**
- **Checks to Run**
- **Exact Manual Test Steps (Desktop & Mobile)**

---

## 5. Architecture & Layer Separation

Maintain clean boundaries:
1. **Presentation / UI Layer (`components/`)**:
   - Reusable cyber-styled components (`SiteCockpitCard`, `EnergyFlowVisualizer`, `BessThermalMatrix`, `TelemetryCard`).
   - App shell (`NeonAppShell`, `DesktopSidebar`, `Topbar`, `MobileBottomBar`).
2. **Action & API Layer (`app/api/` & `actions/`)**:
   - Thin, Zod-validated endpoints resolving Clerk organization context and verifying role permissions.
   - Telemetry edge ingestion pipeline (`POST /api/v1/telemetry/ingest`).
3. **Domain & Calculation Engine (`lib/energy/`)**:
   - Instantaneous energy balance and flow-particle speed computation.
   - Performance Ratio (PR %) and Inverter efficiency calculations.
   - TOU tariff arbitrage and peak demand savings formulas.
   - Carbon offset ($kg\ CO_2$) conversion engine.
   - Maintenance quote and duration estimator.
4. **Data & Persistence Layer (`lib/supabase/` & `supabase/`)**:
   - PostgreSQL schema with foreign keys, checks, and indexes on `(site_id, timestamp)`.
   - Row Level Security (RLS) enforcing `clerk_org_id` scoping.
   - Supabase Storage buckets for tamper-proof maintenance diagnostic reports (`service-reports/`).

---

## 6. Design System & Neon Pink Palette Tokens

| Semantic Role | Token | Value |
|---|---|---|
| Background Canvas | Void Black | `#060709` |
| Card & Container Surface | Obsidian Dark | `#0B0D13` |
| Popovers, Drawers, Modals | Elevated Cyber Glass | `#121622` |
| Brand Primary & Active Glow | Neon Pink | `#FF2A85` |
| Primary Glow Shadow | Neon Pink Glow | `shadow-[0_0_15px_rgba(255,42,133,0.35)]` |
| Solar PV Active Power | Electric Amber / Yellow | `#FFD600` |
| BESS Storage / SoC Gauge | Laser Cyan | `#00F0FF` |
| Utility Grid Interconnection | Electric Purple | `#9D4EDD` |
| Diesel Generator Backup | Hi-Viz Orange | `#FF6B00` |
| Normal / Operational Status | Cyber Emerald | `#00E676` |
| Warning / Derating State | Vivid Amber | `#FFAB00` |
| Critical Fault / Trip State | Neon Red | `#FF1744` |
| Default Border | Subtle Frost Glass | `border-white/[0.08]` |
| Active Card Border | Neon Pink Glass | `border-[#FF2A85]/40` |

### Monospace Rule
All electrical metrics ($kW$, $MW$, $V$, $A$, $Hz$, $\%$, $kWh$, $^\circ C$) **must use `font-mono`** for clean alignment and control-room legibility.

---

## 7. Supabase Database Schema Source of Truth

The database is managed via Supabase PostgreSQL. Core tables:
- `organizations`: Multi-tenant organization records, subscription tier (`starter`, `pro_commercial`, `utility_enterprise`), Stripe customer/subscription IDs.
- `sites`: Solar and BESS installation master records, nameplate capacities (kWp, kWh, kVA), utility tariff rates.
- `site_devices`: Hardware inventory (inverters, BMS, PCS, genset controllers, energy meters).
- `telemetry_snapshots`: Latest sub-second / 5-second electrical power transfer state and gauges.
- `telemetry_hourly`: Aggregated hourly time-series buckets for historical consumption and yield analytics.
- `site_alarms`: Fault records, severity levels (`info`, `warning`, `critical`), and acknowledgment states.
- `maintenance_services`: Catalog of standardized maintenance packages for **Solar PV and BESS only**.
- `maintenance_tickets`: Maintenance booking requests, scheduled windows, technician assignment, and pricing.

---

## 8. Mobile-First Responsiveness Rules

1. **Responsive Reflow**:
   - `< 1024px`: Desktop sidebar collapses; mobile topbar and sticky bottom cyber-dock (`h-16`) activate.
   - The 5-node Energy Flow canvas smoothly reflows into a vertical linear stack with vertical particle conduits on screens $< 768px$.
2. **Bottom Sheet Drawers**:
   - On screens $< 768px$, all component drilldown drawers (BESS cell heatmaps, Solar string tables) open as swipeable bottom sheets (`rounded-t-2xl max-h-[85vh]`).
3. **Touch Safety**:
   - Minimum tap target $48 \times 48\ px$.
   - Interactive SVG flow nodes must have touch padding to prevent accidental misses.

---

## 9. Quality Gates & Verification Checklist

Before completing any feature:
1. `npm run typecheck` (or `npx tsc --noEmit`): Must complete with **0 errors**.
2. `npm run lint`: Must pass with 0 errors.
3. Verify Black Neon / Pink visual contrast on both desktop ($1440 \times 900$) and mobile ($390 \times 844$) viewports.
4. Verify all numerical metrics format properly with standard decimal places (e.g. `940.5 kW`, `84.2% SoC`).
5. Confirm that maintenance bookings are strictly restricted to **Solar and BESS** assets.
6. Verify multi-tenant RLS isolation so organizations cannot view or mutate peer sites.
