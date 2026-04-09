import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function migrateCommandCenter() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set')
    }

    const db = neon(process.env.DATABASE_URL)

    console.log('Running Command Center Migration...')

    try {
        // Create project_tasks table
        await db`
            CREATE TABLE IF NOT EXISTS project_tasks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                task_name TEXT NOT NULL,
                is_completed BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `
        console.log('✅ Created project_tasks table')

        // Create project_comments table
        await db`
            CREATE TABLE IF NOT EXISTS project_comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `
        console.log('✅ Created project_comments table')

        console.log('🎉 Command Center Migration complete!')
    } catch (error) {
        console.error('❌ Migration failed:', error)
    }
}

migrateCommandCenter()
