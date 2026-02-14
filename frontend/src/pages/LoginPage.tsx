import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await register({ email, password, firstName, lastName });
                toast.success('Account created!');
            } else {
                await login(email, password);
                toast.success('Welcome back!');
            }
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1040 50%, #0f1117 100%)' }}>
            {/* Decorative glow */}
            <div className="fixed w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#6366f1', top: '10%', right: '15%' }} />
            <div className="fixed w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: '#8b5cf6', bottom: '15%', left: '10%' }} />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 fade-in">
                    <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }}>
                        <GraduationCap size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">StudentHub</h1>
                    <p className="text-sm text-gray-500 mt-1">Management System</p>
                </div>

                {/* Form */}
                <div className="card p-7 fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-lg font-semibold text-white mb-5">
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">First Name</label>
                                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                        className="input" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Last Name</label>
                                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                        className="input" placeholder="Doe" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="input" placeholder="you@university.edu" />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                                    className="input pr-10" placeholder="••••••••" minLength={8} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center cursor-pointer">
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {isRegister ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center mt-5 text-xs text-gray-500">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button onClick={() => setIsRegister(!isRegister)} className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors cursor-pointer">
                            {isRegister ? 'Sign In' : 'Create one'}
                        </button>
                    </p>

                    {!isRegister && (
                        <div className="mt-4 p-3 rounded-lg text-xs text-gray-500" style={{ background: '#13151f' }}>
                            <p className="font-semibold text-gray-400 mb-1">Demo Credentials</p>
                            <p className="font-mono text-[11px]">admin@university.edu / admin123</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
