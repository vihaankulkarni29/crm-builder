import { db } from "@/lib/db"

export async function logActivity(userId: string, action: string, entityId: string, details: any = {}) {
    try {
        const detailsJson = JSON.stringify(details)
        await db`INSERT INTO activity_log (user_id, action, entity_id, details) VALUES (${userId}, ${action}, ${entityId}, ${detailsJson})`
    } catch (error) {
        console.error('Failed to write to Audit Log:', error)
        // We catch and suppress here so core business logic doesn't crash if an audit log drops.
    }
}
