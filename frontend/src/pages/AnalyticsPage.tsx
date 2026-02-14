import { useEffect, useState } from 'react';
import { analyticsService } from '../services';
import { Loader2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsPage() {
    const [trends, setTrends] = useState<any>(null);
    const [cohort, setCohort] = useState<any>(null);
    const [atRisk, setAtRisk] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            analyticsService.getTrends().then(r => setTrends(r.data)),
            analyticsService.getCohort().then(r => setCohort(r.data)),
            analyticsService.getAtRisk().then(r => setAtRisk(r.data || [])),
        ]).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={36} /></div>;

    const ttStyle = { background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12, color: '#e2e8f0' };
    const RISK_DOT: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', unknown: '#64748b' };

    return (
        <div className="space-y-4 fade-in">
            <div>
                <h1 className="text-xl font-bold text-white">Analytics</h1>
                <p className="text-gray-500 text-sm mt-0.5">Performance trends, cohort analysis, and at-risk identification</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* GPA Distribution */}
                {trends?.gpaDistribution && (
                    <div className="card p-5">
                        <h2 className="text-sm font-semibold text-gray-300 mb-4">GPA Distribution</h2>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends.gpaDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1e2030' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1e2030' }} />
                                    <Tooltip contentStyle={ttStyle} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Performance by Major */}
                {trends?.performanceByMajor && (
                    <div className="card p-5">
                        <h2 className="text-sm font-semibold text-gray-300 mb-4">Avg GPA by Major</h2>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends.performanceByMajor} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                                    <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1e2030' }} />
                                    <YAxis type="category" dataKey="major" tick={{ fontSize: 11, fill: '#94a3b8' }} width={110} axisLine={{ stroke: '#1e2030' }} />
                                    <Tooltip contentStyle={ttStyle} />
                                    <Bar dataKey="averageGpa" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Cohort */}
                {cohort && Array.isArray(cohort) && cohort.length > 0 && (
                    <div className="card p-5">
                        <h2 className="text-sm font-semibold text-gray-300 mb-4">Cohort Overview</h2>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[...cohort].reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1e2030' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1e2030' }} />
                                    <Tooltip contentStyle={ttStyle} />
                                    <Line type="monotone" dataKey="totalStudents" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} name="Total" />
                                    <Line type="monotone" dataKey="activeCount" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} name="Active" />
                                    <Line type="monotone" dataKey="graduatedCount" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} name="Graduated" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* At-Risk */}
                <div className="card p-5">
                    <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <AlertTriangle size={15} className="text-amber-400" /> At-Risk Students
                    </h2>
                    {atRisk.length === 0 ? (
                        <p className="text-gray-500 text-xs py-8 text-center">No at-risk students identified</p>
                    ) : (
                        <div className="space-y-2 max-h-56 overflow-auto">
                            {atRisk.map((s: any) => (
                                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                                        {s.firstName[0]}{s.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-300 truncate">{s.firstName} {s.lastName}</p>
                                        <p className="text-[10px] text-gray-500">{s.major || 'Undeclared'} • GPA: {s.currentGpa?.toFixed(2) || 'N/A'}</p>
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 capitalize">
                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: RISK_DOT[s.riskLevel] || RISK_DOT.unknown }} />
                                        {s.riskLevel}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
