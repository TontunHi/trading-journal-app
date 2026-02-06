"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { StatsCards } from "@/components/StatsCards"
import { OrdersTable } from "@/components/OrdersTable"
import { TradeDetailsModal } from "@/components/TradeDetailsModal"
import { PerformanceChart } from "@/components/PerformanceChart"
import { DateRangePicker } from "@/components/DateRangePicker"
import { Button } from "@/components/ui/form-elements"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, TrendingUp, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const API_Base = "/api"

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [trades, setTrades] = useState([])
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [currency, setCurrency] = useState('USD')
  const [period, setPeriod] = useState('month')
  const [customRange, setCustomRange] = useState(null)
  const [chartLoading, setChartLoading] = useState(false)
  
  const initialLoadDone = useRef(false)

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

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      const [statsRes, tradesRes] = await Promise.all([
        axios.get(`${API_Base}/trades/stats`, { params: { userId: user.id, currency } }),
        axios.get(`${API_Base}/trades`, { params: { userId: user.id, status: filter !== 'ALL' ? filter : undefined } })
      ])
      
      setStats(statsRes.data)
      const filteredTrades = tradesRes.data.filter(t => t.currency === currency)
      setTrades(filteredTrades)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }, [user, currency, filter])

  const fetchAnalytics = useCallback(async () => {
    if (!user) return
    setChartLoading(true)
    try {
      const params = { userId: user.id, currency, period }
      
      // Add custom date range if selected
      if (period === 'custom' && customRange) {
        params.startDate = format(customRange.start, 'yyyy-MM-dd')
        params.endDate = format(customRange.end, 'yyyy-MM-dd')
      }
      
      const res = await axios.get(`${API_Base}/trades/analytics`, { params })
      setAnalytics(res.data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setChartLoading(false)
    }
  }, [user, currency, period, customRange])

  useEffect(() => {
    if (user && !initialLoadDone.current) {
      fetchData()
      fetchAnalytics()
      initialLoadDone.current = true
    }
  }, [user])

  useEffect(() => {
    if (initialLoadDone.current) {
      fetchData()
    }
  }, [currency, filter])

  useEffect(() => {
    if (initialLoadDone.current) {
      fetchAnalytics()
    }
  }, [period, currency, customRange])

  const handleModalClose = () => setSelectedTrade(null)

  const handleRefresh = async () => {
    await fetchData()
    await fetchAnalytics()
    setSelectedTrade(null)
  }

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    if (newPeriod !== 'custom') {
      setCustomRange(null)
    }
  }

  const handleCustomRangeChange = (range) => {
    setCustomRange(range)
  }

  if (authLoading || !user) return (
    <div className="p-8 text-center text-muted-foreground">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="bg-muted p-1 rounded-lg inline-flex">
            {['USD', 'USC'].map(c => (
              <button
                key={c}
                onClick={() => handleCurrencyChange(c)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1",
                  currency === c 
                    ? 'bg-background shadow-sm text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {c === 'USD' ? '$' : '¢'} {c}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex bg-muted p-1 rounded-lg">
            {['ALL', 'OPEN', 'CLOSED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                  filter === f 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Link href="/add-trade">
          <Button size="sm" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            New Trade
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Performance Chart Section */}
      <Card className="card-glow overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Performance</CardTitle>
            </div>
            
            {/* Period Selector with Custom Date */}
            <DateRangePicker 
              value={period}
              onChange={handlePeriodChange}
              onRangeChange={handleCustomRangeChange}
            />
          </div>

          {/* Analytics Summary */}
          {analytics?.summary && (
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">P/L:</span>
                <span className={cn(
                  "text-sm font-bold stat-number",
                  parseFloat(analytics.summary.totalPnl) >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {parseFloat(analytics.summary.totalPnl) >= 0 ? '+' : ''}${analytics.summary.totalPnl}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Win Rate:</span>
                <span className="text-sm font-bold">{analytics.summary.winRate}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Trades:</span>
                <span className="text-sm font-bold">{analytics.summary.totalTrades}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Best:</span>
                <span className="text-sm font-bold text-emerald-500">+${analytics.summary.bestTrade}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Worst:</span>
                <span className="text-sm font-bold text-red-500">${analytics.summary.worstTrade}</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <PerformanceChart 
            data={analytics?.chartData} 
            isLoading={chartLoading}
            period={period}
          />
        </CardContent>
      </Card>

      {/* Trades Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trading Activity ({currency})
          </h2>
          <span className="text-xs text-muted-foreground">{trades.length} trades</span>
        </div>

        <OrdersTable trades={trades} onEdit={setSelectedTrade} />
      </div>

      {/* Trade Details Modal */}
      <TradeDetailsModal
        trade={selectedTrade}
        isOpen={!!selectedTrade}
        onClose={handleModalClose}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
