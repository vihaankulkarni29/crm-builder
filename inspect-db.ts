import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const db = neon(process.env.DATABASE_URL!)

async function inspect() {
    try {
        console.log("🚀 Inspecting table constraints...")
        const constraints = await db`
            SELECT conname, contype, am.amname
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            LEFT JOIN pg_index i ON t.oid = i.indrelid AND c.conindid = i.indexrelid
            LEFT JOIN pg_am am ON i.relam = am.oid
            WHERE t.relname = 'users';
        `
        console.log("Users Constraints:", constraints)
        
        const tm_constraints = await db`
            SELECT conname, contype 
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'team_members';
        `
        console.log("Team Members Constraints:", tm_constraints)

    } catch (e) {
        console.error("Inspection error:", e)
    }
}
inspect()
