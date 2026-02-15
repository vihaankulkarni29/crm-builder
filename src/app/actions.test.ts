import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addLead, addInvoice, addProject, convertLeadToProject } from './actions'

// Mock Supabase
const { mockInsert, mockSelect, mockUpdate, mockEq, mockFrom } = vi.hoisted(() => {
    const mockInsert = vi.fn()
    const mockSelect = vi.fn()
    const mockEq = vi.fn()
    const mockUpdate = vi.fn(() => ({ eq: mockEq }))
    const mockFrom = vi.fn(() => ({
        insert: mockInsert,
        select: mockSelect,
        update: mockUpdate,
    }))
    return { mockInsert, mockSelect, mockUpdate, mockEq, mockFrom }
})

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: mockFrom,
    },
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockInsert.mockResolvedValue({ error: null })
        mockEq.mockResolvedValue({ error: null })
    })

    describe('addLead', () => {
        it('should validate and add a valid lead', async () => {
            const formData = new FormData()
            formData.append('company', 'Test Corp')
            formData.append('contact', 'John Doe')
            formData.append('email', 'john@example.com')
            formData.append('value', '5000')
            formData.append('source', 'Website')

            const result = await addLead(formData)

            expect(result).toEqual({ message: 'Lead added successfully' })
            expect(mockFrom).toHaveBeenCalledWith('leads')
            expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
                company: 'Test Corp',
                contact_person: 'John Doe',
                email: 'john@example.com',
                value: 5000,
                status: 'Cold Lead',
                source: 'Website'
            })])
        })

        it('should return validation error for invalid email', async () => {
            const formData = new FormData()
            formData.append('company', 'Test Corp')
            formData.append('contact', 'John Doe')
            formData.append('email', 'invalid-email')
            formData.append('value', '5000')
            formData.append('source', 'Website')

            const result = await addLead(formData)

            expect(result).toHaveProperty('errors')
            // @ts-ignore
            expect(result.errors.email).toBeDefined()
            expect(mockInsert).not.toHaveBeenCalled()
        })
    })

    describe('addInvoice', () => {
        it('should validate and add a valid invoice', async () => {
            const formData = new FormData()
            formData.append('clientName', 'Client A')
            formData.append('amount', '1000')
            formData.append('status', 'Pending')

            const result = await addInvoice(formData)

            expect(result).toEqual({ message: 'Invoice added successfully' })
            expect(mockFrom).toHaveBeenCalledWith('invoices')
            expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
                client_name: 'Client A',
                amount: 1000,
                status: 'Pending',
            })])
        })
    })

    describe('addProject', () => {
        it('should validate and add a valid project', async () => {
            const formData = new FormData()
            formData.append('name', 'New Project')
            formData.append('head', 'Vihaan')
            formData.append('deadline', '2024-12-31')

            const result = await addProject(formData)

            expect(result).toEqual({ message: 'Project added successfully' })
            expect(mockFrom).toHaveBeenCalledWith('projects')
            expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
                name: 'New Project',
                head: 'Vihaan',
                deadline: '2024-12-31',
                status: 'Onboarding'
            })])
        })
    })

    describe('convertLeadToProject', () => {
        it('should create project and update lead status', async () => {
            const result = await convertLeadToProject('lead-123', 'New Client Co')

            expect(result).toEqual({ message: 'Lead converted to Project successfully' })

            // Check Project Creation
            expect(mockFrom).toHaveBeenCalledWith('projects')
            expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
                name: 'New Client Co',
                head: 'Vihaan',
                status: 'Onboarding'
            })])

            // Check Lead Update
            expect(mockFrom).toHaveBeenCalledWith('leads')
            expect(mockUpdate).toHaveBeenCalledWith({ status: 'Closed' })
            expect(mockEq).toHaveBeenCalledWith('id', 'lead-123')
        })
    })
})
