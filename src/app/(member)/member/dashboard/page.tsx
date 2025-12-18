import { getMemberDashboardData } from "@/actions/member-dashboard"
import { CheckInCalendar } from "@/components/business/CheckInCalendar"
import Link from "next/link"

export default async function MemberDashboard() {
    const data = await getMemberDashboardData()

    if (!data) {
        return <div className="p-4 text-center">Loading...</div>
    }

    const { member, daysRemaining, checkInDates, stats, body } = data
    const now = new Date()
    const todayStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`

    const daysGradient = daysRemaining < 30 ? "from-orange-500 to-red-600" : "from-indigo-600 to-purple-700"

    return (
        <div className="space-y-6 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">早安, {member.name}</h1>
                    <p className="text-sm text-slate-500">今天是 {todayStr}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                    {member.avatar ? (
                        <img src={member.avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-xl">👤</div>
                    )}
                </div>
            </header>

            {/* Membership Card */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${daysGradient} p-6 text-white shadow-xl shadow-indigo-200`}>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm opacity-80 font-medium">会员有效期</p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tight">{daysRemaining}</span>
                                <span className="text-lg opacity-90">天剩余</span>
                            </div>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                            {member.status === 'ACTIVE' ? '生效中' : '异常'}
                        </div>
                    </div>
                    <p className="mt-6 text-xs opacity-60 font-mono">
                        到期日: {(() => {
                            const d = new Date(member.expiryDate)
                            return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
                        })()}
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
            </div>

            {/* Check-in Calendar with Stats */}
            <CheckInCalendar dates={checkInDates} stats={stats} referenceDate={new Date()} />

            {/* Body Status Card */}
            <div className="flex gap-4">
                <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">当前体重</p>
                    <p className="text-2xl font-bold text-slate-800">
                        {body.weight ? body.weight : '--'}
                        <span className="text-sm font-normal text-slate-500 ml-1">kg</span>
                    </p>
                </div>
                <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400">BMI 指数</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${body.bmiStatus === '正常' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {body.bmiStatus}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{body.bmi}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/member/workouts" className="flex h-24 flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all">
                    <span className="text-3xl mb-2">💪</span>
                    <span className="text-sm font-bold text-slate-700">去训练</span>
                </Link>
                <Link href="/member/body" className="flex h-24 flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all">
                    <span className="text-3xl mb-2">⚖️</span>
                    <span className="text-sm font-bold text-slate-700">身体数据</span>
                </Link>
            </div>
        </div>
    )
}
