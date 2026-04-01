'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

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
            toast.error("Invalid credentials.")
            setIsLoading(false)
        } else {
            router.push('/')
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <div className="flex flex-col gap-6 w-[350px] p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-3xl font-bold text-white tracking-tighter">RFRNCS OS</h1>
                    <p className="text-sm text-white/40">Enter master credentials to gain access.</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                        disabled={isLoading}
                        required
                    />
                    <Input
                        name="password"
                        type="password"
                        placeholder="Master Password"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                        disabled={isLoading}
                        required
                    />
                    <Button type="submit" disabled={isLoading} className="bg-white text-black hover:bg-white/90">
                        {isLoading ? "Authenticating..." : "Sign In"}
                    </Button>
                </form>
            </div>
        </div>
    )
}
