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
  Droplets,
  Sunrise,
  Sunset,
  Zap,
  BatteryCharging,
  ShieldAlert,
  Sparkles,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { SiteRecord, SiteWeatherForecast } from "@/lib/energy/types";

interface SiteWeatherWidgetProps {
  site: SiteRecord;
  initialWeather?: SiteWeatherForecast | null;
}

export function SiteWeatherWidget({ site, initialWeather }: SiteWeatherWidgetProps) {
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
      console.error("Failed to load weather widget:", err);
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
        console.error("Failed to load weather widget:", err);
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
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-white/10 rounded" />
          <div className="h-4 w-28 bg-white/5 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#121622] rounded-lg" />
          ))}
        </div>
        <div className="h-20 bg-[#121622] rounded-lg" />
      </div>
    );
  }

  if (!weather) return null;

  const { current, daily, solarForecast, bessAutomation } = weather;

  const latDisplay = weather.latitude
    ? `${Math.abs(weather.latitude).toFixed(4)}°${weather.latitude >= 0 ? "N" : "S"}`
    : "";
  const lngDisplay = weather.longitude
    ? `${Math.abs(weather.longitude).toFixed(4)}°${weather.longitude >= 0 ? "E" : "W"}`
    : "";

  return (
    <div className="rounded-xl bg-[#0B0D13] border border-white/[0.08] p-4 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#FFD600]" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-white font-mono">
              Live Weather &amp; Solar-BESS Dispatch Intelligence
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-[#FF2A85]" />
              {weather.locationCity}, {weather.locationState}
            </span>
            {latDisplay && lngDisplay && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  {latDisplay}, {lngDisplay}
                </span>
              </>
            )}
            <span className="text-slate-600">•</span>
            <span className="text-[#00E676] flex items-center gap-1 font-bold">
              <span className="size-1.5 rounded-full bg-[#00E676] animate-ping" />
              Open-Meteo Synced
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadWeather(true)}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121622] hover:bg-[#1a2030] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-mono transition-colors disabled:opacity-50"
          title="Refresh meteorological telemetry"
        >
          <RefreshCw
            className={`size-3 text-[#00F0FF] ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4-Column Live Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* 1. Ambient Temp & Condition */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Atmospheric State</span>
            {renderWeatherIcon(current.weatherIcon, "size-4")}
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-white">
              {current.temperatureC}°C
            </div>
            <div className="text-xs font-semibold text-[#FFD600] mt-0.5">
              {current.weatherDescription}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-2">
            <span>Feels: {current.apparentTemperatureC}°C</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Wind className="size-2.5 text-slate-500" />
              {current.windSpeedKmh} km/h
            </span>
          </div>
        </div>

        {/* 2. Solar Irradiance (GHI & DNI) */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>GHI Irradiance</span>
            <Sun className="size-4 text-[#FFD600]" />
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-[#FFD600]">
              {current.solarIrradianceWm2}{" "}
              <span className="text-xs font-normal text-slate-400">W/m²</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 font-bold">
              Direct: {current.directNormalIrradianceWm2} W/m²
            </div>
          </div>
          <div className="text-[10px] text-slate-400">
            Diffuse: {current.diffuseIrradianceWm2} W/m²
          </div>
        </div>

        {/* 3. Cloud Cover & Thermal Derating */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Cloud &amp; Temp Loss</span>
            <Droplets className="size-4 text-[#00F0FF]" />
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-white">
              {current.cloudCoverPct}%{" "}
              <span className="text-xs font-normal text-slate-400">Cover</span>
            </div>
            <div className="text-[11px] font-bold text-[#FF6B00] mt-0.5">
              Module: ~{solarForecast.moduleTempEstimatedC}°C
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>Derate: -{solarForecast.thermalDeratingPct}%</span>
            <span>•</span>
            <span>Humidity: {current.humidityPct}%</span>
          </div>
        </div>

        {/* 4. Daylight Solar Dispatch Window */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Daylight Window</span>
            <Zap className="size-4 text-[#FF2A85]" />
          </div>
          <div className="my-1.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-200 font-bold">
              <span className="flex items-center gap-1 text-[#FFD600]">
                <Sunrise className="size-3.5" /> Sunrise
              </span>
              <span>{daily[0]?.sunrise || "06:15"}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-200 font-bold">
              <span className="flex items-center gap-1 text-[#FF6B00]">
                <Sunset className="size-3.5" /> Sunset
              </span>
              <span>{daily[0]?.sunset || "18:45"}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400">
            Est. Yield Today:{" "}
            <strong className="text-[#00E676]">
              {solarForecast.todayEstimatedYieldKwh.toLocaleString()} kWh
            </strong>
          </div>
        </div>
      </div>

      {/* BESS Automation Dispatch Directive */}
      <div
        className={`p-4 rounded-xl border font-mono transition-all ${
          bessAutomation.cloudCoverWarning
            ? "bg-[#FFAB00]/10 border-[#FFAB00]/40 shadow-[0_0_15px_rgba(255,171,0,0.15)]"
            : "bg-[#00F0FF]/10 border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {bessAutomation.cloudCoverWarning ? (
                <ShieldAlert className="size-4 text-[#FFAB00]" />
              ) : (
                <BatteryCharging className="size-4 text-[#00F0FF]" />
              )}
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  bessAutomation.cloudCoverWarning
                    ? "text-[#FFAB00]"
                    : "text-[#00F0FF]"
                }`}
              >
                ⚡ {bessAutomation.title}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {bessAutomation.recommendation}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-[11px] self-start md:self-auto shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-[#0B0D13]/80 border border-white/[0.08]">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">
                Solar Charge Slot
              </span>
              <span className="text-[#00F0FF] font-bold">
                {bessAutomation.chargeWindow}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#0B0D13]/80 border border-white/[0.08]">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">
                Peak Shave Slot
              </span>
              <span className="text-[#FF2A85] font-bold">
                {bessAutomation.dischargeWindow}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Outlook Horizontal Strip */}
      <div className="space-y-2 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
          <span>5-Day Solar Meteorological Forecast</span>
          <span className="text-[10px] text-slate-500">
            Yield Calculated at 82.4% System PR
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
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
                className="p-3 rounded-lg bg-[#121622] border border-white/[0.06] hover:border-white/[0.15] transition-colors flex flex-col justify-between"
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
                    {d.weatherDescription}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04] text-[10px] flex items-center justify-between">
                  <span className="text-slate-400">Est. Yield</span>
                  <span className="text-[#FFD600] font-bold">
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
