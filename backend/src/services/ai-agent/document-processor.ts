import { ollamaClient } from '../../config/ollama';
import { logger } from '../../utils/logger';
import fs from 'fs';

const SYSTEM_PROMPT = `You are an AI assistant specialized in extracting structured information from academic documents.

Your tasks:
- Extract student information from transcripts, certificates, and ID documents
- Identify key fields: name, student ID, courses, grades, dates, institution
- Handle various document formats and layouts
- Validate extracted data for completeness and accuracy

Output format: Valid JSON with these fields:
- extracted_fields: object { student_name?, student_id?, institution?, courses?: [{code, name, grade, credits}], dates?: {start?, end?}, gpa? }
- confidence: number (0-1, overall confidence in extraction)
- warnings: string[] (any uncertain or missing information)
- document_type: string (transcript/certificate/id_card/other)`;

export class DocumentProcessor {
    async processDocument(filePath: string, studentId: string) {
        try {
            // Read file content (text-based files)
            let content = '';
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch {
                content = `[Binary file at ${filePath} - text extraction not available without OCR]`;
            }

            const prompt = `Extract structured information from this document content:

---
${content.substring(0, 4000)}
---

Student ID in our system: ${studentId}

Extract all relevant academic information and respond with valid JSON.`;

            const response = await ollamaClient.generate(prompt, { system: SYSTEM_PROMPT });

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                extracted_fields: {},
                confidence: 0,
                warnings: ['Could not parse structured data from response'],
                document_type: 'unknown',
                raw_response: response,
            };
        } catch (error: any) {
            logger.error('Document processing failed:', error.message);
            return {
                extracted_fields: {},
                confidence: 0,
                warnings: ['Document processing failed - Ollama service may be unavailable'],
                document_type: 'unknown',
                note: 'AI document processing unavailable. Start Ollama for this feature.',
            };
        }
    }
}

export const documentProcessor = new DocumentProcessor();
