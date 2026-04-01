import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

if (!connectionString && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ DATABASE_URL is missing. DB operations will fail at runtime.')
}

export const db = neon(connectionString || '')
