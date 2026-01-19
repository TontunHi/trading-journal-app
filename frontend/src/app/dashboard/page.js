"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { StatsCards } from "@/components/StatsCards"
import { OrdersTable } from "@/components/OrdersTable"
import { TradeDetailsModal } from "@/components/TradeDetailsModal" // Use new modal
import { Button } from "@/components/ui/form-elements"
import Link from "next/link"
import { PlusCircle, WalletCards } from "lucide-react"

const API_Base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [trades, setTrades] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [filter, setFilter] = useState('ALL') // ALL, OPEN, CLOSED
  const [currency, setCurrency] = useState('USD') // USD or USC

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    if (!user) return;
    try {
      const statsRes = await axios.get(`${API_Base}/trades/stats`, {
        params: { userId: user.id, currency }
      });
      setStats(statsRes.data);

      let url = `${API_Base}/trades?userId=${user.id}`;
      if (filter !== 'ALL') url += `&status=${filter}`;

      const tradesRes = await axios.get(url);
      const allTrades = tradesRes.data;
      const filteredTrades = allTrades.filter(t => t.currency === currency);

      setTrades(filteredTrades);

      if (selectedTrade) {
        const updated = filteredTrades.find(t => t.id === selectedTrade.id);
        if (updated) setSelectedTrade(updated);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  useEffect(() => {
    fetchData();
  }, [user, filter, currency]);

  if (authLoading || !user) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Minimized Header with Currency Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sr-only">Dashboard</h1> {/* Hidden title for SEO, minimal UI */}

          {/* Currency Switcher */}
          <div className="bg-muted p-1 rounded-lg inline-flex">
            {['USD', 'USC'].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${currency === c ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {c === 'USD' ? '$' : '¢'} {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex bg-muted p-1 rounded-lg">
          {['ALL', 'OPEN', 'CLOSED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="space-y-2 pt-2">
        {/* Table Header / Action */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Trading Activity ({currency})</h2>
          <Link href="/add-trade">
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <PlusCircle className="h-3.5 w-3.5" />
              New Trade
            </Button>
          </Link>
        </div>

        <OrdersTable trades={trades} onEdit={setSelectedTrade} />
      </div>

      {/* Replaced CloseTradeModal with TradeDetailsModal */}
      <TradeDetailsModal
        trade={selectedTrade}
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onRefresh={fetchData}
      />
    </div>
  )
}
