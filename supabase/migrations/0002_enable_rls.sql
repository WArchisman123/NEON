-- NEON ENERGY: Migration 0002 - Enable Row Level Security (RLS)
-- Target: Supabase PostgreSQL (mzumlzmfjgzvycebqask)
-- Eliminates unrestricted public Data API access and enforces tenant isolation

-- 1. Enable RLS on all 8 core tables in public schema
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- 2. Maintenance Services Catalog (Public Read Access)
-- Customers and prospective clients can view standard Solar and BESS service packages
DROP POLICY IF EXISTS "Allow public read access to active maintenance services" ON public.maintenance_services;
CREATE POLICY "Allow public read access to active maintenance services"
    ON public.maintenance_services
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- 3. Tenant Isolation Policies
-- In Supabase, the `service_role` and direct `postgres` connection pooler automatically bypass RLS.
-- By enabling RLS without public anon policies on tenant tables, raw unauthenticated
-- Data API requests (e.g. GET/POST/DELETE via the public anon key) are strictly denied.
