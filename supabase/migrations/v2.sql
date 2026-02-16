-- 1. Extend Leads Table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS designation text,
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS phone text;

-- 2. Create Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  status text DEFAULT 'Online',
  efficiency text DEFAULT '100%',
  avatar text DEFAULT '/avatars/01.png',
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS (Good practice, even if we bypass it server-side)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy (Allow all for now, or strict)
-- For this prototype/mvp where we use supabaseAdmin, we might not need strict policies yet, 
-- but let's allow read for authenticated users just in case.
CREATE POLICY "Allow public read" ON team_members FOR SELECT USING (true);
