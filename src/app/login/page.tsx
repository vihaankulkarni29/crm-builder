'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleLogin = () => {
        // 1. Master Password Check (Bypasses username)
        if (password === 'rfrncs2026') {
            document.cookie = "rfrncs_auth=true; path=/; max-age=86400";
            router.push('/');
            return;
        }

        // 2. Specific User Check
        if (username === 'zaidrfrncs' && password === 'ctrlzaid26') {
            document.cookie = "rfrncs_auth=true; path=/; max-age=86400";
            router.push('/');
            return;
        }

        // 3. Failure
        alert('Access Denied');
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
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin}>Enter System</Button>
            </div>
        </div>
    )
}
