import prisma from '../config/database';

export class AnalyticsService {
    async getDashboard() {
        const [
            totalStudents,
            activeStudents,
            graduatedStudents,
            suspendedStudents,
            withdrawnStudents,
            avgGpa,
            majorDistribution,
            recentEnrollments,
        ] = await Promise.all([
            prisma.student.count({ where: { isDeleted: false } }),
            prisma.student.count({ where: { isDeleted: false, status: 'active' } }),
            prisma.student.count({ where: { isDeleted: false, status: 'graduated' } }),
            prisma.student.count({ where: { isDeleted: false, status: 'suspended' } }),
            prisma.student.count({ where: { isDeleted: false, status: 'withdrawn' } }),
            prisma.student.aggregate({ where: { isDeleted: false, currentGpa: { not: null } }, _avg: { currentGpa: true } }),
            prisma.student.groupBy({
                by: ['major'],
                where: { isDeleted: false, major: { not: null } },
                _count: true,
                orderBy: { _count: { major: 'desc' } },
                take: 10,
            }),
            prisma.student.count({
                where: {
                    isDeleted: false,
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);

        return {
            overview: {
                totalStudents,
                activeStudents,
                graduatedStudents,
                suspendedStudents,
                withdrawnStudents,
                averageGpa: avgGpa._avg.currentGpa ? Number(avgGpa._avg.currentGpa.toFixed(2)) : 0,
                recentEnrollments,
            },
            majorDistribution: majorDistribution.map((m) => ({
                major: m.major || 'Undeclared',
                count: m._count,
            })),
        };
    }

    async getTrends() {
        // Get GPA distribution
        const students = await prisma.student.findMany({
            where: { isDeleted: false, currentGpa: { not: null } },
            select: { currentGpa: true, major: true, status: true, enrollmentDate: true },
        });

        const gpaRanges = [
            { label: '0.0-1.0', min: 0, max: 1.0 },
            { label: '1.0-2.0', min: 1.0, max: 2.0 },
            { label: '2.0-2.5', min: 2.0, max: 2.5 },
            { label: '2.5-3.0', min: 2.5, max: 3.0 },
            { label: '3.0-3.5', min: 3.0, max: 3.5 },
            { label: '3.5-4.0', min: 3.5, max: 4.01 },
        ];

        const gpaDistribution = gpaRanges.map((range) => ({
            range: range.label,
            count: students.filter((s) => s.currentGpa! >= range.min && s.currentGpa! < range.max).length,
        }));

        // Performance by major
        const performanceByMajor = await prisma.student.groupBy({
            by: ['major'],
            where: { isDeleted: false, major: { not: null }, currentGpa: { not: null } },
            _avg: { currentGpa: true },
            _count: true,
        });

        return {
            gpaDistribution,
            performanceByMajor: performanceByMajor.map((p) => ({
                major: p.major || 'Undeclared',
                averageGpa: Number(p._avg.currentGpa?.toFixed(2)) || 0,
                studentCount: p._count,
            })),
        };
    }

    async getCohortAnalysis() {
        const students = await prisma.student.findMany({
            where: { isDeleted: false },
            select: {
                enrollmentDate: true,
                currentGpa: true,
                status: true,
                major: true,
            },
        });

        // Group by enrollment year
        const cohorts = new Map<number, typeof students>();
        students.forEach((s) => {
            const year = s.enrollmentDate ? s.enrollmentDate.getFullYear() : 0;
            if (!cohorts.has(year)) cohorts.set(year, []);
            cohorts.get(year)!.push(s);
        });

        return Array.from(cohorts.entries())
            .sort(([a], [b]) => b - a)
            .map(([year, members]) => {
                const gpas = members.filter((m) => m.currentGpa !== null).map((m) => m.currentGpa!);
                return {
                    year: year || 'Unknown',
                    totalStudents: members.length,
                    averageGpa: gpas.length ? Number((gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)) : null,
                    activeCount: members.filter((m) => m.status === 'active').length,
                    graduatedCount: members.filter((m) => m.status === 'graduated').length,
                };
            });
    }

    async getAtRiskStudents() {
        const atRisk = await prisma.student.findMany({
            where: {
                isDeleted: false,
                status: 'active',
                OR: [{ currentGpa: { lt: 2.0 } }, { currentGpa: null }],
            },
            select: {
                id: true,
                studentId: true,
                firstName: true,
                lastName: true,
                email: true,
                major: true,
                currentGpa: true,
                enrollmentDate: true,
            },
            orderBy: { currentGpa: 'asc' },
        });

        return atRisk.map((s) => ({
            ...s,
            riskLevel: !s.currentGpa ? 'unknown' : s.currentGpa < 1.0 ? 'critical' : s.currentGpa < 1.5 ? 'high' : 'medium',
        }));
    }
}

export const analyticsService = new AnalyticsService();
