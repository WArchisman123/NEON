# VoltTrack EMS Competitor Analysis & Deep Metering Specification

> **Document Type**: Competitor Telemetry & UI Deconstruction  
> **Source Asset**: `public/context/context_vid/output.webm` (108.9s capture of VoltTrack EMS)  
> **Extracted Screenshots Repository**: `public/context/context_img/` (18 pristine high-resolution captures)  
> **Primary Focus**: Comprehensive Page-by-Page Audit & Industrial Electrical Metering Architecture for NEON  

---

## 1. Executive Summary & Screenshot Inventory

The captured EMS video (`demo.voltrack.in`) exhibits an industrial-grade **Battery Energy Storage System (BESS) and Hybrid Microgrid Energy Management System (EMS)**. Unlike standard commercial solar dashboards that only track bulk inverter yield, VoltTrack is deeply rooted in **revenue-grade electrical metering, power quality compliance (IEEE 519), thermal dispatch, NFPA 855 fire sequence automation, and direct Modbus register actuation**.

To ensure NEON surpasses this baseline, all 18 distinct pages and sub-views have been extracted into `public/context/context_img/`:

| File Name | Screen / Subsystem | Primary Focus & Visual Part |
|---|---|---|
| `01_dashboard_overview_financial.png` | Fleet Cockpit / Site Overview | Top Financial / Tariff KPI Strip & 3D Interactive Topology |
| `02_energy_flow_diagram_top.png` | Energy Flow / Power Flow | Real-time 7-Node Transfer Canvas & Energy Summary Accumulators |
| `03_energy_flow_summaries_and_trend.png` | Energy Flow / Power Flow | 4-Quadrant Subsystem Summaries & 5-Series Multi-line Power Trend |
| `04_pcs_management_overview.png` | PCS / Inverter Management | Fleet Inverter KPIs, Hardware Specs, AC Grid & DC BESS Telemetry |
| `05_pcs_management_trends_events.png` | PCS / Inverter Management | 24h Power & Efficiency Curves, Protection States & Event Log Table |
| `06_metering_power_quality_top.png` | Metering & Power Quality | **Core**: 3-Phase Live Table, Voltage/Current THD, Harmonic Spectrum (to 25th) |
| `07_metering_power_quality_bottom.png` | Metering & Power Quality | **Core**: Phase Imbalance, 15m Rolling Demand, 7D Demand Profile & Meter Devices |
| `08_battery_health_diagnostics_top.png` | Battery Health & Diagnostics | Degradation Rate, SOH & Capacity Fade Curves, Top 8 Weak Cells |
| `09_battery_health_diagnostics_bottom.png` | Battery Health & Diagnostics | 7-Year SOH Decay RUL Projection, Automated Dispatch CTAs, Rack Sparklines |
| `10_thermal_management_heatmap_top.png` | Thermal Management System | 72-Zone Rack Heatmap Matrix (Rows A–F × Racks 1–12), HVAC & Setpoints |
| `11_thermal_management_trends_scatter.png` | Thermal Management System | Cooling Load vs Ambient Temp Scatter ($R^2=0.97$), Probe Readings Table |
| `12_fire_safety_suppression_top.png` | Fire Safety & Suppression | 6-Zone Container Sensor Map, Off-gas PPM, 4-Stage Suppression Sequence |
| `13_fire_safety_timeline_bottom.png` | Fire Safety & Suppression | Gas Trend (PPM), 180-bar Cylinder Pressure, Timestamped Safety Timeline |
| `14_historian_telemetry_deepdive.png` | Historian & Deep Trend Canvas | High-density 6,000-point time-series telemetry exploration engine |
| `15_thresholds_limits_bess_grid.png` | Thresholds & Alarm Setpoints | BESS Voltage, Current, Energy, Cell Spread & SOH Critical Bounds |
| `16_thresholds_limits_thd_harmonics.png` | Thresholds & Alarm Setpoints | Voltage THD (L1–L3), Current THD (L1–L3), Health Score Trip Bounds |
| `17_thresholds_limits_power_efficiency.png` | Thresholds & Alarm Setpoints | Load, Building, DG, Active/DC/Reactive/Apparent Power Limits |
| `18_controls_register_writes.png` | Direct Register Controls | Modbus Register Actuation (Modes, Current Caps, SOC Limits, E-Stop) |

---

## 2. Page-by-Page Technical Breakdown

### Page 1: Dashboard / Fleet Cockpit (`01_dashboard_overview_financial.png`)

```
+----------------------------------------------------------------------------------------------------+
| Topbar: [BESS Site A v]                                       [Device Live] [Server Live]          |
+----------------------------------------------------------------------------------------------------+
| Financial Strip: Energy Cost (₹11.33) | Savings (₹120) | Monthly (₹3850) | Demand Savings (₹980)   |
|                  Arbitrage (₹420) | ROI (18.40%) | Operating Benefit (₹5200) | Tariff (₹0.18/kWh)  |
+------------------------------+---------------------------------------+-----------------------------+
| System Stats                 | System Topology (3D Canvas)           | Power Stats                 |
| SoC: 21.50%                  | [Solar PV] ---> [PCS/Inverter] -> [Grid] SoH: 98.30%                |
| Cycles: 10,666               |       |               |               | Chg/Dis: 107.1k / 94.5k Ah  |
| Max V: 3.09 V                |   [DG Set] ----> [10kWh BESS] -> [Load] Contactors:                 |
| Avg V: 3.06 V                |                                       | - High Side: ON             |
| Max T: 38.50 °C              |                                       | - Low Side: ON              |
| Avg T: 34.80 °C              |                                       | - Pre-Charge: OFF           |
| Fault Flags: 0/0/0           |                                       | - DC/DC: ON                 |
+------------------------------+---------------------------------------+-----------------------------+
| Subsystem Status: Grid: Connected | Grid Power: 74.72 kW | Charging | Eff: 96.80% | Health: Normal |
+----------------------------------------------------------------------------------------------------+
| [Chart: System Voltage (490.00 V)]               | [Chart: Load Current Draw (-147.30 A)]          |
+----------------------------------------------------------------------------------------------------+
```

#### Detailed Elements & Telemetry
1. **Financial & TOU Arbitrage Strip**:
   - `Energy Cost Today`: Real-time cumulative utility tariff cost in INR (`₹11.33`).
   - `Savings Today`: Avoided cost via solar self-consumption and battery shaving (`₹120`).
   - `Monthly Savings` & `Demand Charge Savings`: Tariff penalty avoidance (`₹3,850` / `₹980`).
   - `Arbitrage Revenue`: Profit gained by charging off-peak and discharging at peak TOU slots (`₹420`).
   - `Projected ROI`: Financial payback yield model (`18.40%`).
   - `Average Tariff`: Effective blended rate (`₹0.18/kWh`).
2. **System Stats (BESS DC Pack)**:
   - State of Charge (`21.50%`), Cycle Count (`10,666 cycles`), Max Cell Voltage (`3.09 V`), Avg Cell Voltage (`3.06 V`), Max Temperature (`38.50 °C`), Avg Temperature (`34.80 °C`).
   - Real-time protection zero-counters: Charge Overtemp (`0`), Cell Overvoltage (`0`), Pack Overvoltage (`0`).
3. **Interactive 3D System Topology Canvas**:
   - Isometric renders of 6 electrical assets: Solar PV Array, Bi-directional PCS Inverter, Utility Transmission Pylon, Diesel Generator Set, Containerized BESS, Facility Commercial Building.
   - Live dotted busbars with animated particle velocity and directional glow indicating power direction.
4. **Power Stats & Contactor Telemetry**:
   - State of Health (`98.30%`), Cumulative Ah throughput (`107,142.90 Ah Charged` / `94,489.80 Ah Discharged`).
   - Real-time contactor state supervision: High Side Contactor (`ON`), Low Side Contactor (`ON`), Pre-Charge Contactor (`OFF`), DC/DC Contactor (`ON`).
5. **Real-Time Baseline Waveforms**:
   - DC System Voltage line chart (`490.00 V` nominal).
   - Load Current Draw fill-area chart (`-147.30 A` showing inductive industrial building step-load).

---

### Page 2: Energy Flow / Power Flow (`02_energy_flow_diagram_top.png` & `03_energy_flow_summaries_and_trend.png`)

#### Detailed Elements & Telemetry
1. **Flow Controls & Operating Mode Pills**:
   - `Day Mode` (Solar dominant self-consumption).
   - `Night Mode` (BESS discharge + grid baseline).
   - `Solar Excess` (Feed-in / battery absorption prioritizer).
2. **7-Node Dynamic Power Balance Canvas**:
   - **Solar PV**: `89.3 kW` active generation.
   - **PCS / Inverter**: `74.4 kW` bi-directional conversion throughput.
   - **Battery**: `-74.4 kW` (charging negative convention, `21.7% SOC`).
   - **Grid**: `76.6 kW` importing from utility.
   - **Load / Building**: `100.4 kW` primary facility demand.
   - **DG Set**: `0.0 kW` (Standby state).
   - **EV Charger**: `12.0 kW` dedicated high-power EV charging hub.
3. **Energy Summary Accumulators**:
   - Total Generation: `89.3 kW`
   - Total Load: `112.4 kW` (Building + EV)
   - Battery Net Power: `-74.4 kW`
   - Net Grid Power: `76.6 kW` (Imported: `76.6 kW`, Exported: `0.0 kW`)
   - Cycle Status: Charged `0.0 kW` / Discharged `74.4 kW`
4. **Four-Quadrant Diagnostic Summaries**:
   - **Source Summary**: Solar PV (`89.3 kW`, 54% share), DG Set (`0.0 kW`, 0%), Grid Import (`76.6 kW`, 31%), Total Available Generation (`300.7 kW`, 100%).
   - **Battery Summary**: SOC (`21.7%`), Net Power (`-74.4 kW`), Available Remaining Energy (`135.4 kWh`).
   - **Grid Summary**: Grid Status (`Online`), Active Grid Power (`76.6 kW`), Utility Frequency (`49.97 Hz`), Line-to-Line Voltage (`414 V`), Power Factor (`0.99`).
   - **Load Summary**: Total Load (`112.4 kW`), Building Load (`100.4 kW`), EV Charger Load (`12.0 kW`), Load Power Factor (`0.96`), Transformer Utilization (`64%`).
5. **Power Flow Trends Multi-Series Chart**:
   - Time window selectors: `5m`, `15m`, `1h`, `6h`, `12h`, `1d`.
   - Multi-line tracking: Solar PV (Green), Grid Power (Sky Blue), Battery Power (Orange/Negative Red), Total Load (Purple), EV Charger (Cyan).

---

### Page 3: PCS / Inverter Management (`04_pcs_management_overview.png` & `05_pcs_management_trends_events.png`)

#### Detailed Elements & Telemetry
1. **PCS Fleet Aggregate KPI Banner**:
   - Inverter Fleet Availability: `98.4%`
   - Active Running Units: `15`
   - Fleet AC Power: `1.96 MW`
   - Fleet DC Power: `9.84 MW`
   - Conversion Efficiency: `97.8%`
   - Reactive Power Dispatch: `-0.08 MVAR`
   - Faulted Units: `0`
2. **Device Master Record & Nameplate Specs**:
   - Selected Device: `PCS-02` (Status: `Running`, Health: `Healthy`).
   - Model: `VT-PCS-2500` | Rated Capacity: `2,500 kVA` | Serial No: `VTPCS2500-02-0007` | Firmware: `7.3.2.14` | Location: `10kWh BESS Block` | Commissioned: `15 May 2026`.
3. **Dual-Side Electrical Telemetry Matrix**:
   - **AC Side (Grid-Facing)**:
     - 3-Phase Line Voltage ($V_{LL}$): `415.2 / 414.8 / 415.0 V`
     - 3-Phase Line Current ($I_L$): `14.4 / 14.2 / 14.1 A`
     - Frequency: `50.02 Hz`
     - Power Factor: `0.96 (Lead)`
     - Active Power ($P$): `1.96 MW`
     - Reactive Power ($Q$): `-0.08 MVAR`
     - Apparent Power ($S$): `2.01 MVA`
   - **DC Side (BESS-Facing)**:
     - DC Bus Voltage: `871.3 V`
     - DC Current: `12.11 A`
     - DC Power: `9.84 MW`
     - Charge Power: `9.84 MW` | Discharge Power: `0.00 MW`
     - Operating State: `Charging`
4. **Command & Mode Control Panel**:
   - Actions: `Start PCS` (Primary Green), `Stop PCS` (Destructive Red Outline), `Set Charge Power`, `Set Discharge Power`, `Reset Fault`.
   - Operating Mode Selector: `Grid Following` (Active), `Grid Forming` (Black Start / Islanded), `Standby`.
5. **Protection Interlock Diagnostics**:
   - Status indicators: `DC Overvoltage` (Normal), `AC Underfrequency` (Normal), `Overtemperature` (Normal), `Communication Fault` (Normal), `Cooling Status` (Normal).
6. **24-Hour Trends & Hardware Event Log**:
   - `PCS Power Trend`: Active kW vs Reactive kVAR over 24 hours.
   - `Efficiency Trend`: Conversion efficiency curve ($95.8\% \to 99.4\%$).
   - `Event Log (Latest 10)`: Event timestamp, severity (`INFO`, `WARN`), Event type (`PCS Started`, `Mode Changed`, `Power Setpoint`, `Overtemperature`), PCS unit ID, and parameter payload (e.g., `Temp 71.2 °C, Limit 85 °C`).

---

### Page 4: Metering & Power Quality Deep-Dive (`06_metering_power_quality_top.png` & `07_metering_power_quality_bottom.png`)

> [!IMPORTANT]
> This is the central architectural feature requested by the user. VoltTrack treats electrical metering not as a simple aggregate number, but as an **industrial 3-phase power quality and revenue metering suite**.

```
+------------------------------------------------------------------------------------------------------------------+
| Metering Strip: Import (76.2 kW) | Export (0 kW) | Freq (49.98 Hz) | PF (0.97 Lead) | Demand (116 kW)             |
|                 V-THD (1.20%) | I-THD (3.00%) | Phase Imbalance (1.6%) | Meter Health (Healthy)                  |
+-----------------------------------------+----------------------------------------------+-------------------------+
| LIVE METERING (3-PHASE)                 | POWER QUALITY OVERVIEW                       | ENERGY COUNTERS         |
|                                         | Mode: [Voltage THD v]                        | Import: 50,925.00 kWh   |
| Parameter   | L1    | L2    | L3  | Avg | VOLTAGE THD BY PHASE:                        | Export: 46,300.00 kWh   |
| VLL (V)     | 489.4 | 488.2 | 490 | 489 | L1 [====] 1.10%                              | Net:     4,625.00 kWh   |
| VLN (V)     | 282.6 | 281.9 | 283 | 282 | L2 [=====] 1.30%                             | Import Today: 175.0 kWh |
| Current (A) | 151.2 | 148.2 | 152 | 151 | L3 [====] 1.20%  Avg: 1.20%                  | Export Today:  50.0 kWh |
| Active (kW) | 24.7  | 24.7  | 24.7|  74 | -------------------------------------------- | Period: 01-31 Jul 2026  |
| React(kVAR) |  6.2  |  6.2  |  6.2| 18.5| HARMONIC SPECTRUM (VOLTAGE):                 +-------------------------+
| Appar (kVA) | 25.4  | 25.4  | 25.4| 76.3| Bar chart: THD, 3rd, 5th, 7th... 25th        | DEMAND TREND (15m ROLL) |
| Power Factor| 0.97  | 0.97  | 0.97| 0.97| Phase Imbalance: L1:1.1% L2:1.3% L3:1.2%     | 24h peak demand curve   |
| Frequency   |   -   |   -   |   - |49.98| Total Imbalance: 1.6% [GOOD]                 | (26 kW -> 190 kW)       |
+-----------------------------------------+----------------------------------------------+-------------------------+
| DEMAND PROFILE (7 DAYS)                 | POWER QUALITY TREND (7 DAYS)                 | METER DEVICES TABLE     |
| Cyclic daily demand peaks (32-195 kW)   | 7-day dual THD and unbalance history         | MTR-01 Grid | MTR-02 PCS|
+-----------------------------------------+----------------------------------------------+-------------------------+
```

#### Detailed Breakdown of Metering Architecture

1. **Top 9-Metric Power Quality Strip**:
   - `Grid Import`: Active imported power (`76.2 kW`).
   - `Grid Export`: Active injected power (`0.0 kW`).
   - `Grid Frequency`: High-precision system frequency (`49.98 Hz`).
   - `Average Power Factor`: Displacement + distortion factor (`0.97 Lead`).
   - `15-Min Rolling Maximum Demand`: Peak utility billing demand (`116.0 kW`).
   - `Voltage THD`: Total Harmonic Distortion in Voltage (`1.20%`, well within IEEE 519 5% limit).
   - `Current THD`: Total Harmonic Distortion in Current (`3.00%`).
   - `Phase Imbalance`: Voltage unbalance rate ($V_{neg} / V_{pos} = 1.6\%$).
   - `Meter Health`: Diagnostic status (`Healthy`).

2. **Live 3-Phase Instantaneous Metering Table**:
   - Full phase-by-phase vector breakdown for $L_1$, $L_2$, $L_3$, plus computed System Average / Sum:
     - **Line-to-Line Voltage ($V_{LL}$)**: $V_{12}=489.4\ V$, $V_{23}=488.2\ V$, $V_{31}=490.2\ V$ (Mean: $489.4\ V$).
     - **Line-to-Neutral Voltage ($V_{LN}$)**: $V_{1N}=282.6\ V$, $V_{2N}=281.9\ V$, $V_{3N}=283.1\ V$ (Mean: $282.6\ V$).
     - **Current ($I$)**: $I_1=151.2\ A$, $I_2=148.2\ A$, $I_3=152.7\ A$ (Mean: $151.2\ A$).
     - **Active Power ($P$)**: $P_1=24.7\ kW$, $P_2=24.7\ kW$, $P_3=24.7\ kW$ (Total Active Power: $74.0\ kW$).
     - **Reactive Power ($Q$)**: $Q_1=6.2\ kVAR$, $Q_2=6.2\ kVAR$, $Q_3=6.2\ kVAR$ (Total Reactive Power: $18.5\ kVAR$).
     - **Apparent Power ($S$)**: $S_1=25.4\ kVA$, $S_2=25.4\ kVA$, $S_3=25.4\ kVA$ (Total Apparent: $76.3\ kVA$).
     - **Phase Power Factor ($PF$)**: $0.97$ per phase with leading/lagging vector discriminator.
     - **System Frequency**: $49.98\ Hz$.

3. **Power Quality & IEEE 519 Harmonic Spectrum Analysis**:
   - **Mode Selector**: Toggle between Voltage Harmonics and Current Harmonics.
   - **Per-Phase THD Horizontal Gauges**: $L_1$ ($1.10\%$), $L_2$ ($1.30\%$), $L_3$ ($1.20\%$), Fleet Avg ($1.20\%$).
   - **Individual Harmonic Spectrum Graph**:
     - Clustered bar chart showing orders: **Fundamental, 3rd, 5th, 7th, 9th, 11th, 13th, 15th, 17th, 19th, 21st, 23rd, 25th**.
     - Color-coded per phase ($L_1$ magenta, $L_2$ amber, $L_3$ blue).
     - Allows plant operators to detect triplen harmonics (3rd, 9th) caused by single-phase switching supplies, and 5th/7th harmonics caused by 6-pulse inverter drives.
   - **Phase Imbalance Diagnostic Meter**:
     - Per-phase deviation: $L_1: 1.1\%$, $L_2: 1.3\%$, $L_3: 1.2\%$.
     - Total Voltage Imbalance Rate: `1.6%` with qualitative tag `GOOD` ($< 2\%$ target).

4. **Revenue & Energy Accumulation Counters**:
   - Certified tariff registers:
     - `Import Energy`: Cumulative active import (`50,925.00 kWh`).
     - `Export Energy`: Cumulative active export (`46,300.00 kWh`).
     - `Net Energy`: Billing balance (`4,625.00 kWh`).
     - `Import Today`: Diurnal import total (`175.00 kWh`).
     - `Export Today`: Diurnal export total (`50.00 kWh`).
     - `Billing Period Window`: `01 Jul 2026 - 31 Jul 2026`.

5. **Historical Demand & Quality Trends**:
   - `Demand Trend (15 Min Rolling)`: 24-hour step curve showing rolling 15-minute average demand against contracted maximum demand ($26.14\ kW \to 190.06\ kW$).
   - `Demand Profile (kW) (Last 7 Days)`: Multi-day demand diurnal cycles showing daily load spikes.
   - `Power Quality Trend (Last 7 Days)`: Dual-line time-series tracking THD % drift and unbalance % over 7 consecutive days.

6. **Physical Meter Inventory & Communication Status**:
   - Dedicated table mapping physical smart meters:
     - `MTR-01 Grid Incomer` | Location: `PCC Panel` | Type: `Multifunction Meter` (Modbus TCP) | Status: `Online`
     - `MTR-02 PCS AC Meter` | Location: `PCS Room` | Type: `Revenue Meter` (Class 0.2S) | Status: `Online`
     - `MTR-03 BESS DC Meter` | Location: `Battery Container` | Type: `DC Shunt Meter` | Status: `Online`

---

### Page 5: Battery Health & Predictive Diagnostics (`08_battery_health_diagnostics_top.png` & `09_battery_health_diagnostics_bottom.png`)

#### Detailed Elements & Telemetry
1. **Health & Life Expectancy Strip**:
   - `Health Score`: Composite battery condition score (`97.9 / 100`).
   - `Average SOH`: Fleet-wide capacity retention (`98.3%`).
   - `Predicted Remaining Life`: Machine-learning projected horizon (`5.8 Years`).
   - `Cycle Count`: Total equivalent full cycles (`10,666 cycles`).
   - `Degradation Rate`: Linear monthly fade (`0.12 % /month`).
   - `Weak Cells Detected`: Hardware outliers flagged (`12 cells`).
   - `Thermal Risk`: Runaway likelihood index (`Low`).
   - `Maintenance Priority`: Automated dispatch priority (`Medium`).
2. **6 Multi-Horizon Degradation Curves**:
   - `SOH Trend (%)`: 7-day steady line at $98.3\%$.
   - `Capacity Fade (Ah)`: Retention tracking at $530.47\ Ah$.
   - `Voltage Spread Trend (mV)`: Cell $\Delta V$ expansion curve ($51.21\ mV \to 69.69\ mV$ showing increasing imbalance).
   - `Temperature Spread Trend (°C)`: Cell thermal gradient decrease ($7.6\ ^\circ C \to 5.5\ ^\circ C$).
   - `Cell Imbalance Trend (%)`: Active BMS balance improvement ($1.84\% \to 0.81\%$).
   - `Predicted Remaining Useful Life (RUL)`: SOH decay projection curve modeling expected capacity down to the critical **70% SOH End-of-Life (EOL) Threshold** over a 7-year horizon.
3. **Weak Packs / Cells (Top 8) Diagnostic Ranking**:
   - Ranking table prioritizing degraded modules:
     - Rank 1: `Rack-02 / Cell-017` | Issue: `High Imbalance (4.2%)` | Severity: `Critical` | SOH: `80.3%`
     - Rank 2: `Rack-01 / Cell-005` | Issue: `High Temp Spread` | Severity: `High` | SOH: `82.7%`
     - Rank 3: `Rack-03 / Cell-022` | Issue: `Capacity Fade` | Severity: `High` | SOH: `85.1%`
     - Rank 4: `Rack-02 / Cell-014` | Issue: `Imbalance` | Severity: `Medium`
4. **Prescriptive Maintenance Work Orders**:
   - Recommendation 1: *Balancing Required (Medium)* — "3 packs have cell imbalance > 2%. Schedule active balancing. Affected: Rack-02, Rack-03, Rack-04" with direct `[Schedule]` CTA.
   - Recommendation 2: *Inspect Rack* with `[Create Work Order]` CTA.
5. **Pack / Rack Health Summary Table with 7D Sparklines**:
   - Per-rack telemetry: Rack ID, Health Score, SOH %, Rated Ah, Actual Ah, Fade %, Cycle Count, Temp Spread ($^\circ C$), Voltage Spread ($mV$), Imbalance (%), Last Inspection Date, Diagnostic Status (`Attention`, `Critical`, `Good`), and 7-day miniature trend sparkline!

---

### Page 6: Thermal Management System (`10_thermal_management_heatmap_top.png` & `11_thermal_management_trends_scatter.png`)

#### Detailed Elements & Telemetry
1. **Thermal KPI Banner**:
   - Avg Pack Temp: `35 °C` | Coolant Inlet: `17.3 °C` | Coolant Outlet: `32.4 °C` | HVAC Units Online: `4 / 5` | Thermal Alarms: `2` | Humidity: `53 %RH` | Cooling Power: `35 kW` | Thermal Efficiency: `3.25 COP`.
2. **72-Zone Rack Temperature Heatmap Matrix**:
   - 6 Rows (Row A through Row F) $\times$ 12 Columns (Racks 1 to 12).
   - Real-time temperature printed in every cell (e.g., $26.5\ ^\circ C$ to $32.0\ ^\circ C$).
   - Color spectrum bar: $18\ ^\circ C$ (Cyan/Blue) $\to 22\ ^\circ C$ (Green) $\to 26\ ^\circ C$ (Yellow) $\to 30\ ^\circ C$ (Amber) $\to 34\ ^\circ C$ (Orange) $\to 38\ ^\circ C$ (Red).
3. **Cooling Asset List & Setpoints**:
   - Equipment Status: `HVAC-1` (Online), `HVAC-2` (Online), `HVAC-3` (Maintenance), `HVAC-4` (Online), `Chiller-1` (Online), `Coolant Pump-1` (Online), `Dehumidifier-1` (Online).
   - Setpoints: High Temp Alarm ($35.0\ ^\circ C$), High Temp Warning ($32.0\ ^\circ C$), Low Temp Alarm ($15.0\ ^\circ C$), Dew Point ($11.2\ ^\circ C$), Ambient Temp ($24.7\ ^\circ C$), Cabinet Avg ($35\ ^\circ C$).
4. **Subsystem Actuation Status Pills**:
   - Cooling Mode: `Active`
   - Compressor State: `Modulating`
   - Pump Speed: `75 %`
   - Airflow: `5,175 CFM`
   - Condensate Level: `31 %`
   - Thermal Health: `Stable`
5. **Cooling Load vs Ambient Temperature Regression**:
   - Scatter plot correlating cooling kW load against outdoor ambient temperature with fitted polynomial regression line ($R^2 = 0.97$).
6. **Thermal Zones / Probe Readings Table**:
   - Rows A–F summary: Location, Avg Temp ($^\circ C$), Min Temp, Max Temp, Status.

---

### Page 7: Fire Management & Suppression System (`12_fire_safety_suppression_top.png` & `13_fire_safety_timeline_bottom.png`)

#### Detailed Elements & Telemetry
1. **NFPA 855 Safety Interlock Banner**:
   - Smoke Detectors: `24 / 24 Online`
   - Gas Detectors: `12 / 12 Online`
   - Suppression Cylinders: `12 / 12 Ready` (Clean agent / Novec 1230 / FM-200)
   - Fire Zones Armed: `6 / 6 Armed`
   - Active Fire Alarms: `0 Acknowledged`
   - Hydrogen Level: `141 ppm (Elevated)` — Key battery thermal runaway precursor off-gas indicator!
   - Ventilation Interlock: `Enabled`
   - FPDS Panel Status: `Normal`
2. **Container Fire Zone Matrix**:
   - 6 Physical Enclosure Zones: Zone 1 (Battery Rack 1), Zone 2 (Battery Rack 2), Zone 3 (Battery Rack 3), **Zone 4 (PCS Room — ACTIVE FIRE ALARM)**, Zone 5 (Switchgear Room), Zone 6 (BBU/Aux Room).
   - Sensor state icons per zone: `S` (Smoke), `H` (Heat), `G` (Gas), `M` (Manual Pull Station), `N` (Suppression Nozzle).
3. **4-Stage Emergency Suppression Workflow**:
   - Visual 4-step sequence: `1. Alarm` (Active/Red) $\to$ `2. Pre-Alarm` (Amber) $\to$ `3. Suppress` (Pending) $\to$ `4. Post-Release`.
   - Incident Metadata: Alarm Source (`Smoke Detector SD-4-03`), Location (`Zone 4 - PCS Room`), Gas Concentration (`CO: 116 ppm`, `H2: 141 ppm`), Alarm Time (`14 Jul 2026, 12:06:25 pm`).
   - Automated Interlocks: `HVAC Shutdown: In Progress`, `Notification Status: In Progress`, `Acknowledged By: Ritul Shah`.
   - Emergency Action: `[Acknowledge Alarm]` prominent pink/red CTA.
4. **Physical System Supervision & Gas Trend**:
   - Suppression Mode: `Automatic`
   - Clean Agent Cylinder Pressure: `180 bar` (Nominal pressure gauge)
   - Damper State: `Closed (All Dampers)`
   - Siren / Visual Beacon: `Active (Audible + Visual)`
   - 24h Gas Concentration Trend: Off-gas ppm time series tracking Carbon Monoxide and Hydrogen spikes.
   - Event Timeline: Sub-second audit log tracking `Fire Alarm`, `Pre-Alarm`, `HVAC Shutdown Initiated`, `System Event`, `System Armed`.

---

### Page 8: Historian & Deep-Dive Analytics (`14_historian_telemetry_deepdive.png`)

#### Detailed Elements & Telemetry
- Dynamic parameter selector: Query any telemetry tag across BESS, Inverter, Grid, or Metering (e.g. `State of Charge`, `Voltage THD`, `Line Current`, `Active Power`).
- Time Range presets: `Last 24 Hours`, `7 Days`, `30 Days`, `Custom Window`.
- High-Density Downsampling: `6,000 pts` resolution selector with multi-tier decimation for seamless 60fps chart rendering.

---

### Page 9: Parameter Thresholds & Alert Tripping (`15_thresholds_limits_bess_grid.png`, `16_thresholds_limits_thd_harmonics.png`, `17_thresholds_limits_power_efficiency.png`)

#### Detailed Elements & Telemetry
A centralized industrial setpoint configuration grid enforcing 4-tier limits:
1. `Minimum Value` (Warning Low)
2. `Maximum Value` (Warning High)
3. `Min. Critical Value` (Emergency Trip / Interlock Low)
4. `Max. Critical Value` (Emergency Trip / Interlock High)
5. `Actions`: Toggle live push/SMS alerts + Edit modal.

**Exemplary Parameter Registers Configured**:
- **BESS DC Pack**: Pack Voltage ($490\ V \to 540\ V$, Trip $480\ V \to 547\ V$), Pack Current ($-180\ A \to 230\ A$, Trip $-210\ A \to 260\ A$), State of Charge ($13\% \to 93\%$, Trip $10\% \to 95\%$), Cell Voltage ($2.90\ V \to 3.55\ V$, Trip $2.80\ V \to 3.65\ V$), Cell Temp ($5\ ^\circ C \to 40\ ^\circ C$, Trip $0\ ^\circ C \to 45\ ^\circ C$).
- **Power Quality & Harmonics**:
  - Voltage THD ($L_1, L_2, L_3$): Warning $3.5\%$, Trip $5.0\%$ (IEEE 519 compliant).
  - Current THD ($L_1, L_2, L_3$): Warning $5.0\%$, Trip $8.0\%$.
  - Voltage Spread: Warning $80\ mV$, Trip $120\ mV$.
  - SOH / Degradation: Warning $80\%$, Trip $70\%$.
- **Power Flow & Inverter Setpoints**: Active Power ($0 \to 140\ kW$, Trip $160\ kW$), Reactive Power ($0 \to 60\ kVAR$, Trip $90\ kVAR$), PCS Efficiency ($90\% \to 98\%$, Trip $85\%$).

---

### Page 10: Controls & Modbus Register Actuation (`18_controls_register_writes.png`)

#### Detailed Elements & Telemetry
A secure SCADA-grade command interface mapped directly to PLC/Modbus write registers:
- `BESS MASTER ENABLE` (`ID: bess-master-enable`): Software main breaker toggle (Active ON).
- `OPERATING MODE` (`ID: operating-mode`): Selectable dropdown — `PEAK SHAVING`, `SELF-CONSUMPTION`, `MICROGRID ISLANDED`, `TOU ARBITRAGE`.
- `CHARGE ENABLE` (`ID: charge-enable`): Inhibit/permit battery charging toggle.
- `DISCHARGE ENABLE` (`ID: discharge-enable`): Inhibit/permit battery discharging toggle.
- `MAX CHARGE CURRENT (A)` (`ID: max-charge-current`): Numeric register input with `[Write]` button (`150 A`).
- `MAX DISCHARGE CURRENT (A)` (`ID: max-discharge-current`): Numeric register input with `[Write]` button (`200 A`).
- `SOC UPPER LIMIT (%)` (`ID: soc-upper-limit`): High-cutoff buffer setpoint (`90%`).
- `SOC LOWER LIMIT (%)` (`ID: soc-lower-limit`): Deep discharge protection setpoint (`15%`).
- `PEAK SHAVING THRESHOLD (KW)` (`ID: peak-shaving-threshold`): Grid import threshold above which BESS injects power (`180 kW`).
- `EMERGENCY STOP` (`ID: emergency-stop`): Momentary trigger card with `[Actuate]` warning button.
- Secondary tab: `COMMAND HISTORY` audit log tracking user identity, target register, timestamp, and PLC ACK response.

---

## 3. Gap Analysis: VoltTrack vs. Current NEON Specifications

| Architectural Dimension | VoltTrack EMS Feature Set | Current NEON State (`doc.md` / `ui_doc.md`) | Strategic Recommendation for NEON |
|---|---|---|---|
| **Electrical Metering Depth** | Dedicated 3-Phase Metering page with per-phase $V_{LL}, V_{LN}, I, P, Q, S$, Power Factor, and Frequency. | High-level site and component drawers with aggregate import/export kW. | **Adopt Immediately**: Create dedicated `SiteMeteringDrawer` and full `/sites/[id]/metering` route. |
| **Power Quality (IEEE 519)** | Voltage & Current THD %, 25-order Harmonic Spectrum bar chart, Phase Imbalance %. | Generic THD % metric mentioned in doc; no spectrum visualizer. | **Incorporate**: Add Recharts/Visx Harmonic Spectrum chart (up to 25th harmonic) and Phase Imbalance meter. |
| **Demand Shaving Telemetry** | 15-minute rolling maximum demand tracking curve & 7-day demand profile. | TOU tariff formulas specified in `lib/energy/`. | **Incorporate**: Visual 15-min rolling demand monitor with contracted maximum demand baseline overlay. |
| **Energy Accumulators** | Import, Export, and Net kWh counters partitioned by billing period. | Daily energy totals stored in `telemetry_hourly`. | **Incorporate**: Explicit 3-tier energy register card (Import, Export, Net kWh) with billing date window. |
| **Physical Meter Device Tracking** | Inventory table tracking Grid Incomer, PCS AC, and BESS DC meters with status. | Devices stored generically in `site_devices`. | **Incorporate**: Dedicated `meter` device category with PCC location and accuracy class (0.2S, Class 1). |
| **Modbus Controls & Setpoints** | Direct register writes for Max Current, SOC limits, Peak Shaving kW, and E-Stop. | Read-mostly telemetry monitoring without direct register actuation UI. | **Incorporate**: Role-gated `SiteControlsDrawer` (restricted to Superadmin / Site Engineer) with command audit log. |
| **Predictive Diagnostics & RUL** | 7-year SOH decay curve with 70% EOL threshold; Weak cells ranking; automated balancing CTAs. | BESS 16-cell thermal matrix drawer exists in specs. | **Incorporate**: Add RUL projection curve and Weak Cell priority ranking into NEON's BESS Drawer. |
| **Fire Safety Interlock** | NFPA 855 4-stage suppression workflow, off-gas ($CO, H_2$ ppm), and container zone map. | General alarms table. | **Incorporate**: BESS Safety Interlock panel with Hydrogen ppm off-gas gauge and suppression stage tracker. |

---

## 4. Concrete Roadmap to Implement Metering in NEON

To make NEON the definitive BESS & Solar SaaS platform, we will incorporate VoltTrack's metering strengths while retaining NEON's superior **Cyber Dark / Neon Pink design system (`#FF2A85`)**, **Clerk multi-tenancy RBAC**, and **Supabase Realtime architecture**:

### 1. Database Schema Extension (`supabase/migrations/`)
Extend `telemetry_snapshots` or create `metering_snapshots`:
```sql
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS v_ll_l1 NUMERIC(6,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS v_ll_l2 NUMERIC(6,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS v_ll_l3 NUMERIC(6,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS v_ln_l1 NUMERIC(6,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS v_ln_l2 NUMERIC(6,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS v_ln_l3 NUMERIC(6,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS current_l1 NUMERIC(7,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS current_l2 NUMERIC(7,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS current_l3 NUMERIC(7,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS active_power_l1 NUMERIC(8,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS active_power_l2 NUMERIC(8,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS active_power_l3 NUMERIC(8,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS reactive_power_kvar NUMERIC(8,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS apparent_power_kva NUMERIC(8,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS power_factor NUMERIC(4,3);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS frequency_hz NUMERIC(5,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS voltage_thd_pct NUMERIC(5,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS current_thd_pct NUMERIC(5,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS phase_imbalance_pct NUMERIC(5,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS demand_15m_kw NUMERIC(8,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS harmonics_spectrum JSONB; 
-- harmonics_spectrum format: {"l1": [1.1, 0.4, 3.2, 1.4...], "l2": [...], "l3": [...]}
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS import_energy_kwh NUMERIC(12,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS export_energy_kwh NUMERIC(12,2);
ALTER TABLE telemetry_snapshots ADD COLUMN IF NOT EXISTS net_energy_kwh NUMERIC(12,2);
```

### 2. Presentation Layer Components (`components/metering/`)
- `LiveMeteringTable.tsx`: Obsidian dark table with monospace cyan/amber figures for 3-phase voltages, currents, active/reactive/apparent power.
- `HarmonicSpectrumChart.tsx`: Recharts clustered bar chart displaying 3rd through 25th harmonics with IEEE 519 5% guideline reference line.
- `PhaseImbalanceGauge.tsx`: Circular or linear progress meter with Green/Amber/Red status badge.
- `DemandRollingChart.tsx`: 15-minute sliding window demand line chart with contract Maximum Demand limit marker.
- `EnergyCountersCard.tsx`: Billing register accumulators (Import, Export, Net) with TOU tariff slot calculation.
- `MeterDeviceInventory.tsx`: Hardware list of PCC incoming meters, PCS AC meters, and DC meters.

### 3. Navigation Integration
- Add a dedicated **Metering & Power Quality** tab / drawer to the Site Internal Screen alongside Solar, BESS, DG, Grid, and Load.
- Provide quick toggle between **Control Room Cyber Dark Mode** and **Field High-Contrast Cyber Light Day Mode** with complete touch target accessibility ($\ge 48\ px$).
