-- Add groceries column to meal_plans table
ALTER TABLE IF EXISTS public.meal_plans 
ADD COLUMN IF NOT EXISTS groceries JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS grocery_total_rupiah NUMERIC(12, 2) DEFAULT 0;

-- Create meal_groceries table for more structured storage if needed
CREATE TABLE IF NOT EXISTS public.meal_groceries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for meal_groceries
ALTER TABLE public.meal_groceries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal groceries" 
ON public.meal_groceries FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.meal_plans 
        WHERE id = public.meal_groceries.meal_plan_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own meal groceries" 
ON public.meal_groceries FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.meal_plans 
        WHERE id = public.meal_groceries.meal_plan_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own meal groceries" 
ON public.meal_groceries FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.meal_plans 
        WHERE id = public.meal_groceries.meal_plan_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own meal groceries" 
ON public.meal_groceries FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.meal_plans 
        WHERE id = public.meal_groceries.meal_plan_id 
        AND user_id = auth.uid()
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_meal_groceries_meal_plan_id ON public.meal_groceries(meal_plan_id);
