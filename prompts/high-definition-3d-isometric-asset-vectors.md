# Implementation Prompt: High-Definition 3D Isometric Vectors for System Topology Assets

## Goal
Replace the simplistic polygon drawings in `components/energy-flow/system-topology-visualizer.tsx` with high-definition, control-room-grade 3D isometric vector artwork for all 6 microgrid assets (Solar PV, PCS Inverter, Utility Grid, DG Backup, BESS Container, and Facility Load), utilizing rich gradients, metallic shading, realistic structural details, and glowing status conduits reflecting industrial SCADA EMS benchmarks (`context_img/01_dashboard_overview_financial.png` and `02_energy_flow_diagram_top.png`).

---

## Relevant Agent Skills
- `.agents/skills/shadcn/` (Cyber Dark & High-Contrast Light theme token adherence)
- SVG isometric design standards (30-degree isometric projection, drop shadow filters, SVG defs & linear gradients)

---

## Existing Code Inspected
- `components/energy-flow/system-topology-visualizer.tsx`: Lines 200-350 contain rudimentary polygon shapes that lack visual depth, shading, realistic component architecture, and modern control-room aesthetic.
- `components/energy-flow/asset-detail-modal.tsx`: Reuses same telemetry; will reflect the same elevated aesthetic.
- `public/context/context_img/01_dashboard_overview_financial.png`: Features high-fidelity isometric microgrid equipment with realistic perspective, metallic bevels, and clean lighting.

---

## Vector Art Specifications & Enhancements

### 1. Solar PV Array (Photovoltaic Field)
- **ViewBox**: `0 0 72 60` with isometric angled base.
- **Structural Details**:
  - Dual-tier tilted solar panels with realistic galvanized steel ground racking.
  - Deep monocrystalline blue wafers (`#1E3A8A` to `#0284C7`) with fine silver busbar ribbons.
  - High-gloss anti-reflective glass coating with sun glare gradient.
  - Sub-array combiner box with illuminated status LED.

### 2. PCS / Bi-Directional Inverter Cabinet
- **ViewBox**: `0 0 72 60`
- **Structural Details**:
  - Industrial outdoor-rated enclosure with bevelled isometric roof overhang.
  - Perforated intake cooling louvers with dark acoustic mesh.
  - Digital HMI touchscreen with active sine wave / kilowatt readout line.
  - AC and DC conduit entry sleeves at bottom with gold-plated terminal glands.
  - Dual status beacon light bar with green running glow.

### 3. Utility Grid Transmission Pylon
- **ViewBox**: `0 0 72 60`
- **Structural Details**:
  - High-voltage steel lattice tower with realistic diagonal cross-braces and gusset plates.
  - Multi-tier horizontal cross-arms supporting high-voltage suspension insulators (`#9D4EDD` violet porcelain discs).
  - High-tension transmission conductors with catenary curves.
  - Reinforced concrete plinth foundation and overhead lightning shield wire.

### 4. Heavy-Duty Diesel Generator (DG Set)
- **ViewBox**: `0 0 72 60`
- **Structural Details**:
  - Sound-attenuated acoustic canopy with charcoal body and safety-orange accent stripe.
  - High-capacity engine ventilation radiator grille and chrome turbo exhaust stack with rain cap.
  - Anti-vibration base frame with integrated sub-base fuel tank and inspection sight glass.
  - Emergency stop button and digital engine supervisory controller.

### 5. Containerized BESS Subsystem
- **ViewBox**: `0 0 72 60`
- **Structural Details**:
  - Modern liquid-cooled battery container (Megapack / utility block style) with isometric depth.
  - Dual front access doors with tamper-proof handles and NFPA 855 safety decals.
  - Integrated thermal management radiator / HVAC chiller unit mounted on the end with fan housing.
  - Glowing laser cyan (`#00F0FF`) status strip and illuminated module rack indicators through inspection ports.
  - Heavy-duty concrete foundation pad.

### 6. Commercial Facility & Microgrid Hub Load
- **ViewBox**: `0 0 72 60`
- **Structural Details**:
  - Modern multi-story architectural commercial facility with glass curtain wall facade.
  - Interior illuminated cyber-lit windows (ambient cyan and neon pink).
  - Rooftop industrial HVAC chiller units, elevator penthouse, and communication antennae.
  - Cantilevered entrance canopy with adjacent illuminated EV fast-charging station kiosk.

---

## Technical & Visual Implementation
1. Encapsulate each asset vector into dedicated, memoized SVG sub-components (`SolarArrayVector`, `PcsCabinetVector`, `GridPylonVector`, `DieselGeneratorVector`, `BessContainerVector`, `BuildingFacilityVector`) with independent gradients and drop shadows.
2. Ensure responsive scaling (`w-14 h-12 sm:w-16 sm:h-14`) so vectors look ultra-crisp on standard displays and 4K control room monitors.
3. Support both Cyber Dark and High-Contrast Light Day modes with dynamic stroke contrast.

---

## Acceptance Criteria
1. All 6 asset vectors replaced with high-definition, multi-layered 3D isometric SVG designs.
2. SVG linear gradients provide realistic lighting, metallic reflections, and depth.
3. Smooth hover interactions and click-to-open telemetry modal preserved.
4. Pass all typecheck and lint checks with 0 errors.

---

## Checks to Run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
