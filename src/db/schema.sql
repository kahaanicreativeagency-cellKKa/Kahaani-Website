-- =================================================================
-- KAHAANI ENQUIRIES DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- =================================================================
-- Instructions:
-- 1. Log in to your Supabase dashboard at https://supabase.com
-- 2. Open your project and click "SQL Editor" in the left sidebar
-- 3. Paste this entire script and click "Run"
-- =================================================================

-- 1. Create the enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    preferred_contact TEXT DEFAULT 'WhatsApp',
    services TEXT[] NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'New' NOT NULL CHECK (status IN ('New', 'Contacted', 'Converted', 'Lost'))
);

-- 2. Create useful indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at DESC);

-- 3. Enable Row Level Security (RLS) for data protection
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow anyone (public/frontend) to submit an enquiry
CREATE POLICY "Allow public insert"
    ON enquiries
    FOR INSERT
    WITH CHECK (true);

-- 5. Policy: Only authenticated team members can view or edit enquiries
CREATE POLICY "Allow authenticated full access"
    ON enquiries
    FOR ALL
    USING (auth.role() = 'authenticated');

-- =================================================================
-- Verification Query (Run this after table creation to confirm)
-- SELECT * FROM enquiries LIMIT 5;
-- =================================================================

