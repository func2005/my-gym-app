'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Metric {
    recordDate: Date | string
    weight: number | null
    bodyFat: number | null
}

export function WeightChart({ data }: { data: Metric[] }) {
    // 1. Group by date and keep the latest record for each day
    // We Map recordDate to locale date string.
    // 'data' is already sorted by date asc (from server), so the valid one is the last one in the list for that date.

    const uniqueMap = new Map<string, Metric>();

    data.forEach(item => {
        const dateStr = new Date(item.recordDate).toLocaleDateString('zh-CN');
        // Because data is sorted ASC, this will overwrite earlier records of the same day
        // effectively keeping the latest one.
        uniqueMap.set(dateStr, item);
    });

    const uniqueData = Array.from(uniqueMap.values());

    const chartData = uniqueData.map(item => ({
        ...item,
        date: new Date(item.recordDate).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        weight: item.weight || 0
    }))

    if (data.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>体重趋势</CardTitle>
                    <CardDescription>暂无数据</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-slate-400">
                    请先录入您的第一次数据
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>体重趋势</CardTitle>
                <CardDescription>最近 {data.length} 次记录</CardDescription>
            </CardHeader>
            <CardContent>
                {/* 
                   Use a fixed-size container approach for stability.
                   Recharts ResponsiveContainer sometimes fails in specific layouts with "width(-1)".
                   Given this is a mobile-first app, we can use 100% width of the parent card content.
                */}
                <div style={{ width: '100%', height: 300, minWidth: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={['dataMin - 1', 'dataMax + 1']}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-white p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-slate-500">
                                                            体重
                                                        </span>
                                                        <span className="font-bold text-slate-700">
                                                            {payload[0].value} kg
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#6366f1" // Indigo-500
                                strokeWidth={2}
                                activeDot={{ r: 6, fill: "#6366f1" }}
                                dot={{ fill: "#6366f1", r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
