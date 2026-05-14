-- Tables for Awards Recognition System

-- 1. admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. awards table
CREATE TABLE IF NOT EXISTS public.awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_name TEXT NOT NULL,
    category TEXT,
    short_description TEXT NOT NULL,
    criteria TEXT,
    opening_date DATE,
    closing_date DATE,
    image_url TEXT,
    visibility_status TEXT DEFAULT 'published' CHECK (visibility_status IN ('published', 'draft')),
    created_by TEXT REFERENCES public.admin_users(auth_user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES public.admin_users(auth_user_id),
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
-- Admins can read all admin_users
CREATE POLICY "Admins can read admin_users" ON public.admin_users
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'approved'));

-- New users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.admin_users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Super admins can update any admin status
CREATE POLICY "Super admins can update admin status" ON public.admin_users
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND role = 'super_admin' AND status = 'approved'));

-- RLS Policies for awards
-- Anyone can read published awards
CREATE POLICY "Anyone can read published awards" ON public.awards
    FOR SELECT USING (visibility_status = 'published');

-- Approved admins can insert awards
CREATE POLICY "Approved admins can insert awards" ON public.awards
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'approved'));

-- Approved admins can update awards
CREATE POLICY "Approved admins can update awards" ON public.awards
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'approved'));

-- Super admins can delete awards
CREATE POLICY "Super admins can delete awards" ON public.awards
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND role = 'super_admin' AND status = 'approved'));

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_awards_updated_at
    BEFORE UPDATE ON public.awards
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
