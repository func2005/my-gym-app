'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full" disabled={pending}>
            {pending ? "登录中..." : "立即登录"}
        </Button>
    )
}

export default function LoginPage() {
    const [state, action, isPending] = useActionState(loginAction, null)

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">GymLite 登录</CardTitle>
                    <CardDescription>
                        请选择您的身份并输入凭证
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">身份类型</Label>
                            <select
                                name="role"
                                id="role"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                defaultValue="member"
                            >
                                <option value="member">会员 (Member)</option>
                                <option value="admin">管理员 (Admin)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="identifier">账号 / 手机号</Label>
                            <Input id="identifier" name="identifier" type="text" placeholder="输入手机号或管理员账号" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">密码</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        {state?.error && (
                            <div className="text-sm font-medium text-red-500">
                                {state.error}
                            </div>
                        )}

                        <div className="pt-2">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                    <p className="text-xs text-slate-500">
                        GymLite Membership System v2.0
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
