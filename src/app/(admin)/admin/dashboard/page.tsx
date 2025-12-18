import { getAdminDashboardStats } from "@/actions/admin-ops"

export default async function AdminDashboard() {
    const { data } = await getAdminDashboardStats()

    // Default values if fetch fails
    const stats = data || { checkInCount: 0, activeMemberCount: 0, monthlyRevenue: 0 }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">管理端概览</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-slate-500">今日签到</h3>
                    <p className="text-3xl font-bold mt-2">{stats.checkInCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-slate-500">有效会员</h3>
                    <p className="text-3xl font-bold mt-2">{stats.activeMemberCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-slate-500">本月营收</h3>
                    <p className="text-3xl font-bold mt-2">¥{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}
