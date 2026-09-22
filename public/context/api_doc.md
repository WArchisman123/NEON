# NEON ENERGY API Documentation & Industrial Edge Integration Reference
## REST Endpoints, IoT Ingestion Pipelines, Real-Time Streams & Billing Specifications

> **Document Status**: Production Blueprint  
> **API Version**: `v1`  
> **Base URL**: `https://app.neonenergy.io/api/v1` (or `http://localhost:3000/api/v1`)  
> **Protocol**: HTTPS / JSON & WSS (Supabase Realtime)  

---

## Table of Contents

1. [Architecture & Multi-Tenant Isolation](#1-architecture--multi-tenant-isolation)
2. [Authentication & Session Resolution](#2-authentication--session-resolution)
3. [Standard Response & Error Envelopes](#3-standard-response--error-envelopes)
4. [IoT Telemetry Ingestion Pipeline (Edge Gateways)](#4-iot-telemetry-ingestion-pipeline-edge-gateways)
5. [Fleet & Sites API](#5-fleet--sites-api)
   - [5.1 List Fleet Sites with Real-Time Snapshots (`GET /api/v1/sites`)](#51-list-fleet-sites-with-real-time-snapshots-get-apiv1sites)
   - [5.2 Get Site Details (`GET /api/v1/sites/:id`)](#52-get-site-details-get-apiv1sitesid)
   - [5.3 Create / Register Site (`POST /api/v1/sites`)](#53-create--register-site-post-apiv1sites)
   - [5.4 Update Site & Tariff Settings (`PATCH /api/v1/sites/:id`)](#54-update-site--tariff-settings-patch-apiv1sitesid)
6. [Interactive Real-Time Energy Flow API](#6-interactive-real-time-energy-flow-api)
   - [6.1 Get 5-Node Energy Flow Balances (`GET /api/v1/sites/:id/flow`)](#61-get-5-node-energy-flow-balances-get-apiv1sitesidflow)
   - [6.2 Component Telemetry Drilldown (`GET /api/v1/sites/:id/devices/:deviceId/telemetry`)](#62-component-telemetry-drilldown-get-apiv1sitesiddevicesdeviceidtelemetry)
7. [Power Consumption & Historical Analytics API](#7-power-consumption--historical-analytics-api)
   - [7.1 Energy Dispatch & Balance Series (`GET /api/v1/sites/:id/analytics/consumption`)](#71-energy-dispatch--balance-series-get-apiv1sitesidanalyticsconsumption)
   - [7.2 Peak Shaving & TOU Arbitrage (`GET /api/v1/sites/:id/analytics/arbitrage`)](#72-peak-shaving--tou-arbitrage-get-apiv1sitesidanalyticsarbitrage)
8. [Solar & BESS Maintenance Scheduling Engine API](#8-solar--bess-maintenance-scheduling-engine-api)
   - [8.1 List Maintenance Service Packages (`GET /api/v1/maintenance/services`)](#81-list-maintenance-service-packages-get-apiv1maintenanceservices)
   - [8.2 Book Maintenance Window (`POST /api/v1/maintenance/tickets`)](#82-book-maintenance-window-post-apiv1maintenancetickets)
   - [8.3 List & Track Maintenance Tickets (`GET /api/v1/maintenance/tickets`)](#83-list--track-maintenance-tickets-get-apiv1maintenancetickets)
   - [8.4 Update Ticket Lifecycle & Technician Sign-off (`PATCH /api/v1/maintenance/tickets/:id/status`)](#84-update-ticket-lifecycle--technician-sign-off-patch-apiv1maintenanceticketsidstatus)
9. [Billing, SaaS Subscriptions & Marketplace Payments](#9-billing-saas-subscriptions--marketplace-payments)
   - [9.1 Create Checkout Session (`POST /api/v1/billing/checkout`)](#91-create-checkout-session-post-apiv1billingcheckout)
   - [9.2 Get Subscription & Capacity Quotas (`GET /api/v1/billing/subscription`)](#92-get-subscription--capacity-quotas-get-apiv1billingsubscription)
   - [9.3 Stripe Webhook Handler (`POST /api/v1/billing/webhook`)](#93-stripe-webhook-handler-post-apiv1billingwebhook)
10. [Supabase Realtime WebSockets & Live Streaming](#10-supabase-realtime-websockets--live-streaming)

---

## 1. Architecture & Multi-Tenant Isolation

Neon Energy enforces strict multi-tenancy:
- **Authentication**: Handled via **Clerk** (Organizations, Membership Roles, JWT Session Tokens).
- **Database & Storage**: Handled via **Supabase PostgreSQL** and **Supabase Storage Buckets**.
- **Edge / Serverless**: Hosted on **Vercel** with Next.js App Router route handlers.
- **Tenant Scope**: Every authenticated request resolves the user's active `org_id`. All database queries are filtered by `org_id` at both the application level and via PostgreSQL Row Level Security (RLS). A user from Organization A can never access or query sites belonging to Organization B.

---

## 2. Authentication & Session Resolution

### 2.1 Web Application Users (Clerk JWT)
Protected routes resolve user identity using `@clerk/nextjs/server`:

```typescript
// lib/auth/get-tenant-context.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function getTenantContext() {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    return null;
  }

  return {
    userId,
    clerkOrgId: orgId,
    role: orgRole ?? "org:member",
  };
}
```

### 2.2 Industrial IoT Edge Gateways (API Key Ingestion)
Field dataloggers, Modbus edge computers, and SCADA gateways authenticate via a high-entropy secret bearer token assigned per site:

```http
Authorization: Bearer neon_gw_live_9f8d7c6b5a4e3d2c1b0a
X-Site-UUID: 3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### 2.3 Environment Keys & Credentials Matrix (`.env.local`)

| Environment Variable | Provider | Target Layer | Usage Context |
|---|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Client (`@clerk/nextjs`) | ClerkProvider initialization & frontend auth |
| `CLERK_SECRET_KEY` | Clerk | Server API / Route Handlers | Server-side session verification & org queries |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk | Routing | Sign-in redirection endpoint (`/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk | Routing | Sign-up redirection endpoint (`/sign-up`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Clerk | Routing | Post-login redirect (`/`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Clerk | Routing | Post-registration redirect (`/`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Client & Server | Supabase project API root (`https://uoiodhmahcpwedwajdtd.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Client-Side | Public Supabase client, RLS scoped |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Server-Only | Admin database bypass for background ingestion & sync |
| `TURIA_DB_supabse_pwd` | Supabase | Database Server | Direct PostgreSQL connection password |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog | Client-Side | Telemetry product analytics token |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog | Client-Side | PostHog ingest endpoint (`https://us.i.posthog.com`) |

---

## 3. Standard Response & Error Envelopes

### 3.1 Success Envelope (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-22T18:30:00.000Z",
    "requestId": "req_01HJ8Z7K9M"
  }
}
```

### 3.2 Error Envelope (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "SITE_CAPACITY_EXCEEDED",
    "message": "Your Starter tier limit of 500 kWp has been reached. Please upgrade to Pro Commercial.",
    "details": null
  }
}
```

---

## 4. IoT Telemetry Ingestion Pipeline (Edge Gateways)

### Ingest Live Field Packet
`POST /api/v1/telemetry/ingest`

Sub-second or 5-second batched payload transmitted from on-site industrial gateways (e.g. Advantech, Raspberry Pi CM4 industrial, Moxa gateway running the Neon Edge Daemon).

#### Request Headers
```http
POST /api/v1/telemetry/ingest HTTP/1.1
Host: app.neonenergy.io
Authorization: Bearer neon_gw_live_9f8d7c6b5a4e3d2c1b0a
Content-Type: application/json
```

#### Request Payload
```json
{
  "siteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "timestamp": "2026-09-22T18:30:00.000Z",
  "flows": {
    "solarPowerKw": 940.5,
    "bessPowerKw": -320.0,
    "gridPowerKw": -320.5,
    "dgPowerKw": 0.0,
    "loadPowerKw": 620.0
  },
  "subsystems": {
    "solar": {
      "inverters": [
        {
          "deviceId": "inv_01",
          "pacKw": 472.2,
          "vdc": 820.4,
          "idc": 580.1,
          "tempC": 54.2,
          "efficiencyPct": 98.6,
          "status": "RUNNING",
          "mpptCurrents": [14.2, 14.1, 13.9, 14.4]
        },
        {
          "deviceId": "inv_02",
          "pacKw": 468.3,
          "vdc": 818.1,
          "idc": 578.0,
          "tempC": 55.1,
          "efficiencyPct": 98.5,
          "status": "RUNNING",
          "mpptCurrents": [14.0, 13.8, 14.1, 14.0]
        }
      ],
      "irradiancePoa": 892.4,
      "moduleTempC": 42.1
    },
    "bess": {
      "socPct": 84.2,
      "sohPct": 97.8,
      "packVolts": 984.2,
      "packAmps": -325.2,
      "cellVmaxMv": 3342,
      "cellVminMv": 3324,
      "cellDeltaVMv": 18,
      "cellTmaxC": 26.8,
      "coolantTempC": 19.4,
      "chillerRunning": true,
      "dcContactorClosed": true,
      "alarmStatusWord": 0
    },
    "dg": {
      "state": "AUTO_STANDBY",
      "activeKw": 0.0,
      "rpm": 0,
      "oilPressureBar": 0.0,
      "coolantTempC": 28.4,
      "fuelPct": 92.5,
      "starterBatteryV": 26.4,
      "runHours": 1420.5
    },
    "grid": {
      "frequencyHz": 50.02,
      "powerFactor": 0.992,
      "thdV": 1.4,
      "thdI": 3.2,
      "activeTariffSlot": "PEAK_EXPORT"
    },
    "load": {
      "pacKw": 620.0,
      "qacKvar": 110.4,
      "peakDemandTodayKva": 710.2
    }
  }
}
```

#### Response Payload (`200 OK`)
```json
{
  "success": true,
  "data": {
    "siteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "acknowledgedAt": "2026-09-22T18:30:00.082Z",
    "alarmsTriggered": 0
  }
}
```

---

## 5. Fleet & Sites API

### 5.1 List Fleet Sites with Real-Time Snapshots (`GET /api/v1/sites`)

Retrieves all sites belonging to the caller's organization along with their latest instantaneous telemetry snapshot.

#### Request
```http
GET /api/v1/sites?status=all&sortBy=powerYield HTTP/1.1
Authorization: Bearer <clerk_session_token>
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Apex Hybrid Park #01",
      "slug": "apex-hybrid-park-01",
      "location": {
        "city": "Pune",
        "state": "Maharashtra",
        "lat": 18.5204,
        "lng": 73.8567
      },
      "status": "online",
      "plantType": "commercial_industrial",
      "capacities": {
        "solarKwp": 1200.0,
        "bessKwh": 2000.0,
        "bessPowerKw": 1000.0,
        "dgKva": 500.0,
        "contractedDemandKva": 800.0
      },
      "hasSolar": true,
      "hasBess": true,
      "hasDg": true,
      "hasGrid": true,
      "snapshot": {
        "timestamp": "2026-09-22T18:30:00Z",
        "solarPowerKw": 940.5,
        "bessPowerKw": -320.0,
        "bessSocPct": 84.2,
        "loadPowerKw": 620.0,
        "gridPowerKw": -320.5,
        "dgPowerKw": 0.0,
        "dgRunning": false,
        "dailyYieldKwh": 4820.0,
        "co2SavedTodayKg": 3952.4
      },
      "activeAlarmsCount": {
        "critical": 0,
        "warning": 1
      }
    }
  ]
}
```

---

### 5.2 Get Site Details (`GET /api/v1/sites/:id`)

#### Response (`200 OK`)
Returns detailed site configuration, device hardware inventory, and geographic metadata.

---

### 5.3 Create / Register Site (`POST /api/v1/sites`)

Enrolls a new solar/BESS installation into the organization. Requires `org:admin` role.

#### Request Body
```json
{
  "name": "Sahyadri Agro Solar Microgrid",
  "locationCity": "Nashik",
  "locationState": "Maharashtra",
  "latitude": 19.9975,
  "longitude": 73.7898,
  "plantType": "commercial_industrial",
  "solarCapacityKwp": 850.0,
  "bessCapacityKwh": 1200.0,
  "bessPowerKw": 600.0,
  "dgCapacityKva": 350.0,
  "contractedDemandKva": 600.0,
  "hasSolar": true,
  "hasBess": true,
  "hasDg": true,
  "hasGrid": true,
  "peakTariffRate": 0.19,
  "offpeakTariffRate": 0.08
}
```

---

## 6. Interactive Real-Time Energy Flow API

### 6.1 Get 5-Node Energy Flow Balances (`GET /api/v1/sites/:id/flow`)

Provides the instantaneous electrical power transfer matrix used by the animated visualizer.

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "siteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "timestamp": "2026-09-22T18:30:00Z",
    "operatingMode": "GRID_TIED_SELF_CONSUMPTION_AND_EXPORT",
    "nodes": {
      "solar": {
        "status": "ACTIVE",
        "powerKw": 940.5,
        "label": "Solar PV"
      },
      "bess": {
        "status": "CHARGING",
        "powerKw": -320.0,
        "socPct": 84.2,
        "sohPct": 97.8,
        "timeToFullMinutes": 42
      },
      "load": {
        "status": "CONSUMING",
        "powerKw": 620.0,
        "capacityUtilizationPct": 77.5
      },
      "grid": {
        "status": "EXPORTING",
        "powerKw": -320.5,
        "tariffSlot": "PEAK_EXPORT",
        "currentRateUsd": 0.18
      },
      "dg": {
        "status": "AUTO_STANDBY",
        "powerKw": 0.0,
        "fuelPct": 92.5
      }
    },
    "flows": [
      { "from": "solar", "to": "load", "kw": 620.0, "active": true },
      { "from": "solar", "to": "bess", "kw": 320.0, "active": true },
      { "from": "solar", "to": "grid", "kw": 0.5, "active": true },
      { "from": "bess", "to": "load", "kw": 0.0, "active": false },
      { "from": "grid", "to": "load", "kw": 0.0, "active": false },
      { "from": "dg", "to": "load", "kw": 0.0, "active": false }
    ]
  }
}
```

---

### 6.2 Component Telemetry Drilldown (`GET /api/v1/sites/:id/devices/:deviceId/telemetry`)

Retrieves low-level hardware diagnostics when the user clicks a specific node or inverter.

#### Response for BESS Container (`200 OK`)
```json
{
  "success": true,
  "data": {
    "deviceId": "bess_cont_01",
    "bessName": "CATL EnerOne 2.0 MWh Rack Group",
    "socPct": 84.2,
    "sohPct": 97.8,
    "dcBusVolts": 984.2,
    "currentAmps": -325.2,
    "chargeLimitKw": 600.0,
    "dischargeLimitKw": 1000.0,
    "cellThermals": {
      "vMaxMv": 3342,
      "vMinMv": 3324,
      "deltaVMv": 18,
      "tMaxC": 26.8,
      "tMinC": 24.1,
      "tAvgC": 25.4,
      "thermalRunawayAlert": false,
      "heatmapGrid": [
        { "cellId": 1, "tempC": 25.2, "voltsMv": 3330 },
        { "cellId": 2, "tempC": 25.6, "voltsMv": 3334 },
        { "cellId": 3, "tempC": 26.8, "voltsMv": 3342 },
        { "cellId": 4, "tempC": 24.9, "voltsMv": 3328 }
      ]
    },
    "coolingSystem": {
      "coolantInletC": 19.4,
      "coolantOutletC": 22.8,
      "pumpFlowLpm": 42.0,
      "chillerCompressorKw": 6.8
    },
    "safety": {
      "dcContactor": "CLOSED",
      "insulationResistanceKohm": 2450,
      "fireSuppressionAerosolArm": true
    }
  }
}
```

---

## 7. Power Consumption & Historical Analytics API

### 7.1 Energy Dispatch & Balance Series (`GET /api/v1/sites/:id/analytics/consumption`)

#### Query Parameters
- `range`: `today` | `7d` | `30d` | `ytd` | `custom`
- `interval`: `15m` | `1h` | `1d`
- `startDate`: `ISO 8601 string`
- `endDate`: `ISO 8601 string`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "siteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "interval": "1h",
    "series": [
      {
        "timestamp": "2026-09-22T08:00:00Z",
        "solarKwh": 412.0,
        "bessDischargeKwh": 0.0,
        "bessChargeKwh": 180.0,
        "loadKwh": 510.0,
        "gridImportKwh": 278.0,
        "gridExportKwh": 0.0,
        "dgKwh": 0.0
      },
      {
        "timestamp": "2026-09-22T12:00:00Z",
        "solarKwh": 950.0,
        "bessDischargeKwh": 0.0,
        "bessChargeKwh": 320.0,
        "loadKwh": 610.0,
        "gridImportKwh": 0.0,
        "gridExportKwh": 20.0,
        "dgKwh": 0.0
      }
    ],
    "aggregates": {
      "totalSolarYieldKwh": 5280.0,
      "totalLoadConsumedKwh": 6840.0,
      "solarSelfConsumptionPct": 92.4,
      "bessRoundTripEfficiencyPct": 88.6,
      "totalCo2AbatedKg": 4329.6
    }
  }
}
```

---

### 7.2 Peak Shaving & TOU Arbitrage (`GET /api/v1/sites/:id/analytics/arbitrage`)

Calculates dollars saved through smart battery scheduling during peak utility tariff periods.

---

## 8. Solar & BESS Maintenance Scheduling Engine API

> **Maintenance Policy**: Neon Energy exclusively provides certified O&M dispatch for **Solar PV Arrays** and **BESS Containers**. Utility grid and diesel genset hardware are excluded.

### 8.1 List Maintenance Service Packages (`GET /api/v1/maintenance/services`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "srv_bess_flush_01",
      "assetType": "bess",
      "title": "Liquid Chiller Coolant Flush & Refill",
      "slug": "bess-liquid-coolant-flush",
      "description": "Full drain, high-pressure loop purge, dielectric coolant replenishment, and pump flow rate calibration.",
      "basePriceUsd": 1250.0,
      "estimatedDurationHours": 6,
      "deliverables": [
        "50L Dielectric Coolant Replacement",
        "High-Pressure Loop Leak Testing",
        "Chiller Heat Exchanger Chemical Wash",
        "BMS Thermal Sensor Recalibration",
        "Tamper-Proof Digital Service Certificate"
      ]
    },
    {
      "id": "srv_sol_drone_01",
      "assetType": "solar_pv",
      "title": "Aerial Drone Radiometric IR Thermography",
      "slug": "solar-drone-ir-thermography",
      "description": "Autonomous aerial infrared scan compliant with IEC 62446-3, detecting hot spots, cell microcracks, and diode failures.",
      "basePriceUsd": 890.0,
      "estimatedDurationHours": 4,
      "deliverables": [
        "High-Resolution Thermal Orthomosaic Map",
        "Automated String & Sub-String Anomaly Detection",
        "Hot Spot Temperature Delta Severity Scoring",
        "Direct Warranty Claim Export Package"
      ]
    }
  ]
}
```

---

### 8.2 Book Maintenance Window (`POST /api/v1/maintenance/tickets`)

#### Request Body
```json
{
  "siteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "assetType": "bess",
  "serviceId": "srv_bess_flush_01",
  "scheduledDate": "2026-10-15",
  "timeWindow": "09:00 - 13:00",
  "customNotes": "BMS reporting slight temperature rise on Rack #3 during high C-rate discharge.",
  "paymentMethod": "stripe_card"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "ticketId": "tick_8f7e6d5c4b3a",
    "ticketNumber": "NEON-MNT-8812",
    "status": "requested",
    "scheduledDate": "2026-10-15",
    "timeWindow": "09:00 - 13:00",
    "totalPriceUsd": 1250.0,
    "paymentStatus": "paid",
    "receiptUrl": "https://pay.stripe.com/receipts/in_01HJ8Z"
  }
}
```

---

### 8.3 Update Ticket Lifecycle (`PATCH /api/v1/maintenance/tickets/:id/status`)

Used by field technicians and dispatch supervisors to advance job state:
`requested` $\to$ `technician_assigned` $\to$ `en_route` $\to$ `on_site` $\to$ `completed`.

---

## 9. Billing, SaaS Subscriptions & Marketplace Payments

Neon Energy is a **paid application**. User organizations must maintain an active subscription tier to view real-time telemetry and schedule maintenance.

### 9.1 Create Checkout Session (`POST /api/v1/billing/checkout`)

Creates a Stripe Checkout Session for upgrading tiers or purchasing maintenance credits.

#### Request Body
```json
{
  "tier": "pro_commercial",
  "billingCycle": "annual",
  "successUrl": "https://app.neonenergy.io/billing?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://app.neonenergy.io/billing"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_a1b2c3d4e5"
  }
}
```

---

### 9.2 Get Subscription & Capacity Quotas (`GET /api/v1/billing/subscription`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "tier": "pro_commercial",
    "status": "active",
    "billingCycle": "annual",
    "currentPeriodEnd": "2027-09-22T00:00:00Z",
    "quotas": {
      "maxSites": 10,
      "sitesUsed": 4,
      "maxCapacityKwp": 2500.0,
      "capacityMonitoredKwp": 1840.0,
      "maintenanceDiscountPct": 5
    }
  }
}
```

---

## 10. Supabase Realtime WebSockets & Live Streaming

For sub-second live updates without polling, frontend clients establish a WebSocket connection via Supabase Realtime:

```typescript
// hooks/use-site-telemetry-stream.ts
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function useSiteTelemetryStream(siteId: string) {
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`site-telemetry:${siteId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "telemetry_snapshots",
          filter: `site_id=eq.${siteId}`,
        },
        (payload) => {
          setSnapshot(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [siteId]);

  return snapshot;
}
```
