import { db } from "@/lib/db"
import { verifySession } from "@/lib/session"
import { logoutAction } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { ProfileForm, PasswordForm } from "./client"

export default async function MemberSettingsPage() {
    const session = await verifySession()
    if (!session) return null

    const member = await db.member.findUnique({
        where: { id: session.userId },
        select: { name: true, avatar: true, phone: true }
    })

    if (!member) return null

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">账户设置</h1>

            <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden">
                    {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl">👤</div>
                    )}
                </div>
                <div>
                    <h2 className="font-bold text-lg">{member.name}</h2>
                    <p className="text-slate-500 text-sm">{member.phone}</p>
                </div>
            </div>

            <ProfileForm initialData={member} />

            <PasswordForm />

            <form action={logoutAction}>
                <Button className="w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200">
                    退出登录
                </Button>
            </form>
        </div>
    )
}
