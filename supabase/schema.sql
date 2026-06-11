-- SQL Schema for Modelling Portfolio Website

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
-- 3. Row-Level Security Policies
-- ==========================================

-- --- portfolio_items Policies ---
-- Allow public read access
CREATE POLICY "Allow public read access on portfolio_items" 
ON public.portfolio_items FOR SELECT 
USING (true);

-- Allow full access to authenticated admin users
CREATE POLICY "Allow admin full access on portfolio_items" 
ON public.portfolio_items FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- videos Policies ---
-- Allow public read access
CREATE POLICY "Allow public read access on videos" 
ON public.videos FOR SELECT 
USING (true);

-- Allow full access to authenticated admin users
CREATE POLICY "Allow admin full access on videos" 
ON public.videos FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- blog_posts Policies ---
-- Allow public read access ONLY to published posts
CREATE POLICY "Allow public read access on published blog_posts" 
ON public.blog_posts FOR SELECT 
USING (published = true);

-- Allow admin read access to all posts (including drafts)
CREATE POLICY "Allow admin read access on all blog_posts" 
ON public.blog_posts FOR SELECT 
TO authenticated 
USING (true);

-- Allow admin full write access
CREATE POLICY "Allow admin full write access on blog_posts" 
ON public.blog_posts FOR INSERT/UPDATE/DELETE 
TO authenticated 
WITH CHECK (true);


-- --- contact_messages Policies ---
-- Allow public write (anonymous users can send contact messages)
CREATE POLICY "Allow public insert access on contact_messages" 
ON public.contact_messages FOR INSERT 
WITH CHECK (true);

-- Allow admin full access (viewing inbox, changing status, deleting)
CREATE POLICY "Allow admin full access on contact_messages" 
ON public.contact_messages FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- 4. Utility Indexes for Fast Queries
-- ==========================================
CREATE INDEX IF NOT EXISTS portfolio_items_category_idx ON public.portfolio_items(category);
CREATE INDEX IF NOT EXISTS portfolio_items_order_idx ON public.portfolio_items(order_index);
CREATE INDEX IF NOT EXISTS videos_order_idx ON public.videos(order_index);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON public.contact_messages(status);
