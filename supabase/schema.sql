-- SQL Schema for Modelling Portfolio Website
-- This schema is idempotent and can be executed multiple times.

-- ==========================================
-- 1. Create Tables
-- ==========================================

-- Table for portfolio gallery photos
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    title TEXT,
    category TEXT NOT NULL, -- e.g., 'Editorial', 'Commercial', 'Runway', 'Beauty'
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for video reel clips
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL, -- Direct storage URL
    thumbnail_url TEXT,      -- Cover image for the video
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for journey blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL, -- Markdown format
    cover_image TEXT,
    published BOOLEAN DEFAULT false NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for contact form submissions (Inbox)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. Enable Row-Level Security (RLS)
-- ==========================================

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. Drop Existing Policies (to ensure idempotency)
-- ==========================================

-- Portfolio Items
DROP POLICY IF EXISTS "Allow public read access on portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Allow admin full access on portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Allow public select on portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Allow admin insert on portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Allow admin update on portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Allow admin delete on portfolio_items" ON public.portfolio_items;

-- Videos
DROP POLICY IF EXISTS "Allow public read access on videos" ON public.videos;
DROP POLICY IF EXISTS "Allow admin full access on videos" ON public.videos;
DROP POLICY IF EXISTS "Allow public select on videos" ON public.videos;
DROP POLICY IF EXISTS "Allow admin insert on videos" ON public.videos;
DROP POLICY IF EXISTS "Allow admin update on videos" ON public.videos;
DROP POLICY IF EXISTS "Allow admin delete on videos" ON public.videos;

-- Blog Posts
DROP POLICY IF EXISTS "Allow public read access on published blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin read access on all blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin full write access on blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin full access on blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public select on published blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin select on all blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin insert on blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin update on blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin delete on blog_posts" ON public.blog_posts;

-- Contact Messages
DROP POLICY IF EXISTS "Allow public insert access on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin full access on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin select on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin update on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin delete on contact_messages" ON public.contact_messages;

-- ==========================================
-- 4. Row-Level Security Policies (Direct JWT Check)
-- ==========================================

-- --- portfolio_items Policies ---
CREATE POLICY "Allow public select on portfolio_items" 
ON public.portfolio_items FOR SELECT 
USING (true);

CREATE POLICY "Allow admin insert on portfolio_items" 
ON public.portfolio_items FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin update on portfolio_items" 
ON public.portfolio_items FOR UPDATE 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com') 
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin delete on portfolio_items" 
ON public.portfolio_items FOR DELETE 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');



-- --- videos Policies ---
CREATE POLICY "Allow public select on videos" 
ON public.videos FOR SELECT 
USING (true);

CREATE POLICY "Allow admin insert on videos" 
ON public.videos FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin update on videos" 
ON public.videos FOR UPDATE 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com') 
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin delete on videos" 
ON public.videos FOR DELETE 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');


-- --- blog_posts Policies ---
-- Allow public select access ONLY to published posts
CREATE POLICY "Allow public select on published blog_posts" 
ON public.blog_posts FOR SELECT 
USING (published = true);

-- Allow admins to view all posts (including drafts)
CREATE POLICY "Allow admin select on all blog_posts" 
ON public.blog_posts FOR SELECT 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin insert on blog_posts" 
ON public.blog_posts FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin update on blog_posts" 
ON public.blog_posts FOR UPDATE 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com') 
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin delete on blog_posts" 
ON public.blog_posts FOR DELETE 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');


-- --- contact_messages Policies ---
-- Allow public write (anonymous users can send contact messages)
CREATE POLICY "Allow public insert on contact_messages" 
ON public.contact_messages FOR INSERT 
WITH CHECK (true);

-- Allow admins to manage contact queries
CREATE POLICY "Allow admin select on contact_messages" 
ON public.contact_messages FOR SELECT 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin update on contact_messages" 
ON public.contact_messages FOR UPDATE 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com') 
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

CREATE POLICY "Allow admin delete on contact_messages" 
ON public.contact_messages FOR DELETE 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

-- ==========================================
-- 5. Utility Indexes for Fast Queries
-- ==========================================

CREATE INDEX IF NOT EXISTS portfolio_items_category_idx ON public.portfolio_items(category);
CREATE INDEX IF NOT EXISTS portfolio_items_order_idx ON public.portfolio_items(order_index);
CREATE INDEX IF NOT EXISTS videos_order_idx ON public.videos(order_index);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON public.contact_messages(status);

-- ==========================================
-- 6. Diagnostic Functions
-- ==========================================

-- Function to inspect the current JWT claims of the caller
CREATE OR REPLACE FUNCTION public.get_my_claims()
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT jsonb_build_object(
    'uid', auth.uid(),
    'role', auth.role(),
    'email', auth.jwt() ->> 'email'
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_my_claims() TO public, anon, authenticated;

-- ==========================================
-- 7. Site Media Management Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.site_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_key TEXT UNIQUE NOT NULL, -- e.g., 'hero', 'about'
    title TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Allow public select on site_media" ON public.site_media;
DROP POLICY IF EXISTS "Allow admin write on site_media" ON public.site_media;

-- Create Policies
CREATE POLICY "Allow public select on site_media" 
ON public.site_media FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write on site_media" 
ON public.site_media FOR ALL 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com')
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

-- Create Index on media_key
CREATE INDEX IF NOT EXISTS site_media_media_key_idx ON public.site_media(media_key);


-- ==========================================
-- 8. Model Details Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.model_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    height_cm NUMERIC NOT NULL,
    bust_cm NUMERIC NOT NULL,
    waist_cm NUMERIC NOT NULL,
    hips_cm NUMERIC NOT NULL,
    eye_color TEXT NOT NULL,
    hair_color TEXT NOT NULL,
    shoe_size TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.model_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Allow public select on model_details" ON public.model_details;
DROP POLICY IF EXISTS "Allow admin write on model_details" ON public.model_details;

-- Create Policies
-- Select policy: Allow anyone to view model details
CREATE POLICY "Allow public select on model_details" 
ON public.model_details FOR SELECT 
USING (true);

-- Write policy: Only authenticated admin can modify model details
CREATE POLICY "Allow admin write on model_details" 
ON public.model_details FOR ALL 
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com')
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'triptimaakan@gmail.com');

-- Seed initial singleton row (with ID '00000000-0000-0000-0000-000000000000' and default values)
INSERT INTO public.model_details (id, height_cm, bust_cm, waist_cm, hips_cm, eye_color, hair_color, shoe_size, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    172,
    84,
    61,
    89,
    'Green',
    'Dark Brown',
    '39',
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;


