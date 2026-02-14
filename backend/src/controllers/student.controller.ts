import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/student.service';
import { sendSuccess, sendPaginated, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class StudentController {
    async getStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await studentService.findMany(req.query as any);
            sendPaginated(res, result.students, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async getStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const student = await studentService.findById(req.params.id);
            sendSuccess(res, student);
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async createStudent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const student = await studentService.create(req.body, req.user!.id);
            sendSuccess(res, student, 'Student created successfully', 201);
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async updateStudent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const student = await studentService.update(req.params.id, req.body, req.user!.id);
            sendSuccess(res, student, 'Student updated successfully');
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async deleteStudent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await studentService.softDelete(req.params.id, req.user!.id);
            sendSuccess(res, result, 'Student deleted successfully');
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async searchStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') return sendError(res, 'Search query is required', 400);
            const results = await studentService.search(q);
            sendSuccess(res, results);
        } catch (error) {
            next(error);
        }
    }

    async getAcademicRecords(req: Request, res: Response, next: NextFunction) {
        try {
            const records = await studentService.getAcademicRecords(req.params.id);
            sendSuccess(res, records);
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async addAcademicRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const record = await studentService.addAcademicRecord(req.params.id, req.body, req.user!.id);
            sendSuccess(res, record, 'Academic record added', 201);
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async uploadDocument(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.file) return sendError(res, 'No file uploaded', 400);
            const doc = await studentService.addDocument(
                req.params.id,
                { ...req.file, documentType: req.body.documentType },
                req.user!.id
            );
            sendSuccess(res, doc, 'Document uploaded successfully', 201);
        } catch (error: any) {
            if (error.statusCode) return sendError(res, error.message, error.statusCode);
            next(error);
        }
    }

    async bulkImport(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.file) return sendError(res, 'No CSV file uploaded', 400);

            const csv = require('csv-parser');
            const fs = require('fs');
            const results: any[] = [];
            const errors: any[] = [];

            const stream = fs.createReadStream(req.file.path).pipe(csv());

            await new Promise<void>((resolve, reject) => {
                stream.on('data', (row: any) => results.push(row));
                stream.on('end', resolve);
                stream.on('error', reject);
            });

            let imported = 0;
            for (const row of results) {
                try {
                    await studentService.create({
                        studentId: row.student_id || row.studentId,
                        firstName: row.first_name || row.firstName,
                        lastName: row.last_name || row.lastName,
                        email: row.email,
                        phone: row.phone,
                        major: row.major,
                        currentGpa: row.gpa ? parseFloat(row.gpa) : undefined,
                        status: row.status || 'active',
                    }, req.user!.id);
                    imported++;
                } catch (err: any) {
                    errors.push({ row, error: err.message });
                }
            }

            // Clean up the uploaded CSV
            fs.unlinkSync(req.file.path);

            sendSuccess(res, { imported, total: results.length, errors }, `Imported ${imported}/${results.length} students`);
        } catch (error) {
            next(error);
        }
    }
}

export const studentController = new StudentController();
