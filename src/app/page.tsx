import { BackgroundCircles } from "@/components/ui/background-circles";
import { DashboardOverview } from "@/components/ui/dashboard-overview";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { getInvoices, getLeads, getProjects } from "@/lib/data";

export const revalidate = 0;

export default async function Dashboard() {
    // Fetch real data for the metrics
    const leads = await getLeads();
    const projects = await getProjects();
    const invoices = await getInvoices();

    // Calculate Metrics
    const activeLeads = leads.filter((l) => l.status !== "Closed" && l.status !== "Dead").length;
    const activeProjects = projects.filter((p) => p.status !== "Completed").length;
    const totalRevenue = invoices
        .filter((i) => i.status === "Paid")
        .reduce((sum, i) => sum + Number(i.amount), 0);

    // Prepare Chart Data (Final Sprint Protocol)
    const chartData = [
        { name: "Jan", total: 0 }, { name: "Feb", total: 0 }, { name: "Mar", total: 0 },
        { name: "Apr", total: 0 }, { name: "May", total: 0 }, { name: "Jun", total: 0 }
    ];

    // Fill data from real invoices
    invoices.forEach(inv => {
        if (inv.status === 'Paid') {
            const month = new Date(inv.date).getMonth(); // 0 = Jan
            if (month < 6) { // Just for first 6 months as example
                chartData[month].total += Number(inv.amount);
            }
        }
    });

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* 1. The Background Layer (Z-Index 0) */}
            <div className="absolute inset-0 z-0">
                <BackgroundCircles title="" description="" />
            </div>

            {/* 2. The Content Layer (Z-Index 10) */}
            <div className="relative z-10 flex flex-col gap-8 p-8 max-w-7xl mx-auto">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight">RFRNCS OS</h1>
                    <p className="text-lg text-muted-foreground">
                        Operational Intelligence Dashboard
                    </p>
                </div>

                {/* The Metrics Component */}
                <DashboardOverview
                    totalRevenue={totalRevenue}
                    activeLeads={activeLeads}
                    activeProjects={activeProjects}
                />

                {/* Revenue Chart */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4 rounded-xl border bg-card/50 backdrop-blur-sm p-6 text-card-foreground shadow-sm">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">Revenue Trajectory</h3>
                        <div className="h-[200px] w-full mt-4">
                            <RevenueChart data={chartData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
