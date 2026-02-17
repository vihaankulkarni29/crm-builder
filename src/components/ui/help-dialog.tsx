'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export function HelpDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Guide</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>RFRNCS OS Guide</DialogTitle>
                    <DialogDescription>
                        Quick reference for managing the agency operations.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="leads" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="leads">Leads</TabsTrigger>
                        <TabsTrigger value="operations">Operations</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    <TabsContent value="leads" className="space-y-3 py-4">
                        <h3 className="font-semibold">Bulk Importing Leads</h3>
                        <p className="text-sm text-muted-foreground">
                            To add many leads at once, use the CSV Import feature.
                        </p>
                        <div className="rounded-md bg-muted p-3 text-xs font-mono">
                            <strong>Required Columns:</strong><br />
                            Company, Name, Designation, Contact, Subject
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Click the "Import CSV" button on the Leads page to upload your file.
                        </p>
                    </TabsContent>

                    <TabsContent value="operations" className="space-y-3 py-4">
                        <h3 className="font-semibold">Managing Projects</h3>
                        <p className="text-sm text-muted-foreground">
                            Projects are automatically created when you drag a Lead to the <strong>"Closed"</strong> column in the pipeline.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            You can also manually create a project by clicking the <strong>"New Project"</strong> button on the Operations page.
                        </p>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-3 py-4">
                        <h3 className="font-semibold">Team Management</h3>
                        <p className="text-sm text-muted-foreground">
                            Go to the Team page to view current members and their efficiency.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong>Note:</strong> Only Admins (Zaid/Brenden) can add new members or modify team settings.
                        </p>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
