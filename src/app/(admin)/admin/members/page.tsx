import { db } from "@/lib/db"
import { getMembers } from "@/actions/admin-ops"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MemberListClient } from "./client" // Client Component for Search & Modal

export default async function MembersPage({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    const query = searchParams.q || ""
    const { members } = await getMembers(query)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">会员管理</h1>
            </div>

            <MemberListClient initialMembers={members || []} />
        </div>
    )
}
