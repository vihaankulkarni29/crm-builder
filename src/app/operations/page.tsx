import { KanbanBoard } from "@/components/operations/KanbanBoard"
import { getProjects } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddProjectDialog } from "@/components/operations/AddProjectDialog"
import { CSVImportOperations } from "@/components/operations/CSVImportOperations"
import { PROJECT_WORKFLOW } from "@/lib/workflow"
import { Project } from "@/types"

export const revalidate = 0;

export default async function OperationsPage() {
    const projects = await getProjects()

    // Transform flat array into grouped dictionary for Kanban
    const groupedProjects = Object.keys(PROJECT_WORKFLOW).reduce((acc, status) => {
        acc[status] = projects.filter(p => p.status === status)
        return acc
    }, {} as Record<string, Project[]>)

    return (
        <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
                <div className="flex gap-2">
                    <CSVImportOperations />
                    <AddProjectDialog />
                </div>
            </div>

            <Tabs defaultValue="board" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="board">Operations Board</TabsTrigger>
                        <TabsTrigger value="my">My Projects</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="board" className="mt-6">
                    <KanbanBoard initialData={groupedProjects} />
                </TabsContent>
                <TabsContent value="my" className="mt-6">
                    <div className="w-full">
                        <KanbanBoard 
                            initialData={Object.keys(PROJECT_WORKFLOW).reduce((acc, status) => {
                                acc[status] = projects.filter(p => p.status === status && p.head.name === "Alice")
                                return acc
                            }, {} as Record<string, Project[]>)} 
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

