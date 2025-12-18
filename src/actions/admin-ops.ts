'use server'

import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// 获取会员列表
export async function getMembers(query: string = "") {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权访问", members: [] }

    try {
        const members = await db.member.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { phone: { contains: query } }
                ],
                deleted: false,
            },
            orderBy: { createdAt: 'desc' },
        })
        return { success: true, members }
    } catch (error) {
        console.error("Fetch members error:", error)
        return { error: "获取失败", members: [] }
    }
}

// 注册新会员
export async function registerMember(prevState: any, formData: FormData) {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权操作" }

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const days = parseInt(formData.get("days") as string) || 365
    const amount = parseFloat(formData.get("amount") as string) || 0

    if (!name || !phone) return { error: "姓名和手机号必填" }

    try {
        // 1. 检查是否存在
        const existing = await db.member.findUnique({ where: { phone } })
        if (existing) return { error: "该手机号已注册" }

        // 2. 生成默认密码 (注册日期 YYYYMMDD)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '') // e.g., "20231218"
        const rawPassword = dateStr
        const hashedPassword = await bcrypt.hash(rawPassword, 10)

        // 3. 计算过期时间
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + days)

        // 4. 事务创建
        await db.$transaction(async (tx) => {
            const member = await tx.member.create({
                data: {
                    name,
                    phone,
                    password: hashedPassword,
                    expiryDate,
                    status: 'ACTIVE'
                }
            })

            // 记录收款流水 (如果是开卡收费)
            if (amount > 0) {
                await tx.paymentLog.create({
                    data: {
                        memberId: member.id,
                        amount,
                        days,
                        type: 'RENEWAL', // 开卡也算一种充值/续费
                        notes: '新会员开卡',
                        method: 'CASH' // 默认，后期可改
                    }
                })
            }
        })

        revalidatePath("/admin/members")
        return { success: true, message: `开卡成功！初始密码为: ${rawPassword}` }
    } catch (error) {
        console.error("Register error:", error)
        return { error: "注册失败" }
    }
}

// 封禁/解封会员
export async function toggleMemberStatus(memberId: number, currentStatus: string) {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权操作" }

    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE'

    try {
        await db.member.update({
            where: { id: memberId },
            data: { status: newStatus }
        })
        revalidatePath("/admin/members")
        return { success: true }
    } catch (error) {
        return { error: "操作失败" }
    }
}
// 获取管理端仪表盘数据
export async function getAdminDashboardStats() {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权访问" }

    try {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        // 今日签到数 (去重: 不重复用户数)
        const checkIns = await db.checkIn.findMany({
            where: {
                checkTime: {
                    gte: todayStart,
                    lte: todayEnd
                }
            },
            select: { memberId: true }
        })
        const checkInCount = new Set(checkIns.map(c => c.memberId)).size

        // 有效会员数 (未过期且状态正常)
        const activeMemberCount = await db.member.count({
            where: {
                status: 'ACTIVE',
                expiryDate: {
                    gt: new Date()
                },
                deleted: false
            }
        })

        // 本月营收
        const firstDayOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1)
        const revenueResult = await db.paymentLog.aggregate({
            _sum: {
                amount: true
            },
            where: {
                createdAt: {
                    gte: firstDayOfMonth
                }
            }
        })
        const monthlyRevenue = revenueResult._sum.amount || 0

        return {
            success: true,
            data: {
                checkInCount,
                activeMemberCount,
                monthlyRevenue
            }
        }
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return { error: "获取数据失败" }
    }
}

// 会员续费
export async function renewMembership(memberId: number, plan: 'MONTH' | 'SEASON' | 'YEAR') {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权操作" }

    let amount = 0
    let days = 0
    let notes = ''

    switch (plan) {
        case 'MONTH':
            amount = 300
            days = 30
            notes = '月卡续费'
            break
        case 'SEASON':
            amount = 900
            days = 90
            notes = '季卡续费'
            break
        case 'YEAR':
            amount = 2000
            days = 365
            notes = '年卡续费'
            break
        default:
            return { error: "无效的续费套餐" }
    }

    try {
        const member = await db.member.findUnique({ where: { id: memberId } })
        if (!member) return { error: "会员不存在" }

        // 计算新过期时间
        // 如果当前未过期，从当前过期时间顺延；如果已过期，从今天开始算
        const now = new Date()
        let newExpiryDate = new Date(member.expiryDate)
        if (newExpiryDate < now) {
            newExpiryDate = new Date() // 已过期，重置为今天开始
        }
        newExpiryDate.setDate(newExpiryDate.getDate() + days)

        // 事务更新
        await db.$transaction(async (tx) => {
            await tx.member.update({
                where: { id: memberId },
                data: {
                    expiryDate: newExpiryDate,
                    status: 'ACTIVE' // 续费后自动激活（如果之前是过期的）
                }
            })

            await tx.paymentLog.create({
                data: {
                    memberId: memberId,
                    amount,
                    days,
                    type: 'RENEWAL',
                    method: 'CASH', // 默认现金/扫码
                    notes
                }
            })
        })

        revalidatePath("/admin/members")
        revalidatePath("/admin/dashboard") // Revenue changes
        return { success: true, message: "续费成功" }
    } catch (error) {
        console.error("Renewal error:", error)
        return { error: "续费失败" }
    }
}

// 重置会员密码
export async function resetMemberPassword(memberId: number) {
    const session = await verifySession()
    if (session?.role !== 'admin') return { error: "无权操作" }

    try {
        // Generate password YYYYMMDD
        const now = new Date()
        // Ensure Beijing Time for consistent "Today"
        const dateStr = now.toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai", year: 'numeric', month: '2-digit', day: '2-digit' })
        const passwordRaw = dateStr.replace(/\//g, '') // YYYYMMDD

        const hashedPassword = await bcrypt.hash(passwordRaw, 10)

        await db.member.update({
            where: { id: memberId },
            data: { password: hashedPassword }
        })

        return { success: true, message: `密码已重置为: ${passwordRaw}` }
    } catch (error) {
        return { error: "重置失败" }
    }
}
