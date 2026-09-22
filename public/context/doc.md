# NEON ENERGY - BESS & SOLAR SITE MONITORING PLATFORM
## Comprehensive Product Specifications, Device Telemetry Blueprint & Schema Architecture

> **Document Status**: Production Blueprint  
> **Version**: 1.0.0  
> **Target Release**: Q4 2026  
> **Theme Aesthetic**: Cyber Black / Neon Pink / Fluorescent Energy Accents  
> **Primary Stacks**: Next.js (App Router), Supabase (Postgres, RLS, Realtime), Clerk (Multi-Tenant Auth), Vercel (Edge/Serverless)  

---

## Table of Contents

1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Target Personas & Core Use Cases](#2-target-personas--core-use-cases)
3. [Business Model & Monetization Architecture](#3-business-model--monetization-architecture)
4. [Information Architecture & Global Navigation](#4-information-architecture--global-navigation)
5. [Feature Spec 1: Fleet Cockpit (Home / Solar Sites Screen)](#5-feature-spec-1-fleet-cockpit-home--solar-sites-screen)
   - [5.1 Global Fleet Aggregation Banner](#51-global-fleet-aggregation-banner)
   - [5.2 Site Cards Grid & List View](#52-site-cards-grid--list-view)
   - [5.3 Search, Multi-Filter, Geo-Sort & Mobile Responsive Toggle](#53-search-multi-filter-geo-sort--mobile-responsive-toggle)
6. [Feature Spec 2: Site Detail & Interactive Real-Time Energy Flow](#6-feature-spec-2-site-detail--interactive-real-time-energy-flow)
   - [6.1 Real-Time 5-Node Energy Flow Visualizer](#61-real-time-5-node-energy-flow-visualizer)
   - [6.2 Component 1: Solar PV Subsystem](#62-component-1-solar-pv-subsystem)
   - [6.3 Component 2: Battery Energy Storage System (BESS)](#63-component-2-battery-energy-storage-system-bess)
   - [6.4 Component 3: Diesel Generator (DG) Subsystem](#64-component-3-diesel-generator-dg-subsystem)
   - [6.5 Component 4: Utility Grid Interconnection](#65-component-4-utility-grid-interconnection)
   - [6.6 Component 5: Facility Load Subsystem](#66-component-5-facility-load-subsystem)
7. [Feature Spec 3: Power Consumption & Historical Analytics](#7-feature-spec-3-power-consumption--historical-analytics)
   - [7.1 Granular Load vs Generation Profiles](#71-granular-load-vs-generation-profiles)
   - [7.2 TOU Tariff Arbitrage & Peak Shaving Economics](#72-tou-tariff-arbitrage--peak-shaving-economics)
   - [7.3 BESS Round-Trip Efficiency & Health Degradation Tracking](#73-bess-round-trip-efficiency--health-degradation-tracking)
   - [7.4 Carbon Offset & ESG Telemetry](#74-carbon-offset--esg-telemetry)
8. [Feature Spec 4: Solar & BESS Maintenance Scheduling Engine](#8-feature-spec-4-solar--bess-maintenance-scheduling-engine)
   - [8.1 Specialized Maintenance Catalog (Solar & BESS Only)](#81-specialized-maintenance-catalog-solar--bess-only)
   - [8.2 4-Step Maintenance Booking Wizard](#82-4-step-maintenance-booking-wizard)
   - [8.3 Technician Dispatch, SLA Tracker & Service Job Cards](#83-technician-dispatch-sla-tracker--service-job-cards)
   - [8.4 Digital Sign-Off Vault & Diagnostic Reports](#84-digital-sign-off-vault--diagnostic-reports)
9. [Device Telemetry & Industrial Field Metrics Master Specification](#9-device-telemetry--industrial-field-metrics-master-specification)
   - [9.1 Inverter / MPPT Telemetry (Modbus / SunSpec)](#91-inverter--mppt-telemetry-modbus--sunspec)
   - [9.2 BESS & BMS Telemetry (CANbus / Modbus RTU)](#92-bess--bms-telemetry-canbus--modbus-rtu)
   - [9.3 DG Genset Controller Telemetry (DeepSea / ComAp)](#93-dg-genset-controller-telemetry-deepsea--comap)
   - [9.4 Grid Multifunction Meter Telemetry (IEC 62053)](#94-grid-multifunction-meter-telemetry-iec-62053)
   - [9.5 Facility Power Quality & Load Profile](#95-facility-power-quality--load-profile)
10. [Database Architecture & Supabase DDL](#10-database-architecture--supabase-ddl)
11. [Mobile Optimization & Responsive Layout Strategy](#11-mobile-optimization--responsive-layout-strategy)
12. [Environment Configuration & Secret Keys Specification (.env.local)](#12-environment-configuration--secret-keys-specification-envlocal)

---

## 1. Executive Summary & Product Vision

**Neon Energy** is a next-generation commercial, industrial, and utility-scale **Renewable Energy & Battery Energy Storage System (BESS) Site Monitoring Platform**.

Renewable energy microgrids, commercial rooftop arrays, and utility solar-plus-storage sites are inherently dynamic. Plant operators and asset owners need instant, high-contrast visibility into live power transfers between multiple active sources:
- **Solar Photovoltaic (PV) Generators**
- **Battery Energy Storage Systems (BESS)**
- **Diesel Generator (DG) Backup Gensets**
- **Utility Grid Feed-in/Import**
- **Industrial Facility Loads**

### The Mission
1. **Real-Time Telemetry Without Latency**: Stream sub-second electrical parameters (kW, kVAR, SoC %, cell voltage, frequency, phase imbalance) directly to sleek visualizers.
2. **Animated Energy Flow Physics**: Provide an intuitive, animated power-flow canvas where current directions and transfer volumes are visually obvious at a glance.
3. **High-Contrast "Black Neon / Pink" UI**: Optimized for both dark control-room operations and field mobile screens under high ambient sunlight.
4. **Monetized O&M Marketplace**: An integrated service engine where asset owners can schedule verified, specialized **Solar & BESS field maintenance** through the platform.

---

## 2. Target Personas & Core Use Cases

| Persona | Primary Goal | Key Daily Workflows | Device Form Factor |
|---|---|---|---|
| **Renewable Asset Manager** | Fleet-wide yield, uptime %, financial ROI, degradation monitoring. | Reviews daily aggregated yield, monitors BESS degradation (SoH), audits peak-shaving savings, approves maintenance quotes. | Desktop (80%) / Tablet (20%) |
| **Site O&M Field Engineer** | Real-time troubleshooting, inverter fault triage, thermal alerts, safety shutoffs. | Checks animated site energy flow, inspects individual inverter MPPT strings, monitors BESS cell temperature deltas, dispatches local tech. | Mobile (75%) / Tablet (25%) |
| **Microgrid Facility Operator** | Guarantee 100% uptime for critical factory loads, minimize expensive diesel generator run-hours. | Balances load shedding, monitors grid outage transitions, ensures BESS reserve margin is maintained. | Desktop Control Room (60%) / Mobile (40%) |
| **Commercial Solar/BESS Owner** | Ensure clean energy utilization, verify electricity bill savings, maintain warranties. | Checks monthly billing offset, books preventive panel cleaning, orders annual BESS thermal coolant inspections. | Mobile (90%) / Desktop (10%) |

---

## 3. Business Model & Monetization Architecture

Neon Energy operates a **two-tier paid monetization model**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEON ENERGY REVENUE ENGINE                      │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. SaaS Monitoring Subscription   │ 2. Paid Maintenance Marketplace    │
│    - Tiered by Installed Capacity │    - On-demand booking through us  │
│    - Per Site / Per Megawatt Fee  │    - Solar & BESS verified techs   │
│    - Automated Stripe/Razorpay    │    - Take-rate + Service margin    │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 3.1 Subscription Tiers (Paid Access)
All user accounts require an active subscription tier tied to their Clerk organization:
- **Starter (Up to 500 kWp / 500 kWh)**:
  - Up to 2 Sites, 15-second telemetry polling, 30-day data retention, basic alerts.
  - Price: **$199 / month** or **$1,990 / year**.
- **Pro Commercial (Up to 2.5 MWp / 5 MWh)**:
  - Up to 10 Sites, 5-second real-time streaming, 1-year historical analytics, automated peak-shaving recommendations, 5% maintenance discount.
  - Price: **$599 / month** or **$5,990 / year**.
- **Utility Enterprise (Unlimited MW / BESS)**:
  - Unlimited Sites, 1-second sub-cycle streaming, multi-year raw Modbus export, custom SCADA/API webhooks, dedicated SLA support, 15% maintenance discount.
  - Price: **Custom Enterprise Quote ($1,499+/mo)**.

### 3.2 Maintenance Marketplace Monetization (Solar & BESS)
Users schedule maintenance services directly through the platform:
- Service charges are billed per engagement or via prepaid maintenance credits.
- Neon Energy dispatches certified high-voltage technicians, drone thermographers, and battery specialists.
- Neon captures a **15% to 25% gross margin** on each scheduled maintenance order.

---

## 4. Information Architecture & Global Navigation

```
                                  NEON ENERGY
                                (App Shell Root)
                                       │
         ┌─────────────────────────────┼──────────────────────────────┐
         ▼                             ▼                              ▼
  [Sites Cockpit]            [Power Consumption]            [Maintenance Hub]
  (Fleet Overview)           (Analytics & Telemetry)        (Solar & BESS Only)
         │
         ▼ (Click Site Card)
  [Site Overview]
  ├── Live 5-Node Energy Flow
  │     ├── Solar PV Node  ──────► [Solar Drilldown Drawer]
  │     ├── BESS Node      ──────► [BESS Battery Drilldown Drawer]
  │     ├── Grid Node      ──────► [Grid & TOU Drawer]
  │     ├── DG Node        ──────► [Diesel Generator Drawer]
  │     └── Load Node      ──────► [Facility Load Drawer]
  ├── System Operating Mode Indicator (Grid-Tied / Islanded / Peak Shave)
  └── Quick Maintenance Dispatch CTA
```

### 4.1 Global Responsive Shell Structure
- **Desktop View**: Fixed left cyber-dock sidebar (`w-20` collapsed or `w-64` expanded), top telemetry bar with fleet aggregate ticker and active alerts, content canvas.
- **Mobile View**: Sticky header with brand logo, organization badge, and connection status indicator. Bottom Cyber-Bar (`h-16`) containing 4 primary navigation items:
  1. `Sites` (Home cockpit)
  2. `Flow` (Quick-access to last selected site's animated flow)
  3. `Analytics` (Power consumption)
  4. `Service` (Maintenance booking)
  5. `Account` (Subscription & profile drawer)

---

## 5. Feature Spec 1: Fleet Cockpit (Home / Solar Sites Screen)

The Home screen provides immediate, high-level operational intelligence across all renewable generation and storage assets under management.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [NEON ENERGY]   Fleet: 8 Sites Online │ 1 Degraded │ 0 Offline     [Search] [Filter] [⚙]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FLEET AGGREGATE STRIP (Black Neon with Pink / Yellow / Cyan Highlights)                │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────┐│
│ │ LIVE GENERATION│ │ BESS FLEET SoC│ │ FLEET LOAD    │ │ NET GRID FEED │ │ ACTIVE ALARM││
│ │ 3.42 MW       │ │ 78.4% (8.2MWh)│ │ 2.18 MW       │ │ +1.24 MW Exp  │ │ 2 Warning  ││
│ │ ▲ +12% vs yday│ │ 6 Discharging │ │ 74% Capacity  │ │ $482/hr Earned│ │ 0 Critical ││
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └────────────┘│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SITE CARDS GRID  [View: Grid / List / Map]               Sort by: [Power Yield ▼]      │
│                                                                                        │
│ ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐     │
│ │ APEX HYBRID PARK #01   [● ONLINE]    │  │ NEXUS INDUSTRIAL SOLAR   [● DEGRADED]│     │
│ │ Pune, MH • 1.2 MWp Solar + 2.0 MWh BESS│ │ Bangalore, KA • 800 kWp + 1.0 MWh  │     │
│ │                                      │  │                                      │     │
│ │ Solar: 940 kW    BESS: 84% [Dischrg] │  │ Solar: 310 kW (Clip) BESS: 42% [Idle]│     │
│ │ Load:  620 kW    Grid: 320 kW (Exp)  │  │ Load:  480 kW    Grid: 170 kW (Imp)  │     │
│ │ DG:    OFF (0kW) Daily: 4,820 kWh    │  │ DG:    OFF (0kW) Daily: 1,940 kWh    │     │
│ │                                      │  │                                      │     │
│ │ [Energy Flow Preview]  [Open Site ➔] │  │ [⚠️ Inverter #3 High Temp] [Open ➔]  │     │
│ └──────────────────────────────────────┘  └──────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Global Fleet Aggregation Banner
Five real-time KPI modules featuring glowing neon accents:
1. **Total Solar Generation**: Instantaneous aggregate MW generation across all PV inverters, daily cumulative MWh yield, and comparison to yesterday's baseline.
2. **Total BESS Fleet Capacity & Average SoC**: Combined instantaneous power (MW charge/discharge), weighted fleet State of Charge percentage, and active charge/discharge count.
3. **Total Facility Consumption (Load)**: Active aggregate load demand across all client sites, peak load recorded today, and capacity utilization percentage.
4. **Net Utility Grid Exchange**: Dynamic real-time balance showing net export (green/pink highlight) or net import (amber highlight), along with estimated hourly financial value.
5. **System Health & Alarm Ticker**: Real-time counter of Critical Faults (flashing neon red), Warnings (neon yellow), and Healthy assets (neon cyan).

### 5.2 Site Cards Grid & List View
Each site is encapsulated in a dark obsidian card (`bg-[#0B0D13]`) with subtle pink borders (`border-pink-500/20` hovering to `border-pink-500/80`).
- **Header**: Site Name, Location (City, State / Coordinates), Plant Type (Commercial C&I, Utility Microgrid, Rooftop Hybrid), Operational Status Badge (`NORMAL`, `WARNING`, `FAULT`, `OFFLINE`).
- **Asset Configuration Icons**: Glyphs indicating the presence of:
  - ☀️ Solar PV (with installed capacity in kWp/MWp)
  - 🔋 BESS (with storage capacity in kWh/MWh and chemistry: LFP / NMC)
  - ⚡ Utility Grid Interconnection (voltage class: 11kV, 33kV, 415V)
  - 🛢️ Diesel Generator (standby kVA capacity)
  - 🏭 Facility Load (contracted demand kVA)
- **Live Metric Strip**:
  - Current Solar Generation (kW)
  - Battery SoC circular gauge or progress bar with charging/discharging animation
  - Current Load (kW)
  - Grid Import / Export status
  - DG status (`STANDBY`, `RUNNING`, `FAULT`)
- **Daily Energy Totals**: Today's cumulative solar generation (kWh) and equivalent carbon offset ($kg\ CO_2$).
- **Action**: Tap/Click navigates directly to that site's interactive Energy Flow screen.

### 5.3 Search, Multi-Filter, Geo-Sort & Mobile Responsive Toggle
- **Filters**:
  - Asset filter: Has Solar, Has BESS, Has DG, Has Grid export.
  - Status filter: Active, Degraded, Critical Alarm, Maintenance Scheduled.
  - Capacity range slider: 0 kW to 10+ MW.
- **Mobile View**: Cards seamlessly collapse into single-column layout with compact vertical metrics, thumb-friendly tap targets (`min-h-[48px]`), and a swipeable quick-view carousel.

---

## 6. Feature Spec 2: Site Detail & Interactive Real-Time Energy Flow

Clicking any site opens the **Site Master Cockpit**, centered around the **Real-Time Energy Flow Visualizer**.

### 6.1 Real-Time 5-Node Energy Flow Visualizer

The Energy Flow diagram renders the physical topology of electrical energy routing across the 5 primary assets:

```
                      ┌────────────────────────┐
                      │     SOLAR PV ARRAY     │
                      │       940.5 kW         │
                      └───────────┬────────────┘
                                  │
                                  ▼ (Dynamic Pulsing Particles)
 ┌──────────────────────┐         │         ┌──────────────────────┐
 │     BESS STORAGE     │         ├────────►│    FACILITY LOAD     │
 │    84% (1,680 kWh)   │◄────────┼─────────┤       620.0 kW       │
 │   -320 kW (Charging) │         │         │  (Factory Machinery) │
 └──────────────────────┘         │         └──────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
         ▼                                                 ▼
┌──────────────────────┐                         ┌──────────────────────┐
│  DIESEL GENERATOR    │                         │     UTILITY GRID     │
│     0 kW [STANDBY]   │                         │  +320.5 kW (Export)  │
│  Fuel: 92% • Oil: OK │                         │  Tariff: Peak Export │
└──────────────────────┘                         └──────────────────────┘
```

#### Energy Flow Canvas Rules & Animations
1. **Directional Flow Particles**: Animated SVG/Canvas glowing dots travel along conduit lines in the direction of real power flow:
   - Solar to Load: Pink/Yellow neon gradient particles.
   - Solar to BESS: Cyan neon particles (charging).
   - BESS to Load: Bright Cyan to Magenta particles (discharging).
   - Solar/BESS to Grid: Neon Green/Pink particles (exporting power).
   - Grid to Load/BESS: Neon Amber particles (importing power).
   - DG to Load: Neon Orange particles (backup diesel running).
2. **Particle Velocity**: Particle speed is mathematically proportional to real-time kW transfer volume (e.g. 100 kW = slow drift; 1,000 kW = high velocity).
3. **Inactive Conduits**: When a component is idle or off (e.g. DG is standby, or Solar at night), the conduit dims to dark slate (`#1E2230`) with zero particle motion.
4. **Interactive Node Cards**: Clicking any of the 5 nodes slides open a specialized component inspection drawer with deep telemetry.

---

### 6.2 Component 1: Solar PV Subsystem (Drill-Down)

When the user clicks the **Solar PV Node**, the **Solar Analytics Drawer** slides open:
- **String Inverter Telemetry**: List of installed inverters (e.g., Sungrow, SMA, Huawei, SolarEdge) showing:
  - Inverter Status (`RUNNING`, `STANDBY`, `DERATING`, `ALARM`)
  - AC Active Power ($kW$) & Reactive Power ($kVAR$)
  - DC Input Power ($kW$), DC Input Voltage ($V_{dc}$), DC Input Current ($A_{dc}$)
  - Inverter Efficiency percentage ($\eta \ge 98.4\%$)
  - Inverter Internal IGBT Temperature ($^\circ C$)
- **MPPT Strings Matrix**: Detailed breakdown of each Maximum Power Point Tracking channel:
  - String 1 through String 24: Individual voltage ($V$), current ($A$), and instantaneous power ($W$).
  - String mismatch detector: Automatic visual flag highlighting strings generating $<85\%$ of the peer average (indicates soiling, bird droppings, or failed string fuse).
- **Meteorological & Performance Metrics**:
  - Global Horizontal Irradiance (GHI, $W/m^2$)
  - Plane of Array Irradiance (POA, $W/m^2$)
  - PV Module Surface Temperature ($^\circ C$)
  - Weather Station Ambient Temperature & Wind Speed ($m/s$)
  - Real-time Performance Ratio (PR % calculated via IEC 61724 standard)
  - Daily Specific Yield ($kWh / kWp$)

---

### 6.3 Component 2: Battery Energy Storage System (BESS) (Drill-Down)

Clicking the **BESS Node** opens the **Battery Management System (BMS) Telemetry Drawer**:
- **State of Charge (SoC %)**: High-resolution circular gauge with charging/discharging time-to-full or time-to-empty forecast.
- **State of Health (SoH %)**: Historical battery degradation curve showing remaining usable capacity versus nameplate rating.
- **DC Bus & Power Parameters**:
  - DC Bus Voltage ($V$) and Pack Current ($A$)
  - Instantaneous Charge / Discharge Power ($kW$)
  - Current C-Rate (e.g. 0.5C, 1.0C)
  - Depth of Discharge (DoD %) today
- **BMS Racks & Cell Thermal Matrix**:
  - Maximum, Minimum, and Average Cell Voltages ($mV$)
  - Cell Voltage Delta ($\Delta V = V_{max} - V_{min}$, alert triggered if $>50\ mV$)
  - Maximum, Minimum, and Average Cell Temperatures ($^\circ C$)
  - Thermal Runaway Prevention Alert status
- **HVAC & Enclosure Climate Telemetry**:
  - BESS Container Internal Temperature & Relative Humidity (%)
  - Liquid Cooling Loop Flow Rate ($L/min$) and In/Out Coolant Temperatures ($^\circ C$)
  - Chiller Compressor Power ($kW$) & Fan RPM
- **Safety & Fire Suppression Telemetry**:
  - Gas detection sensors: Hydrogen ($H_2$), Carbon Monoxide ($CO$), Off-gas aerosol indicators
  - Main DC Contactor Status (Closed / Open / Tripped)
  - Insulation Resistance ($k\Omega$)
- **Cycle Count & Energy Counters**:
  - Lifetime equivalent full cycles (EFC)
  - Cumulative energy charged ($MWh$) vs energy discharged ($MWh$)
  - Round-Trip Efficiency (RTE %) calculation

---

### 6.4 Component 3: Diesel Generator (DG) Subsystem (Drill-Down)

Clicking the **Diesel Generator Node** opens the **Genset Controller Drawer**:
- **Operating State**: `OFF`, `AUTO-STANDBY`, `MANUAL`, `CRANKING`, `RUNNING_UNLOADED`, `RUNNING_LOADED`, `COOLDOWN`, `FAULT_TRIP`.
- **Electrical Output**:
  - 3-Phase Line-to-Line Voltages ($V_{12}, V_{23}, V_{31}$)
  - 3-Phase Line Currents ($I_1, I_2, I_3$)
  - Generator Power ($kW$), Apparent Power ($kVA$), Power Factor ($\cos \phi$)
  - Frequency ($Hz$)
- **Engine Mechanical Telemetry**:
  - Engine RPM (nominal 1,500 / 1,800 RPM)
  - Engine Coolant Temperature ($^\circ C$)
  - Engine Oil Pressure ($bar$ / $kPa$)
  - 12V / 24V Starter Battery Voltage ($V_{dc}$)
- **Fuel Management**:
  - Real-time Fuel Level Percentage (%) and Gallons / Liters remaining
  - Instantaneous Fuel Burn Rate ($L / hr$)
  - Estimated Run-Hours Remaining at current load
  - Diesel Fuel Displacement Savings: Liters of fuel saved today by Solar + BESS microgrid coordination.
- **Maintenance Health Counters**:
  - Total Cumulative Engine Run Hours
  - Hours since last engine oil & filter service
  - Countdown timer to next scheduled DG service (e.g. 250-hour interval)

---

### 6.5 Component 4: Utility Grid Interconnection (Drill-Down)

Clicking the **Utility Grid Node** opens the **Grid Quality & Tariff Drawer**:
- **Connection Status**: `SYNCHRONIZED_TIED`, `ISLANDED_MICROGRID`, `GRID_FAIL_BLACKOUT`.
- **Power Flow Direction**: Real-time Import ($kW$) or Export ($kW$).
- **3-Phase Power Quality Metrics**:
  - Grid Line Voltages and Phase Imbalance (%)
  - Grid Frequency ($Hz$, with high-contrast deviation from 50.0 Hz / 60.0 Hz)
  - Power Factor ($\cos \phi$) with Leading / Lagging status
  - Total Harmonic Distortion: Voltage ($THD_V\ \%$) and Current ($THD_I\ \%$)
- **Time-of-Use (TOU) Tariff Integration**:
  - Current Active Tariff Slot: `OFF_PEAK`, `SHOULDER`, `PEAK`, `CRITICAL_PEAK`
  - Current Import Price per kWh vs Export Feed-in Tariff per kWh
  - Real-time financial velocity: Dollars saved per hour by supplying load from Solar/BESS during peak tariff windows.
- **Net Metering Revenue Counters**:
  - Today's cumulative kWh exported vs imported
  - Month-to-date net electricity cost / credit balance

---

### 6.6 Component 5: Facility Load Subsystem (Drill-Down)

Clicking the **Facility Load Node** opens the **Load Profile & Demand Drawer**:
- **Total Power Demand**: Active Power ($kW$), Reactive Power ($kVAR$), Apparent Power ($kVA$).
- **Contracted Maximum Demand (MD)**:
  - Contracted threshold vs instantaneous peak load
  - Sanctioned load utilization gauge (e.g., 68% of 1,000 kVA contracted MD)
  - MD Penalty Alert: Triggered when load approaches $90\%$ of sanctioned limit without BESS shaving.
- **Circuit / Sub-Load Breakdown**:
  - Critical Loads (Data center, cleanrooms, cooling, emergency circuits)
  - Non-Critical / Sheddable Loads (HVAC chillers, EV chargers, auxiliary pumps)
- **Phase Balance**: Phase-A, Phase-B, Phase-C current balance to detect neutral conductor overheating.

---

## 7. Feature Spec 3: Power Consumption & Historical Analytics

The **Power Consumption Screen** is an advanced time-series analytics and financial intelligence workspace.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [NEON ENERGY]   Power Consumption & Fleet Analytics     Site: [Apex Hybrid Park ▼]     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TIMEFRAME: [Today (15m)] [Last 7 Days] [Last 30 Days] [Year-to-Date] [Custom Range]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STACKED ENERGY BALANCE & DISPATCH CHART (Black Canvas with Glowing Neon Area Curves)   │
│                                                                                        │
│  kW ▲                                                                                  │
│ 1200│                  ████ Solar Generation (Neon Yellow #FFD600)                     │
│ 1000│             ▄▄████████▄▄                                                         │
│  800│           ▄██████████████▄       ████ BESS Discharge (Neon Cyan #00F0FF)         │
│  600│  ────────┼────────────────┼───────████ Load Demand (Neon Pink #FF2A85)            │
│  400│  ░░░░░░░░│                │░░░░░░░████ Grid Import (Neon Purple #9D4EDD)         │
│  200│  ▒▒▒▒▒▒▒▒│                │▒▒▒▒▒▒▒████ DG Generation (Neon Orange #FF6B00)       │
│    0└──────────┴────────────────┴────────────────────────────────────────► Time       │
│       00:00        06:00        12:00        18:00        23:59                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ANALYTICAL CARDS                                                                       │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────────────────┐ │
│ │ SOLAR SELF-CONSUMP.  │ │ BESS PEAK SHAVED     │ │ DIESEL FUEL AVOIDED              │ │
│ │ 88.4%                │ │ 1,420 kWh            │ │ 428 Liters ($684 Saved)          │ │
│ │ 11.6% Fed into Grid  │ │ $312 Peak Tariff Cut │ │ 1,142 kg CO2 Abated              │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Granular Load vs Generation Profiles
- **Interactive Stacked Area Chart**: Visualizes exactly which power source served the load at any minute of the day.
- **BESS Charge/Discharge Overlay**: Shows the diurnal battery cycle (charging during peak solar hours from 10:00 to 14:00, and discharging during evening peak tariff hours from 18:00 to 22:00).
- **Time Aggregations**: 5-minute raw telemetry, 15-minute standard utility billing intervals, hourly averages, and daily totals.

### 7.2 TOU Tariff Arbitrage & Peak Shaving Economics
- Computes the direct financial yield generated by the BESS:
  $$\text{Savings}_{\text{arbitrage}} = \sum \left( E_{\text{discharge}} \times \text{Tariff}_{\text{peak}} \right) - \sum \left( E_{\text{charge}} \times \text{Tariff}_{\text{offpeak}} \right)$$
- Tracks maximum demand peak shaved (e.g. shaving a 1,200 kW peak down to 800 kW, eliminating utility demand penalty charges).

### 7.3 BESS Round-Trip Efficiency & Health Degradation Tracking
- Compares historical RTE ($\frac{\text{Discharge MWh}}{\text{Charge MWh}} \times 100$) over time. A drop below $85\%$ triggers a maintenance inspection notice.
- Cell capacity fading curve plotted against warranty cycle covenants.

### 7.4 Carbon Offset & ESG Telemetry
- Real-time conversion of clean energy yield into avoided greenhouse gas emissions:
  $$\text{Emissions Avoided (kg } CO_2\text{)} = \text{Total Clean kWh} \times \text{Regional Grid Carbon Intensity Factor}$$
- Downloadable official PDF/CSV ESG Compliance Statements for corporate sustainability disclosures.

---

## 8. Feature Spec 4: Solar & BESS Maintenance Scheduling Engine

Maintenance through Neon Energy is **strictly focused on Solar Photovoltaics and Battery Energy Storage Systems (BESS)**. We do not service third-party diesel generators or utility grid equipment—our high-margin marketplace caters exclusively to specialized clean-energy hardware.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [NEON ENERGY]   Certified Clean Energy Maintenance Hub    [Book Certified Service]     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SERVICE CATEGORIES:                                                                    │
│ ┌─────────────────────────────────────────┐  ┌───────────────────────────────────────┐ │
│ │ ☀️ SOLAR PV MAINTENANCE PACKAGES        │  │ 🔋 BESS SPECIALIZED SERVICES          │ │
│ │ • Aerial Drone Infrared (IR) Thermography│ │ • Cell Impedance & Capacity Testing   │ │
│ │ • High-Precision IV Curve Diagnostic   │  │ • Liquid Thermal Coolant Flush/Refill │ │
│ │ • Robotic / Wet Panel Washing Service   │  │ • BMS Firmware Upgrade & Re-Zeroing   │ │
│ │ • Combiner & Inverter Torque Audit      │  │ • Aerosol / NFPA 855 Fire Sys Check   │ │
│ └─────────────────────────────────────────┘  └───────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ACTIVE SERVICE TICKETS                                                                 │
│ [Ticket #NEON-MNT-8812]  Apex Hybrid Park • BESS Thermal Flush    [Status: DISPATCHED] │
│ Scheduled: Tomorrow 09:00 AM • Assigned: GreenTech Field Crew #4   [View Job Card ➔]   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 Specialized Maintenance Catalog (Solar & BESS Only)

#### 8.1.1 Solar PV Field Services
1. **Aerial Drone Infrared (IR) Thermography**:
   - Drone scan with radiometric thermal imaging to detect hot spots, bypass diode failures, microcracks, and localized cell shunting according to IEC 62446-3 standards.
2. **Precision IV Curve Tracing**:
   - Comprehensive string testing using high-voltage curve tracers to identify module degradation, shading losses, and series resistance anomalies.
3. **Robotic & Deionized Panel Wash**:
   - Automated cleaning removing dust, bird droppings, and industrial soiling to restore 3% to 12% lost generation yield.
4. **Inverter & DC Health Audit**:
   - Thermal scan of DC disconnects, breaker torque verification, AC busbar impedance testing, and capacitor health inspection.

#### 8.1.2 BESS Field Services
1. **Cell Impedance & Capacity Re-Balancing**:
   - Internal resistance ($R_{int}$) testing per cell, manual passive/active balancing, and calibration of BMS State-of-Charge drift.
2. **Thermal Loop & Coolant Flush**:
   - Draining and refilling of dielectric or ethylene-glycol chiller loops, leak pressure testing, pump flow rate calibration, and chiller radiator cleaning.
3. **BMS Firmware & Sensor Calibration**:
   - Flashing updated BMS safety profiles, recalibrating Hall-effect current sensors, and testing safety interlocks.
4. **NFPA 855 / Stat-X Fire Suppression Inspection**:
   - Verification of aerosol / clean-agent cylinders, thermal sensor wiring continuity, emergency e-stop loop trip test, and container ventilation louvers.

---

### 8.2 4-Step Maintenance Booking Wizard

```
Step 1: Select Site & Asset ──► Step 2: Choose Service Package ──► Step 3: Schedule Date ──► Step 4: Confirm & Pay
[Apex Hybrid Park - BESS]       [BESS Coolant Loop Flush]         [2026-10-15 | 09:00 AM]   [Card / Credits: $1,250]
```

1. **Step 1: Select Site & Target Asset**: User selects an enrolled site and filters to either Solar Array or BESS Container. If any active alarms exist on that asset, the system automatically suggests the relevant diagnostic package.
2. **Step 2: Service Package & Custom Scope**: User selects from standardized flat-rate service packages or describes a specific fault code reported by the inverter/BMS.
3. **Step 3: Preferred Service Window & Expedited SLA**:
   - Standard Scheduled Service (within 5 business days).
   - Urgent SLA Dispatch (within 24 hours, emergency fee applies).
4. **Step 4: Commercial Terms & Payment Confirmation**:
   - Displays transparent upfront quote (Parts, Labor, Certification).
   - Payment via stored payment method (Stripe Credit Card / Corporate Purchase Order / Pre-purchased Neon Maintenance Credits).

---

### 8.3 Technician Dispatch, SLA Tracker & Service Job Cards
- **Status Lifecycle**: `REQUESTED` $\to$ `QUOTE_ACCEPTED` $\to$ `TECHNICIAN_ASSIGNED` $\to$ `EN_ROUTE` $\to$ `ON_SITE` $\to$ `TESTING_AND_VERIFICATION` $\to$ `COMPLETED` $\to$ `REPORT_FILED`.
- **Field Engineer App Interaction**: Technicians complete digital checklists, upload geo-tagged photo evidence, attach thermal FLIR images, and log post-service string voltages.
- **Client Real-Time Tracker**: User can view live ticket status and technician arrival window from mobile or desktop.

---

### 8.4 Digital Sign-Off Vault & Diagnostic Reports
- Upon job completion, an official **Neon Energy Certified Service Report** is compiled into a tamper-proof PDF.
- Contains:
  - Pre-service vs post-service electrical measurements
  - Radiometric infrared images showing resolved hot spots
  - Technician digital signature and warranty extension certificate
  - Stored permanently in Supabase Storage and indexed in the site's audit history.

---

## 9. Device Telemetry & Industrial Field Metrics Master Specification

To guarantee zero ambiguity during backend ingestion, the table below specifies exact electrical metrics, standard Modbus/CAN register types, and physical units:

### 9.1 Solar Inverter & MPPT Metrics
| Metric Code | Display Name | Standard Unit | Typical Range | Protocol / Source |
|---|---|---|---|---|
| `SOL_PAC` | Inverter AC Active Power | $kW$ | $0 - 5,000\ kW$ | SunSpec Reg 40084 (Modbus TCP) |
| `SOL_QAC` | Inverter Reactive Power | $kVAR$ | $-2,500 - +2,500$ | SunSpec Reg 40089 |
| `SOL_PDC` | Inverter DC Input Power | $kW$ | $0 - 5,500\ kW$ | SunSpec Reg 40101 |
| `SOL_VDC` | Total DC Bus Voltage | $V_{dc}$ | $600 - 1,500\ V$ | SunSpec Reg 40099 |
| `SOL_IDC` | Total DC Input Current | $A_{dc}$ | $0 - 3,500\ A$ | SunSpec Reg 40097 |
| `SOL_EFF` | Instantaneous Inverter $\eta$ | $\%$ | $95.0 - 99.2\%$ | Derived: $(P_{ac}/P_{dc}) \times 100$ |
| `SOL_MPPT_V` | Individual MPPT Channel Voltage | $V$ | $200 - 1,000\ V$ | Inverter String Registers |
| `SOL_MPPT_I` | Individual MPPT Channel Current | $A$ | $0 - 40\ A$ | Inverter String Registers |
| `SOL_IGBT_TEMP`| Inverter Internal Heat Sink Temp | $^\circ C$ | $20 - 95^\circ C$ | Internal NTC Thermistor |
| `SOL_DAY_YIELD`| Daily Cumulative Solar Yield | $kWh$ | $0 - 50,000\ kWh$ | SunSpec Cumulative Register |
| `SOL_PR` | Standard Performance Ratio | $\%$ | $65.0 - 92.0\%$ | IEC 61724 Engine ($Y_f / Y_r$) |

### 9.2 BESS & BMS Metrics
| Metric Code | Display Name | Standard Unit | Typical Range | Protocol / Source |
|---|---|---|---|---|
| `BESS_SOC` | Battery State of Charge | $\%$ | $0.0 - 100.0\%$ | BMS Master Controller (CAN/Modbus) |
| `BESS_SOH` | Battery State of Health | $\%$ | $70.0 - 100.0\%$ | BMS Capacity Estimation |
| `BESS_POWER` | Active Battery Power (+/-) | $kW$ | $-2,000 - +2,000$ | Power Conversion System (PCS) |
| `BESS_VDC` | DC Battery Pack Voltage | $V_{dc}$ | $700 - 1,250\ V$ | BMS Battery Rack Sum |
| `BESS_IDC` | Battery Pack Current (+/-) | $A_{dc}$ | $-1,500 - +1,500$ | BMS Hall-Effect Shunt |
| `BESS_CELL_VMAX`| Maximum Cell Voltage | $mV$ | $2,800 - 3,650\ mV$| BMS Slave Module (LFP Chemistry) |
| `BESS_CELL_VMIN`| Minimum Cell Voltage | $mV$ | $2,500 - 3,650\ mV$| BMS Slave Module |
| `BESS_CELL_VDEL`| Max-Min Cell Voltage Delta | $mV$ | $5 - 150\ mV$ | Derived: $V_{max} - V_{min}$ |
| `BESS_CELL_TMAX`| Maximum Cell Temperature | $^\circ C$ | $15 - 55^\circ C$ | BMS Thermocouple Array |
| `BESS_COOL_TEMP`| Chiller Coolant Inlet/Outlet | $^\circ C$ | $12 - 28^\circ C$ | Thermal Management Loop |
| `BESS_CYCLES` | Lifetime Equivalent Cycles | Count | $0 - 10,000$ | BMS Internal Non-Volatile Memory |
| `BESS_ALARM` | Master Fault Status Word | Bitmask | $0x0000 - 0xFFFF$ | Over-voltage, Over-temp, Isolation |

### 9.3 Diesel Generator (DG) Metrics
| Metric Code | Display Name | Standard Unit | Typical Range | Protocol / Source |
|---|---|---|---|---|
| `DG_STATE` | Genset Operational State | Enum | $0-7$ | DeepSea DSE7320 / ComAp InteliLite |
| `DG_PWR_KW` | Generator Active Power | $kW$ | $0 - 1,500\ kW$ | Genset AC Controller |
| `DG_HZ` | Generator Output Frequency | $Hz$ | $45.0 - 65.0\ Hz$ | Genset AC Controller |
| `DG_RPM` | Engine Speed | $RPM$ | $0 - 2,000\ RPM$ | Magnetic Pickup Sensor |
| `DG_OIL_PRESS` | Engine Lube Oil Pressure | $bar$ / $kPa$ | $2.5 - 6.5\ bar$ | Engine Block Pressure Sensor |
| `DG_COOL_TEMP` | Engine Coolant Temperature | $^\circ C$ | $60 - 105^\circ C$ | Engine Thermostat Sensor |
| `DG_FUEL_PCT` | Fuel Tank Storage Level | $\%$ | $0.0 - 100.0\%$ | Ultrasonic / Capacitive Fuel Probe |
| `DG_BURN_RATE` | Instantaneous Fuel Burn Rate | $L / hr$ | $0 - 350\ L/hr$ | Derived from ECU Load Curves |
| `DG_RUN_HOURS` | Cumulative Engine Run Time | $Hours$ | $0 - 50,000\ hrs$ | Engine Controller Non-Volatile |
| `DG_BATT_VOLT` | 24V DC Starter Battery Voltage| $V_{dc}$ | $21.0 - 28.8\ V$ | Starter Cranking Battery |

### 9.4 Utility Grid Interconnection Metrics
| Metric Code | Display Name | Standard Unit | Typical Range | Protocol / Source |
|---|---|---|---|---|
| `GRID_PWR_NET` | Net Real Power (+Imp/-Exp) | $kW$ | $-5,000 - +5,000$| Multifunction Meter (Janitza/ABB) |
| `GRID_VL1_L2` | 3-Phase Line-to-Line Voltage | $V_{ac}$ | $380 - 440\ V$ / 11kV| Meter Potential Transformers (PT) |
| `GRID_HZ` | Utility Interconnection Freq | $Hz$ | $49.0 - 51.0\ Hz$ | High-Speed Metering Sensor |
| `GRID_PF` | Power Factor | $\cos \phi$ | $-1.00 - +1.00$ | Leading / Lagging Calculation |
| `GRID_THDV` | Total Harmonic Distortion (V) | $\%$ | $0.5 - 8.0\%$ | Power Quality Analyzer Reg |
| `GRID_THDI` | Total Harmonic Distortion (I) | $\%$ | $1.0 - 20.0\%$ | Power Quality Analyzer Reg |
| `GRID_KWH_IMP` | Lifetime Imported Active Energy| $kWh$ | Cumulative | Utility Revenue Meter Register |
| `GRID_KWH_EXP` | Lifetime Exported Active Energy| $kWh$ | Cumulative | Utility Revenue Meter Register |

### 9.5 Facility Load Metrics
| Metric Code | Display Name | Standard Unit | Typical Range | Protocol / Source |
|---|---|---|---|---|
| `LOAD_PAC` | Total Facility Active Demand | $kW$ | $50 - 5,000\ kW$ | Main Incomer Substation Meter |
| `LOAD_QAC` | Total Facility Reactive Demand| $kVAR$ | $10 - 2,500\ kVAR$| Main Incomer Substation Meter |
| `LOAD_MAX_DEM` | Current Billing Period Peak MD | $kVA$ | $50 - 5,500\ kVA$| 15-Minute Sliding Window Average |
| `LOAD_CRIT_KW` | Isolated Critical Loads Power | $kW$ | $20 - 1,500\ kW$ | Essential Emergency Bus Meter |

---

## 10. Database Architecture & Supabase DDL

The database is built on PostgreSQL inside Supabase, with full multi-tenancy enforced through `clerk_org_id` and strict Row Level Security (RLS) policies.

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Organizations & Subscription State
create type subscription_tier as enum ('starter', 'pro_commercial', 'utility_enterprise');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');

create table public.organizations (
    id uuid primary key default uuid_generate_v4(),
    clerk_org_id text unique not null,
    name text not null,
    slug text not null,
    tier subscription_tier default 'starter',
    status subscription_status default 'active',
    stripe_customer_id text,
    stripe_subscription_id text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 2. Solar & BESS Sites
create type site_status as enum ('online', 'degraded', 'offline', 'maintenance');
create type plant_type as enum ('commercial_industrial', 'utility_microgrid', 'rooftop_hybrid');

create table public.sites (
    id uuid primary key default uuid_generate_v4(),
    org_id uuid not null references public.organizations(id) on delete cascade,
    name text not null,
    slug text not null,
    location_city text not null,
    location_state text not null,
    latitude double precision,
    longitude double precision,
    plant_type plant_type default 'commercial_industrial',
    status site_status default 'online',
    
    -- Installed Nameplate Capacities
    solar_capacity_kwp double precision default 0.0,
    bess_capacity_kwh double precision default 0.0,
    bess_power_kw double precision default 0.0,
    dg_capacity_kva double precision default 0.0,
    contracted_demand_kva double precision default 0.0,
    
    -- Capabilities
    has_solar boolean default true,
    has_bess boolean default true,
    has_dg boolean default false,
    has_grid boolean default true,
    
    -- Current Utility TOU Settings
    peak_tariff_rate double precision default 0.18, -- USD per kWh
    offpeak_tariff_rate double precision default 0.07,
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 3. Site Components & Field Hardware Devices
create type device_category as enum ('solar_inverter', 'bess_bms', 'bess_pcs', 'diesel_generator', 'grid_meter', 'load_substation', 'weather_station');

create table public.site_devices (
    id uuid primary key default uuid_generate_v4(),
    site_id uuid not null references public.sites(id) on delete cascade,
    name text not null,
    category device_category not null,
    manufacturer text not null,
    model text not null,
    serial_number text,
    ip_address text,
    modbus_slave_id int default 1,
    is_online boolean default true,
    created_at timestamp with time zone default now()
);

-- 4. Real-Time Telemetry Snapshot (Sub-Second / 5-Second Latest State)
create table public.telemetry_snapshots (
    site_id uuid primary key references public.sites(id) on delete cascade,
    timestamp timestamp with time zone not null default now(),
    
    -- Live Power Flows (kW)
    solar_power_kw double precision default 0.0,
    bess_power_kw double precision default 0.0, -- negative = charging, positive = discharging
    grid_power_kw double precision default 0.0, -- positive = import, negative = export
    dg_power_kw double precision default 0.0,
    load_power_kw double precision default 0.0,
    
    -- Key State Gauges
    bess_soc_pct double precision default 0.0,
    bess_soh_pct double precision default 100.0,
    dg_fuel_pct double precision default 0.0,
    dg_running boolean default false,
    grid_frequency_hz double precision default 50.0,
    grid_power_factor double precision default 0.99,
    
    -- Daily Accumulations (kWh)
    solar_yield_today_kwh double precision default 0.0,
    load_consumption_today_kwh double precision default 0.0,
    grid_import_today_kwh double precision default 0.0,
    grid_export_today_kwh double precision default 0.0,
    co2_saved_today_kg double precision default 0.0
);

-- 5. Time-Series Telemetry Rollups (Hourly Aggregation for Analytics)
create table public.telemetry_hourly (
    id bigserial primary key,
    site_id uuid not null references public.sites(id) on delete cascade,
    bucket_timestamp timestamp with time zone not null,
    
    avg_solar_kw double precision,
    max_solar_kw double precision,
    solar_energy_kwh double precision,
    
    avg_bess_kw double precision,
    bess_charge_kwh double precision,
    bess_discharge_kwh double precision,
    end_bess_soc_pct double precision,
    
    avg_load_kw double precision,
    peak_load_kw double precision,
    load_energy_kwh double precision,
    
    grid_import_kwh double precision,
    grid_export_kwh double precision,
    dg_energy_kwh double precision,
    dg_fuel_liters double precision,
    
    estimated_cost_saved double precision,
    
    unique(site_id, bucket_timestamp)
);

-- 6. System Faults & Telemetry Alarms
create type alarm_severity as enum ('info', 'warning', 'critical');

create table public.site_alarms (
    id uuid primary key default uuid_generate_v4(),
    site_id uuid not null references public.sites(id) on delete cascade,
    device_id uuid references public.site_devices(id) on delete set null,
    severity alarm_severity not null default 'warning',
    code text not null,
    title text not null,
    description text,
    is_acknowledged boolean default false,
    is_cleared boolean default false,
    triggered_at timestamp with time zone default now(),
    cleared_at timestamp with time zone
);

-- 7. Solar & BESS Maintenance Catalog (Only Solar & BESS)
create type maintenance_asset_type as enum ('solar_pv', 'bess');

create table public.maintenance_services (
    id uuid primary key default uuid_generate_v4(),
    asset_type maintenance_asset_type not null,
    title text not null,
    slug text unique not null,
    description text not null,
    base_price double precision not null,
    estimated_duration_hours int not null,
    deliverables text[] not null,
    is_active boolean default true
);

-- 8. Maintenance Booking Tickets
create type ticket_status as enum (
    'requested',
    'quote_accepted',
    'technician_assigned',
    'en_route',
    'on_site',
    'testing_and_verification',
    'completed',
    'cancelled'
);

create table public.maintenance_tickets (
    id uuid primary key default uuid_generate_v4(),
    ticket_number text unique not null, -- e.g. NEON-MNT-8812
    org_id uuid not null references public.organizations(id) on delete cascade,
    site_id uuid not null references public.sites(id) on delete cascade,
    asset_type maintenance_asset_type not null,
    service_id uuid references public.maintenance_services(id),
    custom_notes text,
    status ticket_status default 'requested',
    scheduled_date date not null,
    time_window text not null, -- e.g. '09:00 - 13:00'
    assigned_crew_name text,
    total_price double precision not null,
    payment_status text default 'pending', -- pending, paid, credit_deducted
    service_report_url text, -- PDF file in Supabase Storage
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.organizations enable row level security;
alter table public.sites enable row level security;
alter table public.site_devices enable row level security;
alter table public.telemetry_snapshots enable row level security;
alter table public.telemetry_hourly enable row level security;
alter table public.site_alarms enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.maintenance_services enable row level security;

-- Public Services catalog is readable by all authenticated users
create policy "Services catalog viewable by authenticated users" 
    on public.maintenance_services for select to authenticated using (true);
```

---

## 11. Mobile Optimization & Responsive Layout Strategy

### 11.1 Mobile-First Architectural Decisions
1. **Thumb-Driven Touch Targets**: All interactive toggles, node drill-downs, and modal buttons maintain a minimum tap dimension of $48 \times 48\ px$ with minimum $8\ px$ touch padding.
2. **Vertical Energy Flow Reflow**: On screens $<768\ px$, the horizontal 5-node flow diagram smoothly reflows into a vertical linear stack with animated vertical flow rails connecting Solar $\to$ BESS/Load $\to$ Grid/DG.
3. **Slide-Up Bottom Sheets (Drawers)**: Component drill-downs (such as BESS cell thermals or Solar string MPPTs) open as swipeable bottom sheets on mobile devices rather than right-hand desktop side-drawers.
4. **Offline Resilience & Reconnection Banners**: If field cellular data drops while on a remote solar farm, the client caches the last telemetry packet, renders an ambient pulsing amber banner (`Reconnecting to Neon Edge Gateway...`), and automatically resynchronizes via Supabase Realtime when connectivity is restored.
5. **High-Contrast Dark Aesthetic**: The deep obsidian background (`#060709`) combined with high-luminance neon pink (`#FF2A85`) and neon cyan (`#00F0FF`) ensures full readability on mobile screens even in harsh outdoor sunlight at remote solar sites.

---

## 12. Environment Configuration & Secret Keys Specification (`.env.local`)

Neon Energy relies on credentials and endpoints spanning Authentication (Clerk), Relational Database & Realtime (Supabase), Direct PostgreSQL Connection, and Product Telemetry Analytics (PostHog).

### 12.1 Environment Variable Master Registry

| Environment Variable Key | Exposure Scope | Service / Provider | Purpose & Technical Function |
|---|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public / Client-Side | Clerk (`@clerk/nextjs`) | The public API key used by the Next.js client to initialize ClerkProvider, load authentication sessions, handle sign-in widgets, and manage organization switching. |
| `CLERK_SECRET_KEY` | Server-Only / Secret | Clerk Backend API | Secret authentication key used exclusively on the server (Server Actions, Route Handlers, Middleware) to verify session JWTs, query Clerk Backend API, and manage organization memberships. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Public / Client-Side | Clerk Routing | Custom sign-in route URL (`/sign-in`) where unauthenticated users are redirected when accessing protected dashboard views. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Public / Client-Side | Clerk Routing | Custom sign-up route URL (`/sign-up`) for new user registrations and organization onboarding. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Public / Client-Side | Clerk Routing | Fallback destination URL (`/`) after a successful user sign-in session is created. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Public / Client-Side | Clerk Routing | Fallback destination URL (`/`) after a successful user registration and organization creation. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client-Side | Supabase | The HTTPS API root URL for the Neon Energy Supabase project (`https://uoiodhmahcpwedwajdtd.supabase.co`). Used by both frontend and backend to communicate with PostgreSQL via PostgREST, Realtime WebSockets, and Supabase Storage. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client-Side | Supabase | Public anonymous client API key (`sb_publishable_...`). Encoded in client requests to access public resources and authenticated user queries strictly scoped by Postgres Row Level Security (RLS) policies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only / Secret | Supabase Admin | High-privilege administrative service key (`eyJhbGciOi...`). Bypasses all Row Level Security (RLS). Must **NEVER** be leaked to the client bundle; strictly restricted to edge telemetry ingestion workers, system cron jobs, and Clerk webhook sync routines. |
| `TURIA_DB_supabse_pwd` | Server-Only / Secret | Supabase PostgreSQL | Direct database master password for the Supabase PostgreSQL database instance (`VncVw2...`). Used for direct psql connection strings, migration tools, and high-throughput connection pooling setups. |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Public / Client-Side | PostHog Product Analytics | Public project token (`phc_qqTe75...`) for PostHog client analytics. Used to track feature adoption, page views, flow canvas node interactions, and feature flags. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Public / Client-Side | PostHog API Host | Ingestion endpoint host URL (`https://us.i.posthog.com`) routing telemetry events to PostHog's US cloud cluster. |

### 12.2 Security & Isolation Mandates
1. **Never Expose Secret Keys**: Keys lacking the `NEXT_PUBLIC_` prefix (`CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TURIA_DB_supabse_pwd`) are strictly prohibited in React Client Components (`"use client"`).
2. **RLS Enforcement**: Any client-side Supabase query using `NEXT_PUBLIC_SUPABASE_ANON_KEY` is bounded by RLS matching the user's Clerk organization ID. Administrative writes that bypass RLS must only occur in secure Server Actions or Route Handlers utilizing `SUPABASE_SERVICE_ROLE_KEY`.
3. **Telemetry Ingestion Security**: Automated sensor telemetry ingested at `POST /api/v1/telemetry/ingest` verifies an ingestion secret or service role signature before writing to `telemetry_snapshots`.
