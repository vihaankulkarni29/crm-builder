"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Briefcase, DollarSign, UserCircle, Bot, Settings, LogOut, Filter } from "lucide-react"
import { HelpDialog } from "@/components/ui/help-dialog"

const sidebarItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/prospects", label: "Sandbox", icon: Filter },
    { href: "/operations", label: "Operations", icon: Briefcase },
    { href: "/finance", label: "Finance", icon: DollarSign },
    { href: "/team", label: "Team", icon: UserCircle },
    { href: "/tools", label: "Agent Tools", icon: Bot },
    { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return (
            <div className="hidden md:flex h-screen w-64 flex-col border-r bg-card animate-pulse">
                <div className="h-16 border-b px-6 flex items-center">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
                <div className="flex-1 py-4 px-4 space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-8 bg-muted rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            {/* ... header and nav ... */}
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold tracking-tight">RFRNCS OS</span>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    pathname === item.href
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Help Section */}
            <div className="p-4 mt-auto">
                <HelpDialog />
            </div>

            <div className="border-t p-4 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-medium">{session?.user?.name || "Team Member"}</span>
                        <span className="text-xs text-muted-foreground truncate">{session?.user?.email || "Resolving Identity..."}</span>
                    </div>
                </div>
                <button 
                    onClick={() => signOut({ callbackUrl: '/login' })} 
                    className="flex justify-center items-center gap-2 text-xs text-red-500/60 hover:text-red-500 mt-2 px-2 py-2 rounded-md transition-all hover:bg-red-500/10 w-full"
                >
                    <LogOut className="h-3 w-3" />
                    Logout
                </button>
            </div>
        </div>
    )
}
