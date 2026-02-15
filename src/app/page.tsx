import { BackgroundCircles } from "@/components/ui/background-circles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Briefcase, Activity } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="relative min-h-screen">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
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
                    <DashboardCard title="Total Revenue" value="₹4,231,000" icon={DollarSign} trend="+20.1%" />
                    <DashboardCard title="Active Leads" value="12" icon={Users} trend="+2 new" />
                    <DashboardCard title="Projects" value="8" icon={Briefcase} trend="3 nearing deadline" />
                    <DashboardCard title="Efficiency" value="94.2%" icon={Activity} trend="+1.2%" />
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

// Helper Component for consistency
// @ts-ignore
function DashboardCard({ title, value, icon: Icon, trend }: any) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{trend}</p>
            </CardContent>
        </Card>
    );
}
