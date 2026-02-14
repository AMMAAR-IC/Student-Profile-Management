import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create users
    const adminHash = await bcrypt.hash('admin123', 10);
    const facultyHash = await bcrypt.hash('faculty123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@university.edu' },
        update: {},
        create: { email: 'admin@university.edu', passwordHash: adminHash, role: 'admin', firstName: 'System', lastName: 'Admin' },
    });

    await prisma.user.upsert({
        where: { email: 'faculty@university.edu' },
        update: {},
        create: { email: 'faculty@university.edu', passwordHash: facultyHash, role: 'faculty', firstName: 'Jane', lastName: 'Smith' },
    });

    await prisma.user.upsert({
        where: { email: 'staff@university.edu' },
        update: {},
        create: { email: 'staff@university.edu', passwordHash: staffHash, role: 'staff', firstName: 'Bob', lastName: 'Wilson' },
    });

    console.log('✅ Users created');

    // Create students
    const studentsData = [
        { studentId: 'STU-2024-001', firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@student.edu', phone: '555-0101', major: 'Computer Science', currentGpa: 3.85, status: 'active', dateOfBirth: new Date('2002-03-15'), enrollmentDate: new Date('2022-09-01'), address: '123 Oak Street, University City, CA 90001', emergencyContact: JSON.stringify({ name: 'Robert Johnson', phone: '555-0100', relationship: 'Father' }) },
        { studentId: 'STU-2024-002', firstName: 'Bob', lastName: 'Williams', email: 'bob.williams@student.edu', phone: '555-0102', major: 'Mathematics', currentGpa: 3.42, status: 'active', dateOfBirth: new Date('2001-07-22'), enrollmentDate: new Date('2021-09-01'), address: '456 Pine Ave, University City, CA 90002', emergencyContact: JSON.stringify({ name: 'Mary Williams', phone: '555-0200', relationship: 'Mother' }) },
        { studentId: 'STU-2024-003', firstName: 'Carol', lastName: 'Davis', email: 'carol.davis@student.edu', phone: '555-0103', major: 'Physics', currentGpa: 3.91, status: 'active', dateOfBirth: new Date('2003-01-10'), enrollmentDate: new Date('2023-01-15'), address: '789 Elm Blvd, University City, CA 90003', emergencyContact: JSON.stringify({ name: 'David Davis', phone: '555-0300', relationship: 'Father' }) },
        { studentId: 'STU-2024-004', firstName: 'Daniel', lastName: 'Brown', email: 'daniel.brown@student.edu', phone: '555-0104', major: 'Computer Science', currentGpa: 2.78, status: 'active', dateOfBirth: new Date('2002-11-05'), enrollmentDate: new Date('2022-09-01'), address: '321 Maple Dr, University City, CA 90004', emergencyContact: JSON.stringify({ name: 'Sarah Brown', phone: '555-0400', relationship: 'Mother' }) },
        { studentId: 'STU-2024-005', firstName: 'Eva', lastName: 'Martinez', email: 'eva.martinez@student.edu', phone: '555-0105', major: 'Biology', currentGpa: 3.65, status: 'active', dateOfBirth: new Date('2002-05-20'), enrollmentDate: new Date('2022-09-01'), address: '654 Cedar Ln, University City, CA 90005', emergencyContact: JSON.stringify({ name: 'Carlos Martinez', phone: '555-0500', relationship: 'Father' }) },
        { studentId: 'STU-2024-006', firstName: 'Frank', lastName: 'Garcia', email: 'frank.garcia@student.edu', phone: '555-0106', major: 'Engineering', currentGpa: 3.21, status: 'active', dateOfBirth: new Date('2001-09-18'), enrollmentDate: new Date('2021-09-01'), address: '987 Birch St, University City, CA 90006', emergencyContact: JSON.stringify({ name: 'Maria Garcia', phone: '555-0600', relationship: 'Mother' }) },
        { studentId: 'STU-2024-007', firstName: 'Grace', lastName: 'Lee', email: 'grace.lee@student.edu', phone: '555-0107', major: 'Computer Science', currentGpa: 3.95, status: 'active', dateOfBirth: new Date('2003-02-14'), enrollmentDate: new Date('2023-09-01'), address: '147 Walnut Ave, University City, CA 90007', emergencyContact: JSON.stringify({ name: 'James Lee', phone: '555-0700', relationship: 'Father' }) },
        { studentId: 'STU-2024-008', firstName: 'Henry', lastName: 'Wilson', email: 'henry.wilson@student.edu', phone: '555-0108', major: 'Mathematics', currentGpa: 1.85, status: 'active', dateOfBirth: new Date('2002-08-30'), enrollmentDate: new Date('2022-01-15'), address: '258 Spruce Rd, University City, CA 90008', emergencyContact: JSON.stringify({ name: 'Linda Wilson', phone: '555-0800', relationship: 'Mother' }) },
        { studentId: 'STU-2024-009', firstName: 'Isabel', lastName: 'Taylor', email: 'isabel.taylor@student.edu', phone: '555-0109', major: 'Biology', currentGpa: 3.50, status: 'active', dateOfBirth: new Date('2001-12-25'), enrollmentDate: new Date('2021-09-01'), address: '369 Ash Ct, University City, CA 90009', emergencyContact: JSON.stringify({ name: 'Thomas Taylor', phone: '555-0900', relationship: 'Father' }) },
        { studentId: 'STU-2024-010', firstName: 'Jack', lastName: 'Anderson', email: 'jack.anderson@student.edu', phone: '555-0110', major: 'Engineering', currentGpa: 2.95, status: 'active', dateOfBirth: new Date('2002-04-07'), enrollmentDate: new Date('2022-09-01'), address: '741 Poplar Way, University City, CA 90010', emergencyContact: JSON.stringify({ name: 'Nancy Anderson', phone: '555-1000', relationship: 'Mother' }) },
        { studentId: 'STU-2024-011', firstName: 'Karen', lastName: 'Thomas', email: 'karen.thomas@student.edu', phone: '555-0111', major: 'Chemistry', currentGpa: 3.72, status: 'active', dateOfBirth: new Date('2003-06-11'), enrollmentDate: new Date('2023-09-01'), address: '852 Willow St, University City, CA 90011', emergencyContact: JSON.stringify({ name: 'Richard Thomas', phone: '555-1100', relationship: 'Father' }) },
        { studentId: 'STU-2024-012', firstName: 'Leo', lastName: 'Jackson', email: 'leo.jackson@student.edu', phone: '555-0112', major: 'Computer Science', currentGpa: 3.15, status: 'active', dateOfBirth: new Date('2002-10-03'), enrollmentDate: new Date('2022-09-01'), address: '963 Cypress Blvd, University City, CA 90012', emergencyContact: JSON.stringify({ name: 'Patricia Jackson', phone: '555-1200', relationship: 'Mother' }) },
        { studentId: 'STU-2023-001', firstName: 'Maria', lastName: 'White', email: 'maria.white@student.edu', phone: '555-0113', major: 'Computer Science', currentGpa: 3.88, status: 'graduated', dateOfBirth: new Date('2000-01-20'), enrollmentDate: new Date('2020-09-01'), address: '111 Cherry Ln, University City, CA 90013', emergencyContact: JSON.stringify({ name: 'John White', phone: '555-1300', relationship: 'Father' }) },
        { studentId: 'STU-2023-002', firstName: 'Nathan', lastName: 'Harris', email: 'nathan.harris@student.edu', phone: '555-0114', major: 'Physics', currentGpa: 2.15, status: 'suspended', dateOfBirth: new Date('2001-03-08'), enrollmentDate: new Date('2021-01-15'), address: '222 Peach Dr, University City, CA 90014', emergencyContact: JSON.stringify({ name: 'Susan Harris', phone: '555-1400', relationship: 'Mother' }) },
        { studentId: 'STU-2023-003', firstName: 'Olivia', lastName: 'Clark', email: 'olivia.clark@student.edu', phone: '555-0115', major: 'Biology', currentGpa: 3.30, status: 'withdrawn', dateOfBirth: new Date('2002-09-14'), enrollmentDate: new Date('2022-09-01'), address: '333 Plum Ave, University City, CA 90015', emergencyContact: JSON.stringify({ name: 'Edward Clark', phone: '555-1500', relationship: 'Father' }) },
        { studentId: 'STU-2024-013', firstName: 'Peter', lastName: 'Lewis', email: 'peter.lewis@student.edu', phone: '555-0116', major: 'Engineering', currentGpa: 3.55, status: 'active', dateOfBirth: new Date('2003-07-28'), enrollmentDate: new Date('2023-09-01'), address: '444 Apple Rd, University City, CA 90016', emergencyContact: JSON.stringify({ name: 'Helen Lewis', phone: '555-1600', relationship: 'Mother' }) },
        { studentId: 'STU-2024-014', firstName: 'Quinn', lastName: 'Robinson', email: 'quinn.robinson@student.edu', phone: '555-0117', major: 'Mathematics', currentGpa: 3.78, status: 'active', dateOfBirth: new Date('2002-02-19'), enrollmentDate: new Date('2022-01-15'), address: '555 Grape St, University City, CA 90017', emergencyContact: JSON.stringify({ name: 'William Robinson', phone: '555-1700', relationship: 'Father' }) },
        { studentId: 'STU-2024-015', firstName: 'Rachel', lastName: 'Walker', email: 'rachel.walker@student.edu', phone: '555-0118', major: 'Chemistry', currentGpa: 1.45, status: 'active', dateOfBirth: new Date('2003-04-02'), enrollmentDate: new Date('2023-01-15'), address: '666 Mango Blvd, University City, CA 90018', emergencyContact: JSON.stringify({ name: 'Jennifer Walker', phone: '555-1800', relationship: 'Mother' }) },
        { studentId: 'STU-2024-016', firstName: 'Samuel', lastName: 'Young', email: 'samuel.young@student.edu', phone: '555-0119', major: 'Computer Science', currentGpa: 3.40, status: 'active', dateOfBirth: new Date('2002-06-16'), enrollmentDate: new Date('2022-09-01'), address: '777 Banana Ave, University City, CA 90019', emergencyContact: JSON.stringify({ name: 'Barbara Young', phone: '555-1900', relationship: 'Mother' }) },
        { studentId: 'STU-2024-017', firstName: 'Tina', lastName: 'King', email: 'tina.king@student.edu', phone: '555-0120', major: 'Biology', currentGpa: 3.60, status: 'active', dateOfBirth: new Date('2003-08-21'), enrollmentDate: new Date('2023-09-01'), address: '888 Pear Ct, University City, CA 90020', emergencyContact: JSON.stringify({ name: 'George King', phone: '555-2000', relationship: 'Father' }) },
    ];

    for (const data of studentsData) {
        await prisma.student.upsert({
            where: { studentId: data.studentId },
            update: {},
            create: { ...data, createdById: admin.id },
        });
    }
    console.log(`✅ ${studentsData.length} students created`);

    // Create academic records for a few students
    const alice = await prisma.student.findUnique({ where: { studentId: 'STU-2024-001' } });
    if (alice) {
        const records = [
            { studentId: alice.id, semester: 'Fall', year: 2022, courseCode: 'CS101', courseName: 'Introduction to Programming', grade: 'A', credits: 4, gpaContribution: 4.0 },
            { studentId: alice.id, semester: 'Fall', year: 2022, courseCode: 'MATH201', courseName: 'Calculus I', grade: 'A-', credits: 4, gpaContribution: 3.7 },
            { studentId: alice.id, semester: 'Spring', year: 2023, courseCode: 'CS201', courseName: 'Data Structures', grade: 'A', credits: 4, gpaContribution: 4.0 },
            { studentId: alice.id, semester: 'Spring', year: 2023, courseCode: 'MATH202', courseName: 'Calculus II', grade: 'B+', credits: 4, gpaContribution: 3.3 },
            { studentId: alice.id, semester: 'Fall', year: 2023, courseCode: 'CS301', courseName: 'Algorithms', grade: 'A', credits: 4, gpaContribution: 4.0 },
            { studentId: alice.id, semester: 'Fall', year: 2023, courseCode: 'CS310', courseName: 'Database Systems', grade: 'A-', credits: 3, gpaContribution: 3.7 },
            { studentId: alice.id, semester: 'Spring', year: 2024, courseCode: 'CS401', courseName: 'Machine Learning', grade: 'A', credits: 3, gpaContribution: 4.0 },
            { studentId: alice.id, semester: 'Spring', year: 2024, courseCode: 'CS410', courseName: 'Software Engineering', grade: 'A-', credits: 3, gpaContribution: 3.7 },
        ];

        for (const record of records) {
            await prisma.academicRecord.create({ data: record });
        }
        console.log('✅ Academic records created for Alice');
    }

    const henry = await prisma.student.findUnique({ where: { studentId: 'STU-2024-008' } });
    if (henry) {
        const records = [
            { studentId: henry.id, semester: 'Spring', year: 2022, courseCode: 'MATH101', courseName: 'Pre-Calculus', grade: 'C', credits: 4, gpaContribution: 2.0 },
            { studentId: henry.id, semester: 'Fall', year: 2022, courseCode: 'MATH201', courseName: 'Calculus I', grade: 'D', credits: 4, gpaContribution: 1.0 },
            { studentId: henry.id, semester: 'Spring', year: 2023, courseCode: 'MATH201R', courseName: 'Calculus I (Retake)', grade: 'C+', credits: 4, gpaContribution: 2.3 },
            { studentId: henry.id, semester: 'Fall', year: 2023, courseCode: 'MATH202', courseName: 'Calculus II', grade: 'C-', credits: 4, gpaContribution: 1.7 },
        ];

        for (const record of records) {
            await prisma.academicRecord.create({ data: record });
        }
        console.log('✅ Academic records created for Henry');
    }

    console.log('\n🎉 Seeding complete!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin:   admin@university.edu / admin123');
    console.log('  Faculty: faculty@university.edu / faculty123');
    console.log('  Staff:   staff@university.edu / staff123');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
