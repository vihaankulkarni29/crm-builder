import { ProjectTable } from "@/components/operations/ProjectTable"
import { projects } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OperationsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="all">All Projects</TabsTrigger>
                        <TabsTrigger value="my">My Projects</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="all">
                    <ProjectTable projects={projects} />
                </TabsContent>
                <TabsContent value="my">
                    {/* Mocking "My Projects" filter by showing a subset or empty state */}
                    <ProjectTable projects={projects.filter(p => p.head.name === "Alice")} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
