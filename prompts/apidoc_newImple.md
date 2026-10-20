# NEON ENERGY — Backend API Specification & Integration Guide
## Implementation Reference for Custom IoT Database & Deye Hybrid Inverter Telemetry
**Target Audience**: Backend Engineers, Platform Engineers, Database Architects  
**Specification Version**: `2.0.0-PROD-DEYE`  
**Base URL**: `https://api.neonenergy.io/api/v1` (or internal microservice: `http://localhost:4000/api/v1`)  
**Authentication**: Clerk Session JWT (`Authorization: Bearer <clerk_token>`) & Edge Gateway Bearer Keys  
**Target Hardware Data Source**: Deye Hybrid Inverter (`Model: Feston-5kW`, `Slave Address: 1`, `48V Low-Voltage BESS`, `Single-Phase 230V/256V AC`)

---

## 1. Executive Architecture & Core Rules

### 1.1 Architecture & Separation of Concerns
1. **Authentication & Identity**: Handled exclusively via **Clerk** (`@clerk/nextjs`). Every request made from the frontend includes a Clerk session token in the `Authorization` header. The backend must extract `userId` and `orgId` from the Clerk JWT claims.
2. **Data Persistence**: Telemetry, historical time-series, device inventories, and site configurations are stored in **your backend database** (not in Supabase).
3. **Frontend Consumer**: NEON ENERGY (Next.js 15 App Router, React 19, TypeScript strict mode). All numerical metrics are formatted in monospace (`font-mono`) and scaled to standard industrial units ($kW$, $MW$, $kWh$, $MWh$, $V$, $A$, $Hz$, $\%$, $^\circ C$).

### 1.2 Universal Mathematical Conventions & Unit Conversions
The raw Deye IoT datalogger reports electrical quantities in **Watts ($W$)**, **Volts ($V$)**, **Amperes ($A$)**, and cumulative energy in **Kilowatt-hours ($kWh$)**.
The backend MUST perform these exact conversions before serving responses:
- **Active Power**: Convert raw Watts to Kilowatts:
  $$\text{Power (kW)} = \frac{\text{Power (W)}}{1000.0}$$
  *Example*: `grid_power_w: 480` $\implies 0.48\text{ kW}$; `load_power_w: 60` $\implies 0.06\text{ kW}$.
- **BESS Power Sign Convention**:
  - **Negative ($-$)**: Battery is **Charging** (absorbing power from solar or grid).
  - **Positive ($+$)**: Battery is **Discharging** (injecting power into the facility bus).
  - *Example*: `battery_power_w: -6` $\implies -0.006\text{ kW}$ (charging/standby).
- **Utility Grid Sign Convention**:
  - **Positive ($+$)**: Net **Import** from the utility grid (buying electricity).
  - **Negative ($-$)**: Net **Export** into the utility grid (feed-in tariff sell).
  - *Example*: `grid_power_w: 480` $\implies +0.48\text{ kW}$ (importing).
- **Battery Temperature Anomaly Filter**:
  A raw value of `battery_temperature_c: -75` indicates a missing or disconnected external NTC probe.
  $$\text{temperature\_c} = \begin{cases} \text{null}, & \text{if } T < -40^\circ C \\ T, & \text{otherwise} \end{cases}$$
- **Single-Phase vs 3-Phase Detection**:
  If `grid_voltage_l2_v === 0` and `grid_voltage_l1_v > 0`, the site operates on a **Single-Phase (L1-N, 230V Nominal)** topology.

### 1.3 Standard JSON Response Envelopes

#### Success Envelope (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-20T13:45:00.000Z",
    "siteId": "site-01",
    "deviceId": "deye-inverter-1"
  }
}
```

#### Error Envelope (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "error": "Site telemetry not found or offline",
  "code": "SITE_TELEMETRY_OFFLINE",
  "details": [
    {
      "field": "siteId",
      "issue": "No telemetry packets received in the last 15 minutes"
    }
  ],
  "timestamp": "2026-10-20T13:45:00.000Z"
}
```

---

## 2. Raw Ingestion Reference (What Is Stored in Your Database)

Your database stores the raw IoT packet emitted by the Deye Feston-5kW edge gateway:

```json
{
  "timestamp": "2026-10-09T19:27:33.157411+00:00",
  "site_id": "site-01",
  "device_id": "deye-inverter-1",
  "device": {
    "manufacturer": "Deye",
    "model": "Feston-5kW",
    "slave_address": 1,
    "port": "/dev/ttyS0",
    "power_unit_w": 10
  },
  "dashboard": {
    "battery": { "power_w": -6, "soc_percent": 0, "voltage_v": 45.84, "current_a": -0.14, "temperature_c": -75 },
    "grid": { "power_w": 480, "frequency_hz": 50.01, "voltage_v": 256, "current_a": 0.4, "ct_power_w": -440, "ld_power_w": -440 },
    "pv": {
      "m1": { "power_w": 0, "voltage_v": 3.8, "current_a": 0 },
      "m2": { "power_w": 0, "voltage_v": 4.1, "current_a": 0 }
    },
    "inverter": { "power_w": -42, "frequency_hz": 50.03, "voltage_v": 256, "current_a": 1 },
    "load": { "power_w": 60, "voltage_v": 256.6 },
    "gen": { "power_w": 0, "voltage_v": 0.6, "frequency_hz": 0 }
  },
  "telemetry": {
    "grid_frequency_hz": 50.01, "grid_voltage_l1_v": 256, "grid_voltage_l2_v": 0, "grid_current_l1_a": 0.4, "grid_power_w": 480,
    "grid_external_limiter1_power_w": -440, "grid_external_limiter_current_l1_a": 3.85, "grid_relay_status": 1,
    "inverter_voltage_l1_v": 256, "inverter_current_l1_a": 1, "inverter_l1_power_w": -42, "inverter_power_w": -42, "inverter_frequency_hz": 50.03,
    "load_voltage_l1_v": 256.6, "load_power_w": 60, "load_current_l1_a": 0.06, "load_frequency_hz": 50.03,
    "battery_temperature_c": -75, "battery_voltage_v": 45.84, "battery_soc_percent": 0, "battery_status": 6, "battery_power_w": -6, "battery_current_a": -0.14,
    "pv1_power_w": 0, "pv2_power_w": 0, "pv3_power_w": 0, "pv4_power_w": 0, "pv1_voltage_v": 3.8, "pv1_current_a": 0, "pv2_voltage_v": 4.1, "pv2_current_a": 0,
    "gen_power_w": 0, "gen_voltage_v": 0.6, "gen_relay_status": 20496, "gen_frequency_hz": 0,
    "run_state": 2, "run_state_text": "normal", "radiator_temperature_c": 37.9, "igbt_temperature_c": 37.7,
    "warning_word_1": 0, "warning_word_2": 0, "fault_word_1": 0, "fault_word_2": 0, "fault_word_3": 0, "fault_word_4": 0,
    "battery_corrected_capacity_ah": 70, "rcd_leak_current_a": 0,
    "daily_pv_energy_kwh": 0, "daily_battery_charge_kwh": 0, "daily_battery_discharge_kwh": 0,
    "daily_grid_buy_kwh": 0, "daily_grid_sell_kwh": 0, "daily_load_energy_kwh": 0, "daily_generator_energy_kwh": 0,
    "total_active_energy_kwh": 130.6, "history_pv_energy_kwh": 170.2, "total_grid_buy_kwh": 26.2, "total_grid_sell_kwh": 154.8,
    "total_battery_charge_kwh": 14.3, "total_battery_discharge_kwh": 2.5, "total_load_energy_kwh": 3.7
  }
}
```

---

## 3. Endpoints to Build (Page-by-Page Requirements)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND ENDPOINT MAP                            │
├────────────────────────────────────────────────────────────────────────┤
│ 1. GET  /api/v1/fleet/summary            - Fleet Topbar & Aggregates   │
│ 2. GET  /api/v1/sites                    - Fleet Cockpit Site Cards    │
│ 3. GET  /api/v1/sites/:id/live           - 5-Node Flow Canvas & Master │
│ 4. GET  /api/v1/sites/:id/solar/live     - Solar Subsystem & MPPT Stack│
│ 5. GET  /api/v1/sites/:id/bess/live      - BESS Subsystem Telemetry    │
│ 6. GET  /api/v1/sites/:id/grid/live      - Grid Intertie & Limiter     │
│ 7. GET  /api/v1/sites/:id/dg/live        - Generator Peaker Telemetry  │
│ 8. GET  /api/v1/sites/:id/load/live      - Facility Load Profiler      │
│ 9. GET  /api/v1/sites/:id/analytics      - Historical Energy Dispatch  │
│ 10. GET /api/v1/sites/:id/alarms         - Modbus Fault & Warning Feed │
│ 11. POST /api/v1/telemetry/ingest        - Edge Ingestion Push (IoT)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Endpoint 1: Fleet Aggregate Summary
- **Route**: `GET /api/v1/fleet/summary`
- **Frontend Consumer**: Cockpit Topbar Aggregate Strip (`app/page.tsx`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Returns organization-wide cumulative metrics aggregated across all active sites.

#### Field Calculation Formulas:
| Response Field | Physical Unit | Aggregation Formula across Org Sites |
|---|---|---|
| `totalSolarKw` | $kW$ | $\sum (\text{site.pv1\_power\_w} + \text{site.pv2\_power\_w}) / 1000$ |
| `totalBessKwh` | $kWh$ | $\sum (\text{site.battery\_voltage\_v} \times \text{site.battery\_corrected\_capacity\_ah}) / 1000$ |
| `avgBessSocPct` | $\%$ | Arithmetic mean of `site.battery_soc_percent` |
| `activeLoadKw` | $kW$ | $\sum (\text{site.load\_power\_w}) / 1000$ |
| `netGridKw` | $kW$ | $\sum (\text{site.grid\_power\_w}) / 1000$ |
| `activeGensetsCount` | count | Count of sites where `gen_power_w > 0` |
| `totalYieldTodayKwh` | $kWh$ | $\sum (\text{site.daily\_pv_energy\_kwh})$ |
| `totalCo2SavedTodayKg`| $kg$ | $\sum (\text{site.daily\_pv_energy\_kwh}) \times 0.49$ |
| `totalTreesEquivalent`| count | $\text{totalCo2SavedTodayKg} / 21.8$ |

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "totalSolarKw": 4.85,
    "totalBessKwh": 3.36,
    "avgBessSocPct": 0.0,
    "activeLoadKw": 0.06,
    "netGridKw": 0.48,
    "activeGensetsCount": 0,
    "activeAlarmsCount": 0,
    "totalYieldTodayKwh": 18.5,
    "totalCo2SavedTodayKg": 9.06,
    "totalTreesEquivalent": 0,
    "totalRevenueTodayInr": 157.25
  },
  "timestamp": "2026-10-20T13:45:00.000Z"
}
```

---

### Endpoint 2: Site List with Mini-Flow Snapshots
- **Route**: `GET /api/v1/sites`
- **Frontend Consumer**: Cockpit Site Cards Grid (`components/site-cockpit-card-preview.tsx`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Returns all sites in the organization with their latest normalized power metrics for mini animated conduits and status badges.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "site-01",
      "name": "Feston Commercial Hybrid Plant",
      "slug": "feston-commercial-hybrid",
      "locationCity": "Pune",
      "locationState": "Maharashtra",
      "plantType": "rooftop_hybrid",
      "equipmentProfile": "hybrid_inverter_5kw",
      "status": "online",
      "subscriptionStatus": "active",
      "capacities": {
        "solarKwp": 5.0,
        "bessKwh": 3.36,
        "bessKw": 5.0,
        "dgKva": 5.0,
        "contractedDemandKva": 10.0
      },
      "installedAssets": {
        "hasSolar": true,
        "hasBess": true,
        "hasDg": true,
        "hasGrid": true
      },
      "livePower": {
        "solarKw": 0.0,
        "bessKw": -0.006,
        "bessSocPct": 0.0,
        "gridKw": 0.48,
        "dgKw": 0.0,
        "loadKw": 0.06,
        "dgRunning": false
      },
      "todayEnergy": {
        "solarYieldKwh": 0.0,
        "loadConsumptionKwh": 0.0,
        "gridImportKwh": 0.0,
        "gridExportKwh": 0.0,
        "bessChargeKwh": 0.0,
        "bessDischargeKwh": 0.0,
        "co2SavedKg": 0.0
      },
      "lastUpdated": "2026-10-09T19:27:33.157Z"
    }
  ]
}
```

---

### Endpoint 3: Site Live State & 5-Node Energy Flow
- **Route**: `GET /api/v1/sites/:siteId/live`
- **Frontend Consumer**: Site Detail Screen (`/sites/[id]`) and Animated Energy Flow Canvas (`flow-engine.ts`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Returns the real-time electrical transfer balances across all 5 physical nodes.

#### Physical Transfer Balancing Rules:
The backend computes direct conduit kilowatt transfers from the raw telemetry:
1. `solarToLoadKw`: $\min(\text{solarKw}, \text{loadKw})$.
2. `solarToBessKw`: If $\text{solarKw} > \text{loadKw}$ and $\text{bessKw} < 0$, $\min(\text{solarKw} - \text{loadKw}, |\text{bessKw}|)$.
3. `solarToGridKw`: If $\text{solarKw} > \text{loadKw} + |\text{bessKw}|$ and $\text{gridKw} < 0$, $\text{solarKw} - \text{loadKw} - |\text{bessKw}|$.
4. `bessToLoadKw`: If $\text{bessKw} > 0$, $\min(\text{bessKw}, \max(0, \text{loadKw} - \text{solarKw}))$.
5. `gridToLoadKw`: If $\text{gridKw} > 0$, $\max(0, \text{loadKw} - \text{solarKw} - \max(0, \text{bessKw}))$.
6. `dgToLoadKw`: If $\text{dgKw} > 0$, supplies remaining load deficit.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "siteId": "site-01",
    "timestamp": "2026-10-09T19:27:33.157Z",
    "equipmentProfile": "hybrid_inverter_5kw",
    "operationalMode": "GRID_IMPORT_ASSIST",
    "operationalModeDescription": "Utility Grid supplying 0.48 kW to support facility loads and inverter tare standby.",
    "power": {
      "solarKw": 0.0,
      "bessKw": -0.006,
      "gridKw": 0.48,
      "dgKw": 0.0,
      "loadKw": 0.06,
      "inverterTareKw": -0.042,
      "nodeImbalanceKw": 0.0
    },
    "transfers": {
      "solarToLoadKw": 0.0,
      "solarToBessKw": 0.0,
      "solarToGridKw": 0.0,
      "bessToLoadKw": 0.0,
      "gridToLoadKw": 0.06,
      "dgToLoadKw": 0.0
    },
    "limiter": {
      "ctPowerKw": -0.44,
      "ctCurrentA": 3.85
    },
    "runState": {
      "code": 2,
      "text": "normal"
    }
  }
}
```

---

### Endpoint 4: Solar Subsystem Telemetry & MPPT Tracker Stack
- **Route**: `GET /api/v1/sites/:siteId/solar/live`
- **Frontend Consumer**: Solar Subsystem Page (`/sites/[id]/solar`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Supplies dual-tracker MPPT inputs, inverter thermal state, and raw SunSpec/Deye registers.

#### Field Mapping:
- `mpptTrackers`: Array populated from `pv1` and `pv2` (and `pv3`, `pv4` if equipped).
- `igbtTempC`: `telemetry.igbt_temperature_c` ($37.7^\circ C$).
- `radiatorTempC`: `telemetry.radiator_temperature_c` ($37.9^\circ C$).
- `inverterEfficiencyPct`: If $P_{dc} > 0$, $(P_{ac} / P_{dc}) \times 100$, else `0.0`.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "inverter": {
      "model": "Deye Feston-5kW",
      "slaveAddress": 1,
      "port": "/dev/ttyS0",
      "acPowerKw": -0.042,
      "acVoltageV": 256.0,
      "acCurrentA": 1.0,
      "acFrequencyHz": 50.03,
      "radiatorTempC": 37.9,
      "igbtTempC": 37.7,
      "efficiencyPct": 0.0,
      "runState": "normal"
    },
    "mpptTrackers": [
      {
        "channel": 1,
        "name": "MPPT 1 (String A)",
        "voltageV": 3.8,
        "currentA": 0.0,
        "powerKw": 0.0,
        "status": "night_idle"
      },
      {
        "channel": 2,
        "name": "MPPT 2 (String B)",
        "voltageV": 4.1,
        "currentA": 0.0,
        "powerKw": 0.0,
        "status": "night_idle"
      }
    ],
    "energy": {
      "dailyYieldKwh": 0.0,
      "lifetimeYieldKwh": 170.2,
      "specificYieldKwhPerKwp": 0.0
    }
  }
}
```

---

### Endpoint 5: BESS Subsystem Telemetry
- **Route**: `GET /api/v1/sites/:siteId/bess/live`
- **Frontend Consumer**: BESS Subsystem Page (`/sites/[id]/bess`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Supplies 48V low-voltage battery pack telemetry, SoC %, current, and health status.

#### Special Processing:
- If `battery_temperature_c < -40`, return `"temperatureC": null` and `"tempSensorInstalled": false`.
- Calculate nominal usable energy capacity:
  $$\text{Nominal Energy (kWh)} = \frac{48.0\text{ V} \times \text{battery\_corrected\_capacity\_ah}}{1000.0} = \frac{48 \times 70}{1000} = 3.36\text{ kWh}$$

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "equipmentProfile": "hybrid_inverter_5kw",
    "pack": {
      "voltageV": 45.84,
      "currentA": -0.14,
      "powerKw": -0.006,
      "socPct": 0.0,
      "capacityAh": 70.0,
      "ratedEnergyKwh": 3.36,
      "statusCode": 6,
      "statusDescription": "standby_ready",
      "temperatureC": null,
      "tempSensorInstalled": false
    },
    "energy": {
      "dailyChargeKwh": 0.0,
      "dailyDischargeKwh": 0.0,
      "lifetimeChargeKwh": 14.3,
      "lifetimeDischargeKwh": 2.5,
      "roundTripEfficiencyPct": 88.5
    },
    "containerDiagnostics": {
      "available": false,
      "reason": "16-Cell BMS matrix and liquid chiller loops are equipped on utility container installations"
    }
  }
}
```

---

### Endpoint 6: Utility Grid Intertie & Power Quality
- **Route**: `GET /api/v1/sites/:siteId/grid/live`
- **Frontend Consumer**: Grid Subsystem Page (`/sites/[id]/grid`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Delivers grid voltage, frequency, active export/import, CT limiter power, and relay status.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "phaseMode": "single_phase",
    "intertie": {
      "powerKw": 0.48,
      "direction": "import",
      "voltageL1V": 256.0,
      "currentL1A": 0.4,
      "frequencyHz": 50.01,
      "relaySynchronized": true,
      "relayStatusRaw": 1
    },
    "externalLimiter": {
      "activePowerKw": -0.44,
      "currentA": 3.85,
      "limiterTargetKw": 0.0
    },
    "energy": {
      "dailyImportKwh": 0.0,
      "dailyExportKwh": 0.0,
      "lifetimeImportKwh": 26.2,
      "lifetimeExportKwh": 154.8,
      "dailyReactiveKvarh": -14.9
    }
  }
}
```

---

### Endpoint 7: Diesel Generator Peaker Telemetry
- **Route**: `GET /api/v1/sites/:siteId/dg/live`
- **Frontend Consumer**: Generator Subsystem Page (`/sites/[id]/dg`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Provides AC electrical power delivered to the inverter's Gen port, dry-contact relay state, and daily runtime.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "electrical": {
      "powerKw": 0.0,
      "voltageV": 0.6,
      "frequencyHz": 0.0,
      "isRunning": false,
      "relayStatusRaw": 20496,
      "transferRelayClosed": false
    },
    "energy": {
      "dailyRuntimeHours": 0.0,
      "dailyEnergyKwh": 0.0,
      "lifetimeEnergyKwh": 0.0
    },
    "engineDiagnostics": {
      "available": false,
      "notice": "Engine mechanical sensors (oil pressure, RPM, fuel level) require an external DSE / J1939 CANbus gateway"
    }
  }
}
```

---

### Endpoint 8: Facility Load Demand Profiler
- **Route**: `GET /api/v1/sites/:siteId/load/live`
- **Frontend Consumer**: Facility Load Subsystem Page (`/sites/[id]/load`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Provides active facility power draw, voltage, frequency, and energy consumption accumulators.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "liveDemand": {
      "activePowerKw": 0.06,
      "voltageL1V": 256.6,
      "currentL1A": 0.06,
      "frequencyHz": 50.03
    },
    "energy": {
      "dailyConsumptionKwh": 0.0,
      "totalActiveEnergyKwh": 3.7,
      "yearLoadEnergyKwh": 6553.5
    }
  }
}
```

---

### Endpoint 9: Historical Energy Dispatch & Consumption Analytics
- **Route**: `GET /api/v1/sites/:siteId/analytics`
- **Query Parameters**:
  - `timeframe`: `"today"` | `"7d"` | `"30d"` | `"ytd"` | `"custom"`
  - `interval`: `"15m"` | `"1h"` | `"1d"` (default: `"1h"`)
  - `startDate`: ISO 8601 string (e.g. `2026-10-01T00:00:00Z`)
  - `endDate`: ISO 8601 string (e.g. `2026-10-20T23:59:59Z`)
- **Frontend Consumer**: Historical Dispatch Chart & TOU Arbitrage (`/analytics`)
- **Headers**: `Authorization: Bearer <clerk_jwt>`

#### SQL Time-Series Aggregation Logic:
Group raw telemetry records into hourly buckets:
```sql
SELECT
  date_trunc('hour', timestamp) AS bucket_time,
  AVG((telemetry->>'pv1_power_w')::float + (telemetry->>'pv2_power_w')::float) / 1000.0 AS avg_solar_kw,
  AVG((telemetry->>'load_power_w')::float) / 1000.0 AS avg_load_kw,
  AVG(CASE WHEN (telemetry->>'battery_power_w')::float < 0 THEN ABS((telemetry->>'battery_power_w')::float) ELSE 0 END) / 1000.0 AS avg_bess_charge_kw,
  AVG(CASE WHEN (telemetry->>'battery_power_w')::float > 0 THEN (telemetry->>'battery_power_w')::float ELSE 0 END) / 1000.0 AS avg_bess_discharge_kw,
  AVG(CASE WHEN (telemetry->>'grid_power_w')::float > 0 THEN (telemetry->>'grid_power_w')::float ELSE 0 END) / 1000.0 AS avg_grid_import_kw,
  AVG(CASE WHEN (telemetry->>'grid_power_w')::float < 0 THEN ABS((telemetry->>'grid_power_w')::float) ELSE 0 END) / 1000.0 AS avg_grid_export_kw,
  MAX((telemetry->>'battery_soc_percent')::float) AS end_bess_soc_pct
FROM telemetry_records
WHERE site_id = :siteId AND timestamp BETWEEN :startDate AND :endDate
GROUP BY 1 ORDER BY 1 ASC;
```

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "siteId": "site-01",
    "timeframe": "today",
    "interval": "1h",
    "series": [
      {
        "timestamp": "2026-10-09T08:00:00.000Z",
        "solarGenKw": 1.45,
        "bessChargeKw": 0.85,
        "bessDischargeKw": 0.0,
        "gridImportKw": 0.0,
        "gridExportKw": 0.20,
        "loadDemandKw": 0.40,
        "bessSocPct": 42.5
      },
      {
        "timestamp": "2026-10-09T12:00:00.000Z",
        "solarGenKw": 4.60,
        "bessChargeKw": 1.80,
        "bessDischargeKw": 0.0,
        "gridImportKw": 0.0,
        "gridExportKw": 2.10,
        "loadDemandKw": 0.70,
        "bessSocPct": 88.0
      }
    ],
    "financialSummary": {
      "solarSelfConsumptionPct": 48.5,
      "touArbitrageSavingsInr": 142.50,
      "avoidedDemandPenaltiesInr": 0.0,
      "netElectricityCostInr": -86.40,
      "co2AbatedKg": 24.5,
      "treesEquivalent": 1
    }
  }
}
```

---

### Endpoint 10: Alarms, Warnings & Diagnostic Events
- **Route**: `GET /api/v1/sites/:siteId/alarms`
- **Frontend Consumer**: Cockpit Alarm Ticker & Alarms Drawer
- **Headers**: `Authorization: Bearer <clerk_jwt>`
- **Description**: Decodes raw Modbus 16-bit register bitmasks into structured alarm objects.

#### Deye Modbus Register Bitmask Decoding Table:
The backend engineer MUST parse the integer bitmasks into discrete alarm codes:

| Register Field | Bit Index | Hex Mask | Alarm Severity | Alarm Code | Human-Readable Message |
|---|---|---|---|---|---|
| `fault_word_1` | Bit 0 | `0x0001` | `critical` | `GRID_LOST` | Utility AC Grid Voltage Lost (Anti-Islanding Engaged) |
| `fault_word_1` | Bit 1 | `0x0002` | `warning` | `GRID_VOLT_HIGH` | Grid AC Voltage Exceeds Upper Safety Limit (>260V) |
| `fault_word_1` | Bit 2 | `0x0004` | `warning` | `GRID_VOLT_LOW` | Grid AC Voltage Below Lower Safety Limit (<195V) |
| `fault_word_1` | Bit 3 | `0x0008` | `warning` | `GRID_FREQ_HIGH` | Grid Frequency Exceeds 50.5 Hz |
| `fault_word_1` | Bit 4 | `0x0010` | `warning` | `GRID_FREQ_LOW` | Grid Frequency Below 49.5 Hz |
| `fault_word_1` | Bit 7 | `0x0080` | `critical` | `INV_OVER_TEMP` | Inverter Radiator / IGBT Temperature Overheating (>75°C) |
| `fault_word_2` | Bit 0 | `0x0001` | `warning` | `BATT_VOLT_LOW` | Battery Pack Terminal Voltage Critically Low (<44.0V) |
| `fault_word_2` | Bit 1 | `0x0002` | `warning` | `BATT_VOLT_HIGH` | Battery Pack Terminal Voltage Overvoltage (>58.4V) |
| `fault_word_2` | Bit 4 | `0x0010` | `critical` | `BATT_OVER_TEMP` | Battery BMS High Temperature Protection Triggered |
| `warning_word_1`| Bit 2 | `0x0004` | `warning` | `METER_COMM_FAIL`| External CT / RS485 Energy Meter Communication Lost |
| `warning_word_1`| Bit 3 | `0x0008` | `warning` | `BMS_COMM_FAIL` | Low-Voltage CANbus/RS485 BMS Link Unreachable |
| `rcd_leak_current_a` | N/A | $> 0.03$ | `critical` | `RCD_LEAK_WARN` | Residual Ground Fault Current Leakage Detected (>30mA) |

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "alm-deye-01",
      "severity": "info",
      "asset": "bess",
      "code": "BATT_STANDBY_LOW_SOC",
      "message": "Battery SoC is at 0.0% (Pack voltage: 45.84V). Inverter switched to grid bypass standby.",
      "timestamp": "2026-10-09T19:27:33.157Z",
      "acknowledged": false
    }
  ]
}
```

---

### Endpoint 11: Edge Telemetry Ingestion (Push Webhook)
- **Route**: `POST /api/v1/telemetry/ingest`
- **Producer**: Industrial Edge Gateway / Python Datalogger in the Field
- **Headers**:
  ```http
  Authorization: Bearer <neon_gateway_secret_key>
  Content-Type: application/json
  ```
- **Request Body**: Accepts the raw Deye IoT JSON packet directly.
- **Backend Action**:
  1. Authenticates gateway secret key.
  2. Stores raw packet in database.
  3. Updates latest cached snapshot for `site_id`.
  4. Appends to hourly time-series aggregation bucket.
  5. Returns `200 OK`.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "recordedAt": "2026-10-20T13:46:12.105Z",
  "siteId": "site-01",
  "deviceId": "deye-inverter-1",
  "message": "Telemetry snapshot recorded and broadcast to realtime subscribers"
}
```

---

## 4. Verification & Testing Checklist for the Backend Developer

Before handing off the APIs to the frontend team, verify that:
1. All power calculations divide raw Watts by 1000.0 ($W \to kW$).
2. The sign conventions match:
   - Battery: Negative = Charging, Positive = Discharging.
   - Grid: Positive = Import, Negative = Export.
3. The battery temperature anomaly filter returns `null` for readings $< -40^\circ C$.
4. Single-phase topology correctly sets `"phaseMode": "single_phase"` when $L_2$ is $0\text{ V}$.
5. All endpoints return data wrapped in the standard envelope (`{ success: true, data: { ... } }`).
6. Every endpoint validates the Clerk session JWT in the `Authorization: Bearer <token>` header.
7. Time-series `/analytics` queries execute efficiently within $< 150\text{ ms}$ using compound indexes on `(site_id, timestamp DESC)`.

*Document finalized for backend implementation.*
