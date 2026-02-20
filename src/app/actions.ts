'use server'

import { supabaseAdmin as supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

import { leadSchema, invoiceSchema, projectSchema } from '@/lib/schemas'

function parseCurrency(value: any) {
    if (!value) return 0
    // Remove non-numeric characters except dot and minus
    const cleanValue = String(value).replace(/[^0-9.-]+/g, "")
    const parsed = parseFloat(cleanValue)
    return isNaN(parsed) ? 0 : parsed
}

export async function addLead(formData: FormData) {
    const value = parseCurrency(formData.get('value'))

    // Robust defaults
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
    // email and source are already handled or validated

    const status = (formData.get('status') as string) || 'Cold Lead'

    const { error } = await supabase
        .from('leads')
        .insert([{
            company,
            contact_person: contact,
            email: validation.data.email || '',
            value: validation.data.value, // Use validated value
            status,
            source: validation.data.source || 'Manual'
        }])

    if (error) {
        console.error('Error adding lead:', error)
        return { message: 'Failed to add lead' }
    }

    revalidatePath('/leads')
    return { message: 'Lead added successfully' }
}

export async function addInvoice(formData: FormData) {
    // 1. Safe Number Parsing
    const rawAmount = formData.get('amount')
    // Remove non-numeric chars (e.g. "₹10,000" -> "10000")
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

    // 2. Database Insert
    const { error } = await supabase
        .from('invoices')
        .insert([{
            client_name: clientName, // Ensure this matches DB column
            amount: amount,
            status: status,
            date: new Date().toISOString()
        }])

    if (error) {
        console.error('Supabase Error:', error)
        return { message: error.message || 'Database Error' }
    }

    revalidatePath('/finance')
    return { message: 'Invoice added successfully' }
}

export async function updateLeadStatus(id: string, newStatus: string) {
    const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id)

    if (error) console.error('Error updating status:', error)
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

    const { error } = await supabase
        .from('projects')
        .insert([{
            name,
            head,
            deadline,
            status
        }])

    if (error) {
        console.error('Error adding project:', error)
        return { message: 'Failed to add project' }
    }

    revalidatePath('/operations')
    return { message: 'Project added successfully' }
}

export async function convertLeadToProject(leadId: string, companyName: string, head: string, deadline: string) {
    // 1. Create the Project
    const { error: projectError } = await supabase
        .from('projects')
        .insert([{
            name: `${companyName} Campaign`, // Auto-naming
            head: head || 'Unassigned',
            status: 'Onboarding',
            deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }])

    if (projectError) {
        console.error('Error creating project from lead:', projectError)
        return { success: false, message: 'Failed to create project' }
    }

    // 2. Mark Lead as Closed (if not already)
    const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'Closed' })
        .eq('id', leadId)

    if (leadError) {
        console.error('Error updating lead status:', leadError)
    }

    revalidatePath('/operations')
    revalidatePath('/leads')
    return { success: true, message: `Project created for ${companyName}` }
}

export async function deleteLead(leadId: string) {
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)

    if (error) {
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

    const formattedLeads = leads.map(lead => {
        // Map CSV headers to DB columns
        // CSV: Name company, name of person, designation, contact, subject
        // DB: company, contact_person, designation, phone, subject, email (optional/derived), status (default), value (default)

        return {
            company: lead['Name company'] || lead['Company'] || 'Unknown Company',
            contact_person: lead['name of person'] || lead['Name'] || 'Unknown Contact',
            designation: lead['designation'] || lead['Designation'] || '',
            phone: lead['contact'] || lead['Contact'] || '',
            subject: lead['subject'] || lead['Subject'] || '',
            email: lead['email'] || lead['Email'] || '',
            status: 'Cold Lead',
            value: 0,
            source: 'CSV Import'
        }
    })

    const { error, count } = await supabase
        .from('leads')
        .insert(formattedLeads)
        .select()

    if (error) {
        console.error('Import Error:', error)
        return { success: false, message: error.message }
    }

    revalidatePath('/leads')
    return { success: true, count: formattedLeads.length }
}

export async function addTeamMember(formData: FormData) {
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const status = formData.get('status') as string

    if (!name || !role) {
        return { error: 'Name and Role are required' }
    }

    // Assign a random avatar for now
    const avatarId = Math.floor(Math.random() * 8) + 1
    const avatar = `/avatars/0${avatarId}.png`

    const { error } = await supabase
        .from('team_members')
        .insert([{
            name,
            role,
            status,
            efficiency: '99%', // Default optimistic efficiency
            avatar
        }])

    if (error) {
        console.error('Error adding team member:', error)
        return { error: error.message }
    }

    revalidatePath('/team')
    return { success: true }
}
export async function updateInvoiceStatus(id: string, newStatus: string) {
    const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', id)

    if (error) {
        console.error('Error updating invoice status:', error)
        return { success: false, message: 'Failed to update status' }
    }

    revalidatePath('/finance')
    return { success: true, message: 'Status updated' }
}

export async function deleteInvoice(id: string) {
    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting invoice:', error)
        return { success: false, message: 'Failed to delete invoice' }
    }

    revalidatePath('/finance')
    return { success: true, message: 'Invoice deleted' }
}

export async function addAgentTool(name: string, secret: string) {
    // Mock "Secure Save" - In production, use Supabase Vault or Hash
    const maskedSecret = `${secret.slice(0, 3)}...${secret.slice(-4)}`

    const { error } = await supabase
        .from('agent_tools')
        .insert([{
            name,
            masked_secret: maskedSecret
        }])

    if (error) {
        console.error('Error adding agent tool:', error)
        return { success: false, message: 'Failed to add tool' }
    }

    revalidatePath('/tools')
    return { success: true, message: 'Agent Tool Connected' }
}

export async function getAgentTools() {
    const { data, error } = await supabase
        .from('agent_tools')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching agent tools:', error)
        return []
    }

    return data
}

export async function importProjects(projects: any[]) {
    if (!projects || projects.length === 0) return { success: false, message: 'No data found in CSV' }

    const formattedProjects = projects.map(p => {
        // ⚠️ CSV MAPPING: Change the bracketed text to match exact CSV headers
        return {
            name: p['Project Name'] || p['Name'] || p['name'] || 'Unnamed Project',
            head: p['Head'] || p['Project Head'] || p['head'] || 'Unassigned',
            deadline: p['Deadline'] || p['deadline'] || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: p['Status'] || p['status'] || 'Onboarding'
        }
    })

    const { error, count } = await supabase
        .from('projects')
        .insert(formattedProjects)
        .select()

    if (error) {
        console.error('Operations Import Error:', error)
        return { success: false, message: error.message }
    }

    revalidatePath('/operations')
    return { success: true, count: formattedProjects.length }
}
