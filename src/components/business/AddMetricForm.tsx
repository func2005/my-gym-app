'use client'

import { useActionState, useEffect, useState } from "react"
import { addBodyMetric } from "@/actions/member-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AddMetricForm() {
    const [state, action, isPending] = useActionState(addBodyMetric, null)

    // Clear form on success (optional, naive implementation)
    // Real-world would use a ref to clear or more complex form handling
    const [weight, setWeight] = useState("")

    useEffect(() => {
        if (state?.success) {
            setWeight("")
        }
    }, [state])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">记一笔</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">体重 (kg)</Label>
                            <Input
                                id="weight"
                                name="weight"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                required
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">身高 (cm)</Label>
                            <Input id="height" name="height" type="number" step="1" placeholder="选填" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="waist">腰围 (cm)</Label>
                            <Input id="waist" name="waist" type="number" step="0.1" placeholder="选填" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bodyFat">体脂率 (%)</Label>
                            <Input id="bodyFat" name="bodyFat" type="number" step="0.1" placeholder="选填" />
                        </div>
                    </div>

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
                    {state?.success && <p className="text-green-600 text-sm">✅ {state.message}</p>}

                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
                        {isPending ? "保存中..." : "记录今天的数据"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
