'use server'

import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export type CheckInResult = {
    success: boolean
    message: string
    member?: {
        name: string
        daysRemaining: number
        status: string
        avatar: string | null
    }
}

export async function performCheckIn(prevState: any, formData: FormData): Promise<CheckInResult> {
    const session = await verifySession()
    if (session?.role !== 'admin') {
        return { success: false, message: "无权操作" }
    }

    const phone = formData.get("phone") as string
    if (!phone) {
        return { success: false, message: "请输入手机号" }
    }

    try {
        // 1. Find Member
        const member = await db.member.findUnique({
            where: { phone }
        })

        if (!member) {
            return { success: false, message: "未找到该手机号的会员" }
        }

        // 2. Check Status & Expiry
        if (member.status === 'BANNED') {
            return {
                success: false,
                message: "该会员已被封禁，拒绝入场",
                member: {
                    name: member.name,
                    daysRemaining: 0,
                    status: member.status,
                    avatar: member.avatar
                }
            }
        }

        const now = new Date()
        const expiryDate = new Date(member.expiryDate)
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysRemaining < 0) {
            return {
                success: false,
                message: `会员已过期 ${Math.abs(daysRemaining)} 天，拒绝入场`,
                member: {
                    name: member.name,
                    daysRemaining,
                    status: 'EXPIRED',
                    avatar: member.avatar
                }
            }
        }

        // 3. Record Check-in (Always record, even if repeated)
        await db.checkIn.create({
            data: {
                memberId: member.id,
                checkTime: now
            }
        })

        revalidatePath("/admin/dashboard") // Update stats
        revalidatePath("/admin/checkin") // Update recent list if we show it

        return {
            success: true,
            message: "签到成功！",
            member: {
                name: member.name,
                daysRemaining,
                status: member.status,
                avatar: member.avatar
            }
        }

    } catch (error) {
        console.error("Check-in error:", error)
        return { success: false, message: "系统错误" }
    }
}

export async function getTodayCheckIns() {
    const session = await verifySession()
    if (session?.role !== 'admin') return []

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Get check-ins from today start
    const checkIns = await db.checkIn.findMany({
        where: {
            checkTime: {
                gte: todayStart
            }
        },
        orderBy: { checkTime: 'desc' },
        include: {
            member: {
                select: { name: true, expiryDate: true }
            }
        }
    })

    // Map to simple structure with remaining days
    return checkIns.map(c => {
        const now = new Date()
        const expiry = new Date(c.member.expiryDate)
        const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return {
            id: c.id,
            memberName: c.member.name,
            checkTime: c.checkTime,
            daysRemaining
        }
    })
}
