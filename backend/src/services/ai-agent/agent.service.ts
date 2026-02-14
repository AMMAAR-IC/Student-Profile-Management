import { ollamaClient, OllamaChatMessage } from '../../config/ollama';
import prisma from '../../config/database';
import { profileAnalyzer } from './profile-analyzer';
import { queryAssistant } from './query-assistant';
import { documentProcessor } from './document-processor';
import { recommendationEngine } from './recommendation-engine';
import { logger } from '../../utils/logger';

const CHAT_SYSTEM_PROMPT = `You are an AI assistant for a Student Profile Management System. You help administrators, faculty, and staff with:

1. Student profile inquiries and analysis
2. Academic performance insights  
3. Data queries and report generation
4. Course and career recommendations
5. General questions about student management

Be helpful, professional, and concise. When referring to student data, remind users about privacy considerations.
If you don't have enough information to answer, ask clarifying questions.`;

export class AgentService {
    async analyze(studentId: string, userId: string) {
        const result = await profileAnalyzer.analyze(studentId);

        await prisma.aIInteraction.create({
            data: {
                userId,
                query: `Analyze student: ${studentId}`,
                response: JSON.stringify(result),
                agentType: 'profile_analyzer',
            },
        });

        return result;
    }

    async query(queryText: string, userId: string) {
        return queryAssistant.processQuery(queryText, userId);
    }

    async recommend(studentId: string, type: string, userId: string) {
        const result = await recommendationEngine.generateRecommendations(studentId, type);

        await prisma.aIInteraction.create({
            data: {
                userId,
                query: `Recommendations for student: ${studentId} (type: ${type})`,
                response: JSON.stringify(result),
                agentType: 'recommendation_engine',
            },
        });

        return result;
    }

    async processDocument(filePath: string, studentId: string, userId: string) {
        const result = await documentProcessor.processDocument(filePath, studentId);

        await prisma.aIInteraction.create({
            data: {
                userId,
                query: `Process document for student: ${studentId}`,
                response: JSON.stringify(result),
                agentType: 'document_processor',
            },
        });

        return result;
    }

    async chat(message: string, conversationHistory: { role: string; content: string }[] = [], userId: string) {
        try {
            const messages: OllamaChatMessage[] = [
                { role: 'system', content: CHAT_SYSTEM_PROMPT },
                ...conversationHistory.map((m) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
                { role: 'user', content: message },
            ];

            const response = await ollamaClient.chat(messages);

            await prisma.aIInteraction.create({
                data: {
                    userId,
                    query: message,
                    response,
                    agentType: 'chat',
                    context: JSON.stringify({ conversationLength: conversationHistory.length }),
                },
            });

            return { message: response, role: 'assistant' };
        } catch (error: any) {
            logger.error('Chat failed:', error.message);
            return {
                message: 'I apologize, but I\'m currently unable to process your request. The AI service may be unavailable. Please try again later or contact support.',
                role: 'assistant',
                error: true,
            };
        }
    }

    async getInsights(userId: string) {
        try {
            const [totalStudents, avgGpa, atRiskCount, recentInteractions] = await Promise.all([
                prisma.student.count({ where: { isDeleted: false } }),
                prisma.student.aggregate({ where: { isDeleted: false, currentGpa: { not: null } }, _avg: { currentGpa: true } }),
                prisma.student.count({ where: { isDeleted: false, status: 'active', currentGpa: { lt: 2.0 } } }),
                prisma.aIInteraction.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
            ]);

            // Try to generate AI-powered insights
            try {
                const prompt = `Given these system statistics:
- Total students: ${totalStudents}
- Average GPA: ${avgGpa._avg.currentGpa?.toFixed(2) || 'N/A'}
- At-risk students (GPA < 2.0): ${atRiskCount}
- AI interactions this week: ${recentInteractions}

Provide 3-5 key insights about the student body and actionable recommendations for administrators. Respond as valid JSON: { insights: string[], recommendations: string[] }`;

                const response = await ollamaClient.generate(prompt, {
                    system: 'You are an educational analytics expert. Provide data-driven insights.',
                });

                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const aiInsights = JSON.parse(jsonMatch[0]);
                    return { statistics: { totalStudents, averageGpa: avgGpa._avg.currentGpa, atRiskCount, recentInteractions }, ...aiInsights };
                }
            } catch { /* fallback below */ }

            return {
                statistics: { totalStudents, averageGpa: avgGpa._avg.currentGpa, atRiskCount, recentInteractions },
                insights: [
                    `System currently manages ${totalStudents} student profiles`,
                    `${atRiskCount} students are flagged as at-risk (GPA below 2.0)`,
                    `Average GPA across all students: ${avgGpa._avg.currentGpa?.toFixed(2) || 'N/A'}`,
                ],
                recommendations: [
                    'Review at-risk students for early intervention',
                    'Schedule academic counseling for students below 2.0 GPA',
                ],
            };
        } catch (error: any) {
            logger.error('Get insights failed:', error.message);
            throw error;
        }
    }
}

export const agentService = new AgentService();
