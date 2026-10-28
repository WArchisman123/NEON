# Implementation Prompt: High-Definition 3D Asset Vectors & Industrial Power Flow Multi-Stream Trends Overhaul

## Goal
Deliver a comprehensive visual and functional upgrade to the NEON ENERGY microgrid experience:
1. **High-Definition 3D Isometric Asset Vectors**: Replace basic polygon drawings in `components/energy-flow/system-topology-visualizer.tsx` with control-room-grade 3D isometric vector artwork (Solar PV, PCS Inverter, Grid Transmission Pylon, Diesel Generator, Containerized BESS, Facility & EV Hub) featuring metallic shading, depth gradients, and realistic microgrid hardware architecture.
2. **Industrial Power Flow Multi-Stream Trends Overhaul**: Replace the crude step-bar container in `components/site-detail/tabs/energy-flow-tab.tsx` with a dedicated, professional multi-channel power dispatch waveform chart (`components/energy-flow/power-flow-trends-chart.tsx`) supporting smooth spline curves, dual-directional zero-baselines (BESS charge/discharge & Grid import/export), interactive hover crosshair, channel toggles, and selectable time intervals (`5m`, `15m`, `1h`, `6h`, `12h`, `1d`) conforming to competitor EMS reference `03_energy_flow_summaries_and_trend.png`.

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Cyber Dark & High-Contrast Light theme token adherence)
- SVG curve mathematics (Bézier splines, zero-baseline clamping, dynamic multi-stream area gradients)

---

## Detailed Implementation Specifications

### Part 1: High-Definition 3D Isometric Vectors
Replace simplistic polygon shapes with 6 dedicated vector sub-components:
1. **`SolarArrayVector`** (`#FFD600`):
   - Multi-string monocrystalline photovoltaic array tilted at 30° isometric angle.
   - Deep blue silicon wafers (`#1E3A8A` to `#0284C7`) with silver conductive grid lines.
   - Galvanized steel ground mount racking with realistic legs and cross-struts.
   - String combiner box with glowing green status LED.
2. **`PcsCabinetVector`** (`#38BDF8`):
   - Outdoor utility-scale bi-directional PCS inverter enclosure (Megapack / Sungrow style).
   - Bevelled roof with ventilation louvers and dark intake grille.
   - Active HMI touchscreen display displaying a glowing green sine wave.
   - AC and DC conduit entry sleeves with gold-plated terminal glands.
3. **`GridPylonVector`** (`#9D4EDD`):
   - High-voltage steel lattice transmission tower with diagonal truss bracing.
   - Multi-tiered cross-arms with glowing purple porcelain suspension insulators.
   - Catenary high-tension power conductors and overhead lightning earth wire.
   - Reinforced concrete foundation plinth.
4. **`DieselGeneratorVector`** (`#FF6B00`):
   - Sound-attenuated acoustic canopy in dark charcoal with hi-viz orange accents.
   - Chrome turbo exhaust stack with rain cap and heat shield.
   - High-flow radiator intake grille and sub-base fuel tank with level indicator.
   - Emergency stop push button and digital engine controller screen.
5. **`BessContainerVector`** (`#00F0FF`):
   - Modern liquid-cooled battery energy storage container with realistic 3D perspective.
   - Dual weather-sealed access doors with lock handles and NFPA 855 decals.
   - End-mounted HVAC chiller/radiator fan housing with cooling louvers.
   - Glowing laser-cyan status light bar and module rack illumination ports.
6. **`BuildingFacilityVector`** (`#FF2A85`):
   - Architectural corporate commercial facility with curtain wall glass facade.
   - Interior cyber-illuminated windows (cyan and pink accent lights).
   - Rooftop HVAC chillers, mechanical penthouse, and communications antenna.
   - Adjacent illuminated high-power EV fast-charging kiosk pillar.

---

### Part 2: Power Flow Multi-Stream Trends Overhaul (`components/energy-flow/power-flow-trends-chart.tsx`)
Build a dedicated, high-performance SVG time-series engine:
1. **5 Synchronized Electrical Streams**:
   - ☀️ **Solar PV Generation** (`#FFD600` Amber): Positive dispatch curve ($0$ to $+120\text{ kW}$).
   - 🔋 **BESS Storage Power** (`#00F0FF` Cyan): Dual-directional curve. Negative values ($-80\text{ kW}$ to $0$) indicate charging/absorption; positive values ($0$ to $+80\text{ kW}$) indicate discharging to bus.
   - ⚡ **Grid Interconnection** (`#9D4EDD` Purple): Dual-directional curve. Positive indicates net import from utility; negative indicates solar feed-in export.
   - 🏭 **Facility Building Load** (`#FF2A85` Neon Pink): Continuous demand baseline ($80$ to $130\text{ kW}$).
   - 🚗 **EV Charging Station** (`#38BDF8` Sky Blue): Pulsed high-power charging load ($0$ to $25\text{ kW}$).
2. **Zero-Baseline Reference & Grid Layout**:
   - Explicit horizontal dashed line at $0\text{ kW}$ separating energy injection from absorption.
   - Clean Y-axis with kilowatt tick labels (`+120 kW`, `+80 kW`, `+40 kW`, `0 kW`, `-40 kW`, `-80 kW`).
   - X-axis with interval timestamps matching the selected range (`5m`, `15m`, `1h`, `6h`, `12h`, `1d`).
3. **Interactive Features**:
   - **Stream Toggles**: Clickable legend badges to show/hide individual streams with active opacity transition.
   - **Interactive Hover Crosshair**: Hovering over the chart displays a vertical cursor tracking line, circular data node rings on each stream, and a tooltip card showing exact kW values for every active stream at that timestamp.
   - **Time Range Switcher**: Instant switching between `5m`, `15m`, `1h`, `6h`, `12h`, and `1d` with responsive data smoothing.
   - **Instantaneous Stat Chips**: Top header chips showing current live power for each channel.

---

## Files to Modify / Create
1. `components/energy-flow/system-topology-visualizer.tsx`: Replace SVG vectors with high-definition 3D isometric vector subcomponents.
2. `components/energy-flow/power-flow-trends-chart.tsx`: New component with full multi-stream spline chart engine.
3. `components/site-detail/tabs/energy-flow-tab.tsx`: Integrate `PowerFlowTrendsChart` into Page 2.

---

## Design System & Theme Adherence
- Void Black (`#060709`) and Obsidian Dark (`#0B0D13`) in Cyber Dark mode; Solar Ice Canvas (`#F4F6FB`) and Pure White Cards (`#FFFFFF`) in Day Light mode.
- Monospace font (`font-mono`) for all kilowatt metrics, timestamps, and axes.
- Mobile touch target compliance ($\ge 48\times 48\text{ px}$).

---

## Acceptance Criteria
1. All 6 asset vectors in the topology visualizer feature rich 3D isometric shading, metallic depth, and realistic structural details.
2. The crude step-bars in `EnergyFlowTab` are replaced with the new `PowerFlowTrendsChart`.
3. The trends chart displays smooth multi-line curves with proper zero-baseline crossing for BESS and Grid.
4. Channel toggles and hover crosshair tooltip function without layout lag.
5. `npx tsc --noEmit` and `npm run lint` pass with 0 errors.

---

## Checks to Run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
