-- ============================================
-- Migration: Add missing columns to bookings table
-- Run this in the Supabase SQL Editor if bookings 
-- table already exists without transaction_id/payment_method
-- ============================================

-- Add transaction_id column if it doesn't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS transaction_id TEXT NOT NULL DEFAULT '';

-- Add payment_method column if it doesn't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'card';

-- Update status default if needed (code sends 'confirmed')
ALTER TABLE public.bookings 
ALTER COLUMN status SET DEFAULT 'confirmed';