export interface SiteRecord {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  location_city: string;
  location_state: string;
  plant_type: string;
  status: "online" | "degraded" | "offline" | "maintenance";
  solar_capacity_kwp: number;
  bess_capacity_kwh: number;
  bess_power_kw: number;
  dg_capacity_kva: number;
  contracted_demand_kva: number;
  has_solar: boolean;
  has_bess: boolean;
  has_dg: boolean;
  has_grid: boolean;
  peak_tariff_rate: number;
  offpeak_tariff_rate: number;
  latitude?: number | null;
  longitude?: number | null;
  subscription_status?: "active" | "past_due" | "expired";
  created_at: string;
  // Joined snapshot fields
  solar_power_kw?: number;
  live_bess_power_kw?: number;
  grid_power_kw?: number;
  dg_power_kw?: number;
  load_power_kw?: number;
  bess_soc_pct?: number;
  bess_soh_pct?: number;
  dg_fuel_pct?: number;
  dg_running?: boolean;
  solar_yield_today_kwh?: number;
  load_consumption_today_kwh?: number;
  grid_import_today_kwh?: number;
  grid_export_today_kwh?: number;
  dg_yield_today_kwh?: number;
  bess_charge_today_kwh?: number;
  bess_discharge_today_kwh?: number;
  co2_saved_today_kg?: number;
  snapshot_time?: string;
  // Extended EPC, Contractual Target & Competitor-benchmark Telemetry Fields
  dc_capacity_kwp?: number;
  commissioned_by?: string;
  commissioned_date?: string;
  warranty_expiry_date?: string;
  annual_target_mwh?: number;
  annual_achieved_mwh?: number;
  feed_in_tariff_inr?: number;
  coal_saved_today_kg?: number;
  trees_planted_today?: number;
  cuf_pct?: number;
  specific_yield_kwh_per_kwp?: number;
  peak_irradiance_wm2?: number;
  peak_irradiance_time?: string;
  pv_dg_fuel_saved_liters?: number;
  pv_dg_fuel_saved_kwh?: number;
  // Edge Device Ingested Telemetry
  edge_telemetry?: EdgeDeviceTelemetry;
}

export interface EdgeDeviceTelemetry {
  "DayActive PowerWh": number;
  "DayReactive PowerWh": number;
  "Total_Active_PowerWh": number;
  "Total Reactive PowerWh": number;
  "Total Work time": number;
  "inverter efficiency": number;
  "Grid voltage AB": number;
  "Grid voltage BC": number;
  "Grid voltage AC": number;
  "Grid voltage A": number;
  "Grid current A": number;
  "Grid frequency": number;
  "Input active power": number;
  "output apparent power": number;
  "Output active power": number;
  "Output reactive power": number;
  "power factor": number;
  "historyPV PowerWh": number;
  "Day PV PowerWh": number;
  "Dc voltage 1": number;
  "Dc current 1": number;
  "Dc voltage 2": number;
  "Dc current 2": number;
  "Dc voltage 3": number;
  "Dc current 3": number;
  "Dc voltage 4": number;
  "Dc current 4": number;
  "Day Load Power Wh": number;
  "history Load Power": number;
  "Meter active power": number;
  "Day GridSell Power Wh": number;
  "history GridSell_Power": number;
  "Day GridBuy Power Wh": number;
  "history GridBuy Power": number;
}

export interface SiteDeviceRecord {
  id: string;
  site_id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serial_number: string | null;
  is_online: boolean;
}

export interface HourlyTelemetryRecord {
  id: number;
  site_id: string;
  bucket_timestamp: string;
  avg_solar_kw: number;
  solar_energy_kwh: number;
  avg_bess_kw: number;
  bess_charge_kwh: number;
  bess_discharge_kwh: number;
  end_bess_soc_pct: number;
  avg_load_kw: number;
  peak_load_kw: number;
  load_energy_kwh: number;
  grid_import_kwh: number;
  grid_export_kwh: number;
  dg_energy_kwh: number;
  estimated_cost_saved: number;
}

export interface UserRecord {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  clerk_org_id: string | null;
  current_org_id: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRecord {
  id: string;
  clerk_org_id: string;
  name: string;
  slug: string;
  tier: "starter" | "pro_commercial" | "utility_enterprise";
  status: "trialing" | "active" | "past_due" | "canceled";
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type TicketStatus =
  | "requested"
  | "quote_accepted"
  | "technician_assigned"
  | "en_route"
  | "on_site"
  | "testing_and_verification"
  | "completed"
  | "cancelled";

export type MaintenanceAssetType = "solar_pv" | "bess";

export interface MaintenanceServiceRecord {
  id: string;
  asset_type: MaintenanceAssetType;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  estimated_duration_hours: number;
  deliverables: string[];
  is_active: boolean;
}

export interface MaintenanceTicketRecord {
  id: string;
  ticket_number: string;
  org_id: string;
  site_id: string;
  asset_type: MaintenanceAssetType;
  service_id: string | null;
  custom_notes: string | null;
  status: TicketStatus;
  scheduled_date: string;
  time_window: string;
  assigned_crew_name: string | null;
  total_price: number;
  payment_status: "pending" | "paid" | "credit_deducted";
  service_report_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields for UI
  site_name?: string;
  site_city?: string;
  service_title?: string;
  service_slug?: string;
  deliverables?: string[];
}

export interface CreateTicketParams {
  orgId: string;
  siteId: string;
  assetType: MaintenanceAssetType;
  serviceId?: string;
  scheduledDate: string;
  timeWindow: string;
  customNotes?: string;
  totalPrice: number;
  paymentStatus?: "pending" | "paid" | "credit_deducted";
  assignedCrewName?: string;
}

export interface WeatherCurrent {
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPct: number;
  cloudCoverPct: number;
  windSpeedKmh: number;
  precipitationMm: number;
  isDay: boolean;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  solarIrradianceWm2: number;
  directNormalIrradianceWm2: number;
  diffuseIrradianceWm2: number;
}

export interface WeatherDailyForecast {
  date: string;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  tempMaxC: number;
  tempMinC: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  solarRadiationSumMjM2: number;
  estimatedSolarYieldKwh: number;
}

export interface WeatherHourlyPoint {
  time: string;
  temperatureC: number;
  cloudCoverPct: number;
  solarIrradianceWm2: number;
  precipitationProbability: number;
}

export interface BessAutomationDirective {
  status: "solar_precharge" | "peak_preservation" | "grid_feed_arbitrage" | "island_standby";
  title: string;
  recommendation: string;
  chargeWindow: string;
  dischargeWindow: string;
  priority: "high" | "medium" | "normal";
  cloudCoverWarning: boolean;
  temperatureDeratingPct: number;
}

export interface SiteWeatherForecast {
  siteId: string;
  latitude: number;
  longitude: number;
  locationCity: string;
  locationState: string;
  current: WeatherCurrent;
  daily: WeatherDailyForecast[];
  hourly: WeatherHourlyPoint[];
  solarForecast: {
    todayEstimatedYieldKwh: number;
    tomorrowEstimatedYieldKwh: number;
    solarCapacityKwp: number;
    moduleTempEstimatedC: number;
    thermalDeratingPct: number;
    cloudDeratingPct: number;
    irradianceCondition: "optimal" | "moderate" | "low" | "night";
  };
  bessAutomation: BessAutomationDirective;
  lastUpdated: string;
}

export interface MpptChannelPoint {
  channel: number;
  currentA: number;
  voltageV: number;
  powerKw: number;
  status: "optimal" | "soiling_warning" | "fuse_check" | "clipping";
}

export interface MpptDiurnalSample {
  time: string;
  hour: number;
  minute: number;
  irradianceWm2: number;
  channels: MpptChannelPoint[];
}

export interface ModbusRegisterItem {
  address: number;
  hexAddress: string;
  name: string;
  key: string;
  value: number | string;
  unit: string;
  description: string;
  category:
    | "inverter_status"
    | "dc_voltage"
    | "dc_current"
    | "string_current"
    | "ac_grid"
    | "energy_lifetime";
  status?: "normal" | "warning" | "critical";
}

export interface InverterModbusSnapshot {
  inverterId: string;
  inverterName: string;
  model: string;
  serialNumber: string;
  slaveId: number;
  baudRate: string;
  eventCode: number;
  eventMessage: string;
  internalTempC: number;
  dcInputPowerKw: number;
  acOutputPowerKw: number;
  efficiencyPct: number;
  lastPollTimestamp: string;
  registers: ModbusRegisterItem[];
}

