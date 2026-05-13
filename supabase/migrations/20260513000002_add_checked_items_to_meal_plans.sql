-- Add checked_items column to meal_plans table to persist grocery checklist state
ALTER TABLE IF EXISTS public.meal_plans 
ADD COLUMN IF NOT EXISTS checked_items JSONB DEFAULT '{}'::jsonb;
