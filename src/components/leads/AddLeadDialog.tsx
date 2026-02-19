'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { addLead } from "@/app/actions"
import { useState } from "react"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function AddLeadDialog() {
    const [open, setOpen] = useState(false)

    // @ts-ignore
    async function handleSubmit(formData: FormData) {
        const result = await addLead(formData)

        if (result?.message?.includes('successfully')) {
            toast.success("Lead added to the pipeline")
            setOpen(false)
        } else {
            console.error("Lead Add Failed:", result)
            const errorDetails = result?.errors
                ? JSON.stringify(result.errors)
                : result?.message || "Failed to add lead"

            toast.error("Error", { description: errorDetails })
            // DO NOT CLOSE DIALOG
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full border-dashed" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                        Enter the details of the potential client.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company" className="text-right">
                            Company
                        </Label>
                        <Input id="company" name="company" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact" className="text-right">
                            Contact
                        </Label>
                        <Input id="contact" name="contact" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input id="email" name="email" type="email" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            Value (₹)
                        </Label>
                        <Input id="value" name="value" type="number" min="0" step="1" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <div className="col-span-3">
                            <Select name="status" defaultValue="Cold Lead">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cold Lead">Cold Lead</SelectItem>
                                    <SelectItem value="Hot Lead">Hot Lead</SelectItem>
                                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="source" className="text-right">
                            Source
                        </Label>
                        <Input id="source" name="source" placeholder="Apollo, Manual..." className="col-span-3" />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Lead</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
