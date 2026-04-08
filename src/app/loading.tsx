import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            {/* Background Skeletons */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20">
                <div className="h-[500px] w-[500px] rounded-full border border-white/5 animate-pulse" />
                <div className="absolute h-[300px] w-[300px] rounded-full border border-white/10 animate-pulse delay-75" />
            </div>

            {/* Content Shell */}
            <div className="relative z-10 flex flex-col gap-8 p-8 max-w-7xl mx-auto h-full">
                {/* Title Skeleton */}
                <div className="flex flex-col gap-2">
                    <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-5 w-64 bg-white/5 rounded-md animate-pulse delay-100" />
                </div>

                {/* DashboardOverview Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm animate-pulse" />
                    ))}
                </div>

                {/* Main Grid Skeleton */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-7">
                    {/* Revenue Chart Skeleton — 4 cols */}
                    <div className="col-span-4 h-[350px] rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 flex flex-col gap-4 animate-pulse">
                        <div className="h-6 w-32 bg-white/10 rounded-md" />
                        <div className="flex-1 w-full bg-white/5 rounded-lg" />
                    </div>

                    {/* Forensic Pulse Skeleton — 3 cols */}
                    <div className="col-span-3 h-[350px] rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 flex flex-col gap-6 animate-pulse delay-150">
                        <div className="flex flex-col gap-2">
                            <div className="h-6 w-40 bg-white/10 rounded-md" />
                            <div className="h-4 w-56 bg-white/5 rounded-md" />
                        </div>
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-white/10" />
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="h-4 w-24 bg-white/10 rounded-md" />
                                        <div className="h-3 w-48 bg-white/5 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Status Indicator */}
            <div className="absolute bottom-8 right-8 flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl z-20">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                <span className="text-xs font-bold text-white/50 tracking-widest uppercase italic">Establishing Uplink...</span>
            </div>
        </div>
    )
}
