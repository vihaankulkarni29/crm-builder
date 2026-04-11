import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProspects } from '@/lib/data'
import { SmartCsvUploader } from '@/components/shared/SmartCsvUploader'
import { SandboxTable } from '@/components/operations/SandboxTable'
import { Badge } from '@/components/ui/badge'

export default async function ProspectsPage() {
    const prospects = await getProspects()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Advanced Sandbox</h1>
                    <p className="text-white/60">Air-locked environment for raw lead ingestion and intelligent qualification scoring.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <SmartCsvUploader />
            </div>

            <Card className="bg-[#0B0C10] border-white/10 mt-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                        Raw Prospects Queue
                        <Badge variant="outline" className="border-white/10 text-white/40">
                            {prospects.length} total
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 border-t border-white/5 pt-4">
                    <SandboxTable initialProspects={prospects} />
                </CardContent>
            </Card>
        </div>
    )
}
