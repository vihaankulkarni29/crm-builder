import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const db = neon(process.env.DATABASE_URL!)

async function runAuditMigration() {
    console.log('🚀 Checking/Adding activity_log table to Neon cluster...\n')

    try {
        await db`
            CREATE TABLE IF NOT EXISTS activity_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
                user_id UUID REFERENCES users(id) ON DELETE CASCADE, 
                action TEXT NOT NULL, 
                entity_id TEXT, 
                details JSONB, 
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
        console.log('  ✅ activity_log table added/verified.')
    } catch (error) {
        console.error('Migration failed:', error)
    }

    console.log('\n🎯 Schema update complete!')
}

runAuditMigration()
