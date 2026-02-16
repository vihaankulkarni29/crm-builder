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

    // Group invoices by month
    const revenueByMonth = invoices.reduce((acc, invoice) => {
        if (invoice.status === "Paid") {
            const date = new Date(invoice.date);
            const month = date.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"

            const existing = acc.find(item => item.name === month);
            if (existing) {
                existing.total += Number(invoice.amount);
            } else {
                acc.push({ name: month, total: Number(invoice.amount) });
            }
        }
        return acc;
    }, [] as { name: string; total: number }[]);

    // Sort months chronologically if needed, but for now assuming data order or simple usage.
    // In a real app, you might want to ensure "Jan" comes before "Feb" regardless of data order.

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
                        <div className="h-[200px] w-full">
                            <RevenueChart data={revenueByMonth} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
