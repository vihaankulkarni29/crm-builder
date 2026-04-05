'use client'

import { ActivityEntry, formatActivityAction } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

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
                <p className="text-sm">No activity recorded yet.</p>
                <p className="text-xs opacity-60">Actions will appear here as your team works.</p>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

            <div className="flex flex-col gap-5">
                {activity.map((entry, i) => {
                    const { label, variant } = formatActivityAction(entry.action)
                    const href = getEntityHref(entry.action, entry.entity_id)
                    const initials = getInitials(entry.user_name, entry.user_email)
                    let relativeTime = 'some time ago'
                    try {
                        relativeTime = formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })
                    } catch {}

                    return (
                        <div key={entry.id} className="flex items-start gap-4 relative group">
                            {/* Avatar — sits on the timeline line */}
                            <div className="relative z-10 shrink-0">
                                <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
                                    <AvatarImage src={entry.user_image || undefined} />
                                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-foreground">
                                        {entry.user_name || entry.user_email || 'Unknown'}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 font-medium border ${badgeStyles[variant]}`}
                                    >
                                        {label}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2 mt-0.5">
                                    {href && entry.entity_id ? (
                                        <a
                                            href={href}
                                            className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2 truncate max-w-[180px]"
                                            title={`Go to entity ${entry.entity_id}`}
                                        >
                                            #{entry.entity_id.slice(0, 8)}
                                        </a>
                                    ) : entry.entity_id ? (
                                        <span className="text-xs text-muted-foreground/60 truncate max-w-[180px]">
                                            #{entry.entity_id.slice(0, 8)}
                                        </span>
                                    ) : null}

                                    {entry.details && typeof entry.details === 'object' && entry.details.newStatus && (
                                        <span className="text-xs text-muted-foreground/60">
                                            → <span className="text-foreground/70">{entry.details.newStatus}</span>
                                        </span>
                                    )}
                                </div>

                                <p className="text-[11px] text-muted-foreground/50 mt-1">{relativeTime}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
