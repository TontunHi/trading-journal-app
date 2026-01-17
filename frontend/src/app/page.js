"use client"

import Link from "next/link"
import { Button } from "@/components/ui/form-elements"
import { TrendingUp, BarChart2, Calendar, ShieldCheck } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                        T
                    </div>
                    <span className="text-xl font-bold tracking-tight">TradeJournal</span>
                </div>
                <div className="flex gap-4">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/register">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent pb-2">
                            Master Your Trading Journey
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            The professional trading journal that helps you track, analyze, and improve your performance with powerful analytics and discipline tools.
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                        <Link href="/register">
                            <Button size="lg" className="h-12 px-8 text-lg">Start Journaling Free</Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">Live Demo</Button>
                        </Link>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid md:grid-cols-3 gap-8 pt-16 text-left">
                        <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                            <BarChart2 className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">Advanced Analytics</h3>
                            <p className="text-muted-foreground">Visualize your win rate, profit factor, and equity curve automatically.</p>
                        </div>
                        <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                            <Calendar className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">Calendar View</h3>
                            <p className="text-muted-foreground">Track your daily P/L and habits with an intuitive monthly calendar.</p>
                        </div>
                        <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                            <ShieldCheck className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">Risk Management</h3>
                            <p className="text-muted-foreground">Built-in position size calculator to keep your risk under control.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-6 border-t border-border text-center text-sm text-muted-foreground">
                &copy; 2026 TradeJournal. All rights reserved.
            </footer>
        </div>
    )
}
