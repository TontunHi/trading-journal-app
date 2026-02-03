"use client"

import { format } from "date-fns"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { cn } from "@/lib/utils"

export function OrdersTable({ trades, onEdit }) {
    if (!trades || trades.length === 0) {
        return <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-border border-dashed">No recent orders found.</div>
    }

    return (
        <div className="rounded-md border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">Date</th>
                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Pair</th>
                            <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Lot</th>
                            <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">P/L</th>
                            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade) => {
                            const isWin = (trade.pnl || 0) > 0;
                            const isProfit = trade.pnl !== null && trade.status === 'CLOSED';

                            return (
                                <tr
                                    key={trade.id}
                                    className="border-b border-border transition-colors hover:bg-muted/50 cursor-pointer"
                                    onClick={() => onEdit(trade)} // Clicking row opens edit (View Details in new Modal)
                                >
                                    <td className="p-4 align-middle font-mono text-xs text-muted-foreground">
                                        {format(new Date(trade.createdAt), 'yyyy-MM-dd HH:mm')}
                                    </td>
                                    <td className="p-4 align-middle font-bold">
                                        {trade.asset} <span className="text-[10px] text-muted-foreground ml-1">{trade.timeframe}</span>
                                    </td>
                                    <td className="p-4 align-middle text-center">
                                        <span className={cn(
                                            "inline-flex items-center justify-center rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase",
                                            trade.type === 'BUY' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                        )}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right font-mono">
                                        {trade.lot_size.toFixed(2)}
                                    </td>
                                    <td className="p-4 align-middle text-center">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm border",
                                            trade.status === 'OPEN'
                                                ? "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400"
                                                : "bg-muted text-muted-foreground border-border"
                                        )}>
                                            <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", trade.status === 'OPEN' ? "bg-blue-500" : "bg-gray-400 hidden")} />
                                            {trade.status}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "p-4 align-middle text-right font-bold tabular-nums",
                                        isProfit
                                            ? (isWin ? "text-green-600" : "text-red-500")
                                            : "text-muted-foreground"
                                    )}>
                                        {trade.status === 'CLOSED' ? (trade.pnl > 0 ? `+$${trade.pnl}` : `$${trade.pnl}`) : '--'}
                                    </td>
                                    <td className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onEdit(trade)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background/50 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
