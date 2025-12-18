'use server'

import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await verifySession()
    if (!session || session.role !== 'member') return { error: "无权操作" }

    const name = formData.get("name") as string
    const avatar = formData.get("avatar") as string

    if (!name) return { error: "姓名不能为空" }

    try {
        await db.member.update({
            where: { id: session.userId },
            data: { name, avatar }
        })
        revalidatePath("/member")
        return { success: true, message: "个人资料已更新" }
    } catch (error) {
        console.error("Update profile error:", error)
        return { error: "更新失败" }
    }
}

export async function updatePassword(prevState: any, formData: FormData) {
    const session = await verifySession()
    if (!session) return { error: "无权操作" }

    const oldPassword = formData.get("oldPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!oldPassword || !newPassword || !confirmPassword) {
        return { error: "请填写所有密码字段" }
    }

    if (newPassword !== confirmPassword) {
        return { error: "两次输入的新密码不一致" }
    }

    if (newPassword.length < 6) {
        return { error: "新密码至少需要6位" }
    }

    try {
        // 1. Fetch user to get current password hash
        let user: any
        if (session.role === 'admin') {
            user = await db.admin.findUnique({ where: { id: session.userId } })
        } else {
            user = await db.member.findUnique({ where: { id: session.userId } })
        }

        if (!user) return { error: "用户不存在" }

        // 2. Verify old password
        const isValid = await bcrypt.compare(oldPassword, user.password)
        if (!isValid) {
            return { error: "旧密码错误" }
        }

        // 3. Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        if (session.role === 'admin') {
            await db.admin.update({
                where: { id: session.userId },
                data: { password: hashedPassword }
            })
        } else {
            await db.member.update({
                where: { id: session.userId },
                data: { password: hashedPassword }
            })
        }

        return { success: true, message: "密码已修改" }
    } catch (error) {
        console.error("Update password error:", error)
        return { error: "修改失败，请稍后重试" }
    }
}
