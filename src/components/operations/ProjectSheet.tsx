'use client'

import { useState, useEffect } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Project } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getProjectDetails, addProjectTask, toggleTaskCompletion, addProjectComment, updateProjectDeadline } from '@/app/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { PlusCircle, Send, CalendarIcon } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface ProjectSheetProps {
    project: Project | null
    isOpen: boolean
    onClose: () => void
}

export function ProjectSheet({ project, isOpen, onClose }: ProjectSheetProps) {
    const [tasks, setTasks] = useState<any[]>([])
    const [comments, setComments] = useState<any[]>([])
    const [newTaskName, setNewTaskName] = useState('')
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (project && isOpen) {
            fetchDetails()
        }
    }, [project, isOpen])

    const fetchDetails = async () => {
        if (!project) return
        setIsLoading(true)
        const details = await getProjectDetails(project.id)
        setTasks(details.tasks)
        setComments(details.comments)
        setIsLoading(false)
    }

    const handleAddTask = async () => {
        if (!project || !newTaskName.trim()) return
        const res = await addProjectTask(project.id, newTaskName)
        if (res.success) {
            setNewTaskName('')
            toast.success('Task added')
            fetchDetails()
        } else {
            toast.error(res.message)
        }
    }

    const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
        const res = await toggleTaskCompletion(taskId, !currentStatus)
        if (!res.success) {
            toast.error(res.message)
            fetchDetails() // revert
        }
    }

    const handleAddComment = async () => {
        if (!project || !newComment.trim()) return
        const res = await addProjectComment(project.id, newComment)
        if (res.success) {
            setNewComment('')
            fetchDetails()
        } else {
            toast.error(res.message)
        }
    }

    const handleDateChange = async (date: Date | undefined) => {
        if (!project || !date) return
        const isoString = date.toISOString()
        
        // Optimistic State Handling via internal mock
        const res = await updateProjectDeadline(project.id, isoString)
        if (res.success) {
            toast.success('Deadline updated')
            // Re-fetch or rely on the parent board revalidate pushing new props
            onClose() // Close to cleanly reset state from upper props
        } else {
            toast.error(res.message)
        }
    }

    if (!project) return null

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-[#0B0C10] border-l border-white/10 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-white/20 text-white/60">
                            {project.status}
                        </Badge>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10",
                                        !project.deadline && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                    {project.deadline ? format(new Date(project.deadline), "PPP") : <span>Set deadline</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#0B0C10] border-white/10" align="end">
                                <Calendar
                                    mode="single"
                                    selected={project.deadline ? new Date(project.deadline) : undefined}
                                    onSelect={handleDateChange}
                                    initialFocus
                                    className="bg-[#0B0C10] text-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    <SheetTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        {project.name}
                    </SheetTitle>
                    
                    <div className="flex items-center gap-3 pt-2">
                        <Avatar className="h-8 w-8 border border-white/10">
                            <AvatarImage src={project.head.avatar} />
                            <AvatarFallback>{project.head.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-xs text-white/40">Project Head</span>
                            <span className="text-sm font-medium text-white/80">{project.head.name}</span>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="tasks" className="flex-1 flex flex-col mt-4">
                    <TabsList className="bg-transparent border-b border-white/10 rounded-none w-full justify-start px-6 gap-6 h-12">
                        <TabsTrigger 
                            value="tasks" 
                            className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 border-emerald-500 rounded-none px-0 h-full text-white/60"
                        >
                            Sub-Tasks ({tasks.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="comments" 
                            className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 border-blue-500 rounded-none px-0 h-full text-white/60"
                        >
                            Team Chatter ({comments.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="flex-1 flex flex-col p-0 m-0">
                        <div className="p-6 pb-2">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Add new sub-task..." 
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                                    value={newTaskName}
                                    onChange={(e) => setNewTaskName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                />
                                <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    onClick={handleAddTask}
                                    disabled={!newTaskName.trim()}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 px-6 pb-6">
                            {isLoading ? (
                                <div className="text-sm text-white/40 text-center py-8">Loading tasks...</div>
                            ) : tasks.length === 0 ? (
                                <div className="text-sm text-white/20 text-center py-8">No tasks yet. Create one above.</div>
                            ) : (
                                <div className="space-y-2 mt-4">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                            <Checkbox 
                                                checked={task.is_completed}
                                                onCheckedChange={() => handleToggleTask(task.id, task.is_completed)}
                                                className="mt-1"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-sm ${task.is_completed ? 'line-through text-white/30' : 'text-white/80'}`}>
                                                    {task.task_name}
                                                </span>
                                                <span className="text-[10px] text-white/20">
                                                    {new Date(task.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="comments" className="flex-1 flex flex-col p-0 m-0 relative">
                        <ScrollArea className="flex-1 p-6 pb-[100px]">
                            {isLoading ? (
                                <div className="text-sm text-white/40 text-center py-8">Loading chatter...</div>
                            ) : comments.length === 0 ? (
                                <div className="text-sm text-white/20 text-center py-8">Silence. Be the first to speak.</div>
                            ) : (
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4">
                                            <Avatar className="h-8 w-8 border border-white/10 shrink-0">
                                                <AvatarImage src={comment.user_avatar} />
                                                <AvatarFallback>{comment.user_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-white/80">{comment.user_name}</span>
                                                    <span className="text-[10px] text-white/40">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-white/60 bg-white/[0.03] p-3 rounded-tr-xl rounded-b-xl border border-white/5">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0B0C10] backdrop-blur-md">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Type a message..." 
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
