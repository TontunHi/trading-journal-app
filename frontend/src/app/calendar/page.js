"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { Button } from "@/components/ui/form-elements"
import { DailyJournalModal } from "@/components/DailyJournalModal"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const API_Base = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function CalendarPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [currentDate, setCurrentDate] = useState(new Date())
    const [summaryData, setSummaryData] = useState({})
    const [selectedDate, setSelectedDate] = useState(null)
    const [currency, setCurrency] = useState('USD')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    })

    const startDayOfWeek = startOfMonth(currentDate).getDay();
    const paddingDays = Array.from({ length: startDayOfWeek });

    const fetchSummary = async () => {
        if (!user) return;
        try {
            const monthStr = format(currentDate, 'yyyy-MM-dd');
            const res = await axios.get(`${API_Base}/calendar/summary`, {
                params: { userId: user.id, month: monthStr, currency }
            });
            setSummaryData(res.data);
        } catch (error) {
            console.error("Error fetching calendar summary:", error)
        }
    }

    useEffect(() => {
        fetchSummary();
    }, [currentDate, user, currency])

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

    const handleDateClick = (dateStr) => {
        setSelectedDate(dateStr)
    }

    if (authLoading || !user) return <div className="p-8 text-center animate-pulse">Loading cal...</div>;

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex bg-muted p-1 rounded-lg">
                    {['USD', 'USC'].map(c => (
                        <button
                            key={c}
                            onClick={() => setCurrency(c)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === c ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {/* Monthly Summary */}
                    <div className="hidden lg:flex gap-4 text-sm mr-4 bg-muted/30 p-2 rounded-lg border border-border/50">
                        <div className="flex flex-col items-center px-2">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Net P/L</span>
                            <span className={cn("font-bold", Object.values(summaryData).reduce((acc, curr) => acc + (curr.pnl || 0), 0) >= 0 ? "text-green-500" : "text-red-500")}>
                                {Object.values(summaryData).reduce((acc, curr) => acc + (curr.pnl || 0), 0) >= 0 ? '+' : ''}
                                {Object.values(summaryData).reduce((acc, curr) => acc + (curr.pnl || 0), 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-border/50"></div>
                        <div className="flex flex-col items-center px-2">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Deposit</span>
                            <span className="font-bold text-blue-500">
                                {Object.values(summaryData).reduce((acc, curr) => acc + (curr.deposit || 0), 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-border/50"></div>
                        <div className="flex flex-col items-center px-2">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Withdraw</span>
                            <span className="font-bold text-orange-500">
                                {Object.values(summaryData).reduce((acc, curr) => acc + (curr.withdrawal || 0), 0).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center rounded-md border bg-card/50">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="w-32 text-center font-bold text-lg">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-xl overflow-hidden shadow-sm flex-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-muted/30 p-2 text-center text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
                        {day}
                    </div>
                ))}

                {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} className="bg-card/30" />
                ))}

                {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const data = summaryData[dateStr] || {};
                    const pnl = data.pnl || 0;
                    const hasActivity = pnl !== 0 || data.deposit > 0 || data.withdrawal > 0;
                    const isProfit = pnl > 0;
                    const isLoss = pnl < 0;

                    return (
                        <div
                            key={dateStr}
                            onClick={() => handleDateClick(dateStr)}
                            className={cn(
                                "bg-card p-2 min-h-[80px] flex flex-col justify-between cursor-pointer hover:bg-accent/50 transition-all group relative border-t border-l border-border/50",
                                isToday(day) && "bg-primary/5 ring-1 ring-inset ring-primary/20 z-10"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full transition-colors",
                                    isToday(day) ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground/60 group-hover:text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>

                                <div className="flex gap-0.5">
                                    {/* Icons for Deposit/Withdraw */}
                                    {data.deposit > 0 && (
                                        <ArrowDownCircle className="h-4 w-4 text-blue-500" title={`Deposit: $${data.deposit}`} />
                                    )}
                                    {data.withdrawal > 0 && (
                                        <ArrowUpCircle className="h-4 w-4 text-orange-500" title={`Withdrawal: $${data.withdrawal}`} />
                                    )}
                                </div>
                            </div>

                            {hasActivity && pnl !== 0 && (
                                <div className="flex items-end justify-end gap-1 mt-auto">
                                    {isProfit ? (
                                        <TrendingUp className="h-4 w-4 text-green-500 mb-0.5" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-500 mb-0.5" />
                                    )}
                                    <span className={cn(
                                        "text-sm font-bold tracking-tight",
                                        isProfit ? "text-green-600" : "text-red-500"
                                    )}>
                                        {isProfit ? '+' : ''}{pnl.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {selectedDate && (
                <DailyJournalModal
                    userId={user.id}
                    date={selectedDate}
                    summaryData={summaryData[selectedDate]}
                    isOpen={!!selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onRefresh={fetchSummary}
                    currency={currency}
                />
            )}
        </div>
    )
}
