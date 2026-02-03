"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { LayoutDashboard, Calendar, PlusCircle, LogOut, Calculator, TrendingUp } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "./ui/form-elements"
import { cn } from "@/lib/utils"

export default function Navbar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    // Hide navbar on public pages if user is not logged in
    const isPublic = ["/", "/login", "/register"].includes(pathname)
    if (!user && isPublic) return null
    if (isPublic && !user) return null

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Calendar", href: "/calendar", icon: Calendar },
        { name: "Calculator", href: "/calculator", icon: Calculator },
        { name: "Add Trade", href: "/add-trade", icon: PlusCircle },
    ]

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/50 glass">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg group">
                    <div className="h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20">
                        <img src="/icon.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden sm:flex flex-col">
                        <span className="text-base font-bold leading-none">TradeJournal</span>
                        <span className="text-[10px] text-muted-foreground leading-none">Pro Analytics</span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                    isActive 
                                        ? "text-primary" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                                <span className="hidden md:inline-block">{item.name}</span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Actions */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {user && (
                        <div className="flex items-center gap-3 border-l border-border/50 pl-3">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-sm font-medium leading-none truncate max-w-[150px]">{user.email}</span>
                                <span className="text-[10px] text-muted-foreground">Trader</span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={logout} 
                                title="Logout"
                                className="hover:bg-red-500/10 hover:text-red-500"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
