-- Add instructions column to meals table
ALTER TABLE IF EXISTS public.meals 
ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '[]'::jsonb;
