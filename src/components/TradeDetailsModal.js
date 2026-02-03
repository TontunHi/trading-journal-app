"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { X, Save, Trash2, Edit2 } from "lucide-react"
import { Button, Input, Label, Textarea } from "@/components/ui/form-elements"
import { cn } from "@/lib/utils"

export function TradeDetailsModal({ trade, isOpen, onClose, onRefresh }) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State for Editing
    const [formData, setFormData] = useState({})

    useEffect(() => {
        if (trade) {
            setFormData({
                entry_price: trade.entry_price || "",
                exit_price: trade.exit_price || "",
                tp: trade.tp || "",
                sl: trade.sl || "",
                lot_size: trade.lot_size || "",
                pnl: trade.pnl || "",
                close_reason: trade.close_reason || "TP",
                notes: trade.notes || "",
                status: trade.status || "OPEN"
            })
            setIsEditing(false) // Reset edit mode on open
        }
    }, [trade, isOpen])

    if (!isOpen || !trade) return null;

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this trade?")) return;
        setLoading(true)
        try {
            await axios.delete(`/api/trades/${trade.id}`);
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Delete failed", error);
            alert("Delete failed");
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.put(`/api/trades/${trade.id}`, formData);

            setIsEditing(false);
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            alert("Update failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {trade.asset}
                                <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-bold border",
                                    trade.type === 'BUY' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                )}>{trade.type}</span>
                            </h2>
                            <span className="text-sm font-mono text-muted-foreground">#{trade.id}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {new Date(trade.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Status Badge */}
                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Result P/L</span>
                            <div className={cn("text-2xl font-bold", parseFloat(formData.pnl) > 0 ? "text-green-500" : parseFloat(formData.pnl) < 0 ? "text-red-500" : "text-foreground")}>
                                {formData.pnl ? `$${formData.pnl}` : "--"}
                            </div>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                            formData.status === 'CLOSED' ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                        )}>
                            {formData.status}
                        </div>
                    </div>

                    {isEditing ? (
                        <form id="edit-trade-form" onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Close Reason</Label>
                                <select name="close_reason" value={formData.close_reason} onChange={handleChange} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="TP">TP</option>
                                    <option value="SL">SL</option>
                                    <option value="BE">BE</option>
                                    <option value="MANUAL">Manual</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Entry Price</Label>
                                <Input name="entry_price" type="number" step="any" value={formData.entry_price} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Exit Price</Label>
                                <Input name="exit_price" type="number" step="any" value={formData.exit_price} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Stop Loss (SL)</Label>
                                <Input name="sl" type="number" step="any" value={formData.sl} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Take Profit (TP)</Label>
                                <Input name="tp" type="number" step="any" value={formData.tp} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Lot Size</Label>
                                <Input name="lot_size" type="number" step="any" value={formData.lot_size} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>P/L ($)</Label>
                                <Input name="pnl" type="number" step="any" value={formData.pnl} onChange={handleChange} />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label>Notes</Label>
                                <Textarea name="notes" value={formData.notes} onChange={handleChange} className="h-24" />
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Entry Price</span>
                                <div className="font-medium">{trade.entry_price}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Exit Price</span>
                                <div className="font-medium">{trade.exit_price || "-"}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Stop Loss</span>
                                <div className="font-medium text-red-500">{trade.sl || "-"}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Take Profit</span>
                                <div className="font-medium text-green-500">{trade.tp || "-"}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Lot Size</span>
                                <div className="font-medium">{trade.lot_size}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Close Reason</span>
                                <div className="font-medium">{trade.close_reason || "-"}</div>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <span className="text-muted-foreground block mb-1">Strategies / Notes</span>
                                <div className="p-3 bg-muted/20 rounded-md text-sm whitespace-pre-wrap">
                                    {trade.notes || "No notes."}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                {isEditing && (
                    <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit" form="edit-trade-form" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
