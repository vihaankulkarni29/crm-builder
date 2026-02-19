-- Add missing columns for Agent integration
alter table leads add column if not exists designation text;
alter table leads add column if not exists phone text;
alter table leads add column if not exists subject text; -- Sometimes used
