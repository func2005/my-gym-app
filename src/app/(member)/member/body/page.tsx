import { getBodyMetrics } from "@/actions/member-data"
import { WeightChart } from "@/components/charts/WeightChart"
import { AddMetricForm } from "@/components/business/AddMetricForm"

export default async function BodyMetricsPage() {
    const { metrics } = await getBodyMetrics()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">身体数据</h1>

            <WeightChart data={metrics || []} />

            <AddMetricForm />

            <div className="space-y-4">
                <h3 className="font-semibold text-slate-700">历史记录</h3>
                <div className="space-y-2">
                    {metrics && metrics.length > 0 ? (
                        // Show in reverse order (newest first) for list
                        [...metrics].reverse().map((m: any) => (
                            <div key={m.id} className="flex justify-between items-center bg-white p-3 rounded-md border border-slate-100 shadow-sm">
                                <span className="text-sm text-slate-500">
                                    {new Date(m.recordDate).toLocaleDateString()}
                                </span>
                                <div className="space-x-4">
                                    <span className="font-medium text-slate-900">{m.weight} kg</span>
                                    {m.bodyFat && <span className="text-xs text-slate-400">{m.bodyFat}%</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-slate-400 py-4">暂无历史记录</p>
                    )}
                </div>
            </div>
        </div>
    )
}
