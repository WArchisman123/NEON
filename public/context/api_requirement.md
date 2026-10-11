# NEON ENERGY — Industrial Solar & BESS SaaS Platform
## Comprehensive Backend API & Parameter Specification
**Target Audience**: Backend Engineers, Platform Engineers, Edge IoT Architects  
**Specification Version**: `1.0.0-PROD`  
**Base URL**: `https://api.neonenergy.io/api/v1` (or local development: `http://localhost:3000/api/v1`)  
**Security Protocols**: HTTPS / TLS 1.3, Clerk JWT Bearer Auth, High-Entropy Edge API Keys, Supabase PostgreSQL RLS  

---

## 1. Executive Architecture & Engineering Protocols

### 1.1 Multi-Tenant Organization Isolation (Clerk + Supabase)
NEON ENERGY utilizes a strict multi-tenant architecture designed for renewable asset owners, EPC contractors, and facility operators.
- **Web App Users**: Every authenticated request passes through Clerk authentication (`@clerk/nextjs/server`). The session token provides `userId`, `orgId`, and `orgRole`.
- **Database Tenancy Scoping**: In Supabase PostgreSQL, all customer tables (`sites`, `site_devices`, `maintenance_tickets`, `telemetry_snapshots`, `telemetry_hourly`) are partitioned by `org_id` referencing `public.organizations(id)`. 
- **Database Row-Level Security (RLS)**: Applications querying the database must verify that `o.clerk_org_id = current_setting('request.jwt.claim.org_id', true)` or match the resolved Clerk tenant ID. A user in Organization A cannot read or mutate data from Organization B.
- **Industrial IoT Edge Gateways**: Remote dataloggers, Modbus edge computers, and SCADA gateways in the field do not authenticate via Clerk user sessions; they authenticate via a high-entropy bearer token (`Authorization: Bearer <neon_gw_token>`) coupled with a hardware identifier (`X-Site-UUID: <uuid>`).

### 1.2 Universal JSON Envelopes

#### Standard Success Envelope (`200 OK`, `201 Created`)
All successful REST endpoints MUST return data wrapped in this uniform envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "count": 1,
    "page": 1,
    "pageSize": 50,
    "total": 1
  },
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

#### Standard Error Envelope (`400`, `401`, `403`, `404`, `422`, `500`)
```json
{
  "success": false,
  "error": "Human-readable error message explaining why the operation failed.",
  "code": "SITE_CAPACITY_LIMIT_EXCEEDED",
  "details": [
    {
      "field": "solar_capacity_kwp",
      "issue": "Solar capacity cannot exceed 50000 kWp for Pro Commercial tier"
    }
  ],
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

### 1.3 Universal Monospace & Precision Conventions
1. **Active Power**: Expressed in **$kW$** or **$MW$** rounded to 1 decimal place (e.g. `940.5 kW`).
2. **Apparent Power**: Expressed in **$kVA$** or **$MVA$** rounded to nearest integer (e.g. `800 kVA`).
3. **Reactive Power**: Expressed in **$kVAR$** (e.g. `115 kVAR`).
4. **Energy**: Expressed in **$kWh$** or **$MWh$** rounded to 1 decimal place (e.g. `4820.5 kWh`).
5. **Electrical Potentials & Currents**:
   - Pack / Bus Voltage: **$V$** (e.g. `748.5 V`)
   - Pack / String Current: **$A$** (e.g. `428.0 A`)
   - Battery Cell Voltages: **$mV$** (e.g. `3280 mV`)
   - Cell Voltage Imbalance ($\Delta V$): **$mV$** (e.g. `38 mV`)
6. **Frequencies**: Expressed in **$Hz$** to 2 decimal places (e.g. `49.98 Hz` or `59.98 Hz`).
7. **Percentages**: Expressed with 1 or 2 decimal places (e.g. `84.2% SoC`, `96.8% SoH`, `18.72% CUF`).
8. **Financials**: Expressed in **Indian Rupees (₹ INR)** (with optional USD for international exports).

---

## 2. Page-by-Page Parameter Reference & Engineering Dictionary

This section breaks down **every parameter, input, sensor metric, and aggregated calculation** used across each screen of the application.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEON ENERGY PAGE MAP                            │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Fleet Cockpit (Home / Solar Sites Screen)             - [/]         │
│ 2. Site Master & 5-Node Interactive Flow Screen          - [/sites/:id]│
│ 3. Solar PV Generation & String Subsystem                - [/solar]    │
│ 4. BESS Storage, BMS Racks & Chiller Subsystem           - [/bess]     │
│ 5. Diesel Generator (DG) Peaker & Backup Subsystem       - [/dg]       │
│ 6. Utility Grid Intertie & Power Quality Subsystem       - [/grid]     │
│ 7. Facility Load & Power Demand Profiler Subsystem       - [/load]     │
│ 8. Historical Energy Balance & Consumption Workspace     - [/analytics]│
│ 9. Plant Generation Comparative & 4-Quadrant Benchmark  - [/analytics]│
│ 10. Certified Solar & BESS Maintenance Hub (Marketplace) - [/maint]    │
│ 11. SaaS Subscription, Licensing & Renewal Center        - [/sub]      │
│ 12. Organization Multi-Tenant Invitations & Onboarding   - [/invite]   │
│ 13. Industrial IoT Edge Gateway Telemetry Ingestion      - [Edge Ingest]
└────────────────────────────────────────────────────────────────────────┘
```

---

### Page 1: Fleet Cockpit (Home / Solar Sites Screen — `/`)

The Fleet Cockpit acts as the central command room view for all distributed solar and battery assets under an enterprise portfolio.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `total_solar_mw` | Total Solar Generation | `number` | $MW$ | Instantaneous sum of DC-to-AC power produced across all active solar arrays in the portfolio. | $\sum (\text{site.solar\_power\_kw}) / 1000$ |
| `total_bess_mwh` | Total Fleet BESS Storage | `number` | $MWh$ | Cumulative energy storage capacity of all operational battery systems in the organization. | $\sum (\text{site.bess\_capacity\_kwh}) / 1000$ |
| `avg_bess_soc_pct` | Fleet Average SoC | `number` | $\%$ | Capacity-weighted or arithmetic mean state of charge across all active battery banks. | $\frac{\sum (\text{site.bess\_capacity\_kwh} \times \text{site.bess\_soc\_pct})}{\sum \text{site.bess\_capacity\_kwh}}$ |
| `active_load_mw` | Active Fleet Demand | `number` | $MW$ | Total real-time electrical power drawn by all connected facilities, factories, and loads. | $\sum (\text{site.load\_power\_kw}) / 1000$ |
| `net_grid_mw` | Net Grid Exchange | `number` | $MW$ | Total net power crossing the utility boundary. Positive = Net Import; Negative = Net Export to grid. | $\sum (\text{site.grid\_power\_kw}) / 1000$ |
| `active_gensets_count` | DG Peaker / Alarms | `integer` | Count | Number of diesel generators currently running under load + count of unacknowledged critical alarms. | Count of sites where `dg_running == true` |
| `total_revenue_today_inr` | Revenue Today | `number` | $₹\ \text{INR}$ | Estimated financial savings and export credit generated today across the portfolio. | $\sum (\text{solar\_yield\_kwh} \times \text{peak\_tariff} + \text{grid\_export\_kwh} \times \text{feed\_in\_rate})$ |
| `annual_target_mwh` | Portfolio Annual Target | `number` | $MWh$ | Contractual generation target established in EPC/PPA contracts for the fiscal year. | Sum of site-level contractual P50 projections. |
| `annual_achieved_mwh` | Portfolio Annual Achieved| `number` | $MWh$ | Actual cumulative energy delivered by all fleet assets since the start of the fiscal year. | Aggregated meter rollups from `telemetry_hourly`. |
| `annual_target_progress_pct`| Target Progress | `number` | $\%$ | Portfolio completion percentage towards the annual clean energy generation commitment. | $(\text{annual\_achieved\_mwh} / \text{annual\_target\_mwh}) \times 100$ |
| `total_co2_saved_tons` | Carbon Abated | `number` | Metric Tons | Equivalent mass of carbon dioxide emissions displaced by solar and storage discharge. | $\sum (\text{co2\_saved\_today\_kg}) / 1000$ (factor: $0.49\ kg\ CO_2 / kWh$) |
| `total_trees_equivalent` | Trees Planted Equivalent| `integer` | Trees | Number of mature trees required to absorb the equivalent volume of $CO_2$ abated in a year. | $\text{total\_co2\_saved\_kg} / 21.8$ |
| `total_coal_saved_tons` | Coal Avoided | `number` | Metric Tons | Volume of thermal coal combustion avoided in grid power stations. | $\text{solar\_yield\_today\_kwh} \times 0.0004$ |
| **Site Card Attributes** | | | | | |
| `id` | Site ID | `string` | UUID | Unique database primary key of the site record. | `public.sites.id` |
| `name` | Plant Name | `string` | N/A | Human-readable name of the facility (e.g. "Bakersfield Central Solar-Plus-Storage"). | `public.sites.name` |
| `slug` | Slug | `string` | URL slug | URL-safe identifier for routing. | Generated from name. |
| `location_city`, `location_state` | Location | `string` | Text | Municipal city and state jurisdiction where the physical equipment is energized. | `public.sites.location_city`, `location_state` |
| `plant_type` | System Architecture | `enum` | Enum | Classification: `commercial_industrial`, `utility_microgrid`, `rooftop_hybrid`. | `public.sites.plant_type` |
| `status` | Operational Status | `enum` | Status | Operational health: `online` (healthy), `degraded` (warning/derated), `offline` (down), `maintenance` (active O&M). | Health aggregation engine. |
| `subscription_status` | License Status | `enum` | Status | SaaS license state: `active`, `past_due`, `expired`. If expired, telemetry is locked. | Billing engine. |
| `solar_capacity_kwp` | Installed Solar Capacity | `number` | $kWp$ | Nameplate DC peak rating of the photovoltaic array under Standard Test Conditions (STC). | Nameplate metadata. |
| `bess_capacity_kwh` | BESS Energy Capacity | `number` | $kWh$ | Nominal energy capacity of the battery container when fully charged (100% SoC). | Nameplate metadata. |
| `bess_power_kw` | BESS Inverter (PCS) Rating | `number` | $kW$ | Maximum continuous power rating of the bidirectional Power Conversion System (PCS). | Nameplate metadata. |
| `dg_capacity_kva` | Genset Rating | `number` | $kVA$ | Apparent power rating of the backup diesel alternator. | Nameplate metadata. |
| `contracted_demand_kva` | Sanctioned Demand (MD) | `number` | $kVA$ | Contracted maximum allowable power draw agreed with the electric utility to avoid penalty. | Utility tariff contract. |
| `has_solar`, `has_bess`, `has_dg`, `has_grid` | Asset Badges | `boolean` | Flag | Boolean flags indicating hardware components physically installed at the site. | Hardware manifest. |
| `live_bess_power_kw` | Battery Flow kW | `number` | $kW$ | Current transfer rate of BESS. **Negative = Charging**; **Positive = Discharging**. | Inverter/PCS power meter. |
| `cuf_pct` | Capacity Utilization Factor| `number` | $\%$ | Actual output energy relative to continuous operation at peak nameplate capacity over 24 hours. | $\frac{\text{Actual Energy Generated (kWh)}}{\text{Solar Capacity (kWp)} \times 24\ \text{hours}} \times 100$ |
| `specific_yield_kwh_per_kwp`| Specific Yield | `number` | $kWh/kWp$ | Normalizing production metric indicating kilowatt-hours produced per installed kilowatt-peak. | $\frac{\text{Daily Solar Yield (kWh)}}{\text{Installed Capacity (kWp)}}$ |
| **Warranty Watchlist** | | | | | |
| `equipment_serial` | Serial Number | `string` | Alpha-num | Manufacturer serial tag for inverters, BMS modules, and transformers. | `site_devices.serial_number` |
| `equipment_category` | Category | `string` | Enum | `solar_inverter`, `bess_bms`, `bess_pcs`, `grid_meter`, `dg_controller`. | `site_devices.category` |
| `warranty_expiry_date` | Expiry Date | `string` | ISO Date | Timestamp when manufacturer OEM warranty expires. | Contract registry. |
| `days_remaining` | Days to Expiry | `integer` | Days | Number of days until warranty terminates (alert highlighted if $\le 90$ days). | $\text{warranty\_date} - \text{today}$ |
| `warranty_action_needed` | Critical Action Flag | `boolean` | Flag | True if equipment requires contract renewal or OEM inspection before warranty lapses. | Evaluated if $\text{days} \le 90$. |

---

### Page 2: Site Master & Interactive 5-Node Flow Screen (`/sites/[id]`)

This screen displays the real-time electrical transfer topology connecting Solar PV, BESS, Grid, DG, and Facility Load via animated glowing particle conduits.

```
       [ Solar PV Array ]
               │
               ▼ (Solar Gen kW)
      ┌─────────────────┐
      │   AC / DC BUS   │◄───► [ Utility Grid ]
      │  MICROGRID NODE │◄───► [ BESS Storage ]
      └─────────────────┘◄──── [ Diesel Generator ]
               │
               ▼
      [ Facility Load ]
```

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `operational_mode` | System Operational Mode | `enum` | Mode | Active power dispatch state: `GRID_TIED_SELF_CONSUMPTION_AND_EXPORT`, `PEAK_SHAVING`, `MICROGRID_ISLANDED`, `DG_BACKUP`. | Derived dynamically by comparing node flows. |
| `solar_to_bus_kw` | Solar Injected Power | `number` | $kW$ | Active power output from central/string solar inverters into the primary plant bus. | SCADA solar meter. |
| `bess_flow_kw` | BESS Bus Transfer | `number` | $kW$ | Bidirectional battery transfer. Negative = Bus charging BESS; Positive = BESS discharging into Bus. | PCS bidirectional meter. |
| `grid_exchange_kw` | Utility Intertie Transfer| `number` | $kW$ | Net utility draw. Positive = Importing power; Negative = Exporting surplus power to grid. | Substation 4-quadrant meter. |
| `dg_to_bus_kw` | Genset Output | `number` | $kW$ | Active power supplied by diesel alternator during islanding or peak support. | Genset controller power feed. |
| `bus_to_load_kw` | Facility Consumption | `number` | $kW$ | Total aggregate load drawn by industrial machinery, HVAC, and plant infrastructure. | Feeder main breaker meter. |
| `bus_balance_delta_kw` | Electrical Node Imbalance | `number` | $kW$ | Verification that Kirchhoff's Current Law ($KCL$) holds: $\sum P_{\text{in}} - \sum P_{\text{out}} \approx 0$. | Tolerable delta $\le \pm 2\%$. |
| **Daily Generation Report (DGR)** | | | | | |
| `dgr_date` | Date of Audit Record | `string` | Date | Audit calendar day formatted as `DD-MMM-YYYY`. | Date bucket. |
| `day_total_kwh` | Daily Solar Yield | `number` | $kWh$ | Total cumulative clean energy generated by the solar plant on that calendar day. | Integrator on inverter active power. |
| `plant_cumulative_kwh` | Plant Cumulative Lifetime | `number` | $kWh$ | All-time cumulative generation produced by the facility since commercial operation date (COD). | Non-volatile meter register. |
| `inv01_day_kwh` | Inverter #01 Generation | `number` | $kWh$ | Daily generation recorded specifically for central inverter block 1. | Inverter SunSpec register. |
| `dg_day_kwh` | Genset Energy Generated | `number` | $kWh$ | Total emergency/peaking electrical energy generated by diesel gensets today. | Genset kWh register. |
| `pv_dg_fuel_saving_kwh` | PV-DG Fuel Displacement | `number` | $kWh$ | Solar energy consumed during periods when DG was running, directly reducing diesel burn. | $\text{Solar Output during DG Run Hours}$. |
| `solar_insolation_kwh_m2`| Solar Insolation | `number` | $kWh/m^2$ | Total solar radiation energy received per square meter of horizontal or tilted surface area. | Pyranometer integration over daylight. |
| `pr_pct` | Performance Ratio | `number` | $\%$ | Ratio of actual electrical yield to the theoretical modeled yield under measured irradiation: $\text{PR} = \frac{\text{Actual Yield (kWh)} / \text{Installed DC (kWp)}}{\text{Solar Insolation } (kWh/m^2) / 1.0\ kW/m^2} \times 100$. | Standard IEC 61724 PR formula. |
| `expected_gen_kwh` | Modeled Expected Energy | `number` | $kWh$ | Target yield simulated using baseline P50 irradiance models for that location. | Energy prediction model. |
| `peak_irradiance_wm2` | Peak Solar Irradiance | `number` | $W/m^2$ | Highest instantaneous global plane-of-array irradiance measured by onsite weather pyranometers. | Pyranometer high-water mark. |
| `peak_irradiance_time` | Peak Irradiance Time | `string` | Time | Timestamp at which peak irradiance was reached (e.g. `12:45 PM`). | Pyranometer event log. |
| **Site Meteorological Telemetry (Open-Meteo)** | | | | | |
| `ambient_temp_c` | Ambient Air Temperature | `number` | $^\circ C$ | Outdoor ambient dry-bulb temperature measured on-site. | Weather sensor / Open-Meteo. |
| `cloud_cover_pct` | Cloud Cover | `number` | $\%$ | Percentage of sky obscured by cloud cover. | Satellite cloud model. |
| `dni_wm2` | Direct Normal Irradiance | `number` | $W/m^2$ | Solar radiation component perpendicular to solar rays. | Meteorological model. |
| `ghi_wm2` | Global Horizontal Irradiance| `number` | $W/m^2$ | Total solar radiation incident on a horizontal surface. | Meteorological model. |
| `bess_automation_directive`| BESS Smart Dispatch | `enum` | Directive | Recommended automated battery mode based on forecast: `solar_precharge`, `peak_preservation`, `grid_feed_arbitrage`, `island_standby`. | Automated optimizer algorithm. |

---

### Page 3: Solar PV Generation Subsystem (`/sites/[id]/solar`)

Provides deep inverter analytics, MPPT string current diagnostics, string heatmap matrix, scatter plot soiling analysis, and raw SunSpec Modbus register maps.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `inverter_id` | Inverter ID | `string` | UUID | Identifier for individual inverter units. | `site_devices.id` |
| `inverter_dc_power_kw` | Inverter DC Input | `number` | $kW$ | Instantaneous direct current power entering inverter from all connected combiner boxes. | $\sum (V_{\text{dc}} \times I_{\text{dc}}) / 1000$ |
| `inverter_ac_power_kw` | Inverter AC Output | `number` | $kW$ | 3-phase alternating current power delivered to the AC collector bus. | AC output meter register. |
| `inverter_efficiency_pct` | Inverter Efficiency ($\eta$)| `number` | $\%$ | Conversion efficiency of the inverter stage: $(P_{\text{ac}} / P_{\text{dc}}) \times 100$. Standard target: $98.2\% - 98.8\%$. | Inverter calculation. |
| `igbt_temp_c` | IGBT Heat Sink Temp | `number` | $^\circ C$ | Operating temperature of internal power semiconductor switches (Insulated-Gate Bipolar Transistors). | Internal inverter thermistor. |
| **24-Channel MPPT String Diagnostics** | | | | | |
| `mppt_channel` | String Channel # | `integer` | 1 to 24 | MPPT channel index (e.g. Channel 1 to 24). | String monitoring sensor index. |
| `string_voltage_v` | String DC Voltage | `number` | $V$ | Measured DC operating voltage across the series module string. | DC voltage transducer. |
| `string_current_a` | String DC Current | `number` | $A$ | Measured DC current produced by the series module string. | Hall-effect current sensor. |
| `string_power_kw` | String DC Power | `number` | $kW$ | Output power of the individual string channel: $(V \times A) / 1000$. | Transducer computation. |
| `string_status` | String Health Classification| `enum` | Status | `optimal` (normal yield), `soiling_warning` (current derated $>15\%$ due to dust/shadows), `fuse_check` (zero current / blown fuse), `clipping` (MPPT saturation). | Delta comparison against peer string average. |
| **Modbus SunSpec Register Map** | | | | | |
| `register_address` | Register Address | `integer` | Decimal | Modbus register index (e.g. `30001` for DC Voltage Input 1). | Modbus SunSpec standard. |
| `hex_address` | Hex Register Offset | `string` | Hex | Hexadecimal representation of the register address (e.g. `0x7531`). | SunSpec mapping. |
| `register_key` | Register Name | `string` | Key | Machine-readable variable key (e.g. `DC_VOLTAGE_1`, `GRID_FREQ`). | SCADA configuration. |
| `raw_register_value` | Raw Value | `number` | Count | Unscaled 16-bit or 32-bit integer transmitted over RS485/TCP. | Raw packet buffer. |
| `scaled_engineering_value`| Engineering Value | `number` | Scaled Unit | Human-readable physical value computed using the SunSpec scale factor ($SF$): $\text{Value} \times 10^{SF}$. | Scaled SCADA pipeline. |

---

### Page 4: BESS Racks & BMS Diagnostics Subsystem (`/sites/[id]/bess`)

Provides telemetry on the lithium-iron-phosphate (LFP) energy storage container, including State of Charge, State of Health, individual cell voltage heatmaps, liquid chiller loop, and NFPA 855 fire safety metrics.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `bess_soc_pct` | State of Charge (SoC) | `number` | $\%$ | Usable energy currently stored in the battery as a percentage of total rated capacity. | BMS Coulomb counter + OCV algorithm. |
| `bess_soh_pct` | State of Health (SoH) | `number` | $\%$ | Maximum retention capacity of the battery pack relative to original nameplate capacity. | BMS degradation estimator. |
| `equivalent_full_cycles` | EFC Cycle Count | `integer` | Cycles | Cumulative throughput cycles logged: $\text{Total Discharge MWh} / \text{Rated MWh Capacity}$. | Cycle accumulation counter. |
| `dc_bus_voltage_v` | DC Bus Voltage | `number` | $V$ | Total direct current voltage across the battery pack terminals (e.g. $748.5\ V$). | High-voltage pack sensor. |
| `pack_current_a` | Battery Pack Current | `number` | $A$ | Total DC current flowing into (charging) or out of (discharging) the battery rack. | High-precision shunt sensor. |
| `round_trip_efficiency_pct`| Round-Trip Efficiency (RTE)| `number` | $\%$ | Ratio of energy delivered during discharge to energy consumed during charge: $(E_{\text{discharge}} / E_{\text{charge}}) \times 100$. | Energy meter integrations. |
| **16-Cell BMS Heatmap Matrix** | | | | | |
| `cell_id` | Cell Index | `integer` | 1 to 16 | Identification index of individual battery cell / module in the telemetry array. | CANbus cell controller index. |
| `cell_voltage_mv` | Cell Voltage | `number` | $mV$ | Potential difference measured across the positive and negative terminals of cell $i$. | Cell supervisory circuit (CSC). |
| `cell_temp_c` | Cell Temperature | `number` | $^\circ C$ | Surface temperature measured by thermistors embedded in the cell pack. | NTC thermistor. |
| `delta_v_mv` | Cell Voltage Delta ($\Delta V$) | `number` | $mV$ | Maximum voltage disparity across the pack: $\Delta V = V_{\max} - V_{\min}$. Alert triggered if $\Delta V > 50\ mV$. | Real-time difference computation. |
| `cell_balance_status` | Balancing Status | `enum` | Status | `optimal` ($\Delta V \le 30\ mV$), `elevated_temp` ($T > 32^\circ C$), `delta_warning` ($\Delta V > 50\ mV$). | BMS balancing logic. |
| **Liquid Chiller Cooling Loop** | | | | | |
| `coolant_supply_temp_c` | Coolant Supply Temp | `number` | $^\circ C$ | Temperature of liquid coolant entering the battery thermal plates from the chiller. | Chiller inlet RTD sensor. |
| `coolant_return_temp_c` | Coolant Return Temp | `number` | $^\circ C$ | Temperature of coolant leaving the battery rack after absorbing heat. | Chiller outlet RTD sensor. |
| `coolant_flow_rate_l_min` | Coolant Flow Rate | `number` | $L/min$ | Volumetric flow rate of glycol-water mixture circulated through cooling channels. | Electromagnetic flow meter. |
| `chiller_compressor_power_kw`| Chiller Power | `number` | $kW$ | Electrical power drawn by the HVAC chiller compressor and circulating pumps. | Auxiliary power meter. |
| **NFPA 855 Fire Safety & Contactors** | | | | | |
| `h2_gas_detector_ppm` | Hydrogen ($H_2$) Sensor | `number` | $ppm$ | Concentration of free hydrogen gas inside the container (early off-gassing indicator). Normal = $0.0\ ppm$. | Thermal conductivity sensor. |
| `co_offgas_sensor_ppm` | Carbon Monoxide ($CO$) | `number` | $ppm$ | Concentration of carbon monoxide inside container (thermal runaway indicator). Safe $\le 5.0\ ppm$. | Electrochemical sensor. |
| `aerosol_cylinder_press_bar`| Aerosol Pressure | `number` | $bar$ | Working pressure of the Stat-X aerosol fire suppression cylinders. Armed = $\approx 160\ bar$. | Pressure transmitter. |
| `dc_contactor_positive_state`| Main DC Positive Contactor| `enum` | State | Mechanical contactor position: `CLOSED` (energized) or `OPEN` (isolated). | Auxiliary switch contact. |
| `dc_contactor_negative_state`| Main DC Negative Contactor| `enum` | State | Mechanical contactor position: `CLOSED` (energized) or `OPEN` (isolated). | Auxiliary switch contact. |
| `insulation_resistance_mohm`| Insulation Resistance | `number` | $M\Omega$ | Dielectric insulation resistance between DC bus poles and protective ground. Safe $> 1.0\ M\Omega$. | Continuous insulation monitor. |

---

### Page 5: Diesel Generator (DG) Peaker & Backup Subsystem (`/sites/[id]/dg`)

Monitors diesel alternator sets utilized for emergency islanding backup and microgrid black-start synchronization.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `dg_running` | Running State | `boolean` | Flag | True if the diesel prime mover is running and producing AC electrical power. | DSE 8610 controller status. |
| `dg_operating_state` | Operating Mode | `enum` | State | `OFF` (locked out), `AUTO_STANDBY_READY` (armed for auto-mains failure), `RUNNING_LOADED` (online supplying bus). | DeepSea CANbus status. |
| `engine_speed_rpm` | Engine RPM | `number` | $RPM$ | Rotational speed of the crankshaft. Standard: $1500\ RPM$ ($50\ Hz$) or $1800\ RPM$ ($60\ Hz$). | Magnetic pickup sensor. |
| `alternator_voltage_v` | Alternator AC Voltage | `number` | $V$ | 3-phase line-to-line RMS AC voltage produced by alternator terminals. | Alternator voltage sensing. |
| `alternator_frequency_hz`| Alternator Frequency | `number` | $Hz$ | Electrical AC frequency maintained by the electronic engine governor. | Frequency counter. |
| `fuel_tank_level_pct` | Fuel Tank Level | `number` | $\%$ | Remaining fuel level in the primary base tank. | Hydrostatic level sensor. |
| `fuel_liters_remaining` | Remaining Fuel Volume | `number` | Liters | Estimated volume of diesel remaining in storage. | $\text{Tank Capacity} \times \text{fuel\_pct}$. |
| `fuel_burn_rate_l_h` | Fuel Burn Rate | `number` | $L/hr$ | Real-time volumetric fuel consumption rate based on current kilowatt loading. | ECU fuel injector pulse rate. |
| `hours_remaining_at_load`| Autonomy Remaining | `number` | Hours | Estimated run hours available until fuel exhaustion under current load. | $\text{fuel\_liters\_remaining} / \text{fuel\_burn\_rate\_l\_h}$. |
| `oil_pressure_bar` | Lube Oil Pressure | `number` | $bar$ | Lubrication oil gallery pressure. Nominal safe range: $4.0 - 6.0\ bar$. | Piezoresistive pressure transducer. |
| `coolant_temp_c` | Engine Coolant Temp | `number` | $^\circ C$ | Temperature of engine jacket water coolant. Normal operating: $80^\circ - 90^\circ C$. | Engine thermistor. |
| `starter_battery_vdc` | Starter Battery Potential | `number` | $V_{dc}$ | Float charge voltage of the 24V starter battery bank. Healthy: $> 26.5\ V_{dc}$. | 24V float charger monitor. |
| `exhaust_temp_c` | Exhaust Gas Temp | `number` | $^\circ C$ | Turbocharger manifold exhaust temperature. Safe $\le 550^\circ C$. | Type K thermocouple. |
| `cumulative_run_hours` | Cumulative Run Hours | `number` | Hours | Total engine run hours logged since commissioning. | Non-volatile engine hour meter. |
| `next_service_hours` | Service Interval Countdown| `number` | Hours | Operating hours remaining until the next mandatory 250-hour oil and filter service. | $250 - (\text{run\_hours} \pmod{250})$. |
| `pv_dg_fuel_displaced_liters`| Diesel Displaced by Solar | `number` | Liters | Liters of diesel fuel saved today by displacing genset loading with solar and BESS discharge. | $\text{PV-DG Yield (kWh)} \times 0.26\ L/kWh$. |

---

### Page 6: Utility Grid Intertie & Power Quality Subsystem (`/sites/[id]/grid`)

Monitors the point of common coupling (PCC) between the industrial facility and the regional electrical transmission grid.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `live_grid_power_kw` | Net Exchange | `number` | $kW$ | Net active power exchange at substation intertie. Positive = Import; Negative = Export. | Substation 4-quadrant meter. |
| `grid_frequency_hz` | Grid Frequency | `number` | $Hz$ | Grid frequency. Nominal $50.00\ Hz$ (IEC) or $60.00\ Hz$ (ANSI). Alert if deviation $> \pm 0.5\ Hz$. | Digital frequency transducer. |
| `power_factor` | Displacement Power Factor| `number` | $\cos \phi$ | Ratio of real active power ($kW$) to apparent power ($kVA$). Ideal target: $0.98 - 1.00$ Lag. | Power quality analyzer. |
| `thd_voltage_pct` | Voltage Harmonics (THD-V)| `number` | $\%$ | Total Harmonic Distortion of the voltage waveform. IEEE 519 limit $\le 5.0\%$. | Fast Fourier Transform (FFT). |
| `thd_current_pct` | Current Harmonics (THD-I)| `number` | $\%$ | Total Harmonic Distortion of the current waveform. IEEE 519 limit $\le 8.0\%$. | FFT harmonic analyzer. |
| `contracted_demand_kva` | Maximum Demand (MD) Limit| `number` | $kVA$ | Contracted capacity sanctioned by utility. Demand spikes above this incur severe monetary penalty. | Utility tariff contract. |
| `md_utilization_pct` | MD Utilization | `number` | $\%$ | Percentage of contracted capacity currently occupied: $(\text{Load kW} / \text{MD kVA}) \times 100$. | Real-time ratio calculation. |
| `peak_tariff_rate` | Peak TOU Tariff | `number` | $₹/kWh$ | Electric tariff charged during peak consumption window (e.g. 18:00 to 22:00 hrs). | Utility rate schedule. |
| `offpeak_tariff_rate` | Off-Peak TOU Tariff | `number` | $₹/kWh$ | Low electric tariff charged during off-peak night/solar soaking hours. | Utility rate schedule. |
| `feed_in_tariff_rate` | Feed-in Tariff (Export) | `number` | $₹/kWh$ | Credit rate awarded for green solar energy exported back into the grid network. | Net metering agreement. |
| `grid_import_today_kwh` | Daily Grid Import | `number` | $kWh$ | Cumulative electric energy bought from utility today. | Import register integrator. |
| `grid_export_today_kwh` | Daily Grid Export | `number` | $kWh$ | Cumulative clean solar energy exported to utility grid today. | Export register integrator. |
| `voltage_l1_v`, `voltage_l2_v`, `voltage_l3_v` | 3-Phase Phase Voltages | `number` | $V$ | Individual phase-to-neutral or line-to-line RMS voltages measured on phases L1, L2, and L3. | 3-phase PT voltage inputs. |

---

### Page 7: Facility Power Demand & Load Profiler Subsystem (`/sites/[id]/load`)

Measures internal industrial energy consumption across critical production machines, HVAC chillers, and auxiliary lighting feeders.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `live_load_kw` | Instantaneous Active Demand | `number` | $kW$ | Real-time electrical power drawn by plant equipment. | Main distribution board CTs. |
| `apparent_power_kva` | Apparent Demand | `number` | $kVA$ | Vector sum of active and reactive power: $S = \sqrt{P^2 + Q^2}$. | 3-phase meter calculation. |
| `reactive_power_kvar` | Reactive Demand | `number` | $kVAR$ | Inductive magnetizing power drawn by electric motors and transformers. | Reactive transducer. |
| `critical_process_load_kw`| Machinery & Process Feed | `number` | $kW$ | Power consumption allocated to heavy industrial production lines (nominal $45\%$ of load). | Sub-panel meter feeder 1. |
| `hvac_chillers_load_kw` | HVAC & Liquid Chillers | `number` | $kW$ | Power consumption allocated to ventilation, cooling, and compressors (nominal $35\%$ of load). | Sub-panel meter feeder 2. |
| `auxiliary_lighting_load_kw`| Auxiliaries & Lighting | `number` | $kW$ | Power drawn by auxiliary facilities, office lighting, and peripheral loads (nominal $20\%$). | Sub-panel meter feeder 3. |
| `current_phase_l1_a` | Phase L1 Current | `number` | $A$ | True RMS current flowing through phase conductor L1. | Current transformer L1. |
| `current_phase_l2_a` | Phase L2 Current | `number` | $A$ | True RMS current flowing through phase conductor L2. | Current transformer L2. |
| `current_phase_l3_a` | Phase L3 Current | `number` | $A$ | True RMS current flowing through phase conductor L3. | Current transformer L3. |
| `neutral_current_a` | Neutral Conductor Current | `number` | $A$ | Vector sum return current through neutral: $I_N = \vec{I}_1 + \vec{I}_2 + \vec{I}_3$. Alert if $I_N > 25\ A$. | Neutral CT transducer. |
| `peak_load_recorded_kw` | Today's Peak Demand | `number` | $kW$ | Highest 15-minute rolling average kilowatt demand logged today. | Maximum demand register. |

---

### Page 8: Historical Energy Balance & Consumption Workspace (`/analytics?mode=dispatch`)

Processes time-series energy balances across selectable date ranges (`today`, `7d`, `30d`, `ytd`, `custom`) and calculates economic returns, demand shaving, and ESG compliance.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `timeframe` | Date Range Selector | `enum` | Timeframe | Filter window: `today` (24h), `7d` (168h), `30d` (720h), `ytd` (YTD), `custom` (custom range). | UI State. |
| `start_date`, `end_date` | Custom Date Boundary | `string` | ISO Date | Boundary timestamps formatted as `YYYY-MM-DDTHH:mm:ssZ`. | Datepicker input. |
| `interval` | Aggregation Resolution | `enum` | Interval | Rollup interval: `15m` (sub-hourly), `1h` (hourly), `1d` (daily rollup). | Group by timestamp bucket. |
| `solar_self_consumption_pct`| Solar Self-Consumption | `number` | $\%$ | Percentage of generated solar power consumed onsite rather than exported to the utility grid: $\frac{\text{Solar Generated} - \text{Solar Exported}}{\text{Solar Generated}} \times 100$. | Analytics engine. |
| `tou_arbitrage_savings_inr`| TOU Arbitrage Profit | `number` | $₹\ \text{INR}$ | Financial gain achieved by charging BESS during low-tariff off-peak windows and discharging during high-tariff peak windows: $\sum (\text{BESS Discharge kWh} \times (T_{\text{peak}} - T_{\text{offpeak}}))$. | Analytics engine. |
| `avoided_md_penalties_inr` | Avoided MD Penalties | `number` | $₹\ \text{INR}$ | Financial savings from using BESS to clip facility peak demand spikes that would otherwise trigger demand surcharge penalties: $\text{Contracted MD kVA} \times ₹125 / kVA$. | Demand limiter logic. |
| `diesel_cost_saved_inr` | Diesel Cost Saved | `number` | $₹\ \text{INR}$ | Financial savings resulting from displacing diesel fuel combustion: $\text{Liters Displaced} \times ₹92/\text{Liter}$. | Fuel saving formula. |
| `net_grid_electricity_cost_inr`| Net Grid Bill | `number` | $₹\ \text{INR}$ | Net electricity bill: $(\text{Grid Import kWh} \times T_{\text{offpeak}}) - (\text{Grid Export kWh} \times \text{Feed-in Rate})$. | Billing formula. |
| `co2_abated_kg` | Carbon Offset Mass | `number` | $kg\ CO_2$ | Mass of greenhouse gas emissions avoided: $\text{Total Clean Solar kWh} \times 0.49\ kg\ CO_2/kWh$. | ESG calculation. |
| `trees_equivalent` | Trees Absorption Equivalent| `integer` | Trees | Equivalent trees: $\text{co2\_abated\_kg} / 21.8\ kg/\text{tree-year}$. | ESG standard conversion. |

---

### Page 9: Plant Generation Comparative & 4-Quadrant Benchmark Hub (`/analytics?mode=comparative`)

Compares actual facility yield against modeled expected yields, P50 simulation targets, CUF benchmarks, and weather curtailment patterns over a 7, 14, or 30-day window.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `days_count` | Benchmark Range | `integer` | Days | Number of historical days analyzed: `7`, `14`, or `30`. | UI query parameter. |
| `actual_energy_kwh` | Actual Generation | `number` | $kWh$ | Daily generation measured at plant revenue billing meter. | Integrator on inverter active power. |
| `expected_energy_kwh` | Expected Generation | `number` | $kWh$ | Daily target modeled from historical P50 solar irradiance expectations. | PVsyst / simulation baseline. |
| `generation_variance_pct` | Production Variance | `number` | $\%$ | Performance deviation: $(\frac{\text{Actual kWh} - \text{Expected kWh}}{\text{Expected kWh}}) \times 100$. Negative = underperformance. | Comparative algorithm. |
| `weather_curtailment_flag` | Weather Classification | `enum` | Weather | `sunny` (normal irradiance), `partly_cloudy` (intermittent irradiance), `rain_curtailment` (severe rainfall/cloud dip). | Open-Meteo / pyranometer audit. |
| `overall_curtailment_days` | Curtailment Day Count | `integer` | Days | Total days in selected window that suffered meteorological curtailment. | Count of records with variance $< -20\%$. |

---

### Page 10: Certified Solar & BESS Maintenance Hub (`/maintenance`)

A dedicated operations & maintenance (O&M) service marketplace exclusively covering **Solar PV** and **BESS Storage** systems. (Third-party DG and generic machinery are excluded by design).

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `asset_type` | Targeted Asset Group | `enum` | Asset | Strict classification: `solar_pv` (Photovoltaic) or `bess` (Battery Storage). | Service package configuration. |
| `service_package_id` | Service Package ID | `string` | UUID | Identifier for standardized maintenance packages. | `maintenance_services.id` |
| `service_slug` | Service Slug | `string` | Slug | Unique slug (e.g. `drone-ir-thermography`, `bess-coolant-flush-and-deion`). | `maintenance_services.slug` |
| `base_price_inr` | Base Service Fee | `number` | $₹\ \text{INR}$ | Standard upfront quote for the service package before taxes. | Service pricing catalog. |
| `estimated_duration_hours`| Service Duration | `number` | Hours | Estimated technician labor hours required on-site to complete testing. | O&M engineering estimate. |
| `deliverables_list` | Deliverables Checklist | `string[]`| String Array | Standard deliverables included in the service report (e.g. IV Curve Traces, FLIR Thermal Map, Megger Insulation Test). | Service package catalog. |
| `ticket_id` | Ticket ID | `string` | UUID | Primary key for maintenance ticket instance. | `maintenance_tickets.id` |
| `ticket_number` | Service Ticket Number | `string` | Human Code | Human-readable identifier formatted as `NEON-MNT-XXXX` (e.g. `NEON-MNT-7492`). | Auto-generated sequential code. |
| `ticket_status` | Lifecycle State | `enum` | Status | State machine: `requested`, `quote_accepted`, `technician_assigned`, `en_route`, `on_site`, `testing_and_verification`, `completed`, `cancelled`. | Ticket lifecycle controller. |
| `scheduled_date` | Scheduled Date | `string` | ISO Date | Service execution calendar day (`YYYY-MM-DD`). | Customer wizard input. |
| `time_window` | Time Window Slot | `string` | Slot | Scheduled technician arrival window (e.g. `09:00 - 13:00 IST`). | Customer wizard input. |
| `assigned_crew_name` | Assigned Crew / Lead | `string` | Text | Name of certified field engineering crew dispatched to the plant. | Dispatch dispatcher. |
| `payment_status` | Billing Status | `enum` | Status | Financial status: `pending`, `paid`, `credit_deducted`. | Stripe checkout / billing engine. |
| `service_report_url` | Certified PDF Report | `string` | URL | Tamper-proof PDF report stored in Supabase Storage (`service-reports/`). | PDF generator service. |

---

### Page 11: SaaS Subscription, Licensing & Renewal Center (`/subscription`)

Governs commercial software tiers, hardware capacity limits, and subscription renewal cycles across an organization's fleet.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `subscription_tier` | Plan Tier | `enum` | Tier | `starter` ($\le 500\ kW$), `pro_commercial` ($\le 2500\ kW$), `utility_enterprise` ($> 2500\ kW$). | `organizations.tier`. |
| `billing_cycle` | Billing Frequency | `enum` | Cycle | `monthly` or `annual` (annual grants standard discount). | Customer selection. |
| `monthly_base_fee_inr` | Monthly Base Price | `number` | $₹\ \text{INR}$ | Base platform license rate per month (e.g. Starter: ₹16,500; Pro: ₹49,500; Enterprise: ₹1,24,000). | Subscription pricing catalog. |
| `annual_base_fee_inr` | Annual Base Price | `number` | $₹\ \text{INR}$ | Discounted annual license rate (e.g. Pro: ₹4,95,000 / year). | Subscription pricing catalog. |
| `addon_fast_polling` | 1-Second Sub-Second Ingest| `boolean` | Add-on | Addon for high-frequency sub-second telemetry ingestion pipeline. | Optional feature toggle. |
| `addon_compliance_reporting`| Regulatory ESG Statements | `boolean` | Add-on | Addon enabling automated PDF generation for carbon offsets and CEA compliance. | Optional feature toggle. |
| `addon_guaranteed_sla` | Dedicated 99.9% Uptime SLA | `boolean` | Add-on | Addon providing dedicated 1-hour engineer dispatch and SCADA gateway support. | Optional feature toggle. |
| `renewal_confirmation_no`| Confirmation Number | `string` | Code | Confirmation string issued upon renewal: `NEON-LIC-XXXXX`. | Renewal transaction handler. |
| `next_renewal_date` | Next Billing Date | `string` | ISO Date | Timestamp when the current subscription term expires and automatically renews. | Stripe webhook / database calculation. |

---

### Page 12: Organization Multi-Tenant Invitations & Onboarding (`/invite`)

Manages secure team invitations, role assignments, and cryptographically signed onboarding links.

| Parameter Key | UI Display Label | Data Type | Physical Unit | Engineering Definition & Purpose | Calculation / Origin |
|---|---|---|---|---|---|
| `target_org_id` | Organization ID | `string` | Clerk Org ID | Clerk organization ID to which member is invited (e.g. `org_3JgZ51s2g9LkRRE0L61kAXDGDWE`). | Admin context. |
| `invitee_email` | Team Member Email | `string` | Email | Destination email address where invite link or Clerk invitation is dispatched. | User input. |
| `assigned_role` | Member Permission Role | `enum` | Role | Assigned permission: `org:admin`, `org:member`, `asset_manager`, `site_engineer`, `field_technician`, `client_viewer`. | RBAC assignment. |
| `invite_token` | Signed Security Token | `string` | HMAC Hex | Cryptographic HMAC-SHA256 signature validating invite legitimacy: $\text{HMAC}(\text{orgId} + \text{role} + \text{salt}, \text{secret})$. | Token service. |

---

### Module 13: Industrial IoT Edge Gateway Telemetry Ingestion (Field SCADA)

Edge dataloggers (Advantech, Moxa, Raspberry Pi SCADA) periodically push sub-second or 5-second electrical transfer state directly to the telemetry pipeline.

| Parameter Key | Data Type | Physical Unit | Engineering Definition & Purpose |
|---|---|---|---|
| `timestamp` | `string` | ISO-8601 | Sampling epoch recorded by edge gateway clock (e.g. `2026-10-11T12:00:00.000Z`). |
| `solar_power_kw` | `number` | $kW$ | Real-time solar PV generation at time of sample. |
| `bess_power_kw` | `number` | $kW$ | Bidirectional BESS power. Negative = Charging; Positive = Discharging. |
| `bess_soc_pct` | `number` | $\%$ | Battery state of charge percentage. |
| `bess_soh_pct` | `number` | $\%$ | Battery state of health percentage. |
| `grid_power_kw` | `number` | $kW$ | Net grid exchange. Positive = Import; Negative = Export. |
| `dg_power_kw` | `number` | $kW$ | Active power delivered by diesel generator. |
| `load_power_kw` | `number` | $kW$ | Total facility demand consumed at time of sample. |
| `dg_fuel_pct` | `number` | $\%$ | Diesel storage fuel tank percentage remaining. |
| `dg_running` | `boolean` | Flag | Boolean flag indicating whether the diesel genset engine was running. |
| `grid_frequency_hz` | `number` | $Hz$ | AC electrical grid frequency. |
| `grid_power_factor` | `number` | $\cos \phi$ | Operating displacement power factor at PCC. |

---

## 3. Comprehensive Page-Wise API Endpoint Specifications

Below are the exact endpoint definitions, authentication constraints, query parameters, request bodies, sample request payloads, and sample response payloads required for each page.

---

### 3.1 Fleet Cockpit APIs (`/`)

#### 3.1.1 List Fleet Sites with Live Snapshots
- **Endpoint**: `GET /api/v1/sites`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **RBAC Roles**: Superadmin, Asset Manager, Site Engineer, Field Technician, Client Viewer
- **Headers**:
  ```http
  Authorization: Bearer <clerk_session_token>
  Accept: application/json
  ```
- **Query Parameters**:
  - `status` (*optional*, `string`): Filter by operational state (`online`, `degraded`, `offline`, `maintenance`).
  - `asset` (*optional*, `string`): Filter by hardware capability (`solar`, `bess`, `dg`, `grid`).
  - `sort` (*optional*, `string`): Sort column (`name`, `capacity`, `created_at`). Default: `created_at`.
  - `order` (*optional*, `string`): Sort direction (`asc`, `desc`). Default: `asc`.

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 2,
  "orgId": "org_3JgZ51s2g9LkRRE0L61kAXDGDWE",
  "data": [
    {
      "id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
      "org_id": "0192384a-7182-7d31-9a1b-c82736451928",
      "name": "Bakersfield Central Solar-Plus-Storage",
      "slug": "bakersfield-central",
      "location_city": "Bakersfield",
      "location_state": "CA",
      "latitude": 35.3733,
      "longitude": -119.0187,
      "plant_type": "commercial_industrial",
      "status": "online",
      "solar_capacity_kwp": 940.0,
      "bess_capacity_kwh": 1500.0,
      "bess_power_kw": 500.0,
      "dg_capacity_kva": 0.0,
      "contracted_demand_kva": 800.0,
      "has_solar": true,
      "has_bess": true,
      "has_dg": false,
      "has_grid": true,
      "peak_tariff_rate": 8.50,
      "offpeak_tariff_rate": 4.50,
      "subscription_status": "active",
      "created_at": "2026-09-01T08:00:00.000Z",
      "solar_power_kw": 880.5,
      "live_bess_power_kw": -240.0,
      "grid_power_kw": -120.0,
      "dg_power_kw": 0.0,
      "load_power_kw": 520.5,
      "bess_soc_pct": 82.4,
      "dg_fuel_pct": 0.0,
      "dg_running": false,
      "solar_yield_today_kwh": 4820.0,
      "load_consumption_today_kwh": 6120.0,
      "grid_import_today_kwh": 840.0,
      "grid_export_today_kwh": 1280.0,
      "dg_yield_today_kwh": 0.0,
      "bess_charge_today_kwh": 960.0,
      "bess_discharge_today_kwh": 820.0,
      "co2_saved_today_kg": 2361.8,
      "cuf_pct": 21.36,
      "specific_yield_kwh_per_kwp": 5.13,
      "annual_target_mwh": 1450.0,
      "annual_achieved_mwh": 1184.2,
      "trees_planted_today": 108,
      "coal_saved_today_kg": 1928.0,
      "snapshot_time": "2026-10-11T12:00:00.000Z"
    },
    {
      "id": "f8a19b2c-3d44-481e-8a2f-9b8c7d6e5a4b",
      "org_id": "0192384a-7182-7d31-9a1b-c82736451928",
      "name": "Mojave Desert Hybrid Microgrid",
      "slug": "mojave-desert-hybrid",
      "location_city": "Mojave",
      "location_state": "CA",
      "latitude": 35.0528,
      "longitude": -118.1737,
      "plant_type": "utility_microgrid",
      "status": "online",
      "solar_capacity_kwp": 2500.0,
      "bess_capacity_kwh": 4000.0,
      "bess_power_kw": 1000.0,
      "dg_capacity_kva": 750.0,
      "contracted_demand_kva": 1200.0,
      "has_solar": true,
      "has_bess": true,
      "has_dg": true,
      "has_grid": true,
      "peak_tariff_rate": 9.20,
      "offpeak_tariff_rate": 4.80,
      "subscription_status": "active",
      "created_at": "2026-08-15T09:30:00.000Z",
      "solar_power_kw": 2180.0,
      "live_bess_power_kw": -450.0,
      "grid_power_kw": -320.0,
      "dg_power_kw": 0.0,
      "load_power_kw": 1410.0,
      "bess_soc_pct": 76.5,
      "dg_fuel_pct": 91.5,
      "dg_running": false,
      "solar_yield_today_kwh": 11450.0,
      "load_consumption_today_kwh": 14800.0,
      "grid_import_today_kwh": 1200.0,
      "grid_export_today_kwh": 3100.0,
      "dg_yield_today_kwh": 0.0,
      "bess_charge_today_kwh": 2400.0,
      "bess_discharge_today_kwh": 1850.0,
      "co2_saved_today_kg": 5610.5,
      "cuf_pct": 19.08,
      "specific_yield_kwh_per_kwp": 4.58,
      "annual_target_mwh": 3800.0,
      "annual_achieved_mwh": 3020.5,
      "trees_planted_today": 257,
      "coal_saved_today_kg": 4580.0,
      "snapshot_time": "2026-10-11T12:00:00.000Z"
    }
  ],
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

#### 3.1.2 Register New Solar & BESS Site
- **Endpoint**: `POST /api/v1/sites`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **RBAC Roles**: Superadmin, Asset Manager
- **Request Body JSON Schema**:
```json
{
  "name": "Sonoran Clean Energy Microgrid",
  "locationCity": "Phoenix",
  "locationState": "AZ",
  "latitude": 33.4484,
  "longitude": -112.074,
  "plantType": "commercial_industrial",
  "solarCapacityKwp": 1200,
  "bessCapacityKwh": 2000,
  "bessPowerKw": 600,
  "dgCapacityKva": 500,
  "contractedDemandKva": 1000,
  "hasSolar": true,
  "hasBess": true,
  "hasDg": true,
  "hasGrid": true,
  "peakTariffRate": 8.75,
  "offpeakTariffRate": 4.25
}
```

##### Sample Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Site installation Sonoran Clean Energy Microgrid provisioned successfully",
  "data": {
    "id": "c71a932b-18df-419a-9e12-4f28bc3a9101",
    "name": "Sonoran Clean Energy Microgrid",
    "slug": "sonoran-clean-energy-microgrid",
    "location_city": "Phoenix",
    "location_state": "AZ",
    "status": "online",
    "subscription_status": "active",
    "solar_capacity_kwp": 1200,
    "bess_capacity_kwh": 2000,
    "bess_power_kw": 600,
    "dg_capacity_kva": 500,
    "contracted_demand_kva": 1000,
    "has_solar": true,
    "has_bess": true,
    "has_dg": true,
    "has_grid": true,
    "peak_tariff_rate": 8.75,
    "offpeak_tariff_rate": 4.25,
    "created_at": "2026-10-11T12:05:00.000Z"
  },
  "timestamp": "2026-10-11T12:05:00.000Z"
}
```

---

### 3.2 Site Master & 5-Node Flow APIs (`/sites/:id`)

#### 3.2.1 Get Site Installation Details & Hardware Inventory
- **Endpoint**: `GET /api/v1/sites/:id`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **Path Parameters**:
  - `id` (`string`, UUID): Primary key of the site.

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "site": {
      "id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
      "org_id": "0192384a-7182-7d31-9a1b-c82736451928",
      "name": "Bakersfield Central Solar-Plus-Storage",
      "slug": "bakersfield-central",
      "location_city": "Bakersfield",
      "location_state": "CA",
      "plant_type": "commercial_industrial",
      "status": "online",
      "solar_capacity_kwp": 940.0,
      "bess_capacity_kwh": 1500.0,
      "bess_power_kw": 500.0,
      "dg_capacity_kva": 0.0,
      "contracted_demand_kva": 800.0,
      "has_solar": true,
      "has_bess": true,
      "has_dg": false,
      "has_grid": true,
      "peak_tariff_rate": 8.50,
      "offpeak_tariff_rate": 4.50,
      "subscription_status": "active",
      "created_at": "2026-09-01T08:00:00.000Z",
      "solar_power_kw": 880.5,
      "live_bess_power_kw": -240.0,
      "grid_power_kw": -120.0,
      "dg_power_kw": 0.0,
      "load_power_kw": 520.5,
      "bess_soc_pct": 82.4,
      "dg_fuel_pct": 0.0,
      "dg_running": false,
      "solar_yield_today_kwh": 4820.0,
      "load_consumption_today_kwh": 6120.0,
      "grid_import_today_kwh": 840.0,
      "grid_export_today_kwh": 1280.0,
      "cuf_pct": 21.36,
      "specific_yield_kwh_per_kwp": 5.13,
      "peak_irradiance_wm2": 840.0,
      "peak_irradiance_time": "12:45 PM",
      "pv_dg_fuel_saved_liters": 0.0,
      "pv_dg_fuel_saved_kwh": 0.0
    },
    "devices": [
      {
        "id": "d1-9f8a",
        "site_id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
        "name": "Main Central Inverter 01",
        "category": "solar_inverter",
        "manufacturer": "SMA Solar",
        "model": "Sunny Highpower 150kW",
        "serial_number": "SMA-SHP-2026-09412",
        "is_online": true
      },
      {
        "id": "d2-7c3e",
        "site_id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
        "name": "BESS Battery Rack Matrix",
        "category": "bess_bms",
        "manufacturer": "Tesla Energy",
        "model": "Megapack BMS v2",
        "serial_number": "TSLA-BMS-84920",
        "is_online": true
      },
      {
        "id": "d3-5a1b",
        "site_id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
        "name": "BESS Power Conversion System",
        "category": "bess_pcs",
        "manufacturer": "Dynapower",
        "model": "CPS-500 Inverter",
        "serial_number": "DYNA-PCS-500-192",
        "is_online": true
      },
      {
        "id": "d4-2f6c",
        "site_id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
        "name": "Substation Feed Energy Meter",
        "category": "grid_meter",
        "manufacturer": "Schneider Electric",
        "model": "PowerLogic ION9000",
        "serial_number": "SCH-ION9000-88124",
        "is_online": true
      }
    ]
  },
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

#### 3.2.2 Update Site Configuration & Tariff Rates
- **Endpoint**: `PUT /api/v1/sites/:id`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **RBAC Roles**: Superadmin, Asset Manager
- **Sample Request Payload**:
```json
{
  "name": "Bakersfield Central Solar-Plus-Storage (Expanded)",
  "status": "online",
  "subscription_status": "active",
  "peak_tariff_rate": 8.90,
  "offpeak_tariff_rate": 4.60
}
```

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Site installation updated successfully",
  "data": {
    "id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
    "name": "Bakersfield Central Solar-Plus-Storage (Expanded)",
    "status": "online",
    "subscription_status": "active",
    "peak_tariff_rate": 8.90,
    "offpeak_tariff_rate": 4.60,
    "updated_at": "2026-10-11T12:08:00.000Z"
  },
  "timestamp": "2026-10-11T12:08:00.000Z"
}
```

---

#### 3.2.3 Site Weather Forecast & BESS Automation Directives
- **Endpoint**: `GET /api/v1/sites/:id/weather`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **Integration**: Onsite Pyranometers + Open-Meteo Solar Forecast API

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "siteId": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
    "latitude": 35.3733,
    "longitude": -119.0187,
    "locationCity": "Bakersfield",
    "locationState": "CA",
    "current": {
      "temperatureC": 28.4,
      "apparentTemperatureC": 27.9,
      "humidityPct": 24,
      "cloudCoverPct": 12,
      "windSpeedKmh": 14.5,
      "precipitationMm": 0.0,
      "isDay": true,
      "weatherCode": 0,
      "weatherDescription": "Clear sky",
      "weatherIcon": "Sun",
      "solarIrradianceWm2": 840.5,
      "directNormalIrradianceWm2": 720.0,
      "diffuseIrradianceWm2": 120.5
    },
    "daily": [
      {
        "date": "2026-10-11",
        "weatherCode": 0,
        "weatherDescription": "Clear sky",
        "weatherIcon": "Sun",
        "tempMaxC": 31.2,
        "tempMinC": 16.8,
        "sunrise": "06:58 AM",
        "sunset": "06:24 PM",
        "uvIndexMax": 7.4,
        "solarRadiationSumMjM2": 22.8,
        "estimatedSolarYieldKwh": 4920.0
      },
      {
        "date": "2026-10-12",
        "weatherCode": 1,
        "weatherDescription": "Mainly clear",
        "weatherIcon": "Sun",
        "tempMaxC": 30.5,
        "tempMinC": 15.9,
        "sunrise": "06:59 AM",
        "sunset": "06:23 PM",
        "uvIndexMax": 7.1,
        "solarRadiationSumMjM2": 21.9,
        "estimatedSolarYieldKwh": 4780.0
      }
    ],
    "hourly": [
      {
        "time": "12:00",
        "temperatureC": 28.4,
        "cloudCoverPct": 12,
        "solarIrradianceWm2": 840.5,
        "precipitationProbability": 0
      },
      {
        "time": "13:00",
        "temperatureC": 29.8,
        "cloudCoverPct": 15,
        "solarIrradianceWm2": 820.0,
        "precipitationProbability": 0
      }
    ],
    "solarForecast": {
      "todayEstimatedYieldKwh": 4920.0,
      "tomorrowEstimatedYieldKwh": 4780.0,
      "solarCapacityKwp": 940.0,
      "moduleTempEstimatedC": 48.2,
      "thermalDeratingPct": -4.2,
      "cloudDeratingPct": -1.8,
      "irradianceCondition": "optimal"
    },
    "bessAutomation": {
      "status": "solar_precharge",
      "title": "Solar Pre-Charge Window Active",
      "recommendation": "Absorb surplus mid-day solar generation into BESS up to 92% SoC before 17:00 IST peak window.",
      "chargeWindow": "11:00 - 16:30",
      "dischargeWindow": "18:00 - 22:00",
      "priority": "high",
      "cloudCoverWarning": false,
      "temperatureDeratingPct": 0.0
    },
    "lastUpdated": "2026-10-11T12:00:00.000Z"
  }
}
```

---

### 3.3 Power Consumption & Historical Analytics APIs (`/analytics`)

#### 3.3.1 Historical Hourly Energy Dispatch & Balance
- **Endpoint**: `GET /api/v1/sites/:id/analytics/consumption`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **Query Parameters**:
  - `range` (`string`): Selected timeframe (`today`, `7d`, `30d`, `ytd`, `custom`). Default: `today`.
  - `startDate` (*optional*, `string`): Start timestamp for custom range (`YYYY-MM-DDTHH:mm:ssZ`).
  - `endDate` (*optional*, `string`): End timestamp for custom range (`YYYY-MM-DDTHH:mm:ssZ`).
  - `interval` (*optional*, `string`): Grouping bucket (`15m`, `1h`, `1d`). Default: `1h`.

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "range": "today",
  "siteId": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
  "summary": {
    "totalSolarKwh": 4820,
    "totalLoadKwh": 6120,
    "solarSelfConsumptionPct": 88.4,
    "bessChargeKwh": 960,
    "bessDischargeKwh": 820,
    "bessRtePct": 89.2,
    "peakDemandRecordedKw": 680,
    "peakDemandShavedKw": 240,
    "avoidedMdPenalties": 100000,
    "touArbitrageSavings": 16400,
    "dieselFuelDisplacedLiters": 1253,
    "dieselCostSaved": 115276,
    "co2AbatedKg": 2362,
    "treesEquivalent": 108,
    "gridImportKwh": 840,
    "gridExportKwh": 1280,
    "netGridCost": -3480
  },
  "data": [
    {
      "id": 101,
      "site_id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
      "bucket_timestamp": "2026-10-11T10:00:00.000Z",
      "avg_solar_kw": 780.0,
      "solar_energy_kwh": 780.0,
      "avg_bess_kw": -200.0,
      "bess_charge_kwh": 200.0,
      "bess_discharge_kwh": 0.0,
      "end_bess_soc_pct": 68.5,
      "avg_load_kw": 510.0,
      "peak_load_kw": 540.0,
      "load_energy_kwh": 510.0,
      "grid_import_kwh": 0.0,
      "grid_export_kwh": 70.0,
      "dg_energy_kwh": 0.0,
      "estimated_cost_saved": 6630.0
    },
    {
      "id": 102,
      "site_id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
      "bucket_timestamp": "2026-10-11T11:00:00.000Z",
      "avg_solar_kw": 880.0,
      "solar_energy_kwh": 880.0,
      "avg_bess_kw": -240.0,
      "bess_charge_kwh": 240.0,
      "bess_discharge_kwh": 0.0,
      "end_bess_soc_pct": 82.4,
      "avg_load_kw": 520.0,
      "peak_load_kw": 560.0,
      "load_energy_kwh": 520.0,
      "grid_import_kwh": 0.0,
      "grid_export_kwh": 120.0,
      "dg_energy_kwh": 0.0,
      "estimated_cost_saved": 7480.0
    }
  ],
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

#### 3.3.2 TOU Tariff Arbitrage & Peak Demand Penalty Analysis
- **Endpoint**: `GET /api/v1/sites/:id/analytics/arbitrage`
- **Authentication**: Bearer Token (Clerk JWT Session)

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "siteId": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
  "data": {
    "peakTariffRate": 8.50,
    "offpeakTariffRate": 4.50,
    "contractedDemandKva": 800,
    "peakDemandRecordedKw": 680,
    "peakDemandShavedKw": 240,
    "monthlyArbitrageSavingsInr": 492000,
    "monthlyAvoidedMdPenaltiesInr": 100000,
    "totalMonthlyFinancialBenefitInr": 592000,
    "annualEstimatedRoiPct": 18.4
  },
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

### 3.4 Certified Solar & BESS Maintenance Marketplace APIs (`/maintenance`)

#### 3.4.1 List Certified Maintenance Packages
- **Endpoint**: `GET /api/v1/maintenance/services`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **Query Parameters**:
  - `assetType` (*optional*, `string`): Filter by `solar_pv` or `bess`.

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "srv-01",
      "asset_type": "solar_pv",
      "title": "Drone Thermal IR String Inspection & IV Curve Tracing",
      "slug": "drone-ir-iv-curve-inspection",
      "description": "Autonomous radiometric FLIR drone aerial scan to detect module micro-cracks, bypass diode failures, and individual string I-V curve tracing across all MPPT combiner boxes.",
      "base_price": 45000,
      "estimated_duration_hours": 4.5,
      "deliverables": [
        "Radiometric thermal orthomosaic map",
        "IEC 62446-1 compliant I-V curve diagnostic report",
        "Sub-string hotspot coordinate classification",
        "Combiner box fuse & contactor torquing log"
      ],
      "is_active": true
    },
    {
      "id": "srv-02",
      "asset_type": "bess",
      "title": "BESS Coolant Loop De-Ionization & Cell Balancing",
      "slug": "bess-coolant-flush-and-deion",
      "description": "Comprehensive liquid chiller flush, de-ionized 50/50 glycol replacement, filter changeout, active battery cell passive balancing, and CANbus BMS insulation resistance Megger testing.",
      "base_price": 75000,
      "estimated_duration_hours": 6.0,
      "deliverables": [
        "Dielectric coolant conductivity certification (<0.5 µS/cm)",
        "16-cell to 128-cell Delta-V balance verification report",
        "Main DC contactor resistance & pre-charge timing audit",
        "NFPA 855 off-gas sensor calibration certification"
      ],
      "is_active": true
    }
  ],
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

#### 3.4.2 Book Maintenance Window & Create Ticket
- **Endpoint**: `POST /api/v1/maintenance/tickets`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **RBAC Roles**: Superadmin, Asset Manager, Site Engineer
- **Request Body JSON Schema**:
```json
{
  "siteId": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
  "assetType": "bess",
  "serviceId": "srv-02",
  "scheduledDate": "2026-10-18",
  "timeWindow": "09:00 - 15:00 IST",
  "customNotes": "Coolant loop conductivity alarm triggered during high ambient temps.",
  "totalPrice": 75000,
  "paymentStatus": "paid"
}
```

##### Sample Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Maintenance booking confirmed for BESS Coolant Loop De-Ionization",
  "data": {
    "id": "tkt-9182",
    "ticket_number": "NEON-MNT-5819",
    "org_id": "0192384a-7182-7d31-9a1b-c82736451928",
    "site_id": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
    "asset_type": "bess",
    "service_id": "srv-02",
    "service_title": "BESS Coolant Loop De-Ionization & Cell Balancing",
    "service_slug": "bess-coolant-flush-and-deion",
    "custom_notes": "Coolant loop conductivity alarm triggered during high ambient temps.",
    "status": "requested",
    "scheduled_date": "2026-10-18",
    "time_window": "09:00 - 15:00 IST",
    "assigned_crew_name": "Alpha BESS Diagnostic Crew (Lead: Marcus Vance)",
    "total_price": 75000,
    "payment_status": "paid",
    "service_report_url": null,
    "created_at": "2026-10-11T12:12:00.000Z"
  },
  "timestamp": "2026-10-11T12:12:00.000Z"
}
```

---

#### 3.4.3 Update Maintenance Ticket Lifecycle State
- **Endpoint**: `PATCH /api/v1/maintenance/tickets/:id/status`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **RBAC Roles**: Superadmin, Asset Manager, Field Technician
- **Request Body JSON Schema**:
```json
{
  "status": "on_site"
}
```
*Valid Status Values*: `requested`, `quote_accepted`, `technician_assigned`, `en_route`, `on_site`, `testing_and_verification`, `completed`, `cancelled`.

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Maintenance ticket status updated to on_site",
  "data": {
    "id": "tkt-9182",
    "ticket_number": "NEON-MNT-5819",
    "status": "on_site",
    "updated_at": "2026-10-11T12:15:00.000Z"
  },
  "timestamp": "2026-10-11T12:15:00.000Z"
}
```

---

### 3.5 Team Multi-Tenant Invitations & Onboarding APIs (`/invite`)

#### 3.5.1 Fetch Manageable Organizations & Invite Tokens
- **Endpoint**: `GET /api/v1/org/invite`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **RBAC Roles**: Superadmin, Asset Manager (`org:admin`)

##### Sample Success Response (`200 OK`)
```json
{
  "organizations": [
    {
      "id": "org_3JgZ51s2g9LkRRE0L61kAXDGDWE",
      "name": "iRasus Technologies",
      "slug": "irasus-technologies",
      "links": {
        "member": "https://app.neonenergy.io/invite?orgId=org_3JgZ51s2g9LkRRE0L61kAXDGDWE&role=org:member&token=9e2d7c1b4a3f",
        "admin": "https://app.neonenergy.io/invite?orgId=org_3JgZ51s2g9LkRRE0L61kAXDGDWE&role=org:admin&token=4a7b2e9f1c3d"
      }
    }
  ],
  "defaultOrgId": "org_3JgZ51s2g9LkRRE0L61kAXDGDWE",
  "isMasterAdmin": true
}
```

---

#### 3.5.2 Dispatch Official Clerk Organization Invitation
- **Endpoint**: `POST /api/v1/org/invite`
- **Authentication**: Bearer Token (Clerk JWT Session)
- **Request Body JSON Schema**:
```json
{
  "action": "send_email",
  "targetOrgId": "org_3JgZ51s2g9LkRRE0L61kAXDGDWE",
  "email": "engineer.raj@solarepc.com",
  "role": "org:member"
}
```

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Invitation sent successfully to engineer.raj@solarepc.com",
  "invitationId": "inv_81920381029",
  "inviteLink": "https://app.neonenergy.io/invite?orgId=org_3JgZ51s2g9LkRRE0L61kAXDGDWE&role=org:member&token=9e2d7c1b4a3f"
}
```

---

#### 3.5.3 Accept Invitation & Join Organization
- **Endpoint**: `POST /api/v1/org/invite/accept`
- **Authentication**: Bearer Token (Signed-in Clerk User)
- **Request Body JSON Schema**:
```json
{
  "orgId": "org_3JgZ51s2g9LkRRE0L61kAXDGDWE",
  "role": "org:member",
  "token": "9e2d7c1b4a3f"
}
```

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "orgName": "iRasus Technologies",
  "message": "Successfully joined iRasus Technologies"
}
```

---

### 3.6 Industrial IoT Edge Gateway Telemetry Ingest (`Edge SCADA`)

#### 3.6.1 Push Telemetry Snapshot from Edge Gateway
- **Endpoint**: `POST /api/v1/telemetry/ingest`
- **Authentication**: Gateway Bearer API Key + Hardware UUID Header
- **Headers**:
  ```http
  Authorization: Bearer neon_gw_live_9f8d7c6b5a4e3d2c1b0a
  X-Site-UUID: e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f
  Content-Type: application/json
  ```
- **Request Body JSON Schema**:
```json
{
  "timestamp": "2026-10-11T12:00:00.000Z",
  "solarPowerKw": 880.5,
  "bessPowerKw": -240.0,
  "bessSocPct": 82.4,
  "bessSohPct": 96.8,
  "gridPowerKw": -120.0,
  "dgPowerKw": 0.0,
  "loadPowerKw": 520.5,
  "dgFuelPct": 91.5,
  "dgRunning": false,
  "gridFrequencyHz": 49.98,
  "gridPowerFactor": 0.985
}
```

##### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Telemetry snapshot recorded and broadcast to realtime subscribers",
  "siteId": "e9b27a3c-4f11-482a-9f5e-1a2b3c4d5e6f",
  "recordedAt": "2026-10-11T12:00:00.125Z"
}
```

---

## 4. Database Schema, PostgreSQL RLS & Performance Guide

The backend engineer MUST persist data into Supabase PostgreSQL following these strict schema specifications, foreign key relationships, compound indexes, and RLS policies.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SUPABASE POSTGRESQL SCHEMA GRAPH                     │
├────────────────────────────────────────────────────────────────────────┤
│ organizations (id PK, clerk_org_id UNIQUE, tier, status)               │
│   ├── sites (id PK, org_id FK, name, slug, capacities, status)        │
│   │     ├── site_devices (id PK, site_id FK, category, is_online)     │
│   │     ├── telemetry_snapshots (site_id PK/FK, live kw, soc, etc.)   │
│   │     ├── telemetry_hourly (id PK, site_id FK, bucket_timestamp)    │
│   │     └── maintenance_tickets (id PK, org_id FK, site_id FK, status)│
│   └── users (id PK, clerk_user_id UNIQUE, current_org_id FK, role)     │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Schema DDL & Compound Indexes
```sql
-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'pro_commercial' CHECK (tier IN ('starter', 'pro_commercial', 'utility_enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Sites
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  plant_type TEXT NOT NULL DEFAULT 'commercial_industrial' CHECK (plant_type IN ('commercial_industrial', 'utility_microgrid', 'rooftop_hybrid')),
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'degraded', 'offline', 'maintenance')),
  solar_capacity_kwp DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_capacity_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_power_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  dg_capacity_kva DOUBLE PRECISION NOT NULL DEFAULT 0,
  contracted_demand_kva DOUBLE PRECISION NOT NULL DEFAULT 0,
  has_solar BOOLEAN NOT NULL DEFAULT true,
  has_bess BOOLEAN NOT NULL DEFAULT true,
  has_dg BOOLEAN NOT NULL DEFAULT false,
  has_grid BOOLEAN NOT NULL DEFAULT true,
  peak_tariff_rate DOUBLE PRECISION NOT NULL DEFAULT 8.50,
  offpeak_tariff_rate DOUBLE PRECISION NOT NULL DEFAULT 4.50,
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sites_org_created ON public.sites(org_id, created_at ASC);

-- 3. Telemetry Snapshots (Latest State per Site)
CREATE TABLE IF NOT EXISTS public.telemetry_snapshots (
  site_id UUID PRIMARY KEY REFERENCES public.sites(id) ON DELETE CASCADE,
  solar_power_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_power_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  grid_power_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  dg_power_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  load_power_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_soc_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_soh_pct DOUBLE PRECISION NOT NULL DEFAULT 100,
  dg_fuel_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
  dg_running BOOLEAN NOT NULL DEFAULT false,
  grid_frequency_hz DOUBLE PRECISION NOT NULL DEFAULT 50.0,
  grid_power_factor DOUBLE PRECISION NOT NULL DEFAULT 0.99,
  solar_yield_today_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  load_consumption_today_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  grid_import_today_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  grid_export_today_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  dg_yield_today_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_charge_today_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_discharge_today_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  co2_saved_today_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Hourly Telemetry Rollups (Time-Series Dispatch)
CREATE TABLE IF NOT EXISTS public.telemetry_hourly (
  id BIGSERIAL PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  bucket_timestamp TIMESTAMPTZ NOT NULL,
  avg_solar_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  solar_energy_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  avg_bess_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_charge_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  bess_discharge_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  end_bess_soc_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
  avg_load_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  peak_load_kw DOUBLE PRECISION NOT NULL DEFAULT 0,
  load_energy_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  grid_import_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  grid_export_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  dg_energy_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
  estimated_cost_saved DOUBLE PRECISION NOT NULL DEFAULT 0
);

-- Compound Index for fast hourly lookup queries (today, 7d, 30d, ytd)
CREATE INDEX IF NOT EXISTS idx_telemetry_hourly_site_bucket ON public.telemetry_hourly(site_id, bucket_timestamp DESC);

-- 5. Maintenance Tickets
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('solar_pv', 'bess')),
  service_id TEXT,
  custom_notes TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested', 'quote_accepted', 'technician_assigned', 'en_route',
    'on_site', 'testing_and_verification', 'completed', 'cancelled'
  )),
  scheduled_date DATE NOT NULL,
  time_window TEXT NOT NULL,
  assigned_crew_name TEXT,
  total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'credit_deducted')),
  service_report_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_org ON public.maintenance_tickets(org_id, created_at DESC);
```

### 4.2 PostgreSQL Row-Level Security (RLS) Template
```sql
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policy for Sites
CREATE POLICY "Users can only read sites within their Clerk organization"
ON public.sites
FOR SELECT
USING (
  org_id IN (
    SELECT id FROM public.organizations 
    WHERE clerk_org_id = current_setting('request.jwt.claim.org_id', true)
  )
);
```

---

## 5. Implementation Checklist for Backend Developer

1. [ ] **Clerk Organization Webhooks**: Configure webhook listener at `/api/v1/clerk/webhook` for `organization.created`, `organization.updated`, and `organizationMembership.created` to synchronize organizations and users with Supabase PostgreSQL.
2. [ ] **Database Migration Execution**: Execute the DDL script in Section 4.1 in Supabase SQL editor to create all foreign keys, compound indexes, and constraints.
3. [ ] **Time-Series Ingestion**: Implement the `POST /api/v1/telemetry/ingest` pipeline. When a snapshot arrives, upsert into `telemetry_snapshots` and accumulate into the hourly bucket in `telemetry_hourly`.
4. [ ] **Realtime WebSocket Channels**: Enable Supabase Realtime publication on `telemetry_snapshots` so changes are broadcast over WebSockets to `/realtime/v1/websocket`.
5. [ ] **Stripe Subscription Webhook**: Handle `customer.subscription.updated` and `invoice.payment_succeeded` at `/api/v1/billing/webhook` to automatically update `organizations.tier` and `sites.subscription_status`.
6. [ ] **PDF Report Storage**: Configure Supabase Storage bucket `service-reports/` with read-only signed URLs for customer PDF downloads.

*Document finalized and ready for backend deployment.*
