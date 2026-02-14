import { ollamaClient } from '../../config/ollama';
import prisma from '../../config/database';
import { logger } from '../../utils/logger';

const SYSTEM_PROMPT = `You are an AI career and academic advisor providing personalized recommendations to students.

Your recommendations cover:
- Course selections based on academic history and career goals
- Career paths aligned with performance and interests
- Scholarship opportunities matching student profile
- Mentorship connections and extracurricular activities

For each recommendation provide:
- type: "course" | "career" | "scholarship" | "activity"
- title: string
- description: string
- rationale: string (why this is recommended)
- priority: "high" | "medium" | "low"
- prerequisites: string[] (what's needed first)
- expected_outcome: string

Respond with valid JSON: { recommendations: [array of recommendation objects] }`;

export class RecommendationEngine {
    async generateRecommendations(studentId: string, type: string = 'all') {
        try {
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    academicRecords: { orderBy: [{ year: 'desc' }], take: 20 },
                },
            });

            if (!student) throw new Error('Student not found');

            const academicSummary = student.academicRecords.length > 0
                ? student.academicRecords.map(r => `${r.courseName} (${r.courseCode}): ${r.grade}`).join('\n  ')
                : 'No academic records available';

            const prompt = `Generate ${type === 'all' ? 'comprehensive' : type} recommendations for this student:

Name: ${student.firstName} ${student.lastName}
Major: ${student.major || 'Undeclared'}
Current GPA: ${student.currentGpa ?? 'N/A'}
Status: ${student.status}
Enrollment: ${student.enrollmentDate?.toISOString().split('T')[0] || 'N/A'}

Course History:
  ${academicSummary}

${type !== 'all' ? `Focus specifically on ${type} recommendations.` : 'Provide a mix of course, career, scholarship, and activity recommendations.'}

Provide 3-5 prioritized recommendations as valid JSON.`;

            const response = await ollamaClient.generate(prompt, { system: SYSTEM_PROMPT });

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return { recommendations: [], raw_response: response };
        } catch (error: any) {
            logger.error('Recommendation generation failed:', error.message);
            return this.fallbackRecommendations(studentId);
        }
    }

    private async fallbackRecommendations(studentId: string) {
        const student = await prisma.student.findUnique({ where: { id: studentId } });

        const recommendations = [];

        if (student?.currentGpa && student.currentGpa < 2.5) {
            recommendations.push({
                type: 'activity',
                title: 'Academic Tutoring',
                description: 'Enroll in peer tutoring program to improve academic performance',
                rationale: 'Current GPA suggests additional academic support would be beneficial',
                priority: 'high',
                prerequisites: [],
                expected_outcome: 'Improved understanding and higher grades',
            });
        }

        if (student?.currentGpa && student.currentGpa >= 3.5) {
            recommendations.push({
                type: 'scholarship',
                title: 'Dean\'s List Scholarship',
                description: 'Apply for academic excellence scholarship',
                rationale: 'High GPA makes you eligible for merit-based scholarships',
                priority: 'high',
                prerequisites: ['Maintain current GPA'],
                expected_outcome: 'Financial support for continued education',
            });
        }

        recommendations.push({
            type: 'career',
            title: 'Career Counseling Session',
            description: 'Schedule a meeting with the career services office',
            rationale: 'Regular career guidance helps align academic choices with career goals',
            priority: 'medium',
            prerequisites: [],
            expected_outcome: 'Clearer career direction and networking opportunities',
        });

        return {
            recommendations,
            note: 'AI recommendations unavailable. Showing rule-based suggestions. Start Ollama for AI-powered recommendations.',
        };
    }
}

export const recommendationEngine = new RecommendationEngine();
