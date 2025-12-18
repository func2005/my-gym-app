'use server'

import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// 获取所有管理员
export async function getAdmins() {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权访问", admins: [] }

    try {
        const admins = await db.admin.findMany({
            select: { id: true, username: true, role: true, createdAt: true }
        })

        // Map to interface. We rely on username as the identifier.
        // UI expects { id, name, phone }, we will map username to name AND phone for compatibility or adjust UI.
        // Let's adjust UI to expect 'username' later, but for now map it.
        const formattedAdmins = admins.map(a => ({
            id: a.id,
            name: a.username, // Display username as name
            phone: a.username // Display username as phone (login id)
        }))
        return { success: true, admins: formattedAdmins }
    } catch (error) {
        console.error("Fetch admins error:", error)
        return { error: "获取失败", admins: [] }
    }
}

// 添加或编辑管理员
export async function upsertAdmin(prevState: any, formData: FormData) {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权操作" }

    const id = formData.get("id") ? parseInt(formData.get("id") as string) : null
    // const name = formData.get("name") as string // Removed
    const username = formData.get("username") as string // Use pure username
    const password = formData.get("password") as string

    if (!username) return { error: "用户名必填" }

    // Validate username: only English letters
    const usernameRegex = /^[a-zA-Z]+$/
    if (!usernameRegex.test(username)) {
        return { error: "用户名仅允许使用英文字母 (A-Z, a-z)" }
    }

    try {
        // Create
        if (!id) {
            if (!password) return { error: "新建账号必须设置密码" }

            // Check existence
            const existing = await db.admin.findUnique({ where: { username } })
            if (existing) return { error: "该用户名已被使用" }

            const hashedPassword = await bcrypt.hash(password, 10)
            await db.admin.create({
                data: {
                    username,
                    password: hashedPassword,
                    role: 'STAFF' // Default role
                }
            })
            revalidatePath("/admin/settings")
            return { success: true, message: "管理员创建成功" }
        }
        // Update
        else {
            const dataToUpdate: any = { username }
            // Only update password if provided
            if (password && password.trim() !== "") {
                dataToUpdate.password = await bcrypt.hash(password, 10)
            }

            // Check uniqueness if username changed
            const current = await db.admin.findUnique({ where: { id } })
            if (current?.username !== username) {
                const existing = await db.admin.findUnique({ where: { username } })
                if (existing) return { error: "该用户名已被使用" }
            }

            await db.admin.update({
                where: { id },
                data: dataToUpdate
            })
            revalidatePath("/admin/settings")
            return { success: true, message: "管理员更新成功" }
        }

    } catch (error) {
        console.error("Upsert admin error:", error)
        return { error: "操作失败" }
    }
}

// 删除管理员 (物理删除)
export async function deleteAdmin(id: number) {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权操作" }

    // Check if user is deleting self
    // session.userId is number (from session.ts definition)
    if (session.userId === id) return { error: "不能删除自己" }

    try {
        await db.admin.delete({
            where: { id }
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        return { error: "删除失败" }
    }
}
