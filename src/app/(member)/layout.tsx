import { logoutAction } from "@/actions/auth-actions"

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 pb-20"> {/* pb-20 for bottom nav */}
            <main className="p-4 max-w-md mx-auto">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50">
                <a href="/member/dashboard" className="flex flex-col items-center justify-center w-full h-full text-xs text-slate-600">
                    <span>🏠 首页</span>
                </a>
                <a href="/member/body" className="flex flex-col items-center justify-center w-full h-full text-xs text-slate-600">
                    <span>📊 身体</span>
                </a>
                <a href="/member/workouts" className="flex flex-col items-center justify-center w-full h-full text-xs text-slate-600">
                    <span>💪 训练</span>
                </a>
                <a href="/member/settings" className="flex flex-col items-center justify-center w-full h-full text-xs text-slate-600">
                    <span>⚙️ 我的</span>
                </a>
            </nav>
        </div>
    )
}
