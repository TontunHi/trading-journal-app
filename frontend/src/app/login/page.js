"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button, Input, Label } from "@/components/ui/form-elements"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await login(email, password)
        if (!res.success) {
            setError(res.error)
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Don't have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
