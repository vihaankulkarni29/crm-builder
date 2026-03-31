import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addLead, addInvoice, addProject, convertLeadToProject } from './actions'

// Mock Neon DB
const mockDb = vi.fn()

vi.mock('@/lib/db', () => ({
    db: (...args: any[]) => mockDb(...args),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockDb.mockResolvedValue([])
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
            expect(mockDb).toHaveBeenCalled()
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
            expect(mockDb).not.toHaveBeenCalled()
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
            expect(mockDb).toHaveBeenCalled()
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
            expect(mockDb).toHaveBeenCalled()
        })
    })

    describe('convertLeadToProject', () => {
        it('should create project and update lead status', async () => {
            const result = await convertLeadToProject('lead-123', 'New Client Co')

            expect(result).toEqual({ success: true, message: 'Project created for New Client Co' })
            // Should have been called twice: INSERT project + UPDATE lead
            expect(mockDb).toHaveBeenCalledTimes(2)
        })
    })
})
