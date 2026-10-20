# Implementation Prompt: Deye IoT Telemetry API Integration & Custom Data Adapter

## Goal
Decouple NEON ENERGY's data layer from Supabase for all telemetry, site devices, and live electrical flows, maintaining **Clerk** exclusively for authentication (sign-in, sign-up, user sessions, organization multi-tenancy, and RBAC). Re-architect the application layer to ingest, normalize, and render live telemetry directly from the user's custom database and IoT backend using the actual **Deye Hybrid Inverter (`Feston-5kW`)** data model.

Specifically, this implementation will:
1. **Decouple Data Fetching from Supabase**: Replace direct Supabase SQL queries in `lib/energy/site-service.ts` with a pluggable **IoT Data Adapter Layer** that connects to the user's custom database/API backend.
2. **Standardize Incoming IoT API Contracts**: Define the exact REST endpoints and JSON structures required by NEON to ingest and query the Deye 5kW IoT payload (`timestamp`, `device`, `dashboard`, `telemetry`).
3. **Data Normalization & Unit Transformations**: Convert raw sensor metrics ($W \to kW$, $Wh \to kWh$, $Ah \times V \to kWh$, anomaly filter on battery temp $-75^\circ C$).
4. **Adaptive UI Topologies**:
   - Dynamically scale the Solar MPPT diagnostics from 24 channels to 2/4 MPPT DC inputs (`pv1`..`pv4`).
   - Dynamically adapt the Grid intertie from 3-phase ($415\text{ V}$) to Single-Phase ($230\text{ V} / 256\text{ V}$ L1-N) when $L_2/L_3$ are inactive.
   - Re-scope the Generator peaker view to AC electrical parameters ($kW, V, Hz$, runtime hours, transfer relay status) while flagging mechanical engine sensors (oil pressure, fuel level) as auxiliary ECU items.
   - Conditionally hide container-scale BESS modules (16-cell BMS heatmap, liquid glycol chiller loop, NFPA 855 aerosol fire safety) for 5kW compact hybrid systems.
5. **Real Modbus Alarm Decoder**: Map raw 16-bit register bitmasks (`fault_word_1..4`, `warning_word_1..2`, `rcd_leak_current_a`) into live alarm ticker items.

---

## Relevant Agent Skills
- `.agents/skills/clerk/`: Pure authentication, user session extraction, and user onboarding without Supabase Auth.
- `.agents/skills/clerk-nextjs-patterns/`: Protecting Next.js Server Components and Route Handlers with `auth()` and session tokens.
- `.agents/skills/clerk-orgs/`: Multi-tenant organization scoping and role validation (`orgId`, `orgRole`).
- `.agents/skills/shadcn/`: Dual-theme Obsidian / Solar Ice cards, drawers, and responsive layout primitives.
- `.agents/skills/architect/`: System architectural design, API contract specifications, and layer decoupling.

---

## Existing Code Inspected
- `public/context/api_requirement.md`: Universal JSON envelopes, monospace rules, and endpoint specifications.
- `lib/energy/types.ts`: Energy system data models (`SiteRecord`, `HourlyTelemetryRecord`, `MpptChannelPoint`, `EnergyFlowState`).
- `lib/energy/site-service.ts`: Current Supabase database query methods requiring abstraction (`getSiteDetails`, `getSiteHourlyAnalytics`, `getOrCreateOrg`).
- `lib/energy/flow-engine.ts`: Core 5-node electrical power transfer and animated conduit speed calculations.
- `components/energy-flow/telemetry-drawer.tsx`: 5-node component telemetry slide-over drawers.
- `components/solar/mppt-diagnostic-stack.tsx` & `components/solar/string-current-heatmap-matrix.tsx`: Solar string diagnostics currently hardcoded to 12/24 channels.
- `app/sites/[id]/bess/page.tsx`: BESS view containing 16-cell heatmap, liquid chiller, and NFPA 855 cards.
- `app/sites/[id]/grid/page.tsx`: Grid view configured with 3-phase line-to-line voltages.
- `app/sites/[id]/dg/page.tsx`: DG view configured with engine mechanical sensors.

---

## Decisions & Assumptions
1. **Clerk Remains Sole Identity Provider**: Clerk handles login, signup, user session JWTs, and organization switching. No user auth logic touches Supabase.
2. **Pluggable Data Adapter Architecture (`lib/energy/adapters/`)**:
   - Create a clean `IotDataProvider` interface so NEON can fetch live data from either:
     - **Custom IoT API / Database Client** (reading from the user's external DB or microservice via `IOT_BACKEND_URL`).
     - **Mock / Seed Adapter** (for local development, fallback testing, and demo environments).
   - This prevents breaking local builds while allowing instant configuration via environment variables.
3. **Incoming Deye 5kW Data Model as Primary Schema**:
   The payload schema provided by the user is the primary source of truth:
   - Root: `timestamp`, `site_id`, `device_id`, `device`, `dashboard`, `telemetry`.
   - All Watts ($W$) are divided by 1000 to produce Kilowatts ($kW$) for high-contrast control-room monospace display.
4. **Hardware Equipment Profiles (`equipment_profile`)**:
   Introduce a profile flag on sites:
   - `'hybrid_inverter_5kw'` (Default for Deye 5kW and residential/commercial hybrid inverters).
   - `'utility_bess_container'` (Megawatt container with liquid chiller, 16-cell BMS CANbus matrix, and NFPA 855 fire suppression).
   When set to `'hybrid_inverter_5kw'`, container-specific modules are gracefully replaced with pack-level battery telemetry.
5. **Battery Temperature Anomaly Sanity Check**:
   A raw reading of `-75^\circ C` represents an unplugged/unconfigured external NTC probe. The adapter converts values $< -40^\circ C$ to `null` and displays `"NTC Sensor Disconnected / Not Equipped"`.
6. **Preserve Dual-Theme Cyber Design System**:
   - Void Black (`#060709`), Obsidian (`#0B0D13`), Cyber Glass (`#121622`), and Neon Pink (`#FF2A85`) accents.
   - High-Contrast Day Mode (`#F4F6FB` canvas, `#FFFFFF` cards, `#0B0F19` deep charcoal typography).
   - All electrical parameters formatted in `font-mono`.

---

## Files Likely to Change & Created

### New Files
1. `lib/energy/adapters/iot-data-types.ts`:
   - Exact TypeScript definitions for the incoming Deye IoT payload (`DeyePayload`, `DeyeDashboard`, `DeyeTelemetry`, `DeyeDevice`).
2. `lib/energy/adapters/iot-data-adapter.ts`:
   - Adapter implementing data mapping, unit conversion ($W \to kW$), anomaly filtering, and time-series rollups.
3. `lib/energy/deye-fault-codes.ts`:
   - Modbus bitmask decoder mapping `fault_word_1..4`, `warning_word_1..2`, and `rcd_leak_current_a` into human-readable alarm records.
4. `app/api/v1/telemetry/ingest/route.ts`:
   - Next.js Route Handler receiving, validating (via Zod), and processing the Deye IoT JSON payload.
5. `app/api/v1/sites/[id]/live/route.ts`:
   - Clerk-authenticated endpoint returning the normalized live state for site detail views and 5-node flows.

### Modified Files
1. `lib/energy/types.ts`:
   - Add `equipment_profile?: 'hybrid_inverter_5kw' | 'utility_bess_container'` to `SiteRecord`.
   - Update `MpptChannelPoint` and `SolarTelemetryDetails` to support 2–24 dynamic channels.
2. `lib/energy/site-service.ts`:
   - Refactor to consume the new `iot-data-adapter.ts` instead of directly executing raw Supabase SQL queries for telemetry.
3. `lib/energy/flow-engine.ts`:
   - Map normalized Deye fields into `SourceOutputs`, `DirectTransfers`, and animated conduit speeds.
4. `components/solar/mppt-diagnostic-stack.tsx` & `components/solar/string-current-heatmap-matrix.tsx`:
   - Refactor channel counts to dynamically adapt between 2 MPPT trackers (PV1..PV4) and 24 strings based on `equipment_profile`.
5. `app/sites/[id]/bess/page.tsx`:
   - Conditionally render pack-level summary cards (48V, 70Ah, SoC %, Current) when `equipment_profile === 'hybrid_inverter_5kw'`, reserving 16-cell heatmaps and chillers for utility container profiles.
6. `app/sites/[id]/grid/page.tsx`:
   - Add single-phase detection ($256\text{ V}$ L1-N) to hide inactive $L_2/L_3$ phases.
7. `app/sites/[id]/dg/page.tsx`:
   - Focus on AC electrical output ($kW$, $V$, $Hz$, run hours, dry-contact relay state) for inverter-connected generators.

---

## Implementation Requirements

### 1. Deye IoT Payload TypeScript Interface (`lib/energy/adapters/iot-data-types.ts`)
Must model the exact structure of the user's IoT data:
```ts
export interface DeyeDashboardBattery {
  power_w: number;
  soc_percent: number;
  voltage_v: number;
  current_a: number;
  temperature_c: number;
}

export interface DeyeDashboardGrid {
  power_w: number;
  frequency_hz: number;
  voltage_v: number;
  current_a: number;
  ct_power_w: number;
  ld_power_w: number;
}

export interface DeyeDashboardPvChannel {
  power_w: number;
  voltage_v: number;
  current_a: number;
}

export interface DeyeDashboard {
  battery: DeyeDashboardBattery;
  grid: DeyeDashboardGrid;
  pv: {
    m1: DeyeDashboardPvChannel;
    m2: DeyeDashboardPvChannel;
  };
  inverter: {
    power_w: number;
    frequency_hz: number;
    voltage_v: number;
    current_a: number;
  };
  load: {
    power_w: number;
    voltage_v: number;
  };
  gen: {
    power_w: number;
    voltage_v: number;
    frequency_hz: number;
  };
}

export interface DeyeTelemetry {
  grid_frequency_hz: number;
  grid_voltage_l1_v: number;
  grid_voltage_l2_v: number;
  grid_current_l1_a: number;
  grid_power_w: number;
  grid_external_limiter1_power_w: number;
  grid_relay_status: number;
  inverter_voltage_l1_v: number;
  inverter_current_l1_a: number;
  inverter_power_w: number;
  inverter_frequency_hz: number;
  radiator_temperature_c: number;
  igbt_temperature_c: number;
  run_state: number;
  run_state_text: string;
  load_voltage_l1_v: number;
  load_current_l1_a: number;
  load_power_w: number;
  battery_temperature_c: number;
  battery_voltage_v: number;
  battery_soc_percent: number;
  battery_status: number;
  battery_power_w: number;
  battery_current_a: number;
  battery_corrected_capacity_ah: number;
  pv1_power_w: number;
  pv2_power_w: number;
  pv1_voltage_v: number;
  pv1_current_a: number;
  pv2_voltage_v: number;
  pv2_current_a: number;
  gen_power_w: number;
  gen_voltage_v: number;
  gen_relay_status: number;
  daily_pv_energy_kwh: number;
  daily_battery_charge_kwh: number;
  daily_battery_discharge_kwh: number;
  daily_grid_buy_kwh: number;
  daily_grid_sell_kwh: number;
  daily_load_energy_kwh: number;
  daily_generator_energy_kwh: number;
  history_pv_energy_kwh: number;
  total_active_energy_kwh: number;
  total_grid_buy_kwh: number;
  total_grid_sell_kwh: number;
  total_battery_charge_kwh: number;
  total_battery_discharge_kwh: number;
  total_load_energy_kwh: number;
  fault_word_1: number;
  fault_word_2: number;
  fault_word_3: number;
  fault_word_4: number;
  warning_word_1: number;
  warning_word_2: number;
  rcd_leak_current_a: number;
}

export interface DeyeIoTRecord {
  timestamp: string;
  site_id: string;
  device_id: string;
  device: {
    manufacturer: string;
    model: string;
    slave_address: number;
    port: string;
    power_unit_w: number;
  };
  dashboard: DeyeDashboard;
  telemetry: DeyeTelemetry;
}
```

### 2. Normalization & Transformation Logic (`lib/energy/adapters/iot-data-adapter.ts`)
Map the raw Deye record into NEON's universal domain formats:
```ts
export function normalizeDeyeRecord(raw: DeyeIoTRecord): Partial<SiteRecord> {
  const t = raw.telemetry;
  const d = raw.dashboard;

  // Active power in kW (Watts / 1000)
  const solarPowerKw = parseFloat(((t.pv1_power_w + t.pv2_power_w) / 1000).toFixed(2));
  const liveBessPowerKw = parseFloat((t.battery_power_w / 1000).toFixed(2));
  const gridPowerKw = parseFloat((t.grid_power_w / 1000).toFixed(2));
  const dgPowerKw = parseFloat((t.gen_power_w / 1000).toFixed(2));
  const loadPowerKw = parseFloat((t.load_power_w / 1000).toFixed(2));

  // Temperature sanity check: if < -40°C, probe is missing/unplugged
  const batteryTempC = t.battery_temperature_c < -40 ? null : t.battery_temperature_c;

  return {
    solar_power_kw: solarPowerKw,
    live_bess_power_kw: liveBessPowerKw,
    grid_power_kw: gridPowerKw,
    dg_power_kw: dgPowerKw,
    load_power_kw: loadPowerKw,
    bess_soc_pct: t.battery_soc_percent,
    dg_running: t.gen_power_w > 0 || (t.gen_relay_status & 0x01) !== 0,
    solar_yield_today_kwh: t.daily_pv_energy_kwh,
    load_consumption_today_kwh: t.daily_load_energy_kwh,
    grid_import_today_kwh: t.daily_grid_buy_kwh,
    grid_export_today_kwh: t.daily_grid_sell_kwh,
    bess_charge_today_kwh: t.daily_battery_charge_kwh,
    bess_discharge_today_kwh: t.daily_battery_discharge_kwh,
    dg_yield_today_kwh: t.daily_generator_energy_kwh,
    co2_saved_today_kg: parseFloat((t.daily_pv_energy_kwh * 0.49).toFixed(1)),
    snapshot_time: raw.timestamp,
  };
}
```

### 3. API Contract Specifications for Backend Integration

#### 3.1 Live Telemetry Ingest (`POST /api/v1/telemetry/ingest`)
- **Purpose**: Webhook / edge ingestion receiver for remote gateways.
- **Request Body**: Accepts the raw Deye IoT JSON payload directly.
- **Processing**:
  - Validates payload structure using Zod.
  - Normalizes fields and updates memory cache / user database.
  - Broadcasts live update event for client revalidation.

#### 3.2 Site Live State (`GET /api/v1/sites/[id]/live`)
- **Purpose**: Feeds the 5-node animated energy canvas and real-time cockpit badges.
- **Auth**: Protected by Clerk (`auth()`).
- **Response Structure**:
```json
{
  "success": true,
  "data": {
    "siteId": "site-01",
    "timestamp": "2026-10-09T19:27:33.157411+00:00",
    "equipmentProfile": "hybrid_inverter_5kw",
    "power": {
      "solarKw": 0.0,
      "bessKw": -0.006,
      "gridKw": 0.48,
      "dgKw": 0.0,
      "loadKw": 0.06,
      "inverterTareKw": -0.042
    },
    "battery": {
      "socPct": 0,
      "voltageV": 45.84,
      "currentA": -0.14,
      "temperatureC": null,
      "capacityAh": 70,
      "status": "idle"
    },
    "grid": {
      "phase": "single_phase",
      "voltageL1V": 256.0,
      "currentL1A": 0.4,
      "frequencyHz": 50.01,
      "limiterCtKw": -0.44,
      "relayClosed": true
    },
    "mppt": [
      { "id": 1, "voltageV": 3.8, "currentA": 0.0, "powerKw": 0.0 },
      { "id": 2, "voltageV": 4.1, "currentA": 0.0, "powerKw": 0.0 }
    ],
    "thermal": {
      "igbtTempC": 37.7,
      "radiatorTempC": 37.9
    },
    "accumulators": {
      "dailyPvKwh": 0.0,
      "dailyLoadKwh": 0.0,
      "dailyGridBuyKwh": 0.0,
      "dailyGridSellKwh": 0.0,
      "lifetimePvKwh": 170.2,
      "lifetimeActiveKwh": 130.6
    }
  }
}
```

### 4. Dynamic UI Layout Adaptations

#### 4.1 BESS Subsystem Page (`app/sites/[id]/bess/page.tsx`)
- When `equipment_profile === 'hybrid_inverter_5kw'`:
  - Render **Compact 48V Battery Pack Diagnostics**:
    - Pack Voltage: `45.84 V`
    - Rated Capacity: `70 Ah` (approx. $3.36\text{ kWh}$ nominal)
    - State of Charge: `0.0% SoC`
    - Current: `-0.14 A`
    - Temperature Badge: `"External NTC Disconnected"` (when $-75^\circ C$).
  - Gracefully **hide** the 16-Cell CANbus Heatmap, Liquid Chiller Glycol Loop, and NFPA 855 Aerosol panels (or replace with a non-intrusive card: *"Available on Utility Megawatt Container installations"*).

#### 4.2 Solar Subsystem Page (`app/sites/[id]/solar/page.tsx`)
- In `mppt-diagnostic-stack.tsx`:
  - When `equipment_profile === 'hybrid_inverter_5kw'`, render **2 MPPT Tracker Cards** (MPPT 1 = `pv1`, MPPT 2 = `pv2`) instead of 24 central inverter strings.
  - Display raw DC voltages (`3.8 V`, `4.1 V`) and currents (`0.0 A`, `0.0 A`) with night-mode indicators.

#### 4.3 Grid Subsystem Page (`app/sites/[id]/grid/page.tsx`)
- If $L_2$ voltage is $0\text{ V}$, toggle to **Single-Phase Intertie Mode**:
  - Active Phase: $L_1\text{-N}$ ($256\text{ V}$, $50.01\text{ Hz}$).
  - Display External CT Limiter feedback: $-440\text{ W}$ (`ct_power_w`).
  - Hide 3-phase delta gauges $V_{L1-L2}, V_{L2-L3}, V_{L3-L1}$.

#### 4.4 Generator Subsystem Page (`app/sites/[id]/dg/page.tsx`)
- Focus on AC transfer parameters:
  - Output: `0.0 kW`
  - Terminal Voltage: `0.6 V`
  - Generator Relay Status: `Connected / Standby` (decoded from bitmask `20496`).
  - Cumulative Runtime: `0.0 h`.

---

## Design System & Visual Adherence
- **Color Palette Tokens**:
  - Background: Void Black (`#060709`) / High-Contrast Solar Ice (`#F4F6FB`).
  - Card Surfaces: Obsidian Dark (`#0B0D13`) / Pure White Slate (`#FFFFFF`).
  - Accent / Primary CTA: Neon Pink (`#FF2A85`).
  - Solar Active Power: Electric Amber (`#FFD600`).
  - BESS Flow: Laser Cyan (`#00F0FF`).
  - Grid Exchange: Electric Purple (`#9D4EDD`).
  - Generator Backup: Hi-Viz Orange (`#FF6B00`).
  - Normal Status: Cyber Emerald (`#00E676`).
- **Typography**: All electrical values ($kW, V, A, Hz, \%, kWh, ^\circ C$) strictly rendered with `font-mono`.
- **Touch Ergonomics**: All interactive buttons, tabs, and filters satisfy minimum $48 \times 48\text{ px}$ mobile tap areas.

---

## Security & RBAC Requirements
1. **Clerk Authentication Exclusivity**:
   - Every read and write route is guarded by `await auth()` from `@clerk/nextjs/server`.
   - Access to site telemetry is scoped to the active `orgId`.
2. **Edge API Ingestion Guard**:
   - `POST /api/v1/telemetry/ingest` validates an edge bearer token (`Authorization: Bearer <token>`) or webhook secret to prevent unauthorized telemetry injection.
3. **No Direct Database Bypass**: Frontend client components do not execute raw database queries; all communication passes through validated Route Handlers or Server Actions.

---

## Acceptance Criteria
- [ ] Direct Supabase database queries for telemetry in `lib/energy/` are decoupled and routed through the new IoT Data Adapter layer.
- [ ] Clerk login, signup, user session, and organization switcher remain 100% operational.
- [ ] Provided Deye 5kW JSON payload can be ingested and normalized into domain structures without runtime errors.
- [ ] 5-Node Animated Energy Flow Visualizer renders accurately with the Deye metrics ($0\text{ kW}$ Solar, $-0.006\text{ kW}$ BESS, $+0.48\text{ kW}$ Grid, $0\text{ kW}$ DG, $0.06\text{ kW}$ Load).
- [ ] Solar subsystem dynamically reflows to display 2/4 MPPT trackers for 5kW hybrid inverters instead of crashing or showing blank rows for 24 strings.
- [ ] Grid subsystem detects single-phase ($256\text{ V}$) and hides inactive 3-phase meters.
- [ ] Battery temperature reading of $-75^\circ C$ displays as `"NTC Sensor Disconnected"` rather than an active freeze alarm.
- [ ] Megawatt-container specific modules (16-cell BMS matrix, liquid chiller, NFPA 855) are cleanly hidden when viewing a 5kW hybrid site.
- [ ] `npm run typecheck` passes with **0 errors**.
- [ ] `npm run lint` passes with **0 errors**.

---

## Checks to Run
```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact Manual Test Steps (Desktop & Mobile)

### 1. Ingestion Verification
1. Dispatch the provided sample Deye payload via `curl` or Postman:
   ```bash
   curl -X POST http://localhost:3000/api/v1/telemetry/ingest \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer neon_gw_test_token" \
     -d @deye_sample_payload.json
   ```
2. Confirm `200 OK` response with `{ "success": true, "recordedAt": "..." }`.

### 2. Desktop Verification (Viewport: $1440 \times 900$)
1. Navigate to `/` (Fleet Cockpit):
   - Verify the top aggregate strip displays normalized kW values ($0.00\text{ kW}$ Solar, $0.48\text{ kW}$ Grid Import, $0.06\text{ kW}$ Load).
2. Open `/sites/[id]`:
   - Inspect the 5-node flow canvas: animated conduits should glow purple from Grid into Load and Inverter.
3. Open `/sites/[id]/solar`:
   - Verify that 2 MPPT tracker cards (`pv1` and `pv2`) are shown with $3.8\text{ V}$ and $4.1\text{ V}$ voltages.
4. Open `/sites/[id]/bess`:
   - Verify the 48V pack summary ($45.84\text{ V}$, $70\text{ Ah}$, $0\%\text{ SoC}$) is rendered, and container-scale chillers and 16-cell heatmaps are hidden.
5. Open `/sites/[id]/grid`:
   - Verify Single-Phase mode is active ($256\text{ V}$ L1-N) with $-440\text{ W}$ CT limiter displayed.
6. Toggle between Cyber Dark Mode and High-Contrast Day Light Mode; verify seamless contrast.

### 3. Mobile Verification (Viewport: $390 \times 844$)
1. Verify the bottom cyber-dock navigation remains fixed at `h-16`.
2. Inspect the 5-node energy flow: verify it reflows vertically without clipped conduits.
3. Open the component telemetry drawer and swipe down to dismiss.
4. Confirm all buttons and touch targets meet the $\ge 48\text{ px}$ ergonomics standard.
