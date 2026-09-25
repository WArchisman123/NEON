import {
  SiteWeatherForecast,
  WeatherCurrent,
  WeatherDailyForecast,
  WeatherHourlyPoint,
  BessAutomationDirective,
} from "@/lib/energy/types";

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Bakersfield: { lat: 35.3733, lng: -119.0187 },
  Barstow: { lat: 34.8958, lng: -117.0173 },
  Fresno: { lat: 36.7468, lng: -119.7726 },
  Truckee: { lat: 39.328, lng: -120.1833 },
  Coachella: { lat: 33.6803, lng: -116.1739 },
  Eureka: { lat: 40.8021, lng: -124.1637 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Gurugram: { lat: 28.4595, lng: 77.0266 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
};

export function decodeWmoWeatherCode(code: number): {
  description: string;
  icon: string;
} {
  switch (code) {
    case 0:
      return { description: "Clear Sky", icon: "sun" };
    case 1:
      return { description: "Mainly Clear", icon: "sun" };
    case 2:
      return { description: "Partly Cloudy", icon: "cloud-sun" };
    case 3:
      return { description: "Overcast", icon: "cloud" };
    case 45:
    case 48:
      return { description: "Foggy / Mist", icon: "cloud-fog" };
    case 51:
    case 53:
    case 55:
      return { description: "Light Drizzle", icon: "cloud-rain" };
    case 61:
      return { description: "Slight Rain", icon: "cloud-rain" };
    case 63:
      return { description: "Moderate Rain", icon: "cloud-rain" };
    case 65:
      return { description: "Heavy Rain", icon: "cloud-rain" };
    case 71:
    case 73:
    case 75:
      return { description: "Snowfall", icon: "snowflake" };
    case 80:
    case 81:
    case 82:
      return { description: "Rain Showers", icon: "cloud-rain" };
    case 95:
    case 96:
    case 99:
      return { description: "Thunderstorm", icon: "cloud-lightning" };
    default:
      return { description: "Partly Sunny", icon: "cloud-sun" };
  }
}

interface OpenMeteoApiResponse {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    cloud_cover: number;
    wind_speed_10m: number;
    precipitation?: number;
    is_day: number;
    weather_code: number;
    shortwave_radiation?: number;
    direct_radiation?: number;
    diffuse_radiation?: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max?: number[];
    shortwave_radiation_sum?: number[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    cloud_cover: number[];
    shortwave_radiation: number[];
    precipitation_probability?: number[];
    direct_normal_irradiance?: number[];
  };
}

export async function fetchSiteWeatherForecast(params: {
  siteId: string;
  locationCity: string;
  locationState: string;
  solarCapacityKwp: number;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<SiteWeatherForecast> {
  const { siteId, locationCity, locationState, solarCapacityKwp } = params;

  let lat = params.latitude;
  let lng = params.longitude;

  // Resolve coordinates from fallback map if missing
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    const matchedCity = Object.keys(CITY_COORDINATES).find(
      (c) =>
        locationCity.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(locationCity.toLowerCase())
    );
    if (matchedCity) {
      lat = CITY_COORDINATES[matchedCity].lat;
      lng = CITY_COORDINATES[matchedCity].lng;
    } else {
      lat = 19.9975;
      lng = 73.7898;
    }
  }

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,direct_radiation,diffuse_radiation,shortwave_radiation&hourly=temperature_2m,precipitation_probability,cloud_cover,shortwave_radiation,direct_normal_irradiance&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,shortwave_radiation_sum&forecast_days=5&timezone=auto`;

  let json: OpenMeteoApiResponse | null = null;

  try {
    const res = await fetch(apiUrl, {
      next: { revalidate: 900 }, // 15-minute cache
    });

    if (res.ok) {
      json = (await res.json()) as OpenMeteoApiResponse;
    }
  } catch (err) {
    console.error("Failed to fetch weather from Open-Meteo:", err);
  }

  // Fallback data in case of network issue
  if (!json || !json.current) {
    return generateFallbackWeather({
      siteId,
      locationCity,
      locationState,
      solarCapacityKwp,
      lat,
      lng,
    });
  }

  const cur = json.current;
  const weatherMeta = decodeWmoWeatherCode(cur.weather_code);

  const current: WeatherCurrent = {
    temperatureC: Math.round(cur.temperature_2m * 10) / 10,
    apparentTemperatureC: Math.round(cur.apparent_temperature * 10) / 10,
    humidityPct: cur.relative_humidity_2m,
    cloudCoverPct: cur.cloud_cover,
    windSpeedKmh: Math.round(cur.wind_speed_10m * 10) / 10,
    precipitationMm: cur.precipitation || 0,
    isDay: cur.is_day === 1,
    weatherCode: cur.weather_code,
    weatherDescription: weatherMeta.description,
    weatherIcon: weatherMeta.icon,
    solarIrradianceWm2: Math.round(cur.shortwave_radiation || 0),
    directNormalIrradianceWm2: Math.round(cur.direct_radiation || 0),
    diffuseIrradianceWm2: Math.round(cur.diffuse_radiation || 0),
  };

  // Process 5-day daily forecast
  const daily: WeatherDailyForecast[] = [];
  if (json.daily && json.daily.time) {
    const d = json.daily;
    for (let i = 0; i < Math.min(5, d.time.length); i++) {
      const code = d.weather_code[i];
      const meta = decodeWmoWeatherCode(code);
      const radSum = d.shortwave_radiation_sum ? d.shortwave_radiation_sum[i] || 18 : 18;
      // Formula: Capacity (kWp) * (radSum MJ/m² / 3.6 kWh/m²) * PR (0.82)
      const estYield = Math.round(solarCapacityKwp * (radSum / 3.6) * 0.82);

      daily.push({
        date: d.time[i],
        weatherCode: code,
        weatherDescription: meta.description,
        weatherIcon: meta.icon,
        tempMaxC: Math.round(d.temperature_2m_max[i]),
        tempMinC: Math.round(d.temperature_2m_min[i]),
        sunrise: d.sunrise[i]?.split("T")[1]?.slice(0, 5) || "06:15",
        sunset: d.sunset[i]?.split("T")[1]?.slice(0, 5) || "18:45",
        uvIndexMax: d.uv_index_max ? Math.round(d.uv_index_max[i] * 10) / 10 : 7.5,
        solarRadiationSumMjM2: Math.round(radSum * 10) / 10,
        estimatedSolarYieldKwh: estYield,
      });
    }
  }

  // Process 24-hour hourly profile
  const hourly: WeatherHourlyPoint[] = [];
  if (json.hourly && json.hourly.time) {
    const h = json.hourly;
    // Extract next 24 hours from current index or first 24
    const count = Math.min(24, h.time.length);
    for (let i = 0; i < count; i++) {
      hourly.push({
        time: h.time[i],
        temperatureC: Math.round(h.temperature_2m[i]),
        cloudCoverPct: h.cloud_cover[i] || 0,
        solarIrradianceWm2: Math.round(h.shortwave_radiation[i] || 0),
        precipitationProbability: h.precipitation_probability ? h.precipitation_probability[i] || 0 : 0,
      });
    }
  }

  // Solar & Module Thermal Derating calculations
  const ambientC = current.temperatureC;
  const irradiance = current.solarIrradianceWm2;
  // Estimated cell module temp: Tamb + (Irradiance / 800) * 25°C
  const moduleTempEstimatedC = Math.round(ambientC + (irradiance / 800) * 25);
  // Thermal derating above 25°C: -0.38% / °C
  const thermalDeratingPct =
    moduleTempEstimatedC > 25
      ? parseFloat(((moduleTempEstimatedC - 25) * 0.38).toFixed(1))
      : 0;

  const cloudDeratingPct = Math.round(current.cloudCoverPct * 0.65);

  const todayEstYield = daily[0]?.estimatedSolarYieldKwh || Math.round(solarCapacityKwp * 4.6);
  const tomorrowEstYield = daily[1]?.estimatedSolarYieldKwh || Math.round(solarCapacityKwp * 4.8);

  const irradianceCondition: "optimal" | "moderate" | "low" | "night" =
    !current.isDay || irradiance < 50
      ? "night"
      : irradiance > 650
      ? "optimal"
      : irradiance > 300
      ? "moderate"
      : "low";

  // BESS Automation Directive Decision Engine
  const bessAutomation = calculateBessDirective({
    current,
    daily,
    cloudDeratingPct,
    thermalDeratingPct,
  });

  return {
    siteId,
    latitude: lat,
    longitude: lng,
    locationCity,
    locationState,
    current,
    daily,
    hourly,
    solarForecast: {
      todayEstimatedYieldKwh: todayEstYield,
      tomorrowEstimatedYieldKwh: tomorrowEstYield,
      solarCapacityKwp,
      moduleTempEstimatedC,
      thermalDeratingPct,
      cloudDeratingPct,
      irradianceCondition,
    },
    bessAutomation,
    lastUpdated: new Date().toISOString(),
  };
}

function calculateBessDirective(params: {
  current: WeatherCurrent;
  daily: WeatherDailyForecast[];
  cloudDeratingPct: number;
  thermalDeratingPct: number;
}): BessAutomationDirective {
  const { current, daily, cloudDeratingPct, thermalDeratingPct } = params;
  const sunrise = daily[0]?.sunrise || "06:15";
  const sunset = daily[0]?.sunset || "18:45";

  if (current.cloudCoverPct >= 65 || cloudDeratingPct >= 40 || current.precipitationMm > 0.5) {
    return {
      status: "peak_preservation",
      title: "CLOUD DERATING SHIELD ENGAGED",
      recommendation: `High cloud cover (${current.cloudCoverPct}%, estimated -${cloudDeratingPct}% yield) & precipitation risk detected. Throttling daytime battery cycling to reserve capacity for the 18:00 evening peak demand tariff slot.`,
      chargeWindow: "11:00 — 13:30 (Solar Surplus Only)",
      dischargeWindow: "18:00 — 21:30 (Evening Peak Shave)",
      priority: "high",
      cloudCoverWarning: true,
      temperatureDeratingPct: thermalDeratingPct,
    };
  }

  if (current.solarIrradianceWm2 > 500 && current.cloudCoverPct < 35) {
    return {
      status: "solar_precharge",
      title: "PEAK SOLAR PRE-CHARGE PROTOCOL ACTIVE",
      recommendation: `Optimal clear-sky irradiance (${current.solarIrradianceWm2} W/m²). Prioritizing BESS DC charge from surplus solar PV to 95% SoC before 14:30. Evening discharge scheduled at 18:00.`,
      chargeWindow: "10:00 — 14:30 (Max Charge Rate)",
      dischargeWindow: "18:00 — 22:00 (Contracted MD Shave)",
      priority: "high",
      cloudCoverWarning: false,
      temperatureDeratingPct: thermalDeratingPct,
    };
  }

  return {
    status: "grid_feed_arbitrage",
    title: "STANDARD DIURNAL ARBITRAGE ACTIVE",
    recommendation: `Stable atmospheric conditions (${current.weatherDescription}, ${current.temperatureC}°C). Standard self-consumption balance active with sunrise at ${sunrise} and sunset at ${sunset}.`,
    chargeWindow: "09:30 — 14:30",
    dischargeWindow: "18:00 — 22:00",
    priority: "normal",
    cloudCoverWarning: false,
    temperatureDeratingPct: thermalDeratingPct,
  };
}

function generateFallbackWeather(params: {
  siteId: string;
  locationCity: string;
  locationState: string;
  solarCapacityKwp: number;
  lat: number;
  lng: number;
}): SiteWeatherForecast {
  const { siteId, locationCity, locationState, solarCapacityKwp, lat, lng } = params;

  const current: WeatherCurrent = {
    temperatureC: 28.5,
    apparentTemperatureC: 29.8,
    humidityPct: 48,
    cloudCoverPct: 15,
    windSpeedKmh: 14.2,
    precipitationMm: 0,
    isDay: true,
    weatherCode: 1,
    weatherDescription: "Mainly Clear",
    weatherIcon: "sun",
    solarIrradianceWm2: 840,
    directNormalIrradianceWm2: 720,
    diffuseIrradianceWm2: 120,
  };

  const todayEstYield = Math.round(solarCapacityKwp * 4.8);
  const tomorrowEstYield = Math.round(solarCapacityKwp * 4.9);

  return {
    siteId,
    latitude: lat,
    longitude: lng,
    locationCity,
    locationState,
    current,
    daily: [
      {
        date: new Date().toISOString().split("T")[0],
        weatherCode: 1,
        weatherDescription: "Mainly Clear",
        weatherIcon: "sun",
        tempMaxC: 32,
        tempMinC: 18,
        sunrise: "06:12",
        sunset: "18:48",
        uvIndexMax: 8.2,
        solarRadiationSumMjM2: 23.4,
        estimatedSolarYieldKwh: todayEstYield,
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        weatherCode: 0,
        weatherDescription: "Clear Sky",
        weatherIcon: "sun",
        tempMaxC: 33,
        tempMinC: 19,
        sunrise: "06:13",
        sunset: "18:47",
        uvIndexMax: 8.5,
        solarRadiationSumMjM2: 24.1,
        estimatedSolarYieldKwh: tomorrowEstYield,
      },
    ],
    hourly: [],
    solarForecast: {
      todayEstimatedYieldKwh: todayEstYield,
      tomorrowEstimatedYieldKwh: tomorrowEstYield,
      solarCapacityKwp,
      moduleTempEstimatedC: 48,
      thermalDeratingPct: 3.8,
      cloudDeratingPct: 10,
      irradianceCondition: "optimal",
    },
    bessAutomation: {
      status: "solar_precharge",
      title: "PEAK SOLAR PRE-CHARGE PROTOCOL ACTIVE",
      recommendation:
        "Optimal clear-sky irradiance (840 W/m²). Prioritizing BESS DC charge from surplus solar PV to 95% SoC before 14:30. Evening discharge scheduled at 18:00.",
      chargeWindow: "10:00 — 14:30 (Max Charge Rate)",
      dischargeWindow: "18:00 — 22:00 (Contracted MD Shave)",
      priority: "high",
      cloudCoverWarning: false,
      temperatureDeratingPct: 3.8,
    },
    lastUpdated: new Date().toISOString(),
  };
}
