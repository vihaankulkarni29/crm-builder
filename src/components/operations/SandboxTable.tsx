'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Flame, AlertCircle } from 'lucide-react'
import { QualifyDialog } from '@/components/shared/QualifyDialog'
import { rejectProspect, bulkRejectColdProspects } from '@/app/actions'
import { toast } from 'sonner'
import { Lead } from '@/types'

interface SandboxTableProps {
    initialProspects: Lead[]
}

export function SandboxTable({ initialProspects }: SandboxTableProps) {
    const [filter, setFilter] = useState<'ALL' | 'HOT' | 'WARM' | 'COLD'>('ALL')
    const [isPurging, setIsPurging] = useState(false)
    const [loadingIds, setLoadingIds] = useState<string[]>([])

    // Derived filtered array matching logic constraints
    const filteredProspects = initialProspects.filter(prospect => {
        const s = prospect.score || 0
        if (filter === 'HOT') return s >= 80
        if (filter === 'WARM') return s >= 50 && s < 80
        if (filter === 'COLD') return s < 50
        return true
    })

    const handleReject = async (id: string) => {
        setLoadingIds(prev => [...prev, id])
        const res = await rejectProspect(id)
        if (res.success) {
            toast.success("Prospect rejected successfully.")
        } else {
            toast.error(res.message)
        }
        setLoadingIds(prev => prev.filter(pid => pid !== id))
    }

    const handleBulkPurge = async () => {
        setIsPurging(true)
        const res = await bulkRejectColdProspects()
        if (res.success) {
            toast.success("All cold leads purged from the system.")
        } else {
            toast.error(res.message)
        }
        setIsPurging(false)
    }

    return (
        <div className="flex flex-col space-y-4">
            {/* Control Bar: Filters & Purge Command */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 gap-4">
                <div className="flex bg-white/5 border border-white/10 p-1 rounded-md">
                    {(['ALL', 'HOT', 'WARM', 'COLD'] as const).map(f => (
                        <Button
                            key={f}
                            size="sm"
                            variant={filter === f ? 'secondary' : 'ghost'}
                            onClick={() => setFilter(f)}
                            className={`h-8 px-4 ${filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
                        >
                            {f}
                        </Button>
                    ))}
                </div>

                {filteredProspects.length > 0 && initialProspects.some(p => (p.score || 0) < 50) && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40">
                                <Flame className="h-4 w-4 mr-2" />
                                Purge Cold Leads
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#0B0C10] border-white/10 text-white sm:max-w-[425px]">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    Initiate Bulk Purge?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-white/60">
                                    Are you absolutely sure you want to permanently reject all leads scoring under 50? This action will execute across {initialProspects.filter(p => (p.score || 0) < 50).length} cold records instantly.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleBulkPurge} className="bg-red-600 hover:bg-red-700 text-white border-0">
                                    {isPurging ? 'Purging Matrix...' : 'Execute Purge'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Data Table */}
            {filteredProspects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-white/40">
                    <p>No prospects match the '{filter}' filter.</p>
                </div>
            ) : (
                <div className="rounded-md border border-white/10 mx-6 mb-6">
                    <Table>
                        <TableHeader className="bg-white/[0.02]">
                            <TableRow className="border-white/10 focus:outline-none hover:bg-transparent">
                                <TableHead className="text-white/60 font-medium">Company</TableHead>
                                <TableHead className="text-white/60 font-medium">Contact Person</TableHead>
                                <TableHead className="text-white/60 font-medium">Email</TableHead>
                                <TableHead className="text-white/60 font-medium">Score</TableHead>
                                <TableHead className="text-white/60 font-medium">Status</TableHead>
                                <TableHead className="text-right text-white/60 font-medium">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProspects.map((prospect) => {
                                const score = prospect.score || 0
                                let scoreColor = "text-red-500"
                                if (score >= 80) scoreColor = "text-emerald-500"
                                else if (score >= 50) scoreColor = "text-yellow-500"

                                const isRowLoading = loadingIds.includes(prospect.id)

                                return (
                                <TableRow key={prospect.id} className={`border-white/10 transition-colors group ${isRowLoading ? 'opacity-50 pointer-events-none' : 'hover:bg-white/[0.02]'}`}>
                                    <TableCell className="font-medium text-white/80">
                                        {prospect.companyName}
                                    </TableCell>
                                    <TableCell className="text-white/60">
                                        {prospect.poc || <span className="text-white/20 italic">Unknown</span>}
                                    </TableCell>
                                    <TableCell className="text-white/60">
                                        {prospect.email || <span className="text-white/20 italic">Unknown</span>}
                                    </TableCell>
                                    <TableCell className={`font-bold ${scoreColor}`}>
                                        {score}/100
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                                            {prospect.lifecycle_stage}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-1">
                                        <QualifyDialog id={prospect.id} />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-red-400 opacity-50 hover:opacity-100 hover:bg-red-500/10 hover:text-red-300 transition-opacity"
                                            onClick={() => handleReject(prospect.id)}
                                            title="Reject Prospect"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
