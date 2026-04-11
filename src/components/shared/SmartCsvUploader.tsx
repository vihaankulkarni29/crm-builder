'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { UploadCloud, CheckCircle2, ShieldCheck, Loader2, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { checkExistingDomains, bulkInsertLeads, LeadData } from '@/app/actions/leads'

// -------------------------------------------------------------------
// URL Normalizer: strips protocol + www subdomain, trims trailing slash
// e.g. "https://www.cafu.com/" => "cafu.com"
// -------------------------------------------------------------------
function normalizeDomain(raw: string | undefined | null): string | null {
    if (!raw || typeof raw !== 'string') return null
    try {
        const cleaned = raw.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase()
        return cleaned || null
    } catch {
        return null
    }
}

type UploaderState = 'idle' | 'parsing' | 'deduping' | 'review' | 'committing' | 'success' | 'error'

interface ReviewStats {
    fileName: string
    totalParsed: number
    pristineCount: number
    duplicateCount: number
    newLeads: LeadData[]
}

export function SmartCsvUploader() {
    const [isDragging, setIsDragging] = useState(false)
    const [phase, setPhase] = useState<UploaderState>('idle')
    const [review, setReview] = useState<ReviewStats | null>(null)
    const [insertedCount, setInsertedCount] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const resetToIdle = () => {
        setPhase('idle')
        setReview(null)
        setInsertedCount(0)
        if (inputRef.current) inputRef.current.value = ''
    }

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.csv')) {
            toast.error('Only .csv files are accepted.')
            return
        }

        setPhase('parsing')

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const raw = results.data as any[]

                // Map Apollo-standard headers to internal LeadData shape
                const mapped: (LeadData & { _normalizedDomain: string | null })[] = raw.map((row) => {
                    const rawWebsite = row['Website'] || row['Company Website'] || row['website'] || null
                    return {
                        company: row['Company'] || row['Company Name'] || row['company'],
                        contact_person: row['First Name']
                            ? `${row['First Name']} ${row['Last Name'] || ''}`.trim()
                            : row['Name'] || row['Contact Person'] || row['name'],
                        email: row['Email'] || row['Email Address'] || row['email'],
                        phone: row['Phone'] || row['Corporate Phone'] || row['phone'],
                        website_url: normalizeDomain(rawWebsite) ?? undefined,
                        company_social: row['Company LinkedIn URL'] || row['Company Social'] || row['company_social'],
                        decision_maker_social: row['Person LinkedIn URL'] || row['LinkedIn'] || row['social'],
                        revenue_amount: row['Annual Revenue'] || row['Revenue'] || row['revenue_amount'],
                        revenue_listed: !!row['Annual Revenue'],
                        sector: row['Industry'] || row['Keywords'] || row['sector'],
                        _normalizedDomain: normalizeDomain(rawWebsite),
                    }
                }).filter((r) => r.company || r.contact_person || r.email)

                if (mapped.length === 0) {
                    toast.error('No valid lead data found in this CSV.')
                    setPhase('idle')
                    return
                }

                // --- DEDUP PHASE ---
                setPhase('deduping')

                const domains = mapped
                    .map((r) => r._normalizedDomain)
                    .filter((d): d is string => !!d)

                let existingDomains: string[] = []
                if (domains.length > 0) {
                    existingDomains = await checkExistingDomains(domains)
                }

                const existingSet = new Set(existingDomains.map((d) => d.toLowerCase()))

                const newLeads: LeadData[] = []
                const seenInBatch = new Set<string>()

                for (const row of mapped) {
                    const { _normalizedDomain, ...leadData } = row

                    // Skip DB-level duplicates
                    if (_normalizedDomain && existingSet.has(_normalizedDomain)) continue

                    // Skip within-batch duplicates (same domain appearing twice in one CSV)
                    if (_normalizedDomain) {
                        if (seenInBatch.has(_normalizedDomain)) continue
                        seenInBatch.add(_normalizedDomain)
                    }

                    newLeads.push(leadData)
                }

                const duplicateCount = mapped.length - newLeads.length

                setReview({
                    fileName: file.name,
                    totalParsed: mapped.length,
                    pristineCount: newLeads.length,
                    duplicateCount,
                    newLeads,
                })
                setPhase('review')
            },
            error: (err) => {
                console.error('[SmartCsvUploader] PapaParse error:', err)
                toast.error('Failed to parse CSV file.')
                setPhase('error')
            },
        })
    }

    const handleCommit = async () => {
        if (!review || review.newLeads.length === 0) return

        setPhase('committing')
        const res = await bulkInsertLeads(review.newLeads)

        if (res.success) {
            setInsertedCount(res.inserted ?? review.newLeads.length)
            setPhase('success')
            toast.success(`${res.inserted} leads committed to the CRM pipeline.`)
        } else {
            toast.error(res.message || 'Insert failed.')
            setPhase('review') // fall back so user can retry
        }
    }

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const onDragLeave = () => setIsDragging(false)
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    const isInteractive = phase === 'idle'

    return (
        <div
            className={`
                relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden
                ${isDragging
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                }
            `}
            onDragOver={isInteractive ? onDragOver : undefined}
            onDragLeave={isInteractive ? onDragLeave : undefined}
            onDrop={isInteractive ? onDrop : undefined}
        >
            {/* Hidden file input */}
            {isInteractive && (
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                    }}
                />
            )}

            <div className="flex flex-col items-center justify-center p-12 gap-4">

                {/* ────── IDLE ────── */}
                {phase === 'idle' && (
                    <>
                        <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <UploadCloud className="h-7 w-7 text-white/40" />
                        </div>
                        <span className="font-semibold text-white/80 text-lg">Drop Apollo CSV Export</span>
                        <span className="text-white/40 text-sm">Duplicate domains are automatically detected and blocked</span>
                    </>
                )}

                {/* ────── PARSING ────── */}
                {phase === 'parsing' && (
                    <>
                        <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                        <span className="font-semibold text-white/80 text-lg">Parsing CSV Matrix...</span>
                        <span className="text-white/40 text-sm">Extracting and normalizing records</span>
                    </>
                )}

                {/* ────── DEDUPING ────── */}
                {phase === 'deduping' && (
                    <>
                        <ShieldCheck className="h-10 w-10 text-purple-400 animate-pulse" />
                        <span className="font-semibold text-white/80 text-lg">Running Deduplication Scan...</span>
                        <span className="text-white/40 text-sm">Querying Neon for existing domain matches</span>
                    </>
                )}

                {/* ────── REVIEW ────── */}
                {phase === 'review' && review && (
                    <div className="w-full max-w-sm flex flex-col items-center gap-5 pointer-events-auto z-20">
                        <div className="w-full grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 flex flex-col items-center gap-1">
                                <span className="text-3xl font-bold text-emerald-400">{review.pristineCount}</span>
                                <span className="text-xs text-emerald-400/70 text-center">Pristine New Leads</span>
                            </div>
                            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 flex flex-col items-center gap-1">
                                <span className="text-3xl font-bold text-yellow-400">{review.duplicateCount}</span>
                                <span className="text-xs text-yellow-400/70 text-center">Duplicates Skipped</span>
                            </div>
                        </div>
                        <p className="text-white/40 text-xs text-center">
                            From <span className="text-white/60 font-medium">{review.fileName}</span> — {review.totalParsed} total parsed
                        </p>
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent border-white/10 text-white/60 hover:text-white"
                                onClick={resetToIdle}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleCommit}
                                disabled={review.pristineCount === 0}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Commit to CRM
                            </Button>
                        </div>
                        {review.pristineCount === 0 && (
                            <p className="text-yellow-400/70 text-xs flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                All records already exist in the database.
                            </p>
                        )}
                    </div>
                )}

                {/* ────── COMMITTING ────── */}
                {phase === 'committing' && (
                    <>
                        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
                        <span className="font-semibold text-white/80 text-lg">Committing to Neon...</span>
                        <span className="text-white/40 text-sm">Securing ACID insert with ON CONFLICT guard</span>
                    </>
                )}

                {/* ────── SUCCESS ────── */}
                {phase === 'success' && (
                    <>
                        <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                        <span className="font-bold text-white text-xl">{insertedCount} Leads Committed</span>
                        <span className="text-white/40 text-sm">Successfully injected into the CRM pipeline</span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-white/20 text-white/60 hover:text-white bg-transparent z-20 pointer-events-auto"
                            onClick={resetToIdle}
                        >
                            Upload Another File
                        </Button>
                    </>
                )}

                {/* ────── ERROR ────── */}
                {phase === 'error' && (
                    <>
                        <AlertTriangle className="h-10 w-10 text-red-400" />
                        <span className="font-semibold text-white/80 text-lg">Upload Failed</span>
                        <Button variant="outline" size="sm" className="mt-2 border-white/20 text-white/60 bg-transparent z-20 pointer-events-auto" onClick={resetToIdle}>
                            Try Again
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}
