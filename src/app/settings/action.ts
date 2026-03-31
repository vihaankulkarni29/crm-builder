'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function updatePasswordAction(formData: FormData) {
    const session = await auth()
    if (!session || !session.user?.id) {
        return { error: "Unauthorized" }
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return { error: "Invalid password parameters provided" }
    }

    try {
        const userRes = await db`SELECT password_hash FROM users WHERE id = ${session.user.id}`
        if (userRes.length === 0) return { error: "User account not active" }
        
        const existingHash = userRes[0].password_hash
        
        const isMatch = await bcrypt.compare(currentPassword, existingHash)
        if (!isMatch) {
            return { error: "Current password is incorrect" }
        }

        const hashedNew = await bcrypt.hash(newPassword, 10)

        await db`UPDATE users SET password_hash = ${hashedNew} WHERE id = ${session.user.id}`
        
        return { success: true }
    } catch (e: any) {
        console.error("Password change core error:", e)
        return { error: "Internal server error occurred while updating secure credentials" }
    }
}
