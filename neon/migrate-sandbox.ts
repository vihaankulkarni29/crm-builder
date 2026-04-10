import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function migrateSandbox() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set')
    }

    const db = neon(process.env.DATABASE_URL)

    console.log('Running Sandbox Migration...')

    try {
        // 1. Add the lifecycle_stage column if it does not exist
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'RAW'`
        console.log('✅ Added lifecycle_stage to leads table')

        // 2. Safely flag existing leads as QUALIFIED to prevent sandbox drop-off
        await db`UPDATE leads SET lifecycle_stage = 'QUALIFIED' WHERE lifecycle_stage = 'RAW' OR lifecycle_stage IS NULL`
        console.log('✅ Updated existing leads to QUALIFIED state')

        console.log('🎉 Sandbox Migration complete!')
    } catch (error) {
        console.error('❌ Migration failed:', error)
    }
}

migrateSandbox()
