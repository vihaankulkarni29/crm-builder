'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { leadSchema, invoiceSchema, projectSchema } from '@/lib/schemas'

function parseCurrency(value: any) {
    if (!value) return 0
    const cleanValue = String(value).replace(/[^0-9.-]+/g, "")
    const parsed = parseFloat(cleanValue)
    return isNaN(parsed) ? 0 : parsed
}

export async function addLead(formData: FormData) {
    const value = parseCurrency(formData.get('value'))
    const source = (formData.get('source') as string) || 'Manual'
    const email = (formData.get('email') as string) || ''

    const rawData = {
        company: formData.get('company'),
        contact: formData.get('contact'),
        email,
        value,
        source,
    }

    const validation = leadSchema.safeParse(rawData)

    if (!validation.success) {
        console.error("Lead Validation Failed:", validation.error.flatten().fieldErrors)
        return { message: 'Validation Error', errors: validation.error.flatten().fieldErrors }
    }

    const { company, contact } = validation.data
    const status = (formData.get('status') as string) || 'Cold Lead'
    const assigned_to = (formData.get('assigned_to') as string) || 'Unassigned'

    try {
        await db`INSERT INTO leads (company, contact_person, email, value, status, source, assigned_to)
                 VALUES (${company}, ${contact}, ${validation.data.email || ''}, ${validation.data.value}, ${status}, ${validation.data.source || 'Manual'}, ${assigned_to})`
    } catch (error) {
        console.error('Error adding lead:', error)
        return { message: 'Failed to add lead' }
    }

    revalidatePath('/leads')
    return { message: 'Lead added successfully' }
}

export async function addInvoice(formData: FormData) {
    const rawAmount = formData.get('amount')
    const cleanAmount = String(rawAmount).replace(/[^0-9.]/g, '')
    const amount = cleanAmount ? parseFloat(cleanAmount) : 0

    const rawData = {
        clientName: formData.get('clientName'),
        amount: amount,
        status: formData.get('status')
    }

    const validation = invoiceSchema.safeParse(rawData)

    if (!validation.success) {
        return { message: 'Validation Error', errors: validation.error.flatten().fieldErrors }
    }

    const { clientName, status } = validation.data

    try {
        await db`INSERT INTO invoices (client_name, amount, status, date)
                 VALUES (${clientName}, ${amount}, ${status}, ${new Date().toISOString()})`
    } catch (error) {
        console.error('DB Error:', error)
        return { message: 'Database Error' }
    }

    revalidatePath('/finance')
    return { message: 'Invoice added successfully' }
}

export async function updateLeadStatus(id: string, newStatus: string) {
    try {
        await db`UPDATE leads SET status = ${newStatus} WHERE id = ${id}`
    } catch (error) {
        console.error('Error updating status:', error)
    }
    revalidatePath('/leads')
}

export async function addProject(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        head: formData.get('head'),
        deadline: formData.get('deadline'),
    }

    const validation = projectSchema.safeParse(rawData)

    if (!validation.success) {
        return { message: 'Validation Error', errors: validation.error.flatten().fieldErrors }
    }

    const { name, head, deadline } = validation.data
    const status = 'Onboarding'

    try {
        await db`INSERT INTO projects (name, head, deadline, status)
                 VALUES (${name}, ${head}, ${deadline}, ${status})`
    } catch (error) {
        console.error('Error adding project:', error)
        return { message: 'Failed to add project' }
    }

    revalidatePath('/operations')
    return { message: 'Project added successfully' }
}

export async function convertLeadToProject(leadId: string, companyName: string, head?: string, deadline?: string) {
    try {
        await db`INSERT INTO projects (name, head, status, deadline)
                 VALUES (${companyName + ' Campaign'}, ${head || 'Unassigned'}, ${'Onboarding'}, ${deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()})`

        await db`UPDATE leads SET status = 'Closed' WHERE id = ${leadId}`
    } catch (error) {
        console.error('Error converting lead:', error)
        return { success: false, message: 'Failed to create project' }
    }

    revalidatePath('/operations')
    revalidatePath('/leads')
    return { success: true, message: `Project created for ${companyName}` }
}

export async function deleteLead(leadId: string) {
    try {
        await db`DELETE FROM leads WHERE id = ${leadId}`
    } catch (error) {
        console.error('Error deleting lead:', error)
        return { success: false, message: 'Failed to delete lead' }
    }

    revalidatePath('/leads')
    return { success: true, message: 'Lead deleted' }
}

export async function importLeads(leads: any[]) {
    if (!leads || leads.length === 0) {
        return { success: false, message: 'No data found in CSV' }
    }

    const formattedLeads = leads.map(lead => ({
        company: lead['Name company'] || lead['Company'] || 'Unknown Company',
        contact_person: lead['name of person'] || lead['Name'] || 'Unknown Contact',
        designation: lead['designation'] || lead['Designation'] || '',
        phone: lead['contact'] || lead['Contact'] || '',
        subject: lead['subject'] || lead['Subject'] || '',
        email: lead['email'] || lead['Email'] || '',
        status: 'Cold Lead',
        value: 0,
        source: 'CSV Import'
    }))

    try {
        for (const lead of formattedLeads) {
            await db`INSERT INTO leads (company, contact_person, designation, phone, subject, email, status, value, source)
                     VALUES (${lead.company}, ${lead.contact_person}, ${lead.designation}, ${lead.phone}, ${lead.subject}, ${lead.email}, ${lead.status}, ${lead.value}, ${lead.source})`
        }
    } catch (error: any) {
        console.error('Import Error:', error)
        return { success: false, message: error.message }
    }

    revalidatePath('/leads')
    return { success: true, count: formattedLeads.length }
}

export async function addTeamMember(formData: FormData) {
    const session = await auth()
    if (!session || (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head')) {
        throw new Error("Unauthorized: Only Admin or Ops Head can provision new user access.")
    }

    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const status = formData.get('status') as string
    const email = formData.get('email') as string || `${name.toLowerCase()}@rfrncs.com`

    if (!name || !role) {
        return { error: 'Name and Role are required' }
    }

    const avatarId = Math.floor(Math.random() * 8) + 1
    const avatar = `/avatars/0${avatarId}.png`

    try {
        await db`INSERT INTO team_members (name, role, status, efficiency, avatar)
                 VALUES (${name}, ${role}, ${status}, ${'99%'}, ${avatar})`
                 
        await db`INSERT INTO users (name, email, role, image)
                 VALUES (${name}, ${email}, ${role}, ${avatar})`
    } catch (error: any) {
        console.error('Error adding team member:', error)
        return { error: error.message }
    }

    revalidatePath('/team')
    return { success: true }
}

export async function updateInvoiceStatus(id: string, newStatus: string) {
    try {
        await db`UPDATE invoices SET status = ${newStatus} WHERE id = ${id}`
    } catch (error) {
        console.error('Error updating invoice status:', error)
        return { success: false, message: 'Failed to update status' }
    }

    revalidatePath('/finance')
    return { success: true, message: 'Status updated' }
}

export async function deleteInvoice(id: string) {
    try {
        await db`DELETE FROM invoices WHERE id = ${id}`
    } catch (error) {
        console.error('Error deleting invoice:', error)
        return { success: false, message: 'Failed to delete invoice' }
    }

    revalidatePath('/finance')
    return { success: true, message: 'Invoice deleted' }
}

export async function addAgentTool(name: string, secret: string) {
    const maskedSecret = `${secret.slice(0, 3)}...${secret.slice(-4)}`

    try {
        await db`INSERT INTO agent_tools (name, masked_secret)
                 VALUES (${name}, ${maskedSecret})`
    } catch (error) {
        console.error('Error adding agent tool:', error)
        return { success: false, message: 'Failed to add tool' }
    }

    revalidatePath('/tools')
    return { success: true, message: 'Agent Tool Connected' }
}

export async function getAgentTools() {
    try {
        const data = await db`SELECT * FROM agent_tools ORDER BY created_at DESC`
        return data || []
    } catch (error) {
        console.error('Error fetching agent tools:', error)
        return []
    }
}

export async function importProjects(projects: any[]) {
    if (!projects || projects.length === 0) return { success: false, message: 'No data found in CSV' }

    const formattedProjects = projects.map(p => ({
        name: p['Project Name'] || p['Name'] || p['name'] || 'Unnamed Project',
        head: p['Head'] || p['Project Head'] || p['head'] || 'Unassigned',
        deadline: p['Deadline'] || p['deadline'] || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: p['Status'] || p['status'] || 'Onboarding'
    }))

    try {
        for (const project of formattedProjects) {
            await db`INSERT INTO projects (name, head, deadline, status)
                     VALUES (${project.name}, ${project.head}, ${project.deadline}, ${project.status})`
        }
    } catch (error: any) {
        console.error('Operations Import Error:', error)
        return { success: false, message: error.message }
    }

    revalidatePath('/operations')
    return { success: true, count: formattedProjects.length }
}
