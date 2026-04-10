'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { UploadCloud, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { batchInsertProspects } from '@/app/actions'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

export function CsvUploader() {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [fileStats, setFileStats] = useState<{ name: string; rows: number } | null>(null)

    const handleFile = (file: File) => {
        if (!file.name.endsWith('.csv')) {
            toast.error('Only CSV files are supported')
            return
        }

        setIsUploading(true)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as any[]
                
                // Map Apollo-like headers to our DB structure
                const mappedData = data.map((row) => ({
                    company: row['Company'] || row['Company Name'] || row['company'],
                    contact_person: row['First Name'] 
                        ? `${row['First Name']} ${row['Last Name'] || ''}`.trim() 
                        : row['Name'] || row['Contact Person'] || row['name'],
                    email: row['Email'] || row['Email Address'] || row['email'],
                    phone: row['Phone'] || row['Corporate Phone'] || row['phone'],
                    website: row['Website'] || row['Company Website'] || row['website'],
                    company_social: row['Company LinkedIn URL'] || row['Company Social'] || row['company_social'],
                    decision_maker_social: row['Person LinkedIn URL'] || row['LinkedIn'] || row['social'],
                    revenue_amount: row['Annual Revenue'] || row['Revenue'] || row['revenue_amount'],
                    revenue_listed: row['Annual Revenue'] ? true : false,
                    sector: row['Industry'] || row['Keywords'] || row['sector']
                })).filter(row => row.company || row.contact_person || row.email) // filter empty rows

                if (mappedData.length === 0) {
                    toast.error('No valid prospect data found in CSV.')
                    setIsUploading(false)
                    return
                }

                const response = await batchInsertProspects(mappedData)

                if (response.success) {
                    toast.success(`Successfully mapped ${mappedData.length} records.`)
                    setFileStats({ name: file.name, rows: mappedData.length })
                } else {
                    toast.error(response.message || 'Failed to upload prospects')
                }
                
                setIsUploading(false)
            },
            error: (error) => {
                console.error(error)
                toast.error('Error parsing CSV file')
                setIsUploading(false)
            }
        })
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    return (
        <Card className="bg-[#0B0C10] border-white/10 overflow-hidden">
            <CardContent className="p-0">
                <div 
                    className={`relative flex flex-col items-center justify-center p-12 transition-colors border-2 border-dashed ${isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                >
                    <input 
                        type="file" 
                        accept=".csv" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                handleFile(e.target.files[0])
                            }
                        }}
                        disabled={isUploading}
                    />
                    
                    {fileStats ? (
                        <div className="flex flex-col items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="h-10 w-10 mb-2" />
                            <span className="font-semibold text-lg">{fileStats.name} Processed</span>
                            <span className="text-white/60">{fileStats.rows} Prospects extracted and injected securely.</span>
                            <Button 
                                variant="outline" 
                                className="mt-4 border-white/20 text-white z-10"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setFileStats(null)
                                }}
                            >
                                Upload Another
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <UploadCloud className={`h-10 w-10 mb-2 ${isUploading ? 'text-blue-400 animate-bounce' : 'text-white/40'}`} />
                            <span className="font-semibold text-white/80 text-lg">
                                {isUploading ? 'Parsing Apollo Matrix...' : 'Drop Apollo CSV Export'}
                            </span>
                            <span className="text-white/40 text-sm">
                                {isUploading ? 'Extracting nodes...' : 'or click to browse'}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
