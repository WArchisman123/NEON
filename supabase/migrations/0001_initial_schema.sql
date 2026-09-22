-- NEON ENERGY: Core Relational Database Schema Migration
-- Target: Supabase PostgreSQL
-- Enforces Multi-Tenancy via clerk_org_id

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Mapped to Clerk Multi-Tenant Organizations)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_org_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'pro_commercial', 'utility_enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Solar & BESS Sites
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_state TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    plant_type TEXT DEFAULT 'commercial_industrial' CHECK (plant_type IN ('commercial_industrial', 'utility_microgrid', 'rooftop_hybrid')),
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'degraded', 'offline', 'maintenance')),
    
    -- Installed Nameplate Capacities
    solar_capacity_kwp DOUBLE PRECISION DEFAULT 0.0,
    bess_capacity_kwh DOUBLE PRECISION DEFAULT 0.0,
    bess_power_kw DOUBLE PRECISION DEFAULT 0.0,
    dg_capacity_kva DOUBLE PRECISION DEFAULT 0.0,
    contracted_demand_kva DOUBLE PRECISION DEFAULT 0.0,
    
    -- Hardware Asset Capabilities
    has_solar BOOLEAN DEFAULT true,
    has_bess BOOLEAN DEFAULT true,
    has_dg BOOLEAN DEFAULT false,
    has_grid BOOLEAN DEFAULT true,
    
    -- Utility TOU Tariff Settings (USD per kWh)
    peak_tariff_rate DOUBLE PRECISION DEFAULT 0.18,
    offpeak_tariff_rate DOUBLE PRECISION DEFAULT 0.07,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Field Hardware Devices
CREATE TABLE IF NOT EXISTS public.site_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('solar_inverter', 'bess_bms', 'bess_pcs', 'diesel_generator', 'grid_meter', 'load_substation', 'weather_station')),
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT,
    ip_address TEXT,
    modbus_slave_id INT DEFAULT 1,
    is_online BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Real-Time Telemetry Snapshots (Latest Electrical Flow State)
CREATE TABLE IF NOT EXISTS public.telemetry_snapshots (
    site_id UUID PRIMARY KEY REFERENCES public.sites(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Live Power Flows (kW)
    solar_power_kw DOUBLE PRECISION DEFAULT 0.0,
    bess_power_kw DOUBLE PRECISION DEFAULT 0.0, -- negative = charging, positive = discharging
    grid_power_kw DOUBLE PRECISION DEFAULT 0.0, -- positive = import, negative = export
    dg_power_kw DOUBLE PRECISION DEFAULT 0.0,
    load_power_kw DOUBLE PRECISION DEFAULT 0.0,
    
    -- Key State Gauges
    bess_soc_pct DOUBLE PRECISION DEFAULT 0.0,
    bess_soh_pct DOUBLE PRECISION DEFAULT 100.0,
    dg_fuel_pct DOUBLE PRECISION DEFAULT 0.0,
    dg_running BOOLEAN DEFAULT false,
    grid_frequency_hz DOUBLE PRECISION DEFAULT 50.0,
    grid_power_factor DOUBLE PRECISION DEFAULT 0.99,
    
    -- Daily Accumulations (kWh)
    solar_yield_today_kwh DOUBLE PRECISION DEFAULT 0.0,
    load_consumption_today_kwh DOUBLE PRECISION DEFAULT 0.0,
    grid_import_today_kwh DOUBLE PRECISION DEFAULT 0.0,
    grid_export_today_kwh DOUBLE PRECISION DEFAULT 0.0,
    co2_saved_today_kg DOUBLE PRECISION DEFAULT 0.0
);

-- 5. Time-Series Telemetry Rollups (Hourly Aggregation for Historical Charts)
CREATE TABLE IF NOT EXISTS public.telemetry_hourly (
    id BIGSERIAL PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    bucket_timestamp TIMESTAMPTZ NOT NULL,
    
    avg_solar_kw DOUBLE PRECISION DEFAULT 0.0,
    max_solar_kw DOUBLE PRECISION DEFAULT 0.0,
    solar_energy_kwh DOUBLE PRECISION DEFAULT 0.0,
    
    avg_bess_kw DOUBLE PRECISION DEFAULT 0.0,
    bess_charge_kwh DOUBLE PRECISION DEFAULT 0.0,
    bess_discharge_kwh DOUBLE PRECISION DEFAULT 0.0,
    end_bess_soc_pct DOUBLE PRECISION DEFAULT 0.0,
    
    avg_load_kw DOUBLE PRECISION DEFAULT 0.0,
    peak_load_kw DOUBLE PRECISION DEFAULT 0.0,
    load_energy_kwh DOUBLE PRECISION DEFAULT 0.0,
    
    grid_import_kwh DOUBLE PRECISION DEFAULT 0.0,
    grid_export_kwh DOUBLE PRECISION DEFAULT 0.0,
    dg_energy_kwh DOUBLE PRECISION DEFAULT 0.0,
    dg_fuel_liters DOUBLE PRECISION DEFAULT 0.0,
    
    estimated_cost_saved DOUBLE PRECISION DEFAULT 0.0,
    
    CONSTRAINT uq_site_bucket UNIQUE (site_id, bucket_timestamp)
);

-- 6. System Faults & Telemetry Alarms
CREATE TABLE IF NOT EXISTS public.site_alarms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.site_devices(id) ON DELETE SET NULL,
    severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_acknowledged BOOLEAN DEFAULT false,
    is_cleared BOOLEAN DEFAULT false,
    triggered_at TIMESTAMPTZ DEFAULT now(),
    cleared_at TIMESTAMPTZ
);

-- 7. Solar & BESS Certified Maintenance Catalog (Only Solar PV and BESS)
CREATE TABLE IF NOT EXISTS public.maintenance_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type TEXT NOT NULL CHECK (asset_type IN ('solar_pv', 'bess')),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    base_price DOUBLE PRECISION NOT NULL,
    estimated_duration_hours INT NOT NULL,
    deliverables TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 8. Maintenance Booking Tickets
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE NOT NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('solar_pv', 'bess')),
    service_id UUID REFERENCES public.maintenance_services(id),
    custom_notes TEXT,
    status TEXT DEFAULT 'requested' CHECK (status IN (
        'requested',
        'quote_accepted',
        'technician_assigned',
        'en_route',
        'on_site',
        'testing_and_verification',
        'completed',
        'cancelled'
    )),
    scheduled_date DATE NOT NULL,
    time_window TEXT NOT NULL,
    assigned_crew_name TEXT,
    total_price DOUBLE PRECISION NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'credit_deducted')),
    service_report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Fast Multi-Tenant and Time-Series Querying
CREATE INDEX IF NOT EXISTS idx_sites_org_id ON public.sites(org_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_hourly_site_time ON public.telemetry_hourly(site_id, bucket_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_site_devices_site ON public.site_devices(site_id);
CREATE INDEX IF NOT EXISTS idx_site_alarms_site ON public.site_alarms(site_id, is_cleared);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_org ON public.maintenance_tickets(org_id);

-- Seed Standard Solar & BESS Maintenance Packages if not present
INSERT INTO public.maintenance_services (asset_type, title, slug, description, base_price, estimated_duration_hours, deliverables)
VALUES 
(
    'solar_pv',
    'Drone IR Thermography & String Analysis',
    'drone-ir-thermography',
    'Calibrated aerial radiometric infrared inspection combined with IV curve tracing and string fuse testing.',
    1250.00,
    4,
    ARRAY['FLIR radiometric orthomosaic map', 'Cell hot-spot severity classification', 'Bypass diode failure identification', 'String-level degradation report']
),
(
    'solar_pv',
    'Automated Robotic Panel Washing & Anti-Soiling',
    'robotic-panel-washing',
    'Deionized pure water robotic panel wash restoring lost irradiance absorption and removing calcified soiling.',
    890.00,
    6,
    ARRAY['Zero-pressure robotic wash execution', 'Deionized water purity test (<5 ppm)', 'Pre-and-post PR yield verification', 'Anti-reflective glass inspection']
),
(
    'bess',
    'Liquid Coolant Loop Flush & BMS Calibration',
    'bess-coolant-flush-bms',
    'Dielectric coolant fluid replacement, pressure test, and 16-cell module impedance balancing.',
    2400.00,
    8,
    ARRAY['Dielectric coolant conductivity test', 'Loop particulate filtration and fluid renewal', 'BMS shunt calibration & delta-V rebalance', 'NFPA 855 contactor response log']
),
(
    'bess',
    'BESS Thermal Safety & NFPA 855 Compliance Audit',
    'bess-nfpa-safety-audit',
    'Full safety inspection of aerosol fire suppression systems, deflagration venting, and HVAC thermal runaway interlocks.',
    1850.00,
    5,
    ARRAY['Stat-X aerosol generator check', 'Off-gas sensor calibration test', 'Thermal runaway isolation shutdown test', 'Stamped compliance certificate for insurer']
)
ON CONFLICT (slug) DO NOTHING;
