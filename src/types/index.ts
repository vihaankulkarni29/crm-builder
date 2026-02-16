export interface Lead {
    id: string
    companyName: string
    poc: string
    value: number
    status: "Cold Lead" | "Hot Lead" | "Negotiation" | "Closed" | "Dead"
    source: "Apollo" | "Seamless" | "Website" | "Referral"
}

export interface Project {
    id: string
    name: string
    head: {
        name: string
        avatar: string
    }
    status: "On Track" | "Delayed" | "Completed"
    deadline: string // ISO date string
}

export interface Invoice {
    id: string
    clientName: string
    amount: number
    status: "Pending" | "Paid" | "Overdue"
    date: string
}

export type Transaction = Invoice
