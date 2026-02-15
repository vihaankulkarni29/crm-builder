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
import { addProject } from "@/app/actions"
import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { toast } from "sonner"

export function AddProjectDialog() {
    const [open, setOpen] = useState(false)

    // @ts-ignore
    async function handleSubmit(formData: FormData) {
        await addProject(formData)
        setOpen(false)
        toast.success("Project created successfully")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Start a new project for the team.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Project Name
                        </Label>
                        <Input id="name" name="name" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="head" className="text-right">
                            Head
                        </Label>
                        <div className="col-span-3">
                            <Select name="head" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select head" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Vihaan">Vihaan</SelectItem>
                                    <SelectItem value="Creative Lead">Creative Lead</SelectItem>
                                    <SelectItem value="Ops Head">Ops Head</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deadline" className="text-right">
                            Deadline
                        </Label>
                        <Input id="deadline" name="deadline" type="date" className="col-span-3" required />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Project</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
