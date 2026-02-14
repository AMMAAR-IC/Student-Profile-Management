import prisma from '../config/database';
import { createAppError } from '../middleware/error-handler.middleware';
import { Prisma } from '@prisma/client';

interface StudentFilters {
    page: number;
    limit: number;
    search?: string;
    major?: string;
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    minGpa?: number;
    maxGpa?: number;
}

// Helper: serialize JSON fields for SQLite
function serializeJson(value: any): string | undefined {
    if (value === undefined) return undefined;
    if (value === null) return undefined;
    return typeof value === 'string' ? value : JSON.stringify(value);
}

// Helper: parse JSON string from SQLite
function parseJson(value: string | null): any {
    if (!value) return null;
    try { return JSON.parse(value); } catch { return value; }
}

export class StudentService {
    async findMany(filters: StudentFilters) {
        const { page, limit, search, major, status, sortBy, sortOrder, minGpa, maxGpa } = filters;
        const skip = (page - 1) * limit;

        const where: Prisma.StudentWhereInput = {
            isDeleted: false,
        };

        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { studentId: { contains: search } },
            ];
        }

        if (major) where.major = { contains: major };
        if (status) where.status = status;
        if (minGpa !== undefined || maxGpa !== undefined) {
            where.currentGpa = {};
            if (minGpa !== undefined) where.currentGpa.gte = minGpa;
            if (maxGpa !== undefined) where.currentGpa.lte = maxGpa;
        }

        const orderBy: Prisma.StudentOrderByWithRelationInput = {};
        orderBy[sortBy as keyof Prisma.StudentOrderByWithRelationInput] = sortOrder;

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    _count: {
                        select: { academicRecords: true, documents: true },
                    },
                },
            }),
            prisma.student.count({ where }),
        ]);

        // Parse JSON fields
        const parsed = students.map(s => ({
            ...s,
            emergencyContact: parseJson(s.emergencyContact),
        }));

        return { students: parsed, total, page, limit };
    }

    async findById(id: string) {
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                academicRecords: { orderBy: { year: 'desc' } },
                documents: { orderBy: { uploadedAt: 'desc' } },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
        });

        if (!student || student.isDeleted) {
            throw createAppError('Student not found', 404);
        }

        return {
            ...student,
            emergencyContact: parseJson(student.emergencyContact),
        };
    }

    async create(data: any, userId: string) {
        // Check for duplicate studentId or email
        const existing = await prisma.student.findFirst({
            where: {
                OR: [{ studentId: data.studentId }, { email: data.email }],
            },
        });

        if (existing) {
            throw createAppError('Student with this ID or email already exists', 409);
        }

        const student = await prisma.student.create({
            data: {
                ...data,
                emergencyContact: serializeJson(data.emergencyContact),
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : null,
                createdById: userId,
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'CREATE',
                entityType: 'student',
                entityId: student.id,
                changes: serializeJson(data),
            },
        });

        return { ...student, emergencyContact: parseJson(student.emergencyContact) };
    }

    async update(id: string, data: any, userId: string) {
        const existing = await prisma.student.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) {
            throw createAppError('Student not found', 404);
        }

        // Check uniqueness constraints for email/studentId if they are being changed
        if (data.email && data.email !== existing.email) {
            const emailExists = await prisma.student.findFirst({ where: { email: data.email, id: { not: id } } });
            if (emailExists) throw createAppError('Email already in use', 409);
        }

        if (data.studentId && data.studentId !== existing.studentId) {
            const idExists = await prisma.student.findFirst({ where: { studentId: data.studentId, id: { not: id } } });
            if (idExists) throw createAppError('Student ID already in use', 409);
        }

        const student = await prisma.student.update({
            where: { id },
            data: {
                ...data,
                emergencyContact: data.emergencyContact !== undefined ? serializeJson(data.emergencyContact) : undefined,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : undefined,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: 'UPDATE',
                entityType: 'student',
                entityId: id,
                changes: serializeJson({ before: existing, after: data }),
            },
        });

        return { ...student, emergencyContact: parseJson(student.emergencyContact) };
    }

    async softDelete(id: string, userId: string) {
        const existing = await prisma.student.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) {
            throw createAppError('Student not found', 404);
        }

        await prisma.student.update({
            where: { id },
            data: { isDeleted: true },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: 'DELETE',
                entityType: 'student',
                entityId: id,
            },
        });

        return { message: 'Student deleted successfully' };
    }

    async getAcademicRecords(studentId: string) {
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student || student.isDeleted) throw createAppError('Student not found', 404);

        return prisma.academicRecord.findMany({
            where: { studentId },
            orderBy: [{ year: 'desc' }, { semester: 'desc' }],
        });
    }

    async addAcademicRecord(studentId: string, data: any, userId: string) {
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student || student.isDeleted) throw createAppError('Student not found', 404);

        const record = await prisma.academicRecord.create({
            data: { ...data, studentId },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: 'CREATE',
                entityType: 'academic_record',
                entityId: record.id,
                changes: serializeJson(data),
            },
        });

        return record;
    }

    async addDocument(studentId: string, fileData: any, userId: string) {
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student || student.isDeleted) throw createAppError('Student not found', 404);

        const document = await prisma.document.create({
            data: {
                studentId,
                documentType: fileData.documentType || 'general',
                fileName: fileData.originalname,
                filePath: fileData.path,
                fileSize: fileData.size,
                mimeType: fileData.mimetype,
                uploadedById: userId,
            },
        });

        return document;
    }

    async search(query: string) {
        return prisma.student.findMany({
            where: {
                isDeleted: false,
                OR: [
                    { firstName: { contains: query } },
                    { lastName: { contains: query } },
                    { email: { contains: query } },
                    { studentId: { contains: query } },
                    { major: { contains: query } },
                ],
            },
            take: 20,
            orderBy: { updatedAt: 'desc' },
        });
    }
}

export const studentService = new StudentService();
