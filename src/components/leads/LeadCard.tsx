'use client'

import { useState } from 'react'
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, Check, Copy, Linkedin } from 'lucide-react'
import { toast } from 'sonner'
import type { Lead } from '@/types'

interface LeadCardProps {
    lead: Lead
    provided: DraggableProvided
    snapshot: DraggableStateSnapshot
    whaleBorder: string
    onDelete: (id: string) => void
}

export function LeadCard({ lead, provided, snapshot, whaleBorder, onDelete }: LeadCardProps) {
    const [emailCopied, setEmailCopied] = useState(false)

    const handleCopyEmail = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const target = lead.decision_maker_email || lead.email
        if (!target) {
            toast.error('No email available for this lead.')
            return
        }
        await navigator.clipboard.writeText(target)
        setEmailCopied(true)
        toast.success('Email copied to clipboard.')
        setTimeout(() => setEmailCopied(false), 2000)
    }

    const handleLinkedIn = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!lead.decision_maker_social) {
            toast.error('No LinkedIn URL for this lead.')
            return
        }
        window.open(lead.decision_maker_social, '_blank', 'noopener,noreferrer')
    }

    return (
        <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
                cursor-grab transition-all duration-150 bg-gray-900 border-gray-800
                hover:border-gray-600
                ${snapshot.isDragging ? 'shadow-2xl rotate-1 opacity-90' : ''}
                ${whaleBorder}
            `}
            style={provided.draggableProps.style}
        >
            <CardHeader className="p-4 pb-2 space-y-0">
                {/* Top row: source badge + kebab menu */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                            {lead.source}
                        </Badge>
                        {/* Sector badge */}
                        {lead.sector && (
                            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700/50">
                                {lead.sector}
                            </span>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-500 hover:text-gray-300"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onDelete(lead.id)}
                                className="text-red-500 focus:text-red-400 focus:bg-red-950/40"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Lead
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Company name + POC */}
                <CardTitle className="text-sm font-bold text-white leading-tight">
                    {lead.companyName}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-0.5">
                    {lead.poc || 'No contact'}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                {/* Revenue / value row */}
                <div className="flex items-center justify-between text-xs mt-1 mb-3">
                    <span className="text-gray-500">Rev.</span>
                    <span className="font-mono font-semibold text-gray-300">
                        {lead.revenue_amount
                            ? `$${Number(lead.revenue_amount).toLocaleString()}`
                            : lead.value
                            ? `₹${lead.value.toLocaleString()}`
                            : '—'}
                    </span>
                </div>

                {/* Assignee badge */}
                {lead.assigned_to && lead.assigned_to !== 'Unassigned' && (
                    <Badge variant="outline" className="text-xs mb-3 border-gray-700 text-gray-400">
                        {lead.assigned_to}
                    </Badge>
                )}

                {/* ── Velocity Actions ── */}
                <div className="flex items-center gap-1 pt-2 border-t border-gray-800">
                    {/* LinkedIn opener */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 rounded ${lead.decision_maker_social ? 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300' : 'text-gray-700 cursor-not-allowed'}`}
                        onClick={handleLinkedIn}
                        title={lead.decision_maker_social ? 'Open LinkedIn Profile' : 'No LinkedIn URL'}
                    >
                        <Linkedin className="h-3.5 w-3.5" />
                    </Button>

                    {/* Copy email */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 rounded transition-colors ${
                            emailCopied
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : lead.email || lead.decision_maker_email
                                ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                                : 'text-gray-700 cursor-not-allowed'
                        }`}
                        onClick={handleCopyEmail}
                        title={(lead.decision_maker_email || lead.email) ? 'Copy email' : 'No email available'}
                    >
                        {emailCopied
                            ? <Check className="h-3.5 w-3.5" />
                            : <Copy className="h-3.5 w-3.5" />
                        }
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
