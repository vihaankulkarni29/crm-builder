'use client'

import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateInvoiceStatus, deleteInvoice } from "@/app/actions"
import { toast } from "sonner"

export function InvoiceActions({ invoiceId }: { invoiceId: string }) {

    async function handleStatusUpdate(status: string) {
        const result = await updateInvoiceStatus(invoiceId, status)
        if (result.success) {
            toast.success(`Invoice marked as ${status}`)
        } else {
            toast.error("Failed to update status")
        }
    }

    async function handleDelete() {
        if (!confirm("Delete this invoice permanently?")) return

        const result = await deleteInvoice(invoiceId)
        if (result.success) {
            toast.success("Invoice deleted")
        } else {
            toast.error("Failed to delete invoice")
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusUpdate('Paid')}>Mark as Paid</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('Pending')}>Mark as Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('Overdue')}>Mark as Overdue</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
