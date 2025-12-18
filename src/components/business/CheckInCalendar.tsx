'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface CheckInCalendarProps {
    dates: number[]
    stats?: {
        total: number
        thisWeek: number
        weeklyAvg: string
    }
    referenceDate?: Date
}

export function CheckInCalendar({ dates, stats, referenceDate }: CheckInCalendarProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Use passed date (Server Time) or fallback to new Date() (Client Time) to ensure consistency during hydration
    const today = referenceDate || new Date()

    // Prevent hydration mismatch by defining initial render content or waiting for mount
    // For a calendar dependent on "Today", waiting for mount ensures the client timezone is used consistently without mismatch error.
    if (!mounted) {
        return <div className="h-64 bg-white/50 animate-pulse rounded-xl"></div>
    }
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Get number of days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Get starting day of the week (0 = Sunday, 1 = Monday, ...)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    // Create array for grid
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // Create empties for first row
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月",
        "7月", "8月", "9月", "10月", "11月", "12月"]

    return (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <span>📅 打卡日历</span>
                    <span className="text-sm font-normal text-slate-500">
                        {currentYear} 年 {monthNames[currentMonth]}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400">
                    <div>日</div>
                    <div>一</div>
                    <div>二</div>
                    <div>三</div>
                    <div>四</div>
                    <div>五</div>
                    <div>六</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-sm">
                    {emptyDays.map(i => <div key={`empty-${i}`} />)}

                    {daysArray.map(day => {
                        const isChecked = dates.includes(day)
                        const isToday = day === today.getDate()

                        return (
                            <div
                                key={day}
                                className={`
                                    aspect-square flex items-center justify-center rounded-md transition-all
                                    ${isChecked
                                        ? 'bg-green-500/50 text-green-900 font-bold backdrop-blur-[2px]'
                                        : isToday
                                            ? 'bg-indigo-100/80 text-indigo-700 font-bold border border-indigo-200'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {day}
                            </div>
                        )
                    })}
                </div>

                {stats && (
                    <div className="mt-6 grid grid-cols-3 gap-2 text-center border-t pt-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">本周</p>
                            <p className="text-lg font-bold text-slate-800">{stats.thisWeek}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">累计</p>
                            <p className="text-lg font-bold text-indigo-600">{stats.total}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">周平均</p>
                            <p className="text-lg font-bold text-slate-800">{stats.weeklyAvg}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
