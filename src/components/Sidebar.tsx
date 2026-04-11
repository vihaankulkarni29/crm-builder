"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Briefcase, DollarSign, UserCircle, Bot, Settings, LogOut, Filter } from "lucide-react"
import { HelpDialog } from "@/components/ui/help-dialog"

// ── Strike 1: Enterprise Workspace Logo ──────────────────────────────────────
function WorkspaceLogo() {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
            </div>
            <span className="text-lg font-bold tracking-wide text-gray-100">RFRNCS</span>
        </div>
    )
}

// ── Strike 2: Initials-based User Avatar ─────────────────────────────────────
function UserAvatar({ initials = "??" }: { initials?: string }) {
    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-sm font-semibold text-gray-300 shadow-sm cursor-pointer hover:bg-gray-700 transition-colors shrink-0">
            {initials}
        </div>
    )
}

/** Derive 1–2 uppercase initials from a full name string */
function getInitials(name: string | null | undefined): string {
    if (!name) return "??"
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ─────────────────────────────────────────────────────────────────────────────

const sidebarItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/sandbox", label: "Sandbox", icon: Filter },
    { href: "/leads", label: "Leads", icon: Users },
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

    const initials = getInitials(session?.user?.name)

    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
                <WorkspaceLogo />
            </div>

            {/* Nav */}
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

            {/* Help */}
            <div className="p-4 mt-auto">
                <HelpDialog />
            </div>

            {/* User footer */}
            <div className="border-t p-4 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <UserAvatar initials={initials} />
                    <div className="flex flex-col truncate min-w-0">
                        <span className="text-sm font-medium truncate">{session?.user?.name || "Team Member"}</span>
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
