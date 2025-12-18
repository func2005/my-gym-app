'use server'

import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"

export async function getMemberDashboardData() {
    const session = await verifySession()
    if (!session || session.role !== 'member') return null

    try {
        const member = await db.member.findUnique({
            where: { id: session.userId },
            select: {
                name: true,
                expiryDate: true,
                status: true,
                avatar: true,
                createdAt: true
            }
        })

        if (!member) return null

        // 1. Calculate days remaining
        const now = new Date()
        const expiryDate = new Date(member.expiryDate)
        const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

        // 2. Fetch Check-in Stats
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // Fetch THIS MONTH's check-ins for Calendar
        const monthlyCheckIns = await db.checkIn.findMany({
            where: {
                memberId: session.userId,
                checkTime: { gte: startOfMonth, lte: endOfMonth }
            },
            select: { checkTime: true }
        })

        // Fetch Total Check-in Records for unique day calculation
        const allCheckIns = await db.checkIn.findMany({
            where: { memberId: session.userId },
            select: { checkTime: true }
        })

        // Calculate Unique Check-in Days (Total)
        const checkInDaysSet = new Set(allCheckIns.map((c: { checkTime: Date }) => {
            return new Date(c.checkTime).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })
        }))
        const totalCheckIns = checkInDaysSet.size

        // Calculate This Week Check-in Days
        const startOfWeek = new Date(now)
        const day = startOfWeek.getDay() || 7 // Get current day number, converting Sunday 0 to 7
        if (day !== 1) {
            startOfWeek.setHours(-24 * (day - 1)) // Go back to Monday
        } else {
            startOfWeek.setHours(0, 0, 0, 0) // Today is Monday
        }

        // Filter check-ins for this week and count unique days
        const thisWeekCheckInsSet = new Set(allCheckIns
            .filter((c: { checkTime: Date }) => c.checkTime >= startOfWeek)
            .map((c: { checkTime: Date }) => new Date(c.checkTime).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" }))
        )
        const thisWeekCheckIns = thisWeekCheckInsSet.size

        // Calculate Average Weekly Check-ins
        const daysSinceJoined = Math.max(1, Math.ceil((now.getTime() - member.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
        const weeksActive = Math.max(1, daysSinceJoined / 7) // Ensure at least 1 week to avoid division by near-zero for new users
        const averageWeeklyCheckIns = (totalCheckIns / weeksActive).toFixed(1)

        // 3. Fetch Latest Body Metric for BMI
        const latestMetric = await db.bodyMetric.findFirst({
            where: {
                memberId: session.userId,
                deleted: false
            },
            orderBy: { recordDate: 'desc' }
        })

        let bmi = "N/A"
        let bmiStatus = "未计算"

        if (latestMetric && latestMetric.weight && latestMetric.height) {
            const h = latestMetric.height / 100 // cm to m
            const val = latestMetric.weight / (h * h)
            bmi = val.toFixed(1)

            if (val < 18.5) bmiStatus = "偏瘦"
            else if (val < 24) bmiStatus = "正常"
            else if (val < 28) bmiStatus = "超重"
            else bmiStatus = "肥胖"
        } else if (latestMetric && latestMetric.weight) {
            bmiStatus = "缺少身高"
        }

        return {
            member,
            daysRemaining,
            checkInDates: monthlyCheckIns.map((c: { checkTime: Date }) => {
                // Ensure we get the day in China timezone (UTC+8)
                // Use Intl.DateTimeFormat or simple offset adjustment
                const dateInCN = new Date(c.checkTime).toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
                return new Date(dateInCN).getDate()
            }),
            stats: {
                total: totalCheckIns,
                thisWeek: thisWeekCheckIns,
                weeklyAvg: averageWeeklyCheckIns
            },
            body: {
                weight: latestMetric?.weight || null,
                bmi,
                bmiStatus
            }
        }
    } catch (error) {
        console.error("Dashboard data fetch error:", error)
        return null
    }
}
