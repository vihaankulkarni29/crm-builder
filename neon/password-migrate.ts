import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const db = neon(process.env.DATABASE_URL!)

async function runPasswordMigration() {
    console.log('🚀 Checking/Adding password_hash column to Neon users table...\n')

    try {
        await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`
        console.log('  ✅ password_hash column added/verified.')
    } catch (error) {
        console.error('Migration failed:', error)
    }

    console.log('\n🎯 Schema update complete!')
}

runPasswordMigration()
