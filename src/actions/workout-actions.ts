'use server'

import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function getWorkouts() {
    const session = await verifySession()
    if (!session || session.role !== 'member') return []

    try {
        return await db.workoutLog.findMany({
            where: {
                memberId: session.userId,
                deleted: false
            },
            orderBy: { date: 'desc' },
            take: 50
        })
    } catch (error) {
        console.error("Fetch workouts error:", error)
        return []
    }
}

export async function addWorkout(prevState: any, formData: FormData) {
    const session = await verifySession()
    if (!session || session.role !== 'member') return { error: "无权操作" }

    const title = formData.get("type") as string // Store 'type' as 'title'
    const duration = parseInt(formData.get("duration") as string) || 0
    const notes = formData.get("notes") as string
    // Use current date
    const date = new Date()

    if (!title) return { error: "请选择运动类型" }

    try {
        await db.workoutLog.create({
            data: {
                memberId: session.userId,
                title,
                duration,
                notes,
                date
            }
        })
        revalidatePath("/member/workouts")
        return { success: true, message: "打卡成功！" }
    } catch (error) {
        console.error("Add workout error:", error)
        return { error: "记录失败" }
    }
}
