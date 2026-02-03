"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button, Input, Label } from "@/components/ui/form-elements"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
    const { register, user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!authLoading && user) {
            router.push("/dashboard")
        }
    }, [user, authLoading, router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            await register(email)
            router.push("/dashboard")
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
    )

    const benefits = [
        "Track all your trades in one place",
        "Visual performance analytics",
        "Risk calculator included",
        "Free forever, no credit card"
    ]

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo & Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden shadow-lg shadow-primary/20">
                        <img src="/icon.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
                    <p className="text-muted-foreground mt-1">Start tracking your trades today</p>
                </div>

                {/* Register Card */}
                <div className="glass-strong rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="trader@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold" 
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Get Started
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Benefits */}
                    <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                        {benefits.map((benefit, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "flex items-center gap-2 text-sm text-muted-foreground animate-fade-in",
                                    `stagger-${i + 1}`
                                )}
                            >
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-border/50 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
