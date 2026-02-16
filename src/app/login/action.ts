'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const password = formData.get('password')

    // Clean comparison
    if (password === process.env.SITE_PASSWORD) {
        const cookieStore = await cookies()
        cookieStore.set('rfrncs_session', 'true', {
            maxAge: 60 * 60 * 24, // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        })
        redirect('/')
    } else {
        // Return error state if needed, but for simplicity just redirect back or let client handle
        // Since this is a server action called from a form, we can't easily return to the same page with state without useFormState
        // But the user requested a simple redirect or error.
        // Let's modify to return a string error if possible, or just throw for now.
        // Actually, user said: "If no, return error 'Invalid Credentials'"
        return "Invalid Credentials"
    }
}
