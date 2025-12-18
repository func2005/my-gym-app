'use client'

import { useActionState } from "react"
import { updatePassword, updateProfile } from "@/actions/settings-actions"
import { logoutAction } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db" // Note: This file is 'use client', cannot import db directly. Need to fetch data in server component wrapper if we want initial data.
// Wait, 'use client' cannot import db. We need to pass initial data via props. 
// Refactoring to have a Server Component wrapper.

// Let's create the client components first.

function ProfileForm({ initialData }: { initialData: { name: string, avatar: string | null } }) {
    const [state, action, isPending] = useActionState(updateProfile, null)

    return (
        <Card>
            <CardHeader>
                <CardTitle>个人资料</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">姓名</Label>
                        <Input id="name" name="name" defaultValue={initialData.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="avatar">头像 URL</Label>
                        <Input id="avatar" name="avatar" defaultValue={initialData.avatar || ""} placeholder="https://..." />
                    </div>

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
                    {state?.success && <p className="text-green-600 text-sm">✅ {state.message}</p>}

                    <Button disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {isPending ? "保存中..." : "保存资料"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

function PasswordForm() {
    const [state, action, isPending] = useActionState(updatePassword, null)

    return (
        <Card>
            <CardHeader>
                <CardTitle>修改密码</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="oldPassword">当前密码</Label>
                        <Input id="oldPassword" name="oldPassword" type="password" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">新密码</Label>
                        <Input id="newPassword" name="newPassword" type="password" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">确认新密码</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" required />
                    </div>

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
                    {state?.success && <p className="text-green-600 text-sm">✅ {state.message}</p>}

                    <Button disabled={isPending} className="w-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-100">
                        {isPending ? "提交中..." : "修改密码"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export { ProfileForm, PasswordForm }
