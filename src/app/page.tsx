import { BackgroundCircles } from "@/components/ui/background-circles";
import { DashboardOverview } from "@/components/ui/dashboard-overview";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { getInvoices, getLeads, getProjects, getGlobalActivity } from "@/lib/data";

export const revalidate = 0;

export default async function Dashboard() {
    const leads = await getLeads();
    const projects = await getProjects();
    const invoices = await getInvoices();
    const activity = await getGlobalActivity();

    const activeLeads = leads.filter((l) => l.status !== "Closed" && l.status !== "Dead").length;
    const activeProjects = projects.filter((p) => p.status !== "Completed").length;
    const totalRevenue = invoices
        .filter((i) => i.status === "Paid")
        .reduce((sum, i) => sum + Number(i.amount), 0);

    const chartData = [
        { name: "Jan", total: 0 }, { name: "Feb", total: 0 }, { name: "Mar", total: 0 },
        { name: "Apr", total: 0 }, { name: "May", total: 0 }, { name: "Jun", total: 0 }
    ];

    invoices.forEach(inv => {
        if (inv.status === 'Paid') {
            const month = new Date(inv.date).getMonth();
            if (month < 6) chartData[month].total += Number(inv.amount);
        }
    });

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <BackgroundCircles title="" description="" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-8 p-8 max-w-7xl mx-auto">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight">RFRNCS OS</h1>
                    <p className="text-lg text-muted-foreground">Operational Intelligence Dashboard</p>
                </div>

                <DashboardOverview
                    totalRevenue={totalRevenue}
                    activeLeads={activeLeads}
                    activeProjects={activeProjects}
                />

                <div className="grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-7">
                    {/* Revenue Chart — 4 cols */}
                    <div className="col-span-4 rounded-xl border bg-card/50 backdrop-blur-sm p-6 text-card-foreground shadow-sm">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">Revenue Trajectory</h3>
                        <div className="h-[200px] w-full mt-4">
                            <RevenueChart data={chartData} />
                        </div>
                    </div>

                    {/* Forensic Pulse — 3 cols */}
                    <div className="col-span-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold leading-none tracking-tight">Forensic Pulse</h3>
                                <p className="text-xs text-muted-foreground mt-1">Live agency activity feed</p>
                            </div>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="overflow-y-auto max-h-[280px] pr-1 scrollbar-thin scrollbar-thumb-white/10">
                            <ActivityFeed activity={activity} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
