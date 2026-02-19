import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
    // 1. "VPC / Zero-Knowledge" Auth Simulation
    const authHeader = req.headers.get('authorization')

    // In production, validate this token against a hashed vault table or VPC IP Whitelist.
    // For this demo, we check against a fixed environment variable.
    if (authHeader !== `Bearer ${process.env.PRIVATE_API_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized Access. Out of VPC scope.' }, { status: 403 })
    }

    try {
        const body = await req.json()
        const { action, payload } = body

        // Example Agent Action: Auto-add a Lead
        if (action === 'ADD_LEAD') {
            // Basic validation
            if (!payload.company || !payload.contact) {
                return NextResponse.json({ error: 'Missing required lead fields (company, contact)' }, { status: 400 })
            }

            const { error } = await supabaseAdmin.from('leads').insert([{
                ...payload,
                source: payload.source || 'AI Agent',
                status: payload.status || 'Cold Lead',
                value: payload.value || 0
            }])

            if (error) throw error
            return NextResponse.json({ success: true, message: 'Lead injected securely' })
        }

        return NextResponse.json({ error: 'Unknown Action' }, { status: 400 })
    } catch (e: any) {
        console.error("Agent API Error:", e)
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
    }
}
