"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Upload, X, Save, Trash2, Edit2, ExternalLink } from "lucide-react"
import { Button, Input, Label, Textarea } from "@/components/ui/form-elements"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace('/api', '');

export function TradeDetailsModal({ trade, isOpen, onClose, onRefresh }) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState(null) // For after image mainly

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

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0])
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this trade?")) return;
        setLoading(true)
        try {
            await axios.delete(`${API_Base}/api/trades/${trade.id}`);
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
            let new_images_json = null;

            // Handle Image upload if any (Usually for adding 'After' result)
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append("image", imageFile);
                const uploadRes = await axios.post(`${API_Base}/api/upload`, uploadData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                let currentImages = trade.images_path ? (typeof trade.images_path === 'string' ? JSON.parse(trade.images_path) : trade.images_path) : {};
                // If closing (status becomes closed), implies adding 'after'
                // Or if just editing, maybe we want to be more specific.
                // For simplicity: If it's closed/closing, we save as 'after'.
                currentImages.after = uploadRes.data.filePath;
                new_images_json = currentImages; // Send OBJECT, not string. Prisma Client handles object for Json field.
            }

            const payload = {
                ...formData,
                images_path: new_images_json !== null ? new_images_json : (typeof trade.images_path === 'string' ? JSON.parse(trade.images_path) : trade.images_path)
            };

            await axios.put(`${API_Base}/api/trades/${trade.id}`, payload);

            setIsEditing(false);
            onRefresh();
            // Don't close immediately, let user see updated state? Or close?
            // User might want to verify.
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            alert("Update failed");
        } finally {
            setLoading(false);
        }
    }

    // Prepare Images
    const images = trade.images_path ? (typeof trade.images_path === 'string' ? JSON.parse(trade.images_path) : trade.images_path) : {};

    const handleDirectUpload = async (type, file) => {
        if (!file) return;
        setLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append("image", file);
            const uploadRes = await axios.post(`${API_Base}/api/upload`, uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const currentImages = trade.images_path ? (typeof trade.images_path === 'string' ? JSON.parse(trade.images_path) : trade.images_path) : {};
            currentImages[type] = uploadRes.data.filePath;

            const payload = {
                images_path: currentImages
            };

            await axios.put(`${API_Base}/api/trades/${trade.id}`, payload);
            onRefresh();
        } catch (error) {
            console.error("Direct upload failed", error);
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    }

    const deleteImage = async (type) => {
        if (!confirm(`Delete ${type} image?`)) return;
        setLoading(true);
        try {
            const currentImages = trade.images_path ? (typeof trade.images_path === 'string' ? JSON.parse(trade.images_path) : trade.images_path) : {};
            currentImages[type] = null; // Removing image

            const payload = {
                images_path: currentImages
            };

            await axios.put(`${API_Base}/api/trades/${trade.id}`, payload);
            onRefresh();
        } catch (error) {
            console.error("Delete image failed", error);
            alert("Failed to delete image");
        } finally {
            setLoading(false);
        }
    }

    // Image Helper Component
    const ImageSlot = ({ type, src, label }) => (
        <div className="space-y-2">
            <span className="text-xs text-muted-foreground uppercase flex justify-between items-center">
                {label}
                {src && (
                    <button onClick={() => deleteImage(type)} className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors" title="Delete Image">
                        <Trash2 className="h-3 w-3" />
                    </button>
                )}
            </span>
            {src ? (
                <a href={`${API_Base}${src}`} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-lg border border-border">
                    <img src={`${API_Base}${src}`} alt={label} className="w-full h-auto object-cover hover:scale-105 transition-transform" />
                </a>
            ) : (
                <div className="h-32 bg-muted/20 rounded-lg flex flex-col items-center justify-center text-xs text-muted-foreground border border-dashed border-border text-center p-4 relative hover:bg-muted/40 transition-colors cursor-pointer">
                    <Upload className="h-6 w-6 mb-2 opacity-50" />
                    <span>Upload {label}</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                            if (e.target.files?.[0]) handleDirectUpload(type, e.target.files[0]);
                        }}
                    />
                </div>
            )}
        </div>
    );

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

                    {/* Images Section */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <Label>Screenshots</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <ImageSlot type="before" src={images.before} label="Before" />
                            <ImageSlot type="after" src={images.after} label="After" />
                        </div>
                    </div>
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
