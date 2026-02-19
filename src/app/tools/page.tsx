'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Bot, Key, ShieldCheck, Plus } from "lucide-react"
import { addAgentTool, getAgentTools } from "@/app/actions"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function ToolsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // We'll fetch data in a server component way in real app, but for simplicity in this demo structure
    // we might need to make this a Server Component and have a Client Component for the form.
    // However, since we are in `page.tsx`, we can make it async and fetch data.
    // But to keep it simple with the interactive form, let's make a separate client component for the form/list interaction
    // OR just use a client component here if we don't mind client-side fetching (which we don't have hooks for easily with actions).
    // BETTER: Make this page async server component, pass data to client list.

    return (
        <ToolsDashboard />
    )
}

// -----------------------------------------------------------------------------
// We need to split this because page.tsx should be server-side to fetch initial data
// -----------------------------------------------------------------------------
import { useEffect } from "react"

function ToolsDashboard() {
    const [tools, setTools] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Hydrate list
        getAgentTools().then(data => {
            setTools(data)
            setLoading(false)
        })
    }, [])

    async function handleAddTool(formData: FormData) {
        const name = formData.get('name') as string
        const secret = formData.get('secret') as string

        if (!name || !secret) {
            toast.error("Name and Secret are required")
            return
        }

        const result = await addAgentTool(name, secret)
        if (result.success) {
            toast.success("Agent Connected")
            // Refresh list
            const updated = await getAgentTools()
            setTools(updated)
                // Reset form? browser handles it if using <form> but we might want to clear inputs manually or use Ref
                // Simple way: just reload or let user clear.
                ; (document.getElementById('add-tool-form') as HTMLFormElement).reset()
        } else {
            toast.error("Failed to connect agent")
        }
    }

    return (
        <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agent Tools</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage API access for your AI workforce.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <ShieldCheck className="h-4 w-4" />
                    <span>VPC Secured</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Connection Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" /> Connect New Agent
                        </CardTitle>
                        <CardDescription>
                            Generate a secure handshake for your custom agents.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="add-tool-form" action={handleAddTool} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Agent Name</Label>
                                <Input id="name" name="name" placeholder="e.g. Lead Scraper Bot 3000" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="secret">API Secret</Label>
                                <div className="relative">
                                    <Input
                                        id="secret"
                                        name="secret"
                                        type="password"
                                        placeholder="sk-..."
                                        required
                                        className="pr-10"
                                    />
                                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Keys are encrypted at rest. The system only stores a one-way hashed reference.
                                </p>
                            </div>
                            <Button type="submit" className="w-full">
                                <Bot className="mr-2 h-4 w-4" /> Connect Agent
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Active Tools List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" /> Active Agents
                        </CardTitle>
                        <CardDescription>
                            {tools.length} agent{tools.length !== 1 ? 's' : ''} currently authorized.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent Name</TableHead>
                                    <TableHead>Masked Key</TableHead>
                                    <TableHead className="text-right">Added</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4">Loading secure vault...</TableCell>
                                    </TableRow>
                                ) : tools.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                            No agents connected.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tools.map((tool) => (
                                        <TableRow key={tool.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                {tool.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {tool.masked_secret}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {new Date(tool.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
