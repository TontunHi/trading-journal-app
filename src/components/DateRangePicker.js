"use client"

import { useState } from 'react'
import { format, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const presets = [
    { label: 'Week', value: 'week', getRange: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
    { label: 'Month', value: 'month', getRange: () => ({ start: subMonths(new Date(), 1), end: new Date() }) },
    { label: 'Year', value: 'year', getRange: () => ({ start: subYears(new Date(), 1), end: new Date() }) },
    { label: 'Custom', value: 'custom', getRange: null }
]

export function DateRangePicker({ value, onChange, onRangeChange }) {
    const [showCustom, setShowCustom] = useState(false)
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')
    
    const handlePresetClick = (preset) => {
        if (preset.value === 'custom') {
            setShowCustom(!showCustom)
            onChange(preset.value)
        } else {
            setShowCustom(false)
            onChange(preset.value)
            if (onRangeChange && preset.getRange) {
                const range = preset.getRange()
                onRangeChange(range)
            }
        }
    }

    const handleCustomApply = () => {
        if (customStart && customEnd && onRangeChange) {
            onRangeChange({
                start: new Date(customStart),
                end: new Date(customEnd)
            })
        }
    }

    return (
        <div className="relative">
            <div className="flex bg-muted p-1 rounded-lg">
                {presets.map(preset => (
                    <button
                        key={preset.value}
                        onClick={() => handlePresetClick(preset)}
                        className={cn(
                            "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                            value === preset.value 
                                ? 'bg-background shadow-sm text-primary' 
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {preset.label}
                        {preset.value === 'custom' && <ChevronDown className={cn("h-3 w-3 transition-transform", showCustom && "rotate-180")} />}
                    </button>
                ))}
            </div>

            {/* Custom Date Picker Dropdown */}
            {showCustom && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg shadow-xl p-4 min-w-[280px] animate-in fade-in zoom-in-95">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            Custom Date Range
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Start Date</label>
                                <input 
                                    type="date" 
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="w-full h-9 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">End Date</label>
                                <input 
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="w-full h-9 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleCustomApply}
                            disabled={!customStart || !customEnd}
                            className="w-full h-8 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
