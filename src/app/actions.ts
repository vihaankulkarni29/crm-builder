'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { leadSchema, invoiceSchema, projectSchema, teamMemberSchema, statusUpdateSchema, agentToolSchema } from '@/lib/schemas'
import { logActivity } from '@/lib/audit'
import { PROJECT_WORKFLOW } from '@/lib/workflow'

function parseCurrency(value: any) {
    if (!value) return 0
    const cleanValue = String(value).replace(/[^0-9.-]+/g, "")
    const parsed = parseFloat(cleanValue)
    return isNaN(parsed) ? 0 : parsed
}

export async function addLead(formData: FormData) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

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
        return { message: 'Validation Error', errors: validation.error.flatten().fieldErrors, error: 'Bad Request' }
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
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')
    if (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head') throw new Error('Forbidden')

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
        return { message: 'Validation Error', errors: validation.error.flatten().fieldErrors, error: 'Bad Request' }
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
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    const validation = statusUpdateSchema.safeParse({ status: newStatus })
    if (!validation.success) {
        return { success: false, message: 'Bad Request' }
    }

    try {
        if (session.user?.role === 'Admin' || session.user?.role === 'Ops Head') {
            await db`UPDATE leads SET status = ${validation.data.status} WHERE id = ${id}`
        } else {
            await db`UPDATE leads SET status = ${validation.data.status} WHERE id = ${id} AND assigned_to = ${session.user?.name || ''}`
        }
        
        if (session.user?.id) {
            await logActivity(session.user.id, 'UPDATE_LEAD_STATUS', id, { newStatus: validation.data.status })
        }
    } catch (error) {
        console.error('Error updating status:', error)
    }
    revalidatePath('/leads')
    return { success: true }
}

export async function addProject(formData: FormData) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    const rawData = {
        name: formData.get('name'),
        head: formData.get('head'),
        deadline: formData.get('deadline'),
    }

    const validation = projectSchema.safeParse(rawData)

    if (!validation.success) {
        return { message: 'Validation Error', errors: validation.error.flatten().fieldErrors, error: 'Bad Request' }
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
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    try {
        await db`INSERT INTO projects (name, head, status, deadline)
                 VALUES (${companyName + ' Campaign'}, ${head || 'Unassigned'}, ${'Onboarding'}, ${deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()})`

        if (session.user?.role === 'Admin' || session.user?.role === 'Ops Head') {
            await db`UPDATE leads SET status = 'Closed' WHERE id = ${leadId}`
        } else {
            await db`UPDATE leads SET status = 'Closed' WHERE id = ${leadId} AND assigned_to = ${session.user?.name || ''}`
        }
    } catch (error) {
        console.error('Error converting lead:', error)
        return { success: false, message: 'Failed to create project' }
    }

    revalidatePath('/operations')
    revalidatePath('/leads')
    return { success: true, message: `Project created for ${companyName}` }
}

export async function deleteLead(leadId: string) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')
    if (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head') throw new Error('Forbidden')

    try {
        await db`DELETE FROM leads WHERE id = ${leadId}`
        if (session.user?.id) {
            await logActivity(session.user.id, 'DELETE_LEAD', leadId)
        }
    } catch (error) {
        console.error('Error deleting lead:', error)
        return { success: false, message: 'Failed to delete lead' }
    }

    revalidatePath('/leads')
    return { success: true, message: 'Lead deleted' }
}

export async function importLeads(leads: any[]) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')
    if (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head') throw new Error('Forbidden')

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
    if (!session) throw new Error('401 Unauthorized')
    if (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head') {
        throw new Error("Forbidden")
    }

    const rawData = {
        name: formData.get('name') as string,
        role: formData.get('role') as string,
        email: formData.get('email') as string || `${(formData.get('name') as string || '').toLowerCase()}@rfrncs.com`,
        status: formData.get('status') as string || 'Online'
    }

    const validation = teamMemberSchema.safeParse(rawData)

    if (!validation.success) {
        return { error: 'Bad Request', fieldErrors: validation.error.flatten().fieldErrors }
    }

    const { name, role, status, email } = validation.data

    const avatarId = Math.floor(Math.random() * 8) + 1
    const avatar = `/avatars/0${avatarId}.png`

    const tempPassword = Math.random().toString(36).slice(-8)

    try {
        await db`INSERT INTO team_members (name, role, status, efficiency, avatar)
                 VALUES (${name}, ${role}, ${status || 'Online'}, ${'99%'}, ${avatar})`
                 
        await db`INSERT INTO users (name, email, role, image, password_hash)
                 VALUES (${name}, ${email}, ${role}, ${avatar}, ${tempPassword})`
                 
        if (session.user?.id) {
            await logActivity(session.user.id, 'TEAM_INVITE', 'NEW_HIRE', { email, role, hireName: name })
        }
    } catch (error: any) {
        console.error('Error adding team member:', error)
        return { error: error.message }
    }

    revalidatePath('/team')
    return { success: true, tempPassword }
}

export async function updateInvoiceStatus(id: string, newStatus: string) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')
    if (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head') throw new Error('Forbidden')

    const validation = statusUpdateSchema.safeParse({ status: newStatus })
    if (!validation.success) {
        return { success: false, message: 'Bad Request' }
    }

    try {
        await db`UPDATE invoices SET status = ${validation.data.status} WHERE id = ${id}`
    } catch (error) {
        console.error('Error updating invoice status:', error)
        return { success: false, message: 'Failed to update status' }
    }

    revalidatePath('/finance')
    return { success: true, message: 'Status updated' }
}

export async function deleteInvoice(id: string) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')
    if (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head') throw new Error('Forbidden')

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
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')
    if (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head') throw new Error('Forbidden')

    const validation = agentToolSchema.safeParse({ name, secret })
    if (!validation.success) {
        return { success: false, message: 'Bad Request' }
    }

    const validName = validation.data.name
    const validSecret = validation.data.secret
    const maskedSecret = `${validSecret.slice(0, 3)}...${validSecret.slice(-4)}`

    try {
        await db`INSERT INTO agent_tools (name, masked_secret)
                 VALUES (${validName}, ${maskedSecret})`
    } catch (error) {
        console.error('Error adding agent tool:', error)
        return { success: false, message: 'Failed to add tool' }
    }

    revalidatePath('/tools')
    return { success: true, message: 'Agent Tool Connected' }
}

export async function getAgentTools() {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    try {
        const data = await db`SELECT * FROM agent_tools ORDER BY created_at DESC`
        return data || []
    } catch (error) {
        console.error('Error fetching agent tools:', error)
        return []
    }
}

export async function importProjects(projects: any[]) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')
    if (session.user?.role !== 'Admin' && session.user?.role !== 'Ops Head') throw new Error('Forbidden')

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

export async function updateProjectStatus(id: string, newStatus: string) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    const validation = statusUpdateSchema.safeParse({ status: newStatus })
    if (!validation.success) {
        return { success: false, message: 'Bad Request' }
    }

    try {
        let currentProjectRes
        if (session.user?.role === 'Admin' || session.user?.role === 'Ops Head') {
            currentProjectRes = await db`SELECT status FROM projects WHERE id = ${id}`
        } else {
            currentProjectRes = await db`SELECT status FROM projects WHERE id = ${id} AND head = ${session.user?.name || ''}`
        }

        if (currentProjectRes.length === 0) {
            return { success: false, message: 'Project not found or Unauthorized' }
        }

        const currentStatus = currentProjectRes[0].status
        
        const validTransitions = PROJECT_WORKFLOW[currentStatus] || []
        if (!validTransitions.includes(validation.data.status)) {
            throw new Error(`Invalid Transition: Cannot move from ${currentStatus} to ${validation.data.status}`)
        }

        await db`UPDATE projects SET status = ${validation.data.status} WHERE id = ${id}`
        
        if (session.user?.id) {
            await logActivity(session.user.id, 'UPDATE_PROJECT_STATUS', id, { 
                oldStatus: currentStatus, 
                newStatus: validation.data.status 
            })
        }
        
    } catch (error: any) {
        console.error('Error updating project status:', error)
        return { success: false, message: error.message || 'Failed to update project status' }
    }

    revalidatePath('/operations')
    return { success: true }
}

export async function addProjectTask(projectId: string, taskName: string) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    if (!taskName.trim()) {
        return { success: false, message: 'Task name is required' }
    }

    try {
        await db`INSERT INTO project_tasks (project_id, task_name) VALUES (${projectId}, ${taskName})`
    } catch (error) {
        console.error('Error adding project task:', error)
        return { success: false, message: 'Failed to add task' }
    }

    revalidatePath('/operations')
    return { success: true }
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    try {
        await db`UPDATE project_tasks SET is_completed = ${isCompleted} WHERE id = ${taskId}`
    } catch (error) {
        console.error('Error toggling project task:', error)
        return { success: false, message: 'Failed to toggle task' }
    }

    revalidatePath('/operations')
    return { success: true }
}

export async function addProjectComment(projectId: string, content: string) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    if (!content.trim()) {
        return { success: false, message: 'Comment content is required' }
    }

    try {
        await db`INSERT INTO project_comments (project_id, user_id, content) VALUES (${projectId}, ${session.user?.id}, ${content})`
        
        if (session.user?.id) {
            await logActivity(session.user.id, 'ADD_COMMENT', projectId, { contentPreview: content.substring(0, 30) })
        }
    } catch (error) {
        console.error('Error adding project comment:', error)
        return { success: false, message: 'Failed to add comment' }
    }

    revalidatePath('/operations')
    return { success: true }
}

export async function getProjectDetails(projectId: string) {
    const session = await auth()
    if (!session) throw new Error('401 Unauthorized')

    try {
        const tasks = await db`SELECT * FROM project_tasks WHERE project_id = ${projectId} ORDER BY created_at ASC`
        const comments = await db`
            SELECT pc.*, u.name as user_name, u.image as user_avatar 
            FROM project_comments pc
            LEFT JOIN users u ON pc.user_id = u.id
            WHERE pc.project_id = ${projectId} 
            ORDER BY pc.created_at ASC
        `
        return { tasks, comments }
    } catch (error) {
        console.error('Error fetching project details:', error)
        return { tasks: [], comments: [] }
    }
}
