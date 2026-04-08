import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

if (!connectionString && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ DATABASE_URL is missing. DB operations will fail at runtime.')
}

export const db = neon(connectionString || '')

/**
 * Executes a DB query with a hard timeout to prevent infinite hangs.
 * Defaults to 10 seconds.
 */
export async function queryWithTimeout<T>(queryPromise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`DB_TIMEOUT: Query took longer than ${timeoutMs}ms`)), timeoutMs)
    )
    return Promise.race([queryPromise, timeoutPromise])
}
