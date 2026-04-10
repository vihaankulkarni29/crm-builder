import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function migrateScoring() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set')
    }

    const db = neon(process.env.DATABASE_URL)

    console.log('Running Scoring Matrix Migration...')

    try {
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0`
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS revenue_listed BOOLEAN`
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS revenue_amount NUMERIC`
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_social TEXT`
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS decision_maker_social TEXT`
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS sector TEXT`
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS pain_point TEXT`
        await db`ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_budget NUMERIC`

        console.log('✅ Appended all scaling architecture meta-columns successfully to leads table')
        console.log('🎉 Database Schema Update complete!')
    } catch (error) {
        console.error('❌ Migration failed:', error)
    }
}

migrateScoring()
