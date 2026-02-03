"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        const isProfit = data.cumulative >= 0
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Daily:</span>
                        <span className={`text-sm font-bold ${data.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {data.pnl >= 0 ? '+' : ''}{data.pnl?.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Cumulative:</span>
                        <span className={`text-sm font-bold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                            {data.cumulative >= 0 ? '+' : ''}{data.cumulative?.toFixed(2)}
                        </span>
                    </div>
                    {data.trades && (
                        <div className="text-xs text-muted-foreground">
                            {data.trades} trade{data.trades > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>
        )
    }
    return null
}

export function PerformanceChart({ data, isLoading, period }) {
    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No trades in this period</p>
                    <p className="text-xs">Complete some trades to see your performance</p>
                </div>
            </div>
        )
    }

    const lastValue = data[data.length - 1]?.cumulative || 0
    const isPositive = lastValue >= 0
    const gradientId = isPositive ? 'profitGradient' : 'lossGradient'

    // Use explicit colors that work in dark mode
    const axisColor = 'rgba(148, 163, 184, 0.8)' // slate-400 with opacity
    const gridColor = 'rgba(148, 163, 184, 0.15)'

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgb(239, 68, 68)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="rgb(239, 68, 68)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={gridColor}
                        vertical={false}
                    />
                    <XAxis 
                        dataKey="date" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
                        }}
                    />
                    <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        tickFormatter={(value) => `$${value}`}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine 
                        y={0} 
                        stroke={axisColor}
                        strokeDasharray="3 3"
                        opacity={0.5}
                    />
                    <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke={isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{ 
                            r: 5, 
                            fill: isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
                            stroke: 'white',
                            strokeWidth: 2
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
