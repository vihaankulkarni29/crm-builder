import { KanbanBoard } from "@/components/leads/KanbanBoard"
import { leads } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

export default function LeadsPage() {
    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                <Button variant="outline" className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Sync Google Sheets
                </Button>
            </div>

            <div className="flex-1 overflow-auto">
                <KanbanBoard leads={leads} />
            </div>
        </div>
    )
}
