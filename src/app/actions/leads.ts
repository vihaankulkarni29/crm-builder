'use server'

import { neon } from '@neondatabase/serverless'
import { auth } from '@/auth'
import { calculateLeadScore } from '@/lib/scoring'
import { revalidatePath } from 'next/cache'

const db = neon(process.env.DATABASE_URL!)

// --- Type Definitions ---
export interface LeadData {
    company?: string
    contact_person?: string
    email?: string
    phone?: string
    website_url?: string      // normalized domain e.g. "cafu.com"
    company_social?: string
    decision_maker_social?: string
    revenue_amount?: string | number
    revenue_listed?: boolean
    sector?: string
}

// --- Function 1: The Array Query ---
// Single network trip using Postgres ANY() operator
export async function checkExistingDomains(domains: string[]): Promise<string[]> {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    if (!domains || domains.length === 0) return []

    try {
        const rows = await db`
            SELECT website_url FROM leads
            WHERE website_url = ANY(${domains as any})
            AND website_url IS NOT NULL
        `
        return rows.map((r: any) => r.website_url as string)
    } catch (error) {
        console.error('[checkExistingDomains] Error:', error)
        return []
    }
}

// --- Function 2: The ACID Insert ---
// ON CONFLICT (website_url) DO NOTHING = final DB-level failsafe against race conditions
export async function bulkInsertLeads(leads: LeadData[]) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    if (!leads || leads.length === 0) {
        return { success: false, message: 'No leads provided.' }
    }

    try {
        let inserted = 0

        for (const lead of leads) {
            const score = calculateLeadScore({
                company: lead.company,
                contact_person: lead.contact_person,
                email: lead.email,
                phone: lead.phone,
                company_social: lead.company_social,
                decision_maker_social: lead.decision_maker_social,
                revenue_amount: lead.revenue_amount,
                revenue_listed: lead.revenue_listed,
                sector: lead.sector,
            })

            const revNum = lead.revenue_amount
                ? Number(String(lead.revenue_amount).replace(/[^0-9.-]+/g, ''))
                : null

            await db`
                INSERT INTO leads (
                    company, contact_person, email, phone,
                    website_url, company_social, decision_maker_social, sector,
                    revenue_listed, revenue_amount, score,
                    lifecycle_stage, status, source
                )
                VALUES (
                    ${lead.company || 'Unknown'},
                    ${lead.contact_person || ''},
                    ${lead.email || ''},
                    ${lead.phone || null},
                    ${lead.website_url || null},
                    ${lead.company_social || null},
                    ${lead.decision_maker_social || null},
                    ${lead.sector || null},
                    ${lead.revenue_listed || false},
                    ${isNaN(revNum!) ? null : revNum},
                    ${score},
                    'RAW', 'New Lead', 'Apollo'
                )
                ON CONFLICT (website_url) DO NOTHING
            `
            inserted++
        }

        revalidatePath('/sandbox')
        return { success: true, inserted }
    } catch (error) {
        console.error('[bulkInsertLeads] Error:', error)
        return { success: false, message: 'Database insert failed. Check server logs.' }
    }
}
