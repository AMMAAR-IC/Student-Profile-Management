import { z } from 'zod';

// ───── Auth Schemas ─────
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['admin', 'faculty', 'staff', 'student']).default('student'),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// ───── Student Schemas ─────
export const createStudentSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    enrollmentDate: z.string().optional(),
    major: z.string().optional(),
    currentGpa: z.number().min(0).max(4).optional(),
    status: z.enum(['active', 'graduated', 'suspended', 'withdrawn']).default('active'),
    address: z.string().optional(),
    emergencyContact: z
        .object({
            name: z.string().optional(),
            phone: z.string().optional(),
            relationship: z.string().optional(),
        })
        .optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const studentQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    major: z.string().optional(),
    status: z.enum(['active', 'graduated', 'suspended', 'withdrawn']).optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    minGpa: z.coerce.number().min(0).max(4).optional(),
    maxGpa: z.coerce.number().min(0).max(4).optional(),
});

// ───── Academic Record Schemas ─────
export const createAcademicRecordSchema = z.object({
    semester: z.string().min(1, 'Semester is required'),
    year: z.number().int().min(2000).max(2100),
    courseCode: z.string().min(1, 'Course code is required'),
    courseName: z.string().min(1, 'Course name is required'),
    grade: z.string().min(1, 'Grade is required'),
    credits: z.number().int().min(0),
    gpaContribution: z.number().min(0).max(4).optional(),
});

// ───── AI Agent Schemas ─────
export const analyzeSchema = z.object({
    studentId: z.string().uuid('Invalid student ID'),
});

export const querySchema = z.object({
    query: z.string().min(1, 'Query is required'),
    context: z.record(z.any()).optional(),
});

export const chatSchema = z.object({
    message: z.string().min(1, 'Message is required'),
    conversationHistory: z
        .array(
            z.object({
                role: z.enum(['user', 'assistant']),
                content: z.string(),
            })
        )
        .optional(),
});

export const recommendSchema = z.object({
    studentId: z.string().uuid('Invalid student ID'),
    type: z.enum(['courses', 'career', 'scholarship', 'all']).default('all'),
});
