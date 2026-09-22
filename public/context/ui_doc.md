# NEON ENERGY UI Design System & Component Specification
## Cyber Black Neon / Pink Aesthetic & Mobile-Optimized Dashboard Blueprint

> **For implementation agents:** Read this file in full before building any UI component.  
> Every class name, CSS token, color code, responsive breakpoint, and animation pattern in this document represents the exact design language of **Neon Energy**.  
> Do not introduce conflicting light-theme styles, generic grey palettes, or standard default frameworks without applying the black-neon/pink design system.

---

## 1. Design Tokens & Cyberpunk Color Palette

The visual identity of Neon Energy is rooted in **deep void blacks, obsidian glassmorphism, and radiant neon luminescence**. High-contrast glowing accents allow field technicians to read microgrid telemetry clearly in intense direct sunlight on mobile devices, while providing a stunning dark control-room dashboard on desktop screens.

### 1.1 Core Color Swatches

| Token Name | Hex Code | Tailwind Equivalent / Arbitrary | Usage / Semantic Role |
|---|---|---|---|
| **Void Black (Page Background)** | `#060709` | `bg-[#060709]` | Root canvas background, full-screen wrapper |
| **Obsidian Card Surface** | `#0B0D13` | `bg-[#0B0D13]` | Dashboard cards, metric containers, table rows |
| **Elevated Surface (Popover/Modal)** | `#121622` | `bg-[#121622]` | Modals, slide-over drawers, dropdown menus |
| **Neon Pink (Brand Primary)** | `#FF2A85` | `text-[#FF2A85]`, `bg-[#FF2A85]` | Main CTA buttons, brand badges, active links, Load node |
| **Neon Pink Glow** | `rgba(255,42,133,0.35)`| `shadow-[0_0_15px_rgba(255,42,133,0.35)]` | Button glow, card focus ring, active pulse |
| **Solar Amber (Electric Yellow)** | `#FFD600` | `text-[#FFD600]`, `bg-[#FFD600]` | Solar PV active generation, irradiance, daytime charts |
| **BESS Cyan (Laser Blue)** | `#00F0FF` | `text-[#00F0FF]`, `bg-[#00F0FF]` | Battery storage, SoC gauge, charging/discharging flow |
| **Grid Violet (Electric Purple)** | `#9D4EDD` | `text-[#9D4EDD]`, `bg-[#9D4EDD]` | Utility grid interconnection, import/export meters |
| **DG Hi-Viz Orange** | `#FF6B00` | `text-[#FF6B00]`, `bg-[#FF6B00]` | Diesel generator, backup power, engine running state |
| **Normal / Online Green** | `#00E676` | `text-[#00E676]`, `bg-[#00E676]` | Plant healthy, telemetry connected, online status |
| **Warning Amber** | `#FFAB00` | `text-[#FFAB00]`, `bg-[#FFAB00]` | Derating, minor cell delta-V, string soiling |
| **Critical Alarm Pink/Red** | `#FF1744` | `text-[#FF1744]`, `bg-[#FF1744]` | Tripped contactor, thermal runaway alert, plant offline |
| **Border Default (Dark Glass)** | `rgba(255,255,255,0.08)`| `border-white/[0.08]` | Unfocused card borders, table dividers |
| **Border Active (Neon Pink Glass)** | `rgba(255,42,133,0.4)` | `border-[#FF2A85]/40` | Hovered/selected cards, active input border |
| **Text Primary (Pure Radiant)** | `#F8FAFC` | `text-slate-100` | Primary values, headings, titles |
| **Text Secondary (Muted Silver)**| `#94A3B8` | `text-slate-400` | Metric labels, subheaders, units |
| **Text Monospace (Telemetry)** | `#E2E8F0` | `font-mono text-slate-200` | Live voltages, currents, frequencies, timestamps |

---

### 1.2 Glow Utilities & Neon Effects

Add these custom utilities to `tailwind.config.ts` or use Tailwind arbitrary values:

```css
/* Custom Neon Glow Shadows */
.glow-pink {
  box-shadow: 0 0 20px -3px rgba(255, 42, 133, 0.45);
}
.glow-cyan {
  box-shadow: 0 0 20px -3px rgba(0, 240, 255, 0.45);
}
.glow-yellow {
  box-shadow: 0 0 20px -3px rgba(255, 214, 0, 0.45);
}
.glow-border-pink {
  border-color: rgba(255, 42, 133, 0.6);
  box-shadow: inset 0 0 12px rgba(255, 42, 133, 0.15), 0 0 15px rgba(255, 42, 133, 0.25);
}
```

---

### 1.3 Typography Rules & Monospace Metrics
To convey industrial precision, all live telemetry values, frequencies, timestamps, and electrical units **must use a monospace font** (`font-mono` / JetBrains Mono or Geist Mono).

- **Fleet KPI Mega Value**: `text-2xl sm:text-3xl font-black font-mono tracking-tight text-white`
- **Card Telemetry Value**: `text-xl sm:text-2xl font-bold font-mono text-white`
- **Secondary Metric Readout**: `text-sm sm:text-base font-semibold font-mono text-slate-300`
- **Section Heading**: `text-base sm:text-lg font-bold text-white tracking-tight uppercase`
- **Field / Unit Label**: `text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400`
- **Status Badge**: `text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full`

---

## 2. Global Application Shell (`NeonAppShell`)

Every authenticated view is wrapped in the responsive `NeonAppShell`.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ DESKTOP LAYOUT (Screen Width >= 1024px)                                                 │
│ ┌──────┬──────────────────────────────────────────────────────────────────────────────┐ │
│ │      │ Topbar: [Logo] [Org: Apex Clean Energy ▼] [Fleet Ticker] [Search] [Alerts][👤]│ │
│ │ Left ├──────────────────────────────────────────────────────────────────────────────┤ │
│ │ Cyber│ Content Area: `p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6`                │ │
│ │ Dock │                                                                              │ │
│ │ (72px│                                                                              │ │
│ │ /    │                                                                              │ │
│ │240px)│                                                                              │ │
│ └──────┴──────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ MOBILE VIEWPORT (Screen Width < 1024px)                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Mobile Topbar (h-14): [Logo: NEON] [Site/Fleet Switcher]                [Bell] [👤] │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ Mobile Content Canvas: `p-3 sm:p-4 space-y-4 pb-24` (Thumb scrollable)              │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ Mobile Cyber-Dock Bottom Bar (h-16, fixed bottom-0 z-40):                           │ │
│ │ [ ⚡ Sites ]   [ 🔄 Flow ]   [ 📊 Analytics ]   [ 🛠️ Service ]   [ ⚙️ Settings ]     │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Shell Component Implementation (`components/layout/neon-app-shell.tsx`)

```tsx
"use client";

import React, { ReactNode } from "react";
import { DesktopSidebar } from "./desktop-sidebar";
import { Topbar } from "./topbar";
import { MobileBottomBar } from "./mobile-bottom-bar";

interface NeonAppShellProps {
  children: ReactNode;
}

export function NeonAppShell({ children }: NeonAppShellProps) {
  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 flex flex-col antialiased selection:bg-[#FF2A85] selection:text-white">
      {/* Topbar: Fixed on both desktop and mobile */}
      <Topbar />

      <div className="flex flex-1 items-stretch min-w-0">
        {/* Desktop Cyberdock Sidebar (Hidden on mobile) */}
        <DesktopSidebar className="hidden lg:flex" />

        {/* Primary Content Container */}
        <main className="flex-1 flex flex-col min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-[1600px] mx-auto w-full pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Cyber Bottom Navigation (Fixed on mobile screen bottom) */}
      <MobileBottomBar className="lg:hidden" />
    </div>
  );
}
```

---

## 3. Topbar & Header Specifications (`components/layout/topbar.tsx`)

Fixed `h-14 sm:h-16` header with dark glassmorphism:
- Background: `bg-[#0B0D13]/90 backdrop-blur-md border-b border-white/[0.08]`
- Left:
  - **Neon Brand Mark**: Glowing pink hexagon/square with stylized "N" logo:
    ```tsx
    <div className="size-9 rounded-lg bg-gradient-to-br from-[#FF2A85] to-[#B00055] flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(255,42,133,0.5)]">
      ⚡
    </div>
    <span className="font-black tracking-wider text-lg text-white">
      NEON<span className="text-[#FF2A85]">.ENERGY</span>
    </span>
    ```
  - **Organization Switcher**: Displays current Clerk Organization with verified badge.
- Center (Desktop):
  - **Live Fleet Health Marquee**:
    ```tsx
    <div className="hidden xl:flex items-center gap-4 px-3 py-1.5 rounded-full bg-[#121622] border border-white/[0.06] text-xs font-mono">
      <span className="flex items-center gap-1.5 text-[#00E676]">
        <span className="size-2 rounded-full bg-[#00E676] animate-pulse" />
        Fleet Normal
      </span>
      <span className="text-slate-600">|</span>
      <span className="text-slate-300">Live Power: <strong className="text-[#FFD600]">3.42 MW</strong></span>
      <span className="text-slate-600">|</span>
      <span className="text-slate-300">Fleet SoC: <strong className="text-[#00F0FF]">78.4%</strong></span>
    </div>
    ```
- Right:
  - Global Search button (`Cmd + K`)
  - Real-time Alarm Alert Bell with glowing badge counter:
    ```tsx
    <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
      <Bell className="size-5" />
      <span className="absolute top-1.5 right-1.5 size-2 bg-[#FF2A85] rounded-full shadow-[0_0_8px_#FF2A85]" />
    </button>
    ```
  - User Avatar & Subscription Tier Badge (`PRO`, `ENTERPRISE`).

---

## 4. Mobile Bottom Navigation Cyberdock (`components/layout/mobile-bottom-bar.tsx`)

A dedicated mobile bottom bar designed for one-handed thumb ergonomics:
- Height: `h-16`, sticky at `bottom-0 z-40`
- Styling: `bg-[#0B0D13]/95 backdrop-blur-lg border-t border-white/[0.1]`
- Items:
  1. **Sites**: `<Home className="size-5" />` (Label: Sites)
  2. **Energy Flow**: `<Zap className="size-5" />` (Label: Flow) — Highlights when a specific site is active.
  3. **Analytics**: `<BarChart3 className="size-5" />` (Label: Power)
  4. **Maintenance**: `<Wrench className="size-5" />` (Label: Service) — Glowing pink dot if booking in progress.
  5. **Account / Tier**: `<ShieldCheck className="size-5" />` (Label: Account)

Active item styling:
```tsx
<Link
  href={item.href}
  className={cn(
    "flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all",
    isActive
      ? "text-[#FF2A85] drop-shadow-[0_0_8px_rgba(255,42,133,0.6)]"
      : "text-slate-400 hover:text-slate-200"
  )}
>
  <item.icon className="size-5" />
  <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
</Link>
```

---

## 5. Screen 1: Home / Solar Sites Cockpit

### 5.1 Fleet Aggregate KPI Strip

Renders 5 metric cards inside an auto-fit responsive grid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4`.

```tsx
<div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-[#FF2A85]/40 transition-all p-4 relative overflow-hidden group">
  {/* Accent Glow Strip */}
  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2A85] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  
  <div className="flex items-center justify-between mb-2">
    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Live Solar</span>
    <Sun className="size-4 text-[#FFD600]" />
  </div>
  
  <div className="text-2xl font-black font-mono text-white tracking-tight">
    3.42 <span className="text-sm font-normal text-slate-400">MW</span>
  </div>
  
  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-[#00E676]">
    <span>▲ +12.4%</span>
    <span className="text-slate-500 font-sans">vs yesterday</span>
  </div>
</div>
```

The 5 Cards:
1. **Live Solar Generation**: Amber `#FFD600` icon, instantaneous MW, delta vs yesterday.
2. **BESS Fleet Energy**: Cyan `#00F0FF` icon, aggregate MWh capacity and average fleet SoC %.
3. **Total Facility Load**: Pink `#FF2A85` icon, aggregate active demand MW, % of contracted demand.
4. **Grid Net Exchange**: Purple `#9D4EDD` icon, net feed-in MW or import MW with dollar earning velocity.
5. **Genset & Alarms**: Orange `#FF6B00` icon, active running genset count + active warning badges.

---

### 5.2 Site Cockpit Card (`<SiteCockpitCard />`)

The primary component representing each microgrid/solar site.

```tsx
<div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-[#FF2A85]/50 transition-all p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden shadow-lg shadow-black/40">
  {/* Card Top: Name, Location & Status */}
  <div>
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white group-hover:text-[#FF2A85] transition-colors">
            {site.name}
          </h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
            <span className="size-1.5 rounded-full bg-[#00E676] animate-pulse" />
            ONLINE
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{site.location_city}, {site.location_state}</p>
      </div>

      {/* Asset Badges */}
      <div className="flex items-center gap-1 bg-[#121622] px-2 py-1 rounded-md border border-white/[0.04] text-xs">
        {site.has_solar && <Sun className="size-3.5 text-[#FFD600]" title="Solar PV" />}
        {site.has_bess && <BatteryCharging className="size-3.5 text-[#00F0FF]" title="BESS Storage" />}
        {site.has_grid && <Zap className="size-3.5 text-[#9D4EDD]" title="Grid Intertie" />}
        {site.has_dg && <Flame className="size-3.5 text-[#FF6B00]" title="DG Backup" />}
      </div>
    </div>

    {/* Metric Grid Strip */}
    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-center">
      <div className="bg-[#121622]/60 p-2 rounded-lg border border-white/[0.04]">
        <div className="text-[10px] uppercase font-semibold text-slate-400">Solar</div>
        <div className="text-sm font-bold font-mono text-[#FFD600] mt-0.5">{site.live_solar_kw} kW</div>
      </div>
      <div className="bg-[#121622]/60 p-2 rounded-lg border border-white/[0.04]">
        <div className="text-[10px] uppercase font-semibold text-slate-400">BESS SoC</div>
        <div className="text-sm font-bold font-mono text-[#00F0FF] mt-0.5">{site.bess_soc_pct}%</div>
      </div>
      <div className="bg-[#121622]/60 p-2 rounded-lg border border-white/[0.04]">
        <div className="text-[10px] uppercase font-semibold text-slate-400">Load</div>
        <div className="text-sm font-bold font-mono text-[#FF2A85] mt-0.5">{site.load_kw} kW</div>
      </div>
    </div>
  </div>

  {/* Card Bottom: Daily Totals & CTA */}
  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
    <div className="text-slate-400 font-mono">
      Yield: <strong className="text-white">{site.daily_yield_kwh.toLocaleString()} kWh</strong>
    </div>
    <Link
      href={`/sites/${site.id}`}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF2A85] hover:text-[#ff559f] transition-colors"
    >
      View Energy Flow <ArrowRight className="size-3.5" />
    </Link>
  </div>
</div>
```

---

## 6. Screen 2: Interactive Real-Time Energy Flow Visualizer

The centerpiece of the platform. Renders an interactive 5-node electrical power flow network.

### 6.1 Layout Anatomy: Desktop vs Mobile

- **Desktop Layout**: Nodes arranged in a star/cross topology:
  - Top: **Solar PV Array**
  - Center: Main AC/DC Bus Bar with bidirectional flow junction
  - Left: **BESS Storage Container**
  - Right: **Facility Consumption Load**
  - Bottom-Left: **Diesel Generator Genset**
  - Bottom-Right: **Utility Grid Interconnection**
- **Mobile Layout**: Smooth vertical re-orientation:
  - Top: Solar PV
  - Middle Tier 1: BESS (Left) $\longleftrightarrow$ Facility Load (Right)
  - Middle Tier 2: DG (Left) $\longleftrightarrow$ Utility Grid (Right)
  - Fluid animated SVG flow pipes connect the nodes with pulsing glowing dashes.

```tsx
// Interactive Node Card Container
<button
  onClick={() => setActiveDrawer("bess")}
  className="w-full text-left p-4 rounded-xl bg-[#0B0D13] border border-[#00F0FF]/30 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer group"
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
        <BatteryCharging className="size-5" />
      </div>
      <div>
        <h4 className="text-xs uppercase font-bold text-slate-400">BESS Storage</h4>
        <div className="text-lg font-black font-mono text-white">
          84.2% <span className="text-xs font-normal text-slate-400">SoC</span>
        </div>
      </div>
    </div>
    <div className="text-right font-mono">
      <div className="text-sm font-bold text-[#00F0FF]">-320 kW</div>
      <div className="text-[10px] text-slate-500 uppercase">Charging</div>
    </div>
  </div>
  {/* Mini SoC Horizontal Progress Bar */}
  <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0090FF] rounded-full shadow-[0_0_8px_#00F0FF]"
      style={{ width: "84.2%" }}
    />
  </div>
</button>
```

### 6.2 Animated Flow Particles (SVG Stroke-Dashoffset Engine)

```tsx
<svg className="absolute inset-0 w-full h-full pointer-events-none">
  <defs>
    <linearGradient id="solar-to-load" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFD600" />
      <stop offset="100%" stopColor="#FF2A85" />
    </linearGradient>
  </defs>

  {/* Inactive conduit background */}
  <path
    d="M 400 120 L 400 300 L 650 300"
    fill="none"
    stroke="rgba(255,255,255,0.06)"
    strokeWidth="4"
  />

  {/* Active pulsing flow line */}
  <path
    d="M 400 120 L 400 300 L 650 300"
    fill="none"
    stroke="url(#solar-to-load)"
    strokeWidth="3"
    strokeDasharray="6 8"
    className="animate-flow-forward"
    style={{
      filter: "drop-shadow(0 0 6px rgba(255, 214, 0, 0.6))",
      animationDuration: `${Math.max(0.4, 2000 / (flowKw || 1))}s`,
    }}
  />
</svg>
```

---

## 7. Component Telemetry Drawers & Mobile Bottom Sheets

When a user taps any of the 5 nodes on the flow canvas, a slide-over inspection drawer opens.
- **Desktop**: Right-side drawer (`w-[460px]` to `w-[540px]`, `bg-[#0B0D13] border-l border-white/[0.08]`).
- **Mobile**: Swipeable Bottom Sheet (`max-h-[85vh] rounded-t-2xl bg-[#0B0D13] border-t border-[#FF2A85]/30`).

### 7.1 BESS Drawer: BMS Rack & Cell Thermal Matrix
- Circular State of Charge & State of Health gauge
- Cell Max / Min voltage delta indicator:
  ```tsx
  <div className="p-3 rounded-lg bg-[#121622] border border-white/[0.06] flex items-center justify-between">
    <div>
      <div className="text-[10px] text-slate-400 uppercase font-semibold">Cell Delta-V</div>
      <div className="text-base font-bold font-mono text-[#00F0FF]">18 mV</div>
    </div>
    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676]">
      BALANCED (&lt;50mV)
    </span>
  </div>
  ```
- **Cell Thermal Heatmap Matrix**: 16-cell interactive grid displaying live temperatures with color gradations from normal cyan ($24^\circ C$) to warning yellow ($38^\circ C$) to critical alarm pink ($>45^\circ C$).

### 7.2 Solar Drawer: MPPT String Current Matrix
- Inverter status, DC/AC efficiency percentage ($\eta$).
- 12-channel MPPT string current table. Strings with $<85\%$ current compared to string group median automatically display an **Amber Soiling/Fuse warning badge**.

---

## 8. Screen 3: Power Consumption & Analytics UI

### 8.1 Stacked Area Energy Balance Chart
Uses Recharts / Visx styled for the Black Neon theme:
- Canvas background: Transparent inside an obsidian card.
- Grid lines: `stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3"`
- Data Series:
  - Solar: `#FFD600` with gradient fill `rgba(255, 214, 0, 0.25)` to `transparent`
  - BESS Discharge: `#00F0FF` with gradient fill `rgba(0, 240, 255, 0.25)` to `transparent`
  - Facility Load: `#FF2A85` line overlay (`strokeWidth={2.5}`)
  - Grid Import: `#9D4EDD` with subtle hatch/area fill
- Tooltip: Custom dark glass tooltip (`bg-[#121622]/95 border border-[#FF2A85]/30 text-xs font-mono`).

---

## 9. Screen 4: Maintenance Scheduling Hub (Solar & BESS Only)

### 9.1 Service Catalog Cards

```tsx
<div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-[#FF2A85]/50 transition-all p-5 flex flex-col justify-between">
  <div>
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 uppercase">
        BESS Specialized
      </span>
      <span className="text-lg font-black font-mono text-white">$1,250</span>
    </div>
    
    <h3 className="text-base font-bold text-white">Liquid Chiller Coolant Flush & Refill</h3>
    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
      Full drain, pressure flush, dielectric coolant refill, and pump flow rate calibration to prevent BESS thermal derating.
    </p>

    {/* Deliverables Checklist */}
    <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
      <li className="flex items-center gap-2">
        <CheckCircle2 className="size-3.5 text-[#00E676]" /> 50L Dielectric Coolant Replacement
      </li>
      <li className="flex items-center gap-2">
        <CheckCircle2 className="size-3.5 text-[#00E676]" /> Loop Pressure & Leak Test
      </li>
      <li className="flex items-center gap-2">
        <CheckCircle2 className="size-3.5 text-[#00E676]" /> Certified Signed Digital Report
      </li>
    </ul>
  </div>

  <button
    onClick={() => openBookingModal(service.id)}
    className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,42,133,0.4)] cursor-pointer"
  >
    Book Service Window
  </button>
</div>
```

### 9.2 4-Step Booking Modal Stepper
Renders a cyber modal with glowing step indicator:
- Step 1: `Site & Asset Selection` (Solar PV Array vs BESS Container)
- Step 2: `Service Package & Fault Diagnostics` (Pre-selects packages based on active alarms)
- Step 3: `Date & Arrival Window` (Interactive calendar with available certified technician slots)
- Step 4: `Review & Payment` (Direct credit card via Stripe Elements, or debit from prepaid maintenance balance)

---

## 10. Buttons, Badges, Inputs & Micro-Interactions

### 10.1 Button Styles
- **Primary Brand CTA**:
  ```tsx
  <button className="px-4 py-2 rounded-lg bg-[#FF2A85] hover:bg-[#ff1475] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,42,133,0.4)] active:scale-[0.98] cursor-pointer">
    Action Label
  </button>
  ```
- **Secondary Glass Button**:
  ```tsx
  <button className="px-4 py-2 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-200 hover:text-white border border-white/[0.08] hover:border-white/[0.2] font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer">
    Secondary Action
  </button>
  ```
- **Destructive / E-Stop Button**:
  ```tsx
  <button className="px-4 py-2 rounded-lg bg-[#FF1744]/10 hover:bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/30 hover:border-[#FF1744] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(255,23,68,0.3)]">
    Emergency Trip / Acknowledge
  </button>
  ```

### 10.2 Input & Form Controls
All inputs, dropdowns, and search bars adhere to the dark obsidian theme:
```tsx
<input
  type="text"
  placeholder="Search sites, inverters, alarms..."
  className="w-full bg-[#0B0D13] border border-white/[0.1] focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85] rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono transition-all outline-none"
/>
```
