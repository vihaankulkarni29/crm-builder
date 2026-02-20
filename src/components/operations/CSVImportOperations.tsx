'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { importProjects } from '@/app/actions'
import { toast } from 'sonner'
import { Upload, Loader2 } from 'lucide-react'

export function CSVImportOperations() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const response = await importProjects(results.data as any[])
                    if (response.success) {
                        toast.success(`Successfully imported ${response.count} projects`)
                    } else {
                        toast.error('Failed to import: ' + response.message)
                    }
                } catch (error) {
                    toast.error('An unexpected error occurred')
                } finally {
                    setIsUploading(false)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                }
            }
        })
    }

    return (
        <div>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="gap-2">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import CSV
            </Button>
        </div>
    )
}
