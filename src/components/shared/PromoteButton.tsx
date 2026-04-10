'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { promoteProspect } from '@/app/actions'
import { toast } from 'sonner'

export function PromoteButton({ id }: { id: string }) {
    const [isLoading, setIsLoading] = useState(false)

    const handlePromote = async () => {
        setIsLoading(true)
        const res = await promoteProspect(id)
        if (res.success) {
            toast.success('Promoted to Qualified Lead')
        } else {
            toast.error(res.message || 'Promotion failed')
        }
        setIsLoading(false)
    }

    return (
        <Button 
            size="sm" 
            variant="ghost" 
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors h-8 px-2"
            onClick={handlePromote}
            disabled={isLoading}
        >
            {isLoading ? <span className="animate-pulse">Promoting...</span> : (
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Promote</span>
                </div>
            )}
        </Button>
    )
}
