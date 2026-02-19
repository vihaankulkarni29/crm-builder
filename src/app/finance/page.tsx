import { getInvoices } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Clock, AlertCircle } from "lucide-react"
import { AddInvoiceDialog } from "@/components/finance/AddInvoiceDialog"
import { InvoiceActions } from "@/components/finance/InvoiceActions"

export const revalidate = 0;

export default async function FinancePage() {
    const invoices = await getInvoices()
    // ... (rest of the component)


    // Calculate metrics
    const totalRevenue = invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.amount, 0)

    const pendingAmount = invoices
        .filter(inv => inv.status === 'Pending')
        .reduce((sum, inv) => sum + inv.amount, 0)

    const overdueAmount = invoices
        .filter(inv => inv.status === 'Overdue')
        .reduce((sum, inv) => sum + inv.amount, 0)

    const pendingCount = invoices.filter(inv => inv.status === 'Pending').length
    const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length

    return (
        <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
                <AddInvoiceDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime collected</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {pendingCount} Invoices Pending
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">₹{overdueAmount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {overdueCount} Invoice{overdueCount !== 1 ? 's' : ''} Overdue
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                        Latest financial activity across all clients.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{transaction.clientName}</TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.status === "Paid" ? "default" : transaction.status === "Overdue" ? "destructive" : "secondary"}>
                                                {transaction.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">₹{transaction.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <InvoiceActions invoiceId={transaction.id} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
