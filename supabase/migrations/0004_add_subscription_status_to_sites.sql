-- NEON ENERGY: Migration 0004 - Add subscription_status to sites table
-- Target: Supabase PostgreSQL (mzumlzmfjgzvycebqask)

ALTER TABLE public.sites 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'expired'));
