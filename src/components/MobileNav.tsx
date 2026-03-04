'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Banknote, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
    { href: '/leads', label: 'Leads', icon: LayoutDashboard },
    { href: '/operations', label: 'Ops', icon: Briefcase },
    { href: '/finance', label: 'Finance', icon: Banknote },
    { href: '/tools', label: 'Tools', icon: Wrench },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-background border-t z-50 flex justify-around p-3 md:hidden">
            {mobileNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 text-xs transition-colors",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                        <span>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
