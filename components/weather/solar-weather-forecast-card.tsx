"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Wind,
  Thermometer,
  Sparkles,
  MapPin,
  RefreshCw,
  Gauge,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { SiteRecord, SiteWeatherForecast } from "@/lib/energy/types";

interface SolarWeatherForecastCardProps {
  site: SiteRecord;
  initialWeather?: SiteWeatherForecast | null;
}

export function SolarWeatherForecastCard({
  site,
  initialWeather,
}: SolarWeatherForecastCardProps) {
  const [weather, setWeather] = useState<SiteWeatherForecast | null>(
    initialWeather || null
  );
  const [loading, setLoading] = useState<boolean>(!initialWeather);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadWeather = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`/api/v1/sites/${site.id}/weather`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setWeather(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to load solar weather forecast:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      try {
        const res = await fetch(`/api/v1/sites/${site.id}/weather`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data) {
            setWeather(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load solar weather forecast:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!weather) {
      fetchInitial();
    }
    return () => {
      isMounted = false;
    };
  }, [site.id, weather]);

  const renderWeatherIcon = (iconName: string, className = "size-5") => {
    switch (iconName) {
      case "sun":
        return <Sun className={`${className} text-[#FFD600] animate-pulse`} />;
      case "cloud-sun":
        return <CloudSun className={`${className} text-[#FFD600]`} />;
      case "cloud":
        return <Cloud className={`${className} text-slate-300`} />;
      case "cloud-rain":
        return <CloudRain className={`${className} text-[#00F0FF]`} />;
      case "cloud-lightning":
        return <CloudLightning className={`${className} text-[#FF2A85]`} />;
      case "cloud-fog":
        return <CloudFog className={`${className} text-slate-400`} />;
      case "snowflake":
        return <Snowflake className={`${className} text-[#00F0FF]`} />;
      default:
        return <Sun className={`${className} text-[#FFD600]`} />;
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-5 space-y-4 animate-pulse font-mono">
        <div className="h-5 w-60 bg-white/10 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[#121622] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { current, daily, solarForecast } = weather;

  const hasRecentRain = current.precipitationMm > 0.5;

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-[#FFD600]/30 p-4 sm:p-6 space-y-5 shadow-[0_0_25px_rgba(255,214,0,0.08)] relative overflow-hidden font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="size-4 text-[#FFD600]" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-white">
              Meteorological Irradiance &amp; Solar PV Forecast Model
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-[#FF2A85]" />
              {weather.locationCity}, {weather.locationState} (
              {weather.latitude ? `${weather.latitude.toFixed(2)}°N` : ""},{" "}
              {weather.longitude ? `${weather.longitude.toFixed(2)}°E` : ""})
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[#00E676] font-bold">
              Open-Meteo High-Resolution Solar Radiation
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadWeather(true)}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-300 hover:text-white border border-white/[0.08] text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`size-3 text-[#FFD600] ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          <span>Refresh Forecast</span>
        </button>
      </div>

      {/* Primary Meteorological Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Global Horizontal Irradiance */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>POA / GHI Irradiance</span>
            <Gauge className="size-4 text-[#FFD600]" />
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-[#FFD600]">
              {current.solarIrradianceWm2}{" "}
              <span className="text-xs font-normal text-slate-400">W/m²</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Direct: {current.directNormalIrradianceWm2} W/m² • Diffuse:{" "}
              {current.diffuseIrradianceWm2} W/m²
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Solar Constant Benchmark</span>
            <span className="text-[#00E676] font-bold">
              {current.isDay ? "DAYLIGHT ACTIVE" : "NIGHTTIME STANDBY"}
            </span>
          </div>
        </div>

        {/* 2. PV Module Thermal Derating */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Module Temperature</span>
            <Thermometer className="size-4 text-[#FF6B00]" />
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-white">
              {solarForecast.moduleTempEstimatedC}°C
            </div>
            <div className="text-[11px] text-[#FF6B00] font-bold mt-0.5">
              Derating Loss: -{solarForecast.thermalDeratingPct}%
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Ambient: {current.temperatureC}°C</span>
            <span>NOCT Coeff: -0.38%/°C</span>
          </div>
        </div>

        {/* 3. Cloud Cover & Radiation Sum */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Cloud &amp; Wind Factor</span>
            <Wind className="size-4 text-[#00F0FF]" />
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-white">
              {current.cloudCoverPct}%{" "}
              <span className="text-xs font-normal text-slate-400">Cover</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Wind Cooling: {current.windSpeedKmh} km/h
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Humidity: {current.humidityPct}%</span>
            <span className="text-[#FFD600]">
              UV: {daily[0]?.uvIndexMax || 8.0}
            </span>
          </div>
        </div>

        {/* 4. Day-Ahead Generation Forecast */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Yield Prediction</span>
            <Sparkles className="size-4 text-[#00E676]" />
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-[#00E676]">
              {solarForecast.todayEstimatedYieldKwh.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Tomorrow: {solarForecast.tomorrowEstimatedYieldKwh.toLocaleString()}{" "}
              kWh
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Array: {site.solar_capacity_kwp} kWp</span>
            <span>PR: 82.4% IEC</span>
          </div>
        </div>
      </div>

      {/* Atmospheric Insight & Soiling Recommendation Bar */}
      <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {hasRecentRain ? (
            <CheckCircle2 className="size-4 text-[#00E676]" />
          ) : (
            <AlertTriangle className="size-4 text-[#FFAB00]" />
          )}
          <div>
            <span className="text-white font-bold">
              {hasRecentRain
                ? "Natural Rainfall Wash Detected"
                : "Dry Atmospheric Conditions / Dust Accumulation Watch"}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {hasRecentRain
                ? `Recent rainfall (${current.precipitationMm} mm) has naturally washed dust from panel surfaces, restoring ~2.1% PR efficiency.`
                : `Dry atmospheric period with ${current.humidityPct}% humidity. Monitor MPPT string tables for dust clipping variances.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="px-2.5 py-1 rounded bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30 font-bold text-[11px]">
            {current.weatherDescription} ({current.temperatureC}°C)
          </span>
        </div>
      </div>

      {/* 5-Day Solar Yield Outlook */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
          <span>5-Day Yield &amp; Solar Radiation Horizon</span>
          <span className="text-[10px] text-slate-500">
            Based on Open-Meteo Global Horizontal Irradiance Sums
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {daily.map((d, idx) => {
            const dateObj = new Date(d.date);
            const dayName =
              idx === 0
                ? "Today"
                : idx === 1
                ? "Tomorrow"
                : dateObj.toLocaleDateString("en-US", { weekday: "short" });

            return (
              <div
                key={d.date}
                className="p-3 rounded-lg bg-[#121622] border border-white/[0.04] hover:border-[#FFD600]/40 transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {dayName}
                  </span>
                  {renderWeatherIcon(d.weatherIcon, "size-4")}
                </div>

                <div className="my-2">
                  <div className="text-sm font-black text-slate-200">
                    {d.tempMaxC}°{" "}
                    <span className="text-xs font-normal text-slate-400">
                      / {d.tempMinC}°C
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    Rad: {d.solarRadiationSumMjM2} MJ/m²
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04] text-[10px] flex items-center justify-between">
                  <span className="text-slate-400">Est. Yield</span>
                  <span className="text-[#00E676] font-bold">
                    {d.estimatedSolarYieldKwh.toLocaleString()} kWh
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
