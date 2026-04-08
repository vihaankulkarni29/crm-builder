
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing in .env.local")
    process.exit(1)
}

const neonDb = neon(process.env.DATABASE_URL!)

const supabaseUrl = "https://tlselvnpenltsimnoprz.supabase.co"
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsc2Vsdm5wZW5sdHNpbW5vcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk5ODAxNCwiZXhwIjoyMDg2NTc0MDE0fQ.2DF9vO-VomFmDtglw_NvelI9OlH0xWPiBr04Re5Zttc"

async function fetchFromSupabase(table: string) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
        headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
        }
    })
    if (!res.ok) throw new Error(`Failed to fetch from Supabase table ${table}: ${res.statusText}`)
    return await res.json()
}

async function migrate() {
    console.log("🚀 Starting Legacy Data Migration (Supabase -> Neon)...")

    try {
        // 1. Migrate Leads
        console.log("📦 Extracting Leads from Supabase...")
        const legacyLeads = await fetchFromSupabase('leads')
        console.log(`✅ Found ${legacyLeads.length} leads. Batch inserting into Neon...`)

        for (const lead of legacyLeads) {
            await neonDb`
                INSERT INTO leads (id, created_at, company, contact_person, email, status, source, value, designation, subject, phone, assigned_to)
                VALUES (
                    ${lead.id}, 
                    ${lead.created_at}, 
                    ${lead.company}, 
                    ${lead.contact_person}, 
                    ${lead.email}, 
                    ${lead.status}, 
                    ${lead.source}, 
                    ${lead.value}, 
                    ${lead.designation}, 
                    ${lead.subject}, 
                    ${lead.phone}, 
                    ${lead.assigned_to}
                )
                ON CONFLICT (id) DO UPDATE SET
                    created_at = EXCLUDED.created_at,
                    company = EXCLUDED.company,
                    contact_person = EXCLUDED.contact_person,
                    email = EXCLUDED.email,
                    status = EXCLUDED.status,
                    source = EXCLUDED.source,
                    value = EXCLUDED.value,
                    designation = EXCLUDED.designation,
                    subject = EXCLUDED.subject,
                    phone = EXCLUDED.phone,
                    assigned_to = EXCLUDED.assigned_to
            `
        }
        console.log("🏁 Leads Migration Complete.")

        // 2. Migrate Projects
        console.log("\n📂 Extracting Projects from Supabase...")
        const legacyProjects = await fetchFromSupabase('projects')
        console.log(`✅ Found ${legacyProjects.length} projects. Batch inserting into Neon...`)

        for (const project of legacyProjects) {
            await neonDb`
                INSERT INTO projects (id, created_at, name, head, status, deadline, assigned_to)
                VALUES (
                    ${project.id}, 
                    ${project.created_at}, 
                    ${project.name}, 
                    ${project.head}, 
                    ${project.status}, 
                    ${project.deadline}, 
                    ${project.assigned_to}
                )
                ON CONFLICT (id) DO UPDATE SET
                    created_at = EXCLUDED.created_at,
                    name = EXCLUDED.name,
                    head = EXCLUDED.head,
                    status = EXCLUDED.status,
                    deadline = EXCLUDED.deadline,
                    assigned_to = EXCLUDED.assigned_to
            `
        }
        console.log("🏁 Projects Migration Complete.")

        console.log("\n✨ The Great Migration is Finished!")

    } catch (error) {
        console.error("❌ Migration Failed:", error)
    }
}

migrate()
