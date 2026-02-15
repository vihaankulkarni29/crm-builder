'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function addLead(formData: FormData) {
    const company = formData.get('company') as string
    const contact = formData.get('contact') as string
    const email = formData.get('email') as string
    const value = parseFloat(formData.get('value') as string)
    // Defaulting to 'Cold Lead' to match data.ts
    const status = 'Cold Lead'
    const source = formData.get('source') as string

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
    const clientName = formData.get('clientName') as string
    const amount = parseFloat(formData.get('amount') as string)
    const status = formData.get('status') as string
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
