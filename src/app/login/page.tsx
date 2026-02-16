'use client'

import { useState } from 'react'
import { login } from './action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { BackgroundCircles } from '@/components/ui/background-circles'

export default function LoginPage() {
    const [error, setError] = useState('')

    async function handleSubmit(formData: FormData) {
        const result = await login(formData)
        if (result === "Invalid Credentials") {
            toast.error("Invalid Credentials")
            setError("Invalid Credentials")
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 z-0">
                <BackgroundCircles title="" description="" />
            </div>

            <Card className="z-10 w-full max-w-md bg-card/50 backdrop-blur-sm border-muted/20">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">RFRNCS OS</CardTitle>
                    <CardDescription>Enter Master Password to access the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                                className="bg-background/50"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button type="submit" className="w-full">
                            Enter System
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
