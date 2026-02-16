'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleLogin = () => {
        // Ideally this check happens server-side, but for tonight's deadline:
        if (password === 'rfrncs2026') {
            // Set a cookie that lasts 1 day
            document.cookie = "rfrncs_auth=true; path=/; max-age=86400";
            router.push('/');
        } else {
            alert('Access Denied');
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <div className="flex flex-col gap-4 w-[300px]">
                <h1 className="text-2xl font-bold text-white text-center">RFRNCS OS</h1>
                <Input
                    type="password"
                    placeholder="Enter Master Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin}>Enter System</Button>
            </div>
        </div>
    )
}
