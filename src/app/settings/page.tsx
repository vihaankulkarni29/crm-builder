'use client'

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { updatePasswordAction } from './action'

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false)

    async function handleUpdate(formData: FormData) {
        setIsLoading(true)
        const currentPassword = formData.get('currentPassword') as string
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            setIsLoading(false)
            return
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters")
            setIsLoading(false)
            return
        }

        const result = await updatePasswordAction(formData)
        
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Password secured and updated successfully!")
            // Optionally, we could force a reset of the form here by referencing a ref
        }
        
        setIsLoading(false)
    }

    return (
        <div className="flex flex-col gap-6 max-w-xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account credentials and system preferences securely.</p>
            </div>
            
            <div className="bg-card border rounded-xl overflow-hidden mt-4">
                <div className="border-b p-4 px-6 bg-muted/20">
                    <h2 className="font-semibold text-lg">Change Password</h2>
                    <p className="text-sm text-muted-foreground">Update your identity hash. It is recommended to choose a secure string.</p>
                </div>
                
                <form action={handleUpdate} className="p-6 flex flex-col gap-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Current Temporary Password</label>
                        <Input 
                            name="currentPassword" 
                            type="password" 
                            placeholder="Enter current password" 
                            autoComplete="current-password"
                            required 
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">New Secure Password</label>
                        <Input 
                            name="newPassword" 
                            type="password" 
                            placeholder="Minimum 8 characters" 
                            autoComplete="new-password"
                            required 
                            minLength={8}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <Input 
                            name="confirmPassword" 
                            type="password" 
                            placeholder="Repeat new password" 
                            autoComplete="new-password"
                            required 
                            minLength={8}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="mt-4 text-left">
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? "Encrypting Update..." : "Update Credentials"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
