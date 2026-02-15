import { ContributorsTable } from "@/components/ui/contributors-table";

export default function TeamPage() {
    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Team Operations</h1>
                <p className="text-muted-foreground">Manage contributors and track efficiency.</p>
            </div>
            <ContributorsTable />
        </div>
    );
}
