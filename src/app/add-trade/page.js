"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button, Input, Label, Textarea } from "@/components/ui/form-elements"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function AddTradePage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        asset: "XAUUSD",
        currency: "USD",
        timeframe: "M15",
        session: "NY",
        type: "BUY",
        entry_price: "",
        tp: "",
        sl: "",
        lot_size: "",
        notes: "",
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) return;
        setLoading(true)

        try {
            const tradePayload = {
                userId: user.id,
                ...formData
            };

            await axios.post(`/api/trades`, tradePayload);

            router.push("/dashboard");
        } catch (error) {
            console.error("Error submitting trade:", error)
            alert("Failed to submit trade. See console.")
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || !user) return <div className="p-8 text-center animate-pulse">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Log New Trade</h1>
            </div>

            <Card className="card-glow">
                <CardHeader>
                    <CardTitle>Trade Details</CardTitle>
                    <CardDescription>Enter your trade parameters below</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Row 1: Asset, Session, Timeframe */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Asset Pair</Label>
                                <select
                                    name="asset"
                                    required
                                    onChange={handleChange}
                                    value={formData.asset || "XAUUSD"}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                                >
                                    <option value="XAUUSD">XAUUSD</option>
                                    <option value="EURUSD">EURUSD</option>
                                    <option value="GBPUSD">GBPUSD</option>
                                    <option value="USDJPY">USDJPY</option>
                                    <option value="US30">US30</option>
                                    <option value="NAS100">NAS100</option>
                                    <option value="BTCUSD">BTCUSD</option>
                                    <option value="ETHUSD">ETHUSD</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Session</Label>
                                <select
                                    name="session"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                                    onChange={handleChange}
                                    value={formData.session}
                                >
                                    <option value="Asian">Asian</option>
                                    <option value="London">London</option>
                                    <option value="NY">New York</option>
                                    <option value="Overlaps">Overlaps</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Timeframe</Label>
                                <select
                                    name="timeframe"
                                    onChange={handleChange}
                                    value={formData.timeframe || "M15"}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                                >
                                    <option value="M1">M1</option>
                                    <option value="M5">M5</option>
                                    <option value="M15">M15</option>
                                    <option value="M30">M30</option>
                                    <option value="H1">H1</option>
                                    <option value="H4">H4</option>
                                    <option value="D1">D1</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Type, Currency */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Order Type</Label>
                                <div className="flex gap-2">
                                    {['BUY', 'SELL'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type }))}
                                            className={`flex-1 h-10 rounded-md font-medium text-sm transition-all border ${formData.type === type
                                                ? type === 'BUY' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500' : 'bg-red-500/20 text-red-500 border-red-500'
                                                : 'bg-background border-input hover:bg-accent'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <select
                                    name="currency"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                                    onChange={handleChange}
                                    value={formData.currency}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="USC">USC (¢)</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Prices & Lot */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Entry Price</Label>
                                <Input type="number" step="any" name="entry_price" required onChange={handleChange} value={formData.entry_price} placeholder="e.g. 2650.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Lot Size</Label>
                                <Input type="number" step="any" name="lot_size" required onChange={handleChange} value={formData.lot_size} placeholder="e.g. 0.01" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Stop Loss</Label>
                                <Input type="number" step="any" name="sl" placeholder="Price" onChange={handleChange} value={formData.sl} />
                            </div>
                            <div className="space-y-2">
                                <Label>Take Profit</Label>
                                <Input type="number" step="any" name="tp" placeholder="Price" onChange={handleChange} value={formData.tp} />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Strategy / Notes</Label>
                            <Textarea
                                name="notes"
                                placeholder="Why did you take this trade?"
                                className="h-32 resize-none"
                                onChange={handleChange}
                                value={formData.notes}
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" size="lg" className="min-w-[150px]" disabled={loading}>
                                {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Log Trade</>}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
