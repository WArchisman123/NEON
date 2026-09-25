# Implementation Prompt: Weather Forecast Integration for Site Details and Solar PV Page

## Goal
Integrate live weather and solar meteorological forecasting into both the **Site Details screen** (`/sites/[id]`) and the **Solar PV deep-dive screen** (`/sites/[id]/solar`). The weather data will be dynamically fetched on the basis of each site's `latitude` and `longitude` coordinates using the free, open **Open-Meteo Weather & Solar Radiation API** (zero API keys required, industrial-grade solar irradiance and thermal data). The meteorological telemetry will power **Solar Generation Forecasting** (irradiance, cloud cover derating, temperature coefficients) and **BESS Automation Recommendations** (optimal solar charging windows and evening peak shaving dispatch).

---

## Relevant Agent Skills
- `.agents/skills/shadcn/`: UI component composition, accessible cards, popovers, badges, and layout primitives.
- `AGENTS.md`: Mandatory Cyber Black / Neon Pink design tokens (`#060709` Void Black canvas, `#0B0D13` Obsidian cards, `#121622` elevated glass, `#FF2A85` Neon Pink accents, `#FFD600` Solar Amber, `#00F0FF` Laser Cyan, `font-mono` metrics, $\ge 48 \times 48\text{ px}$ mobile touch ergonomics).
- `public/context/doc.md` (Section 4 & Section 7): Telemetry specifications on POA irradiance ($W/m^2$), module temperature ($^\circ\text{C}$), PR %, and automated BESS peak-shaving dispatch.
- `public/context/ui_doc.md` (Section 8): Control room high-contrast legibility rules and telemetry card composition.

---

## Existing Code Inspected
1. **Database Schema & Coordinates**:
   - `lib/energy/types.ts`: `SiteRecord` interface currently lacks explicit `latitude` and `longitude` typings.
   - `lib/energy/site-service.ts`:
     - Lines 405–424 (`getSitesForOrg`): SQL query does not select `s.latitude, s.longitude`.
     - Lines 435–475 (`getSiteDetails`): SQL query does not select `s.latitude, s.longitude`.
     - Lines 612–626 (`createSite`): Already supports inserting `latitude` and `longitude` into `public.sites`.
     - Database inspection reveals `public.sites` has `latitude` and `longitude` columns, with `Sahyadri Agro Solar Microgrid` already possessing `(19.9975, 73.7898)`, while older demo sites have `null` coordinates but known cities (`Bakersfield`, `Barstow`, `Fresno`, `Truckee`, `Coachella`, `Eureka`, `Nashik`).
2. **Site Details Screen**:
   - `app/sites/[id]/page.tsx`: Loads site data and renders `SiteDetailView`.
   - `components/site-detail/site-detail-view.tsx`:
     - Top header (Lines 140–210) and Live Telemetry KPI Strip (Lines 212–260).
     - Flow & Topology Tab (Lines 310–415).
3. **Solar PV Deep-Dive Screen**:
   - `app/sites/[id]/solar/page.tsx`:
     - Key Metric Strip (Lines 125–196): Displays static POA Irradiance (`885 W/m²`) and Module Temp (`48.2°C`).
     - `SolarPerformanceChart` (Lines 198–203): Renders theoretical vs actual generation.
     - Recommended action card (Lines 413–420).

---

## Decisions or Assumptions
1. **Weather Data Provider**:
   - Use the **Open-Meteo Weather & Solar Radiation API** (`https://api.open-meteo.com/v1/forecast`):
     - Completely free, open-access, zero API keys required, zero vendor lock-in.
     - Provides precise global solar irradiance metrics: `shortwave_radiation` ($W/m^2$), `direct_radiation`, `diffuse_radiation`, `direct_normal_irradiance` (DNI).
     - Provides thermal metrics: `temperature_2m` ($^\circ\text{C}$), `apparent_temperature`, `relative_humidity_2m` (%).
     - Provides operational parameters: `cloud_cover` (%), `precipitation` ($mm$), `wind_speed_10m` ($km/h$), `weather_code` (WMO weather conditions).
     - Daily outputs: `sunrise`, `sunset`, `temperature_2m_max`, `temperature_2m_min`, `shortwave_radiation_sum` ($MJ/m^2$).
     - Hourly forecast for the next 48 hours for generation curves.
2. **Coordinate Resolution & Fallbacks**:
   - Ensure `getSiteDetails` and `getSitesForOrg` select `s.latitude` and `s.longitude`.
   - Populate missing coordinates in `public.sites` for the 7 demo cities via an automated migration script.
   - Maintain a client/server fallback coordinate map (`CITY_COORDINATES`) based on `location_city` and `location_state` so weather never fails even if a new site lacks coordinates.
3. **API & Caching Strategy**:
   - Create route handler `app/api/v1/sites/[id]/weather/route.ts` with 15-minute Next.js caching (`revalidate: 900`).
   - Server-side data processing converts meteorological data into:
     - **Solar Forecast**: Estimated generation yield based on irradiance ($W/m^2$) and site capacity ($kWp$).
     - **Thermal Derating**: Module temperature coefficient loss (standard $-0.38\% / ^\circ\text{C}$ above $25^\circ\text{C}$).
     - **BESS Automation Dispatch**: Determines peak solar charge window (e.g. 10:00–14:30) and evening peak discharge window (18:00–22:00) with dynamic alert messages.
4. **UI Presentation & Components**:
   - **Site Details (`SiteWeatherWidget`)**: A sleek Cyber Obsidian card (`#0B0D13`) on `/sites/[id]` showing current weather condition, ambient temp, live GHI irradiance, sunrise/sunset, 5-day weather chips, and an automated **BESS Smart Dispatch Recommendation** banner.
   - **Solar PV Page (`SolarWeatherForecastCard`)**: An enhanced analytical card on `/sites/[id]/solar` showing real-time solar irradiance, cloud cover derating, wind cooling factor, thermal derating, and day-ahead forecast yield.

---

## Files Likely to Change
1. `lib/energy/types.ts`: Add `latitude?: number | null; longitude?: number | null;` to `SiteRecord`. Define `SiteWeatherForecast` data interfaces.
2. `lib/energy/site-service.ts`: Select `s.latitude, s.longitude` in `getSitesForOrg` and `getSiteDetails`.
3. `scripts/populate-site-coordinates.js` *(New Script)*: Database migration to populate lat/lng coordinates for existing demo sites in Postgres.
4. `lib/weather/open-meteo.ts` *(New File)*: Open-Meteo client, solar irradiance calculation, and BESS automation rules.
5. `app/api/v1/sites/[id]/weather/route.ts` *(New Route)*: API endpoint delivering cached, structured weather & solar intelligence for any site.
6. `components/weather/site-weather-widget.tsx` *(New File)*: Live weather card + 5-day forecast + BESS automation recommendation for the Site Details page.
7. `components/weather/solar-weather-forecast-card.tsx` *(New File)*: Dedicated solar meteorological forecast & thermal derating widget for `/sites/[id]/solar`.
8. `components/site-detail/site-detail-view.tsx`: Integrate `SiteWeatherWidget` into the Overview/Flow tab.
9. `app/sites/[id]/solar/page.tsx`: Replace static irradiance metrics with live `SolarWeatherForecastCard`.

---

## Implementation Requirements

### 1. Coordinates & Database Layer
- Ensure `SiteRecord` has `latitude` and `longitude`.
- Update queries in `lib/energy/site-service.ts` to include `s.latitude` and `s.longitude`.
- Execute a one-time SQL update for known demo cities:
  - Bakersfield, CA: `(35.3733, -119.0187)`
  - Barstow, CA: `(34.8958, -117.0173)`
  - Fresno, CA: `(36.7468, -119.7726)`
  - Truckee, CA: `(39.3280, -120.1833)`
  - Coachella, CA: `(33.6803, -116.1739)`
  - Eureka, CA: `(40.8021, -124.1637)`
  - Nashik, Maharashtra: `(19.9975, 73.7898)`

### 2. Meteorological & Energy Engine (`lib/weather/open-meteo.ts`)
- Fetch from `https://api.open-meteo.com/v1/forecast`:
  - `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,direct_radiation,diffuse_radiation,shortwave_radiation`
  - `hourly=temperature_2m,precipitation_probability,cloud_cover,shortwave_radiation,direct_normal_irradiance`
  - `daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,shortwave_radiation_sum`
  - `forecast_days=5&timezone=auto`
- WMO Weather Code Decoder: Maps codes $0\dots 99$ to readable descriptions (Clear Sky, Partly Cloudy, Overcast, Rain, Thunderstorm) and Lucide icon types.
- Solar PV Forecast Model:
  $$\text{Expected Solar Yield (kWh)} = \text{Capacity (kWp)} \times \left( \frac{\text{Solar Radiation Sum } (MJ/m^2)}{3.6} \right) \times \text{PR (0.82)}$$
- Module Thermal Derating:
  $$\text{Derating \%} = \max(0, (\text{Ambient Temp} + 25 - 25) \times 0.38\%)$$
- BESS Automation Intelligence:
  - Identifies peak irradiance hours $\implies$ triggers **"Solar Pre-Charge Protocol"**.
  - Identifies afternoon cloud cover or rain $\implies$ triggers **"Grid Arbitrage Peak Preservation"**.
  - Confirms scheduled evening discharge window ($18:00 - 22:00$).

### 3. Weather API Route (`/api/v1/sites/[id]/weather`)
- Scoped to Clerk org authentication.
- Retrieves site coordinates.
- Returns structured JSON payload with current weather, hourly forecast, daily forecast, solar predictions, and BESS automation directives.

### 4. Site Details Weather Widget (`SiteWeatherWidget`)
- Positioned in `components/site-detail/site-detail-view.tsx` right below or beside the Live Telemetry strip.
- Shows:
  - Weather icon, current temperature ($^\circ\text{C}$), condition string, feels-like temperature.
  - Solar Irradiance ($W/m^2$) gauge with progress ring / bar.
  - Cloud cover % & Wind speed ($km/h$).
  - Sunrise and sunset times with daylight countdown.
  - **Glowing BESS Automation Card**: Displays dynamic recommendation for BESS dispatch.
  - 5-Day forecast horizontal strip with temperature range and condition icon.

### 5. Solar PV Weather & Forecasting Widget (`SolarWeatherForecastCard`)
- Positioned in `app/sites/[id]/solar/page.tsx`.
- Connects live weather metrics to:
  - Real-time GHI & POA Irradiance ($W/m^2$).
  - Thermal Derating loss bar (ambient vs module temp).
  - Clean sky vs weather-adjusted day-ahead generation projection.
  - Natural rain washing / dust accumulation indicator.

---

## Design System & Visual Adherence
- **Color Tokens**: Void Black (`#060709`), Obsidian (`#0B0D13`), Elevated Cyber Glass (`#121622`), Brand Neon Pink (`#FF2A85`), Electric Amber (`#FFD600` for Solar), Laser Cyan (`#00F0FF` for BESS), Cyber Emerald (`#00E676`).
- **Typography**: All temperatures, irradiances ($W/m^2$), percentages, wind speeds, and times strictly use `font-mono`.
- **Mobile Ergonomics**: Touch-friendly cards and horizontal swipeable forecast strips satisfying minimum $48 \times 48\text{ px}$ touch targets.

---

## Security & RBAC Requirements
- Organization multi-tenancy preserved: weather route resolves effective Clerk organization and validates site ownership.
- Zero client exposure of sensitive server infrastructure.

---

## Acceptance Criteria
- [ ] Both `/sites/[id]` and `/sites/[id]/solar` fetch and display live weather and solar forecast data based on site `latitude` and `longitude`.
- [ ] Fallback coordinate dictionary guarantees resilient weather loading even if a site lacks DB coordinates.
- [ ] Accurate solar irradiance ($W/m^2$), cloud cover (%), ambient temperature ($^\circ\text{C}$), and sunrise/sunset times are displayed.
- [ ] BESS Automation advice dynamically reflects current and forecasted meteorological conditions.
- [ ] Solar generation forecasting calculates estimated daily kWh yield based on solar radiation sum.
- [ ] Both desktop ($1440 \times 900$) and mobile ($390 \times 844$) layouts render cleanly without overflow.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npx tsc --noEmit` passes with 0 errors.

---

## Checks to Run
1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

---

## Exact Manual Test Steps (Desktop & Mobile)
1. **Desktop ($1440 \times 900$)**:
   - Navigate to `/sites/1bb41316-d9a3-415a-968e-15dffa5b71f0` (or click any site card from the fleet cockpit).
   - Verify the new **Site Weather & Meteorological Telemetry** card displays:
     - Current weather condition, temperature ($^\circ\text{C}$), irradiance ($W/m^2$), and cloud cover (%).
     - Sunrise and sunset times.
     - Glowing **BESS Smart Dispatch Automation** banner.
     - 5-Day forecast cards with weather icons and temperature spreads.
   - Click the **Solar Hub ➔** button to open `/sites/[id]/solar`.
   - Verify the **Solar Weather & Generation Forecast** card shows live POA irradiance, module thermal derating, and day-ahead yield projection.
2. **Mobile ($390 \times 844$)**:
   - In Chrome DevTools mobile view, visit `/sites/[id]`.
   - Check that the weather card reflows into a single responsive column with touch-scrollable 5-day forecast chips and $\ge 48\text{px}$ touch targets.
   - Visit `/sites/[id]/solar` and verify the solar forecasting cards scale cleanly.
