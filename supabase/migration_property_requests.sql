-- ============================================
-- Migration: Property listing requests table
-- Run this in the Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.property_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  maxcount INTEGER NOT NULL,
  phonenumber TEXT NOT NULL,
  rentperday NUMERIC NOT NULL,
  imageurls TEXT[] NOT NULL DEFAULT '{}',
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own property requests"
  ON public.property_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create property requests"
  ON public.property_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all property requests"
  ON public.property_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to read all bookings (for dashboard)
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
