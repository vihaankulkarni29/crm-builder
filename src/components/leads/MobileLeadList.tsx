'use client'

import { useState } from 'react'
import { updateLeadStatus } from '@/app/actions'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types'

const statusOptions = ['New Lead', 'Contacted', 'Meeting Booked', 'Closed Won', 'Disqualified']

const statusColors: Record<string, string> = {
    'New Lead':       'bg-blue-600',
    'Contacted':      'bg-purple-600',
    'Meeting Booked': 'bg-yellow-600',
    'Closed Won':     'bg-emerald-600',
    'Disqualified':   'bg-red-700',
}

export function MobileLeadList({ leads }: { leads: Lead[] }) {
    const [localLeads, setLocalLeads] = useState<Lead[]>(leads)

    async function handleStatusChange(id: string, newStatus: string) {
        // Optimistic update
        setLocalLeads(prev =>
            prev.map(l => l.id === id ? { ...l, status: newStatus as Lead['status'] } : l)
        )

        try {
            await updateLeadStatus(id, newStatus)
            toast.success(`Status updated to ${newStatus}`)
        } catch {
            toast.error('Failed to update status')
            setLocalLeads(leads)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {localLeads.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    No leads found.
                </div>
            ) : (
                localLeads.map((lead) => (
                    <div
                        key={lead.id}
                        className="flex flex-col gap-2 p-4 border rounded-lg bg-card"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">{lead.companyName}</h3>
                            <Badge
                                className={cn(
                                    "text-xs",
                                    statusColors[lead.status] || 'bg-secondary'
                                )}
                            >
                                {lead.status}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{lead.poc || 'No Contact'}</span>
                            <span className="font-mono">₹{lead.value?.toLocaleString() || '0'}</span>
                        </div>

                        {lead.assigned_to && lead.assigned_to !== 'Unassigned' && (
                            <Badge variant="outline" className="text-xs w-fit">
                                {lead.assigned_to}
                            </Badge>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                            <label className="text-xs text-muted-foreground">Status:</label>
                            <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                className="flex-1 text-xs bg-background border rounded px-2 py-1.5 text-foreground"
                            >
                                {statusOptions.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

