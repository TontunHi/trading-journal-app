"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, PlusCircle, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"
import { useAuth } from "@/context/AuthContext"

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Add Trade", href: "/add-trade", icon: PlusCircle },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    // Hide sidebar if not logged in or on public pages
    // Adjust logic as needed. If user is null, we can check path to avoid flash?
    // But user is null initially during loading.
    // Ideally, layout should handle this, but checking path is safe.
    const hiddenPaths = ["/", "/login", "/register"]
    if (hiddenPaths.includes(pathname)) return null;
    if (!user) return null; // Double check

    return (
        <div className="hidden md:flex h-full w-64 flex-col border-r border-border bg-card">
            <div className="flex h-14 items-center border-b border-border px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        T
                    </div>
                    <span className="">TradeJournal</span>
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href
                                    ? "bg-muted text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto border-t border-border p-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium truncate w-32" title={user.email}>{user.email}</span>
                        <span className="text-xs text-muted-foreground">Pro Plan</span>
                    </div>
                    <ThemeToggle />
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    )
}
