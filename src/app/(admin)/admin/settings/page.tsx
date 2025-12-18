import { verifySession } from "@/lib/session"
import { getAdmins } from "@/actions/admin-management"
import { AdminSettingsClient } from "./client"

export default async function AdminSettingsPage() {
    const session = await verifySession()
    // Normally middleware protects this, but good to have fallback
    if (!session) return <div>Please login</div>

    const { admins } = await getAdmins()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">系统设置</h1>
            <AdminSettingsClient
                admins={admins || []}
                currentUserId={session.userId}
            />
        </div>
    )
}
