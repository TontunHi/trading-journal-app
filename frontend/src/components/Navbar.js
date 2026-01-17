"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { LayoutDashboard, Calendar, PlusCircle, LogOut, User } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "./ui/form-elements"
import { cn } from "@/lib/utils"

export default function Navbar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    // Hide navbar on public pages if user is not logged in
    const isPublic = ["/", "/login", "/register"].includes(pathname)
    if (!user && isPublic) return null

    // If user is logged in, we might still want to show a simplified navbar on home, 
    // but usually app navbar is for app pages. 
    // Let's assume if user is logged in, they see the app navbar everywhere, 
    // OR we redirect them to dashboard. Login page handles redirect.

    if (isPublic && !user) return null;

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Calendar", href: "/calendar", icon: Calendar },
        { name: "Add Trade", href: "/add-trade", icon: PlusCircle },
    ]

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg group">
                    <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                        <img src="/icon.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="hidden sm:inline-block">TradeJournal</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1 sm:gap-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            <span className="hidden sm:inline-block">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {user && (
                        <div className="flex items-center gap-2 border-l border-border pl-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium leading-none">{user.email}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
