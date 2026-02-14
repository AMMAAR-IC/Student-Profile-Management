import { ollamaClient } from '../../config/ollama';
import prisma from '../../config/database';
import { logger } from '../../utils/logger';

const SYSTEM_PROMPT = `You are an AI assistant specialized in analyzing student academic profiles. Your role is to:

1. Analyze student performance data including GPA trends, course grades, and attendance
2. Identify patterns that indicate academic success or potential struggles
3. Provide actionable insights and recommendations
4. Maintain student privacy and handle data sensitively

When analyzing a student profile:
- Consider GPA trends over time
- Look at course difficulty and grade patterns
- Identify strengths and areas for improvement
- Suggest interventions for at-risk students
- Recommend courses aligned with performance

Always provide your response as valid JSON with these fields:
- overall_performance: string (summary sentence)
- strengths: string[] (list of strengths)
- areas_for_improvement: string[] (list of areas to improve)
- recommendations: string[] (actionable next steps)
- risk_level: "low" | "medium" | "high"
- gpa_trend: "improving" | "stable" | "declining"`;

export class ProfileAnalyzer {
    async analyze(studentId: string) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                academicRecords: { orderBy: [{ year: 'desc' }, { semester: 'desc' }] },
            },
        });

        if (!student) throw new Error('Student not found');

        const prompt = `Analyze this student profile:

Name: ${student.firstName} ${student.lastName}
Student ID: ${student.studentId}
Major: ${student.major || 'Undeclared'}
Current GPA: ${student.currentGpa ?? 'N/A'}
Status: ${student.status}
Enrollment Date: ${student.enrollmentDate?.toISOString().split('T')[0] || 'N/A'}

Academic Records:
${student.academicRecords.length > 0
                ? student.academicRecords.map(r =>
                    `  ${r.semester} ${r.year}: ${r.courseCode} - ${r.courseName} | Grade: ${r.grade} | Credits: ${r.credits}`
                ).join('\n')
                : '  No academic records available'
            }

Provide your analysis as valid JSON.`;

        try {
            const response = await ollamaClient.generate(prompt, { system: SYSTEM_PROMPT });
            // Try to parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { raw_analysis: response, overall_performance: 'Analysis completed', risk_level: 'unknown' };
        } catch (error: any) {
            logger.error('Profile analysis failed:', error.message);
            // Return fallback analysis based on available data
            return this.fallbackAnalysis(student);
        }
    }

    private fallbackAnalysis(student: any) {
        const gpa = student.currentGpa;
        let riskLevel = 'unknown';
        let performance = 'Unable to perform AI analysis';

        if (gpa !== null && gpa !== undefined) {
            if (gpa >= 3.5) { riskLevel = 'low'; performance = 'Excellent academic standing'; }
            else if (gpa >= 3.0) { riskLevel = 'low'; performance = 'Good academic standing'; }
            else if (gpa >= 2.5) { riskLevel = 'medium'; performance = 'Satisfactory, room for improvement'; }
            else if (gpa >= 2.0) { riskLevel = 'medium'; performance = 'Needs improvement'; }
            else { riskLevel = 'high'; performance = 'At risk - immediate attention needed'; }
        }

        return {
            overall_performance: performance,
            strengths: ['Data-driven analysis unavailable - Ollama service not reachable'],
            areas_for_improvement: ['Connect Ollama for detailed AI analysis'],
            recommendations: ['Ensure Ollama is running at the configured URL'],
            risk_level: riskLevel,
            gpa_trend: 'unknown',
            note: 'This is a fallback analysis. Start Ollama for AI-powered insights.',
        };
    }
}

export const profileAnalyzer = new ProfileAnalyzer();
