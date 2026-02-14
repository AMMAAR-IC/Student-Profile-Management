import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; role?: string; firstName?: string; lastName?: string }) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await authService.login(email, password);
            const { user, accessToken, refreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (data) => {
        set({ isLoading: true });
        try {
            const response = await authService.register(data);
            const { user, accessToken, refreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        if (!localStorage.getItem('accessToken')) {
            set({ isAuthenticated: false, user: null });
            return;
        }
        try {
            const response = await authService.me();
            set({ user: response.data, isAuthenticated: true });
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false });
        }
    },
}));
