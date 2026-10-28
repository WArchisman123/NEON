# Implementation Prompt: 10-Page Competitor EMS Tab Suite & Page 1 Dashboard Replication

## Goal
Implement the comprehensive 10-tab industrial EMS architecture directly derived from the competitor benchmark documented in [`public/context/COMPETITOR_EMS_METERING_BREAKDOWN.md`](file:///C:/Users/hp/Desktop/git/NEON/neon/public/context/COMPETITOR_EMS_METERING_BREAKDOWN.md) and screenshots `01_dashboard_overview_financial.png` through `18_controls_register_writes.png`. Specifically:
1. Replicate **Page 1 Dashboard** with exact layout fidelity: Top 8-metric Financial/Arbitrage strip, 3-column middle section (System Stats | Interactive System Topology Visualizer | Power Stats & Contactors), Subsystem Status Banner (Grid Connected, Power, Charging state, Efficiency, Health), and bottom real-time baseline waveforms (System DC Voltage `490.00 V` & Load Current Draw `-147.30 A`).
2. Provide **10 dedicated in-page tabs** corresponding 1-to-1 with every page from the breakdown specification:
   - **Tab 1: Dashboard / Overview** (Page 1)
   - **Tab 2: Energy Flow** (Page 2: 7-Node power balance, 4-quadrant diagnostic summaries, 5-series power trend)
   - **Tab 3: PCS / Inverter Management** (Page 3: Fleet KPIs, device master record, dual-side AC/DC electrical split, interlocks, 24h power/efficiency curves, event log)
   - **Tab 4: Metering & Power Quality** (Page 4: 9-metric electrical strip, 3-phase live vector table, IEEE 519 25-harmonic spectrum, phase imbalance, energy counters, 15m rolling demand, 7d demand profile, meter inventory)
   - **Tab 5: Battery Health & Diagnostics** (Page 5: Health score, SOH degradation, 6 multi-horizon curves including 7-year RUL to 70% EOL, Top 8 weak cells ranking, prescriptive maintenance CTAs, rack summary with sparklines)
   - **Tab 6: Thermal Management** (Page 6: Thermal KPI banner, 72-zone rack temperature heatmap matrix [Rows A–F × Racks 1–12], HVAC equipment status, regression scatter plot $R^2=0.97$, probe readings table)
   - **Tab 7: Fire Safety & Suppression** (Page 7: NFPA 855 interlock banner, 6-zone container sensor map, 4-stage emergency sequence, hydrogen/CO off-gas ppm, 180-bar cylinder pressure, safety timeline)
   - **Tab 8: Historian & Deep Trend Canvas** (Page 8: High-density downsampled parameter query engine with presets 24h, 7d, 30d, custom)
   - **Tab 9: Thresholds & Alarm Limits** (Page 9: 4-tier industrial setpoint configuration grid for BESS, Harmonics/THD, and Power/Efficiency with live alert toggles)
   - **Tab 10: Controls & Register Writes** (Page 10: Modbus direct register actuation for Master Enable, Operating Mode, Charge/Discharge currents, SOC buffers, Peak Shaving kW, E-Stop trigger, and command audit log)

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: UI component composition, responsive grids, tab list semantics, modal dialogs, accessible forms, color tokens.
- `.agents/skills/supabase/`: Multi-tenant data models, telemetry snapshots, and audit log persistence.

---

## Existing Code Inspected
- [`public/context/COMPETITOR_EMS_METERING_BREAKDOWN.md`](file:///C:/Users/hp/Desktop/git/NEON/neon/public/context/COMPETITOR_EMS_METERING_BREAKDOWN.md): Complete 441-line specification of pages 1 through 10.
- [`public/context/context_img/01_dashboard_overview_financial.png`](file:///C:/Users/hp/Desktop/git/NEON/neon/public/context/context_img/01_dashboard_overview_financial.png) to `18_controls_register_writes.png`: Visual layout, color accents, and typography references.
- [`components/site-detail/single-site-ems-view.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/site-detail/single-site-ems-view.tsx): Current single-site layout with basic 6 tabs.
- [`components/energy-flow/system-topology-visualizer.tsx`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/energy-flow/system-topology-visualizer.tsx): Centerpiece 6-node isometric visualizer.
- [`components/metering/`](file:///C:/Users/hp/Desktop/git/NEON/neon/components/metering/): `live-metering-3phase-table.tsx`, `power-quality-harmonics-card.tsx`, `energy-counters-billing-card.tsx`, `demand-rolling-card.tsx`, `mppt-string-telemetry-card.tsx`.

---

## Decisions or Assumptions
1. **Modular Sub-Views**: Break down new tabs into dedicated, clean components under `components/site-detail/tabs/` to keep code modular, maintainable, and prevent monolithic bloat in `single-site-ems-view.tsx`:
   - `dashboard-tab.tsx`: Exact Page 1 replication (Financial strip, 3-column core, Subsystem status bar, Voltage & Load current waveform charts).
   - `energy-flow-tab.tsx`: Page 2 replication (Mode pills, 7-node visualizer, 4-quadrant diagnostic summaries, 5-series multi-line power trend).
   - `pcs-management-tab.tsx`: Page 3 replication (Fleet aggregate KPIs, Device master record, dual-side AC/DC telemetry, interlocks, 24h efficiency & power curves, event log table).
   - `metering-tab.tsx`: Page 4 replication (Composing the Class 0.2S suite already built).
   - `battery-health-tab.tsx`: Page 5 replication (Health KPI strip, 6 degradation curves with 70% EOL RUL curve, Top 8 weak cells ranking, prescriptive CTAs, rack table with 7d sparklines).
   - `thermal-management-tab.tsx`: Page 6 replication (Thermal banner, 72-zone $6 \times 12$ heatmap matrix, cooling asset status, regression scatter plot, probe readings).
   - `fire-safety-tab.tsx`: Page 7 replication (NFPA 855 strip, 6 container zones with sensor icons, 4-stage suppression workflow with acknowledge CTA, cylinder pressure, gas ppm trend, safety audit log).
   - `historian-tab.tsx`: Page 8 replication (Telemetry tag explorer, high-density line canvas, time range filters).
   - `thresholds-limits-tab.tsx`: Page 9 replication (4-tier limits grid with Min, Max, Min Trip, Max Trip across BESS, Harmonics, and Power, with alert toggles).
   - `controls-scada-tab.tsx`: Page 10 replication (Authenticated Modbus register actuation inputs, E-Stop, and command audit trail).
2. **Tab Bar Ergonomics**: The tab navigation bar in `SingleSiteEmsView` will feature all 10 tabs with horizontal smooth scrolling (`overflow-x-auto no-scrollbar`), active Neon Pink glow pill styling, and clear icons.
3. **Data Hydration**: All tabs will bind to normalized site properties (`SiteRecord`), edge hardware registers (`EdgeDeviceTelemetry`), and realistic electrical baseline defaults when live hardware registers are idle.

---

## Files Likely to Change / Be Created
- `components/site-detail/single-site-ems-view.tsx`: Updated to host all 10 tabs with seamless state routing.
- `components/site-detail/tabs/dashboard-tab.tsx` (New)
- `components/site-detail/tabs/energy-flow-tab.tsx` (New)
- `components/site-detail/tabs/pcs-management-tab.tsx` (New)
- `components/site-detail/tabs/battery-health-tab.tsx` (New)
- `components/site-detail/tabs/thermal-management-tab.tsx` (New)
- `components/site-detail/tabs/fire-safety-tab.tsx` (New)
- `components/site-detail/tabs/historian-tab.tsx` (New)
- `components/site-detail/tabs/thresholds-limits-tab.tsx` (New)
- `components/site-detail/tabs/controls-scada-tab.tsx` (New)

---

## Implementation Requirements

### 1. Page 1: Dashboard Tab (`dashboard-tab.tsx`)
- **Financial & Arbitrage Strip (8 items)**:
  - Energy Cost Today: `₹11.33`
  - Savings Today: `₹120` (`#00E676`)
  - Monthly Savings: `₹3,850` (`#00E676`)
  - Demand Savings: `₹980` (Amber)
  - Arbitrage Revenue: `₹420` (Cyan)
  - Projected ROI: `18.40%` (`#FF2A85`)
  - Operating Benefit: `₹5,200` (Purple)
  - Average Tariff: `₹0.18/kWh`
- **3-Column Main Grid**:
  - **Left**: System Stats (BESS DC Pack) with SoC radial/linear gauge (`21.50%`), Cycle Count (`10,666`), Max Cell V (`3.09 V`), Avg Cell V (`3.06 V`), Max Temp (`38.50 °C`), Avg Temp (`34.80 °C`), and protection zero-counters (Charge Overtemp: 0, Cell Overvoltage: 0, Pack Overvoltage: 0).
  - **Center**: System Topology Canvas (`SystemTopologyVisualizer`).
  - **Right**: Power Stats & Contactor Telemetry with SoH (`98.30%`), Ah throughput (`107.1k / 94.5k Ah`), and 4 contactors (High Side: ON, Low Side: ON, Pre-Charge: OFF, DC/DC: ON), plus fault counters.
- **Subsystem Status Bar** (Directly under 3-column grid):
  - Grid Status: Connected (`#00E676`)
  - Grid Power: `74.72 kW`
  - Operating State: Charging (`#00F0FF`)
  - Inverter Efficiency: `96.80%`
  - System Health: Normal (`#00E676`)
- **Bottom Real-Time Waveforms (2 Charts)**:
  - System DC Voltage (`490.00 V` line waveform with recent points)
  - Load Current Draw (`-147.20 A` industrial step area chart)

### 2. Page 2: Energy Flow Tab (`energy-flow-tab.tsx`)
- Operating mode selectors: `Day Mode`, `Night Mode`, `Solar Excess`.
- Full-width `SystemTopologyVisualizer`.
- Energy Summary Accumulators (Total Gen `89.3 kW`, Total Load `112.4 kW`, Net Battery `-74.4 kW`, Net Grid `76.6 kW`, Cycle Status `0.0 / 74.4 kW`).
- 4-Quadrant Diagnostic Cards: Source Summary, Battery Summary, Grid Summary, Load Summary.
- 5-Series Multi-line Power Trend chart with time range buttons (`5m`, `15m`, `1h`, `6h`, `12h`, `1d`).

### 3. Page 3: PCS Management Tab (`pcs-management-tab.tsx`)
- PCS Fleet KPI Strip: Availability (`98.4%`), Running Units (`15`), Fleet AC (`1.96 MW`), Fleet DC (`9.84 MW`), Efficiency (`97.8%`), Reactive Power (`-0.08 MVAR`), Faults (`0`).
- Selected Inverter Master Record: Model `VT-PCS-2500`, Rated `2,500 kVA`, Serial `VTPCS2500-02-0007`, Firmware `7.3.2.14`, Commissioned `15 May 2026`.
- Dual-Side Electrical Telemetry Matrix: AC Grid (3-phase $V_{LL}, I_L$, Hz, PF, P, Q, S) vs DC BESS (Bus V, DC Current, DC Power, Charge/Discharge MW).
- Command & Mode Control: Start PCS, Stop PCS, Set Power, Grid Following / Grid Forming / Standby.
- Protection Interlocks: DC Overvoltage, AC Underfrequency, Overtemperature, Comms, Cooling.
- 24h Power & Efficiency Trend Curves + Latest 10 Hardware Event Log Table.

### 4. Page 4: Metering & Power Quality Tab
- Leverages the Class 0.2S Metering suite (`LiveMetering3PhaseTable`, `PowerQualityHarmonicsCard`, `EnergyCountersBillingCard`, `DemandRollingCard`, `MpptStringTelemetryCard`).

### 5. Page 5: Battery Health Tab (`battery-health-tab.tsx`)
- Health KPI Banner: Health Score (`97.9/100`), Average SOH (`98.3%`), Predicted RUL (`5.8 Years`), Cycle Count (`10,666`), Degradation (`0.12%/mo`), Weak Cells (`12`), Thermal Risk (`Low`), Maintenance Priority (`Medium`).
- 6 Degradation Curves: SOH Trend, Capacity Fade, Voltage Spread ($\Delta V$), Temperature Spread, Imbalance %, and 7-Year SOH Decay to 70% EOL Threshold.
- Top 8 Weak Packs/Cells Diagnostic Ranking with severity tags.
- Prescriptive Maintenance Work Orders with `[Schedule]` and `[Create Work Order]` CTAs.
- Rack Health Summary Table with 7-day sparklines.

### 6. Page 6: Thermal Management Tab (`thermal-management-tab.tsx`)
- Thermal KPI Banner: Avg Pack Temp (`35 °C`), Coolant Inlet (`17.3 °C`), Coolant Outlet (`32.4 °C`), HVAC Online (`4/5`), Alarms (`2`), Humidity (`53 %RH`), Cooling Power (`35 kW`), COP (`3.25`).
- 72-Zone Rack Temperature Heatmap Matrix: 6 Rows (A–F) $\times$ 12 Columns (Racks 1–12) with numerical temperatures and color scale ($18^\circ C$ blue to $38^\circ C$ red).
- Cooling Equipment Status & Alarm Setpoints table.
- Subsystem Actuation Status Pills: Cooling Mode, Compressor, Pump Speed, Airflow, Condensate, Thermal Health.
- Cooling Load vs Ambient Temp Regression Scatter Plot ($R^2=0.97$).
- Thermal Zones / Probe Readings Table.

### 7. Page 7: Fire Safety & Suppression Tab (`fire-safety-tab.tsx`)
- NFPA 855 Interlock Banner: Smoke Detectors (`24/24`), Gas Detectors (`12/12`), Cylinders (`12/12`), Fire Zones Armed (`6/6`), Hydrogen Off-gas (`141 ppm Elevated`), CO Off-gas (`116 ppm`), Ventilation Interlock (`Enabled`).
- 6-Zone Container Map with visual sensor icons (Smoke, Heat, Gas, Manual, Nozzle) and active alarm indicator on Zone 4 (PCS Room).
- 4-Stage Emergency Suppression Sequence (`1. Alarm` $\to$ `2. Pre-Alarm` $\to$ `3. Suppress` $\to$ `4. Post-Release`) with prominent pink/red `[Acknowledge Alarm]` CTA.
- 180-bar Cylinder Pressure Gauge & 24h Gas Concentration (PPM) Trend.
- Timestamped Safety Event Audit Timeline.

### 8. Page 8: Historian Tab (`historian-tab.tsx`)
- Dynamic Telemetry Tag Selector (BESS SoC, Pack Voltage, Grid kW, THD-V, Solar Irradiance, Coolant Temp).
- Time Range Presets (`24 Hours`, `7 Days`, `30 Days`, `Custom Window`).
- High-Density Downsampled Charting Canvas (`6,000 pts`).

### 9. Page 9: Thresholds & Limits Tab (`thresholds-limits-tab.tsx`)
- 4-Tier Setpoint Matrix (Min Value, Max Value, Min Critical Trip, Max Critical Trip).
- Category Switcher: BESS DC Pack, Power Quality & Harmonics, Power Flow & Inverter.
- Live Alert Toggles & Edit Parameter Setpoint Dialog.

### 10. Page 10: Controls & SCADA Tab (`controls-scada-tab.tsx`)
- Direct SCADA Modbus Register Actuation (BESS Master Enable, Operating Mode, Max Charge/Discharge Currents, SOC Upper/Lower limits, Peak Shaving Threshold, E-Stop).
- Command History Audit Log tracking user identity, target register, setpoint, timestamp, and PLC ACK status.

---

## Design System & Visual Adherence
- **Dual-Theme Fidelity**:
  - Cyber Dark: Void Black (`#060709`), Obsidian Dark (`#0B0D13`), Cyber Glass (`#121622`), Neon Pink accents (`#FF2A85`).
  - Solar Day Light: Solar Ice Canvas (`#F4F6FB`), Pure White Cards (`#FFFFFF`), Deep Charcoal Ink (`#0B0F19`), Neon Pink accents (`#FF2A85`).
- **Typography**: Strict `font-mono` on all numerical measurements ($kW, MW, V, A, Hz, \%, ^\circ C, ppm, bar, Ah$).
- **Touch Targets**: $\ge 48 \times 48\text{ px}$ touch targets on all mobile controls, buttons, and tab triggers.

---

## Security & RBAC Requirements
- Controls actuation and parameter threshold changes are UI-simulated with write confirmation and role safety hints.
- Read-only users cannot actuate the Emergency Stop or overwrite Modbus registers.

---

## Acceptance Criteria
1. The site EMS view provides all 10 tabs matching the 10 pages of `COMPETITOR_EMS_METERING_BREAKDOWN.md`.
2. Tab 1 (Dashboard) exactly matches Page 1: Financial strip (8 KPIs), 3-column mid section (System Stats | Topology Canvas | Power Stats & Relays), Subsystem Status Banner, and 2 baseline waveforms (DC Voltage & Load Current).
3. Switching between tabs is instantaneous, preserved, and responsive.
4. All metrics format with clean monospace typography and realistic engineering values.
5. Quality checks `npm run typecheck`, `npm run lint`, and `npm run build` pass with **0 errors**.

---

## Checks to Run
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Exact Manual Test Steps (Desktop & Mobile)
1. Navigate to `http://localhost:3000/`.
2. **Dashboard Tab**:
   - Verify the 8-metric financial strip at the top.
   - Verify the 3-column layout: System Stats on left, System Topology Visualizer in center, Power Stats on right.
   - Verify the Subsystem Status bar (Grid Connected, 74.72 kW, Charging, 96.80% Eff, Normal Health).
   - Verify the 2 bottom charts: DC Voltage (`490.00 V`) and Load Current Draw (`-147.20 A`).
3. **Tab Switching**:
   - Click each of the 10 tabs: **Dashboard**, **Energy Flow**, **PCS / Inverter**, **Metering & SCADA**, **Battery Health**, **Thermal Management**, **Fire Safety**, **Historian**, **Thresholds & Limits**, **Controls & SCADA**.
   - Verify each tab displays its dedicated industrial telemetry view.
4. **Theme Toggle**:
   - Switch between Cyber Dark and Solar Day Light mode using the topbar toggle; verify contrast across all 10 tabs.
5. **Mobile Viewport ($390 \times 844$)**:
   - Verify the horizontal tab bar scrolls smoothly.
   - Verify the 3-column dashboard reflows vertically into a clean mobile stack.
