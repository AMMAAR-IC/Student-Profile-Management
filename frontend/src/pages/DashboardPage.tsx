import { useEffect, useState } from 'react';
import { analyticsService } from '../services';
import type { DashboardData } from '../types';
import { Users, UserCheck, GraduationCap, AlertTriangle, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyticsService.getDashboard()
            .then((res) => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-indigo-400" size={36} />
        </div>
    );

    if (!data) return <div className="text-center text-gray-500 py-20">Failed to load dashboard data</div>;

    const { overview, majorDistribution } = data;

    const stats = [
        { label: 'Total Students', value: overview.totalStudents, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Active', value: overview.activeStudents, icon: UserCheck, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        { label: 'Graduated', value: overview.graduatedStudents, icon: GraduationCap, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { label: 'At Risk', value: overview.suspendedStudents + overview.withdrawnStudents, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { label: 'Avg GPA', value: overview.averageGpa?.toFixed(2) || '—', icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'New (30d)', value: overview.recentEnrollments, icon: Activity, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    ];

    const statusData = [
        { name: 'Active', value: overview.activeStudents },
        { name: 'Graduated', value: overview.graduatedStudents },
        { name: 'Suspended', value: overview.suspendedStudents },
        { name: 'Withdrawn', value: overview.withdrawnStudents },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-5 fade-in">
            <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-0.5">Overview of student profiles and performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="card card-hover p-4 transition-all duration-200">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: bg }}>
                            <Icon size={18} style={{ color }} />
                        </div>
                        <p className="text-xl font-bold text-white">{value}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-5">
                    <h2 className="text-sm font-semibold text-gray-300 mb-4">Students by Major</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={majorDistribution} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1e2030' }} />
                                <YAxis type="category" dataKey="major" tick={{ fontSize: 11, fill: '#94a3b8' }} width={110} axisLine={{ stroke: '#1e2030' }} />
                                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12, color: '#e2e8f0' }} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {majorDistribution.map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-5">
                    <h2 className="text-sm font-semibold text-gray-300 mb-4">Status Distribution</h2>
                    <div className="h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} strokeWidth={2} stroke="#0f1117">
                                    {statusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12, color: '#e2e8f0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center mt-1">
                        {statusData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                {d.name} ({d.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
