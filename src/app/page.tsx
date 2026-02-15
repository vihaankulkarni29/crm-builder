import { BackgroundCircles } from "@/components/ui/background-circles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Briefcase, Activity } from "lucide-react";
import { getLeads, getInvoices, getProjects } from "@/lib/data";
import { DashboardMetricCard } from "@/components/ui/dashboard-overview";

export const revalidate = 0;

export default async function Dashboard() {
    const [leads, invoices, projects] = await Promise.all([
        getLeads(),
        getInvoices(),
        getProjects()
    ]);

    // 1. Total Revenue: Sum of all PAID invoices
    const totalRevenue = invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

    const revenueFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    // 2. Active Leads: Status != Closed
    const activeLeads = leads.filter(l => l.status !== 'Closed').length;

    // 3. Active Projects: Status != Completed (Assuming 'Completed' is a status, otherwise all)
    const activeProjects = projects.filter(p => p.status !== 'Completed').length;

    // 4. Efficiency: Mock calculation or based on ratio
    // For now, let's make it ratio of On Track projects
    const onTrackProjects = projects.filter(p => p.status === 'On Track').length;
    const efficiency = projects.length > 0 ? Math.round((onTrackProjects / projects.length) * 100) : 100;

    return (
        <div className="relative min-h-screen">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <BackgroundCircles title="" description="" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col gap-8 p-8 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-lg text-muted-foreground">Welcome back to RFRNCS OS.</p>
                </div>

                {/* Metrics Grid - Spaced Out */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardMetricCard
                        title="Total Revenue"
                        value={revenueFormatter.format(totalRevenue)}
                        icon={DollarSign}
                        trendChange="+20.1%"
                        trendType="up"
                    />
                    <DashboardMetricCard
                        title="Active Leads"
                        value={activeLeads.toString()}
                        icon={Users}
                        trendChange={`${leads.length - activeLeads} closed`}
                        trendType="neutral"
                    />
                    <DashboardMetricCard
                        title="Active Projects"
                        value={activeProjects.toString()}
                        icon={Briefcase}
                        trendChange={`${projects.length} total`}
                        trendType="neutral"
                    />
                    <DashboardMetricCard
                        title="Efficiency"
                        value={`${efficiency}%`}
                        icon={Activity}
                        trendChange="On Track"
                        trendType={efficiency >= 80 ? 'up' : 'down'}
                    />
                </div>

                {/* Action Area (Placeholder for Graphs/tables) */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                [Graph Component Here]
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Activity items... */}
                                <div className="flex items-center">
                                    <div className="ml-auto font-medium">Just now</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
