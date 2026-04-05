import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export type ActivityBadgeVariant = 'create' | 'update' | 'delete' | 'default'

export interface ActivityEntry {
    id: string
    user_id: string | null
    action: string
    entity_id: string | null
    details: any
    created_at: string
    user_name: string | null
    user_email: string | null
    user_image: string | null
}

export function formatActivityAction(action: string): { label: string; variant: ActivityBadgeVariant } {
    const map: Record<string, { label: string; variant: ActivityBadgeVariant }> = {
        UPDATE_LEAD_STATUS:   { label: 'advanced a lead',           variant: 'update' },
        DELETE_LEAD:          { label: 'archived a lead',           variant: 'delete' },
        CREATE_PROJECT:       { label: 'birthed a new project',     variant: 'create' },
        UPDATE_PROJECT_STATUS:{ label: 'moved a project forward',   variant: 'update' },
        TEAM_INVITE:          { label: 'added a new recruit',       variant: 'create' },
        CHANGE_PASSWORD:      { label: 'secured their identity',    variant: 'default' },
    }
    return map[action] ?? { label: action.toLowerCase().replace(/_/g, ' '), variant: 'default' }
}
