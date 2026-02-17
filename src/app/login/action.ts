'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const USERS: Record<string, string> = {
    'zaid': 'ctrlzaid26',
    'brendan': 'design26',
    'pratik': 'growth26',
    'ritwik': 'scale26',
    'vihaan': 'tech26',
    'admin': 'rfrncs2026',
}

const MASTER_KEY = 'rfrncs2026'

export async function login(formData: FormData) {
    const username = (formData.get('username') as string || '').toLowerCase().trim()
    const password = (formData.get('password') as string || '').trim()

    let isAuthenticated = false

    // 1. Master Key Check
    if (password === MASTER_KEY) {
        isAuthenticated = true
    }

    // 2. User Specific Check
    if (!isAuthenticated && USERS[username] && USERS[username] === password) {
        isAuthenticated = true
    }

    if (!isAuthenticated) {
        return "Invalid Credentials"
    }

    // 3. Set Secure Session Cookie
    const thirtyDays = 30 * 24 * 60 * 60

    // Await the cookies() promise
    const cookieStore = await cookies()

    cookieStore.set('rfrncs_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: thirtyDays,
        path: '/',
        sameSite: 'lax',
    })

    redirect('/')
}
