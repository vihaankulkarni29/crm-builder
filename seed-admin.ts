import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config({ path: '.env.local' })

const db = neon(process.env.DATABASE_URL!)

async function seed() {
    try {
        const users = await db`SELECT * FROM users WHERE email = 'admin@rfrncs.in'`
        if (users.length === 0) {
            const hash = await bcrypt.hash('rfrncs2026', 10)
            await db`
                INSERT INTO users (name, email, role, password_hash)
                VALUES ('Admin User', 'admin@rfrncs.in', 'Admin', ${hash})
            `
            console.log("✅ Seeded Admin User: admin@rfrncs.in / rfrncs2026")
        } else {
            console.log("Admin already exists")
        }
    } catch(e) {
        console.error("Seed error:", e)
    }
}
seed()
