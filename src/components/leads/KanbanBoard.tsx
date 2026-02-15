"use client"

import { Lead } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus } from "lucide-react"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { updateLeadStatus } from "@/app/actions"

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

    useEffect(() => {
        setLeads(initialLeads)
    }, [initialLeads])

    const onDragEnd = (result: DropResult) => {
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

        // Optimistic Update
        const updatedLeads = leads.map(lead =>
            lead.id === draggableId ? { ...lead, status: newStatus } : lead
        )
        setLeads(updatedLeads)

        // Server Update
        updateLeadStatus(draggableId, newStatus)
    }

    return (
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
                                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
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
                                        <Button variant="outline" className="w-full border-dashed">
                                            <Plus className="mr-2 h-4 w-4" /> Add Lead
                                        </Button>
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    )
}
