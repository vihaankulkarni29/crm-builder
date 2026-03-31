// State Machine Config Matrix mapping natively allowed status transition vectors

export const PROJECT_WORKFLOW: Record<string, string[]> = {
    'Onboarding': ['In Progress', 'Blocked'],
    'In Progress': ['Review', 'Blocked'],
    'Review': ['Completed', 'In Progress', 'Blocked'],
    'Blocked': ['Onboarding', 'In Progress', 'Review'],
    'Completed': ['Review'] // Allow fallback logic if boss rejects completion
}

export type ProjectStatus = keyof typeof PROJECT_WORKFLOW
