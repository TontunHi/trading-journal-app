"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { X } from "lucide-react"
import { Button, Input, Label, Textarea } from "@/components/ui/form-elements"
import { cn } from "@/lib/utils"

export function CloseTradeModal({ trade, isOpen, onClose, onRefresh }) {
    const [formData, setFormData] = useState({
        exit_price: "",
        pnl: "",
        close_reason: "TP",
        notes: ""
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (trade) {
            // Pre-fill if editing an already closed trade, or just defaults
            setFormData({
                exit_price: trade.exit_price || "",
                pnl: trade.pnl || "",
                close_reason: trade.close_reason || "TP",
                notes: trade.notes || ""
            })
        }
    }, [trade])

    if (!isOpen || !trade) return null;

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                status: 'CLOSED'
            };

            await axios.put(`/api/trades/${trade.id}`, payload);

            onRefresh(); // Refresh parent list
            onClose();
        } catch (error) {
            console.error("Error closing trade:", error)
            alert("Failed to close trade")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">Close Trade #{trade.id}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Exit Price</Label>
                            <Input type="number" step="any" name="exit_price" value={formData.exit_price} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label>P/L ($)</Label>
                            <Input type="number" step="any" name="pnl" value={formData.pnl} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Close Reason</Label>
                        <div className="flex gap-2">
                            {['TP', 'SL', 'BE', 'MANUAL'].map(reason => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, close_reason: reason }))}
                                    className={cn(
                                        "flex-1 h-9 rounded text-xs font-medium border transition-all",
                                        formData.close_reason === reason
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-transparent border-input hover:bg-accent"
                                    )}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Update Notes</Label>
                        <Textarea name="notes" value={formData.notes || ""} onChange={handleChange} className="h-20" />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Close Trade"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
