-- Migration 0005: Add Asset Energy Accumulators to Telemetry Snapshots
-- Supports daily generation today for DG, and daily charge/discharge energy for BESS

ALTER TABLE public.telemetry_snapshots 
  ADD COLUMN IF NOT EXISTS dg_yield_today_kwh DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS bess_charge_today_kwh DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS bess_discharge_today_kwh DOUBLE PRECISION DEFAULT 0.0;
