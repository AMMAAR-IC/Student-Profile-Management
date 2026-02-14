export interface User {
    id: string;
    email: string;
    role: 'admin' | 'faculty' | 'staff' | 'student';
    firstName?: string;
    lastName?: string;
    createdAt?: string;
}

export interface Student {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    enrollmentDate?: string;
    major?: string;
    currentGpa?: number;
    status: 'active' | 'graduated' | 'suspended' | 'withdrawn';
    address?: string;
    emergencyContact?: { name?: string; phone?: string; relationship?: string };
    isDeleted?: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: { academicRecords: number; documents: number };
    academicRecords?: AcademicRecord[];
    documents?: StudentDocument[];
    createdBy?: { id: string; email: string; firstName?: string; lastName?: string };
}

export interface AcademicRecord {
    id: string;
    studentId: string;
    semester: string;
    year: number;
    courseCode: string;
    courseName: string;
    grade: string;
    credits: number;
    gpaContribution?: number;
    createdAt: string;
}

export interface StudentDocument {
    id: string;
    studentId: string;
    documentType: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface DashboardData {
    overview: {
        totalStudents: number;
        activeStudents: number;
        graduatedStudents: number;
        suspendedStudents: number;
        withdrawnStudents: number;
        averageGpa: number;
        recentEnrollments: number;
    };
    majorDistribution: { major: string; count: number }[];
}

export interface AnalysisResult {
    overall_performance: string;
    strengths: string[];
    areas_for_improvement: string[];
    recommendations: string[];
    risk_level: string;
    gpa_trend?: string;
    note?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}
