'use client'

import { useActionState, useEffect, useRef, useState } from "react"
import { performCheckIn, CheckInResult, getTodayCheckIns } from "@/actions/check-in-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const initialState: CheckInResult = {
    success: false,
    message: ""
}

export default function CheckInPage() {
    const [state, action, isPending] = useActionState(performCheckIn, initialState)
    const [todayList, setTodayList] = useState<any[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const fetchList = async () => {
        const list = await getTodayCheckIns()
        setTodayList(list)
    }

    // Initial fetch
    useEffect(() => {
        fetchList()
    }, [])

    // Focus input and refresh list after submission
    useEffect(() => {
        if (!isPending) {
            inputRef.current?.focus()
            if (state.success) {
                if (inputRef.current) inputRef.current.value = ""
                fetchList() // Refresh list on success
            }
        }
    }, [isPending, state])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-900">入场登记</h1>

                <Card className="border-2 border-slate-200">
                    <CardHeader>
                        <CardTitle>快速打卡</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={action} className="space-y-4">
                            <div className="flex gap-4">
                                <Input
                                    ref={inputRef}
                                    name="phone"
                                    placeholder="输入手机号 (回车提交)"
                                    className="text-lg h-14"
                                    autoFocus
                                    autoComplete="off"
                                />
                                <Button className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700" disabled={isPending}>
                                    {isPending ? "..." : "打卡"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">今日入场列表</h2>
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>用户名</TableHead>
                                    <TableHead>入场时间</TableHead>
                                    <TableHead className="text-right">剩余有效期</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {todayList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-slate-500">
                                            暂无入场记录
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    todayList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.memberName}</TableCell>
                                            <TableCell>
                                                {new Date(item.checkTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${item.daysRemaining < 30 ? 'text-red-500' : 'text-slate-600'
                                                }`}>
                                                {item.daysRemaining} 天
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Status Display Area */}
            <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200 min-h-[400px]">
                {!state.message ? (
                    <div className="text-center text-slate-400">
                        <div className="text-6xl mb-4">👋</div>
                        <p className="text-xl">等待打卡...</p>
                    </div>
                ) : (
                    <div className={`text-center space-y-6 animate-in zoom-in-95 duration-300`}>
                        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${state.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {state.success ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>

                        <div>
                            <h2 className={`text-3xl font-bold ${state.success ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {state.message}
                            </h2>
                            {state.member && (
                                <div className="mt-6 p-6 bg-white rounded-lg shadow-sm border border-slate-100 inline-block min-w-[300px]">
                                    <h3 className="text-2xl font-bold text-slate-900">{state.member.name}</h3>
                                    <div className="mt-4 flex justify-center gap-8 text-center">
                                        <div>
                                            <p className="text-sm text-slate-500">剩余天数</p>
                                            <p className={`text-2xl font-bold ${state.member.daysRemaining < 30 ? 'text-orange-500' : 'text-slate-900'
                                                }`}>
                                                {state.member.daysRemaining} 天
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">状态</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {state.member.status === 'ACTIVE' ? '正常' : '异常'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
