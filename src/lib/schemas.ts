import { z } from 'zod'

export const leadSchema = z.object({
    company: z.string().min(2, "Company name must be at least 2 characters"),
    contact: z.string().min(2, "Contact name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    value: z.number().positive("Value must be positive"),
    source: z.string().min(1, "Source is required"),
})

export const invoiceSchema = z.object({
    clientName: z.string().min(2, "Client name must be at least 2 characters"),
    amount: z.number().positive("Amount must be positive"),
    status: z.enum(["Pending", "Paid", "Overdue"]),
})

export const projectSchema = z.object({
    name: z.string().min(2, "Project name must be at least 2 characters"),
    head: z.string().min(1, "Head is required"),
    deadline: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }),
})
