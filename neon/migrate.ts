import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const db = neon(process.env.DATABASE_URL!)

async function runSchema() {
    console.log('🚀 Creating Neon tables...\n')

    // Create all tables individually
    await db`CREATE TABLE IF NOT EXISTS leads (
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
    )`
    console.log('  ✅ leads')

    await db`CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        head TEXT DEFAULT 'Unassigned',
        status TEXT DEFAULT 'Onboarding',
        deadline TEXT,
        assigned_to TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    console.log('  ✅ projects')

    await db`CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_name TEXT NOT NULL,
        amount NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Pending',
        date TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    console.log('  ✅ invoices')

    await db`CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'Online',
        efficiency TEXT DEFAULT '100%',
        avatar TEXT DEFAULT '/avatars/01.png',
        created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    console.log('  ✅ team_members')

    await db`CREATE TABLE IF NOT EXISTS agent_tools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        masked_secret TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    console.log('  ✅ agent_tools')

    // Verify
    const tables = await db`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    console.log(`\n📊 Verified ${tables.length} tables:`, tables.map((t: any) => t.tablename).join(', '))
    console.log('🎯 Migration complete!')
}

runSchema()
