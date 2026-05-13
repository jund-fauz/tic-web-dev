-- Create product_prices table to cache grocery prices
CREATE TABLE IF NOT EXISTS public.product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    store_name TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on item_name and store_name to allow upsert
ALTER TABLE public.product_prices ADD CONSTRAINT unique_item_store UNIQUE (item_name, store_name);

-- RLS Policies
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to product prices" 
ON public.product_prices FOR SELECT 
USING (true);

-- Indexes for search
-- Enable pg_trgm for fuzzy search on item names
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_product_prices_item_name_trgm ON public.product_prices USING gin (item_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_prices_item_name_btree ON public.product_prices(item_name);
