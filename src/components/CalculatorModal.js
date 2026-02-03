"use client"

import { useState } from "react"
import { Calculator, X } from "lucide-react"
import { Button, Input, Label } from "@/components/ui/form-elements"
// Imports removed

export function CalculatorModal({ isOpen, onClose, onApply }) {
    const [balance, setBalance] = useState("")
    const [riskPercent, setRiskPercent] = useState(1)
    const [stopLoss, setStopLoss] = useState(100) // points (was pips)
    const [pointValue, setPointValue] = useState(1) // $ per lot per point (e.g. 1 for Standard USD)

    if (!isOpen) return null;

    const calculateLot = () => {
        if (!balance || !stopLoss || !pointValue) return 0;
        const riskAmount = (parseFloat(balance) * parseFloat(riskPercent)) / 100;
        // Risk = Lot * SL_Points * PointValue
        // Lot = Risk / (SL_Points * PointValue)
        const lot = riskAmount / (parseFloat(stopLoss) * parseFloat(pointValue));
        return parseFloat(lot.toFixed(2)); // Standard 2 decimals
    };

    const calculatedLot = calculateLot();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Position Size Calculator
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Account Balance ($)</Label>
                            <Input
                                type="number"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                placeholder="10000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Risk (%)</Label>
                            <Input
                                type="number"
                                value={riskPercent}
                                onChange={(e) => setRiskPercent(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Stop Loss (Points)</Label>
                            <Input
                                type="number"
                                value={stopLoss}
                                onChange={(e) => setStopLoss(e.target.value)}
                                placeholder="e.g. 100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Point Value ($)</Label>
                            <Input
                                type="number"
                                value={pointValue}
                                onChange={(e) => setPointValue(e.target.value)}
                                placeholder="1.0"
                            />
                            <p className="text-[10px] text-muted-foreground">$/Lot/Point (1.0 for XAUUSD)</p>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-md text-center">
                        <p className="text-sm text-muted-foreground">Suggested Lot Size</p>
                        <div className="text-3xl font-bold text-primary mt-1">{calculatedLot}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Risk Amount: ${(parseFloat(balance) * parseFloat(riskPercent) / 100).toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-border flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => {
                        onApply(calculatedLot);
                        onClose();
                    }}>
                        Apply to Trade
                    </Button>
                </div>
            </div>
        </div>
    )
}
