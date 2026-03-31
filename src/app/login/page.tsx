'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        router.prefetch('/')
    }, [router])

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })
        
        if (result?.error) {
            toast.error("Invalid credentials or unauthorized.")
            setIsLoading(false)
        } else {
            router.push('/')
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-[300px]">
                <h1 className="text-2xl font-bold text-white text-center">RFRNCS OS</h1>
                
                <div className="space-y-1">
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        disabled={isLoading}
                        autoComplete="email"
                        required
                    />
                </div>
                
                <div className="space-y-1">
                    <Input
                        name="password"
                        type="password"
                        placeholder="Master Password"
                        disabled={isLoading}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <Button type="submit" disabled={isLoading} className="mt-2 font-medium">
                    {isLoading ? "Authenticating Edge Connection..." : "Enter Secure System"}
                </Button>
            </form>
        </div>
    )
}
