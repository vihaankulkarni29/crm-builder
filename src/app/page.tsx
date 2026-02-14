import ExampleUsage from "@/components/ui/dashboard-overview";

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            {/* New animated dashboard metrics from 21st.dev */}
            <ExampleUsage />
        </div>
    )
}
