import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const db = neon(process.env.DATABASE_URL!)

async function createTeam() {
    try {
        console.log("🚀 Provisioning Regional Ops Leads...")
        
        const leads = [
            { name: 'Zaid', email: 'zaid@rfrncs.in', pass: 'zaid26' },
            { name: 'Pratik', email: 'pratik@rfrncs.in', pass: 'pratik26' },
            { name: 'Brendan', email: 'brendan@rfrncs.in', pass: 'brendan26' }
        ]
        
        for (const lead of leads) {
            console.log(`  - Processing ${lead.name} (${lead.email})...`)
            
            // 1. Handle Users Table (Manual SELECT check as ON CONFLICT failed)
            const existingUser = await db`SELECT id FROM users WHERE email = ${lead.email}`
            
            if (existingUser.length > 0) {
                console.log(`    - User exists, updating password/role...`)
                await db`
                    UPDATE users 
                    SET password_hash = ${lead.pass}, role = 'Ops Head'
                    WHERE email = ${lead.email}
                `
            } else {
                console.log(`    - User not found, inserting...`)
                await db`
                    INSERT INTO users (name, email, role, password_hash)
                    VALUES (${lead.name}, ${lead.email}, 'Ops Head', ${lead.pass})
                `
            }
            
            // 2. Handle Team Members Table
            const existingMember = await db`SELECT id FROM team_members WHERE name = ${lead.name}`
            if (existingMember.length === 0) {
                 await db`
                    INSERT INTO team_members (name, role, status, efficiency, avatar)
                    VALUES (${lead.name}, 'Ops Head', 'Online', '100%', ${'/avatars/0' + (Math.floor(Math.random() * 8) + 1) + '.png'})
                `
            }
        }
        
        console.log("✅ Regional Ops Provisioning Complete.")
    } catch (e) {
        console.error("Provisioning error:", e)
    }
}
createTeam()
