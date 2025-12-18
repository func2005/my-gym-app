'use server'

import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function getBodyMetrics() {
    const session = await verifySession()
    if (!session || session.role !== 'member') return { error: "无权访问", metrics: [] }

    try {
        const metrics = await db.bodyMetric.findMany({
            where: {
                memberId: session.userId,
                deleted: false,
            },
            orderBy: { recordDate: 'asc' }, // Chart needs ascending order
            take: 30 // 近30次记录
        })
        return { success: true, metrics }
    } catch (error) {
        console.error("Fetch metrics error:", error)
        return { error: "获取数据失败", metrics: [] }
    }
}

export async function addBodyMetric(prevState: any, formData: FormData) {
    const session = await verifySession()
    if (!session || session.role !== 'member') return { error: "无权操作" }

    const weight = parseFloat(formData.get("weight") as string)
    const height = parseFloat(formData.get("height") as string) || null
    const waist = parseFloat(formData.get("waist") as string) || null
    const bodyFat = parseFloat(formData.get("bodyFat") as string) || null

    if (!weight) return { error: "请至少输入体重" }

    // 1. Check if there is a record for today
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    // We try to find a record for today to UPDATE it instead of creating a new one
    // This allows "patching" data (e.g. entering weight now, and waist later)
    const existingRecord = await db.bodyMetric.findFirst({
        where: {
            memberId: session.userId,
            recordDate: {
                gte: startOfDay,
                lt: endOfDay
            },
            deleted: false
        },
        orderBy: { recordDate: 'desc' }
    })

    console.log("AddMetric: Received", { weight, height, waist, bodyFat })
    console.log("AddMetric: Update Existing?", existingRecord?.id)

    try {
        if (existingRecord) {
            // UPDATE existing record
            // Only update fields that are provided (not null)
            const updateData: any = {}
            if (weight) updateData.weight = weight
            if (height) updateData.height = height
            if (waist) updateData.waist = waist
            if (bodyFat) updateData.bodyFat = bodyFat

            await db.bodyMetric.update({
                where: { id: existingRecord.id },
                data: updateData
            })
        } else {
            // CREATE new record

            // Optimization: If height is missing, try to get it from the latest previous record
            // This ensures BMI calculation doesn't break if user only enters weight today
            let finalHeight = height
            if (!finalHeight) {
                const lastRecord = await db.bodyMetric.findFirst({
                    where: { memberId: session.userId, deleted: false },
                    orderBy: { recordDate: 'desc' }
                })
                if (lastRecord?.height) {
                    finalHeight = lastRecord.height
                }
            }

            await db.bodyMetric.create({
                data: {
                    memberId: session.userId,
                    weight,
                    height: finalHeight,
                    waist,
                    bodyFat,
                    recordDate: new Date()
                }
            })
        }

        revalidatePath("/member/body")
        revalidatePath("/member/dashboard") // Update dashboard for BMI
        return { success: true, message: "记录已保存" }
    } catch (error) {
        console.error("Add metric error:", error)
        return { error: "保存失败" }
    }
}
