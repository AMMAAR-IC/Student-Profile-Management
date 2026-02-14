import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createStudentSchema, updateStudentSchema, studentQuerySchema } from '../utils/validators';
import { upload } from '../utils/file-upload';

const router = Router();

// All student routes require authentication
router.use(authenticate);

router.get('/search', (req, res, next) => studentController.searchStudents(req, res, next));
router.get('/', validate(studentQuerySchema, 'query'), (req, res, next) => studentController.getStudents(req, res, next));
router.get('/:id', (req, res, next) => studentController.getStudent(req, res, next));
router.post('/', authorize('admin', 'faculty', 'staff'), validate(createStudentSchema), (req, res, next) => studentController.createStudent(req, res, next));
router.put('/:id', authorize('admin', 'faculty', 'staff'), validate(updateStudentSchema), (req, res, next) => studentController.updateStudent(req, res, next));
router.delete('/:id', authorize('admin'), (req, res, next) => studentController.deleteStudent(req, res, next));

// Academic records
router.get('/:id/academic', (req, res, next) => studentController.getAcademicRecords(req, res, next));
router.post('/:id/academic', authorize('admin', 'faculty'), (req, res, next) => studentController.addAcademicRecord(req, res, next));

// Documents
router.post('/:id/documents', authorize('admin', 'faculty', 'staff'), upload.single('file'), (req, res, next) => studentController.uploadDocument(req, res, next));

// Bulk import
router.post('/bulk-import', authorize('admin'), upload.single('file'), (req, res, next) => studentController.bulkImport(req, res, next));

export default router;
