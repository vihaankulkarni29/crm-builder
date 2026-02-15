'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

import { leadSchema, invoiceSchema, projectSchema } from '@/lib/schemas'

export async function addLead(formData: FormData) {
    const rawData = {
        company: formData.get('company'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        value: parseFloat(formData.get('value') as string),
        source: formData.get('source'),
    }

    const validation = leadSchema.safeParse(rawData)

    if (!validation.success) {
        return { message: 'Validation Error', errors: validation.error.flatten().fieldErrors }
    }

    const { company, contact, email, value, source } = validation.data
    const status = 'Cold Lead'

    const { error } = await supabase
        .from('leads')
        .insert([{
            company,
            contact_person: contact,
            email,
            value,
            status,
            source
        }])

    if (error) {
        console.error('Error adding lead:', error)
        return { message: 'Failed to add lead' }
    }

    revalidatePath('/leads')
    return { message: 'Lead added successfully' }
}

export async function addInvoice(formData: FormData) {
    const rawData = {
        clientName: formData.get('clientName'),
        amount: parseFloat(formData.get('amount') as string),
        status: formData.get('status'),
    }

    const validation = invoiceSchema.safeParse(rawData)

    if (!validation.success) {
        return { message: 'Validation Error', errors: validation.error.flatten().fieldErrors }
    }

    const { clientName, amount, status } = validation.data
    const date = new Date().toISOString()

    const { error } = await supabase
        .from('invoices')
        .insert([{
            client_name: clientName,
            amount,
            status,
            date
        }])

    if (error) {
        console.error('Error adding invoice:', error)
        return { message: 'Failed to add invoice' }
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

export async function convertLeadToProject(leadId: string, companyName: string) {
    // 1. Create the Project
    const { error: projectError } = await supabase
        .from('projects')
        .insert([{
            name: `${companyName} Campaign`, // Auto-naming
            head: 'Unassigned',
            status: 'Onboarding',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 7 days
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
