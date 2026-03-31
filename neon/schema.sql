-- ============================================
-- RFRNCS CRM - Neon PostgreSQL Schema
-- Run once against your Neon database
-- ============================================

-- 1. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    value NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Cold Lead',
    source TEXT DEFAULT 'Manual',
    designation TEXT,
    phone TEXT,
    subject TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    head TEXT DEFAULT 'Unassigned',
    status TEXT DEFAULT 'Onboarding',
    deadline TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'Online',
    efficiency TEXT DEFAULT '100%',
    avatar TEXT DEFAULT '/avatars/01.png',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Agent Tools Table
CREATE TABLE IF NOT EXISTS agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    masked_secret TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUTH.JS (NEXT-AUTH) TABLES
-- ============================================

-- A. Users Table (Core Identity)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  role TEXT DEFAULT 'Member',
  password_hash TEXT
);

-- B. Accounts Table (OAuth Providers)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT
);

-- C. Sessions Table (Database Sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

-- D. Verification Tokens Table (Magic Links)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);
