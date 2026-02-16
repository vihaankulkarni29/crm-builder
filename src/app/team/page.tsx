import { ContributorsTable } from "@/components/ui/contributors-table";
import { AddMemberDialog } from "@/components/ui/AddMemberDialog";
import { getTeamMembers } from "@/lib/data";

export const revalidate = 0;

export default async function TeamPage() {
    const members = await getTeamMembers();

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)]">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Team Operations</h1>
                    <p className="text-muted-foreground">Manage contributors and track efficiency.</p>
                </div>
                <AddMemberDialog />
            </div>
            <ContributorsTable members={members} />
        </div>
    );
}
