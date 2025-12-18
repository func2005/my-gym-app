'use client'

import { useState, useActionState, useEffect } from "react"
import { upsertAdmin } from "@/actions/admin-management"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AdminFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingAdmin?: { id: number, name: string } | null // name now holds username
}

export function AdminForm({ open, onOpenChange, editingAdmin }: AdminFormProps) {
    const [state, action, isPending] = useActionState(upsertAdmin, null)

    useEffect(() => {
        if (state?.success) {
            onOpenChange(false)
        }
    }, [state, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>{editingAdmin ? "编辑管理员" : "添加管理员"}</DialogTitle>
                </DialogHeader>
                <form action={action} className="space-y-4 py-4">
                    {editingAdmin && <input type="hidden" name="id" value={editingAdmin.id} />}

                    <div className="space-y-2">
                        <Label htmlFor="username">用户名</Label>
                        <Input
                            id="username"
                            name="username"
                            required
                            defaultValue={editingAdmin?.name} // We mapped username to 'name' in actions for compatibility, need to fix interface
                            placeholder="仅允许英文字母 (不含空格符号)"
                            pattern="[a-zA-Z]+"
                        />
                        <p className="text-xs text-slate-500">仅支持英文字母作为登录账号</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">密码</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            // If editing, password is optional (keep old one)
                            required={!editingAdmin}
                            placeholder={editingAdmin ? "留空则保持原密码" : "设置登录密码"}
                        />
                    </div>

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-100" onClick={() => onOpenChange(false)}>
                            取消
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "保存中..." : "保存"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
