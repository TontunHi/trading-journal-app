"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button, Input, Label } from "@/components/ui/form-elements"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function RegisterPage() {
    const { register } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)
        setError("")

        const res = await register(email, password)
        if (!res.success) {
            setError(res.error)
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Register</CardTitle>
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
                        <div className="space-y-2">
                            <Label>Confirm Password</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating Account..." : "Register"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
