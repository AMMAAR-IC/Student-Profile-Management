import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentService, agentService } from '../services';
import type { Student, AnalysisResult } from '../types';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, FileText, Brain, Loader2, AlertTriangle, TrendingUp, Star, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_DOT: Record<string, string> = { active: '#10b981', graduated: '#8b5cf6', suspended: '#f59e0b', withdrawn: '#ef4444' };

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'documents' | 'ai'>('overview');

    useEffect(() => {
        if (!id) return;
        studentService.getById(id)
            .then(res => setStudent(res.data ?? null))
            .catch(() => toast.error('Student not found'))
            .finally(() => setLoading(false));
    }, [id]);

    const runAnalysis = async () => {
        if (!id) return;
        setAnalyzing(true);
        try {
            const res = await agentService.analyze(id);
            setAnalysis(res.data ?? null);
            setActiveTab('ai');
            toast.success('Analysis complete');
        } catch (err: any) { toast.error(err.response?.data?.message || 'Analysis failed'); }
        finally { setAnalyzing(false); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={36} /></div>;
    if (!student) return <div className="text-center py-20 text-gray-500">Student not found</div>;

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'academic', label: `Academic (${student.academicRecords?.length || 0})` },
        { key: 'documents', label: `Documents (${student.documents?.length || 0})` },
        { key: 'ai', label: 'AI Analysis' },
    ];

    const gpaColor = student.currentGpa && student.currentGpa >= 3.5 ? '#10b981' : student.currentGpa && student.currentGpa >= 2.5 ? '#f59e0b' : '#ef4444';

    return (
        <div className="space-y-4 fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => navigate('/students')} className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <ArrowLeft size={18} className="text-gray-400" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-white">{student.firstName} {student.lastName}</h1>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                        {student.studentId} • {student.major || 'Undeclared'}
                        <span className="flex items-center gap-1 capitalize"><span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_DOT[student.status] }} />{student.status}</span>
                    </p>
                </div>
                <button onClick={runAnalysis} disabled={analyzing} className="btn-primary text-xs cursor-pointer">
                    {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                    AI Analyze
                </button>
                <Link to={`/students/${id}/edit`} className="btn-ghost text-xs">Edit</Link>
            </div>

            {/* Profile Card */}
            <div className="card p-5">
                <div className="flex flex-wrap gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 flex-1 text-xs">
                        <div className="flex items-center gap-2 text-gray-400"><Mail size={13} className="text-gray-600" />{student.email}</div>
                        <div className="flex items-center gap-2 text-gray-400"><Phone size={13} className="text-gray-600" />{student.phone || '—'}</div>
                        <div className="flex items-center gap-2 text-gray-400 truncate"><MapPin size={13} className="text-gray-600 flex-shrink-0" /><span className="truncate">{student.address || '—'}</span></div>
                        <div className="flex items-center gap-2 text-gray-400"><Calendar size={13} className="text-gray-600" />{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '—'}</div>
                    </div>
                    <div className="text-center px-5" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-2xl font-bold" style={{ color: gpaColor }}>{student.currentGpa?.toFixed(2) || '—'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">GPA</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 p-1 rounded-lg w-fit" style={{ background: '#13151f' }}>
                {tabs.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        style={activeTab === tab.key ? { background: '#1a1d2e' } : {}}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card p-5">
                        <h3 className="font-semibold text-gray-300 text-sm mb-3">Personal Information</h3>
                        <dl className="space-y-2.5 text-xs">
                            <div className="flex justify-between"><dt className="text-gray-500">Date of Birth</dt><dd className="text-gray-300">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd className="text-gray-300">{student.phone || '—'}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-500">Address</dt><dd className="text-gray-300 text-right max-w-[200px]">{student.address || '—'}</dd></div>
                        </dl>
                    </div>
                    <div className="card p-5">
                        <h3 className="font-semibold text-gray-300 text-sm mb-3">Emergency Contact</h3>
                        <dl className="space-y-2.5 text-xs">
                            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="text-gray-300">{student.emergencyContact?.name || '—'}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd className="text-gray-300">{student.emergencyContact?.phone || '—'}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-500">Relationship</dt><dd className="text-gray-300">{student.emergencyContact?.relationship || '—'}</dd></div>
                        </dl>
                    </div>
                </div>
            )}

            {activeTab === 'academic' && (
                <div className="card overflow-hidden">
                    {!student.academicRecords?.length ? (
                        <div className="py-14 text-center text-gray-500"><BookOpen size={36} className="mx-auto mb-2 text-gray-600" /><p className="text-sm">No academic records</p></div>
                    ) : (
                        <table className="w-full">
                            <thead><tr style={{ background: '#13151f' }}>
                                {['Course', 'Code', 'Semester', 'Year', 'Grade', 'Credits'].map(h => (
                                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {student.academicRecords.map((r) => (
                                    <tr key={r.id} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                        <td className="px-4 py-2.5 text-xs font-medium text-gray-300">{r.courseName}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{r.courseCode}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-400">{r.semester}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-400">{r.year}</td>
                                        <td className="px-4 py-2.5"><span className={`font-semibold text-xs ${r.grade.startsWith('A') ? 'text-emerald-400' : r.grade.startsWith('B') ? 'text-blue-400' : r.grade.startsWith('C') ? 'text-amber-400' : 'text-red-400'}`}>{r.grade}</span></td>
                                        <td className="px-4 py-2.5 text-xs text-gray-400">{r.credits}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'documents' && (
                <div className="card p-5">
                    {!student.documents?.length ? (
                        <div className="py-14 text-center text-gray-500"><FileText size={36} className="mx-auto mb-2 text-gray-600" /><p className="text-sm">No documents uploaded</p></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {student.documents.map(doc => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <FileText size={18} className="text-indigo-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-300 truncate">{doc.fileName}</p>
                                        <p className="text-[11px] text-gray-500">{doc.documentType} • {(doc.fileSize / 1024).toFixed(1)}KB</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="space-y-4">
                    {!analysis ? (
                        <div className="card p-10 text-center">
                            <Brain size={40} className="mx-auto mb-3 text-gray-600" />
                            <h3 className="text-sm font-medium text-gray-400 mb-1">No Analysis Yet</h3>
                            <p className="text-xs text-gray-500 mb-5">Click "AI Analyze" to generate insights</p>
                            <button onClick={runAnalysis} disabled={analyzing} className="btn-primary text-xs mx-auto cursor-pointer">
                                {analyzing ? 'Analyzing...' : 'Run Analysis'}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="card p-5">
                                <div className="flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-indigo-400" /><h3 className="text-sm font-semibold text-gray-300">Performance</h3></div>
                                <p className="text-xs text-gray-400 leading-relaxed">{analysis.overall_performance}</p>
                                <div className="mt-3">
                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium capitalize ${analysis.risk_level === 'low' ? 'text-emerald-400 bg-emerald-500/10' : analysis.risk_level === 'medium' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                        Risk: {analysis.risk_level}
                                    </span>
                                </div>
                            </div>
                            <div className="card p-5">
                                <div className="flex items-center gap-2 mb-3"><Star size={16} className="text-amber-400" /><h3 className="text-sm font-semibold text-gray-300">Strengths</h3></div>
                                <ul className="space-y-1.5">{analysis.strengths?.map((s, i) => <li key={i} className="text-xs text-gray-400 flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />{s}</li>)}</ul>
                            </div>
                            <div className="card p-5">
                                <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-amber-400" /><h3 className="text-sm font-semibold text-gray-300">Areas for Improvement</h3></div>
                                <ul className="space-y-1.5">{analysis.areas_for_improvement?.map((a, i) => <li key={i} className="text-xs text-gray-400 flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />{a}</li>)}</ul>
                            </div>
                            <div className="card p-5">
                                <div className="flex items-center gap-2 mb-3"><Target size={16} className="text-indigo-400" /><h3 className="text-sm font-semibold text-gray-300">Recommendations</h3></div>
                                <ul className="space-y-1.5">{analysis.recommendations?.map((r, i) => <li key={i} className="text-xs text-gray-400 flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />{r}</li>)}</ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
