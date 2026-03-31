import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// 1. Logical & SQL Security: Strict Schema definition
const agentLeadSchema = z.object({
    company: z.string().min(2, "Company name too short"),
    contact_person: z.string().default("Unknown (via Agent)"),
    email: z.string().email().optional().or(z.literal('')),
    value: z.number().min(0).default(0),
    source: z.string().default("AI Agent"),
    status: z.string().default("Cold Lead"),
    designation: z.string().optional(),
    phone: z.string().optional()
})

export async function POST(req: Request) {
    // 2. Web Security: Fail-Secure Auth
    const secret = process.env.PRIVATE_API_SECRET
    if (!secret || secret.length < 16) {
        console.error("CRITICAL: PRIVATE_API_SECRET is missing or too weak.")
        return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 })
    }

    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 })
    }

    try {
        const body = await req.json()
        const { action, payload } = body

        if (action === 'ADD_LEAD') {
            // 3. Payload Sanitization (The Zod Shield)
            const validation = agentLeadSchema.safeParse(payload)

            if (!validation.success) {
                return NextResponse.json({
                    error: 'Payload rejected',
                    details: validation.error.flatten().fieldErrors
                }, { status: 400 })
            }

            // 4. Safe Database Insert via Neon
            const d = validation.data
            try {
                await db`INSERT INTO leads (company, contact_person, email, value, source, status, designation, phone)
                         VALUES (${d.company}, ${d.contact_person}, ${d.email || ''}, ${d.value}, ${d.source}, ${d.status}, ${d.designation || ''}, ${d.phone || ''})`
            } catch (dbError: any) {
                console.error("Agent DB Insert Error:", dbError)
                return NextResponse.json({ error: 'Database rejected the data', details: dbError.message }, { status: 502 })
            }

            return NextResponse.json({ success: true, message: 'Lead injected securely' })
        }

        return NextResponse.json({ error: 'Unknown Action. Supported actions: ADD_LEAD' }, { status: 400 })
    } catch (e: any) {
        return NextResponse.json({ error: 'Invalid Request Format' }, { status: 400 })
    }
}
