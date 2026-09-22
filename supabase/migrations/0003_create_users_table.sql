-- NEON ENERGY: Migration 0003 - Create Users Table & Org Relationship
-- Target: Supabase PostgreSQL (mzumlzmfjgzvycebqask)
-- Stores Clerk synced user profiles, active organization mappings, and RBAC roles

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    image_url TEXT,
    clerk_org_id TEXT,
    current_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'org:member',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient lookup by Clerk User ID and Organization
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_current_org ON public.users(current_org_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_org ON public.users(clerk_org_id);

-- Enable Row Level Security (RLS) on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Note: The service_role and direct postgres connection pooler automatically bypass RLS.
-- This default-deny policy ensures public anonymous Data API calls cannot view or tamper with user records.
