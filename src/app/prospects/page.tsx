import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProspects } from '@/lib/data'
import { CsvUploader } from '@/components/shared/CsvUploader'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { PromoteButton } from '@/components/shared/PromoteButton'
import { Badge } from '@/components/ui/badge'

export default async function ProspectsPage() {
    const prospects = await getProspects()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Prospect Sandbox</h1>
                    <p className="text-white/60">Air-locked environment for raw lead ingestion and qualification.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <CsvUploader />
            </div>

            <Card className="bg-[#0B0C10] border-white/10 mt-6">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                        Raw Prospects Queue
                        <Badge variant="outline" className="border-white/10 text-white/40">
                            {prospects.length} total
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {prospects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-white/40">
                            <p>No raw prospects currently in the sandbox.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-white/10 mx-6 mb-6">
                            <Table>
                                <TableHeader className="bg-white/[0.02]">
                                    <TableRow className="border-white/10 focus:outline-none hover:bg-transparent">
                                        <TableHead className="text-white/60 font-medium">Company</TableHead>
                                        <TableHead className="text-white/60 font-medium">Contact Person</TableHead>
                                        <TableHead className="text-white/60 font-medium">Email</TableHead>
                                        <TableHead className="text-white/60 font-medium">Source Status</TableHead>
                                        <TableHead className="text-right text-white/60 font-medium">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prospects.map((prospect) => (
                                        <TableRow key={prospect.id} className="border-white/10 hover:bg-white/[0.02] transition-colors group">
                                            <TableCell className="font-medium text-white/80">
                                                {prospect.companyName}
                                            </TableCell>
                                            <TableCell className="text-white/60">
                                                {prospect.poc || <span className="text-white/20 italic">Unknown</span>}
                                            </TableCell>
                                            <TableCell className="text-white/60">
                                                {prospect.email || <span className="text-white/20 italic">Unknown</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                                                    {prospect.lifecycle_stage}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <PromoteButton id={prospect.id} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
