import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/auth-actions"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="p-4 text-xl font-bold border-b border-slate-700">GymLite Admin</div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin/dashboard" className="block px-4 py-2 hover:bg-slate-800 rounded">概览 (Dashboard)</a>
                    <a href="/admin/checkin" className="block px-4 py-2 hover:bg-slate-800 rounded text-green-400 font-medium">⚡ 快速签到</a>
                    <a href="/admin/members" className="block px-4 py-2 hover:bg-slate-800 rounded">会员管理</a>
                    <a href="/admin/settings" className="block px-4 py-2 hover:bg-slate-800 rounded">设置</a>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <form action={logoutAction}>
                        <Button className="w-full justify-start text-red-300 hover:text-red-400 hover:bg-slate-800 bg-transparent">退出登录</Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    )
}
