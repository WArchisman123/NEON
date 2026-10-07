# Competitor Feature Gap Analysis & Architectural Placement Strategy

> **Context**: Analysis of 8 competitor production screenshots (`public/context/context_img/ref_img_1.png` through `ref_img_8.png` from *eSolar Plant Monitoring System* by LogicsPower) benchmarked against NEON ENERGY's multi-site BESS & Solar SaaS platform.

---

## 1. Executive Summary & Core Architectural Difference

### The Fundamental Architectural Divergence
* **Competitor (eSolar)**:
  * **Single-Site Dedicated Portal**: The user logs in directly to a single physical solar plant (e.g. *Apiit Engineering College*, 100 kW AC / 100 kWp DC in Panipat, Haryana).
  * Navigation is strictly vertical for that one asset (Inverter 1, DG 1, Strings 1–24, Weather station).
  * Header is permanently pinned with that specific site's EPC commissioning metadata, vendor name (*Pratual Solar Power Pvt Ltd*), warranty/subscription expiry, and cumulative plant-level ESG counters.
* **NEON ENERGY**:
  * **Multi-Tenant Enterprise Fleet Cockpit**: Engineered for asset managers, IPPs, and microgrid operators managing dozens or hundreds of distributed sites across organizations.
  * **Multi-Asset Microgrid Breadth**: Features an advanced 5-node hybrid architecture: **BESS** (16-cell thermal matrix, cell $\Delta V$, RTE %, liquid cooling loops), **Solar PV**, **Diesel Generator**, **Utility Grid**, and **Facility Load**.
  * **Interactive Physics Visualizer**: Animated real-time particle dynamics canvas connecting all 5 energy nodes.
  * **Dual-Theme Design System**: Cyber Dark Mode (`#060709`) and High-Contrast Cyber Light Day Mode (`#F4F6FB`) with `#FF2A85` Neon Pink accents.
  * **Commercial Engine**: Integrated Clerk RBAC multi-tenancy, Stripe subscription gating, and a Certified Solar & BESS Maintenance Hub.

---

## 2. Screenshot-by-Screenshot Analysis

### `ref_img_1.png` — Main Dashboard & Plant Commissioning Header
* **Site Commissioning Metadata Strip**:
  * Plant AC Capacity: `100 kW` | Plant DC Capacity: `100 kWp` (DC/AC Overload Ratio = 1.00).
  * Location: `Panipat, Haryana`.
  * Commissioned By: `Pratual Solar Power Pvt Ltd` (EPC Vendor).
  * Commissioned Date: `30-Apr-2024` | Subscription / Warranty Expiry: `30-Apr-2027`.
* **Annual Contractual Generation Target Tracking**:
  * Annual Target: `105.00 MWh` | Achieved: `71.07 MWh` | Target Achieved: `67.69%`.
* **Extended ESG & Financial Impact Header**:
  * Revenue Gains (₹): `25.4 Lacs`.
  * $\text{CO}_2$ Reduction: `253.2 k Tons`.
  * **Coal Saved**: `88.6 k Tons`.
  * **Equivalent Trees Planted**: `11,997`.
  * Total Inverters: `1` | Total DGs: `1`.
* **Top Metric Gauges**:
  * **Solar**: Live `4.38 kW`, Today `384.32 kWh`, Lifetime `307.61 MWh`.
  * **Grid**: Live `0.00 kW`, Today `0.00 kWh`, Lifetime `0.00 kWh`.
  * **DG**: Live `0.00 kW`, Today `0.00 kWh`, Lifetime `4.49 MWh`.
  * **Load**: Live `4.38 kW`.
  * **Today's Performance Trio**:
    * **CUF (Capacity Utilization Factor)**: `16.01%`.
    * **Expected Generation**: `450.00 kWh`.
    * **Peak Irradiance**: `792.83 W/m²` at `12:45 PM`.
  * **Revenue Gains (₹)**: Day `₹ 3,171`, Month `₹ 26,054`, Year `₹ 2.37 Lacs` (Configured Feed-in Tariff: `₹ 8.25 / kWh`).
* **Hardware Status Card**: Dedicated DG Controller block showing "Offline" badge with event message `"No Power / Comm.Error"`.
* **Yield & Diurnal Analytics**:
  * Monthly Yield bar chart with daily targets and cumulative line.
  * Plant Power Generation Curve (kW) with datetime range picker, zoom, and CSV export.
  * Bar chart comparing Actual Energy vs Expected Baseline vs Performance Ratio (PR %).
* **Persistent Status Ticker**: Bottom event strip with Event Log CTA and live equipment alarm badges.

---

### `ref_img_2.png` — Plant Generation Comparative Analysis
* Dedicated view under **Dashboard $\to$ Plant Generation** with Date Range Picker (`From: 09/27/2026` to `To: 10/07/2026`).
* **4-Quadrant Analytical Correlation Grid**:
  1. **Energy Generation [kWh]**: Daily bar chart with direct download button.
  2. **CUF Curve**: Capacity Utilization Factor (%) daily trend bar chart.
  3. **Energy Generation [kWh] vs. CUF Curve**: Dual-axis chart (Bars: Energy Generation on left axis; Line: CUF % on right axis) with exact daily values labeled per bar.
  4. **Energy Generation [kWh] vs. Specific Yield**: Dual-axis chart (Bars: Energy Generation; Line: Specific Yield in $kWh/kWp$, ranging 0–8 $kWh/kWp$).

---

### `ref_img_3.png` — PV Parameter Live Register Map
* Dedicated view under **PV Monitoring $\to$ PV Parameter** with Inverter selector tabs (`INV-01`, etc.).
* **Raw Modbus Register Tile Grid**:
  * Timestamp: `10/7/2026 5:55:00 PM` | Event Code: `0`.
  * Inverter Internal Temperature: `49.500 °C`.
  * Per-channel DC Voltage: `DC_VOLTAGE_1` (`587.7 V`) to `DC_VOLTAGE_12`.
  * Per-channel DC Current: `DC_CURRENT_1` (`0.100 A`) to `DC_CURRENT_12`.
  * DC Active Power: `0.369 kW`.
  * Individual String Currents: `CURRENT_STRING_1` (`0.140 A`) to `CURRENT_STRING_24`.
  * Expandable "View More" link for extended diagnostics.

---

### `ref_img_4.png` — MPPT Multi-Channel Diagnostic Stack
* Dedicated view under **PV Monitoring $\to$ MPPT Monitoring**.
* Inverter tab selector, high-precision datetime filter, refresh and download buttons.
* **Top Summary Curve**: Overlaid time-series comparison of all DC Currents (`DC_CURRENT_1` through `DC_CURRENT_12`) over the diurnal operating window (06:00 to 18:00).
* **Per-MPPT Detailed Breakdown Stack**:
  * 12 stacked dual-axis sub-charts (one per MPPT tracker).
  * Each sub-chart tracks MPPT DC Current (solid line) vs DC Voltage (bar/line) with tooltip inspection (e.g. `15:15 -> DC_CURRENT_1: 9.7 A, DC_VOLTAGE_1: 670.3 V`).
  * Allows electrical engineers to immediately detect tracker clipping, open-circuit strings, or tracker misalignment.

---

### `ref_img_5.png` — String-Level Current Heatmap Matrix & Audit Table
* Dedicated view under **PV Monitoring $\to$ String Monitoring**.
* Inverter selector, date picker, download and fullscreen toggles.
* **2D String Current Heatmap Matrix**:
  * Rows: `AVG_Current` and `CURRENT_STRING_1` through `CURRENT_STRING_24`.
  * Columns: 5-minute time intervals across the day (`06:00`, `06:05`, `06:10`, ..., `07:35`).
  * Visual Gradient: Deep Red ($0.00\text{ A}$ / dead / disconnected) $\to$ Amber ($0.1–1.0\text{ A}$) $\to$ Vibrant Lime Green ($1.5–2.0+\text{ A}$).
  * **Immediate Field Diagnostic Value**: Instantly highlights that Strings 1–6 and 15–20 are completely offline ($0.00\text{ A}$ during daytime), signaling blown fuses or disconnected string combiners.
* **Multi-Line String Comparison Curve**: Real-time overlay of all 24 string currents plus the average curve.
* **5-Minute Telemetry Table**: Timestamped rows with `STRING_AVG_CURRENT` and all 24 string current readings, paginated with **Excel** and **PDF** export buttons.

---

### `ref_img_6.png` — Daily Energy Audit Log (Vertical Table)
* Located under **Energy $\to$ Daily Energy Log**.
* Date Range filter with `Show`, `Excel`, `PDF`, and Fullscreen actions.
* **Vertical Daily Table Structure**:
  * `Date`: (e.g. 27-Sep-2026 to 07-Oct-2026).
  * `Plant Total KWH [Cumulative]`: (e.g. 303,535.2 kWh).
  * `Day Total [KWH]`: (e.g. 323.39 kWh).
  * `INV-01 KWH [Cumulative]` & `INV-01 Day Total [KWH]`.
  * `DG KWH [Cumulative]` & `DG Day Total [KWH]`.
  * `NO_OF_INV`: Online inverter count.
  * **`PV_DG_Fuel_Saving_KWH`**: Solar energy utilized during DG operation to shave diesel burn.
  * **`PV_DG_Fuel_Saving_INV`**: Fuel savings attributed to individual inverters.
  * `CUF`: Capacity Utilization Factor %.
  * `SOLAR_INSO`: Daily solar insolation ($kWh/m²$).

---

### `ref_img_7.png` — Daily Generation Report (DGR Horizontal Matrix)
* Located under **Energy $\to$ Daily Energy Log $\to$ Energy Log Horizontal Report**.
* **Standard Solar EPC Daily Generation Report (DGR) Matrix**:
  * Dates displayed horizontally as columns (`27/Sep/2026` ... `07/Oct/2026`).
  * Metrics displayed as rows:
    * `Day Total [KWH]`
    * `INV-01 Day Total [KWH]`
    * `DG Day Total [KWH]`
    * `NO_OF_INV`
    * `PV_DG_Fuel_Saving_KWH`
    * `PV_DG_Fuel_Saving_INV`
    * `CUF` (%)
    * `SOLAR_INSO` ($kWh/m²$)
    * `PR` (Performance Ratio %)
    * `EXPECT_GEN [KWH]` (Baseline expected yield from PVSyst simulation)
    * `PEAK_IRRADIANCE` ($W/m²$)
    * `PEAK_IRR_TIME` (Exact timestamp of peak irradiance)
  * Direct one-click **Excel** and **PDF** export for contractual compliance submissions.

---

### `ref_img_8.png` — Daily Energy Multi-Day Trend Curve
* Located under **Energy $\to$ Daily Energy Log $\to$ Energy Curve**.
* Date range selector with toggle between **Line** and **Bar**.
* Smooth multi-day spline curve showing daily generation totals, clearly exposing dips from cloudy weather or grid curtailment events (e.g. drop to $84.48\text{ kWh}$ on 28-Sep).

---

## 3. Comprehensive Feature Gap Matrix

| Feature | Competitor (eSolar) | NEON ENERGY Current | Gap Severity | Proposed Solution |
|---|---|---|---|---|
| **1. String Current Heatmap Matrix** | 2D 24-string $\times$ 5-min color-coded grid (`ref_img_5`) | String table only (no 2D heatmap) | **High** | Add 2D time $\times$ string thermal heatmap to Solar Subsystem Drawer & Detail view. |
| **2. Per-MPPT Voltage & Current Stack** | 12 stacked dual-axis sub-charts (`ref_img_4`) | Aggregated inverter power only | **High** | Add MPPT Diagnostic tab to Solar Subsystem Drawer. |
| **3. Capacity Utilization Factor (CUF %)** | Present on all screens & reports (`ref_img_1, 2, 6, 7`) | Not calculated or displayed | **High** | Compute CUF % on daily/monthly telemetry: $\text{CUF} = \frac{E_{\text{actual}}}{P_{\text{rated}} \times 24 \times D} \times 100$. |
| **4. Specific Yield ($kWh/kWp$)** | Tracked daily & correlated (`ref_img_1, 2`) | Raw kWh only | **High** | Normalize generation by plant DC kWp: $Y_f = \frac{E_{\text{gen}}}{P_{\text{DC}}}$. |
| **5. Annual Generation Target vs Achieved** | Circular dial & progress % (`ref_img_1`) | Missing | **Medium** | Add contractual PPA Annual Target tracker on site header and fleet cockpit. |
| **6. Extended ESG Metrics** | Coal Saved (Tons) & Trees Planted (`ref_img_1`) | Only $\text{CO}_2$ avoided | **Medium** | Add Coal Saved ($kg/\text{Tons}$) and Equivalent Trees Planted formulas. |
| **7. Revenue Gains in Local Currency (₹)** | Day, Month, Year, Tariff rate (`ref_img_1`) | Basic tariff arbitrage only | **Medium** | Display revenue gains in ₹ at site feed-in tariff across day/month/year. |
| **8. PV-DG Fuel Savings Analytics** | kWh & diesel liters saved (`ref_img_6, 7`) | DG runtime only | **Medium** | Calculate diesel liters saved by solar during DG parallel operation. |
| **9. DGR Horizontal Matrix Report** | Standard EPC format with dates as columns (`ref_img_7`) | Vertical time-series charts | **High** | Implement Horizontal DGR compliance matrix with Excel/PDF export. |
| **10. 1-Click Excel & PDF Compliance Export** | Buttons on all tables & charts (`ref_img_5, 6, 7`) | Manual print / screenshot | **High** | Add client-side Excel (.xlsx) and printable PDF generation for telemetry & DGR. |
| **11. Commissioning & Warranty Expiry Strip** | EPC vendor, commissioning date, expiry date (`ref_img_1`) | Basic site metadata | **Low** | Expand site master schema with EPC vendor, commissioning date, warranty expiry. |
| **12. Peak Irradiance & Peak Timestamp** | Max $W/m²$ and exact time (`ref_img_1, 7`) | Instantaneous irradiance only | **Low** | Record daily peak irradiance and timestamp in daily rollup table. |

---

## 4. Architectural Placement Strategy

Because NEON ENERGY is an **enterprise multi-site fleet platform**, features must be distributed cleanly across the hierarchy without cluttering views:

```
NEON ENERGY ARCHITECTURE
│
├── TIER 1: FLEET COCKPIT (Global / Portfolio Level)
│   ├── Fleet Aggregate Strip: Add Coal Saved (k Tons), Trees Planted, Fleet Revenue (₹)
│   ├── Portfolio PPA Target Progress: Fleet-wide Annual Target vs Achieved %
│   ├── Specific Yield Leaderboard: Normalized kWh/kWp comparison across sites
│   └── Warranty & Subscription Watchlist: Sites with warranties expiring in 30/60/90 days
│
├── TIER 2: INDIVIDUAL SITE COCKPIT (/sites/[id])
│   ├── A. Header Metadata Strip:
│   │   ├── AC Capacity (kW) vs DC Capacity (kWp) + DC/AC Ratio
│   │   ├── Commissioning Info: Vendor, Commissioned Date, Warranty Expiry Countdown
│   │   ├── Revenue Gains Ticker: Day, Month, Year (₹) based on site tariff
│   │   └── Annual Target Dial: Target MWh vs Achieved MWh (Target %)
│   │
│   ├── B. Daily Performance Sub-Strip:
│   │   ├── CUF % | PR % | Specific Yield (kWh/kWp) | Peak Irradiance (W/m² @ HH:MM)
│   │
│   ├── C. 5-Node Animated Energy Flow Visualizer:
│   │   └── Keep animated canvas + add "SLD Engineering Mode" toggle for breaker schematic
│   │
│   ├── D. Subsystem Drawers & Bottom Sheets:
│   │   ├── Solar Subsystem Drawer:
│   │   │   ├── Tab 1: Inverter Overview & PR %
│   │   │   ├── Tab 2: String Current Heatmap Matrix (2D Red-to-Green grid)
│   │   │   ├── Tab 3: Per-MPPT Voltage & Current Stack (12-channel diagnostic)
│   │   │   └── Tab 4: Raw Modbus Register Map (Internal temp, DC/AC voltages, event code)
│   │   ├── BESS Subsystem Drawer (NEON's 16-cell thermal heatmap - competitor lacks this)
│   │   └── DG Subsystem Drawer: PV-DG Fuel Savings (kWh & diesel liters saved)
│   │
│   └── E. Site Analytics & Compliance Tab (/sites/[id]/analytics):
│       ├── Daily Generation Report (DGR) Matrix (Horizontal & Vertical views)
│       ├── 4-Quadrant Correlation Charts (Energy vs CUF, Energy vs Specific Yield)
│       └── 1-Click Excel (.xlsx) & PDF Export Engine
```

---

## 5. Mathematical Formulations & Data Specifications

### 1. Capacity Utilization Factor (CUF %)
$$\text{CUF} (\%) = \frac{\text{Actual Generation } (kWh)}{\text{Installed AC Capacity } (kW) \times 24\text{ hours} \times \text{Days}} \times 100$$

### 2. Specific Yield ($kWh/kWp$)
$$Y_f = \frac{\text{Daily Generation } (kWh)}{\text{Installed DC Capacity } (kWp)}$$

### 3. Extended Environmental Equivalents
* **$\text{CO}_2$ Avoided**: $\text{Energy Generated } (kWh) \times 0.82\ kg\ \text{CO}_2/kWh$.
* **Coal Saved**: $\text{Energy Generated } (kWh) \times 0.38\ kg\ \text{Coal}/kWh$.
* **Equivalent Trees Planted**: $\frac{\text{CO}_2\text{ Avoided } (kg)}{21.77\ kg\ \text{CO}_2/\text{tree/year}}$.

### 4. PV-DG Fuel Savings
$$\text{Diesel Fuel Saved } (\text{Liters}) = \frac{\text{Solar Energy Generated during DG run } (kWh)}{\text{Specific DG Fuel Consumption Rate } (\approx 3.2\ kWh/L)}$$
$$\text{Cost Saved } (₹) = \text{Diesel Fuel Saved } (L) \times \text{Local Diesel Price } (₹/L)$$

### 5. String Heatmap Color Token Thresholds
* **Disconnected / Blown Fuse ($0.00\text{ A}$)**: `#FF1744` (Neon Red / Dark Crimson).
* **Low / Shaded / Cloud ($0.01 - 1.00\text{ A}$)**: `#FFD600` (Vivid Amber / Gold).
* **Nominal / High Irradiance ($> 1.00\text{ A}$)**: `#00E676` (Cyber Emerald / Lime Green).

---

## 6. Phased Implementation Roadmap

* [ ] **Phase 1: Site Header Metadata, Extended ESG & Financial Revenue**
  * Update `Site` schema & types with `dc_capacity_kwp`, `commissioned_by`, `commissioned_date`, `warranty_expiry_date`, and `annual_target_mwh`.
  * Add Coal Saved, Trees Planted, and Revenue in ₹ to the Site Header and Fleet Cockpit.
  * Implement the circular/bar Annual Target vs Achieved progress gauge.
* [ ] **Phase 2: String Current Heatmap Matrix & MPPT Diagnostic Stack**
  * Build the 2D String Current Heatmap component (`StringHeatmapMatrix.tsx`) inside the Solar Subsystem Drawer.
  * Implement the stacked per-MPPT Voltage vs Current diagnostic curves (`MpptDiagnosticStack.tsx`).
  * Add the Raw Modbus Register Map tab for field technicians.
* [ ] **Phase 3: Daily Generation Report (DGR) Matrix & 1-Click Export**
  * Implement the Horizontal DGR Matrix (`DgrHorizontalReport.tsx`) with dates as columns and metrics as rows.
  * Build the 4-Quadrant Correlation Charts (Energy vs CUF, Energy vs Specific Yield).
  * Integrate client-side `.xlsx` and printable PDF export buttons.
* [ ] **Phase 4: Fleet-Wide Specific Yield Leaderboard & Portfolio Target Aggregation**
  * Add normalized Specific Yield ($kWh/kWp$) and CUF % sorting to the Fleet Cockpit site cards and table.
  * Add the Fleet Portfolio Target tracking bar and Warranty Expiry watchlist.

---

## 7. Design System Adherence Checks

* **Cyber Dark Mode (Default)**: Void Black (`#060709`), Obsidian (`#0B0D13`), Cyber Glass (`#121622`), with glowing `#FF2A85` Neon Pink accents.
* **High-Contrast Day Mode**: Solar Ice Canvas (`#F4F6FB`), Pure White Cards (`#FFFFFF`), Day Frost (`#EAEFF8`), Deep Charcoal Ink (`#0B0F19`).
* **Monospace Rule**: All numerical telemetry values ($kW$, $kWh$, $V$, $A$, $Hz$, $\%$, $W/m²$, $^\circ\text{C}$, $₹$) must use `font-mono`.
* **Mobile Touch Ergonomics**: Minimum $48 \times 48\ px$ touch targets for all date selectors, tabs, and export buttons.
