import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../services';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

type FormStatus = 'active' | 'graduated' | 'suspended' | 'withdrawn';

interface FormState {
    studentId: string; firstName: string; lastName: string; email: string; phone: string;
    dateOfBirth: string; enrollmentDate: string; major: string; currentGpa: string;
    status: FormStatus; address: string;
    emergencyContactName: string; emergencyContactPhone: string; emergencyContactRelationship: string;
}

const INITIAL_FORM: FormState = {
    studentId: '', firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', enrollmentDate: '', major: '', currentGpa: '',
    status: 'active', address: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '',
};

export default function StudentFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    useEffect(() => {
        if (!id) return;
        studentService.getById(id).then(res => {
            const s = res.data;
            if (!s) return;
            setForm({
                studentId: s.studentId, firstName: s.firstName, lastName: s.lastName,
                email: s.email, phone: s.phone || '', dateOfBirth: s.dateOfBirth?.split('T')[0] || '',
                enrollmentDate: s.enrollmentDate?.split('T')[0] || '', major: s.major || '',
                currentGpa: s.currentGpa?.toString() || '', status: s.status as FormStatus, address: s.address || '',
                emergencyContactName: s.emergencyContact?.name || '',
                emergencyContactPhone: s.emergencyContact?.phone || '',
                emergencyContactRelationship: s.emergencyContact?.relationship || '',
            });
        }).catch(() => toast.error('Failed to load student'))
            .finally(() => setFetching(false));
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                studentId: form.studentId, firstName: form.firstName, lastName: form.lastName,
                email: form.email, phone: form.phone || undefined, major: form.major || undefined,
                status: form.status, address: form.address || undefined,
                dateOfBirth: form.dateOfBirth || undefined,
                enrollmentDate: form.enrollmentDate || undefined,
                currentGpa: form.currentGpa ? parseFloat(form.currentGpa) : undefined,
                emergencyContact: form.emergencyContactName ? {
                    name: form.emergencyContactName, phone: form.emergencyContactPhone, relationship: form.emergencyContactRelationship,
                } : undefined,
            };

            if (isEdit) {
                await studentService.update(id!, payload);
                toast.success('Student updated');
            } else {
                await studentService.create(payload);
                toast.success('Student created');
            }
            navigate('/students');
        } catch (err: any) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setLoading(false); }
    };

    if (fetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={36} /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-4 fade-in">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/students')} className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <ArrowLeft size={18} className="text-gray-400" />
                </button>
                <h1 className="text-xl font-bold text-white">{isEdit ? 'Edit Student' : 'New Student'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                {/* Personal Info */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-300 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Student ID *</label><input name="studentId" value={form.studentId} onChange={handleChange} className="input" required placeholder="STU-2024-XXX" /></div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select name="status" value={form.status} onChange={handleChange} className="input">
                                <option value="active">Active</option><option value="graduated">Graduated</option>
                                <option value="suspended">Suspended</option><option value="withdrawn">Withdrawn</option>
                            </select>
                        </div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label><input name="firstName" value={form.firstName} onChange={handleChange} className="input" required /></div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label><input name="lastName" value={form.lastName} onChange={handleChange} className="input" required /></div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Email *</label><input name="email" type="email" value={form.email} onChange={handleChange} className="input" required /></div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="input" /></div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label><input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="input" /></div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Enrollment Date</label><input name="enrollmentDate" type="date" value={form.enrollmentDate} onChange={handleChange} className="input" /></div>
                    </div>
                </section>

                {/* Academic */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-300 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Academic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Major</label>
                            <select name="major" value={form.major} onChange={handleChange} className="input">
                                <option value="">Select Major...</option>
                                {['Computer Science', 'Mathematics', 'Physics', 'Biology', 'Engineering', 'Chemistry'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Current GPA</label><input name="currentGpa" type="number" step="0.01" min="0" max="4" value={form.currentGpa} onChange={handleChange} className="input" placeholder="0.00 - 4.00" /></div>
                    </div>
                    <div className="mt-3"><label className="block text-xs font-medium text-gray-500 mb-1">Address</label><textarea name="address" value={form.address} onChange={handleChange} className="input resize-none" rows={2} /></div>
                </section>

                {/* Emergency */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-300 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Emergency Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Name</label><input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} className="input" /></div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label><input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} className="input" /></div>
                        <div><label className="block text-xs font-medium text-gray-500 mb-1">Relationship</label><input name="emergencyContactRelationship" value={form.emergencyContactRelationship} onChange={handleChange} className="input" /></div>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button type="button" onClick={() => navigate('/students')} className="btn-ghost text-xs cursor-pointer">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary text-xs cursor-pointer">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isEdit ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}
