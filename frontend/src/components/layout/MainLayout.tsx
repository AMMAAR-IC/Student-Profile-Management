import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    LayoutDashboard, Users, Bot, BarChart3, LogOut, Menu, X, GraduationCap
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function MainLayout() {
    const [open, setOpen] = useState(true);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const doLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
            {/* Sidebar */}
            <aside
                className="flex flex-col transition-all duration-300 border-r"
                style={{
                    width: open ? 240 : 72,
                    background: '#13151f',
                    borderColor: 'rgba(255,255,255,0.06)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    {open && (
                        <div className="fade-in">
                            <p className="text-sm font-semibold text-white leading-tight">StudentHub</p>
                            <p className="text-[11px] text-gray-500">Management System</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3 px-2 space-y-0.5">
                    {navItems.map(({ path, icon: Icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group ${isActive
                                    ? 'text-white'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`
                            }
                            style={({ isActive }) => isActive ? { background: 'rgba(99,102,241,0.12)' } : {}}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} className="flex-shrink-0" style={isActive ? { color: '#818cf8' } : {}} />
                                    {open && <span className="fade-in">{label}</span>}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            {user?.firstName?.[0] || 'U'}
                        </div>
                        {open && (
                            <div className="flex-1 min-w-0 fade-in">
                                <p className="text-xs font-medium text-gray-300 truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[11px] text-gray-600 capitalize">{user?.role}</p>
                            </div>
                        )}
                        <button onClick={doLogout} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 cursor-pointer" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-14 flex items-center px-5 gap-4" style={{ background: '#13151f', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                        {open ? <X size={18} /> : <Menu size={18} />}
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
                        Online
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-5">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
