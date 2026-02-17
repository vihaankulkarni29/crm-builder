'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Task 2: Prefetch dashboard for instant load
    useEffect(() => {
        router.prefetch('/')
    }, [router])

    const handleLogin = () => {
        // Prevent double clicks
        if (isLoading) return
        setIsLoading(true)

        // 30 Days in seconds
        const thirtyDays = 2592000

        const setAuthCookie = () => {
            document.cookie = `rfrncs_auth=true; path=/; max-age=${thirtyDays}`
            router.push('/')
        }

        // 1. Master Password Check (Bypasses username)
        if (password === 'rfrncs2026') {
            setAuthCookie()
            return
        }

        // 2. Specific User Check
        if (username === 'zaidrfrncs' && password === 'ctrlzaid26') {
            setAuthCookie()
            return
        }

        // 3. Failure
        alert('Access Denied')
        setIsLoading(false)
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <div className="flex flex-col gap-4 w-[300px]">
                <h1 className="text-2xl font-bold text-white text-center">RFRNCS OS</h1>
                <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
                <Button onClick={handleLogin} disabled={isLoading}>
                    {isLoading ? "Accessing..." : "Enter System"}
                </Button>
            </div>
        </div>
    )
}
