import { Lead, Project, Invoice } from "@/types"

export const leads: Lead[] = [
    {
        id: "1",
        companyName: "Acme Corp",
        poc: "John Doe",
        value: 5000,
        status: "Cold Lead",
        source: "Apollo",
    },
    {
        id: "2",
        companyName: "Globex",
        poc: "Jane Smith",
        value: 12000,
        status: "Hot Lead",
        source: "Website",
    },
    {
        id: "3",
        companyName: "Soylent Corp",
        poc: "Bob Johnson",
        value: 8500,
        status: "Negotiation",
        source: "Referral",
    },
    {
        id: "4",
        companyName: "Initech",
        poc: "Peter Gibbons",
        value: 15000,
        status: "Closed",
        source: "Seamless",
    },
    {
        id: "5",
        companyName: "Umbrella Corp",
        poc: "Albert Wesker",
        value: 25000,
        status: "Hot Lead",
        source: "Apollo",
    },
]

export const projects: Project[] = [
    {
        id: "1",
        name: "Website Redesign",
        head: {
            name: "Alice",
            avatar: "https://github.com/shadcn.png", // placeholder
        },
        status: "On Track",
        deadline: "2024-03-15",
    },
    {
        id: "2",
        name: "Mobile App MVP",
        head: {
            name: "Bob",
            avatar: "https://github.com/shadcn.png",
        },
        status: "Delayed",
        deadline: "2024-02-28",
    },
    {
        id: "3",
        name: "Marketing Campaign",
        head: {
            name: "Charlie",
            avatar: "https://github.com/shadcn.png",
        },
        status: "On Track",
        deadline: "2024-04-01",
    },
]

export const recentTransactions: Invoice[] = [
    {
        id: "INV-001",
        clientName: "Acme Corp",
        amount: 5000,
        status: "Paid",
        date: "2024-01-15",
    },
    {
        id: "INV-002",
        clientName: "Globex",
        amount: 12000,
        status: "Pending",
        date: "2024-02-01",
    },
    {
        id: "INV-003",
        clientName: "Soylent Corp",
        amount: 8500,
        status: "Overdue",
        date: "2024-01-20",
    },
    {
        id: "INV-004",
        clientName: "Initech",
        amount: 2500,
        status: "Pending",
        date: "2024-02-10",
    },
]
