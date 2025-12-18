'use client'

import { useState, useActionState } from "react"
import { deleteAdmin } from "@/actions/admin-management"
import { updatePassword } from "@/actions/settings-actions"
import { AdminForm } from "@/components/business/AdminForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// --- Password Form Component ---
function PasswordForm() {
    const [state, action, isPending] = useActionState(updatePassword, null)

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>修改密码</CardTitle>
                <CardDescription>定期修改密码以保护账号安全</CardDescription>
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

                    <Button disabled={isPending}>
                        {isPending ? "提交中..." : "修改密码"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

// --- Main Client Component ---
interface Admin {
    id: number
    name: string
    // phone replaced by name/username concept
}

export function AdminSettingsClient({ admins, currentUserId }: { admins: Admin[], currentUserId: number }) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
    const [activeTab, setActiveTab] = useState<'password' | 'admins'>('password')

    const handleEdit = (admin: Admin) => {
        setEditingAdmin(admin)
        setIsFormOpen(true)
    }

    const handleCreate = () => {
        setEditingAdmin(null)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm("确定要删除该管理员吗？")) {
            await deleteAdmin(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 w-fit">
                <button
                    onClick={() => setActiveTab('password')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'password' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                        }`}
                >
                    修改密码
                </button>
                <button
                    onClick={() => setActiveTab('admins')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'admins' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                        }`}
                >
                    管理员管理
                </button>
            </div>

            {activeTab === 'password' && <PasswordForm />}

            {activeTab === 'admins' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>管理员账户</CardTitle>
                            <CardDescription>管理系统管理员权限</CardDescription>
                        </div>
                        <Button onClick={handleCreate}>+ 添加管理员</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>用户名</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell>{admin.id}</TableCell>
                                        <TableCell className="font-mono">{admin.name}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                className="h-8 px-2 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100"
                                                onClick={() => handleEdit(admin)}
                                            >
                                                编辑
                                            </Button>
                                            {admin.id !== currentUserId && (
                                                <Button
                                                    className="h-8 px-2 bg-red-600 text-white hover:bg-red-700"
                                                    onClick={() => handleDelete(admin.id)}
                                                >
                                                    删除
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <AdminForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                editingAdmin={editingAdmin}
            />
        </div>
    )
}
