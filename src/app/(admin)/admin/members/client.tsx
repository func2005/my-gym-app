'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { MemberForm } from "@/components/business/MemberForm"
import { RenewalDialog } from "@/components/business/RenewalDialog"
import { toggleMemberStatus, resetMemberPassword } from "@/actions/admin-ops"

interface Member {
    id: number
    name: string
    phone: string
    status: string
    expiryDate: Date
}

export function MemberListClient({ initialMembers }: { initialMembers: Member[] }) {
    const [members, setMembers] = useState(initialMembers)
    const [search, setSearch] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isRenewalOpen, setIsRenewalOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<Member | null>(null)
    const router = useRouter()

    const filteredMembers = members.filter(m =>
        m.name.includes(search) || m.phone.includes(search)
    )

    const handleToggleStatus = async (id: number, status: string) => {
        if (confirm(`确定要${status === 'ACTIVE' ? '封禁' : '解封'}该会员吗？`)) {
            await toggleMemberStatus(id, status)
            // Ideally we should update local state or re-fetch, but for now revalidatePath handles it on refresh
            // For immediate feedback, we can optimistically update local state if we want,
            // but Next.js router.refresh() is cleaner if we had a dedicated refresh method or just trusted server actions.
            // Since we rely on initialMembers prop which comes from server, router.refresh() is needed.
            // But here let's just use router.refresh() 
            router.refresh()
        }
    }

    const handleRenewClick = (member: Member) => {
        setSelectedMember(member)
        setIsRenewalOpen(true)
    }

    const handleResetPassword = async (member: Member) => {
        if (confirm(`确定要将 ${member.name} 的密码重置为今日日期吗？`)) {
            const res = await resetMemberPassword(member.id)
            if (res.success) {
                alert(res.message)
            } else {
                alert(res.error)
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="搜索姓名或手机号..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={() => setIsAddOpen(true)}>+ 注册新会员</Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>姓名</TableHead>
                                <TableHead>手机号</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>到期日</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMembers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>{member.phone}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {member.status === 'ACTIVE' ? '正常' : '封禁'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(member.expiryDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                className="h-8 px-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                                onClick={() => handleRenewClick(member)}
                                            >
                                                续费
                                            </Button>
                                            <Button
                                                className="h-8 px-2 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200"
                                                onClick={() => handleResetPassword(member)}
                                            >
                                                重置密码
                                            </Button>
                                            <Button
                                                className="h-8 px-2 text-xs bg-transparent text-slate-900 hover:bg-slate-100"
                                                onClick={() => handleToggleStatus(member.id, member.status)}
                                            >
                                                {member.status === 'ACTIVE' ? '封禁' : '解封'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <MemberForm open={isAddOpen} onOpenChange={setIsAddOpen} />

            <RenewalDialog
                open={isRenewalOpen}
                onOpenChange={setIsRenewalOpen}
                member={selectedMember}
                onSuccess={() => router.refresh()}
            />
        </div>
    )
}
