import { Lead, Project, Invoice } from "@/types"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function getLeads(): Promise<Lead[]> {
    try {
        const session = await auth()
        if (!session) return []

        const isMember = session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head'
        let data

        if (isMember && session.user?.name) {
            data = await db`SELECT * FROM leads WHERE assigned_to = ${session.user.name} ORDER BY created_at DESC`
        } else {
            data = await db`SELECT * FROM leads ORDER BY created_at DESC`
        }

        return (data || []).map((lead: any) => ({
            id: lead.id,
            companyName: lead.company,
            poc: lead.contact_person,
            value: Number(lead.value),
            status: lead.status,
            source: lead.source,
            assigned_to: lead.assigned_to,
        }))
    } catch (error) {
        console.error("Error fetching leads:", error)
        return []
    }
}

export async function getInvoices(): Promise<Invoice[]> {
    try {
        const data = await db`SELECT * FROM invoices ORDER BY date DESC`

        return (data || []).map((inv: any) => ({
            id: inv.id,
            clientName: inv.client_name,
            amount: Number(inv.amount),
            status: inv.status,
            date: inv.date,
        }))
    } catch (error) {
        console.error("Error fetching invoices:", error)
        return []
    }
}

export async function getProjects(): Promise<Project[]> {
    try {
        const session = await auth()
        if (!session) return []

        const isMember = session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head'
        let data

        if (isMember && session.user?.name) {
            data = await db`SELECT * FROM projects WHERE head = ${session.user.name} ORDER BY deadline ASC`
        } else {
            data = await db`SELECT * FROM projects ORDER BY deadline ASC`
        }

        return (data || []).map((project: any) => ({
            id: project.id,
            name: project.name,
            head: {
                name: project.head,
                avatar: "https://github.com/shadcn.png",
            },
            status: project.status,
            deadline: project.deadline,
            assigned_to: project.assigned_to,
        }))
    } catch (error) {
        console.error("Error fetching projects:", error)
        return []
    }
}

export async function getTeamMembers() {
    try {
        const data = await db`SELECT * FROM team_members ORDER BY created_at DESC`
        return (data || []).map((m: any) => ({
            ...m,
            efficiency: m.efficiency || "0%" // Fallback for efficiency
        }))
    } catch (error) {
        console.error('Error fetching team members:', error)
        return []
    }
}

// Static fallback data (kept for reference/offline dev)
export const leads: Lead[] = [
    { id: "1", companyName: "Acme Corp", poc: "John Doe", value: 5000, status: "Cold Lead", source: "Apollo" },
    { id: "2", companyName: "Globex", poc: "Jane Smith", value: 12000, status: "Hot Lead", source: "Website" },
    { id: "3", companyName: "Soylent Corp", poc: "Bob Johnson", value: 8500, status: "Negotiation", source: "Referral" },
    { id: "4", companyName: "Initech", poc: "Peter Gibbons", value: 15000, status: "Closed", source: "Seamless" },
    { id: "5", companyName: "Umbrella Corp", poc: "Albert Wesker", value: 25000, status: "Hot Lead", source: "Apollo" },
]

export const projects: Project[] = [
    { id: "1", name: "Website Redesign", head: { name: "Alice", avatar: "https://github.com/shadcn.png" }, status: "On Track", deadline: "2024-03-15" },
    { id: "2", name: "Mobile App MVP", head: { name: "Bob", avatar: "https://github.com/shadcn.png" }, status: "Delayed", deadline: "2024-02-28" },
    { id: "3", name: "Marketing Campaign", head: { name: "Charlie", avatar: "https://github.com/shadcn.png" }, status: "On Track", deadline: "2024-04-01" },
]

export const recentTransactions: Invoice[] = [
    { id: "INV-001", clientName: "Acme Corp", amount: 5000, status: "Paid", date: "2024-01-15" },
    { id: "INV-002", clientName: "Globex", amount: 12000, status: "Pending", date: "2024-02-01" },
    { id: "INV-003", clientName: "Soylent Corp", amount: 8500, status: "Overdue", date: "2024-01-20" },
    { id: "INV-004", clientName: "Initech", amount: 2500, status: "Pending", date: "2024-02-10" },
]
