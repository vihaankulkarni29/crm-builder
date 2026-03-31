'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loginAction } from './action'
import { toast } from 'sonner'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        router.prefetch('/')
    }, [router])

    async function handleLoginWrapper(formData: FormData) {
        setIsLoading(true)
        
        // Ensure redirect param is included exactly as directive requests
        formData.append('redirectTo', '/')
        
        const result = await loginAction(formData)
        
        if (result?.error) {
            toast.error(result.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <form action={handleLoginWrapper} className="flex flex-col gap-4 w-[300px]">
                <h1 className="text-2xl font-bold text-white text-center">RFRNCS OS</h1>
                <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    disabled={isLoading}
                    autoComplete="email"
                    required
                />
                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Enter System"}
                </Button>
            </form>
        </div>
    )
}
