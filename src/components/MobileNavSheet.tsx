'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Banknote, Wrench, Menu, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const mobileNavItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/leads', label: 'Leads', icon: LayoutDashboard },
    { href: '/operations', label: 'Operations', icon: Briefcase },
    { href: '/finance', label: 'Finance', icon: Banknote },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/tools', label: 'Tools', icon: Wrench },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNavSheet() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0 w-full">
            <div className="font-semibold text-lg tracking-tight">RFRNCS OS</div>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                        <SheetTitle className="text-left font-bold text-xl uppercase tracking-wider mb-6">
                            Menu
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-4">
                        {mobileNavItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground font-medium"
                                            : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    )
}
