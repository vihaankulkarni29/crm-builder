"use client"

import { Project } from "@/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProjectTableProps {
    projects: Project[]
}

export function ProjectTable({ projects }: ProjectTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Head</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Deadline</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={project.head.avatar} alt={project.head.name} />
                                        <AvatarFallback>{project.head.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">{project.head.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        project.status === "On Track"
                                            ? "default"
                                            : project.status === "Delayed"
                                                ? "destructive"
                                                : "secondary"
                                    }
                                    className={cn(
                                        project.status === "On Track" && "bg-green-600 hover:bg-green-700",
                                        project.status === "Completed" && "bg-blue-600 hover:bg-blue-700"
                                    )}
                                >
                                    {project.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {new Date(project.deadline).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
