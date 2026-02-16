"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Contributor {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: "Online" | "Away" | "Busy" | "Offline";
    projects: number;
    efficiency: string;
}

const contributors: Contributor[] = [
    {
        id: "1",
        name: "Vihaan Kulkarni",
        role: "System Architect",
        avatar: "/avatars/01.png",
        status: "Online",
        projects: 12,
        efficiency: "98%",
    },
    {
        id: "2",
        name: "Zaid",
        role: "Director",
        avatar: "/avatars/02.png",
        status: "Busy",
        projects: 8,
        efficiency: "95%",
    },
    {
        id: "3",
        name: "Brenden",
        role: "Design Lead",
        avatar: "/avatars/03.png",
        status: "Away",
        projects: 5,
        efficiency: "92%",
    },
];

export function ContributorsTable() {
    return (
        <div className="w-full overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
                <h3 className="text-lg font-semibold">Team Status</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary">Live</Badge>
            </div>
            <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-4">Member</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-3 text-center">Active Projects</div>
                <div className="col-span-3 text-right">Efficiency</div>
            </div>
            <div className="divide-y">
                {contributors.map((member, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={member.id}
                        className="group grid grid-cols-12 items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                        <div className="col-span-4 flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground">{member.name}</span>
                                <span className="text-xs text-muted-foreground">{member.role}</span>
                            </div>
                        </div>
                        <div className="col-span-2 flex justify-center">
                            <Badge
                                variant={member.status === "Online" ? "default" : "secondary"}
                                className={cn(
                                    "w-20 justify-center",
                                    member.status === "Online" && "bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25",
                                    member.status === "Busy" && "bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25"
                                )}
                            >
                                {member.status}
                            </Badge>
                        </div>
                        <div className="col-span-3 text-center text-sm font-medium">
                            {member.projects}
                        </div>
                        <div className="col-span-3 text-right font-mono text-sm text-primary">
                            {member.efficiency}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
