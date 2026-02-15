import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog"; // Import it
import { getLeads } from "@/lib/data";

export const revalidate = 0;

export default async function LeadsPage() {
    const leads = await getLeads();

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads Pipeline</h1>
                    <p className="text-muted-foreground">Manage and track potential clients.</p>
                </div>
                {/* The New Button */}
                <AddLeadDialog />
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="min-w-[1000px] h-full">
                    <KanbanBoard initialLeads={leads} />
                </div>
            </div>
        </div>
    );
}
