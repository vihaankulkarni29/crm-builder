'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle } from 'lucide-react'
import { promoteProspect } from '@/app/actions'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

export function QualifyDialog({ id }: { id: string }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [painPoint, setPainPoint] = useState('')
    const [budget, setBudget] = useState('')

    const handleQualify = async () => {
        setIsLoading(true)
        const budgetNum = Number(budget.replace(/[^0-9.-]+/g,""))
        const res = await promoteProspect(id, painPoint, isNaN(budgetNum) ? undefined : budgetNum)
        if (res.success) {
            toast.success('Successfully Promoted to Qualified Lead')
            setOpen(false)
        } else {
            toast.error(res.message || 'Promotion failed')
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors h-8 px-2"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Qualify</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0B0C10] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Qualify Prospect</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Gather core insights before graduating this prospect to the main pipeline.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="pain" className="text-white/80">Primary Pain Point</Label>
                        <Textarea 
                            id="pain" 
                            placeholder="e.g. Scaling customer acquisition channels..." 
                            className="bg-white/5 border-white/10 placeholder:text-white/40 focus:border-white/20"
                            value={painPoint}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPainPoint(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="budget" className="text-white/80">Estimated Budget (USD)</Label>
                        <Input 
                            id="budget" 
                            type="text"
                            placeholder="$25,000" 
                            className="bg-white/5 border-white/10 placeholder:text-white/40 focus:border-white/20"
                            value={budget}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudget(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => setOpen(false)}
                        className="bg-transparent border-white/10 text-white hover:bg-white/5"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleQualify} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Qualifying...' : 'Promote Lead'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
