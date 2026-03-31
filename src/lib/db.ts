import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('🚨 DATABASE_URL is missing from environment variables.')
}

export const db = neon(connectionString)
