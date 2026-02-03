"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Calculator, ArrowLeft, Copy, Check, AlertTriangle } from "lucide-react"
import Link from "next/link"

import { Button, Input, Label } from "@/components/ui/form-elements"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function RiskCalculatorPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [copied, setCopied] = useState(false)

    const [formData, setFormData] = useState({
        accountBalance: "",
        riskPercent: "1",
        customRisk: "",
        entryPrice: "",
        stopLoss: "",
        asset: "XAUUSD",
        type: "BUY"
    })

    const [result, setResult] = useState(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Calculate risk - auto-runs on form change
    useEffect(() => {
        const { accountBalance, riskPercent, customRisk, entryPrice, stopLoss, asset, type } = formData
        
        // Use custom risk if provided, otherwise use preset
        const riskToUse = customRisk ? customRisk : riskPercent
        
        if (!accountBalance || !riskToUse || !entryPrice || !stopLoss) {
            setResult(null)
            return
        }

        const balance = parseFloat(accountBalance)
        const risk = parseFloat(riskToUse)
        const entry = parseFloat(entryPrice)
        const sl = parseFloat(stopLoss)

        if (isNaN(balance) || isNaN(risk) || isNaN(entry) || isNaN(sl) || balance <= 0 || risk <= 0) {
            setResult(null)
            return
        }

        // Validate direction
        const isValidTrade = 
            (type === 'BUY' && sl < entry) || 
            (type === 'SELL' && sl > entry)

        if (!isValidTrade) {
            setResult({ 
                error: `For ${type}, SL should be ${type === 'BUY' ? 'below' : 'above'} entry` 
            })
            return
        }

        if (entry === sl) {
            setResult({ error: "Entry and SL cannot be the same" })
            return
        }

        // Calculate risk amount in $
        const riskAmount = balance * (risk / 100)

        // Calculate pip distance based on asset
        let pipDistance = 0
        let pipValue = 1 // $ per pip per 0.01 lot

        if (asset === 'XAUUSD') {
            // Gold: 1 pip = $0.01 move, pip value = $1 per 0.01 lot per 10 pips
            // For 0.01 lot: $0.01 move = $0.01 profit/loss
            // So $1 move = $1 profit for 0.01 lot
            pipDistance = Math.abs(entry - sl) // Just the $ difference
            pipValue = 1 // $1 per $1 move per 0.01 lot
        } else if (asset === 'USDJPY') {
            pipDistance = Math.abs(entry - sl) * 100
            pipValue = 0.075 // Approximate for JPY pairs
        } else if (['US30', 'NAS100'].includes(asset)) {
            pipDistance = Math.abs(entry - sl)
            pipValue = 0.01 // $0.01 per point per 0.01 lot
        } else if (asset === 'BTCUSD') {
            pipDistance = Math.abs(entry - sl)
            pipValue = 0.01 // $0.01 per $1 move per 0.01 lot
        } else {
            // Forex pairs like EURUSD, GBPUSD
            pipDistance = Math.abs(entry - sl) * 10000
            pipValue = 0.1 // $0.10 per pip per 0.01 lot
        }

        if (pipDistance === 0) {
            setResult({ error: "Entry and SL cannot be the same" })
            return
        }

        // Calculate lot size
        // lotSize (in 0.01 lots) = riskAmount / (pipDistance * pipValue)
        // Convert to standard lots by dividing by 100
        const lotSizeIn001 = riskAmount / (pipDistance * pipValue)
        const lotSize = lotSizeIn001 / 100

        // Calculate potential outcomes
        const rrRatios = [1.5, 2, 2.5, 3]
        const potentialProfits = rrRatios.map(rr => ({
            ratio: rr,
            amount: (riskAmount * rr).toFixed(2),
            tp: type === 'BUY' 
                ? (entry + (Math.abs(entry - sl) * rr)).toFixed(asset === 'XAUUSD' ? 2 : ['USDJPY'].includes(asset) ? 3 : 5)
                : (entry - (Math.abs(entry - sl) * rr)).toFixed(asset === 'XAUUSD' ? 2 : ['USDJPY'].includes(asset) ? 3 : 5)
        }))

        setResult({
            lotSize: lotSize.toFixed(2),
            riskAmount: riskAmount.toFixed(2),
            riskPercent: risk.toFixed(1),
            pipDistance: pipDistance.toFixed(asset === 'XAUUSD' ? 2 : 1),
            potentialLoss: riskAmount.toFixed(2),
            potentialProfits
        })
    }, [formData])

    const copyLotSize = () => {
        if (result?.lotSize) {
            navigator.clipboard.writeText(result.lotSize)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handlePresetRisk = (r) => {
        setFormData(prev => ({ ...prev, riskPercent: r, customRisk: "" }))
    }

    if (authLoading || !user) return <div className="p-8 text-center animate-pulse">Loading...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Calculator className="h-8 w-8 text-primary" />
                        Risk Calculator
                    </h1>
                    <p className="text-muted-foreground text-sm">Calculate optimal position size based on your risk tolerance</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Input Card */}
                <Card className="card-glow">
                    <CardHeader>
                        <CardTitle className="text-lg">Trade Parameters</CardTitle>
                        <CardDescription>Enter your trade details - result updates automatically</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Account Balance ($)</Label>
                            <Input 
                                type="number" 
                                name="accountBalance" 
                                placeholder="10000"
                                value={formData.accountBalance}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Risk Per Trade (%)</Label>
                            <div className="flex gap-2 mb-2">
                                {['0.5', '1', '2', '3'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handlePresetRisk(r)}
                                        className={cn(
                                            "flex-1 h-9 rounded-md text-sm font-medium transition-all border",
                                            formData.riskPercent === r && !formData.customRisk
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background border-input hover:bg-accent"
                                        )}
                                    >
                                        {r}%
                                    </button>
                                ))}
                            </div>
                            <Input 
                                type="number" 
                                name="customRisk"
                                step="0.1"
                                placeholder="Or enter custom % (e.g. 0.25)"
                                value={formData.customRisk}
                                onChange={handleChange}
                                className="text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Asset</Label>
                                <select
                                    name="asset"
                                    value={formData.asset}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-ring"
                                >
                                    <option value="XAUUSD">XAUUSD (Gold)</option>
                                    <option value="EURUSD">EURUSD</option>
                                    <option value="GBPUSD">GBPUSD</option>
                                    <option value="USDJPY">USDJPY</option>
                                    <option value="US30">US30</option>
                                    <option value="NAS100">NAS100</option>
                                    <option value="BTCUSD">BTCUSD</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Direction</Label>
                                <div className="flex gap-2">
                                    {['BUY', 'SELL'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type }))}
                                            className={cn(
                                                "flex-1 h-10 rounded-md font-medium text-sm transition-all border",
                                                formData.type === type
                                                    ? type === 'BUY' 
                                                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500' 
                                                        : 'bg-red-500/20 text-red-500 border-red-500'
                                                    : 'bg-background border-input hover:bg-accent'
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Entry Price</Label>
                                <Input 
                                    type="number" 
                                    step="any"
                                    name="entryPrice" 
                                    placeholder="2650.00"
                                    value={formData.entryPrice}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stop Loss</Label>
                                <Input 
                                    type="number" 
                                    step="any"
                                    name="stopLoss" 
                                    placeholder="2640.00"
                                    value={formData.stopLoss}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Result Card */}
                <Card className={cn("card-glow transition-all", result && !result.error && "ring-2 ring-primary/20")}>
                    <CardHeader>
                        <CardTitle className="text-lg">Calculation Result</CardTitle>
                        <CardDescription>Your recommended position size</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!result ? (
                            <div className="h-48 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                                <div className="text-center text-muted-foreground">
                                    <Calculator className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Enter all parameters to see result</p>
                                </div>
                            </div>
                        ) : result.error ? (
                            <div className="h-48 flex items-center justify-center">
                                <div className="text-center text-destructive">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                                    <p className="text-sm">{result.error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Main Result */}
                                <div className="bg-gradient-to-br from-primary/10 to-emerald-500/5 border border-primary/20 rounded-xl p-4 text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recommended Lot Size</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-4xl font-bold text-primary stat-number">{result.lotSize}</span>
                                        <button 
                                            onClick={copyLotSize}
                                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                                            title="Copy lot size"
                                        >
                                            {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">lots</p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                                        <p className="text-xs text-muted-foreground">Risk %</p>
                                        <p className="font-bold text-primary">{result.riskPercent}%</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                                        <p className="text-xs text-muted-foreground">Risk $</p>
                                        <p className="font-bold text-red-500">${result.riskAmount}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                                        <p className="text-xs text-muted-foreground">SL Distance</p>
                                        <p className="font-bold">${result.pipDistance}</p>
                                    </div>
                                </div>

                                {/* Potential Profits */}
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Take Profit Targets</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {result.potentialProfits.map(p => (
                                            <div key={p.ratio} className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 text-center">
                                                <p className="text-xs text-muted-foreground">{p.ratio}R @ {p.tp}</p>
                                                <p className="font-bold text-emerald-500">+${p.amount}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
