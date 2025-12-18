'use client'

import { useActionState, useState } from "react"
import { addWorkout } from "@/actions/workout-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Map types to display names and emojis
const TYPE_MAP: Record<string, string> = {
    'STRENGTH': '🏋️‍♀️ 力量训练 (Strength)',
    'CARDIO': '🏃 有氧运动 (Cardio)',
    'HIIT': '🔥 HIIT',
    'YOGA': '🧘 瑜伽 (Yoga)',
    'OTHER': '🤸 其他 (Other)'
}

export function WorkoutForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [state, action, isPending] = useActionState(addWorkout, null)

    const handleSubmit = async (formData: FormData) => {
        // We use a wrapper to handle closing the dialog on success if needed
        // But useActionState handles the execute.
        // We can't await `action` directly like a promise here easily with useActionState in this pattern 
        // without wrapping key logic.
        // For simplicity, we just rely on state changes or just let user close it.
        // Actually, let's just use the form action directly.
    }

    // Naive close on success check
    if (state?.success && open) {
        // Ideally we'd reset state but verify execution flow
        // For MVP, just show success message
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>记录一次训练</DialogTitle>
                    <DialogDescription>今天练了什么？</DialogDescription>
                </DialogHeader>

                {state?.success ? (
                    <div className="py-8 text-center space-y-4">
                        <div className="text-4xl">🎉</div>
                        <div className="text-green-600 font-bold">{state.message}</div>
                        <Button onClick={() => onOpenChange(false)} className="w-full">太棒了</Button>
                    </div>
                ) : (
                    <form action={action} className="space-y-4">
                        <div className="space-y-2">
                            <Label>运动类型</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(TYPE_MAP).map(([value, label]) => (
                                    <label key={value} className="flex items-center space-x-2 border p-3 rounded cursor-pointer hover:bg-slate-50 [:has(input:checked)_&]:border-indigo-500 [:has(input:checked)_&]:bg-indigo-50">
                                        <input type="radio" name="type" value={value} className="accent-indigo-600" required />
                                        <span className="text-sm">{label.split(' ')[0]} {label.split(' ')[1]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">时长 (分钟)</Label>
                            <Input id="duration" name="duration" type="number" defaultValue="60" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">备注 (可选)</Label>
                            <Input id="notes" name="notes" placeholder="例如：深蹲 100kg PR！" />
                        </div>

                        {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

                        <DialogFooter>
                            <Button disabled={isPending} className="w-full">
                                {isPending ? "保存中..." : "打卡"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

export function WorkoutList({ workouts }: { workouts: any[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">训练日志</h1>
                <Button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    + 记一次
                </Button>
            </div>

            <div className="grid gap-4">
                {workouts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <div className="text-4xl mb-2">💪</div>
                        <p>还没有训练记录，开始你的第一次打卡吧！</p>
                    </div>
                ) : (
                    workouts.map((log) => (
                        <Card key={log.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                                        {TYPE_MAP[log.title]?.split(' ')[0] || '🏃'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">
                                            {TYPE_MAP[log.title]?.split(' ').slice(1).join(' ') || log.title}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {new Date(log.date).toLocaleString()} · {log.duration} 分钟
                                        </p>
                                    </div>
                                </div>
                                {log.notes && (
                                    <div className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded max-w-[150px] truncate">
                                        {log.notes}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <WorkoutForm open={isFormOpen} onOpenChange={setIsFormOpen} />
        </div>
    )
}
