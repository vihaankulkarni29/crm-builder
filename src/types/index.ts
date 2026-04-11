export interface Lead {
    id: string
    companyName: string
    poc: string
    value: number
    status: "New Lead" | "Contacted" | "Meeting Booked" | "Closed Won" | "Disqualified"
    source: "Apollo" | "Seamless" | "Website" | "Referral"
    assigned_to?: string
    email?: string
    lifecycle_stage?: string
    score?: number
    // Rich fields for weaponized cards
    revenue_amount?: number | null
    decision_maker_social?: string | null
    decision_maker_email?: string | null
    sector?: string | null
    website_url?: string | null
}

export interface Project {
    id: string
    name: string
    head: {
        name: string
        avatar: string
    }
    status: "Onboarding" | "In Progress" | "Review" | "Blocked" | "Completed"
    deadline: string // ISO date string
    assigned_to?: string
}

export interface Invoice {
    id: string
    clientName: string
    amount: number
    status: "Pending" | "Paid" | "Overdue"
    date: string
}

export type Transaction = Invoice
