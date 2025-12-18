'use server'

import { db } from "@/lib/db"
import { createSession, deleteSession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function loginAction(prevState: any, formData: FormData) {
    const identifier = formData.get("identifier") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as "member" | "admin"

    if (!identifier || !password || !role) {
        return { error: "请填写所有必填项", success: false }
    }

    try {
        if (role === "admin") {
            const admin = await db.admin.findUnique({ where: { username: identifier } })
            if (!admin) {
                return { error: "管理员账号不存在", success: false }
            }

            const isValid = await bcrypt.compare(password, admin.password)
            if (!isValid) {
                return { error: "密码错误", success: false }
            }

            await createSession(admin.id, "admin", admin.username)
            redirect("/admin/dashboard")
        } else {
            const member = await db.member.findUnique({ where: { phone: identifier } })
            if (!member) {
                return { error: "会员手机号不存在", success: false }
            }

            const isValid = await bcrypt.compare(password, member.password)
            if (!isValid) {
                return { error: "密码错误", success: false }
            }

            if (member.status === "BANNED") {
                return { error: "账号已被封禁，请联系管理员", success: false }
            }

            await createSession(member.id, "member", member.phone)
            redirect("/member/dashboard")
        }
    } catch (error) {
        if ((error as any).message === "NEXT_REDIRECT") {
            throw error
        }
        console.error("Login Error:", error)
        return { error: "服务器内部错误", success: false }
    }
}

export async function logoutAction() {
    await deleteSession()
    redirect("/login")
}
