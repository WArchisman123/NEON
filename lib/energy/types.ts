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
  subscription_status?: "active" | "past_due" | "expired";
  created_at: string;
  // Joined snapshot fields
  solar_power_kw?: number;
  live_bess_power_kw?: number;
  grid_power_kw?: number;
  dg_power_kw?: number;
  load_power_kw?: number;
  bess_soc_pct?: number;
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
