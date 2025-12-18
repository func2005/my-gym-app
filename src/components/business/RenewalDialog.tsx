'use client'

import { useState } from "react"
import { renewMembership } from "@/actions/admin-ops"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface RenewalDialogProps {
    member: { id: number, name: string } | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function RenewalDialog({ member, open, onOpenChange, onSuccess }: RenewalDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleRenew = async (plan: 'MONTH' | 'SEASON' | 'YEAR') => {
        if (!member) return
        if (!confirm(`确定为 ${member.name} 办理 ${getPlanName(plan)} 续费吗？`)) return

        setLoading(true)
        try {
            const result = await renewMembership(member.id, plan)
            if (result.success) {
                alert(result.message)
                onOpenChange(false)
                if (onSuccess) onSuccess()
            } else {
                alert(result.error || "续费失败")
            }
        } catch (e) {
            alert("操作异常")
        } finally {
            setLoading(false)
        }
    }

    const getPlanName = (p: string) => {
        if (p === 'MONTH') return '月卡'
        if (p === 'SEASON') return '季卡'
        if (p === 'YEAR') return '年卡'
        return ''
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>会员续费 - {member?.name}</DialogTitle>
                    <DialogDescription>
                        请选择续费套餐，续费后有效期将自动顺延。
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Button
                        disabled={loading}
                        onClick={() => handleRenew('MONTH')}
                        className="h-auto py-4 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200"
                    >
                        <span className="text-lg font-bold">月卡 (30天)</span>
                        <span className="text-sm opacity-80">¥300</span>
                    </Button>

                    <Button
                        disabled={loading}
                        onClick={() => handleRenew('SEASON')}
                        className="h-auto py-4 flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-900 border border-green-200"
                    >
                        <span className="text-lg font-bold">季卡 (90天)</span>
                        <span className="text-sm opacity-80">¥900 (优惠 ¥0)</span>
                    </Button>

                    <Button
                        disabled={loading}
                        onClick={() => handleRenew('YEAR')}
                        className="h-auto py-4 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200"
                    >
                        <span className="text-lg font-bold">年卡 (365天)</span>
                        <span className="text-sm opacity-80">¥2000 (超值优惠!)</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
