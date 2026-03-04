CREATE TABLE public.product_ratings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to select ratings
CREATE POLICY "Allow public read access to ratings" ON public.product_ratings FOR SELECT USING (true);

-- Allow anonymous users to insert ratings
CREATE POLICY "Allow public insert to ratings" ON public.product_ratings FOR INSERT WITH CHECK (true);
