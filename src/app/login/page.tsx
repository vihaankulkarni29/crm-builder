'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login } from './action'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    // We can keep state for controlled inputs if needed, or remove if fully relying on form data. 
    // Keeping simple state for now to not break existing pattern too much, or just rely on form.

    // Actually, let's simplify and remove the controlled state if we are using formData, 
    // but the verifying step showed existing state usage.
    // Let's keep it simple: Just use the form.

    useEffect(() => {
        router.prefetch('/')
    }, [router])

    const handleLoginWrapper = async (formData: FormData) => {
        setIsLoading(true)
        const result = await login(formData)
        if (result) {
            alert(result)
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <form action={handleLoginWrapper} className="flex flex-col gap-4 w-[300px]">
                <h1 className="text-2xl font-bold text-white text-center">RFRNCS OS</h1>
                <Input
                    name="username"
                    type="text"
                    placeholder="Username"
                    disabled={isLoading}
                    required
                />
                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    disabled={isLoading}
                    required
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Accessing..." : "Enter System"}
                </Button>
            </form>
        </div>
    )
}
