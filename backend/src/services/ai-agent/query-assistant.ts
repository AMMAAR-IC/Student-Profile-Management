import { ollamaClient } from '../../config/ollama';
import prisma from '../../config/database';
import { logger } from '../../utils/logger';

const SYSTEM_PROMPT = `You are an AI assistant helping administrators and faculty query the student database using natural language.

Your capabilities:
- Understand natural language queries about students
- Translate queries into structured search criteria
- Provide summaries and aggregated insights
- Generate reports based on specified criteria

When processing a query, respond with valid JSON containing:
- interpretation: string (how you understood the query)
- search_criteria: object (filters to apply: { field, operator, value })
- summary: string (natural language summary of what was found)
- suggestions: string[] (follow-up queries the user might find useful)

Available student fields: firstName, lastName, email, studentId, major, currentGpa, status (active/graduated/suspended/withdrawn), enrollmentDate

Example query: "Find all CS students with GPA above 3.5"
Example response: { "interpretation": "Search for Computer Science students with high academic performance", "search_criteria": { "major": "Computer Science", "minGpa": 3.5 }, "summary": "Found X students matching criteria" }`;

export class QueryAssistant {
    async processQuery(query: string, userId: string) {
        try {
            // Get context data for the AI
            const totalStudents = await prisma.student.count({ where: { isDeleted: false } });
            const majors = await prisma.student.groupBy({
                by: ['major'],
                where: { isDeleted: false, major: { not: null } },
                _count: true,
            });

            const contextInfo = `Database context:
- Total students: ${totalStudents}
- Available majors: ${majors.map(m => m.major).join(', ')}
- Student statuses: active, graduated, suspended, withdrawn`;

            const prompt = `User query: "${query}"

${contextInfo}

Process this query and respond with valid JSON containing interpretation, search_criteria, summary, and suggestions.`;

            const response = await ollamaClient.generate(prompt, { system: SYSTEM_PROMPT });

            // Try to parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            let parsedResponse;

            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                parsedResponse = { interpretation: query, summary: response, search_criteria: {}, suggestions: [] };
            }

            // Execute the search based on AI-extracted criteria
            const results = await this.executeSearch(parsedResponse.search_criteria || {});
            parsedResponse.results = results;
            parsedResponse.resultCount = results.length;

            // Log the interaction
            await prisma.aIInteraction.create({
                data: {
                    userId,
                    query,
                    response: JSON.stringify(parsedResponse),
                    agentType: 'query_assistant',
                    context: JSON.stringify({ totalStudents }),
                },
            });

            return parsedResponse;
        } catch (error: any) {
            logger.error('Query assistant failed:', error.message);
            // Fallback: do a simple text search
            const results = await prisma.student.findMany({
                where: {
                    isDeleted: false,
                    OR: [
                        { firstName: { contains: query, mode: 'insensitive' } },
                        { lastName: { contains: query, mode: 'insensitive' } },
                        { major: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 20,
            });

            return {
                interpretation: `Text search for: "${query}"`,
                summary: `Found ${results.length} students matching "${query}"`,
                results,
                resultCount: results.length,
                note: 'AI query processing unavailable. Showing text search results.',
                suggestions: ['Try more specific queries when AI is available'],
            };
        }
    }

    private async executeSearch(criteria: any) {
        const where: any = { isDeleted: false };

        if (criteria.major) where.major = { contains: criteria.major, mode: 'insensitive' };
        if (criteria.status) where.status = criteria.status;
        if (criteria.minGpa) where.currentGpa = { ...where.currentGpa, gte: parseFloat(criteria.minGpa) };
        if (criteria.maxGpa) where.currentGpa = { ...where.currentGpa, lte: parseFloat(criteria.maxGpa) };
        if (criteria.firstName) where.firstName = { contains: criteria.firstName, mode: 'insensitive' };
        if (criteria.lastName) where.lastName = { contains: criteria.lastName, mode: 'insensitive' };

        return prisma.student.findMany({
            where,
            take: 50,
            select: {
                id: true, studentId: true, firstName: true, lastName: true,
                email: true, major: true, currentGpa: true, status: true,
            },
        });
    }
}

export const queryAssistant = new QueryAssistant();
