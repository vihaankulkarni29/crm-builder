'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Project } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProjectStatus } from '@/app/actions'
import { toast } from 'sonner'
import { PROJECT_WORKFLOW } from '@/lib/workflow'
import { ProjectSheet } from './ProjectSheet'

interface KanbanBoardProps {
    initialData: Record<string, Project[]>
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
    const [data, setData] = useState(initialData)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result

        // Dropped outside a list
        if (!destination) return

        // No change in position
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const sourceColumn = [...data[source.droppableId]]
        const destColumn = [...data[destination.droppableId]]
        const [movedProject] = sourceColumn.splice(source.index, 1)

        // Constraint: Strike 3 - State Machine Guardrails
        // Even if we drop it, the "Update" logic handles the actual validity on backend.
        // But for Optimistic UI, we assume success unless the action fails.
        
        // Optimistic UI Update
        const newData = { ...data }
        movedProject.status = destination.droppableId as any
        
        if (source.droppableId === destination.droppableId) {
            sourceColumn.splice(destination.index, 0, movedProject)
            newData[source.droppableId] = sourceColumn
        } else {
            destColumn.splice(destination.index, 0, movedProject)
            newData[source.droppableId] = sourceColumn
            newData[destination.droppableId] = destColumn
        }

        setData(newData)

        // Server Action Trigger
        try {
            const res = await updateProjectStatus(movedProject.id, destination.droppableId)
            if (!res.success) {
                throw new Error(res.message || 'Invalid transition')
            }
            toast.success(`Project moved to ${destination.droppableId}`)
        } catch (error: any) {
            // Snap-Back Error Handling
            toast.error(error.message || 'Transition failed')
            setData(initialData) // Revert to server state (or keep a backup of previous local state)
        }
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10">
                {Object.keys(PROJECT_WORKFLOW).map((status) => (
                    <div key={status} className="flex-1 min-w-[280px]">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-sm font-semibold text-white/60 tracking-widest uppercase">
                                {status}
                            </h2>
                            <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-white/40">
                                {data[status]?.length || 0}
                            </span>
                        </div>
                        
                        <Droppable droppableId={status}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="flex flex-col gap-3 min-h-[500px] p-2 rounded-xl bg-white/[0.02] border border-white/5 transition-colors duration-200"
                                >
                                    {data[status]?.map((project, index) => (
                                        <Draggable key={project.id} draggableId={project.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <Card 
                                                        className="bg-white/5 border-white/10 backdrop-blur-md hover:border-white/20 transition-all cursor-grab active:cursor-grabbing group"
                                                        onClick={() => setSelectedProject(project)}
                                                    >
                                                        <CardHeader className="p-4 space-y-3">
                                                            <CardTitle className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                                {project.name}
                                                            </CardTitle>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6 border border-white/10">
                                                                        <AvatarImage src={project.head.avatar} />
                                                                        <AvatarFallback>{project.head.name[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-[10px] text-white/40 font-medium">{project.head.name}</span>
                                                                </div>
                                                                <span className="text-[10px] text-white/20">
                                                                    {new Date(project.deadline).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </CardHeader>
                                                    </Card>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>

            <ProjectSheet 
                project={selectedProject} 
                isOpen={!!selectedProject} 
                onClose={() => setSelectedProject(null)} 
            />
        </DragDropContext>
    )
}
