"use client"

import { Lead } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Plus, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { updateLeadStatus, convertLeadToProject, deleteLead } from "@/app/actions"
import { toast } from "sonner"
import { AddLeadDialog } from "./AddLeadDialog"

interface KanbanBoardProps {
    initialLeads: Lead[]
}

const columns: { id: Lead["status"]; title: string }[] = [
    { id: "Cold Lead", title: "Cold Leads" },
    { id: "Hot Lead", title: "Hot Leads" },
    { id: "Negotiation", title: "Negotiation" },
    { id: "Closed", title: "Closed" },
]

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads)
    const [convertDialogOpen, setConvertDialogOpen] = useState(false)
    const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null)
    const [isConverting, setIsConverting] = useState(false)

    useEffect(() => {
        setLeads(initialLeads)
    }, [initialLeads])

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        const newStatus = destination.droppableId as Lead["status"]
        const draggedLead = leads.find(l => l.id === draggableId)

        if (!draggedLead) return

        // Smart Convert Interception
        if (newStatus === 'Closed' && source.droppableId !== 'Closed') {
            setLeadToConvert(draggedLead)
            setConvertDialogOpen(true)
            return
        }

        // Standard Optimistic Update
        const updatedLeads = leads.map(lead =>
            lead.id === draggableId ? { ...lead, status: newStatus } : lead
        )
        setLeads(updatedLeads)
        await updateLeadStatus(draggableId, newStatus)
    }

    const handleConfirmConversion = async (formData: FormData) => {
        if (!leadToConvert) return
        setIsConverting(true)

        const head = formData.get('head') as string
        const deadline = formData.get('deadline') as string

        const result = await convertLeadToProject(leadToConvert.id, leadToConvert.companyName, head, deadline)

        if (result.success) {
            toast.success(result.message)
            // Update local state to move lead to closed
            setLeads(prev => prev.map(l => l.id === leadToConvert.id ? { ...l, status: 'Closed' } : l))
            setConvertDialogOpen(false)
        } else {
            toast.error(result.message)
        }
        setIsConverting(false)
    }

    const handleDelete = async (leadId: string) => {
        const result = await deleteLead(leadId)
        if (result.success) {
            toast.success("Lead Deleted")
            setLeads(prev => prev.filter(l => l.id !== leadId))
        } else {
            toast.error("Failed to delete lead")
        }
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-4 overflow-x-auto pb-4">
                    {columns.map((column) => {
                        const columnLeads = leads.filter((lead) => lead.status === column.id)

                        return (
                            <div key={column.id} className="w-[300px] min-w-[300px] flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">{column.title}</h3>
                                    <Badge variant="secondary" className="rounded-full px-2 py-0.5">
                                        {columnLeads.length}
                                    </Badge>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex flex-col gap-3 min-h-[150px] rounded-md p-2 transition-colors ${snapshot.isDraggingOver ? "bg-muted/50" : ""
                                                }`}
                                        >
                                            {columnLeads.map((lead, index) => (
                                                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <Card
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`cursor-grab hover:border-primary/50 transition-colors ${snapshot.isDragging ? "shadow-lg border-primary/50 rotate-2" : ""
                                                                }`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <CardHeader className="p-4 pb-2 space-y-0">
                                                                <div className="flex justify-between items-start">
                                                                    <Badge variant="outline" className="mb-2 w-fit">
                                                                        {lead.source}
                                                                    </Badge>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleDelete(lead.id)}
                                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <CardTitle className="text-base font-bold">{lead.companyName}</CardTitle>
                                                                <CardDescription className="text-xs">{lead.poc}</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-4 pt-2">
                                                                <div className="text-sm font-medium">
                                                                    Est. Value: ₹{lead.value.toLocaleString()}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            <AddLeadDialog />
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )
                    })}
                </div>
            </DragDropContext>

            <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Convert to Project</DialogTitle>
                        <DialogDescription>
                            Assign a head and deadline for the new project.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleConfirmConversion} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="head">Project Head</Label>
                            <Select name="head" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Head" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Vihaan">Vihaan</SelectItem>
                                    <SelectItem value="Zaid">Zaid</SelectItem>
                                    <SelectItem value="Brendan">Brendan</SelectItem>
                                    <SelectItem value="Ritwik">Ritwik</SelectItem>
                                    <SelectItem value="Pratik">Pratik</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <Input id="deadline" name="deadline" type="date" required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isConverting}>
                                {isConverting ? "Converting..." : "Confirm & Convert"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
