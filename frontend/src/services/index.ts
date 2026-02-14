import api from './api';
import type { Student, ApiResponse, AcademicRecord, AnalysisResult } from '../types';

export const studentService = {
    getAll: async (params: Record<string, any> = {}) => {
        const { data } = await api.get<ApiResponse<Student[]>>('/students', { params });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<ApiResponse<Student>>(`/students/${id}`);
        return data;
    },

    create: async (studentData: Partial<Student>) => {
        const { data } = await api.post<ApiResponse<Student>>('/students', studentData);
        return data;
    },

    update: async (id: string, studentData: Partial<Student>) => {
        const { data } = await api.put<ApiResponse<Student>>(`/students/${id}`, studentData);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete<ApiResponse>(`/students/${id}`);
        return data;
    },

    search: async (q: string) => {
        const { data } = await api.get<ApiResponse<Student[]>>('/students/search', { params: { q } });
        return data;
    },

    getAcademicRecords: async (id: string) => {
        const { data } = await api.get<ApiResponse<AcademicRecord[]>>(`/students/${id}/academic`);
        return data;
    },

    addAcademicRecord: async (id: string, record: Partial<AcademicRecord>) => {
        const { data } = await api.post<ApiResponse<AcademicRecord>>(`/students/${id}/academic`, record);
        return data;
    },

    uploadDocument: async (id: string, file: File, documentType: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        const { data } = await api.post<ApiResponse>(`/students/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
};

export const authService = {
    login: async (email: string, password: string) => {
        const { data } = await api.post<ApiResponse>('/auth/login', { email, password });
        return data;
    },

    register: async (userData: { email: string; password: string; role?: string; firstName?: string; lastName?: string }) => {
        const { data } = await api.post<ApiResponse>('/auth/register', userData);
        return data;
    },

    me: async () => {
        const { data } = await api.get<ApiResponse>('/auth/me');
        return data;
    },

    logout: async () => {
        const { data } = await api.post<ApiResponse>('/auth/logout');
        return data;
    },
};

export const agentService = {
    analyze: async (studentId: string) => {
        const { data } = await api.post<ApiResponse<AnalysisResult>>('/agent/analyze', { studentId });
        return data;
    },

    query: async (query: string) => {
        const { data } = await api.post<ApiResponse>('/agent/query', { query });
        return data;
    },

    chat: async (message: string, conversationHistory: { role: string; content: string }[] = []) => {
        const { data } = await api.post<ApiResponse>('/agent/chat', { message, conversationHistory });
        return data;
    },

    recommend: async (studentId: string, type: string = 'all') => {
        const { data } = await api.post<ApiResponse>('/agent/recommend', { studentId, type });
        return data;
    },

    getInsights: async () => {
        const { data } = await api.get<ApiResponse>('/agent/insights');
        return data;
    },
};

export const analyticsService = {
    getDashboard: async () => {
        const { data } = await api.get<ApiResponse>('/analytics/dashboard');
        return data;
    },

    getTrends: async () => {
        const { data } = await api.get<ApiResponse>('/analytics/trends');
        return data;
    },

    getCohort: async () => {
        const { data } = await api.get<ApiResponse>('/analytics/cohort');
        return data;
    },

    getAtRisk: async () => {
        const { data } = await api.get<ApiResponse>('/analytics/at-risk');
        return data;
    },
};
