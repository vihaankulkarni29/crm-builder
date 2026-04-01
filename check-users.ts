import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const db = neon(process.env.DATABASE_URL!)

async function check() {
    try {
        const users = await db`SELECT id, name, email FROM users`
        console.log("USERS:", users)
    } catch (error) {
        console.error("DB QUERY ERROR:", error)
    }
}
check()
