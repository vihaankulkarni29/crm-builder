import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const db = neon(process.env.DATABASE_URL!)

async function reset() {
    try {
        console.log("🚀 Resetting admin@rfrncs.in to tech26...")
        await db`UPDATE users SET password_hash = 'tech26' WHERE email = 'admin@rfrncs.in'`
        
        console.log("🚀 Also ensuring vihaan@rfrncs.in exists if needed...")
        // Just in case they want a fresh account with the plain password
        await db`INSERT INTO users (name, email, role, password_hash) 
                 VALUES ('Vihaan', 'vihaan@rfrncs.in', 'Admin', 'tech26')
                 ON CONFLICT (email) DO UPDATE SET password_hash = 'tech26'`
                 
        console.log("✅ Admin Reset Complete: tech26")
    } catch (e) {
        console.error("Reset error:", e)
    }
}
reset()
