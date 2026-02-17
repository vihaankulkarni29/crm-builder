-- Ensure columns exist for upgraded Leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text;
