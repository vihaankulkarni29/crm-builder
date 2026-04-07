'use client'

import { ActivityEntry, formatActivityAction } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Zap, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ActivityFeedProps {
    activity: ActivityEntry[]
}

const badgeStyles = {
    create:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
    update:  'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
    delete:  'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20',
    default: 'bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
}

function getEntityHref(action: string, entityId: string | null): string | null {
    if (!entityId) return null
    if (action.includes('LEAD'))    return `/leads`
    if (action.includes('PROJECT')) return `/operations`
    if (action.includes('TEAM'))    return `/team`
    return null
}

function getInitials(name: string | null, email: string | null): string {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    if (email) return email[0].toUpperCase()
    return '?'
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
    if (activity.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Zap className="h-8 w-8 opacity-30" />
                <p className="text-sm tracking-tight text-white/50">Pulse is silent.</p>
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Awaiting agency activity...</p>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

            <div className="flex flex-col gap-5">
                {activity.map((entry) => {
                    const { label, variant } = formatActivityAction(entry.action)
                    const href = getEntityHref(entry.action, entry.entity_id)
                    const initials = getInitials(entry.user_name, entry.user_email)
                    let relativeTime = '...'
                    try {
                        relativeTime = formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })
                    } catch {}

                    return (
                        <div key={entry.id} className="flex items-start gap-4 relative group">
                            {/* Avatar — sits on the timeline line */}
                            <div className="relative z-10 shrink-0">
                                <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-white/10 group-hover:ring-white/30 transition-all shadow-xl">
                                    <AvatarImage src={entry.user_image || undefined} />
                                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Glassmorphic Panel content */}
                            <div className="flex-1 min-w-0 pt-0.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm group-hover:bg-white/[0.04] group-hover:border-white/10 transition-all duration-300">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-white/90 tracking-tight">
                                            {entry.user_name || entry.user_email || 'Unknown Agent'}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider border rounded-md shadow-sm ${badgeStyles[variant]}`}
                                        >
                                            {label}
                                        </Badge>
                                    </div>
                                    <span className="text-[10px] text-white/30 font-medium whitespace-nowrap">
                                        {relativeTime}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {entry.entity_id && (
                                            <span className="text-[10px] font-mono text-white/40 truncate">
                                                ID_TRC: {entry.entity_id.slice(0, 8)}
                                            </span>
                                        )}
                                        {entry.details?.newStatus && (
                                            <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                {entry.details.newStatus}
                                            </span>
                                        )}
                                    </div>

                                    {href && (
                                        <Link 
                                            href={href}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
