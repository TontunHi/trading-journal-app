"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Percent, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatsCards({ stats }) {
    if (!stats) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-8 w-8 bg-muted rounded-lg" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-32 bg-muted rounded mb-2" />
                            <div className="h-3 w-20 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const cards = [
        {
            title: "Total Balance",
            value: `$${stats.balance?.toFixed(2) || '0.00'}`,
            subtitle: "Current Equity",
            icon: DollarSign,
            trend: null,
            gradient: "from-emerald-500/10 to-teal-500/10",
            iconBg: "bg-emerald-500/10 text-emerald-500"
        },
        {
            title: "Win Rate",
            value: `${stats.winRate?.toFixed(1) || 0}%`,
            subtitle: `${stats.totalTrades || 0} Total Trades`,
            icon: Percent,
            trend: stats.winRate >= 50 ? "up" : "down",
            gradient: stats.winRate >= 50 ? "from-emerald-500/10 to-green-500/10" : "from-red-500/10 to-rose-500/10",
            iconBg: stats.winRate >= 50 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        },
        {
            title: "Profit Factor",
            value: stats.profitFactor?.toFixed(2) || '0.00',
            subtitle: "Risk/Reward Efficiency",
            icon: TrendingUp,
            trend: stats.profitFactor >= 1.5 ? "up" : stats.profitFactor >= 1 ? null : "down",
            gradient: stats.profitFactor >= 1.5 ? "from-blue-500/10 to-indigo-500/10" : "from-amber-500/10 to-orange-500/10",
            iconBg: stats.profitFactor >= 1.5 ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"
        },
        {
            title: "Active Trades",
            value: stats.openTrades || 0,
            subtitle: `${stats.closedTrades || 0} Closed`,
            icon: Activity,
            trend: null,
            gradient: "from-violet-500/10 to-purple-500/10",
            iconBg: "bg-violet-500/10 text-violet-500"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <Card 
                    key={card.title} 
                    className={cn(
                        "card-glow overflow-hidden animate-fade-in",
                        `stagger-${index + 1}`
                    )}
                >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", card.gradient)} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                        <div className={cn("p-2 rounded-lg", card.iconBg)}>
                            <card.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold stat-number">{card.value}</span>
                            {card.trend === "up" && (
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            )}
                            {card.trend === "down" && (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.subtitle}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
