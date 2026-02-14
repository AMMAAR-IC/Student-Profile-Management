import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentService } from '../services';
import type { Student, PaginationMeta } from '../types';
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, Users, Eye, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_DOT: Record<string, string> = {
    active: '#10b981',
    graduated: '#8b5cf6',
    suspended: '#f59e0b',
    withdrawn: '#ef4444',
};

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [majorFilter, setMajorFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    const fetchStudents = async (page = 1) => {
        setLoading(true);
        try {
            const params: any = { page, limit: 10 };
            if (search) params.search = search;
            if (majorFilter) params.major = majorFilter;
            if (statusFilter) params.status = statusFilter;
            const res = await studentService.getAll(params);
            setStudents(res.data || []);
            if (res.meta) setMeta(res.meta);
        } catch { toast.error('Failed to load students'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchStudents(1); };
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete ${name}?`)) return;
        try { await studentService.delete(id); toast.success('Deleted'); fetchStudents(meta.page); }
        catch (err: any) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    const gpaColor = (gpa: number | null | undefined) => {
        if (gpa === null || gpa === undefined) return '#64748b';
        if (gpa >= 3.5) return '#10b981';
        if (gpa >= 2.5) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="space-y-4 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Students</h1>
                    <p className="text-gray-500 text-sm">{meta.total} total students</p>
                </div>
                <Link to="/students/new" className="btn-primary text-sm">
                    <Plus size={16} /> Add Student
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="card p-3 flex flex-wrap gap-2 items-center">
                <form onSubmit={handleSearch} className="flex-1 min-w-[180px] relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        className="input pl-9" placeholder="Search name, email, ID..." />
                </form>
                <select value={majorFilter} onChange={(e) => { setMajorFilter(e.target.value); setTimeout(() => fetchStudents(1), 0); }}
                    className="input" style={{ width: 'auto' }}>
                    <option value="">All Majors</option>
                    {['Computer Science', 'Mathematics', 'Physics', 'Biology', 'Engineering', 'Chemistry'].map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTimeout(() => fetchStudents(1), 0); }}
                    className="input" style={{ width: 'auto' }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                    <option value="suspended">Suspended</option>
                    <option value="withdrawn">Withdrawn</option>
                </select>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-indigo-400" size={28} /></div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <Users size={40} className="mb-3 text-gray-600" />
                        <p className="text-sm font-medium">No students found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: '#13151f' }}>
                                    {['Student', 'ID', 'Major', 'GPA', 'Status', ''].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => (
                                    <tr key={s.id} className="border-t cursor-pointer transition-colors hover:bg-white/[0.02]"
                                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                                        onClick={() => navigate(`/students/${s.id}`)}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                    {s.firstName[0]}{s.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-200">{s.firstName} {s.lastName}</p>
                                                    <p className="text-[11px] text-gray-500">{s.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{s.studentId}</td>
                                        <td className="px-4 py-3 text-xs text-gray-400">{s.major || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-semibold" style={{ color: gpaColor(s.currentGpa) }}>
                                                {s.currentGpa?.toFixed(2) || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1.5 text-xs text-gray-400 capitalize">
                                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[s.status] || '#64748b' }} />
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-0.5">
                                                <button onClick={() => navigate(`/students/${s.id}`)} className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer" title="View">
                                                    <Eye size={14} />
                                                </button>
                                                <button onClick={() => navigate(`/students/${s.id}/edit`)} className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer" title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(s.id, `${s.firstName} ${s.lastName}`)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <p className="text-xs text-gray-500">Page {meta.page} of {meta.totalPages} ({meta.total} results)</p>
                        <div className="flex gap-1.5">
                            <button onClick={() => fetchStudents(meta.page - 1)} disabled={meta.page <= 1}
                                className="p-1.5 rounded-lg border text-gray-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer" style={{ borderColor: '#2d3148' }}>
                                <ChevronLeft size={14} />
                            </button>
                            <button onClick={() => fetchStudents(meta.page + 1)} disabled={meta.page >= meta.totalPages}
                                className="p-1.5 rounded-lg border text-gray-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer" style={{ borderColor: '#2d3148' }}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
