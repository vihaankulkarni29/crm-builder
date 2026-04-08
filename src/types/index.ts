export interface Lead {
    id: string
    companyName: string
    poc: string
    value: number
    status: "Cold Lead" | "Hot Lead" | "Negotiation" | "Closed" | "Dead"
    source: "Apollo" | "Seamless" | "Website" | "Referral"
    assigned_to?: string
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
