# NEON ENERGY - Role-Based Access Control (RBAC) & Security Architecture
## Multi-Tenant Permissions Matrix, Electrical Safety Levels & User Scopes

> **Document Status**: Production Blueprint  
> **Target System**: Neon Energy Clean-Tech SaaS  
> **Auth Engine**: Clerk Organizations & Custom RBAC Claims  

---

## 1. Overview & Safety-First RBAC Philosophy

Operating utility-scale Solar Photovoltaic (PV) arrays and multi-megawatt Battery Energy Storage Systems (BESS) requires strict operational authorization. A misconfigured setpoint or an unauthorized emergency trip command can cause:
1. Islanding failures and severe utility grid penalty charges.
2. Inverter thermal trips and loss of lucrative feed-in revenue.
3. BESS thermal runaway or premature lithium-iron-phosphate (LFP) cell degradation.

Neon Energy implements a **Multi-Tenant Hierarchical Role-Based Access Control (RBAC)** architecture combining:
1. **Tenant Isolation**: Strict segregation by `clerk_org_id` across all database queries, realtime WebSocket channels, and Supabase storage buckets.
2. **Standard Energy Roles**: Pre-configured profiles tailored for Renewable Asset Managers, O&M Plant Operators, Field Technicians, and Facility Executives.
3. **9-Module Granular Capability Matrix**: Defines capabilities (`View`, `Export`, `Book Service`, `Modify Config`, `Remote Setpoints`) per functional module.
4. **Safety Interlock Boundary**: Critical remote control operations (e.g. Inverter Curtailment, BESS charge force-stops) require two-factor confirmation and `org:admin` / `org:site_engineer` privileges.
5. **Mobile Field Scoping**: Restricts field technicians to view only active maintenance work orders and site hardware diagnostics.

---

## 2. Standard Organization Roles & Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     👑 Organization Owner / Superadmin                          │
│     (Full fleet governance, billing, Stripe subscription, user management)       │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────────┐
│                          ⚡ Renewable Asset Manager                             │
│     (Fleet-wide yield, financial ROI, TOU arbitrage, maintenance approval)      │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────────┐
│                        🔧 Site O&M Electrical Engineer                          │
│     (Real-time 5-node flow, BESS cell thermals, inverter strings, alarms)       │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────────┐
│                   🦺 Certified Field Technician (Solar & BESS)                   │
│     (Assigned job cards, FLIR IR thermograms, coolant refills, checklist sign)  │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┴──────────────────────────────────────────┐
│ 🏭 Facility Owner / Commercial Client  │ 📊 ESG Auditor / Clean Energy Investor  │
│ (Power consumption, utility bill cut)  │ (Read-only yield reports & CO2 credits) │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

---

## 3. Detailed Role Profiles

### 3.1 Organization Owner / Superadmin
- **Clerk Org Role**: `org:admin`
- **Scope**: Fleet-Wide.
- **Key Responsibilities**:
  - Full management of billing, Stripe checkout sessions, and tier limits.
  - Adding/removing organization members and assigning roles.
  - Onboarding new solar/BESS sites and configuring Modbus edge gateway API tokens.
  - Authorizing emergency plant curtailment and grid export override setpoints.

### 3.2 Renewable Asset Manager
- **Clerk Org Role**: `org:asset_manager` (or `org:admin`)
- **Scope**: All Organization Sites.
- **Key Responsibilities**:
  - Monitors fleet-wide solar yield, BESS round-trip efficiency (RTE), and plant availability.
  - Approves and pays for on-demand Solar/BESS maintenance booking quotes.
  - Evaluates TOU tariff arbitrage savings and utility maximum demand peak-shaving economics.
  - Exports official ESG compliance statements and carbon abatement logs.

### 3.3 Site O&M Electrical Engineer
- **Clerk Org Role**: `org:site_engineer` (or `org:member`)
- **Scope**: Assigned Solar & BESS Sites.
- **Key Responsibilities**:
  - Real-time monitoring of the 5-Node Energy Flow visualizer.
  - Triaging inverter DC input power clipping and MPPT string current mismatches.
  - Inspecting BESS cell voltage balance ($\Delta V$) and maximum rack temperatures.
  - Logging fault incident reports and initiating maintenance service requests with specific error codes.

### 3.4 Certified Field Technician (Solar & BESS)
- **Clerk Org Role**: `org:field_tech` (or `org:member`)
- **Scope**: Assigned Maintenance Work Orders Only.
- **Key Responsibilities**:
  - Mobile-first access to assigned service tickets and job cards.
  - Updating ticket state (`en_route`, `on_site`, `testing_and_verification`, `completed`).
  - Uploading radiometric drone thermograms, cell impedance readings, and dielectric coolant pressure logs.
  - Submitting digital customer sign-off and safety checklists.

### 3.5 Facility Owner / Commercial Client
- **Clerk Org Role**: `org:client` (or `org:member`)
- **Scope**: Dedicated Facility Site.
- **Key Responsibilities**:
  - View-only access to live power consumption and solar self-consumption percentage.
  - Monitoring diesel fuel avoided and electricity bill savings.
  - Initiating scheduled panel washing requests.

### 3.6 ESG Auditor / Clean Energy Investor
- **Clerk Org Role**: `org:auditor` (or `org:member`)
- **Scope**: Read-Only Financial & Yield Data.
- **Key Responsibilities**:
  - Reviewing historical generation records and third-party certified maintenance logs.
  - Verifying carbon credit additionality and compliance with renewable energy standards.

---

## 4. 9-Module Granular Permission Matrix

| Module Name | Superadmin | Asset Manager | Site Engineer | Field Tech | Facility Owner | ESG Auditor |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **1. Fleet Cockpit & Sites** | Full (CRUD) | View / Export | View Assigned | View Assigned | View Own Site | View Reports |
| **2. Real-Time 5-Node Flow** | Real-Time | Real-Time | Real-Time | Real-Time | Real-Time | Historical Only |
| **3. Hardware Telemetry Drawers** | Full Diagnostics | Full Diagnostics | Full Diagnostics | Diagnostics | Basic Summary | None |
| **4. Remote Setpoints & Controls**| Authorized | Setpoint Propose| Emergency Only | None | None | None |
| **5. Power & TOU Analytics** | Full Analytics | Full Analytics | Technical Only| None | Summary Only | Audit Reports |
| **6. Maintenance Catalog Booking**| Book & Pay | Book & Pay | Request Service| View Assigned | Request Wash | None |
| **7. Field Job Card Execution** | Audit | Review | Assist | Full Execution | Sign-Off | View Reports |
| **8. Billing & Stripe Tier** | Full Access | View Invoices | None | None | None | None |
| **9. Gateway API Keys & Edge** | Full (Regen) | None | View Status | None | None | None |

---

## 5. Middleware & Route Protection Patterns

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/sites(.*)",
  "/analytics(.*)",
  "/maintenance(.*)",
  "/billing(.*)",
  "/api/v1/sites(.*)",
  "/api/v1/maintenance(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/billing(.*)",
  "/api/v1/billing(.*)",
  "/api/v1/gateways(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn({ returnBackUrl: req.url });
    }

    if (isAdminRoute(req) && session.orgRole !== "org:admin") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }
  }
});
```
