import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { CSVImport } from "@/components/leads/CSVImport";
import { MobileLeadList } from "@/components/leads/MobileLeadList";
import { getLeads } from "@/lib/data";

export const revalidate = 0;

export default async function LeadsPage() {
    const leads = await getLeads();

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads Pipeline</h1>
                    <p className="text-muted-foreground">Manage and track potential clients.</p>
                </div>
                <div className="flex gap-2">
                    <CSVImport />
                    <AddLeadDialog />
                </div>
            </div>

            {/* Desktop: Kanban Board */}
            <div className="hidden md:block flex-1 overflow-x-auto pb-4">
                <div className="min-w-[1000px] h-full">
                    <KanbanBoard initialLeads={leads} />
                </div>
            </div>

            {/* Mobile: Card List with Status Dropdown */}
            <div className="block md:hidden">
                <MobileLeadList leads={leads} />
            </div>
        </div>
    );
}
