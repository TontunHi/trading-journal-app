"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import axios from "axios"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine, Calendar, BarChart3, Target } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ComposedChart, Line } from 'recharts'
import { Button } from "@/components/ui/form-elements"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DailyJournalModal } from "@/components/DailyJournalModal"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const API_Base = "/api"

// Use explicit colors that work in dark mode
const axisColor = 'rgba(148, 163, 184, 0.8)'
const gridColor = 'rgba(148, 163, 184, 0.15)'

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs min-w-[120px]">
                <p className="text-muted-foreground mb-2 font-medium">Day {label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex justify-between gap-4">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className={cn("font-bold", entry.name === 'P/L' && (entry.value >= 0 ? "text-emerald-500" : "text-red-500"))}>
                            {entry.name === 'P/L' ? (entry.value >= 0 ? '+' : '') : ''}${entry.value?.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export default function CalendarPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [currentDate, setCurrentDate] = useState(new Date())
    const [summaryData, setSummaryData] = useState({})
    const [selectedDate, setSelectedDate] = useState(null)
    const [currency, setCurrency] = useState('USD')

    // Load saved currency preference
    useEffect(() => {
        const saved = localStorage.getItem('trading-journal-currency')
        if (saved) setCurrency(saved)
    }, [])

    const handleCurrencyChange = (c) => {
        setCurrency(c)
        localStorage.setItem('trading-journal-currency', c)
    }

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    })

    const startDayOfWeek = startOfMonth(currentDate).getDay()
    const paddingDays = Array.from({ length: startDayOfWeek })

    const fetchSummary = useCallback(async (signal) => {
        if (!user) return
        try {
            const monthStr = format(currentDate, 'yyyy-MM-dd')
            const res = await axios.get(`${API_Base}/calendar/summary`, {
                params: { userId: user.id, month: monthStr, currency },
                signal
            })
            setSummaryData(res.data)
        } catch (error) {
            if (axios.isCancel(error)) return
            console.error("Error fetching calendar summary:", error)
        }
    }, [user, currentDate, currency])

    useEffect(() => {
        const controller = new AbortController()
        if (user) {
            fetchSummary(controller.signal)
        }
        return () => controller.abort()
    }, [fetchSummary])

    // Calculate monthly stats
    const monthlyStats = useMemo(() => {
        const values = Object.values(summaryData)
        return {
            totalPnl: values.reduce((acc, curr) => acc + (curr.pnl || 0), 0),
            totalDeposit: values.reduce((acc, curr) => acc + (curr.deposit || 0), 0),
            totalWithdraw: values.reduce((acc, curr) => acc + (curr.withdrawal || 0), 0),
            tradingDays: values.filter(v => v.pnl !== 0).length,
            winDays: values.filter(v => (v.pnl || 0) > 0).length,
            lossDays: values.filter(v => (v.pnl || 0) < 0).length
        }
    }, [summaryData])

    // Chart data with cumulative P/L
    const chartData = useMemo(() => {
        let cumulative = 0
        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const data = summaryData[dateStr] || {}
            const pnl = data.pnl || 0
            const deposit = data.deposit || 0
            const withdrawal = data.withdrawal || 0
            cumulative += pnl
            
            return {
                date: format(day, 'd'),
                fullDate: dateStr,
                dayName: format(day, 'EEE'),
                pnl: pnl,
                deposit: deposit,
                withdrawal: withdrawal,
                cumulative: cumulative,
                hasActivity: pnl !== 0 || deposit > 0 || withdrawal > 0
            }
        }).filter(d => d.hasActivity)
    }, [days, summaryData])

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const handleDateClick = (dateStr) => setSelectedDate(dateStr)

    const handleModalClose = () => setSelectedDate(null)
    const handleRefresh = () => {
        fetchSummary()
        setSelectedDate(null)
    }

    if (authLoading || !user) return <div className="p-8 text-center animate-pulse">Loading...</div>

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Calendar</h1>
                        <p className="text-xs text-muted-foreground">Track daily performance</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Currency Toggle */}
                    <div className="bg-muted p-1 rounded-lg flex">
                        {['USD', 'USC'].map(c => (
                            <button
                                key={c}
                                onClick={() => handleCurrencyChange(c)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                                    currency === c 
                                        ? 'bg-background shadow-sm text-primary' 
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {c === 'USD' ? '$' : '¢'} {c}
                            </button>
                        ))}
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center rounded-lg border bg-card/50">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="w-36 text-center font-bold">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Monthly Stats Row */}
            <div className="grid grid-cols-4 gap-3">
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", monthlyStats.totalPnl >= 0 ? "bg-emerald-500/10" : "bg-red-500/10")}>
                        {monthlyStats.totalPnl >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Net P/L</p>
                        <p className={cn("font-bold stat-number", monthlyStats.totalPnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {monthlyStats.totalPnl >= 0 ? '+' : ''}${monthlyStats.totalPnl.toFixed(2)}
                        </p>
                    </div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Deposits</p>
                        <p className="font-bold text-blue-500">+${monthlyStats.totalDeposit.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <ArrowUpFromLine className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Withdrawals</p>
                        <p className="font-bold text-orange-500">-${monthlyStats.totalWithdraw.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Target className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Win/Loss Days</p>
                        <p className="font-bold">
                            <span className="text-emerald-500">{monthlyStats.winDays}</span>
                            <span className="text-muted-foreground mx-1">/</span>
                            <span className="text-red-500">{monthlyStats.lossDays}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Calendar Grid - Fixed height */}
            <Card className="card-glow overflow-hidden">
                <div className="grid grid-cols-7 gap-px bg-border">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-muted/50 p-1.5 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {day}
                        </div>
                    ))}

                    {paddingDays.map((_, i) => (
                        <div key={`pad-${i}`} className="bg-card/30 h-16" />
                    ))}

                    {days.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const data = summaryData[dateStr] || {}
                        const pnl = data.pnl || 0
                        const isProfit = pnl > 0
                        const isLoss = pnl < 0

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleDateClick(dateStr)}
                                className={cn(
                                    "bg-card p-1.5 h-16 flex flex-col cursor-pointer transition-all group",
                                    "hover:bg-accent/50 hover:z-10",
                                    isToday(day) && "ring-2 ring-inset ring-primary/30 bg-primary/5"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full",
                                        isToday(day) ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    <div className="flex gap-0.5">
                                        {data.deposit > 0 && <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center"><ArrowDownToLine className="h-2.5 w-2.5 text-blue-500" /></div>}
                                        {data.withdrawal > 0 && <div className="h-4 w-4 rounded-full bg-orange-500/20 flex items-center justify-center"><ArrowUpFromLine className="h-2.5 w-2.5 text-orange-500" /></div>}
                                    </div>
                                </div>
                                {pnl !== 0 && (
                                    <div className="mt-auto flex items-center justify-end gap-0.5">
                                        <span className={cn("text-xs font-bold stat-number", isProfit ? "text-emerald-500" : "text-red-500")}>
                                            {isProfit ? '+' : ''}{pnl.toFixed(0)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Summary Chart */}
            {chartData.length > 0 && (
                <Card className="card-glow">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">Monthly Summary - {format(currentDate, 'MMMM yyyy')}</CardTitle>
                        </div>
                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-border/50 text-xs">
                            <div><span className="text-muted-foreground">Trading Days:</span> <span className="font-bold">{monthlyStats.tradingDays}</span></div>
                            <div><span className="text-muted-foreground">Win Rate:</span> <span className="font-bold">{monthlyStats.tradingDays > 0 ? ((monthlyStats.winDays / monthlyStats.tradingDays) * 100).toFixed(0) : 0}%</span></div>
                            <div><span className="text-muted-foreground">Avg Daily:</span> <span className={cn("font-bold", monthlyStats.totalPnl >= 0 ? "text-emerald-500" : "text-red-500")}>${monthlyStats.tradingDays > 0 ? (monthlyStats.totalPnl / monthlyStats.tradingDays).toFixed(2) : '0.00'}</span></div>
                            <div><span className="text-muted-foreground">Net Flow:</span> <span className="font-bold">${(monthlyStats.totalDeposit - monthlyStats.totalWithdraw + monthlyStats.totalPnl).toFixed(2)}</span></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 11 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={45} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <ReferenceLine y={0} stroke={axisColor} strokeDasharray="3 3" opacity={0.5} />
                                    <Bar dataKey="pnl" name="P/L" radius={[3, 3, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'} />
                                        ))}
                                    </Bar>
                                    <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="rgb(99, 102, 241)" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedDate && (
                <DailyJournalModal
                    userId={user.id}
                    date={selectedDate}
                    summaryData={summaryData[selectedDate]}
                    isOpen={!!selectedDate}
                    onClose={handleModalClose}
                    onRefresh={handleRefresh}
                    currency={currency}
                />
            )}
        </div>
    )
}
