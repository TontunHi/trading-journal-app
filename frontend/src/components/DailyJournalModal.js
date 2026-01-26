"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { X, Save } from "lucide-react"
import { Button, Input, Label } from "@/components/ui/form-elements"
import { OrdersTable } from "@/components/OrdersTable"

const API_Base = process.env.NEXT_PUBLIC_API_URL || "/api";

export function DailyJournalModal({ userId, date, isOpen, onClose, summaryData, onRefresh, currency = 'USD' }) {
    const [formData, setFormData] = useState({
        deposit: "",
        withdrawal: "",
        manual_pnl: ""
    })
    const [trades, setTrades] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && date) {
            // 1. Set form data from summary if exists
            if (summaryData) {
                setFormData({
                    deposit: summaryData.deposit || "",
                    withdrawal: summaryData.withdrawal || "",
                    manual_pnl: summaryData.manual_pnl || ""
                })
            } else {
                setFormData({ deposit: "", withdrawal: "", manual_pnl: "" })
            }

            // 2. Fetch Trades for this date
            // Note: Should we filter trades by currency here too? 
            // The modal is context-aware via 'currency' prop.
            // If I am in USD mode, I want to see USD trades.
            fetchTradesForDate();
        }
    }, [isOpen, date, summaryData, currency])

    const fetchTradesForDate = async () => {
        try {
            // Fetch all trades for date, or filtered.
            // Current backend trade list works on all. I'll filter client side or just show all for context?
            // "SummaryData" is currency specific. So the modal "Quick Update" attaches to that currency.
            // The trades list below... maybe show only relevant ones?
            const res = await axios.get(`${API_Base}/trades?userId=${userId}&date=${date}`);
            const allTrades = res.data;
            setTrades(allTrades.filter(t => t.currency === currency));
        } catch (error) {
            console.error("Error fetching trades for date:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post(`${API_Base}/calendar/daily-summary`, {
                userId,
                date,
                currency, // Pass currency to backend
                ...formData
            });
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error updating daily summary:", error)
            alert("Failed to update")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-card border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            Daily Journal
                            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{currency}</span>
                        </h2>
                        <span className="text-sm text-muted-foreground">{date}</span>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                    {/* Manual Updates Section */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Quick Portfolio Update ({currency})</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Deposit</Label>
                                <Input type="number" step="any" name="deposit" value={formData.deposit} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Withdrawal</Label>
                                <Input type="number" step="any" name="withdrawal" value={formData.withdrawal} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Manual P/L</Label>
                                <Input type="number" step="any" name="manual_pnl" value={formData.manual_pnl} onChange={handleChange} placeholder="e.g. from other sources" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? "Saving..." : "Update Daily Stats"}
                            </Button>
                        </div>
                    </form>

                    <div className="border-t border-border my-4"></div>

                    {/* Trades List Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Trades on this day ({currency})</h3>
                        <OrdersTable trades={trades} onEdit={() => { }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
