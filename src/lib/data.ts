import { Lead, Project, Invoice } from "@/types"
import { db, queryWithTimeout } from "@/lib/db"
import { auth } from "@/auth"
import { ActivityEntry } from "@/lib/utils"


export async function getLeads(): Promise<Lead[]> {
    try {
        const session = await auth()
        if (!session) return []

        const isMember = session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head'
        let data

        if (isMember && session.user?.name) {
            data = await queryWithTimeout(db`SELECT * FROM leads WHERE assigned_to = ${session.user.name} AND lifecycle_stage = 'QUALIFIED' ORDER BY created_at DESC`)
        } else {
            // Admin or Ops Head: See everything
            data = await queryWithTimeout(db`SELECT * FROM leads WHERE lifecycle_stage = 'QUALIFIED' ORDER BY created_at DESC`)
        }

        return (data || []).map((lead: any) => ({
            id: lead.id,
            companyName: lead.company,
            poc: lead.contact_person,
            value: Number(lead.value),
            status: lead.status,
            source: lead.source,
            assigned_to: lead.assigned_to,
            email: lead.email,
            lifecycle_stage: lead.lifecycle_stage
        }))
    } catch (error) {
        console.error("Error fetching leads:", error)
        return []
    }
}

export async function getProspects(): Promise<Lead[]> {
    try {
        const session = await auth()
        if (!session) return []

        const data = await queryWithTimeout(db`SELECT * FROM leads WHERE lifecycle_stage != 'QUALIFIED' OR lifecycle_stage IS NULL ORDER BY created_at DESC`)

        return (data || []).map((lead: any) => ({
            id: lead.id,
            companyName: lead.company,
            poc: lead.contact_person,
            value: Number(lead.value),
            status: lead.status,
            source: lead.source,
            assigned_to: lead.assigned_to,
            email: lead.email,
            lifecycle_stage: lead.lifecycle_stage
        }))
    } catch (error) {
        console.error("Error fetching leads:", error)
        return []
    }
}

export async function getInvoices(): Promise<Invoice[]> {
    try {
        const data = await queryWithTimeout(db`SELECT * FROM invoices ORDER BY date DESC`)

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
            data = await queryWithTimeout(db`SELECT * FROM projects WHERE head = ${session.user.name} ORDER BY deadline ASC`)
        } else {
            // Admin or Ops Head: See everything
            data = await queryWithTimeout(db`SELECT * FROM projects ORDER BY deadline ASC`)
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
        const data = await queryWithTimeout(db`SELECT * FROM team_members ORDER BY created_at DESC`)
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
    { id: "1", name: "Website Redesign", head: { name: "Alice", avatar: "https://github.com/shadcn.png" }, status: "In Progress", deadline: "2024-03-15" },
    { id: "2", name: "Mobile App MVP", head: { name: "Bob", avatar: "https://github.com/shadcn.png" }, status: "Blocked", deadline: "2024-02-28" },
    { id: "3", name: "Marketing Campaign", head: { name: "Charlie", avatar: "https://github.com/shadcn.png" }, status: "In Progress", deadline: "2024-04-01" },
]

export const recentTransactions: Invoice[] = [
    { id: "INV-001", clientName: "Acme Corp", amount: 5000, status: "Paid", date: "2024-01-15" },
    { id: "INV-002", clientName: "Globex", amount: 12000, status: "Pending", date: "2024-02-01" },
    { id: "INV-003", clientName: "Soylent Corp", amount: 8500, status: "Overdue", date: "2024-01-20" },
    { id: "INV-004", clientName: "Initech", amount: 2500, status: "Pending", date: "2024-02-10" },
]

export async function getGlobalActivity(): Promise<ActivityEntry[]> {
    try {
        const rows = await db`
            SELECT
                al.id,
                al.user_id,
                al.action,
                al.entity_id,
                al.details,
                al.created_at,
                u.name  AS user_name,
                u.email AS user_email,
                u.image AS user_image,
                u.role  AS user_role
            FROM activity_log al
            LEFT JOIN users u ON al.user_id::uuid = u.id::uuid
            ORDER BY al.created_at DESC
            LIMIT 15
        `
        return (rows || []).map((row: any) => ({
            id:         row.id,
            user_id:    row.user_id,
            action:     row.action,
            entity_id:  row.entity_id,
            details:    row.details,
            created_at: row.created_at,
            user_name:  row.user_name,
            user_email: row.user_email,
            user_image: row.user_image,
            user_role:  row.user_role,
        }))
    } catch (error) {
        console.error('Error fetching global activity:', error)
        return []
    }
}
