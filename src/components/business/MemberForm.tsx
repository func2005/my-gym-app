'use client'

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { registerMember } from "@/actions/admin-ops"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full" disabled={pending}>
            {pending ? "处理中..." : "确认开卡"}
        </Button>
    )
}

interface MemberFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function MemberForm({ open, onOpenChange }: MemberFormProps) {
    const [result, setResult] = useState<any>(null)

    async function clientAction(formData: FormData) {
        const res = await registerMember(null, formData)
        if (res.error) {
            setResult({ error: res.error })
        } else {
            setResult({ success: res.message })
            // Don't close immediately so user can see password
        }
    }

    const close = () => {
        setResult(null)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>新会员开卡</DialogTitle>
                    <DialogDescription>
                        输入会员基本信息。初始密码将自动生成。
                    </DialogDescription>
                </DialogHeader>

                {result?.success ? (
                    <div className="py-6 text-center space-y-4">
                        <div className="text-green-600 font-bold text-lg">
                            ✅ {result.success}
                        </div>
                        <Button onClick={close} className="w-full">
                            完成
                        </Button>
                    </div>
                ) : (
                    <form action={clientAction} className="space-y-4">
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    姓名
                                </Label>
                                <Input id="name" name="name" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">
                                    手机号
                                </Label>
                                <Input id="phone" name="phone" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="days" className="text-right">
                                    天数
                                </Label>
                                <Input id="days" name="days" type="number" defaultValue="365" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    金额
                                </Label>
                                <Input id="amount" name="amount" type="number" defaultValue="0" className="col-span-3" />
                            </div>
                        </div>

                        {result?.error && (
                            <div className="text-red-500 text-sm text-center">
                                {result.error}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" onClick={close} className="mr-2 bg-transparent text-slate-900 hover:bg-slate-100">取消</Button>
                            <SubmitButton />
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
